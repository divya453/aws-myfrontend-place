import React, { useEffect } from "react";
import { useNavigate, useRoutes, useLocation, Navigate } from "react-router-dom";

// Pages
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import CreateRepo from "./components/repo/CreateRepo";
import Issues from "./components/issue/issue";
import RepoPage from "./components/repo/RepoPage";

// Auth Context
import { useAuth } from "./authContext";

// ── Protected Route wrapper ────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/auth" replace />;
  return children;
};

// ── Main Routes ────────────────────────────────────────────────────────────
const ProjectRoutes = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync localStorage → context once on mount
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId && !currentUser) {
      setCurrentUser(userId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auth guard — runs when path or auth state changes
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const onAuthPage = ["/auth", "/signup"].includes(location.pathname);

    if (!userId && !onAuthPage) {
      navigate("/auth", { replace: true });
    }

    if (userId && onAuthPage) {
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);

  const element = useRoutes([
    // Public routes
    { path: "/auth",   element: <Login />  },
    { path: "/signup", element: <Signup /> },

    // Protected routes
    {
      path: "/",
      element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
    },
    {
      path: "/profile/:userId",
      element: <ProtectedRoute><Profile /></ProtectedRoute>,
    },
    {
      path: "/repo/create",
      element: <ProtectedRoute><CreateRepo /></ProtectedRoute>,
    },
    {
      path: "/issues/:userId",
      element: <ProtectedRoute><Issues /></ProtectedRoute>,
    },
    {
      path: "/repo/:repoId",
      element: <ProtectedRoute><RepoPage /></ProtectedRoute>,
    },

    // 404
    {
      path: "*",
      element: <div style={{ padding: "2rem" }}>404 — Page not found</div>,
    },
  ]);

  return element;
};

export default ProjectRoutes;