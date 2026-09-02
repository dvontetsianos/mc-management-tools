import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    Box,
    Typography,
    TextField,
    List,
    ListItemButton,
    ListItemText,
    CircularProgress,
    IconButton
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getItemLocations } from "../../services/itemService";
import { getLocations } from "../../services/locationService";


function ItemList() {

    const navigate = useNavigate();
    const { locationId } = useParams();
    const routerLocation = useLocation();

    const [locationName, setLocationName] = useState(
        routerLocation.state?.locationName || ""
    );
    const [itemLocations, setItemLocations] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        getItemLocations()
        .then((data) => {
            const filtered = data.filter(
                (il) => String(il.location_id) === String(locationId)
            );

            filtered.sort((a, b) =>
            (a.item_name || "").localeCompare(b.item_name || "")
            );

            setItemLocations(filtered);
        })
        .catch(() => setError("Couldn't load items. Check your connection and try again."))
        .finally(() => setLoading(false));
        
    }, [locationId]);


    useEffect(() => {

        if (locationName) {
            return;
        }

        getLocations()
            .then((data) => {
                const match = data.find(
                    (loc) => String(loc.id) === String(locationId)
                );

                if (match) {
                    setLocationName(match.name);
                }
            })
            .catch(() => {});

    }, [locationId, locationName]);


    const visibleItems = useMemo(() => {

        if (!search.trim()) {
            return itemLocations;
        }

        const term = search.trim().toLowerCase();

        return itemLocations.filter((il) =>
            (il.item_name || "").toLowerCase().includes(term)
        );

    }, [itemLocations, search]);


    function handlePick(itemLocation) {
        navigate(`/quick-count/${locationId}/item/${itemLocation.id}`, {
            state: { itemLocation, locationName }
        });
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
                    gap: 1,
                    px: 1,
                    py: 2
                }}
            >
                <IconButton onClick={() => navigate("/quick-count")}>
                    <ArrowBackIcon />
                </IconButton>

                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    {locationName || "Items"}
                </Typography>
            </Box>

            <Box sx={{ px: 2, mb: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search items..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </Box>

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
                <List sx={{ px: 1, pb: 4 }}>
                    {visibleItems.map((itemLocation) => (
                        <ListItemButton
                            key={itemLocation.id}
                            onClick={() => handlePick(itemLocation)}
                            sx={{
                                mb: 1,
                                borderRadius: 2,
                                backgroundColor: "white"
                            }}
                        >
                            <ListItemText
                                primary={itemLocation.item_name}
                                secondary={`Total: ${itemLocation.total_quantity} · Broken: ${itemLocation.broken_quantity}`}
                            />
                        </ListItemButton>
                    ))}

                    {visibleItems.length === 0 && (
                        <Typography sx={{ px: 1, color: "text.secondary" }}>
                            {itemLocations.length === 0
                                ? "No items assigned to this location yet."
                            : "No items match your search."}
                        </Typography>
                    )}
                </List>
            )}
        </Box>
    );
}


export default ItemList;