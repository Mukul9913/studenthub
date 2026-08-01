import type { Request, Response } from "express";
import type { LibraryService } from "../services/library.service.js";
import { UnauthorizedError } from "../errors/index.js";

export class LibraryController {
  constructor(private libraryService: LibraryService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const { area, search, minFee, maxFee, ac, wifi, powerBackup, is24x7, page, limit, sortBy } =
      req.query;

    const result = await this.libraryService.listLibraries({
      area: area ? String(area) : undefined,
      search: search ? String(search) : undefined,
      minFee: minFee !== undefined ? Number(minFee) : undefined,
      maxFee: maxFee !== undefined ? Number(maxFee) : undefined,
      ac: String(ac) === "true",
      wifi: String(wifi) === "true",
      powerBackup: String(powerBackup) === "true",
      is24x7: String(is24x7) === "true",
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy: sortBy ? String(sortBy) : undefined,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const library = await this.libraryService.getLibraryById((req.params.id as string) || "");

    res.status(200).json({
      success: true,
      data: library,
    });
  };

  getMyLibraries = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    const result = await this.libraryService.getMyLibraries(req.user.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    const library = await this.libraryService.createLibrary(req.user, req.body);

    res.status(201).json({
      success: true,
      data: library,
    });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    const library = await this.libraryService.updateLibrary(
      (req.params.id as string) || "",
      req.user,
      req.body,
    );

    res.status(200).json({
      success: true,
      data: library,
    });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    await this.libraryService.deleteLibrary((req.params.id as string) || "", req.user);

    res.status(200).json({
      success: true,
      message: "Library listing deleted successfully",
    });
  };
}
