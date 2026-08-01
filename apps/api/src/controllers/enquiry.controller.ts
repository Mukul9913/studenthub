import type { Request, Response } from "express";
import type { EnquiryService } from "../services/enquiry.service.js";
import { UnauthorizedError } from "../errors/index.js";

export class EnquiryController {
  constructor(private enquiryService: EnquiryService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    const enquiry = await this.enquiryService.createEnquiry(req.user.id, req.body);

    res.status(201).json({
      success: true,
      data: enquiry,
    });
  };

  getMine = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    const enquiries = await this.enquiryService.getMyEnquiries(req.user.id);

    res.status(200).json({
      success: true,
      data: enquiries,
    });
  };

  getOwnerLeads = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    const { status, targetType } = req.query;

    const leads = await this.enquiryService.getOwnerLeads(req.user.id, {
      status: status ? String(status) : undefined,
      targetType: targetType ? String(targetType) : undefined,
    });

    res.status(200).json({
      success: true,
      data: leads,
    });
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.role !== "admin") {
      throw new UnauthorizedError("Admin access required", "ADMIN_AUTH_REQUIRED");
    }

    const { status, targetType } = req.query;

    const enquiries = await this.enquiryService.getAllEnquiries({
      status: status ? String(status) : undefined,
      targetType: targetType ? String(targetType) : undefined,
    });

    res.status(200).json({
      success: true,
      data: enquiries,
    });
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    const { id } = req.params;
    const { status } = req.body;

    const updated = await this.enquiryService.updateLeadStatus(
      (id as string) || "",
      req.user,
      status,
    );

    res.status(200).json({
      success: true,
      data: updated,
    });
  };
}
