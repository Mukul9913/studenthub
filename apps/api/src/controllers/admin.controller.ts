import type { Request, Response } from "express";
import type { AdminService } from "../services/admin.service.js";
import { UnauthorizedError } from "../errors/index.js";

export class AdminController {
  constructor(private adminService: AdminService) {}

  getOverview = async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.role !== "admin") {
      throw new UnauthorizedError("Admin access required", "ADMIN_AUTH_REQUIRED");
    }

    const data = await this.adminService.getOverview();

    res.status(200).json({
      success: true,
      data,
    });
  };

  getListings = async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.role !== "admin") {
      throw new UnauthorizedError("Admin access required", "ADMIN_AUTH_REQUIRED");
    }

    const { domain, status, search, area, page, limit } = req.query;

    const data = await this.adminService.getListings({
      domain: domain ? String(domain) : undefined,
      status: status ? String(status) : undefined,
      search: search ? String(search) : undefined,
      area: area ? String(area) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    res.status(200).json({
      success: true,
      data,
    });
  };

  getListingDetails = async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.role !== "admin") {
      throw new UnauthorizedError("Admin access required", "ADMIN_AUTH_REQUIRED");
    }

    const domain = (req.params.domain as string) || "";
    const id = (req.params.id as string) || "";

    const data = await this.adminService.getListingDetails(domain, id);

    res.status(200).json({
      success: true,
      data,
    });
  };

  updateListingStatus = async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.role !== "admin") {
      throw new UnauthorizedError("Admin access required", "ADMIN_AUTH_REQUIRED");
    }

    const domain = (req.params.domain as string) || "";
    const id = (req.params.id as string) || "";
    const { status, rejectionReason } = req.body;

    const data = await this.adminService.updateListingStatus(domain, id, status, rejectionReason);

    res.status(200).json({
      success: true,
      data,
    });
  };

  getUsers = async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.role !== "admin") {
      throw new UnauthorizedError("Admin access required", "ADMIN_AUTH_REQUIRED");
    }

    const { role, search, page, limit } = req.query;

    const data = await this.adminService.getUsers({
      role: role ? String(role) : undefined,
      search: search ? String(search) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    res.status(200).json({
      success: true,
      data,
    });
  };

  getOwners = async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.role !== "admin") {
      throw new UnauthorizedError("Admin access required", "ADMIN_AUTH_REQUIRED");
    }

    const { ownerType, search, page, limit } = req.query;

    const data = await this.adminService.getOwners({
      ownerType: ownerType ? String(ownerType) : undefined,
      search: search ? String(search) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    res.status(200).json({
      success: true,
      data,
    });
  };
}
