import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { logout, getUser } from "../../services/auth";
import { getHotels } from "../../services/hotelService";



function LocationPicker() {

    const navigate = useNavigate();

    const [locations, setLocations] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    //the chosen hotel lives in the address (?hotel=3), so going back from a location returns to that hotel
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        Promise.all([getHotels(), getLocations()])
            .then(([hotelsData, locationsData]) => {
                setHotels(hotelsData);
                setLocations(locationsData);
            })
            .catch(() => setError("Couldn't load locations. Check your connection and try again"))
            .finally(() => setLoading(false));
    }, []);


    //only the hotels the admin gave this user in Users (admins and all-hotel users get every hotel)
    const user = getUser();
    const hasAllHotels = user?.role === "admin" || user?.permissions?.includes("all_hotels_access");

    const myHotels = hotels
        .filter((hotel) => hasAllHotels || (user?.hotel_ids || []).includes(hotel.id))
        .sort((a, b) => a.id - b.id);

    const selectedHotel = myHotels.find(
        (hotel) => String(hotel.id) === searchParams.get("hotel")
    ) || null;

    const hotelLocations = selectedHotel
        ? locations.filter(
            (location) => location.hotel_id === selectedHotel.id && location.name !== "Unassigned"
        )
        : [];


    function handlePickHotel(hotel) {
        setSearchParams({ hotel: String(hotel.id) });
    }

    function handleChangeHotel() {
        setSearchParams({});
    }

    
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

            {selectedHotel && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 2,
                        mb: 1
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {selectedHotel.name}
                    </Typography>

                    <Button size="small" onClick={handleChangeHotel}>
                        Change Hotel
                    </Button>
                </Box>
            )}

            <Typography
                variant="body1"
                sx={{ px: 2, mb: 2, color: "text.secondary" }}
            >
                {selectedHotel ? "Where are you working right now?" : "Which hotel are you counting?"}
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

            {!loading && !error && !selectedHotel && (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        px: 2,
                        pb: 4
                    }}
                >
                    {myHotels.map((hotel) => (
                        <Card key={hotel.id} elevation={2}>
                            <CardActionArea
                                onClick={() => handlePickHotel(hotel)}
                            sx={{ py: 3, px: 2 }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                    {hotel.name}
                                </Typography>
                            </CardActionArea>
                        </Card>
                    ))}

                    {myHotels.length === 0 && (
                        <Typography sx={{ color: "text.secondary" }}>
                            You don't have anyhotels yet. Ask an admin to add one to your user.
                        </Typography>
                    )}
                </Box>
            )}

            {!loading && !error && selectedHotel && (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        px: 2,
                        pb: 4
                    }}
                >
                    {hotelLocations.map((location) => (
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

                    {hotelLocations.length === 0 && (
                        <Typography sx={{ color: "text.secondary" }}>
                            No locations found for this hotel. Ask an admin to add one first.
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
}

export default LocationPicker;