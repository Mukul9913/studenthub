/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from "node:assert";
import type { Server } from "node:http";
import { after, before, describe, it, mock } from "node:test";
import bcrypt from "bcrypt";

import { createApp } from "../app.js";
import { UserRepository } from "../repositories/user.repository.js";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository.js";

describe("Auth Module Integration Tests (Mocked DB)", () => {
  let server: Server;
  let baseUrl: string;

  // In-memory datastores
  const mockUsers = new Map<string, any>();
  const mockRefreshTokens = new Map<string, any>();

  before(async () => {
    // Hash password helper for setting up mock users
    const hash = await bcrypt.hash("securepassword", 12);
    mockUsers.set("658d5f3069151522f254192b", {
      _id: "658d5f3069151522f254192b",
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@example.com",
      phone: "+1234567890",
      role: "student",
      passwordHash: hash,
      isVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      async comparePassword(password: string) {
        return await bcrypt.compare(password, this.passwordHash);
      },
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
    });

    // 1. Stub UserRepository
    mock.method(UserRepository.prototype, "create", async (data: any) => {
      const id = "658d5f3069151522f254192d";
      const hashedPassword = await bcrypt.hash(data.passwordHash || "", 12);
      const newUser = {
        _id: id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        role: data.role || "student",
        passwordHash: hashedPassword,
        isVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        async comparePassword(password: string) {
          return await bcrypt.compare(password, this.passwordHash);
        },
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
      };
      mockUsers.set(id, newUser);
      return newUser;
    });

    mock.method(UserRepository.prototype, "findById", async (id: string) => {
      return mockUsers.get(id) || null;
    });

    mock.method(UserRepository.prototype, "findByEmail", async (email: string) => {
      const lower = email.toLowerCase();
      for (const user of mockUsers.values()) {
        if (user.email.toLowerCase() === lower) return user;
      }
      return null;
    });

    mock.method(UserRepository.prototype, "findByEmailWithPassword", async (email: string) => {
      const lower = email.toLowerCase();
      for (const user of mockUsers.values()) {
        if (user.email.toLowerCase() === lower) return user;
      }
      return null;
    });

    mock.method(UserRepository.prototype, "findByPhone", async (phone: string) => {
      for (const user of mockUsers.values()) {
        if (user.phone === phone) return user;
      }
      return null;
    });

    // 2. Stub RefreshTokenRepository
    mock.method(RefreshTokenRepository.prototype, "create", async (data: any) => {
      const id = crypto.randomUUID();
      const newRecord = {
        _id: id,
        token: data.token,
        userId: data.userId,
        expiresAt: data.expiresAt,
        isRevoked: data.isRevoked ?? false,
        isUsed: data.isUsed ?? false,
        replacedByToken: data.replacedByToken,
      };
      mockRefreshTokens.set(data.token, newRecord);
      return newRecord;
    });

    mock.method(RefreshTokenRepository.prototype, "findByToken", async (token: string) => {
      return mockRefreshTokens.get(token) || null;
    });

    mock.method(RefreshTokenRepository.prototype, "revokeAllForUser", async (userId: string) => {
      for (const record of mockRefreshTokens.values()) {
        if (record.userId.toString() === userId) {
          record.isRevoked = true;
        }
      }
    });

    mock.method(RefreshTokenRepository.prototype, "revokeToken", async (token: string) => {
      const record = mockRefreshTokens.get(token);
      if (record) record.isRevoked = true;
    });

    mock.method(
      RefreshTokenRepository.prototype,
      "markUsed",
      async (token: string, replacedByToken: string) => {
        const record = mockRefreshTokens.get(token);
        if (record) {
          record.isUsed = true;
          record.replacedByToken = replacedByToken;
        }
      },
    );

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

  it("POST /api/auth/register should create a new user with password hashed", async () => {
    const payload = {
      firstName: "Bob",
      lastName: "Miller",
      email: "bob.miller@example.com",
      password: "securepassword",
      phone: "+1999999999",
      role: "professional",
    };

    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bypass-rate-limit": "true",
      },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 201);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.user.firstName, payload.firstName);
    assert.strictEqual(body.data.user.email, payload.email);
    assert.ok(body.data.user.id);
    assert.ok(body.data.accessToken);
  });

  it("POST /api/auth/login should verify password, return access token, and set httpOnly cookie", async () => {
    const payload = {
      email: "alice@example.com",
      password: "securepassword",
    };

    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bypass-rate-limit": "true",
      },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.ok(body.data.accessToken);
    assert.strictEqual(body.data.user.email, payload.email);

    // Verify secure HttpOnly cookie in response headers
    const cookieHeader = res.headers.get("set-cookie");
    assert.ok(cookieHeader);
    assert.ok(cookieHeader.includes("refreshToken="));
    assert.ok(cookieHeader.includes("HttpOnly"));
  });

  it("POST /api/auth/login should return 401 generic error on incorrect credentials to prevent enumeration", async () => {
    const payloads = [
      { email: "non-existent@example.com", password: "securepassword" },
      { email: "alice@example.com", password: "wrongpassword" },
    ];

    for (const payload of payloads) {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bypass-rate-limit": "true",
        },
        body: JSON.stringify(payload),
      });

      assert.strictEqual(res.status, 401);
      const body = (await res.json()) as any;
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, "INVALID_CREDENTIALS");
    }
  });

  it("POST /api/auth/refresh should rotate refresh token and return new access token", async () => {
    // 1. Log in to get initial tokens
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bypass-rate-limit": "true",
      },
      body: JSON.stringify({
        email: "alice@example.com",
        password: "securepassword",
      }),
    });
    const setCookie = loginRes.headers.get("set-cookie") || "";
    const originalRefreshToken = setCookie.split(";")[0]?.split("=")[1] || "";

    // 2. Perform refresh
    const refreshRes = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `refreshToken=${originalRefreshToken}`,
        "x-bypass-rate-limit": "true",
      },
    });

    assert.strictEqual(refreshRes.status, 200);
    const refreshBody = (await refreshRes.json()) as any;
    assert.ok(refreshBody.data.accessToken);

    const newCookieHeader = refreshRes.headers.get("set-cookie") || "";
    const newRefreshToken = newCookieHeader.split(";")[0]?.split("=")[1] || "";
    assert.ok(newRefreshToken);
    assert.notStrictEqual(newRefreshToken, originalRefreshToken);
  });

  it("POST /api/auth/refresh should revoke all sessions on reuse detection (stolen token)", async () => {
    // 1. Log in to get token
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bypass-rate-limit": "true",
      },
      body: JSON.stringify({
        email: "alice@example.com",
        password: "securepassword",
      }),
    });
    const setCookie = loginRes.headers.get("set-cookie") || "";
    const refreshToken = setCookie.split(";")[0]?.split("=")[1] || "";

    // 2. Refresh first time (rotates token, marks original as used)
    const firstRefresh = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
        "x-bypass-rate-limit": "true",
      },
    });
    assert.strictEqual(firstRefresh.status, 200);

    // 3. Refresh second time with same original token (REUSE)
    const secondRefresh = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
        "x-bypass-rate-limit": "true",
      },
    });

    assert.strictEqual(secondRefresh.status, 403);
    const body = (await secondRefresh.json()) as any;
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, "TOKEN_REUSE_DETECTED");
  });

  it("POST /api/auth/logout should clear cookie and revoke token", async () => {
    // 1. Log in
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bypass-rate-limit": "true",
      },
      body: JSON.stringify({
        email: "alice@example.com",
        password: "securepassword",
      }),
    });
    const setCookie = loginRes.headers.get("set-cookie") || "";
    const refreshToken = setCookie.split(";")[0]?.split("=")[1] || "";

    // 2. Logout
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
        "x-bypass-rate-limit": "true",
      },
    });

    assert.strictEqual(logoutRes.status, 200);
    const logoutCookie = logoutRes.headers.get("set-cookie") || "";
    assert.ok(
      logoutCookie.toLowerCase().includes("max-age=0") ||
        logoutCookie.toLowerCase().includes("expires="),
    );

    // Verify token is revoked in datastore
    const record = mockRefreshTokens.get(refreshToken);
    assert.ok(record);
    assert.ok(record.isRevoked);
  });

  it("Protected route /api/test-auth should reject requests without a valid Bearer token", async () => {
    const res = await fetch(`${baseUrl}/api/test-auth`);
    assert.strictEqual(res.status, 401);
    const body = (await res.json()) as any;
    assert.strictEqual(body.error.code, "AUTH_TOKEN_REQUIRED");
  });

  it("Protected route /api/test-auth should permit request with a valid Bearer token", async () => {
    // 1. Login to get access token
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bypass-rate-limit": "true",
      },
      body: JSON.stringify({
        email: "alice@example.com",
        password: "securepassword",
      }),
    });
    const loginBody = (await loginRes.json()) as any;
    const token = loginBody.data.accessToken;

    // 2. Call protected route
    const res = await fetch(`${baseUrl}/api/test-auth`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.user.id, "658d5f3069151522f254192b");
    assert.strictEqual(body.user.role, "student");
  });

  it("POST /api/auth/login should block request with 429 Too Many Requests after 5 attempts", async () => {
    // Boot a second server to isolate rate limiting hits Map
    const app = createApp();
    const subServer = app.listen(0);
    const subAddress = subServer.address();
    let subUrl = "";
    if (typeof subAddress === "object" && subAddress !== null) {
      subUrl = `http://localhost:${subAddress.port}`;
    }

    const payload = {
      email: "alice@example.com",
      password: "securepassword",
    };

    // Make 5 attempts (allowed)
    for (let i = 0; i < 5; i++) {
      const res = await fetch(`${subUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      assert.strictEqual(res.status, 200);
      const setCookie = res.headers.get("set-cookie") || "";
      const rfToken = setCookie.split(";")[0]?.split("=")[1] || "";
      mockRefreshTokens.delete(rfToken); // clear to prevent test leakage
    }

    // 6th attempt should trigger 429 rate limiter
    const blockedRes = await fetch(`${subUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(blockedRes.status, 429);
    const body = (await blockedRes.json()) as any;
    assert.strictEqual(body.error.code, "AUTH_RATE_LIMIT_EXCEEDED");
    assert.ok(blockedRes.headers.get("Retry-After"));

    await new Promise<void>((resolve, reject) => {
      subServer.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
});
