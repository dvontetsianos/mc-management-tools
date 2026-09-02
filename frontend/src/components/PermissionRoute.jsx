import { Navigate } from "react-router-dom";
import { getUser } from "../services/auth";

function PermissionRoute({
    children,
    permission,
    adminOnly = false
}) {

    const user = getUser();

    if (!user) {
        return <Navigate to="/" />;
    }

    if (adminOnly) {
        if (user.role !== "admin") {
            return <Navigate to="/dashboard" />;
        }

        return children;

    }

    if (user.role === "admin") {

        return children;

    }

    if (!user.permissions?.includes(permission)) {
        return <Navigate to="/dashboard" />;
    }

    return children;

}

export default PermissionRoute;