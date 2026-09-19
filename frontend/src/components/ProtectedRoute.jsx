import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getUser, logout } from "../services/auth";

function ProtectedRoute({ children }) {

    const token = localStorage.getItem("token");
    const routerLocation = useLocation();
    const navigate = useNavigate();

    useEffect(() => {

        const checkSession = () => {
            if (!getUser()) {
                logout();
                navigate("/");
            }
        };

        const interval = setInterval(checkSession, 1000);

        return () => clearInterval(interval);

    }, [navigate]);

    if (!token) {
        return <Navigate to="/" />;
    }

    const user = getUser();

    if (!user) {
        return <Navigate to="/" />;
    }

    if (user?.role === "quickcount" && !routerLocation.pathname.startsWith("/quick-count")) {
        return <Navigate to="/quick-count" />;
    }

    return children;
}

export default ProtectedRoute;