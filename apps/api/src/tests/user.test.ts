/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from "node:assert";
import type { Server } from "node:http";
import { after, before, describe, it, mock } from "node:test";

import { createApp } from "../app.js";
import { UserModel } from "../models/user.model.js";
import { UserRepository } from "../repositories/user.repository.js";

describe("UserModel Unit Tests", () => {
  it("should normalize email to lowercase and trim whitespace", () => {
    const user = new UserModel({
      firstName: "John",
      lastName: "Doe",
      email: "  John.Doe@EXAMPLE.COM  ",
      phone: "+1234567890",
      role: "student",
    });

    assert.strictEqual(user.email, "john.doe@example.com");
  });

  it("should normalize phone number by stripping spaces, dashes, and parens", () => {
    const user = new UserModel({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: " +1 (555) 123-4567 ",
      role: "student",
    });

    assert.strictEqual(user.phone, "+15551234567");
  });

  it("should validate required fields", async () => {
    const user = new UserModel({
      email: "john@example.com",
    });

    try {
      await user.validate();
      assert.fail("Should have failed validation");
    } catch (err: any) {
      assert.ok(err.errors.firstName);
      assert.ok(err.errors.lastName);
    }
  });

  it("should validate roles correctness", async () => {
    const user = new UserModel({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "invalid-role" as any,
    });

    try {
      await user.validate();
      assert.fail("Should have failed validation for role");
    } catch (err: any) {
      assert.ok(err.errors.role);
    }
  });
});

describe("User Module Integration Tests (Mocked DB)", () => {
  let server: Server;
  let baseUrl: string;

  const mockUsers = new Map<string, any>([
    [
      "658d5f3069151522f254192b",
      {
        _id: "658d5f3069151522f254192b",
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com",
        phone: "+1234567890",
        role: "student",
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON() {
          return {
            id: this._id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            phone: this.phone,
            role: this.role,
            isVerified: this.isVerified,
            isActive: this.isActive,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
          };
        },
      },
    ],
  ]);

  before(() => {
    mock.method(UserRepository.prototype, "create", async (data: any) => {
      const id = "658d5f3069151522f254192c";
      const newUser = {
        _id: id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        role: data.role || "student",
        avatar: data.avatar,
        isVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON() {
          return {
            id: this._id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            phone: this.phone,
            role: this.role,
            avatar: this.avatar,
            isVerified: this.isVerified,
            isActive: this.isActive,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
          };
        },
      };
      mockUsers.set(id, newUser);
      return newUser;
    });

    mock.method(UserRepository.prototype, "findById", async (id: string) => {
      return mockUsers.get(id) || null;
    });

    mock.method(UserRepository.prototype, "findByEmail", async (email: string) => {
      const lowerEmail = email.toLowerCase();
      for (const user of mockUsers.values()) {
        if (user.email.toLowerCase() === lowerEmail) {
          return user;
        }
      }
      return null;
    });

    mock.method(UserRepository.prototype, "findByPhone", async (phone: string) => {
      for (const user of mockUsers.values()) {
        if (user.phone === phone) {
          return user;
        }
      }
      return null;
    });

    mock.method(UserRepository.prototype, "update", async (id: string, data: any) => {
      const user = mockUsers.get(id);
      if (!user) return null;
      const updated = {
        ...user,
        ...data,
        updatedAt: new Date(),
      };
      mockUsers.set(id, updated);
      return updated;
    });

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

  it("POST /api/users should register a user and return the profile DTO", async () => {
    const payload = {
      firstName: "Bob",
      lastName: "Jones",
      email: "bob@example.com",
      phone: "+9876543210",
      role: "professional",
      avatar: "https://example.com/avatar.png",
    };

    const res = await fetch(`${baseUrl}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 201);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.firstName, payload.firstName);
    assert.strictEqual(body.data.lastName, payload.lastName);
    assert.strictEqual(body.data.email, payload.email);
    assert.strictEqual(body.data.phone, payload.phone);
    assert.strictEqual(body.data.role, payload.role);
    assert.strictEqual(body.data.avatar, payload.avatar);
    assert.strictEqual(body.data.isVerified, false);
    assert.strictEqual(body.data.isActive, true);
    assert.ok(body.data.id);
  });

  it("POST /api/users should return 409 Conflict if email is already taken", async () => {
    const payload = {
      firstName: "Duplicate",
      lastName: "Email",
      email: "alice@example.com",
    };

    const res = await fetch(`${baseUrl}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 409);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, "EMAIL_ALREADY_EXISTS");
  });

  it("POST /api/users should return 409 Conflict if phone is already taken", async () => {
    const payload = {
      firstName: "Duplicate",
      lastName: "Phone",
      email: "distinct@example.com",
      phone: "+1234567890",
    };

    const res = await fetch(`${baseUrl}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 409);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, "PHONE_ALREADY_EXISTS");
  });

  it("POST /api/users should return 400 Validation Error if email format is invalid", async () => {
    const payload = {
      firstName: "Invalid",
      lastName: "Mail",
      email: "not-an-email",
    };

    const res = await fetch(`${baseUrl}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 400);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, "VALIDATION_ERROR");
    assert.ok(body.error.details["email"]);
  });

  it("GET /api/users/:id should return user profile details", async () => {
    const res = await fetch(`${baseUrl}/api/users/658d5f3069151522f254192b`);

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.firstName, "Alice");
    assert.strictEqual(body.data.lastName, "Smith");
    assert.strictEqual(body.data.email, "alice@example.com");
  });

  it("GET /api/users/:id should return 404 if user ID does not exist", async () => {
    const res = await fetch(`${baseUrl}/api/users/658d5f3069151522f254192f`);

    assert.strictEqual(res.status, 404);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, "USER_NOT_FOUND");
  });

  it("PATCH /api/users/:id should update profile details successfully", async () => {
    const payload = {
      firstName: "Alice",
      lastName: "Cooper",
      phone: "+1999999999",
    };

    const res = await fetch(`${baseUrl}/api/users/658d5f3069151522f254192b`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.firstName, "Alice");
    assert.strictEqual(body.data.lastName, "Cooper");
    assert.strictEqual(body.data.phone, "+1999999999");
  });
});
