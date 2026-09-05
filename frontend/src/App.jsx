import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/PageLoader';
import PageTransition from './components/PageTransition';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Generate = lazy(() => import('./pages/Generate'));
const History = lazy(() => import('./pages/History'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Pricing = lazy(() => import('./pages/Pricing'));

function wrap(element) {
  return <PageTransition>{element}</PageTransition>;
}

export default function App() {
  const location = useLocation();

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/generate" replace />} />
            <Route path="/login" element={wrap(<Login />)} />
            <Route path="/register" element={wrap(<Register />)} />
            <Route path="/verify-email" element={wrap(<VerifyEmail />)} />
            <Route path="/forgot-password" element={wrap(<ForgotPassword />)} />
            <Route path="/reset-password" element={wrap(<ResetPassword />)} />
            <Route path="/generate" element={<ProtectedRoute>{wrap(<Generate />)}</ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute>{wrap(<History />)}</ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute>{wrap(<Dashboard />)}</ProtectedRoute>} />
            <Route path="/pricing" element={<ProtectedRoute>{wrap(<Pricing />)}</ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </Layout>
  );
}