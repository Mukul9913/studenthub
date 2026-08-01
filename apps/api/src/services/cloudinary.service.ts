import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

// Configure Cloudinary if environment variables exist
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface UploadResult {
  url: string;
  publicId: string;
}

export class CloudinaryService {
  private isConfigured(): boolean {
    return Boolean(
      env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
    );
  }

  async uploadImage(
    fileBuffer: Buffer,
    folder = "studenthub/accommodations",
  ): Promise<UploadResult> {
    if (!this.isConfigured()) {
      // Fallback for local development if Cloudinary credentials are not set
      const mockId = `local_dev_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      return {
        url: `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80`,
        publicId: mockId,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Failed to upload image to Cloudinary"));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );
      uploadStream.end(fileBuffer);
    });
  }

  async deleteImage(publicId: string): Promise<boolean> {
    if (!this.isConfigured() || publicId.startsWith("local_dev_")) {
      return true;
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === "ok";
    } catch {
      return false;
    }
  }
}
