/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from "node:assert";
import type { Server } from "node:http";
import { after, before, describe, it, mock } from "node:test";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { createApp } from "../app.js";
import { env } from "../config/env.js";
import { PropertyRepository } from "../repositories/property.repository.js";
import { RoomRepository } from "../repositories/room.repository.js";

function generateTestToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: "1h",
  });
}

describe("Accommodation MVP Integration Tests (Mocked DB)", () => {
  let server: Server;
  let baseUrl: string;

  const owner1Id = "658d5f3069151522f254192b";
  const owner2Id = "658d5f3069151522f254192c";
  const studentId = "658d5f3069151522f254192d";
  const adminId = "658d5f3069151522f254192e";

  const owner1Token = generateTestToken(owner1Id, "owner");
  const owner2Token = generateTestToken(owner2Id, "owner");
  const studentToken = generateTestToken(studentId, "student");
  const adminToken = generateTestToken(adminId, "admin");

  // In-memory datastore stubs
  const mockProperties = new Map<string, any>();
  const mockRooms = new Map<string, any>();

  before(() => {
    // 1. Stub PropertyRepository
    mock.method(PropertyRepository.prototype, "create", async (data: any) => {
      const id = new mongoose.Types.ObjectId().toString();
      const newProperty = {
        _id: id,
        ...data,
        isVerified: false,
        avgRating: 0,
        reviewsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON() {
          const { toJSON: _toJSON, ...rest } = this;
          return {
            id: rest._id,
            ...rest,
            createdAt:
              rest.createdAt instanceof Date ? rest.createdAt.toISOString() : rest.createdAt,
            updatedAt:
              rest.updatedAt instanceof Date ? rest.updatedAt.toISOString() : rest.updatedAt,
          };
        },
      };
      mockProperties.set(id, newProperty);
      return newProperty;
    });

    mock.method(PropertyRepository.prototype, "findById", async (id: string) => {
      return mockProperties.get(id) || null;
    });

    mock.method(PropertyRepository.prototype, "update", async (id: string, data: any) => {
      const existing = mockProperties.get(id);
      if (!existing) return null;
      const updated = {
        ...existing,
        ...data,
        updatedAt: new Date(),
      };
      mockProperties.set(id, updated);
      return updated;
    });

    mock.method(PropertyRepository.prototype, "search", async (filters: any) => {
      let results = Array.from(mockProperties.values());

      if (filters.propertyIds) {
        results = results.filter((p) => filters.propertyIds.includes(p._id));
      }
      if (filters.area) {
        const regex = new RegExp(filters.area, "i");
        results = results.filter((p) => regex.test(p.area));
      }
      if (filters.type) {
        results = results.filter((p) => p.propertyType === filters.type);
      }

      return results;
    });

    mock.method(PropertyRepository.prototype, "searchPaginated", async (filters: any) => {
      let results = Array.from(mockProperties.values());

      if (filters.propertyIds) {
        results = results.filter((p) => filters.propertyIds.includes(p._id));
      }
      if (filters.area) {
        const regex = new RegExp(filters.area, "i");
        results = results.filter((p) => regex.test(p.area));
      }
      if (filters.type) {
        results = results.filter((p) => p.propertyType === filters.type);
      }

      return { items: results, total: results.length };
    });

    // 2. Stub RoomRepository
    mock.method(RoomRepository.prototype, "create", async (data: any) => {
      const id = new mongoose.Types.ObjectId().toString();
      const newRoom = {
        _id: id,
        ...data,
        isAvailable: data.isAvailable ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRooms.set(id, newRoom);
      return newRoom;
    });

    mock.method(RoomRepository.prototype, "findByProperty", async (propertyId: string) => {
      return Array.from(mockRooms.values()).filter((r) => r.propertyId.toString() === propertyId);
    });

    mock.method(RoomRepository.prototype, "search", async (filters: any) => {
      let results = Array.from(mockRooms.values());

      if (filters.genderPreference) {
        results = results.filter((r) => r.genderPreference === filters.genderPreference);
      }
      if (filters.minRent !== undefined) {
        results = results.filter((r) => r.rent >= filters.minRent);
      }
      if (filters.maxRent !== undefined) {
        results = results.filter((r) => r.rent <= filters.maxRent);
      }

      return results;
    });

    // 3. Start server
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
    mock.restoreAll();
    return new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });

  it("POST /api/accommodations should create property listing and rooms when called by owner", async () => {
    const payload = {
      title: "Premium PG Vijay Nagar",
      description: "High quality rooms in Indore with food.",
      propertyType: "pg",
      location: {
        address: "Scheme 54, Vijay Nagar",
        city: "Indore",
        state: "MP",
        zipCode: "452010",
        coordinates: {
          type: "Point",
          coordinates: [75.8975, 22.7533],
        },
      },
      area: "Vijay Nagar",
      food: {
        provided: true,
        mealsIncluded: ["breakfast", "dinner"],
        monthlyCharges: 1500,
      },
      rooms: [
        {
          roomType: "shared",
          sharingCount: 2,
          rent: 7000,
          deposit: 14000,
          genderPreference: "girls",
          totalBeds: 4,
          availableBeds: 2,
        },
      ],
    };

    const res = await fetch(`${baseUrl}/api/accommodations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${owner1Token}`,
        "x-bypass-rate-limit": "true",
      },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 201);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.property.title, payload.title);
    assert.strictEqual(body.data.property.ownerId, owner1Id);
    assert.strictEqual(body.data.rooms.length, 1);
    assert.strictEqual(body.data.rooms[0].rent, 7000);
  });

  it("POST /api/accommodations should reject listing creation when called by student", async () => {
    const payload = {
      title: "Student Flat",
      description: "Description flat listings for Indore.",
      propertyType: "flat",
      location: {
        address: "Bhawarkua",
        city: "Indore",
        state: "MP",
        zipCode: "452001",
        coordinates: {
          type: "Point",
          coordinates: [75.8654, 22.6897],
        },
      },
      area: "Bhawarkua",
    };

    const res = await fetch(`${baseUrl}/api/accommodations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
        "x-bypass-rate-limit": "true",
      },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 403);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, "INSUFFICIENT_PERMISSIONS");
  });

  it("PATCH /api/accommodations/:id should update property details when called by own owner", async () => {
    // 1. Create a listing
    const payload = {
      title: "PG for boys",
      description: "Near SGSITS college area.",
      propertyType: "pg",
      location: {
        address: "Vallabh Nagar",
        city: "Indore",
        state: "MP",
        zipCode: "452003",
        coordinates: {
          type: "Point",
          coordinates: [75.8711, 22.7234],
        },
      },
      area: "Vallabh Nagar",
    };

    const createRes = await fetch(`${baseUrl}/api/accommodations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${owner1Token}`,
        "x-bypass-rate-limit": "true",
      },
      body: JSON.stringify(payload),
    });
    const createBody = (await createRes.json()) as any;
    const propertyId = createBody.data.property._id || createBody.data.property.id;

    // 2. Perform patch update
    const updatePayload = {
      title: "Updated Boys PG Vallabh Nagar",
    };

    const updateRes = await fetch(`${baseUrl}/api/accommodations/${propertyId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${owner1Token}`,
        "x-bypass-rate-limit": "true",
      },
      body: JSON.stringify(updatePayload),
    });

    assert.strictEqual(updateRes.status, 200);
    const updateBody = (await updateRes.json()) as any;
    assert.strictEqual(updateBody.success, true);
    assert.strictEqual(updateBody.data.title, updatePayload.title);
  });

  it("PATCH /api/accommodations/:id should reject update when called by different owner", async () => {
    // 1. Create listing using owner1
    const payload = {
      title: "Owner 1 Flat",
      description: "A large flat near TCS Indore.",
      propertyType: "flat",
      location: {
        address: "Super Corridor",
        city: "Indore",
        state: "MP",
        zipCode: "452005",
        coordinates: {
          type: "Point",
          coordinates: [75.8012, 22.7845],
        },
      },
      area: "Super Corridor",
    };

    const createRes = await fetch(`${baseUrl}/api/accommodations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${owner1Token}`,
        "x-bypass-rate-limit": "true",
      },
      body: JSON.stringify(payload),
    });
    const createBody = (await createRes.json()) as any;
    const propertyId = createBody.data.property._id || createBody.data.property.id;

    // 2. Attempt patch update using owner2
    const updateRes = await fetch(`${baseUrl}/api/accommodations/${propertyId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${owner2Token}`,
        "x-bypass-rate-limit": "true",
      },
      body: JSON.stringify({ title: "Stolen update title" }),
    });

    assert.strictEqual(updateRes.status, 403);
    const updateBody = (await updateRes.json()) as any;
    assert.strictEqual(updateBody.success, false);
    assert.strictEqual(updateBody.error.code, "ACCOMMODATION_UPDATE_FORBIDDEN");
  });

  it("PATCH /api/accommodations/:id should permit update when called by admin", async () => {
    // 1. Create listing using owner1
    const payload = {
      title: "Owner 1 Flat to be edited by Admin",
      description: "A large flat near TCS Indore.",
      propertyType: "flat",
      location: {
        address: "Super Corridor",
        city: "Indore",
        state: "MP",
        zipCode: "452005",
        coordinates: {
          type: "Point",
          coordinates: [75.8012, 22.7845],
        },
      },
      area: "Super Corridor",
    };

    const createRes = await fetch(`${baseUrl}/api/accommodations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${owner1Token}`,
        "x-bypass-rate-limit": "true",
      },
      body: JSON.stringify(payload),
    });
    const createBody = (await createRes.json()) as any;
    const propertyId = createBody.data.property._id || createBody.data.property.id;

    // 2. Perform patch update using adminToken
    const updateRes = await fetch(`${baseUrl}/api/accommodations/${propertyId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
        "x-bypass-rate-limit": "true",
      },
      body: JSON.stringify({ title: "Admin revised title" }),
    });

    assert.strictEqual(updateRes.status, 200);
    const updateBody = (await updateRes.json()) as any;
    assert.strictEqual(updateBody.success, true);
    assert.strictEqual(updateBody.data.title, "Admin revised title");
  });

  it("GET /api/accommodations/:id should retrieve property listing and associate rooms", async () => {
    const payload = {
      title: "Accomodation test get details",
      description: "Description test details with room attachments.",
      propertyType: "house",
      location: {
        address: "LIG Square",
        city: "Indore",
        state: "MP",
        zipCode: "452011",
        coordinates: {
          type: "Point",
          coordinates: [75.8821, 22.7412],
        },
      },
      area: "LIG",
      rooms: [
        {
          roomType: "private",
          sharingCount: 1,
          rent: 9000,
          deposit: 18000,
          genderPreference: "boys",
          totalBeds: 1,
          availableBeds: 1,
        },
      ],
    };

    const createRes = await fetch(`${baseUrl}/api/accommodations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${owner1Token}`,
        "x-bypass-rate-limit": "true",
      },
      body: JSON.stringify(payload),
    });
    const createBody = (await createRes.json()) as any;
    const propertyId = createBody.data.property._id || createBody.data.property.id;

    // Fetch details
    const res = await fetch(`${baseUrl}/api/accommodations/${propertyId}`);
    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.property.title, payload.title);
    assert.strictEqual(body.data.rooms.length, 1);
    assert.strictEqual(body.data.rooms[0].sharingCount, 1);
  });

  it("GET /api/accommodations with query parameters should execute basic filters successfully", async () => {
    // 1. Create a PG for girls under 5000 in Geeta Bhawan
    const payloadGirls = {
      title: "Girls Hostel Geeta Bhawan",
      description: "Cheap accommodation for girls students.",
      propertyType: "hostel",
      location: {
        address: "Geeta Bhawan Square",
        city: "Indore",
        state: "MP",
        zipCode: "452001",
        coordinates: {
          type: "Point",
          coordinates: [75.8756, 22.7167],
        },
      },
      area: "Geeta Bhawan",
      rooms: [
        {
          roomType: "shared",
          sharingCount: 3,
          rent: 4500,
          deposit: 9000,
          genderPreference: "girls",
          totalBeds: 9,
          availableBeds: 3,
        },
      ],
    };

    await fetch(`${baseUrl}/api/accommodations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${owner1Token}`,
        "x-bypass-rate-limit": "true",
      },
      body: JSON.stringify(payloadGirls),
    });

    // 2. Query filter matching
    const res = await fetch(
      `${baseUrl}/api/accommodations?area=Geeta+Bhawan&propertyType=hostel&genderPreference=girls&maxRent=5000`,
    );

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.ok(body.data.items.length >= 1);
    assert.strictEqual(body.data.items[0].title, payloadGirls.title);
  });
});
