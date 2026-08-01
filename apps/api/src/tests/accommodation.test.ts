/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from "node:assert";
import { describe, it } from "node:test";
import mongoose from "mongoose";

import { PropertyModel } from "../models/property.model.js";
import { RoomModel } from "../models/room.model.js";

describe("PropertyModel Unit Tests", () => {
  it("should validate a correct property document", async () => {
    const property = new PropertyModel({
      ownerId: new mongoose.Types.ObjectId(),
      title: "Premium Girls PG Vijay Nagar",
      description: "A secure and high-end accommodation for students and working professionals.",
      propertyType: "pg",
      location: {
        address: "123, Vijay Nagar Near C21 Mall",
        city: "Indore",
        state: "Madhya Pradesh",
        zipCode: "452010",
        coordinates: {
          type: "Point",
          coordinates: [75.8975, 22.7533], // [longitude, latitude] for Indore
        },
      },
      area: "Vijay Nagar",
      nearbyColleges: [{ name: "SGSITS", distanceKm: 2.5 }],
      nearbyCompanies: [{ name: "TCS", distanceKm: 4.2 }],
      amenities: ["wi_fi", "cctv", "power_backup"],
      food: {
        provided: true,
        mealsIncluded: ["breakfast", "dinner"],
        monthlyCharges: 2000,
      },
      images: ["https://example.com/img1.jpg"],
    });

    const error = await property.validate().catch((err) => err);
    assert.strictEqual(error, undefined);
  });

  it("should fail validation if required fields are missing", async () => {
    const property = new PropertyModel({});

    try {
      await property.validate();
      assert.fail("Should have failed validation");
    } catch (err: any) {
      assert.ok(err.errors.ownerId);
      assert.ok(err.errors.title);
      assert.ok(err.errors.description);
      assert.ok(err.errors.propertyType);
      assert.ok(err.errors["location.address"]);
      assert.ok(err.errors["location.city"]);
      assert.ok(err.errors.area);
    }
  });

  it("should fail if coordinates coordinates validation fails", async () => {
    const property = new PropertyModel({
      ownerId: new mongoose.Types.ObjectId(),
      title: "Premium PG",
      description: "A secure PG",
      propertyType: "pg",
      location: {
        address: "Vijay Nagar",
        city: "Indore",
        state: "MP",
        zipCode: "452010",
        coordinates: {
          type: "Point",
          coordinates: [200, 45], // Invalid longitude > 180
        },
      },
      area: "Vijay Nagar",
    });

    try {
      await property.validate();
      assert.fail("Should have failed coordinates validation");
    } catch (err: any) {
      assert.ok(err.errors["location.coordinates.coordinates"]);
    }
  });

  it("should fail if propertyType is invalid", async () => {
    const property = new PropertyModel({
      ownerId: new mongoose.Types.ObjectId(),
      title: "Premium PG",
      description: "A secure PG",
      propertyType: "hotel-luxury" as any, // Invalid
      location: {
        address: "Vijay Nagar",
        city: "Indore",
        state: "MP",
        zipCode: "452010",
        coordinates: {
          type: "Point",
          coordinates: [75.8975, 22.7533],
        },
      },
      area: "Vijay Nagar",
    });

    try {
      await property.validate();
      assert.fail("Should have failed propertyType validation");
    } catch (err: any) {
      assert.ok(err.errors.propertyType);
    }
  });
});

describe("RoomModel Unit Tests", () => {
  it("should validate a correct room document", async () => {
    const room = new RoomModel({
      propertyId: new mongoose.Types.ObjectId(),
      roomType: "shared",
      sharingCount: 2,
      rent: 6500,
      deposit: 13000,
      genderPreference: "girls",
      amenities: ["ac", "attached_bathroom"],
      totalBeds: 2,
      availableBeds: 1,
      availableFrom: new Date(),
    });

    const error = await room.validate().catch((err) => err);
    assert.strictEqual(error, undefined);
  });

  it("should fail validation if sharingCount is not 1 for private room type", async () => {
    const room = new RoomModel({
      propertyId: new mongoose.Types.ObjectId(),
      roomType: "private",
      sharingCount: 2, // Invalid for private
      rent: 12000,
      deposit: 24000,
      genderPreference: "unisex",
      totalBeds: 1,
      availableBeds: 1,
    });

    try {
      await room.validate();
      assert.fail("Should have failed sharingCount validation for private room");
    } catch (err: any) {
      assert.ok(err.errors.sharingCount);
      assert.strictEqual(
        err.errors.sharingCount.message,
        "Private rooms must have a sharing count of exactly 1",
      );
    }
  });

  it("should fail validation if availableBeds exceeds totalBeds", async () => {
    const room = new RoomModel({
      propertyId: new mongoose.Types.ObjectId(),
      roomType: "shared",
      sharingCount: 3,
      rent: 5000,
      deposit: 10000,
      genderPreference: "boys",
      totalBeds: 3,
      availableBeds: 4, // Invalid: exceeds totalBeds
    });

    try {
      await room.validate();
      assert.fail("Should have failed availableBeds validation");
    } catch (err: any) {
      assert.ok(err.errors.availableBeds);
      assert.strictEqual(
        err.errors.availableBeds.message,
        "Available beds cannot exceed total beds",
      );
    }
  });
});
