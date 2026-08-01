import type { Request, Response } from "express";

import type { RegisterUserDto, LoginUserDto, User, AuthResponse } from "@studenthub/types";

import { env } from "../config/env.js";
import type { IUser } from "../models/user.model.js";
import type { AuthService } from "../services/auth.service.js";
import { UnauthorizedError } from "../errors/index.js";

export class AuthController {
  constructor(private authService: AuthService) {}

  private mapUserToDto(user: IUser): User {
    return user.toJSON() as unknown as User;
  }

  private setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      path: `${env.API_PREFIX}/auth`,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private getCookieValue(req: Request, name: string): string | undefined {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return undefined;
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    for (const cookie of cookies) {
      const [k, v] = cookie.split("=");
      if (k === name) return v;
    }
    return undefined;
  }

  register = async (
    req: Request<unknown, unknown, RegisterUserDto>,
    res: Response,
  ): Promise<void> => {
    const { user, accessToken, refreshToken } = await this.authService.register(req.body);

    this.setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      data: {
        user: this.mapUserToDto(user),
        accessToken,
      } satisfies AuthResponse,
    });
  };

  login = async (req: Request<unknown, unknown, LoginUserDto>, res: Response): Promise<void> => {
    const { user, accessToken, refreshToken } = await this.authService.login(req.body);

    this.setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      data: {
        user: this.mapUserToDto(user),
        accessToken,
      } satisfies AuthResponse,
    });
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const oldToken = this.getCookieValue(req, "refreshToken");
    if (!oldToken) {
      throw new UnauthorizedError("Refresh token is missing", "MISSING_REFRESH_TOKEN");
    }

    const { accessToken, refreshToken } = await this.authService.refresh(oldToken);

    this.setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      data: {
        accessToken,
      },
    });
  };

  me = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication token is required", "AUTH_TOKEN_REQUIRED");
    }
    const user = await this.authService.me(req.user.id);
    res.status(200).json({
      success: true,
      data: this.mapUserToDto(user),
    });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const oldToken = this.getCookieValue(req, "refreshToken");
    if (oldToken) {
      try {
        await this.authService.logout(oldToken);
      } catch {
        // Suppress errors during logout to guarantee clean cookie removals
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      path: `${env.API_PREFIX}/auth`,
    });

    res.status(200).json({
      success: true,
    });
  };
}
