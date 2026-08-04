/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
import type { UserRole, OwnerType } from "@studenthub/types";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        ownerType?: OwnerType | null;
      };
      subscription?: any;
      usage?: any;
    }
  }
}
