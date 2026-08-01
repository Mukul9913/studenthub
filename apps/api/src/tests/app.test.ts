import assert from "node:assert";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";

import { createApp } from "../app.js";

describe("Express Application Integration Tests", () => {
  let server: Server;
  let baseUrl: string;

  before(() => {
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

  it("GET /api/health should return 200 and health status", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);

    const body = (await res.json()) as {
      success: boolean;
      data: { status: string; service: string };
    };
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, "ok");
    assert.strictEqual(body.data.service, "studenthub-api");
  });

  it("GET /api/non-existent-route should return 404 and NOT_FOUND error", async () => {
    const res = await fetch(`${baseUrl}/api/non-existent-route`);
    assert.strictEqual(res.status, 404);

    const body = (await res.json()) as {
      success: boolean;
      error: { code: string; message: string };
    };
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, "NOT_FOUND");
    assert.strictEqual(body.error.message, "Resource not found");
  });

  it("GET /api/test-app-error should handle operational AppError and return 400 with details", async () => {
    const res = await fetch(`${baseUrl}/api/test-app-error`);
    assert.strictEqual(res.status, 400);

    const body = (await res.json()) as {
      success: boolean;
      error: { code: string; message: string };
    };
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, "BAD_REQUEST");
    assert.strictEqual(body.error.message, "Simulated operational error");
  });

  it("GET /api/test-error should handle unhandled programmer errors and return 500", async () => {
    const res = await fetch(`${baseUrl}/api/test-error`);
    assert.strictEqual(res.status, 500);

    const body = (await res.json()) as {
      success: boolean;
      error: { code: string; message: string };
    };
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, "INTERNAL_SERVER_ERROR");
    assert.strictEqual(body.error.message, "An unexpected error occurred");
  });
});
