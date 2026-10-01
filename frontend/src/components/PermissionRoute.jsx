import { Navigate } from "react-router-dom";
import { getUser, logout } from "../services/auth";

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

        //Quickcount staff are always sent back to /quick-count from the dashboard,
        //so redirecting them there would bounce forever: show a message instead
        if (user.role === "quickcount") {
            return (
                <div style={{ padding: 24, textAlign: "center", fontFamily: "sans-serif" }}>
                    <p>Your account has no Quick Count access yet.</p>
                    <p>Ask an admin to give you F&amp;B Items or Housekeeping Items access.</p>
                    <button
                        onClick={() => {
                            logout();
                            window.location.href = "/";
                        }}
                    >
                        Log out
                    </button>
                </div>
            );
        }

        return <Navigate to="/dashboard" />;
    }

    return children;

}

export default PermissionRoute;