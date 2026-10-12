import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../services/auth";
import { getDashboard } from "../services/dashboardService";
import { getSettings } from "../services/systemService";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    CircularProgress,
    Fade,
    Grid,
    IconButton,
    LinearProgress,
    Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import InventoryIcon from "@mui/icons-material/Inventory";
import AssignmentIcon from "@mui/icons-material/Assignment";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import EuroIcon from "@mui/icons-material/Euro";
import ImageIcon from "@mui/icons-material/Image";
import { APP_TITLE } from "../config";
import marbellaelixbg from "../assets/marbellaelixbg.jpg";


const currencyFormatter = new Intl.NumberFormat(
    "en-US",
    {
        style: "currency",
        currency: "EUR"
    }
);

//each tile's own color, for its title and icon (all dark enough to read on white)
const TILE_COLORS = {
    count_progress: "#1c5cab",
    missing: "#5a46c8",
    unassigned: "#0b7a5a",
    requests: "#b8336a",
    lost_found: "#a0522d",
    spend: "#1f7a1f"
};

//true when the computer is set to "reduce motion": then nothing animates
const REDUCE_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

//the item pages a tile can open, each one only for users with its permission
const ITEM_PAGES = [
    { department: "F&B", permission: "fnb_items_access", label: "F&B Items", path: "/fnb-items" },
    { department: "Housekeeping", permission: "housekeeping_items_access", label: "Housekeeping Items", path: "/housekeeping-items" },
    { department: "Kitchen", permission: "kitchen_items_access", label: "Kitchen Items", path: "/kitchen-items" }
];


//one dashboard tile: icon + title on top, the numbers in the middle, buttons to open pages at the bottom
//index = its place on the page, so the tiles fade in one after another
function Tile({ icon, title, color, index, buttons, children }) {

    const navigate = useNavigate();

    return (
        <Fade in timeout={REDUCE_MOTION ? 0 : 500} style={{ transitionDelay: REDUCE_MOTION ? "0ms" : `${index * 300}ms` }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "rgba(255, 255, 255, 0.85)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                        transform: REDUCE_MOTION ? "none" : "translateY(-3px)",
                        boxShadow: 6
                    }
                }}
            >

                <CardContent sx={{ flexGrow: 1 }}>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                        {/* the icon in a soft round badge of the tile's colour */}
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: color,
                                backgroundColor: alpha(color, 0.12)
                            }}
                        >
                            {icon}
                        </Box>
                        <Typography sx={{ fontWeight: 600, color: color }}>
                            {title}
                        </Typography>
                    </Box>

                    {children}

                </CardContent>

                <CardActions>
                    {buttons.map((button) => (
                        <Button key={button.path} size="small" onClick={() => navigate(button.path)}>
                            {button.label}
                        </Button>
                    ))}
                </CardActions>

            </Card>
        </Grid>
        </Fade>
    );
}


//counts from 0 up to the target in about half a second, slowing down at the end
function useCountUp(target, duration = 600) {

    const [shown, setShown] = useState(0);

    useEffect(() => {

        if (REDUCE_MOTION) {
            return;
        }

        let frame;
        const start = performance.now();

        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            setShown(target * eased);

            if (progress < 1) {
                frame = requestAnimationFrame(step);
            }
        };

        frame = requestAnimationFrame(step);

        //if the page closes mid-count, stop counting
        return () => cancelAnimationFrame(frame);
    }, [target, duration]);

    //with reduce motion the real number is shown straight away
    return REDUCE_MOTION ? target : shown;
}


//the big number of a tile, with a short line under it saying what it is.
//format = how to show the number (whole number by default, or money), suffix = text after it, e.g. " / 28"
function BigNumber({ value, label, color = "text.primary", format = (number) => Math.round(number), suffix = "" }) {

    const shown = useCountUp(value);

    return (
        <>
            <Typography variant="h4" sx={{ fontWeight: 700, color: color, textAlign: "left" }}>
                {format(shown)}{suffix}
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 2 }}>
                {label}
            </Typography>
        </>
    );
}


//good morning / afternoon / evening, by the computer's clock
function greeting() {

    const hour = new Date().getHours();
    
    if (hour < 12) {
        return "Good morning";
    }
    if (hour < 18) {
        return "Good afternoon";
    }
    return "Good evening";
}


