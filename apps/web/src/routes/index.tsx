import { BrowserRouter, Route, Routes } from "react-router-dom";

import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ComingSoonState } from "@/components/common/ComingSoonState";

import { AccommodationsPage } from "@/pages/accommodation/AccommodationsPage";
import { AccommodationDetailsPage } from "@/pages/accommodation/AccommodationDetailsPage";

import { LibrariesPage } from "@/pages/library/LibrariesPage";
import { LibraryDetailsPage } from "@/pages/library/LibraryDetailsPage";

import { MessesPage } from "@/pages/mess/MessesPage";
import { MessDetailsPage } from "@/pages/mess/MessDetailsPage";

import { OwnerDashboard } from "@/pages/owner/OwnerDashboard";
import { MyListingsPage } from "@/pages/owner/MyListingsPage";
import { CreateAccommodationPage } from "@/pages/owner/CreateAccommodationPage";
import { EditAccommodationPage } from "@/pages/owner/EditAccommodationPage";
import { CreateLibraryPage } from "@/pages/owner/CreateLibraryPage";
import { EditLibraryPage } from "@/pages/owner/EditLibraryPage";
import { CreateMessPage } from "@/pages/owner/CreateMessPage";
import { EditMessPage } from "@/pages/owner/EditMessPage";

import { ProfilePage } from "@/pages/dashboard/ProfilePage";
import { SettingsPage } from "@/pages/dashboard/SettingsPage";
import { UserEnquiriesPage } from "@/pages/dashboard/UserEnquiriesPage";
import { OwnerLeadsPage } from "@/pages/owner/OwnerLeadsPage";
import { OwnerSubscriptionPage } from "@/pages/owner/OwnerSubscriptionPage";
import { PublicOwnerProfilePage } from "@/pages/owner/PublicOwnerProfilePage";
import { OwnerReviewAnalyticsPage } from "@/pages/owner/OwnerReviewAnalyticsPage";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminListingsPage } from "@/pages/admin/AdminListingsPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminOwnersPage } from "@/pages/admin/AdminOwnersPage";
import { AdminEnquiriesPage } from "@/pages/admin/AdminEnquiriesPage";
import { AdminModerationPage } from "@/pages/admin/AdminModerationPage";
import { AdminSearchAnalyticsPage } from "@/pages/admin/AdminSearchAnalyticsPage";
import { AdminMonetizationPage } from "@/pages/admin/AdminMonetizationPage";
import { AdminReviewModerationPage } from "@/pages/admin/AdminReviewModerationPage";
import { AdminCRMAnalyticsPage } from "@/pages/admin/AdminCRMAnalyticsPage";
import { ForbiddenPage } from "@/pages/ForbiddenPage";
import { StudentPreferencesPage } from "@/pages/dashboard/StudentPreferencesPage";
import { OwnerCRMPage } from "@/pages/owner/OwnerCRMPage";
import { OwnerListingAnalyticsPage } from "@/pages/owner/OwnerListingAnalyticsPage";

import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { OtpVerificationPage } from "@/pages/auth/OtpVerificationPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/features/auth/hooks/useAuth";

function NewListingDispatcher() {
  const { user } = useAuth();
  if (user?.ownerType === "library") {
    return <CreateLibraryPage />;
  }
  if (user?.ownerType === "mess") {
    return <CreateMessPage />;
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
        <Route path="verify-otp" element={<OtpVerificationPage />} />
        <Route path="forbidden" element={<ForbiddenPage />} />

        <Route path="accommodations" element={<AccommodationsPage />} />
        <Route path="accommodations/:id" element={<AccommodationDetailsPage />} />
        <Route path="accommodation/:id" element={<AccommodationDetailsPage />} />

        <Route path="libraries" element={<LibrariesPage />} />
        <Route path="libraries/:id" element={<LibraryDetailsPage />} />
        <Route path="library/:id" element={<LibraryDetailsPage />} />

        <Route path="mess" element={<MessesPage />} />
        <Route path="mess/:slug" element={<MessDetailsPage />} />

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
          path="owner/subscription"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <OwnerSubscriptionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/reviews"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <OwnerReviewAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/crm"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <OwnerCRMPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/listing-analytics"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <OwnerListingAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/preferences"
          element={
            <ProtectedRoute>
              <StudentPreferencesPage />
            </ProtectedRoute>
          }
        />
        <Route path="owner/profile/:id" element={<PublicOwnerProfilePage />} />
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
          path="owner/mess/new"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <CreateMessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/mess/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <EditMessPage />
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
        <Route
          path="admin/moderation"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminModerationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/search-analytics"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSearchAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/monetization"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminMonetizationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/reviews"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminReviewModerationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/crm-analytics"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminCRMAnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all for "Coming Soon" routes */}
        <Route
          path="services"
          element={
            <ComingSoonState
              title="Local Services"
              description="Essential local services discovery is coming soon."
            />
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
