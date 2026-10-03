import { useState } from "react";
import { getUser } from "../services/auth";
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    Box,
    IconButton,
    Divider
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import PeopleIcon from "@mui/icons-material/People";
import CategoryIcon from "@mui/icons-material/Category";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BusinessIcon from "@mui/icons-material/Business";
import HistoryIcon from "@mui/icons-material/History";
import TableChartIcon from "@mui/icons-material/TableChart";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import ImageIcon from "@mui/icons-material/Image";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { APP_TITLE } from "../config";
import marbellaelixbg from "../assets/marbellaelixbg.jpg";



function Dashboard() {

    const user = getUser();

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
                <ImageIcon sx={{ fontSize:10 }} />
            </IconButton>

            <Typography variant="h4" gutterBottom>
                {APP_TITLE}
            </Typography>

            <Typography variant="text" sx={{ mb: 3 }}>
                Welcome <b>{user?.sub}</b>
            </Typography>


            {/* ================= MAIN TOOLS ================= */}

            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Main Tools
            </Typography>

            <Grid container spacing={3} sx={{ mb: 5 }}>

                {hasPermission("assets_access") && (

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>

                        <Card sx={{ minHeight: 280, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <RestaurantIcon fontSize="large" />

                                <Typography variant="h6">
                                    F&B Items
                                </Typography>

                                <Typography align="center">
                                    Manage every piece of F&B equipment and stock across all your locations — bars, storerooms, and more. Assign quantities, log purchases and moves, track breakages, and let staff verify counts on the go with Quick Count.
                                </Typography>

                                <Button
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    href="/assets"
                                >
                                    GO
                                </Button>

                            </CardContent>

                        </Card>

                    </Grid>

                )}

                {hasPermission("housekeeping_items_access") && (

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>

                        <Card sx={{ minHeight: 280, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <CleaningServicesIcon fontSize="large" />

                                <Typography variant="h6">
                                    Housekeeping Items
                                </Typography>

                                <Typography align="center">
                                    Manage the equipment and supplies housekeeping keeps in every location, the same way F&B Items works for F&B stock. Assign quantities per location, track what's broken or missing, and let staff confirm counts through Quick Count.
                                </Typography>

                                <Button
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    href="/housekeeping-items"
                                >
                                    GO
                                </Button>

                            </CardContent>

                        </Card>

                    </Grid>

                )}

                {hasPermission("requests_access") && (

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>

                        <Card sx={{ minHeight: 280, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <AssignmentIcon fontSize="large" />

                                <Typography variant="h6">
                                    Requests
                                </Typography>

                                <Typography align="center">
                                    Submit requests to other departments — maintenance issues, supply needs, anything that crosses team lines — and follow each one from submission through to completion. See exactly where a request stands without chasing anyone down.
                                </Typography>

                                <Button
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    href="/requests"
                                >
                                    GO
                                </Button>

                            </CardContent>
                        </Card>
                    </Grid>

                )}

                {hasPermission("purchases_access") && (

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>

                        <Card sx={{ minHeight: 280, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <ShoppingCartIcon fontSize="large" />

                                <Typography variant="h6">
                                    Purchases
                                </Typography>

                                <Typography align="center">
                                    Log every purchase made for items — supplier, cost, and quantity received — building a running record you can filter by category, supplier, or date range. Use it to track spending and reconcile what's actually in stock.
                                </Typography>

                                <Button
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    href="/purchases"
                                >
                                    GO
                                </Button>

                            </CardContent>

                        </Card>

                    </Grid>

                )}

                {hasPermission("lost_found_access") && (

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>

                        <Card sx={{ minHeight: 280, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <FindInPageIcon fontSize="large" />

                                <Typography variant="h6">
                                    Lost & Found
                                </Typography>

                                <Typography align="center">
                                    Log items found around the property with a description, where and when they turned up, and who found them. Track claims as guests come to collect their belongings, so nothing gets lost twice.
                                </Typography>

                                <Button
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    href="/lost-found"
                                >
                                    GO
                                </Button>

                            </CardContent>

                        </Card>

                    </Grid>

                )}

                {hasPermission("reports_access") && (

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>

                        <Card sx={{ minHeight: 280, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <AssessmentIcon fontSize="large" />

                                <Typography variant="h6">
                                    Reports
                                </Typography>

                                <Typography align="center">
                                    See spend and activity summaries pulled from your purchase and item data, broken down by category, supplier, or department. Drill into the numbers without digging through raw tables yourself.
                                </Typography>

                                <Button
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    href="/reports"
                                >
                                    GO
                                </Button>

                            </CardContent>

                        </Card>

                    </Grid>

                )}

            </Grid>


            {/* ================= MANAGEMENT & ADMIN ================= */}

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Management & Admin
            </Typography>

            <Grid container spacing={3}>

                {user?.role === "admin" && (

                    <Grid size={{ xs: 12, md: 3 }}>

                        <Card sx={{ minHeight: 220, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <PeopleIcon fontSize="large" />

                                <Typography variant="h6">
                                    User Management
                                </Typography>

                                <Typography align="center">
                                    Add staff accounts, reset passwords, and control what each person can see and do. (admin only)
                                </Typography>

                                <Button
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    href="/users"
                                >
                                    GO
                                </Button>

                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {hasPermission("categories_access") && (

                    <Grid size={{ xs: 12, md: 3 }}>

                        <Card sx={{ minHeight: 220, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <CategoryIcon fontSize="large" />

                                <Typography variant="h6">
                                    Categories
                                </Typography>

                                <Typography align="center">
                                    Organize F&B items into categories to make filtering and reporting easier.
                                </Typography>

                                <Button
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    href="/categories"
                                >
                                    GO
                                </Button>

                            </CardContent>

                        </Card>

                    </Grid>

                )}

                {hasPermission("locations_access") && (

                    <Grid size={{ xs: 12, md: 3 }}>

                        <Card sx={{ minHeight: 220, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <LocationOnIcon fontSize="large" />

                                <Typography variant="h6">
                                    Locations
                                </Typography>

                                <Typography align="center">
                                    Manage the physical locations items can be assigned to — bars, storerooms, and more.
                                </Typography>

                                <Button
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    href="/locations"
                                >
                                    GO
                                </Button>

                            </CardContent>

                        </Card>

                    </Grid>
                )}

                {hasPermission("suppliers_access") && (

                    <Grid size={{ xs: 12, md: 3 }}>

                        <Card sx={{ minHeight: 220, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <LocalShippingIcon fontSize="large" />

                                <Typography variant="h6">
                                    Suppliers
                                </Typography>

                                <Typography align="center">
                                    Keep a directory of suppliers and link them to the items you order from each.
                                </Typography>

                                <Button
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    href="/suppliers"
                                >
                                    GO
                                </Button>

                            </CardContent>

                        </Card>

                    </Grid>

                )}

                {user?.role === "admin" && (

                    <Grid size={{ xs: 12, md: 3 }}>
                        
                        <Card sx={{ minHeight: 220, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <BusinessIcon fontSize="large" />

                                <Typography variant="h6">
                                    Departments
                                </Typography>

                                <Typography align="center">
                                    Define the departments used across requests, users, and reporting. (admin only)
                                </Typography>

                                <Button
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    href="/departments"
                                >
                                    GO
                                </Button>

                            </CardContent>

                        </Card>

                    </Grid>

                )}

                {hasPermission("movements_access") && (

                    <Grid size={{ xs: 12, md: 3 }}>

                        <Card sx={{ minHeight: 220, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <SwapHorizIcon fontSize="large" />

                                <Typography variant="h6">
                                    Movements
                                </Typography>

                                <Typography align="center">
                                    Browse a full log of item transfers between locations — what moved, when, and who moved it.
                                </Typography>

                                <Button
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    href="/movements"
                                >
                                    GO
                                </Button>

                            </CardContent>

                        </Card>

                    </Grid>

                )}

                {user?.role === "admin" && (

                    <Grid size={{ xs: 12, md: 3 }}>

                        <Card sx={{ minHeight: 220, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <HistoryIcon fontSize="large" />

                                <Typography variant="h6">
                                    History
                                </Typography>

                                <Typography align="center">
                                    Review a complete audit trail of who changed what, and when. (admin only)
                                </Typography>

                                <Button
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    href="/history"
                                >
                                    GO
                                </Button>

                            </CardContent>

                        </Card>

                    </Grid>

                )}

                {hasPermission("view_excel_access") && (

                    <Grid size={{ xs: 12, md: 3 }}>

                        <Card sx={{ minHeight: 220, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <TableChartIcon fontSize="large" />

                                <Typography variant="h6">
                                    Excel Viewer
                                </Typography>

                                <Typography align="center">
                                    Browse and export item data in spreadsheet form. (still a work in progress)
                                </Typography>

                                <Button
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    href="/excel"
                                >
                                    GO
                                </Button>

                            </CardContent>

                        </Card>

                    </Grid>

                )}

                {user?.role === "admin" && (

                    <Grid size={{ xs: 12, md: 3 }}>

                        <Card sx={{ minHeight: 220, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <MonitorHeartIcon fontSize="large" />

                                <Typography variant="h6">
                                    System Monitor
                                </Typography>

                                <Typography align="center">
                                    Keep an eye on server health — CPU, memory, and disk usage at a glance. (admin only)
                                </Typography>

                                <Button
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    href="/system-monitor"
                                >
                                    GO
                                </Button>

                            </CardContent>

                        </Card>

                    </Grid>

                )}
            
            </Grid>
        </Box>
    );

}

export default Dashboard;