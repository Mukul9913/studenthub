# Location Intelligence & Education Ecosystem System Documentation

## Executive Overview

StudentHub's Location Intelligence System is designed specifically for **Students, Aspirants, and Young Professionals**. Unlike standard real-estate portals, location discovery on StudentHub centers around **Education Centers** (Coaching Institutes, Colleges, Universities) and **Study Zones** (Bhawarkua, Vijay Nagar, Palasia, LIG, Geeta Bhawan).

Students search for accommodations and libraries relative to their institute (e.g., _"Library near Physics Wallah"_, _"PG near Drishti IAS"_, _"Hostel near DAVV"_).

---

## Technical Architecture

### 1. Future-Proof Provider Abstraction Layer

All geospatial interactions are abstracted behind standard interfaces:

- `ILocationProvider`: Defines `geocode()`, `reverseGeocode()`, `calculateDistanceMatrix()`, and `getPlaceSuggestions()`.
- `GoogleMapsProvider`: Production Google Maps implementation with fail-safe Haversine straight-line fallbacks.
- **Provider Swap Ready**: Mapbox, OpenStreetMap (Nominatim/OSRM), or Leaflet can be swapped by implementing `ILocationProvider` without touching any controllers, models, or UI components.

### 2. GeoJSON & MongoDB 2dsphere Indexing

Every `Library`, `Property`, `EducationCenter`, and `StudyZone` model stores location using standard GeoJSON `Point`:

```json
{
  "location": {
    "type": "Point",
    "coordinates": [75.8676, 22.6926] // [longitude, latitude]
  }
}
```

Indexed via Mongoose:

```typescript
schema.index({ "location.coordinates": "2dsphere" });
```

Spatial queries utilize `$near` and `$maxDistance`:

```typescript
const nearbyListings = await LibraryModel.find({
  status: "APPROVED",
  "location.coordinates": {
    $near: {
      $geometry: { type: "Point", coordinates: [lng, lat] },
      $maxDistance: radiusMeters, // 500m to 20,000m
    },
  },
});
```

---

## Key Backend APIs

| Endpoint                                 | Method       | Role           | Description                                                             |
| :--------------------------------------- | :----------- | :------------- | :---------------------------------------------------------------------- |
| `/api/location/geocode`                  | `POST`       | Public         | Converts address & city to lat/lng and formatted Google Place metadata  |
| `/api/location/reverse-geocode`          | `POST`       | Public         | Converts lat/lng coordinates to human-readable address                  |
| `/api/location/nearby-listings`          | `GET`        | Public         | Finds nearby libraries & PGs within 500m - 20km radius with travel time |
| `/api/location/distance-matrix`          | `POST`       | Public         | Calculates walking/cycling/driving travel times and distance matrix     |
| `/api/location/area-suggestions`         | `GET`        | Public         | Fast autocomplete suggestions for areas, institutes, and landmarks      |
| `/api/location/education-centers`        | `GET / POST` | Public / Admin | List education centers or add new institute                             |
| `/api/location/education-centers/import` | `POST`       | Admin          | Bulk CSV/JSON import of coaching institutes & colleges                  |
| `/api/location/study-zones`              | `GET / POST` | Public / Admin | List and manage student study zones                                     |

---

## Google Cloud Platform Setup Guide

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a Project** -> **New Project**.
3. Name your project: `StudentHub-Location-Engine`.

### Step 2: Enable Required APIs

Enable the following 4 APIs in **APIs & Services -> Library**:

1. **Maps JavaScript API** (For interactive frontend map canvas)
2. **Places API** (For autocomplete suggestions)
3. **Geocoding API** (For automatic address-to-lat/lng conversion)
4. **Distance Matrix API** (For walking & travel time calculations)

### Step 3: Create and Restrict API Keys

1. Go to **APIs & Services -> Credentials**.
2. Click **Create Credentials -> API Key**.

#### Security Restrictions (Critical):

- **Application Restrictions (Frontend Key)**:
  - Select **HTTP referrers (web sites)**.
  - Add your website domains:
    - `https://studenthub.in/*`
    - `https://*.studenthub.in/*`
    - `http://localhost:5173/*`
- **Application Restrictions (Backend Key)**:
  - Select **IP addresses (web servers)**.
  - Add your backend production server IP addresses.
- **API Restrictions**:
  - Restrict key to only: Maps JavaScript API, Places API, Geocoding API, Distance Matrix API.

---

## Environment Variables

### Backend (`apps/api/.env`):

```env
GOOGLE_MAPS_API_KEY=AIzaSy...
# Service-specific overrides (Optional, defaults to GOOGLE_MAPS_API_KEY)
GOOGLE_GEOCODING_API_KEY=AIzaSy...
GOOGLE_PLACES_API_KEY=AIzaSy...
GOOGLE_DISTANCE_MATRIX_API_KEY=AIzaSy...
```

### Frontend (`apps/web/.env`):

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```
