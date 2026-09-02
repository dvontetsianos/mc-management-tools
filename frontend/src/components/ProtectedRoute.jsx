import { Navigate, useLocation } from "react-router-dom";
import { getUser } from "../services/auth";

function ProtectedRoute({ children }) {

    const token = localStorage.getItem("token");
    const routerLocation = useLocation();

    if (!token) {
        return <Navigate to="/" />;
    }

    const user = getUser();

    if (user?.role === "quickcount" && !routerLocation.pathname.startsWith("/quick-count")) {
        return <Navigate to="/quick-count" />;
    }

    return children;
}

export default ProtectedRoute;