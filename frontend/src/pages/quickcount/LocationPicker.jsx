import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Card,
    CardActionArea,
    CircularProgress,
    Button
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { getLocations } from "../../services/locationService";
import { logout } from "../../services/auth";



function LocationPicker() {

    const navigate = useNavigate();

    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getLocations()
            .then((data) => setLocations(data))
            .catch(() => setError("Couldn't load locations. Check your connection and try again"))
            .finally(() => setLoading(false));
    }, []);

    
    function handlePicker(location) {
        navigate(`/quick-count/${location.id}`, {
            state: { locationName: location.name }
        });
    }

    function handleLogout() {
        logout();
        navigate("/");
    }


    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(180deg, #f4f6f8 0%, #b4c0f5 100%)",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 2
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    Quick Count
                </Typography>

                <Button
                    size="small"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                >
                    Log out
                </Button>
            </Box>

            <Typography
                variant="body1"
                sx={{ px: 2, mb: 2, color: "text.secondary" }}
            >
                Where are you working right now?
            </Typography>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Typography sx={{ px: 2, color: "error.main" }}>
                    {error}
                </Typography>
            )}

            {!loading && !error && (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        px: 2,
                        pb: 4
                    }}
                >
                    {locations
                        .filter((location) => location.name !== "Unassigned")
                        .map((location) => (
                        <Card key={location.id} elevation={2}>
                            <CardActionArea
                                onClick={() => handlePicker(location)}
                                sx={{ py: 3, px: 2 }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                    {location.name}
                                </Typography>
                            </CardActionArea>
                        </Card>
                    ))}

                    {locations.filter((location) => location.name !== "Unassigned").length === 0 && (
                        <Typography sx={{ color: "text.secondary" }}>
                            No locations found. Ask an admin to add one first.
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
}

export default LocationPicker;