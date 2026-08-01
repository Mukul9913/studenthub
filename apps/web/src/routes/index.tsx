import { BrowserRouter, Route, Routes } from "react-router-dom";

import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";

import { AccommodationsPage } from "@/pages/accommodation/AccommodationsPage";
import { AccommodationDetailsPage } from "@/pages/accommodation/AccommodationDetailsPage";

import { LibrariesPage } from "@/pages/library/LibrariesPage";
import { LibraryDetailsPage } from "@/pages/library/LibraryDetailsPage";

import { OwnerDashboard } from "@/pages/owner/OwnerDashboard";
import { MyListingsPage } from "@/pages/owner/MyListingsPage";
import { CreateAccommodationPage } from "@/pages/owner/CreateAccommodationPage";
import { EditAccommodationPage } from "@/pages/owner/EditAccommodationPage";
import { CreateLibraryPage } from "@/pages/owner/CreateLibraryPage";
import { EditLibraryPage } from "@/pages/owner/EditLibraryPage";

import { ProfilePage } from "@/pages/dashboard/ProfilePage";
import { SettingsPage } from "@/pages/dashboard/SettingsPage";
import { UserEnquiriesPage } from "@/pages/dashboard/UserEnquiriesPage";
import { OwnerLeadsPage } from "@/pages/owner/OwnerLeadsPage";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminListingsPage } from "@/pages/admin/AdminListingsPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminOwnersPage } from "@/pages/admin/AdminOwnersPage";
import { AdminEnquiriesPage } from "@/pages/admin/AdminEnquiriesPage";
import { ForbiddenPage } from "@/pages/ForbiddenPage";

import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/features/auth/hooks/useAuth";

function NewListingDispatcher() {
  const { user } = useAuth();
  if (user?.ownerType === "library") {
    return <CreateLibraryPage />;
  }
  return <CreateAccommodationPage />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HomePage />} />

        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forbidden" element={<ForbiddenPage />} />

        <Route path="accommodations" element={<AccommodationsPage />} />
        <Route path="accommodations/:id" element={<AccommodationDetailsPage />} />
        <Route path="accommodation/:id" element={<AccommodationDetailsPage />} />

        <Route path="libraries" element={<LibrariesPage />} />
        <Route path="libraries/:id" element={<LibraryDetailsPage />} />
        <Route path="library/:id" element={<LibraryDetailsPage />} />

        <Route
          path="dashboard/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/enquiries"
          element={
            <ProtectedRoute>
              <UserEnquiriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/listings"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <MyListingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/listings/new"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <NewListingDispatcher />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/leads"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <OwnerLeadsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/profile"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/settings"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/accommodations/new"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <NewListingDispatcher />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/accommodations/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <EditAccommodationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/libraries/new"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <CreateLibraryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/libraries/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <EditLibraryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/listings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminListingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/owners"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminOwnersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/enquiries"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminEnquiriesPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all for "Coming Soon" routes */}
        <Route path="mess" element={<NotFoundPage />} />
        <Route path="services" element={<NotFoundPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
