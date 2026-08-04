import type { Request, Response, NextFunction } from "express";
import {
  geocodeQuerySchema,
  reverseGeocodeSchema,
  nearbyListingsQuerySchema,
  distanceMatrixQuerySchema,
} from "@studenthub/validation";
import {
  geocodeAddress,
  reverseGeocode,
  getNearbyListings,
  getDistanceMatrix,
  getAreaSuggestions,
} from "../services/location.service.js";
import { AppError } from "../errors/app-error.js";

export async function geocodeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = geocodeQuerySchema.safeParse(req.body);
    if (!parsed.success) throw new AppError("Invalid geocode payload", 400, "VALIDATION_ERROR");

    const data = await geocodeAddress(parsed.data.address, parsed.data.city);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function reverseGeocodeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = reverseGeocodeSchema.safeParse(req.body);
    if (!parsed.success)
      throw new AppError("Invalid reverse geocode payload", 400, "VALIDATION_ERROR");

    const data = await reverseGeocode(parsed.data.latitude, parsed.data.longitude);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getNearbyListingsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = nearbyListingsQuerySchema.safeParse(req.query);
    if (!parsed.success)
      throw new AppError("Invalid nearby query parameters", 400, "VALIDATION_ERROR");

    const data = await getNearbyListings(
      parsed.data.latitude,
      parsed.data.longitude,
      parsed.data.radiusMeters,
      parsed.data.targetType,
      parsed.data.distanceMode,
      parsed.data.limit,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getDistanceMatrixHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = distanceMatrixQuerySchema.safeParse(req.body);
    if (!parsed.success)
      throw new AppError("Invalid distance matrix payload", 400, "VALIDATION_ERROR");

    const data = await getDistanceMatrix(
      parsed.data.origins,
      parsed.data.destinations,
      parsed.data.mode,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getAreaSuggestionsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = String(req.query.q || req.query.input || "");
    const city = String(req.query.city || "Indore");
    if (!input.trim()) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const data = await getAreaSuggestions(input, city);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
