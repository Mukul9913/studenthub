import multer from "multer";
import { BadRequestError } from "../errors/index.js";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        "Invalid file type. Only JPEG, PNG and WebP images are allowed.",
        "INVALID_FILE_TYPE",
      ),
    );
  }
};

export const uploadAccommodationImages = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit per image
    files: 10, // Max 10 images
  },
  fileFilter,
}).array("images", 10);
