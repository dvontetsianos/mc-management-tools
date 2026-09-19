import { Navigate } from "react-router-dom";
import { getUser } from "../services/auth";

function PermissionRoute({
    children,
    permission,
    permissions,
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

    const requiredPermissions = permissions || (permission ? [permission] : []);

    const hasAccess = requiredPermissions.some((p) =>
        user.permissions?.includes(p)
    );

    if (!hasAccess) {
        return <Navigate to="/dashboard" />;
    }

    return children;

}

export default PermissionRoute;