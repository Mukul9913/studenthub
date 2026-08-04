import mongoose, { Schema, type Document, type Model } from "mongoose";
import bcrypt from "bcrypt";

import type { UserRole, OwnerType } from "@studenthub/types";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  ownerType?: OwnerType | null;
  avatar?: string;
  passwordHash?: string;
  isVerified: boolean;
  isActive: boolean;
  emailOtpHash?: string;
  emailOtpExpiresAt?: Date;
  emailOtpResendAfter?: Date;
  emailOtpAttempts?: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      set: (v: string | null | undefined) => {
        if (!v) return v;
        return v.replace(/[\s\-()]/g, "");
      },
    },
    role: {
      type: String,
      enum: ["student", "professional", "owner", "admin"],
      default: "student",
      required: true,
    },
    ownerType: {
      type: String,
      enum: ["accommodation", "library", "mess", "service_provider"],
      required: false,
    },
    avatar: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    emailOtpHash: {
      type: String,
      select: false,
    },
    emailOtpExpiresAt: {
      type: Date,
      select: false,
    },
    emailOtpResendAfter: {
      type: Date,
      select: false,
    },
    emailOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (
        _doc,
        ret: Record<string, unknown> & {
          _id?: unknown;
          __v?: unknown;
          passwordHash?: unknown;
        },
      ) => {
        if (ret._id) {
          ret.id = ret._id.toString();
        }
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

userSchema.index({ role: 1 });

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("passwordHash")) {
    return next();
  }

  try {
    const saltRounds = 12;
    if (this.passwordHash) {
      this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    }
    next();
  } catch (error: unknown) {
    next(error as mongoose.CallbackError);
  }
});

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  if (!this.passwordHash) {
    return false;
  }
  return await bcrypt.compare(password, this.passwordHash);
};

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