function Dashboard() {

    const user = getUser();

    const [dashboard, setDashboard] = useState(null);
    const [settings, setSettings] = useState(null);
    const [error, setError] = useState("");

    const [showBackgroundImage, setShowBackgroundImage] = useState(() => {
        const stored = localStorage.getItem("showDashboardBackground");
        return stored === null ? false : stored === "true";
    });

    const toggleBackgroundImage = () => {
        setShowBackgroundImage((prev) => {
            const next = !prev;
            localStorage.setItem("showDashboardBackground", next);
            return next;
        });
    };

    const hasPermission = (permission) =>
        user?.role === "admin" || user?.permissions?.includes(permission);

    useEffect(() => {

        getDashboard()
            .then(setDashboard)
            .catch((err) => setError(err.message));

    }, []);

    useEffect(() => {

        const loadSettings = () => {
            getSettings()
                .then(setSettings)
                //if the settings can't be loaded, every tile simply stays on
                .catch(() => setSettings({}));
        };

        loadSettings();

        //System Monitor sends this when the admin flips a switch
        window.addEventListener("settings-changed", loadSettings);

        return () => window.removeEventListener("settings-changed", loadSettings);
    }, []);

    //a tile shows when the backend sent it (= the user has the permission) and its switch is not off
    const showTile = (name) =>
        dashboard?.[name] && settings?.[`dashboard_${name}`] !== false;

    const tileNames = ["count_progress", "missing", "unassigned", "requests", "lost_found", "spend"];
    const anyTile = tileNames.some(showTile);

    const itemButtons = ITEM_PAGES.filter((page) => hasPermission(page.permission));

    const unassignedButtons = itemButtons.filter((page) =>
        dashboard?.unassigned?.by_department.some((row) => row.department === page.department)
    );

    //Missing only opens the pages of the departments where the count found a difference
    const missingButtons = itemButtons.filter((page) =>
        dashboard?.missing?.by_department.some((row) => row.department === page.department)
    );

    const spendButtons = [];
    if (hasPermission("purchases_access")) {
        spendButtons.push({ label: "Purchases", path: "/purchases" });
    }
    if (hasPermission("reports_access")) {
        spendButtons.push({ label: "Spend Report", path: "/reports/spend" });
    }


    return (

        <Box sx={{ pb: 20, position: "relative", zIndex: 0 }}>

            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: showBackgroundImage ? `url(${marbellaelixbg})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: 1,
                    zIndex: -1
                }}
            />

            <IconButton
                onClick={toggleBackgroundImage}
                sx={{
                    position: "fixed",
                    top: 4,
                    right: 4,
                    p: 0.25,
                    opacity: 0.02,
                    zIndex: 10,
                    transition: "opacity 10s",
                    "&:hover": {
                        opacity: 1
                    }
                }}
            >
                <ImageIcon sx={{ fontSize: 10 }} />
            </IconButton>

            <Typography variant="h4" gutterBottom>
                {APP_TITLE}
            </Typography>

            <Typography sx={{ mb: 3 }}>
                {greeting()}, <b>{user?.sub}</b>
                <Box component="span" sx={{ color: "text.secondary" }}>
                    {" · "}
                    {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                </Box>
            </Typography>

            {error && (
                <Alert severity="error">
                    {error}
                </Alert>
            )}

            {!error && (!dashboard || !settings) && (
                <CircularProgress />
            )}

            {dashboard && settings && !anyTile && (
                <Alert severity="info">
                    Nothing to show here yet. Use the menu to open your pages.
                </Alert>
            )}

            {dashboard && settings && (

                <Grid container spacing={3}>

                    {/* ---- 1. count progress ---- */}
                    {showTile("count_progress") && (
                        <Tile icon={<FactCheckIcon />} title="Count Progress" color={TILE_COLORS.count_progress} index={0} buttons={itemButtons}>
                            <BigNumber
                                value={dashboard.count_progress.locations_counted}
                                suffix={` / ${dashboard.count_progress.locations_total}`}
                                label="locations fully counted"
                            />
                            <LinearProgress
                                variant="determinate"
                                value={dashboard.count_progress.locations_total
                                    ? dashboard.count_progress.locations_counted / dashboard.count_progress.locations_total * 100
                                    : 0}
                                sx={{ height: 8, borderRadius: 4, mb: 2 }}
                            />
                            <Typography>
                                <b>{dashboard.count_progress.items_uncounted}</b> items still to count
                            </Typography>
                        </Tile>
                    )}

                    {/* ---- 2. missing (only shortages, extra found is shown apart) ---- */}
                    {showTile("missing") && (
                        <Tile icon={<ReportProblemIcon />} title="Missing" color={TILE_COLORS.missing} index={1} buttons={missingButtons}>
                            <BigNumber
                                value={dashboard.missing.units_short}
                                label="units short after the staff count"
                                color={dashboard.missing.units_short > 0 ? "error.main" : "text.primary"}
                            />
                            <Typography>
                                Value: <b>{currencyFormatter.format(dashboard.missing.value_short)}</b>
                            </Typography>
                            {dashboard.missing.items_without_cost > 0 && (
                                <Typography variant="body2" sx={{ color: "warning.main" }}>
                                    {dashboard.missing.items_without_cost} short item(s) have no cost, so the value is incomplete
                                </Typography>
                            )}
                            <Box sx={{ mt: 1 }}>
                                {dashboard.missing.by_department.map((row) => (
                                    <Typography key={row.department} variant="body2">
                                        <b>{row.department}</b>: {row.units_short} short · {currencyFormatter.format(row.value_short)}
                                        {row.units_over > 0 && ` · ${row.units_over} extra found`}
                                    </Typography>
                                ))}
                            </Box>
                        </Tile>
                    )}

                    {/* ---- 3. stock waiting in Unassigned ---- */}
                    {showTile("unassigned") && (
                        <Tile icon={<InventoryIcon />} title="In Unassigned" color={TILE_COLORS.unassigned} index={2} buttons={unassignedButtons}>
                            <BigNumber
                                value={dashboard.unassigned.units}
                                label="units waiting to be placed"
                                color={dashboard.unassigned.units > 0 ? "warning.main" : "text.primary"}
                            />
                            
                            {dashboard.unassigned.by_department.length === 0 && (
                                <Typography>
                                    Everything is placed in a location
                                </Typography>
                            )}
                            {dashboard.unassigned.by_department.map((row) => (
                                <Typography key={row.department}>
                                    <b>{row.department}</b>: {row.units} units ({row.items} item(s))
                                </Typography>
                            ))}
                        </Tile>
                    )}

                    {/* ---- 4. requests ---- */}
                    {showTile("requests") && (
                        <Tile icon={<AssignmentIcon />} title="Requests" color={TILE_COLORS.requests} index={3} buttons={[{ label: "Requests", path: "/requests" }]}>
                            <BigNumber
                                value={dashboard.requests.pending}
                                label="pending for your department"
                                color={dashboard.requests.pending > 0 ? "warning.main" : "text.primary"}
                            />
                        </Tile>
                    )}

                    {/* ---- 5. lost & found ---- */}
                    {showTile("lost_found") && (
                        <Tile icon={<FindInPageIcon />} title="Lost & Found" color={TILE_COLORS.lost_found} index={4} buttons={[{ label: "Lost & Found", path: "/lost-found" }]}>
                            <BigNumber
                                value={dashboard.lost_found.unclaimed}
                                label="unclaimed items"
                            />
                            {dashboard.lost_found.older_than_30_days > 0 && (
                                <Chip
                                    size="small"
                                    color="warning"
                                    label={`${dashboard.lost_found.older_than_30_days} older than 30 days`}
                                />
                            )}
                        </Tile>
                    )}

                    {/* ---- 6. spend, with a small bar per hotel ---- */}
                    {showTile("spend") && (
                        <Tile icon={<EuroIcon />} title="Spend" color={TILE_COLORS.spend} index={5} buttons={spendButtons}>
                            <BigNumber
                                value={dashboard.spend.this_month}
                                format={(number) => currencyFormatter.format(number)}
                                label="spent this month"
                            />
                            <Typography sx={{ mb: 1.5 }}>
                                This year: <b>{currencyFormatter.format(dashboard.spend.this_year)}</b>
                            </Typography>

                            {dashboard.spend.by_hotel.map((row) => (
                                <Box key={row.hotel} sx={{ mb: 1 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                        <span>{row.hotel}</span>
                                        <span>{currencyFormatter.format(row.value)}</span>
                                    </Box>
                                    {/* the biggest hotel is the full bar, the others are compared to it */}
                                    <LinearProgress
                                        variant="determinate"
                                        value={dashboard.spend.by_hotel[0].value
                                            ? row.value / dashboard.spend.by_hotel[0].value * 100
                                            : 0}
                                        sx={{ height: 6, borderRadius: 3 }}
                                    />
                                </Box>
                            ))}

                            {dashboard.spend.purchases_without_cost > 0 && (
                                <Typography variant="body2" sx={{ color: "warning.main" }}>
                                    {dashboard.spend.purchases_without_cost} purchase(s) this year have no unit cost
                                </Typography>
                            )}
                        </Tile>
                    )}

                </Grid>
            )}
        </Box>
    );

}

export default Dashboard;