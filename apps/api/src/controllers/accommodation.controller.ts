import type { Request, Response } from "express";
import type { AccommodationService } from "../services/accommodation.service.js";
import { CloudinaryService } from "../services/cloudinary.service.js";
import { UnauthorizedError, BadRequestError } from "../errors/index.js";

export class AccommodationController {
  private cloudinaryService = new CloudinaryService();

  constructor(private accommodationService: AccommodationService) {}

  uploadImages = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError(
        "Authentication is required to perform this action",
        "AUTH_REQUIRED",
      );
    }

    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      throw new BadRequestError("No image files provided", "NO_FILES_PROVIDED");
    }

    const uploadPromises = files.map((file) => this.cloudinaryService.uploadImage(file.buffer));
    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      data: {
        images: results.map((r) => r.url),
        metadata: results,
      },
    });
  };

  getMyListings = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError(
        "Authentication is required to perform this action",
        "AUTH_REQUIRED",
      );
    }

    const result = await this.accommodationService.getMyListings(req.user.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError(
        "Authentication is required to perform this action",
        "AUTH_REQUIRED",
      );
    }

    const { property, rooms } = await this.accommodationService.createAccommodation(
      req.user,
      req.body,
    );

    res.status(201).json({
      success: true,
      data: {
        property,
        rooms,
      },
    });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError(
        "Authentication is required to perform this action",
        "AUTH_REQUIRED",
      );
    }

    const property = await this.accommodationService.updateAccommodation(
      (req.params.id as string) || "",
      req.user,
      req.body,
    );

    res.status(200).json({
      success: true,
      data: property,
    });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError(
        "Authentication is required to perform this action",
        "AUTH_REQUIRED",
      );
    }

    await this.accommodationService.deleteAccommodation((req.params.id as string) || "", req.user);

    res.status(200).json({
      success: true,
      message: "Accommodation listing deleted successfully",
    });
  };

  submitForReview = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError(
        "Authentication is required to perform this action",
        "AUTH_REQUIRED",
      );
    }

    const property = await this.accommodationService.submitForReview(
      (req.params.id as string) || "",
      req.user,
    );

    res.status(200).json({
      success: true,
      data: property,
    });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const { property, rooms } = await this.accommodationService.getAccommodation(
      (req.params.id as string) || "",
    );

    res.status(200).json({
      success: true,
      data: {
        property,
        rooms,
      },
    });
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const {
      area,
      propertyType,
      genderPreference,
      minRent,
      maxRent,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query;

    const result = await this.accommodationService.listAccommodations({
      area: area ? String(area) : undefined,
      propertyType: propertyType ? String(propertyType) : undefined,
      genderPreference: genderPreference ? String(genderPreference) : undefined,
      minRent: minRent ? Number(minRent) : undefined,
      maxRent: maxRent ? Number(maxRent) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy: sortBy ? String(sortBy) : undefined,
      sortOrder: sortOrder ? (String(sortOrder) as "asc" | "desc") : undefined,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  };
}
