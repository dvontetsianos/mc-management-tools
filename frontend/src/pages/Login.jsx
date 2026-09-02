import { useState } from "react";
import { login, getUser } from "../services/auth";
import { APP_TITLE } from "../config";
import { Capacitor } from "@capacitor/core";



function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {

        setError("");
        
        try {

            const data = await login(username, password);

            localStorage.setItem("token", data.access_token);

            const user = getUser();
            const isQuickCountStaff = user?.role === "quickcount";

            window.location.href = (isQuickCountStaff || Capacitor.isNativePlatform()) ? "/quick-count" : "/dashboard";
        
        } catch (error) {

            setError(error.message || "Login failed. Please try again.");

        }
    };

    return (
        <div>

            <h1>{APP_TITLE}</h1>

            <h2>Login</h2>

            {error && (
                <p style={{ color: "red", textAlign: "center" }}>
                    {error}
                </p>
            )}

            <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <br />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <br />

            <button onClick={handleLogin}>
                Login
            </button>
        </div>
    );
}

export default Login;