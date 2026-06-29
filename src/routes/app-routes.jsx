import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AuthRoute from "./auth-route";
import ProtectedRoute from "./protected-route";
import Login from "@/app/auth/login";
import NotFound from "@/app/errors/not-found";
import Settings from "@/app/setting/setting";
import ErrorBoundary from "@/components/error-boundry/error-boundry";
import LoadingBar from "@/components/loader/loading-bar";
import Register from "@/app/auth/Register";

// Dashboard & Profile
const Home = lazy(() => import("@/pages/dashboard/Home"));
const Maintenance = lazy(() => import("@/pages/maintenance/Maintenance"));
const Profile = lazy(() => import("@/pages/profile/Profile"));

// Membership
const LifeTimeMemberList = lazy(
  () => import("@/pages/lifeTimeMember/LifeTimeMemberList"),
);
const PatronMemberList = lazy(
  () => import("@/pages/patronMember/PatronMemberList"),
);
const NewRegisterList = lazy(
  () => import("@/pages/newRegister/NewRegisterList"),
);
const PendingMidList = lazy(() => import("@/pages/pendingMid/PendingMidList"));

// Community Focus
const MahilaList = lazy(() => import("@/pages/mahila/MahilaList"));
const SamajList = lazy(() => import("@/pages/samaj/SamajList"));
const Developer = lazy(() => import("@/pages/developer/Developer"));

// Family Members
const FamilyMemberList = lazy(
  () => import("@/pages/familyMember/FamilyMemberList"),
);
const AddFamilyMember = lazy(
  () => import("@/pages/familyMember/AddFamilyMember"),
);
const EditFamilyMember = lazy(
  () => import("@/pages/familyMember/EditFamilyMember"),
);

// Common Member Pages
const MemberView = lazy(() => import("@/pages/commonPage/MemberView"));
const MemberEdit = lazy(() => import("@/pages/commonPage/MemberEdit"));
const NewMidAssign = lazy(() => import("@/pages/commonPage/NewMidAssign"));

// Reports & Printing
const DownloadReport = lazy(() => import("@/pages/download/Download"));
const MemberPrint = lazy(() => import("@/pages/commonPage/MemberPrint"));

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<AuthRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/maintenance" element={<Maintenance />} />
        </Route>

        <Route path="/" element={<ProtectedRoute />}>
          <Route
            path="/home"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Home />
              </Suspense>
            }
          />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route
            path="/developer"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Developer />
              </Suspense>
            }
          />
          <Route
            path="/profile"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Profile />
              </Suspense>
            }
          />

          {/* Membership Routes */}
          <Route
            path="/life-time-member"
            element={
              <Suspense fallback={<LoadingBar />}>
                <LifeTimeMemberList />
              </Suspense>
            }
          />
          <Route
            path="/patron-member"
            element={
              <Suspense fallback={<LoadingBar />}>
                <PatronMemberList />
              </Suspense>
            }
          />
          <Route
            path="/new-register"
            element={
              <Suspense fallback={<LoadingBar />}>
                <NewRegisterList />
              </Suspense>
            }
          />
          <Route
            path="/pending-mid"
            element={
              <Suspense fallback={<LoadingBar />}>
                <PendingMidList />
              </Suspense>
            }
          />

          {/* Community Routes */}
          <Route
            path="/mahila"
            element={
              <Suspense fallback={<LoadingBar />}>
                <MahilaList />
              </Suspense>
            }
          />
          <Route
            path="/samaj"
            element={
              <Suspense fallback={<LoadingBar />}>
                <SamajList />
              </Suspense>
            }
          />

          {/* Family Member Routes */}
          <Route
            path="/family-member"
            element={
              <Suspense fallback={<LoadingBar />}>
                <FamilyMemberList />
              </Suspense>
            }
          />
          <Route
            path="/add-family-member"
            element={
              <Suspense fallback={<LoadingBar />}>
                <AddFamilyMember />
              </Suspense>
            }
          />
          <Route
            path="/family-edit/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <EditFamilyMember />
              </Suspense>
            }
          />

          {/* Common Member Detail Routes */}
          <Route
            path="/member-view/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <MemberView />
              </Suspense>
            }
          />
          <Route
            path="/member-edit/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <MemberEdit />
              </Suspense>
            }
          />
          <Route
            path="/new-mid-assign/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <NewMidAssign />
              </Suspense>
            }
          />

          {/* Reports */}
          <Route
            path="/download"
            element={
              <Suspense fallback={<LoadingBar />}>
                <DownloadReport />
              </Suspense>
            }
          />

          <Route
            path="/member-print/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <MemberPrint />
              </Suspense>
            }
          />

          <Route
            path="/settings"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Settings />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default AppRoutes;
