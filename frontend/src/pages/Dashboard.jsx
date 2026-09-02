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
    Tooltip
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
import SystemStatusWidget from "../components/system/SystemStatusWidget";
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


            <Grid container spacing={3}>

                <Grid size={{ xs: 12, md: 3 }}>

                    <Card sx={{ minHeight: 240, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                        <CardContent>

                            <AssignmentIcon fontSize="large" />

                            <Typography variant="h6">
                                Requests
                            </Typography>

                            <Typography align="center">
                                Create and manage requests between departments, and track their status.
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

                {(user?.role === "admin" || user?.permissions?.includes("assets_access")) && (

                    <Grid size={{ xs: 12, md: 3 }}>

                        <Card sx={{ minHeight: 240, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <RestaurantIcon fontSize="large" />

                                <Typography variant="h6">
                                    F&B Assets
                                </Typography>

                                <Typography align="center">
                                    Manage F&B inventory, stock levels and equipment.
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

                {user?.role === "admin" && (

                    <Grid size={{ xs: 12, md: 3 }}>

                        <Card sx={{ minHeight: 240, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <PeopleIcon fontSize="large" />

                                <Typography variant="h6">
                                    User Management
                                </Typography>

                                <Typography align="center">
                                    Create users, set passwords and manage their roles, permissions and departments. (admin only)
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

                {(user?.role === "admin" || user?.permissions?.includes("categories_access")) && (

                    <Grid size={{ xs: 12, md: 3 }}>

                        <Card sx={{ minHeight: 240, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <CategoryIcon fontSize="large" />

                                <Typography variant="h6">
                                    Categories
                                </Typography>

                                <Typography align="center">
                                    Create/delete categories used in F&B assets.
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

                {(user?.role === "admin" || user?.permissions?.includes("locations_access")) && (

                    <Grid size={{ xs: 12, md: 3 }}>

                        <Card sx={{ minHeight: 240, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <LocationOnIcon fontSize="large" />

                                <Typography variant="h6">
                                    Locations
                                </Typography>

                                <Typography align="center">
                                    Create/delete locations used in F&B assets.
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

                {(user?.role === "admin" || user?.permissions?.includes("suppliers_access")) && (

                    <Grid size={{ xs: 12, md: 3 }}>

                        <Card sx={{ minHeight: 240, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <LocalShippingIcon fontSize="large" />

                                <Typography variant="h6">
                                    Suppliers
                                </Typography>

                                <Typography align="center">
                                    Create/delete suppliers used in F&B assets.
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
                        
                        <Card sx={{ minHeight: 240, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <BusinessIcon fontSize="large" />

                                <Typography variant="h6">
                                    Departments
                                </Typography>

                                <Typography align="center">
                                    Create/delete departments used across requests and users. (admin only)
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

                {user?.role === "admin" && (

                    <Grid size={{ xs: 12, md: 3 }}>

                        <Card sx={{ minHeight: 240, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <HistoryIcon fontSize="large" />

                                <Typography variant="h6">
                                    History
                                </Typography>

                                <Typography align="center">
                                    View a full audit trail of actions taken across the app. (admin only)
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

                {(user?.role === "admin" || user?.permissions?.includes("view_excel_access")) && (

                    <Grid size={{ xs: 12, md: 3 }}>

                        <Card sx={{ minHeight: 240, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <TableChartIcon fontSize="large" />

                                <Typography variant="h6">
                                    Excel Viewer
                                </Typography>

                                <Typography align="center">
                                    Work in progress!!!
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

                        <Card sx={{ minHeight: 240, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>

                            <CardContent>

                                <MonitorHeartIcon fontSize="large" />

                                <Typography variant="h6">
                                    System Monitor
                                </Typography>

                                <Typography align="center">
                                    Check server health, CPU, memory and disk usage. (admin only)
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