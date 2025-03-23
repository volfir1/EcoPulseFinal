// src/routes/routes.js
import PeerToPeerAdmin from '@admin/peer/Peer';
import Onboarding from '@features/auth/components/register/onBoarding';
import { lazy } from 'react';

// Public Routes
export const publicRoutes = {
  LandingPage: lazy(() => import('@features/LandingPage')),
  Login: lazy(() => import('@features/auth/components/login/Login')),
  Register: lazy(() => import('@features/auth/components/register/Register')),
  VerifyEmail: lazy(() => import('@features/auth/verification/VerifiEmail')),
  ForgotPassword: lazy(() => import('@features/auth/password/ForgotPassword.jsx')),
  ResetPassword: lazy(() => import('@features/auth/password/ResetPassword.jsx')),
  // New account deactivation routes
  AccountRecovery: lazy(() => import('@features/auth/components/recover.js')),
  Onboarding: lazy(() => import('@features/auth/components/register/onBoarding')),
  ReactivateAccount: lazy(() => import('@features/auth/components/recover.js')),
  AccountDeactivated: () => null,
  DownloadApp: lazy(() => import('@features/Landing/Download/AppDownload')),
  
};

// User Dashboard & Features
export const userRoutes = {
  Dashboard: lazy(()=> import('@features/dashboard/UserDashboard')),
  EnergySharing: lazy(() => import('@features/energy-sharing/components/Dashboard.jsx')),
  HelpSupport: lazy(() => import('@features/help-support/components/help-support')),
  Recommendations: lazy(() => import('@features/recommendations/components/Recommnedation')),
  UserProfile: lazy(() => import('@features/profile/UserProfile')), 
  UserMails: lazy(() => import('@features/help-support/components/mail/UserMails')),
  TicketConversation: lazy(() => import('@features/help-support/components/mail/TicketConversation'))
};

// Energy Modules
export const moduleRoutes = {
  Solar: lazy(() => import('@modules/Solar/Solar')),
  Wind: lazy(() => import('@modules/Wind/Wind')),
  Geo: lazy(() => import('@modules/Geo/Geothermal')),
  Hydro: lazy(() => import('@modules/Hydro/Hydropower')),
  Biomass: lazy(() => import('@modules/Biomass/Biomass'))
};

// Admin Routes
export const adminRoutes = {
  Dashboard: lazy(() => import('@admin/dashboard/AdminDashboard.jsx')),
  Analytics: lazy(() => import('@admin/analytics/AdminAnalytics')),
  UserManagement: lazy(() => import('@admin/users/UserControl.jsx')),
  UserProfile: lazy(() => import('@features/profile/UserProfile')),  // Same component for admin profile
  SolarAdmin: lazy(() => import('@admin/modules/Solar/SolarAdmin')),
  WindAdmin: lazy(() => import('@admin/modules/Wind/WindAdmin')),
  GeoAdmin: lazy(() => import('@admin/modules/Geo/GeoAdmin')),
  HydroAdmin: lazy(() => import('@admin/modules/Hydro/HydroAdmin')),
  BioAdmin: lazy(() => import('@admin/modules/Bio/BioAdmin')),
  Peer: lazy(() => import('@admin/peer/Peer')),
  Input: lazy(() => import('@admin/modules/input/renewablePage')),
  AddRecord: lazy(() => import('@admin/modules/input/moduleInput')),
  // Ticket management routes
  AdminDetailView: lazy(() => import('@admin/ticket/TicketDetail/AdminDetailView')),
  AdminTicket: lazy(() => import('@admin/ticket/AdminTicket')),
  TicketDashboard: lazy(() => import('@admin/ticket/TicketDashboard')),
  Recommendations: lazy(() => import('@admin/recommendation/Recommendation')),
  AdminMonitor: lazy(() => import('@admin/monitoring/monitor'))
};

// Error Pages
export const errorRoutes = {
  NotFound: lazy(() => import('@exceptions/404/404'))
};