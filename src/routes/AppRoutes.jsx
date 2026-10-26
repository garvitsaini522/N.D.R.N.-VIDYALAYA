import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PortalLayout from '../components/layout/PortalLayout';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { PageLoader } from '../components/common/LoadingState';
import { ErrorBoundary } from '../components/common/ErrorState';

// Public Pages
const Home = lazy(() => import('../pages/public/Home'));
const About = lazy(() => import('../pages/public/About'));
const Academics = lazy(() => import('../pages/public/Academics'));
const Admissions = lazy(() => import('../pages/public/Admissions'));
const Faculty = lazy(() => import('../pages/public/Faculty'));
const Events = lazy(() => import('../pages/public/Events'));
const Gallery = lazy(() => import('../pages/public/Gallery'));
const Notices = lazy(() => import('../pages/public/Notices'));
const Contact = lazy(() => import('../pages/public/Contact'));
const NotFound = lazy(() => import('../pages/public/NotFound'));

// Auth Portals
const Login = lazy(() => import('../pages/auth/Login'));
const AdminLogin = lazy(() => import('../pages/auth/AdminLogin'));

// Student & Parent Portal Pages
const StudentDashboard = lazy(() => import('../pages/student/Dashboard'));
const ParentDashboard = lazy(() => import('../pages/parent/Dashboard'));
const PortalProfile = lazy(() => import('../pages/portal/Profile'));
const PortalAttendance = lazy(() => import('../pages/portal/Attendance'));
const PortalHomework = lazy(() => import('../pages/portal/Homework'));
const PortalResults = lazy(() => import('../pages/portal/Results'));
const PortalFees = lazy(() => import('../pages/portal/Fees'));
const PortalTimetable = lazy(() => import('../pages/portal/Timetable'));
const PortalNotices = lazy(() => import('../pages/portal/Notices'));
const PortalEvents = lazy(() => import('../pages/portal/Events'));
const PortalDownloads = lazy(() => import('../pages/portal/Downloads'));

// Faculty / Teacher Portal Pages
const TeacherDashboard = lazy(() => import('../pages/teacher/Dashboard'));

// Admin & Staff Management Pages
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminAdmissions = lazy(() => import('../pages/admin/Admissions'));
const AdminStudents = lazy(() => import('../pages/admin/Students'));
const AdminParents = lazy(() => import('../pages/admin/Parents'));
const AdminTeachers = lazy(() => import('../pages/admin/Teachers'));
const AdminAcademics = lazy(() => import('../pages/admin/Academics'));
const AdminNoticesManager = lazy(() => import('../pages/admin/NoticesManager'));
const AdminEvents = lazy(() => import('../pages/admin/Events'));
const AdminGalleryManager = lazy(() => import('../pages/admin/GalleryManager'));
const AdminFeeManagement = lazy(() => import('../pages/admin/FeeManagement'));
const AdminFeeStructureManager = lazy(() => import('../pages/admin/FeeStructureManager'));
const AdminAttendanceTracker = lazy(() => import('../pages/admin/AttendanceTracker'));
const AdminMessages = lazy(() => import('../pages/admin/Messages'));
const AdminSettings = lazy(() => import('../pages/admin/Settings'));

import { PortalProvider } from '../context/PortalContext';
import { useAuth } from '../context/AuthContext';

function PortalRootRouter() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (user?.role === 'parent') return <Navigate to="/parent/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader text="Loading N.D.R.N. Vidyalaya..." />}>
        <Routes>
          {/* Main Public Website Shell */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="academics" element={<Academics />} />
            <Route path="admissions" element={<Admissions />} />
            <Route path="faculty" element={<Faculty />} />
            <Route path="events" element={<Events />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="notices" element={<Notices />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Standalone Authentication Portals */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Shared Portal Root */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute allowedRoles={['student', 'parent', 'teacher']}>
                <PortalProvider>
                  <PortalLayout />
                </PortalProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<PortalRootRouter />} />
            <Route path="profile" element={<PortalProfile />} />
            <Route path="attendance" element={<PortalAttendance />} />
            <Route path="homework" element={<PortalHomework />} />
            <Route path="timetable" element={<PortalTimetable />} />
            <Route path="results" element={<PortalResults />} />
            <Route path="academics" element={<PortalResults />} />
            <Route path="fees" element={<PortalFees />} />
            <Route path="notices" element={<PortalNotices />} />
            <Route path="events" element={<PortalEvents />} />
            <Route path="downloads" element={<PortalDownloads />} />
          </Route>

          {/* Student Dedicated Portal (Protected - Student Role Only) */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PortalProvider>
                  <PortalLayout />
                </PortalProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<PortalProfile />} />
            <Route path="attendance" element={<PortalAttendance />} />
            <Route path="homework" element={<PortalHomework />} />
            <Route path="timetable" element={<PortalTimetable />} />
            <Route path="results" element={<PortalResults />} />
            <Route path="academics" element={<PortalResults />} />
            <Route path="fees" element={<PortalFees />} />
            <Route path="notices" element={<PortalNotices />} />
            <Route path="events" element={<PortalEvents />} />
            <Route path="downloads" element={<PortalDownloads />} />
          </Route>

          {/* Parent Dedicated Portal (Protected - Parent Role Only) */}
          <Route
            path="/parent"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <PortalProvider>
                  <PortalLayout />
                </PortalProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/parent/dashboard" replace />} />
            <Route path="dashboard" element={<ParentDashboard />} />
            <Route path="profile" element={<PortalProfile />} />
            <Route path="attendance" element={<PortalAttendance />} />
            <Route path="homework" element={<PortalHomework />} />
            <Route path="timetable" element={<PortalTimetable />} />
            <Route path="results" element={<PortalResults />} />
            <Route path="academics" element={<PortalResults />} />
            <Route path="fees" element={<PortalFees />} />
            <Route path="notices" element={<PortalNotices />} />
            <Route path="events" element={<PortalEvents />} />
            <Route path="downloads" element={<PortalDownloads />} />
          </Route>

          {/* Teacher Dedicated Portal (Protected - Teacher Role Only) */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <PortalProvider>
                  <PortalLayout />
                </PortalProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
          </Route>

          {/* Admin & Staff Management Console (Protected) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="admissions" element={<AdminAdmissions />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="parents" element={<AdminParents />} />
            <Route path="teachers" element={<AdminTeachers />} />
            <Route path="academics" element={<AdminAcademics />} />
            <Route path="attendance" element={<AdminAttendanceTracker />} />
            <Route path="fees" element={<AdminFeeManagement />} />
            <Route path="fee-structure" element={<AdminFeeStructureManager />} />
            <Route path="notices" element={<AdminNoticesManager />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="gallery" element={<AdminGalleryManager />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
