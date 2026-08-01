import type { CreateUserDto, UpdateUserDto } from "@studenthub/types";

import { ConflictError, NotFoundError } from "../errors/index.js";
import type { IUser } from "../models/user.model.js";
import type { UserRepository } from "../repositories/user.repository.js";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(dto: CreateUserDto): Promise<IUser> {
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

    return await this.userRepository.create(dto);
  }

  async getUserById(id: string): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user || !user.isActive) {
      throw new NotFoundError("User not found", "USER_NOT_FOUND");
    }
    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<IUser> {
    const user = await this.getUserById(id);

    if (dto.phone && dto.phone !== user.phone) {
      const existingPhone = await this.userRepository.findByPhone(dto.phone);
      if (existingPhone) {
        throw new ConflictError("Phone number is already registered", "PHONE_ALREADY_EXISTS");
      }
    }

    const updated = await this.userRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundError("User not found", "USER_NOT_FOUND");
    }
    return updated;
  }
}
