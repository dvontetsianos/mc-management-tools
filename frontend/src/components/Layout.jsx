import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Box,
    Badge,
    Divider,
    IconButton,
    Tooltip,
    Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { logout, getUser, getToken } from "../services/auth";
import { useState, useEffect, Suspense } from "react";
import FeedbackDialog from "../components/feedback/FeedbackDialog";
import DashboardIcon from "@mui/icons-material/Dashboard";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import KitchenIcon from "@mui/icons-material/Kitchen";
import PeopleIcon from "@mui/icons-material/People";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import FeedbackIcon from "@mui/icons-material/Feedback";
import LogoutIcon from "@mui/icons-material/Logout";
import RefreshIcon from "@mui/icons-material/Refresh";
import CategoryIcon from "@mui/icons-material/Category";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import TableChartIcon from "@mui/icons-material/TableChart";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import Calculator from "../components/Calculator";
import Clock from "../components/Clock";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HistoryIcon from "@mui/icons-material/History";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import { getPendingRequestCount } from "../services/requestService";
import { getNewFeedbackCount } from "../services/feedbackService";
import InboxIcon from "@mui/icons-material/Inbox";
import { API_URL } from "../config";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { getSettings } from "../services/systemService";
import { NAVY } from "../theme";
import { REPORT_PERMISSIONS } from "../pages/reports/reportList";


const OPEN_WIDTH = 248;

//the small round buttons at the bottom of the menu (extend session, feedback, logout)
const FOOTER_BUTTON = {
    color: "rgba(255,255,255,0.72)",
    "&:hover": { color: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.1)" }
};
const CLOSED_WIDTH = 72;

//admins see everything, everyone else needs the permission
const isAdmin = (user) => user?.role === "admin";
const has = (permission) => (user) => isAdmin(user) || user?.permissions?.includes(permission);


//the menu, in groups. show = who sees the link (same rules as before)
const NAV_SECTIONS = [
    {
        title: "Overview",
        links: [
            { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon />, show: () => true },
            { label: "Requests", path: "/requests", icon: <AssignmentIcon />, show: has("requests_access"), badge: "requests" },
            { label: "Reports", path: "/reports", icon: <AssessmentIcon />, show: (user) => REPORT_PERMISSIONS.some((permission) => has(permission)(user)) }
        ]
    },
    {
        title: "Inventory",
        links: [
            { label: "F&B Items", path: "/fnb-items", icon: <RestaurantIcon />, show: has("fnb_items_access") },
            { label: "Housekeeping Items", path: "/housekeeping-items", icon: <CleaningServicesIcon />, show: has("housekeeping_items_access") },
            { label: "Kitchen Items", path: "/kitchen-items", icon: <KitchenIcon />, show: has("kitchen_items_access") },
            { label: "Purchases", path: "/purchases", icon: <ShoppingCartIcon />, show: has("purchases_access") },
            { label: "Item Movements", path: "/movements", icon: <SwapHorizIcon />, show: has("movements_access") },
            { label: "Lost & Found", path: "/lost-found", icon: <FindInPageIcon />, show: has("lost_found_access") }
        ]
    },
    {
        title: "Setup",
        links: [
            { label: "Categories", path: "/categories", icon: <CategoryIcon />, show: has("categories_access") },
            { label: "Locations", path: "/locations", icon: <LocationOnIcon />, show: has("locations_access") },
            { label: "Suppliers", path: "/suppliers", icon: <LocalShippingIcon />, show: has("suppliers_access") },
            { label: "Departments", path: "/departments", icon: <BusinessIcon />, show: isAdmin }
        ]
    },
    {
        title: "Admin",
        links: [
            { label: "User Management", path: "/users", icon: <PeopleIcon />, show: isAdmin },
            { label: "History", path: "/history", icon: <HistoryIcon />, show: isAdmin },
            { label: "Feedback", path: "/feedback", icon: <InboxIcon />, show: isAdmin, badge: "feedback" },
            { label: "Excel Viewer", path: "/excel", icon: <TableChartIcon />, show: has("view_excel_access") },
            { label: "System Monitor", path: "/system-monitor", icon: <MonitorHeartIcon />, show: isAdmin }
        ]
    }
];


