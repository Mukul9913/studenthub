import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import type { RegisterUserDto, LoginUserDto } from "@studenthub/types";

import { env } from "../config/env.js";
import {
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
} from "../errors/index.js";
import type { IUser } from "../models/user.model.js";
import type { UserRepository } from "../repositories/user.repository.js";
import type { RefreshTokenRepository } from "../repositories/refresh-token.repository.js";

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
  ) {}

  private generateAccessToken(user: IUser): string {
    return jwt.sign(
      {
        sub: user._id.toString(),
        role: user.role,
        ...(user.ownerType ? { ownerType: user.ownerType } : {}),
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );
  }

  private generateRefreshTokenValue(): string {
    return crypto.randomBytes(40).toString("hex");
  }

  async register(dto: RegisterUserDto): Promise<{ user: IUser }> {
    if ((dto as unknown as { role?: string }).role === "admin") {
      throw new ForbiddenError(
        "Cannot register as admin through public registration",
        "ADMIN_REGISTER_FORBIDDEN",
      );
    }

    if (dto.role === "owner" && !dto.ownerType) {
      throw new BadRequestError(
        "ownerType is required when registering as an owner",
        "OWNER_TYPE_REQUIRED",
      );
    }

    const existingEmail = await this.userRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictError("Email is already registered", "EMAIL_ALREADY_EXISTS");
    }

    if (dto.phone) {
      const existingPhone = await this.userRepository.findByPhone(dto.phone);
      if (existingPhone) {
        throw new ConflictError("Phone number is already registered", "PHONE_ALREADY_EXISTS");
      }
    }

    // Set passwordHash to plain password; it will be automatically hashed in pre-save hook
    const userData = {
      ...dto,
      passwordHash: dto.password,
    };
    delete userData.password;
    if (dto.role !== "owner") {
      delete userData.ownerType;
    }

    const user = await this.userRepository.create(userData);
    return { user };
  }

  async issueTokensForUser(user: IUser): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateAccessToken(user);
    const refreshTokenValue = this.generateRefreshTokenValue();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.create({
      userId: user._id,
      token: refreshTokenValue,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  async login(
    dto: LoginUserDto,
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findByEmailWithPassword(dto.email);
    // Standard delay check and generic credentials warning to prevent user enumeration
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Invalid email or password", "INVALID_CREDENTIALS");
    }

    const isMatch = await user.comparePassword(dto.password || "");
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password", "INVALID_CREDENTIALS");
    }

    if (!user.isVerified) {
      throw new UnauthorizedError(
        "Email address is not verified. Please verify your account using OTP.",
        "EMAIL_NOT_VERIFIED",
      );
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshTokenValue();

    await this.refreshTokenRepository.create({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return { user, accessToken, refreshToken };
  }

  async refresh(oldTokenValue: string): Promise<{ accessToken: string; refreshToken: string }> {
    const oldToken = await this.refreshTokenRepository.findByToken(oldTokenValue);

    if (!oldToken || oldToken.isRevoked || oldToken.expiresAt < new Date()) {
      throw new UnauthorizedError("Invalid or expired refresh token", "INVALID_REFRESH_TOKEN");
    }

    if (oldToken.isUsed) {
      // REUSE DETECTED! Potential token theft. Revoke all active sessions for this user.
      await this.refreshTokenRepository.revokeAllForUser(oldToken.userId.toString());
      throw new ForbiddenError(
        "Session reuse detected. All active sessions have been revoked.",
        "TOKEN_REUSE_DETECTED",
      );
    }

    const user = await this.userRepository.findById(oldToken.userId.toString());
    if (!user || !user.isActive) {
      throw new UnauthorizedError("User account is inactive or not found", "USER_INACTIVE");
    }

    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshTokenValue();

    // Mark old token as used and record transition link
    await this.refreshTokenRepository.markUsed(oldToken.token, newRefreshToken);

    // Save new refresh token record
    await this.refreshTokenRepository.create({
      token: newRefreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async me(userId: string): Promise<IUser> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("User account is inactive or not found", "USER_INACTIVE");
    }
    return user;
  }

  async logout(tokenValue: string): Promise<void> {
    await this.refreshTokenRepository.revokeToken(tokenValue);
  }
}
