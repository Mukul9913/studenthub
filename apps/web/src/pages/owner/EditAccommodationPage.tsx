import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ArrowLeft, Upload, X } from "lucide-react";

import { DashboardShell, OWNER_SIDEBAR } from "../../components/layout/DashboardShell";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { INDORE_AREAS } from "../../features/accommodation/mock-data/areas";
import {
  getAccommodationById,
  updateAccommodation,
  uploadAccommodationImages,
} from "../../features/accommodation/services";
import {
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
  type BackendPropertyType,
} from "../../features/accommodation/schemas";
import { ApiError } from "../../services/api";
import { DraggableMapPicker } from "../../components/maps/DraggableMapPicker";
import {
  DEFAULT_INDORE_LAT,
  DEFAULT_INDORE_LNG,
  buildGeoLocationPayload,
  patchFromGeocode,
} from "../../lib/location-helpers";

const AMENITIES = [
  "WiFi",
  "AC",
  "Parking",
  "Power Backup",
  "Laundry",
  "Attached Bathroom",
  "Security",
  "CCTV",
  "Furnished",
  "Study Table",
];

export function EditAccommodationPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: item, isLoading } = useQuery({
    queryKey: ["accommodation", id],
    queryFn: () => getAccommodationById(id!),
    enabled: !!id,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState<BackendPropertyType>("pg");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [latitude, setLatitude] = useState(DEFAULT_INDORE_LAT);
  const [longitude, setLongitude] = useState(DEFAULT_INDORE_LNG);
  const [googlePlaceId, setGooglePlaceId] = useState<string | undefined>();
  const [formattedAddress, setFormattedAddress] = useState<string | undefined>();
  const [foodProvided, setFoodProvided] = useState(false);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description);
      const matchedType =
        PROPERTY_TYPES.find(
          (t) =>
            PROPERTY_TYPE_LABELS[t] === item.propertyType || t === item.propertyType.toLowerCase(),
        ) || "pg";
      setPropertyType(matchedType);
      setArea(item.location.area);
      setAddress(item.location.address);
      setZipCode(item.location.pincode);
      setLatitude(item.location.lat ?? DEFAULT_INDORE_LAT);
      setLongitude(item.location.lng ?? DEFAULT_INDORE_LNG);
      setFoodProvided(item.foodAvailability === "Included");
      setAmenities(item.amenities || []);
      setImages(item.images || []);
    }
  }, [item]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const combinedFiles = [...selectedFiles, ...newFiles].slice(0, 10);
    setSelectedFiles(combinedFiles);

    const urls = combinedFiles.map((f) => URL.createObjectURL(f));
    setImages([...(item?.images || []), ...urls]);
  };

  const handleSave = async () => {
    if (!id) return;
    if (!title.trim() || title.length < 3) {
      toast.error("Title must be at least 3 characters.");
      return;
    }
    if (!description.trim() || description.length < 10) {
      toast.error("Description must be at least 10 characters.");
      return;
    }
    if (!area) {
      toast.error("Area is required.");
      return;
    }
    if (!address.trim()) {
      toast.error("Address is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImages = [...images.filter((img) => !img.startsWith("blob:"))];
      if (selectedFiles.length > 0) {
        toast.loading("Uploading new photos...", { id: "edit-upload" });
        const uploaded = await uploadAccommodationImages(selectedFiles);
        finalImages = [...finalImages, ...uploaded];
        toast.dismiss("edit-upload");
      }

      await updateAccommodation(id, {
        title: title.trim(),
        description: description.trim(),
        propertyType,
        area,
        location: buildGeoLocationPayload({
          address,
          zipCode,
          latitude,
          longitude,
          googlePlaceId,
          formattedAddress,
        }),
        amenities,
        food: {
          provided: foodProvided,
          mealsIncluded: [],
        },
        images: finalImages,
      } as unknown as Parameters<typeof updateAccommodation>[1]);

      toast.success("Listing updated successfully!");
      navigate("/owner/listings");
    } catch (err) {
      toast.dismiss("edit-upload");
      if (err instanceof ApiError) {
        toast.error(err.firstFieldError);
      } else {
        toast.error("Failed to update listing.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell title="Edit accommodation" links={OWNER_SIDEBAR} currentPath={pathname}>
      {isLoading ? (
        <LoadingState />
      ) : !item ? (
        <EmptyState
          title="Listing not found"
          action={
            <Button asChild>
              <Link to="/owner/listings">Back to My Listings</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-lg font-semibold">Listing Details</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/owner/listings">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to My Listings
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 min-h-[100px]"
              />
            </div>

            <div>
              <Label>Property type</Label>
              <Select
                value={propertyType}
                onValueChange={(v) => setPropertyType(v as BackendPropertyType)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {PROPERTY_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Label className="mb-1.5 block">Pin Exact Property Location</Label>
              <DraggableMapPicker
                initialAddress={address}
                initialCity="Indore"
                initialLatitude={latitude}
                initialLongitude={longitude}
                onLocationChange={(loc) => {
                  const patch = patchFromGeocode(loc);
                  if (patch.address) setAddress(patch.address);
                  if (patch.zipCode) setZipCode(patch.zipCode);
                  setLatitude(patch.latitude);
                  setLongitude(patch.longitude);
                  setGooglePlaceId(patch.googlePlaceId);
                  setFormattedAddress(patch.formattedAddress);
                  if (patch.area) setArea(patch.area);
                }}
              />
            </div>

            <div>
              <Label>Area</Label>
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {INDORE_AREAS.map((a) => (
                    <SelectItem key={a.slug} value={a.name}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="zipCode">Zip / Pin code</Label>
              <Input
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="address">Full Street Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Auto-filled from map pin — you can still edit the street text.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-6 sm:col-span-2">
              <Checkbox
                id="food"
                checked={foodProvided}
                onCheckedChange={(v) => setFoodProvided(!!v)}
              />
              <Label htmlFor="food" className="font-medium cursor-pointer">
                Food / Meals provided
              </Label>
            </div>
          </div>

          <div>
            <Label>Amenities</Label>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {AMENITIES.map((a) => (
                <label
                  key={a}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    amenities.includes(a)
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-background"
                  }`}
                >
                  <Checkbox
                    checked={amenities.includes(a)}
                    onCheckedChange={(v) =>
                      setAmenities(v ? [...amenities, a] : amenities.filter((x) => x !== a))
                    }
                  />
                  <span>{a}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Photos</Label>
            <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 text-center transition hover:border-primary">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">Add more photos</p>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {images.map((src, i) => (
                  <div
                    key={i}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-border"
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, x) => x !== i))}
                      className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-background/90 text-destructive shadow"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" asChild>
              <Link to="/owner/listings">Cancel</Link>
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              <Check className="mr-1.5 h-4 w-4" /> {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
