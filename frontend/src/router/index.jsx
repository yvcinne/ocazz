import { createBrowserRouter, Navigate } from "react-router-dom";
import Acceuil from "../pages/Acceuil";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Marketplace from "../pages/Marketplace";
import Predict from "../pages/Predict";
import CarDetails from "../pages/CarDetails";
import SellYourCar from "../pages/SellYourCar";
import Messages from "../pages/Messages";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Layout from "../layouts/Layout";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminAnnonces from "../pages/admin/AdminAnnonces";
import AdminUsers from "../pages/admin/AdminUsers";
import Contact from "../pages/static/Contact";
import FAQ from "../pages/static/FAQ";
import GoogleAuthCallback from "../pages/GoogleAuthCallback";
import GoogleAuthComplete from "../pages/GoogleAuthComplete";
import { About, HowItWorks, EspaceRevendeur, Conditions, Confidentialite, CentreAide, Blog } from "../pages/static/StaticPages";

export const User_Dashboard = '/User/dashboard';

function RequireAuth({ children, redirect = "/sell" }) {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to={`/Login?redirect=${redirect}`} replace />;
    return children;
}

export const router = createBrowserRouter([
    // ── Main site (with navbar + footer) ──────────────────────────
    {
        element: <Layout />,
        children: [
            { path: "/",               element: <Acceuil /> },
            { path: "/Login",            element: <Login /> },
            { path: "/Register",         element: <Register /> },
            { path: "/forgot-password",  element: <ForgotPassword /> },
            { path: "/reset-password",   element: <ResetPassword /> },
            { path: "/auth/callback",    element: <GoogleAuthCallback /> },
            { path: "/auth/complete",    element: <GoogleAuthComplete /> },
            { path: "/Marketplace",    element: <Marketplace /> },
            { path: "/Predict",        element: <Predict /> },
            { path: "/sell",           element: <SellYourCar /> },
            { path: "/cars/:id",       element: <CarDetails /> },
            { path: "/messages",       element: <Messages /> },
            { path: "/User/Dashboard", element: <p style={{ padding: 40, fontFamily: "Manrope,sans-serif" }}>Tableau de bord utilisateur — à venir.</p> },
            { path: "/about",               element: <About /> },
            { path: "/how-it-works",        element: <HowItWorks /> },
            { path: "/espace-revendeur",    element: <EspaceRevendeur /> },
            { path: "/blog",                element: <Blog /> },
            { path: "/conditions",          element: <Conditions /> },
            { path: "/confidentialite",     element: <Confidentialite /> },
            { path: "/aide",                element: <CentreAide /> },
            { path: "/contact",             element: <Contact /> },
            { path: "/faq",                 element: <FAQ /> },
        ],
    },

    // ── Admin panel (separate layout, no navbar/footer) ────────────
    {
        element: <AdminLayout />,
        children: [
            { path: "/admin",          element: <AdminDashboard /> },
            { path: "/admin/annonces", element: <AdminAnnonces /> },
            { path: "/admin/users",    element: <AdminUsers /> },
        ],
    },

    { path: "*", element: <Navigate to="/" /> },
]);
