import mongoose, { Schema, type Document } from "mongoose";

export interface IStudentPreference extends Document {
  userId: mongoose.Types.ObjectId;
  college?: string;
  course?: string;
  year?: number;
  budgetMin?: number;
  budgetMax?: number;
  preferredAreas: string[];
  preferredFacilities: string[];
  favoriteCategories: string[];
  accommodationPreference?: string;
  libraryType?: string;
  genderPreference?: "MALE" | "FEMALE" | "ANY";
  studyHoursPerDay?: number;
  transportationMode?: string;
  lifestylePreferences: string[];
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const studentPreferenceSchema = new Schema<IStudentPreference>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    college: { type: String, trim: true, maxlength: 200 },
    course: { type: String, trim: true, maxlength: 200 },
    year: { type: Number, min: 1, max: 7 },
    budgetMin: { type: Number, min: 0 },
    budgetMax: { type: Number, min: 0 },
    preferredAreas: [{ type: String, trim: true }],
    preferredFacilities: [{ type: String, trim: true }],
    favoriteCategories: [{ type: String, trim: true }],
    accommodationPreference: { type: String, trim: true },
    libraryType: { type: String, trim: true },
    genderPreference: { type: String, enum: ["MALE", "FEMALE", "ANY"] },
    studyHoursPerDay: { type: Number, min: 0, max: 24 },
    transportationMode: { type: String, trim: true },
    lifestylePreferences: [{ type: String, trim: true }],
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (
        _doc,
        ret: Record<string, unknown> & {
          _id?: unknown;
          __v?: unknown;
        },
      ) => {
        if (ret._id) ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const StudentPreferenceModel = mongoose.model<IStudentPreference>(
  "StudentPreference",
  studentPreferenceSchema,
);
