import type { Request, Response } from "express";
import type { AccommodationService } from "../services/accommodation.service.js";
import { CloudinaryService } from "../services/cloudinary.service.js";
import { UnauthorizedError, BadRequestError } from "../errors/index.js";
import { ListingQuerySchema } from "../schemas/listing-query.schema.js";

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
    const parsedQuery = ListingQuerySchema.parse(req.query);

    const result = await this.accommodationService.listAccommodations({
      textQuery: parsedQuery.q,
      city: parsedQuery.city,
      area: parsedQuery.area,
      propertyType: parsedQuery.propertyType,
      genderPreference: parsedQuery.genderPreference,
      minRent: parsedQuery.minRent,
      maxRent: parsedQuery.maxRent,
      lat: parsedQuery.lat,
      lng: parsedQuery.lng,
      radius: parsedQuery.radius,
      page: parsedQuery.page,
      limit: parsedQuery.limit,
      sortBy: parsedQuery.sortBy,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  };

  getNearby = async (req: Request, res: Response): Promise<void> => {
    const lat = Number(req.query.lat || req.query.latitude || 22.7196);
    const lng = Number(req.query.lng || req.query.longitude || 75.8577);
    const radiusMeters = Number(req.query.radius || req.query.radiusMeters || 5000);
    const limit = Number(req.query.limit || 20);

    const { getNearbyListings } = await import("../services/location.service.js");
    const listings = await getNearbyListings(
      lat,
      lng,
      radiusMeters,
      "ACCOMMODATION",
      "STRAIGHT",
      limit,
    );

    res.status(200).json({
      success: true,
      data: listings,
    });
  };

  search = async (req: Request, res: Response): Promise<void> => {
    const {
      q,
      city,
      state,
      college,
      coaching,
      area,
      lat,
      lng,
      radius,
      minRent,
      maxRent,
      propertyType,
      genderPreference,
      page,
      limit,
    } = req.query;

    const latitude = lat ? Number(lat) : undefined;
    const longitude = lng ? Number(lng) : undefined;
    const radiusMeters = radius ? Number(radius) : 5000;

    if (latitude !== undefined && longitude !== undefined) {
      const { getNearbyListings } = await import("../services/location.service.js");
      const listings = await getNearbyListings(
        latitude,
        longitude,
        radiusMeters,
        "ACCOMMODATION",
        "STRAIGHT",
        limit ? Number(limit) : 20,
      );

      res.status(200).json({
        success: true,
        data: {
          items: listings,
          total: listings.length,
        },
      });
      return;
    }

    const searchTerm = [q, college, coaching, area, city, state].filter(Boolean).join(" ");

    const result = await this.accommodationService.listAccommodations({
      area: searchTerm || (area ? String(area) : undefined),
      propertyType: propertyType ? String(propertyType) : undefined,
      genderPreference: genderPreference ? String(genderPreference) : undefined,
      minRent: minRent ? Number(minRent) : undefined,
      maxRent: maxRent ? Number(maxRent) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  };
}
