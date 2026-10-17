import { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Button,
    Chip,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import { API_URL } from "../config";
import { getToken } from "../services/auth";
import { formatDateTime } from "../utils/formatDate";


//System Monitor: who's online (seen in the last hour) and signing people out (admins only)

async function callServer(path, method = "GET") {

    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers: { Authorization: `Bearer ${getToken()}` }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.detail || "Something went wrong");
    }

    return data;
}


//"just now", "5 min ago", "1 h ago"
function timeAgo(value) {

    if (!value) return "-";

    const seconds = (Date.now() - new Date(value.endsWith("Z") ? value : `${value}Z`).getTime()) / 1000;

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;

    return `${Math.floor(seconds / 3600)} h ago`;
}


function OnlineUsers() {

    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [confirmAll, setConfirmAll] = useState(false);
    const [busy, setBusy] = useState(false);

    async function load() {
        try {
            setUsers(await callServer("/users/online"));
            setError("");
        } catch (err) {
            setError(err.message);
        }
    }

    //every 30 seconds, while the tab is open
    useEffect(() => {
        load();

        const interval = setInterval(() => {
            if (!document.hidden) load();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    async function signOut(user) {
        setBusy(true);
        try {
            const data = await callServer(`/users/${user.id}/sign-out`, "POST");
            setMessage(data.message);
            load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    async function signOutEveryone() {
        setBusy(true);
        try {
            const data = await callServer("/users/sign-out-all", "POST");
            setMessage(data.message);
            setConfirmAll(false);
            load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
                    <PeopleIcon fontSize="small" />
                    <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Who's online</Typography>
                    <Typography sx={{ fontSize: "0.85rem" }}>(active in the last hour)</Typography>
                </Box>

                <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    startIcon={<LogoutIcon />}
                    disabled={busy || users.filter((user) => !user.is_you).length === 0}
                    onClick={() => setConfirmAll(true)}
                    sx={{ ml: "auto" }}
                >
                    Sign out everyone
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError("")}>{error}</Alert>}
            {message && <Alert severity="success" sx={{ mb: 1 }} onClose={() => setMessage("")}>{message}</Alert>}

            {users.length === 0 ? (
                <Typography sx={{ fontSize: "0.9rem", color: "text.secondary" }}>
                    Nobody has been active in the last hour.
                </Typography>
            ) : (
                <TableContainer sx={{ overflowX: "auto" }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Logged in</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Last activity</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        {user.name}
                                        {user.name !== user.username && (
                                            <Box component="span" sx={{ color: "text.secondary", fontSize: "0.85em" }}> ({user.username})</Box>
                                        )}
                                        {user.is_you && <Chip label="you" size="small" sx={{ ml: 1 }} />}
                                    </TableCell>
                                    <TableCell sx={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                                        {user.logged_in_at ? formatDateTime(user.logged_in_at) : "-"}
                                    </TableCell>
                                    <TableCell sx={{ whiteSpace: "nowrap" }}>{timeAgo(user.last_seen_at)}</TableCell>
                                    <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>{user.ip || "-"}</TableCell>
                                    <TableCell align="right">
                                        {!user.is_you && (
                                            <Button size="small" color="error" disabled={busy} onClick={() => signOut(user)}>
                                                Sign out
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={confirmAll} onClose={() => setConfirmAll(false)}>
                <DialogTitle>Sign out everyone?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Everyone except you goes back to the login page at their next click and has to log in again.
                        Counts that were already saved are kept.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmAll(false)}>Cancel</Button>
                    <Button color="error" variant="contained" disabled={busy} onClick={signOutEveryone}>
                        Yes, sign out everyone
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}

export default OnlineUsers;
