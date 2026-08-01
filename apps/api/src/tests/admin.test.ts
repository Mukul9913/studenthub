/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from "node:assert";
import type { Server } from "node:http";
import { after, afterEach, before, beforeEach, describe, it, mock } from "node:test";
import jwt from "jsonwebtoken";

import { createApp } from "../app.js";
import { env } from "../config/env.js";
import { AdminService } from "../services/admin.service.js";

function generateTestToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: "1h",
  });
}

describe("Admin API Module Integration & Security Tests", () => {
  let server: Server;
  let baseUrl: string;

  const adminId = "658d5f3069151522f254192e";
  const studentId = "658d5f3069151522f254192d";
  const ownerId = "658d5f3069151522f254192b";

  const adminToken = generateTestToken(adminId, "admin");
  const studentToken = generateTestToken(studentId, "student");
  const ownerToken = generateTestToken(ownerId, "owner");

  before(async () => {
    return new Promise<void>((resolve) => {
      const app = createApp();
      server = app.listen(0, () => {
        const address = server.address();
        if (typeof address === "object" && address !== null) {
          baseUrl = `http://localhost:${address.port}`;
        }
        resolve();
      });
    });
  });

  after(() => {
    return new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });

  beforeEach(() => {
    // Stub AdminService methods directly to avoid mutating Mongoose model prototypes globally
    mock.method(AdminService.prototype, "getOverview", async () => ({
      users: {
        total: 10,
        students: 5,
        professionals: 3,
        owners: 2,
        admins: 1,
      },
      listings: {
        total: 8,
        accommodation: 5,
        library: 3,
        mess: 0,
        serviceProvider: 0,
      },
      approvals: {
        pending: 2,
        approved: 5,
        rejected: 1,
        draft: 0,
      },
      enquiries: {
        total: 2,
      },
      recentRegistrations: [],
      recentListings: [],
    }));

    mock.method(AdminService.prototype, "getUsers", async () => ({
      items: [
        {
          id: ownerId,
          firstName: "Saarthi",
          lastName: "Owner",
          email: "owner@studenthub.in",
          phone: "9876543210",
          role: "owner",
          ownerType: "library",
          isVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    }));

    mock.method(AdminService.prototype, "getOwners", async () => ({
      items: [
        {
          id: ownerId,
          firstName: "Saarthi",
          lastName: "Owner",
          email: "owner@studenthub.in",
          phone: "9876543210",
          ownerType: "library",
          listingsCount: 2,
          isVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    }));
  });

  afterEach(() => {
    mock.restoreAll();
  });

  it("GET /api/admin/overview should reject non-admin request with 403", async () => {
    const res = await fetch(`${baseUrl}/api/admin/overview`, {
      headers: {
        Authorization: `Bearer ${studentToken}`,
        "x-bypass-rate-limit": "true",
      },
    });

    assert.strictEqual(res.status, 403);
  });

  it("GET /api/admin/overview should reject owner request with 403", async () => {
    const res = await fetch(`${baseUrl}/api/admin/overview`, {
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        "x-bypass-rate-limit": "true",
      },
    });

    assert.strictEqual(res.status, 403);
  });

  it("GET /api/admin/overview should return overview statistics for authenticated admin", async () => {
    const res = await fetch(`${baseUrl}/api/admin/overview`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "x-bypass-rate-limit": "true",
      },
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.users.total, 10);
    assert.strictEqual(body.data.enquiries.total, 2);
  });

  it("GET /api/admin/users should return user accounts for admin", async () => {
    const res = await fetch(`${baseUrl}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "x-bypass-rate-limit": "true",
      },
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data.items));
  });

  it("GET /api/admin/owners should return business owners for admin", async () => {
    const res = await fetch(`${baseUrl}/api/admin/owners`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "x-bypass-rate-limit": "true",
      },
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data.items));
  });
});
