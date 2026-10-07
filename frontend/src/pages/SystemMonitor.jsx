import { useEffect, useRef, useState } from "react";
import { formatLocalDateTime } from "../utils/formatDate";
import {
    Box,
    Paper,
    Typography,
    LinearProgress,
    Alert,
    Chip,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    IconButton,
    Tooltip,
    CircularProgress
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import MemoryIcon from "@mui/icons-material/Memory";
import StorageIcon from "@mui/icons-material/Storage";
import SpeedIcon from "@mui/icons-material/Speed";
import ScheduleIcon from "@mui/icons-material/Schedule";
import FolderIcon from "@mui/icons-material/Folder";
import DatasetIcon from "@mui/icons-material/Dataset";
import LoginIcon from "@mui/icons-material/Login";
import { getSystemStatus } from "../services/systemService";



//how often the page asks the server (milliseconds) and how many readings the small charts keep
const REFRESH_EVERY = 10000;
const HISTORY_LENGTH = 60;

const NAVY = "#080125";


//------------------------------------------------------------ helpers

function formatBytes(bytes) {

    if (bytes === null || bytes === undefined) {
        return "-";
    }

    const units = ["B", "KB", "MB", "GB", "TB"];
    let value = bytes;
    let unit = 0;

    while (value >= 1024 && unit < units.length - 1) {
        value = value / 1024;
        unit++;
    }

    return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}


//"3 d 4 h", "5 h 12 min", "8 min"
function formatDuration(fromIso) {

    if (!fromIso) {
        return "-";
    }

    const minutes = Math.max(0, Math.floor((Date.now() - new Date(fromIso).getTime()) / 60000));
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;

    if (days > 0) {
        return `${days} d ${hours} h`;
    }

    if (hours > 0) {
        return `${hours} h ${mins} min`;
    }

    return `${mins} min`;
}


function formatDateTime(iso) {

    if (!iso) {
        return "-";
    }

    return formatLocalDateTime(iso);
}


//green below 70%, orange below 90%, red above
function levelColor(percent) {

    if (percent >= 90) {
        return "#d32f2f";
    }

    if (percent >= 70) {
        return "#ed6c02";
    }

    return "#2e7d32";
}


//"2026-10-03 09:14 | User: admin | IP: 192.168.1.20" -> { time, user, ip }
function parseLoginLine(line) {

    const parts = line.split("|").map((part) => part.trim());

    return {
        time: parts[0] || "",
        user: (parts[1] || "").replace(/^User:\s*/, ""),
        ip: (parts[2] || "").replace(/^IP:\s*/, "")
    };
}


//------------------------------------------------------------ small pieces

//a tiny line chart of the last readings, drawn with plain SVG (no chart library)
function Sparkline({ values, color }) {

    if (values.length < 2) {
        return <Box sx={{ height: 36 }} />;
    }

    const width = 120;
    const height = 32;

    const points = values.map((value, index) => {
        const x = (index / (values.length - 1)) * width;
        const y = height - (Math.min(100, Math.max(0, value)) / 100) * height;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return (
        <Box
            component="svg"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            sx={{ width: "100%", height: 36, display: "block" }}
        >
            <polygon
                points={`0,${height} ${points.join(" ")} ${width},${height}`}
                fill={color}
                opacity={0.12}
            />
            <polyline
                points={points.join(" ")}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
            />
        </Box>
    );
}


//CPU / Memory / Disk card: big percent, bar, detail line, small chart of the last minutes
function UsageCard({ icon, title, percent, detail, history }) {

    const color = levelColor(percent ?? 0);

    return (
        <Paper sx={{ p: 2.5, borderRadius: 3, display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
                {icon}
                <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>{title}</Typography>
            </Box>

            <Typography sx={{ fontSize: "2.2rem", fontWeight: 700, color: NAVY, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
                {percent !== null && percent !== undefined ? `${Math.round(percent)}%` : "-"}
            </Typography>

            <LinearProgress
                variant="determinate"
                value={Math.min(100, percent ?? 0)}
                sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#eceef5",
                    "& .MuiLinearProgress-bar": { backgroundColor: color, borderRadius: 4 }
                }}
            />

            <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                {detail}
            </Typography>

            <Sparkline values={history} color={color} />
        </Paper>
    );
}


//a card with a title and label/value rows
function InfoCard({ icon, title, rows }) {

    return (
        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary", mb: 1.5 }}>
                {icon}
                <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>{title}</Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {rows.map(([label, value]) => (
                    <Box key={label} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                        <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", textAlign: "left" }}>{label}</Typography>
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: NAVY, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                            {value}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
}


//------------------------------------------------------------ page

function SystemMonitor() {

    const [status, setStatus] = useState(null);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadingRef = useRef(false);


    async function loadStatus() {

        //one request at a time
        if (loadingRef.current) {
            return;
        }

        loadingRef.current = true;
        setLoading(true);

        try {
            const data = await getSystemStatus();

            setStatus(data);
            setError("");
            setLastUpdated(new Date());

            setHistory((previous) => [
                ...previous,
                { cpu: data.cpu_percent, memory: data.memory_percent, disk: data.disk_percent }
            ].slice(-HISTORY_LENGTH));

        } catch (err) {
            setError(err.message || "Can't reach the server.");
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }


    useEffect(() => {

        loadStatus();

        //refresh regularly, but not while the tab is in the background
        const interval = setInterval(() => {
            if (!document.hidden) {
                loadStatus();
            }
        }, REFRESH_EVERY);

        const onVisible = () => {
            if (!document.hidden) {
                loadStatus();
            }
        };

        document.addEventListener("visibilitychange", onVisible);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", onVisible);
        };

    }, []);


    const logins = (status?.recent_logins || []).map(parseLoginLine);


    return (
        <Box
            sx={{
                p: { xs: 2, md: 4 },
                maxWidth: 1300,
                mx: "auto",
                width: "100%",
                boxSizing: "border-box",
                textAlign: "left"
            }}
        >
            {/* header */}
            <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
                <Box sx={{ flex: 1, minWidth: 220 }}>
                    <Typography component="h1" sx={{ m: 0, fontSize: "2rem", fontWeight: 700, color: NAVY, letterSpacing: "-0.01em" }}>
                        System Monitor
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.95rem" }}>
                        {status ? `Server ${status.hostname}` : "Loading server information..."}
                    </Typography>
                </Box>

                <Chip
                    size="small"
                    color={error ? "error" : "success"}
                    variant="outlined"
                    label={error ? "Not responding" : "Online"}
                />

                <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                    {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString("en-GB")}` : ""}
                </Typography>

                <Tooltip title="Refresh now">
                    <span>
                        <IconButton onClick={loadStatus} disabled={loading}>
                            {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error} {status ? "The numbers below are from the last successful update." : ""}
                </Alert>
            )}

            {!status && !error && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                    <CircularProgress />
                </Box>
            )}

            {status && (
                <>
                    {/* CPU, memory, disk */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                            gap: 2,
                            mb: 2
                        }}
                    >
                        <UsageCard
                            icon={<SpeedIcon fontSize="small" />}
                            title="CPU"
                            percent={status.cpu_percent}
                            detail={`${status.cpu_count} cores`}
                            history={history.map((h) => h.cpu)}
                        />
                        <UsageCard
                            icon={<MemoryIcon fontSize="small" />}
                            title="Memory"
                            percent={status.memory_percent}
                            detail={`${formatBytes(status.memory_used)} of ${formatBytes(status.memory_total)}`}
                            history={history.map((h) => h.memory)}
                        />
                        <UsageCard
                            icon={<StorageIcon fontSize="small" />}
                            title="Disk"
                            percent={status.disk_percent}
                            detail={`${formatBytes(status.disk_total - status.disk_used)} free of ${formatBytes(status.disk_total)}`}
                            history={history.map((h) => h.disk)}
                        />
                    </Box>

                    {/* uptime, storage, data */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                            gap: 2,
                            mb: 2
                        }}
                    >
                        <InfoCard
                            icon={<ScheduleIcon fontSize="small" />}
                            title="Running time"
                            rows={[
                                ["App running for", formatDuration(status.app_started_at)],
                                ["App started", formatDateTime(status.app_started_at)],
                                ["Server running for", formatDuration(status.server_started_at)],
                                ["Server started", formatDateTime(status.server_started_at)]
                            ]}
                        />
                        <InfoCard
                            icon={<FolderIcon fontSize="small" />}
                            title="App storage"
                            rows={[
                                ["Database", formatBytes(status.database_size)],
                                ["Item photos", `${status.uploads_count} files, ${formatBytes(status.uploads_size)}`],
                                ["Log files", formatBytes(status.logs_size)]
                            ]}
                        />
                        <InfoCard
                            icon={<DatasetIcon fontSize="small" />}
                            title="Data"
                            rows={[
                                ["Hotels", status.counts?.hotels ?? "-"],
                                ["Active locations", status.counts?.locations ?? "-"],
                                ["Items", status.counts?.items ?? "-"],
                                ["Users", status.counts?.users ?? "-"]
                            ]}
                        />
                    </Box>

                    {/* recent logins */}
                    <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary", mb: 1 }}>
                            <LoginIcon fontSize="small" />
                            <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Recent logins</Typography>
                        </Box>

                        {logins.length === 0 ? (
                            <Typography sx={{ fontSize: "0.9rem", color: "text.secondary" }}>
                                No logins recorded yet.
                            </Typography>
                        ) : (
                            <TableContainer sx={{ overflowX: "auto" }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {logins.map((login, index) => (
                                            <TableRow key={`${login.time}-${index}`}>
                                                <TableCell sx={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{formatLocalDateTime(login.time)}</TableCell>
                                                <TableCell>{login.user}</TableCell>
                                                <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>{login.ip}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>

                    {/* small print */}
                    <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                        {status.platform} · Python {status.python_version} · refreshes every {REFRESH_EVERY / 1000} seconds while this page is open
                    </Typography>
                </>
            )}
        </Box>
    );
}

export default SystemMonitor;
