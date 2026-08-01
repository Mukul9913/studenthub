import { RefreshTokenModel, type IRefreshToken } from "../models/refresh-token.model.js";

export class RefreshTokenRepository {
  async create(data: Partial<IRefreshToken>): Promise<IRefreshToken> {
    const tokenRecord = new RefreshTokenModel(data);
    return await tokenRecord.save();
  }

  async findByToken(token: string): Promise<IRefreshToken | null> {
    return await RefreshTokenModel.findOne({ token }).exec();
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await RefreshTokenModel.updateMany(
      { userId, isRevoked: false },
      { $set: { isRevoked: true } },
    ).exec();
  }

  async revokeToken(token: string): Promise<void> {
    await RefreshTokenModel.updateOne({ token }, { $set: { isRevoked: true } }).exec();
  }

  async markUsed(token: string, replacedByToken: string): Promise<void> {
    await RefreshTokenModel.updateOne(
      { token },
      { $set: { isUsed: true, replacedByToken } },
    ).exec();
  }
}
