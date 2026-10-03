import { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    IconButton,
    InputAdornment,
    CircularProgress
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Capacitor } from "@capacitor/core";
import { login, getUser } from "../services/auth";
import { APP_TITLE } from "../config";
import loginPhoto from "../assets/marbellaelixbg.jpg";



const NAVY = "#080125";


//turns the backend/browser error into something a counter understands
function friendlyError(error) {

    const message = error?.message || "";

    if (message === "Failed to fetch" || message.includes("NetworkError")) {
        return "Can't reach the server. Check the Wi-Fi and try again.";
    }

    if (message.toLowerCase().includes("invalid credentials")) {
        return "Invalid Credentials\n¯\\_( ͡° ͜ʖ ͡°)_/¯";
    }

    return message || "Login failed. Please try again.";
}


//logo + app name, used by every style
function Brand({ size = 64 }) {

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, mb: 3 }}>
            <Box
                component="img"
                src="/MC.png"
                alt=""
                sx={{ height: size, width: "auto", display: "block" }}
            />
            <Typography
                component="h1"
                sx={{
                    m: 0,
                    fontSize: { xs: "1.35rem", sm: "1.6rem" },
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                    textAlign: "center",
                    color: NAVY
                }}
            >
                {APP_TITLE}
            </Typography>
            <Typography
                sx={{
                    fontSize: "0.85rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "text.secondary"
                }}
            >
                Marbella Collection
            </Typography>
        </Box>
    );
}


//username, password, button and error: the same in every style
function LoginForm() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleLogin = async (e) => {

        e.preventDefault();

        if (loading) {
            return;
        }

        if (!username.trim() || !password) {
            setError("Enter your username and password.");
            return;
        }

        setError("");
        setLoading(true);

        try {

            const data = await login(username.trim(), password);

            localStorage.setItem("token", data.access_token);

            const user = getUser();
            const isQuickCountStaff = user?.role === "quickcount";

            window.location.href = (isQuickCountStaff || Capacitor.isNativePlatform()) ? "/quick-count" : "/dashboard";

        } catch (err) {

            setError(friendlyError(err));
            setLoading(false);

        }
    };


    return (
        //autoComplete off + new-password: asks the browser not to offer saving the password on shared PDAs
        <Box component="form" onSubmit={handleLogin} autoComplete="off" noValidate sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

            <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                fullWidth
                disabled={loading}
            />

            <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                fullWidth
                disabled={loading}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                onClick={() => setShowPassword((show) => !show)}
                                edge="end"
                                tabIndex={-1}
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />

            {error && (
                <Alert severity="error" sx={{ textAlign: "left", whiteSpace: "pre-line" }}>
                    {error}
                </Alert>
            )}

            <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                    py: 1.4,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    backgroundColor: NAVY,
                    "&:hover": { backgroundColor: "#1b1460" }
                }}
            >
                {loading ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Log in"}
            </Button>
        </Box>
    );
}


//hotel photo behind a frosted card
function PhotoStyle() {

    return (
        <Box
            sx={{
                position: "fixed",
                inset: 0,
                overflowY: "auto",
                display: "flex",
                justifyContent: "center",
                p: 2,
                backgroundImage: `linear-gradient(rgba(8,1,37,0.55), rgba(8,1,37,0.55)), url(${loginPhoto})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
            }}
        >
            <Paper
                elevation={8}
                sx={{
                    width: "100%",
                    maxWidth: 400,
                    my: "auto",
                    p: { xs: 3, sm: 4 },
                    borderRadius: 3,
                    backgroundColor: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(6px)"
                }}
            >
                <Brand />
                <LoginForm />
            </Paper>
        </Box>
    );
}


function Login() {

    return <PhotoStyle />;
}

export default Login;
