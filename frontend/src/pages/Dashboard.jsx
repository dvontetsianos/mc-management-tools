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
    Grid,
    IconButton,
    LinearProgress,
    Typography
} from "@mui/material";
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

//the item pages a tile can open, each one only for users with its permission
const ITEM_PAGES = [
    { department: "F&B", permission: "fnb_items_access", label: "F&B Items", path: "/fnb-items" },
    { department: "Housekeeping", permission: "housekeeping_items_access", label: "Housekeeping Items", path: "/housekeeping-items" },
    { department: "Kitchen", permission: "kitchen_items_access", label: "Kitchen Items", path: "/kitchen-items" }
];


//one dashboard tile: icon + title on top, the numbers in the middle, buttons to open pages at the bottom
function Tile({ icon, title, buttons, children }) {

    const navigate = useNavigate();

    return (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "rgba(255, 255, 255, 0.85)" }}>

                <CardContent sx={{ flexGrow: 1 }}>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, color: "text.secondary" }}>
                        {icon}
                        <Typography sx={{ fontWeight: 600 }}>
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
    );
}


//the big number of a tile, with a short line under it saying what it is
function BigNumber({ value, label, color = "text.primary" }) {

    return (
        <>
            <Typography variant="h4" sx={{ fontWeight: 700, color: color, fontVariantNumeric: "tabular-nums" }}>
                {value}
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 2 }}>
                {label}
            </Typography>
        </>
    );
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
                Welcome <b>{user?.sub}</b>
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
                        <Tile icon={<FactCheckIcon />} title="Count Progress" buttons={itemButtons}>
                            <BigNumber
                                value={`${dashboard.count_progress.locations_counted} / ${dashboard.count_progress.locations_total}`}
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
                        <Tile icon={<ReportProblemIcon />} title="Missing" buttons={itemButtons}>
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
                            {dashboard.missing.units_over > 0 && (
                                <Chip size="small" label={`${dashboard.missing.units_over} extra found`} sx={{ mt: 1.5 }} />
                            )}
                        </Tile>
                    )}

                    {/* ---- 3. stock waiting in Unassigned ---- */}
                    {showTile("unassigned") && (
                        <Tile icon={<InventoryIcon />} title="In Unassigned" buttons={unassignedButtons}>
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
                        <Tile icon={<AssignmentIcon />} title="Requests" buttons={[{ label: "Requests", path: "/requests" }]}>
                            <BigNumber
                                value={dashboard.requests.pending}
                                label="pending for your department"
                                color={dashboard.requests.pending > 0 ? "warning.main" : "text.primary"}
                            />
                        </Tile>
                    )}

                    {/* ---- 5. lost & found ---- */}
                    {showTile("lost_found") && (
                        <Tile icon={<FindInPageIcon />} title="Lost & Found" buttons={[{ label: "Lost & Found", path: "/lost-found" }]}>
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
                        <Tile icon={<EuroIcon />} title="Spend" buttons={spendButtons}>
                            <BigNumber
                                value={currencyFormatter.format(dashboard.spend.this_month)}
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