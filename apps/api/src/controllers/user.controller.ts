import type { Request, Response } from "express";

import type { CreateUserDto, UpdateUserDto, User } from "@studenthub/types";

import type { IUser } from "../models/user.model.js";
import type { UserService } from "../services/user.service.js";

export class UserController {
  constructor(private userService: UserService) {}

  private mapUserToDto(user: IUser): User {
    return user.toJSON() as unknown as User;
  }

  createUser = async (
    req: Request<unknown, unknown, CreateUserDto>,
    res: Response,
  ): Promise<void> => {
    const user = await this.userService.createUser(req.body);
    res.status(201).json({
      success: true,
      data: this.mapUserToDto(user),
    });
  };

  getUser = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const user = await this.userService.getUserById(req.params.id);
    res.status(200).json({
      success: true,
      data: this.mapUserToDto(user),
    });
  };

  updateUser = async (
    req: Request<{ id: string }, unknown, UpdateUserDto>,
    res: Response,
  ): Promise<void> => {
    const user = await this.userService.updateUser(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: this.mapUserToDto(user),
    });
  };
}
