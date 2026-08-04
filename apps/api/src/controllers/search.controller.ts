import type { Request, Response } from "express";
import type { SearchService } from "../services/search.service.js";
import { UnauthorizedError } from "../errors/index.js";
import type { SearchQueryParams, SearchTargetType, SortOption } from "@studenthub/types";

export class SearchController {
  constructor(private searchService: SearchService) {}

  search = async (req: Request, res: Response): Promise<void> => {
    const params: SearchQueryParams = {
      q: req.query.q as string,
      targetType: req.query.targetType as SearchTargetType,
      city: req.query.city as string,
      area: req.query.area as string,
      lat: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
      lng: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
      radiusKm: req.query.radiusKm ? parseFloat(req.query.radiusKm as string) : 10,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      gender: req.query.gender as string,
      propertyType: req.query.propertyType as string,
      roomType: req.query.roomType as string,
      bhk: req.query.bhk ? parseInt(req.query.bhk as string, 10) : undefined,
      furnishing: req.query.furnishing as string,
      tenantType: req.query.tenantType as string,
      ac: req.query.ac === "true",
      wifi: req.query.wifi === "true",
      powerBackup: req.query.powerBackup === "true",
      parking: req.query.parking === "true",
      cctv: req.query.cctv === "true",
      locker: req.query.locker === "true",
      is24x7: req.query.is24x7 === "true",
      foodProvided: req.query.foodProvided === "true",
      isVerified: req.query.isVerified === "true",
      isFeatured: req.query.isFeatured === "true",
      isAvailable: req.query.isAvailable === "true",
      sortBy: (req.query.sortBy as SortOption) || "newest",
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 12,
      cursor: req.query.cursor as string,
    };

    const userId = req.user?.id;
    const ipAddress = req.ip;
    const result = await this.searchService.search(params, userId, ipAddress);

    res.status(200).json({ success: true, ...result });
  };

  getSuggestions = async (req: Request, res: Response): Promise<void> => {
    const query = (req.query.q as string) || "";
    const city = (req.query.city as string) || "indore";
    const suggestions = await this.searchService.getSuggestions(query, city);
    res.status(200).json({ success: true, data: suggestions });
  };

  getRecommendations = async (req: Request, res: Response): Promise<void> => {
    const params = {
      targetType: req.query.targetType as string,
      targetId: req.query.targetId as string,
      lat: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
      lng: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
      userId: req.user?.id,
    };
    const recs = await this.searchService.getRecommendations(params);
    res.status(200).json({ success: true, data: recs });
  };

  trackView = async (req: Request, res: Response): Promise<void> => {
    const { targetType, targetId, sessionId } = req.body;
    await this.searchService.trackView(targetType, targetId, req.user?.id, sessionId);
    res.status(200).json({ success: true, message: "Listing view tracked" });
  };

  saveSearch = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const result = await this.searchService.saveSearch(req.user.id, req.body);
    res.status(201).json({ success: true, data: result });
  };

  getUserSearchHistory = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const history = await this.searchService.getUserSearchHistory(req.user.id);
    res.status(200).json({ success: true, data: history });
  };

  getAdminSearchAnalytics = async (req: Request, res: Response): Promise<void> => {
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
    const analytics = await this.searchService.getAdminSearchAnalytics(days);
    res.status(200).json({ success: true, data: analytics });
  };
}
