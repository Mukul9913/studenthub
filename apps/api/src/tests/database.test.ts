import assert from "node:assert";
import { mock, describe, it, beforeEach, afterEach } from "node:test";
import mongoose from "mongoose";

import { connectDatabase, disconnectDatabase } from "../lib/database.js";

describe("Database Connection Module Tests", () => {
  let connectStub: ReturnType<typeof mock.method>;
  let disconnectStub: ReturnType<typeof mock.method>;
  let readyStateValue = 0;
  const originalConnection = mongoose.connection;

  beforeEach(() => {
    readyStateValue = 0;

    // Override the connection getter on the mongoose instance
    Object.defineProperty(mongoose, "connection", {
      get: () => ({
        readyState: readyStateValue,
      }),
      configurable: true,
    });

    // Mock mongoose.connect
    connectStub = mock.method(mongoose, "connect", async () => {
      readyStateValue = 1; // Simulate state transition to connected
      return mongoose;
    });

    // Mock mongoose.disconnect
    disconnectStub = mock.method(mongoose, "disconnect", async () => {
      readyStateValue = 0; // Simulate state transition to disconnected
    });
  });

  afterEach(() => {
    // Restore the original connection getter
    Object.defineProperty(mongoose, "connection", {
      get: () => originalConnection,
      configurable: true,
    });
    mock.restoreAll();
  });

  it("should connect to database when state is disconnected (0)", async () => {
    readyStateValue = 0;

    const connection = await connectDatabase();
    assert.strictEqual(connection, mongoose);
    assert.strictEqual(connectStub.mock.callCount(), 1);
  });

  it("should reuse connection and not call connect again when state is connected (1)", async () => {
    readyStateValue = 1;

    const connection = await connectDatabase();
    assert.strictEqual(connection, mongoose);
    assert.strictEqual(connectStub.mock.callCount(), 0);
  });

  it("should reuse connection and not call connect again when state is connecting (2)", async () => {
    readyStateValue = 2;

    const connection = await connectDatabase();
    assert.strictEqual(connection, mongoose);
    assert.strictEqual(connectStub.mock.callCount(), 0);
  });

  it("should disconnect from database when connection is active", async () => {
    readyStateValue = 1;

    await disconnectDatabase();
    assert.strictEqual(disconnectStub.mock.callCount(), 1);
  });

  it("should not call disconnect when connection is already closed (0)", async () => {
    readyStateValue = 0;

    await disconnectDatabase();
    assert.strictEqual(disconnectStub.mock.callCount(), 0);
  });
});
