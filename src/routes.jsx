import { BrowserRouter, Routes, Route } from "react-router-dom";

import {
  SignUpPage,
  SignInPage,
  Verification,
  CreatePassword,
  ForgotPassword,
  ResetPassword,
  VerifyUser,
  Profile,
  ViewModel,
  Setting,
  Chats,
  HomeV1,
  MapsDashboard,
  UnderReview,
  AcceptInvitation,
  Users,
  UsersHistory,
  VisualizePage,
} from "./pages";

import {
  AuthLayout,
  RootLayout,
  AppLayout,
  GuestLayout,
  DashboardLayout,
  ChatsLayout,
  AppWrapper,
} from "./layouts";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route path="auth" element={<AuthLayout />}>
            <Route path="sign-up" element={<SignUpPage />} />
            <Route path="sign-in" element={<SignInPage />} />
            <Route path="create-password" element={<CreatePassword />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="verify" element={<VerifyUser />} />
            <Route path="accept-invitation" element={<AcceptInvitation />} />
          </Route>

          <Route path="guidance" element={<GuestLayout />}>
            <Route path="verification" element={<Verification />} />
          </Route>

          <Route element={<GuestLayout />}>
            <Route index element={<HomeV1 />} />
          </Route>

          <Route element={<AppLayout />}>
            <Route
              path="profile"
              element={
                <div className="px-4">
                  <Profile />
                </div>
              }
            />
          </Route>

          <Route element={<AppWrapper />}>
            <Route path="chats" element={<ChatsLayout />}>
              <Route index element={<Chats />} />
            </Route>

            <Route path="visualize" element={<VisualizePage />} />

            <Route path="maps" element={<MapsDashboard />} />


            <Route path="dashboard" element={<DashboardLayout />}>
              <Route path="profile" element={<Profile />} />
              <Route path="users" element={<Users />} />
              <Route path="history" element={<UsersHistory />} />

              <Route path="setting">
                <Route index element={<Setting />} />
                {/* <Route path=":aiModelId" element={<ViewModel />} /> */}
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