//one menu link. Closed sidebar: only the icon, the name shows as a tooltip
function NavLink({ label, icon, active, open, onClick, dot = false }) {

    const button = (
        <ListItemButton
            onClick={onClick}
            selected={active}
            sx={{
                mx: 1.25,
                mb: 0.25,
                minHeight: 36,
                py: 0.5,
                borderRadius: 2,
                px: open ? 1.5 : 0,
                justifyContent: open ? "flex-start" : "center",
                color: "rgba(255, 255, 255, 0.72)",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.07)", color: "#FFFFFF" },
                "&.Mui-selected": {
                    backgroundColor: alpha("#4A7FC6", 0.28),
                    color: "#FFFFFF",
                    "&:hover": { backgroundColor: alpha("#4A7FC6", 0.36) }
                }
            }}
        >
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 1.5 : 0, color: "inherit", "& svg": { fontSize: 20 } }}>
                <Badge variant="dot" color="error" invisible={!dot}>
                    {icon}
                </Badge>
            </ListItemIcon>

            {open && (
                <ListItemText
                    primary={label}
                    slotProps={{ primary: { fontSize: "0.875rem", fontWeight: active ? 650 : 500, noWrap: true } }}
                />
            )}
        </ListItemButton>
    );

    return open ? button : (
        <Tooltip title={label} placement="right" arrow>
            {button}
        </Tooltip>
    );
}


