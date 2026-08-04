import { Router } from "express";
import {
  geocodeHandler,
  reverseGeocodeHandler,
  getNearbyListingsHandler,
  getDistanceMatrixHandler,
  getAreaSuggestionsHandler,
} from "../controllers/location.controller.js";

const router = Router();

// Simple Location & Google Places APIs
router.post("/geocode", geocodeHandler);
router.post("/reverse-geocode", reverseGeocodeHandler);
router.get("/nearby-listings", getNearbyListingsHandler);
router.post("/distance-matrix", getDistanceMatrixHandler);
router.get("/area-suggestions", getAreaSuggestionsHandler);
router.get("/places-autocomplete", getAreaSuggestionsHandler);

export { router as locationRouter };
