import type { Request, Response } from "express";
import { UnauthorizedError } from "../errors/index.js";
import type { MessService } from "../services/mess.service.js";

export class MessController {
  constructor(private messService: MessService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const {
      search,
      area,
      providerType,
      foodPreference,
      mealType,
      minPrice,
      maxPrice,
      delivery,
      pickup,
      subscription,
      page,
      limit,
      sortBy,
    } = req.query;

    const result = await this.messService.listMesses({
      search: search ? String(search) : undefined,
      area: area ? String(area) : undefined,
      providerType: providerType ? String(providerType) : undefined,
      foodPreference: foodPreference ? String(foodPreference) : undefined,
      mealType: mealType ? String(mealType) : undefined,
      minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      delivery: String(delivery) === "true",
      pickup: String(pickup) === "true",
      subscription: String(subscription) === "true",
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy: sortBy ? String(sortBy) : undefined,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  };

  getByIdOrSlug = async (req: Request, res: Response): Promise<void> => {
    const mess = await this.messService.getMessByIdOrSlug((req.params.idOrSlug as string) || "");

    res.status(200).json({
      success: true,
      data: mess,
    });
  };

  getMyMesses = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    const result = await this.messService.getMyMesses(req.user.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    const mess = await this.messService.createMess(req.user, req.body);

    res.status(201).json({
      success: true,
      data: mess,
    });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    const mess = await this.messService.updateMess(
      (req.params.id as string) || "",
      req.user,
      req.body,
    );

    res.status(200).json({
      success: true,
      data: mess,
    });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    await this.messService.deleteMess((req.params.id as string) || "", req.user);

    res.status(200).json({
      success: true,
      message: "Mess listing deleted successfully",
    });
  };

  replaceMenu = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    const mess = await this.messService.replaceWeeklyMenu(
      (req.params.id as string) || "",
      req.user,
      req.body.weeklyMenu,
    );

    res.status(200).json({
      success: true,
      data: mess,
    });
  };

  replacePlans = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    const mess = await this.messService.replaceMealPlans(
      (req.params.id as string) || "",
      req.user,
      req.body.mealPlans,
    );

    res.status(200).json({
      success: true,
      data: mess,
    });
  };
}