function Layout() {

    const extendSession = async () => {

        try {

            const token = getToken();

            const response = await fetch(
                `${API_URL}/refresh-token`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to refresh session");
            }

            const data = await response.json();

            localStorage.setItem(
                "token",
                data.access_token
            );

        } catch (error) {

            console.error(error);

            logout();

            navigate("/");

        }

    };

    useEffect(() => {

        const updateSession = () => {

            const token = getToken();

            if (!token) {

                logout();

                navigate("/");

                return;
            }

            const user = getUser();

            if (!user) {

                logout();

                navigate("/");

                return;
            }

            const secondsRemaining = Math.max(
                0,
                Math.floor(user.exp - Date.now() / 1000)
            );

            const minutes = Math.floor(secondsRemaining / 60);
            const seconds = secondsRemaining % 60;

            setSessionTime(
                `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
            );
        };

        updateSession();

        const interval = setInterval(updateSession, 1000);

        return () => clearInterval(interval);

    }, []);

    useEffect(() => {

        const checkPendingRequests = async () => {

            //skip while the tab is in the background, nobody is looking at it
            if (!getToken() || document.hidden) {
                return;
            }

            try {

                const count = await getPendingRequestCount();

                setPendingRequestCount(count);

            } catch (error) {

                console.error(error);

            }

        };

        checkPendingRequests();
        const interval = setInterval(checkPendingRequests, 300000);

        //check right away when the user comes back to the tab
        document.addEventListener("visibilitychange", checkPendingRequests);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", checkPendingRequests);
        };

    }, []);

    const user = getUser();

    const navigate = useNavigate();

    const { pathname } = useLocation();

    const [feedbackOpen, setFeedbackOpen] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [sessionTime, setSessionTime] = useState("30:00");

    const [pendingRequestCount, setPendingRequestCount] = useState(0);

        //admins: how many feedback are still new, for the red dot on Feedback
    const [newFeedbackCount, setNewFeedbackCount] = useState(0);

    useEffect(() => {

        if (getUser()?.role !== "admin") {
            return;
        }

        const loadFeedbackCount = () => {
            getNewFeedbackCount()
                .then(setNewFeedbackCount)
                .catch(() => {});
        };

        loadFeedbackCount();

        //every 5 minutes, and straight away when the Feedback page changes a status
        const interval = setInterval(loadFeedbackCount, 300000);
        window.addEventListener("feedback-changed", loadFeedbackCount);

        return () => {
            clearInterval(interval);
            window.removeEventListener("feedback-changed", loadFeedbackCount);
        };
    }, []);

    //which widgets are switches on (System Monitor -> Admin Tools), nothing shows until it's known
    const [settings, setSettings] = useState(null);

    useEffect(() => {

        const loadSettings = () => {
            getSettings()
                .then(setSettings)
                //if the settings can't be loaded, the widgets simply stay on
                .catch(() => setSettings({ show_calculator: true, show_clock: true }));
        };

        loadSettings();

        //System Monitor sends this when the admin flips a switch, so it changes straight away on this screen
        window.addEventListener("settings-changed", loadSettings);

        return () => window.removeEventListener("settings-changed", loadSettings);
    }, []);

    const handleLogout = () => {

        logout();

        navigate("/");

    };

    const width = sidebarOpen ? OPEN_WIDTH : CLOSED_WIDTH;

    //the link of the page we're on is highlighted, also on its sub pages (e.g. /reports/spend)
    const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

    //the session turns orange in its last 5 minutes
    const sessionEnding = sessionTime < "05:00";


    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <Drawer
                variant="permanent"
                sx={{
                    width,
                    flexShrink: 0,
                    transition: "width 0.2s",
                    "& .MuiDrawer-paper": {
                        width,
                        boxSizing: "border-box",
                        backgroundColor: NAVY,
                        color: "#FFFFFF",
                        borderRight: "none",
                        overflowX: "hidden",
                        transition: "width 0.2s",
                        display: "flex",
                        flexDirection: "column"
                    }
                }}
            >
                {/* logo, app name and the open / close button */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        px: sidebarOpen ? 2 : 0,
                        py: 2,
                        justifyContent: sidebarOpen ? "flex-start" : "center",
                        flexDirection: sidebarOpen ? "row" : "column"
                    }}
                >
                    <Box
                        component="img"
                        src="/MC.png"
                        alt=""
                        onClick={() => navigate("/dashboard")}
                        sx={{ width: 34, height: 34, borderRadius: 2, cursor: "pointer", flexShrink: 0 }}
                    />

                    {sidebarOpen && (
                        <Box sx={{ minWidth: 0, flexGrow: 1, lineHeight: 1.15 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#FFFFFF" }} noWrap>
                                MC Management
                            </Typography>
                            <Typography sx={{ fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }} noWrap>
                                Marbella Collection
                            </Typography>
                        </Box>
                    )}

                    <Tooltip title={sidebarOpen ? "Collapse menu" : "Expand menu"} placement="right">
                        <IconButton
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            size="small"
                            sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.08)" } }}
                        >
                            {sidebarOpen ? <MenuOpenIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* the page links, in groups */}
                <Box sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden", pb: 1 }}>
                    {NAV_SECTIONS.map((section) => {

                        const links = section.links.filter((link) => link.show(user));

                        if (links.length === 0) {
                            return null;
                        }

                        return (
                            <List
                                key={section.title}
                                disablePadding
                                sx={{ mb: 0.5 }}
                                subheader={sidebarOpen ? (
                                    <ListSubheader
                                        disableSticky
                                        sx={{
                                            backgroundColor: "transparent",
                                            color: "rgba(255,255,255,0.42)",
                                            fontSize: "0.68rem",
                                            fontWeight: 700,
                                            letterSpacing: "0.12em",
                                            textTransform: "uppercase",
                                            lineHeight: "28px",
                                            px: 2.75
                                        }}
                                    >
                                        {section.title}
                                    </ListSubheader>
                                ) : (
                                    <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mx: 2, my: 1 }} />
                                )}
                            >
                                {links.map((link) => (
                                    <NavLink
                                        key={link.path}
                                        label={link.label}
                                        icon={link.icon}
                                        open={sidebarOpen}
                                        active={isActive(link.path)}
                                        dot={
                                            (link.badge === "requests" && pendingRequestCount > 0) ||
                                            (link.badge === "feedback" && newFeedbackCount > 0)
                                            }
                                        onClick={() => navigate(link.path)}
                                    />
                                ))}
                            </List>
                        );
                    })}
                </Box>

                <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

                {/* session timer, then feedback and logout: one row when the menu is open, stacked when closed */}
                <Box
                    sx={{
                        p: 1.25,
                        display: "flex",
                        flexDirection: sidebarOpen ? "row" : "column",
                        alignItems: "center",
                        gap: 0.5
                    }}
                >
                    <Box
                        sx={{
                            flexGrow: 1,
                            width: sidebarOpen ? "auto" : "100%",
                            px: sidebarOpen ? 1.25 : 0,
                            py: 0.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: sidebarOpen ? "space-between" : "center",
                            borderRadius: 2,
                            backgroundColor: "rgba(255,255,255,0.05)"
                        }}
                    >
                        {sidebarOpen && (
                            <Box sx={{ lineHeight: 1.15 }}>
                                <Typography sx={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                    Session
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: "0.9rem",
                                        fontWeight: 700,
                                        fontVariantNumeric: "tabular-nums",
                                        color: sessionEnding ? "#FFB74D" : "#FFFFFF"
                                    }}
                                >
                                    {sessionTime}
                                </Typography>
                            </Box>
                        )}

                        <Tooltip title={`Extend session (${sessionTime} left)`} placement="right">
                            <IconButton size="small" onClick={extendSession} sx={FOOTER_BUTTON}>
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Tooltip title="Feedback" placement="right">
                        <IconButton onClick={() => setFeedbackOpen(true)} sx={FOOTER_BUTTON}>
                            <FeedbackIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Logout" placement="right">
                        <IconButton onClick={handleLogout} sx={FOOTER_BUTTON}>
                            <LogoutIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

            </Drawer>


            <FeedbackDialog
                open={feedbackOpen}
                onClose={() => setFeedbackOpen(false)}
            />

            {settings?.show_calculator && <Calculator />}

            {settings?.show_clock && <Clock />}

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minWidth: 0,
                    minHeight: "100vh",
                    p: { xs: 2, md: 3 },
                    backgroundColor: "background.default"
                }}
            >

                <Suspense fallback={<Box sx={{ p: 5, textAlign: "center", color: "text.secondary" }}>Loading...</Box>}>
                    <Outlet />
                </Suspense>

            </Box>

        </Box>
    );
}


export default Layout;
