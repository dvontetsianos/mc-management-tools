import { Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, Box, Button, Badge, Divider } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { logout, getUser, getToken } from "../services/auth";
import { useState, useEffect } from "react";
import FeedbackDialog from "../components/feedback/FeedbackDialog";
import DashboardIcon from "@mui/icons-material/Dashboard";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import PeopleIcon from "@mui/icons-material/People";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import FeedbackIcon from "@mui/icons-material/Feedback";
import LogoutIcon from "@mui/icons-material/Logout";
import RefreshIcon from "@mui/icons-material/Refresh";
import CategoryIcon from "@mui/icons-material/Category";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import TableChartIcon from "@mui/icons-material/TableChart";
import SystemMonitor from "../pages/SystemMonitor";
import Calculator from "../components/Calculator";
import Clock from "../components/Clock";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HistoryIcon from "@mui/icons-material/History";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import { getPendingRequestCount } from "../services/requestService";
import { API_URL } from "../config";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";


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

            if (!getToken()) {
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
        const interval = setInterval(checkPendingRequests, 30000);

        return () => clearInterval(interval);

    }, []);

    const user = getUser();

    const navigate = useNavigate();

    const [feedbackOpen, setFeedbackOpen] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [sessionTime, setSessionTime] = useState("30:00");

    const [pendingRequestCount, setPendingRequestCount] = useState(0);

    const handleLogout = () => {

        logout();

        navigate("/");

    };

    return (
        <div>
            <Drawer
                variant="permanent"
                sx={{
                    width: sidebarOpen ? 240 : 70,

                    "& .MuiDrawer-paper": {
                        width: sidebarOpen ? 240 : 70,
                        boxSizing: "border-box",
                        backgroundColor: "#080125",
                        color: "white",
                    },
                }}
            >
                <Toolbar

                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >

                    <ListItemButton 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        sx={{
                            width: "auto",
                            flex: "none",
                            ml: -2,
                            color: "#7d89f8"
                        }}

                    >
                        <ListItemText
                            primary="☰"
                        />
                    </ListItemButton>

                    {sidebarOpen && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                fontSize: "12px",
                                color: "white",
                                whiteSpace: "nowrap"
                            }}
                        >

                            <span>
                            Session Timer {sessionTime}
                            </span>

                            <Button
                                size="small"
                                variant="outlined"
                                onClick={extendSession}
                                sx={{
                                    minWidth: "25px",
                                    padding: "0px",
                                    color: "white",
                                    borderColor: "white"
                                }}
                            >
                                <RefreshIcon fontSize="small" />
                            </Button>
                        </Box>
                    )}
                </Toolbar>
                

                    <Box
                        sx={{
                            color: "#fffffff0",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column"
                        }}
                    >

                        <List>
                            <ListItem disablePadding>
                                <ListItemButton
                                    onClick={() => navigate("/dashboard")}
                                    sx={{
                                        justifyContent: sidebarOpen ? "initial" : "center",
                                    }}
                                >

                                    <DashboardIcon />

                                    {sidebarOpen && (
                                        <ListItemText
                                            primary="Dashboard"
                                            sx={{ ml: 2 }}
                                        />
                                    )}
                                </ListItemButton>
                            </ListItem>

                            {(user?.role === "admin" || user?.permissions?.includes("requests_access")) && (
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => navigate("/requests")}
                                        sx={{
                                            justifyContent: sidebarOpen ? "initial" : "center",
                                        }}
                                    >
                                        <Badge
                                            variant="dot"
                                            color="error"
                                            invisible={pendingRequestCount === 0}
                                        >
                                            <AssignmentIcon />
                                        </Badge>

                                        {sidebarOpen && (
                                            <ListItemText
                                                primary="Requests"
                                                sx={{ ml: 2 }}
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            )}

                            {(user?.role === "admin" || user?.permissions?.includes("assets_access")) && (
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => navigate("/assets")}
                                        sx={{
                                            justifyContent: sidebarOpen ? "initial" :"center",
                                        }}
                                    >

                                        <RestaurantIcon />

                                        {sidebarOpen && (
                                            <ListItemText
                                            primary="F&B Items"
                                            sx={{ ml: 2 }}
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            )}

                            {(user?.role === "admin" || user?.permissions?.includes("housekeeping_items_access")) && (
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => navigate("/housekeeping-items")}
                                        sx={{
                                            justifyContent: sidebarOpen ? "initial" :"center",
                                        }}
                                    >
                                        <CleaningServicesIcon />

                                        {sidebarOpen && (
                                            <ListItemText
                                                primary="Housekeeping Items"
                                                sx={{ ml: 2 }}
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            )}

                            {(user?.role ==="admin" || user?.permissions?.includes("purchases_access")) && (
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => navigate("/purchases")}
                                        sx={{
                                            justifyContent: sidebarOpen ? "initial" : "center",
                                        }}
                                    >
                                        <ShoppingCartIcon />

                                        {sidebarOpen && (
                                            <ListItemText
                                                primary="Purchases"
                                                sx={{ ml: 2 }}
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            )}

                            {(user?.role === "admin" || user?.permissions?.includes("movements_access")) && (
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => navigate("/movements")}
                                        sx={{
                                            justifyContent: sidebarOpen ? "initial" : "center",
                                        }}
                                    >
                                        <SwapHorizIcon />

                                        {sidebarOpen && (
                                            <ListItemText
                                                primary="Item Movements"
                                                sx={{ ml: 2 }}
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            )}

                            {(user?.role === "admin" || user?.permissions?.includes("lost_found_access")) && (
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => navigate("/lost-found")}
                                        sx={{
                                            justifyContent: sidebarOpen ? "initial" : "center",
                                        }}
                                    >
                                        <FindInPageIcon />

                                        {sidebarOpen && (
                                            <ListItemText
                                                primary="Lost & Found"
                                                sx={{ ml: 2 }}
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            )}

                            {user?.role === "admin" && (
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => navigate("/users")}
                                        sx={{
                                            justifyContent: sidebarOpen ? "initial" : "center",
                                        }}
                                    >

                                        <PeopleIcon />

                                        {sidebarOpen && (
                                            <ListItemText
                                                primary="User Management"
                                                sx={{ ml: 2 }}
                                            />
                                        )}
                                    
                                    </ListItemButton>
                                </ListItem>
                            )}

                            {(user?.role === "admin" || user?.permissions?.includes("categories_access")) && (
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => navigate("/categories")}
                                        sx={{
                                            justifyContent: sidebarOpen ? "initial" : "center",
                                        }}
                                    >
                                        <CategoryIcon />

                                        {sidebarOpen && (
                                            <ListItemText
                                                primary="Categories"
                                                sx={{ ml: 2 }}
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            )}

                            {(user?.role === "admin" || user?.permissions?.includes("locations_access")) && (
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => navigate("/locations")}
                                        sx={{
                                            justifyContent: sidebarOpen ? "initial" : "center",
                                        }}
                                    >
                                        <LocationOnIcon />

                                        {sidebarOpen && (
                                            <ListItemText
                                                primary="Locations"
                                                sx={{ ml: 2 }}
                                            />
                                        )}

                                    </ListItemButton>

                                </ListItem>
                            )}

                            {(user?.role === "admin" || user?.permissions?.includes("suppliers_access")) && (
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => navigate("/suppliers")}
                                        sx={{
                                            justifyContent: sidebarOpen ? "initial" : "center",
                                        }}
                                    >
                                        <LocalShippingIcon />

                                        {sidebarOpen && (
                                            <ListItemText
                                                primary="Suppliers"
                                                sx={{ ml: 2 }}
                                            />
                                        )}

                                    </ListItemButton>

                                </ListItem>
                            )}

                            {user?.role === "admin" && (
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => navigate("/departments")}
                                        sx={{
                                            justifyContent: sidebarOpen ? "initial" : "center",
                                        }}
                                    >
                                        <BusinessIcon />

                                        {sidebarOpen && (
                                            <ListItemText
                                                primary="Departments"
                                                sx={{ ml: 2 }}
                                            />
                                        )}
                                    </ListItemButton>

                                </ListItem>
                            )}

                            {user?.role === "admin" && (
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => navigate("/history")}
                                        sx={{
                                            justifyContent: sidebarOpen ? "initial" : "center",
                                        }}
                                    >
                                        <HistoryIcon />

                                        {sidebarOpen && (
                                            <ListItemText
                                                primary="History"
                                                sx={{ ml: 2 }}
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            )}

                            {(user?.role === "admin" || user?.permissions?.includes("reports_access")) && (
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => navigate("/reports")}
                                        sx={{
                                            justifyContent: sidebarOpen ? "initial" : "center",
                                        }}
                                    >
                                        <AssessmentIcon />

                                        {sidebarOpen && (
                                            <ListItemText
                                                primary="Reports"
                                                sx={{ ml: 2 }}
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            )}

                            {(user?.role === "admin" || user?.permissions?.includes("view_excel_access")) && (
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => navigate("/excel")}
                                        sx={{
                                            justifyContent: sidebarOpen ? "initial" : "center",
                                        }}
                                    >
                                        <TableChartIcon />

                                        {sidebarOpen && (
                                            <ListItemText
                                                primary="Excel Viewer"
                                                sx={{ ml: 2 }}
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            )}

                            {user?.role === "admin" && (
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => navigate("/system-monitor")}
                                        sx={{
                                            justifyContent: sidebarOpen ? "initial" : "center",
                                        }}
                                    >
                                        <MonitorHeartIcon />

                                        {sidebarOpen && (
                                            <ListItemText
                                                primary="System Monitor"
                                                sx={{ ml: 2 }}
                                            />
                                        )}

                                    </ListItemButton>
                                </ListItem>
                            )}
                            
                        </List>

                        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.2)", mt: "auto", mb: 0 }} />

                        <Box>
                            
                            <List>

                                <ListItem disablePadding>

                                    <ListItemButton
                                        onClick={() => setFeedbackOpen(true)}
                                        sx={{
                                            justifyContent: sidebarOpen ? "initial" : "center",
                                        }}
                                    >

                                        <FeedbackIcon />

                                        {sidebarOpen && (
                                            <ListItemText
                                                primary="Feedback"
                                                sx={{ ml: 2 }}
                                            />
                                        )}
                                    </ListItemButton>

                                </ListItem>

                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={handleLogout}
                                        sx={{
                                            justifyContent: sidebarOpen ? "initial" : "center",
                                        }}
                                    >

                                        <LogoutIcon />

                                        {sidebarOpen && (
                                            <ListItemText
                                                primary="Logout"
                                                sx={{ ml: 2 }}
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>


                            </List>
                        </Box>

                    </Box>

            </Drawer>

            
            <FeedbackDialog
                open={feedbackOpen}
                onClose={() => setFeedbackOpen(false)}
            />

            <Calculator />

            <Clock />

            <main
                style={{
                    marginLeft: sidebarOpen ? "240px" : "70px",
                    width: sidebarOpen ? "calc(100% - 240px)" : "calc(100% - 70px)",
                    boxSizing: "border-box",
                    overflowX: "hidden",
                    marginTop: "0px",
                    padding: "0px",
                    minHeight: "100vh",
                    background: "linear-gradient(180deg, #f4f6f8 0%, #b4c0f5 100%)"
                }}
            >

                <Outlet />

            </main>

            

        </div>
    );
}


export default Layout;