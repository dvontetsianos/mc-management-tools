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
    IconButton,
    Chip,
    Avatar
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import { API_URL } from "../../config";
import { getItemLocations } from "../../services/itemService";
import { getLocations } from "../../services/locationService";
import { itemDetailsLine } from "../../utils/itemFields";


function ItemList() {

    const navigate = useNavigate();
    const { locationId } = useParams();
    const routerLocation = useLocation();

    const [locationName, setLocationName] = useState(
        routerLocation.state?.locationName || ""
    );
    const [hotelId, setHotelId] = useState(null);
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

            //counted items first, then the ones not counted yet.
            //inside each group: by name, then same-named items by size (numeric: 24cm before 100cm), then by color
            const isCounted = (il) =>
                il.staff_counted_quantity !== null && il.staff_counted_quantity !== undefined;

            filtered.sort((a, b) =>
                Number(isCounted(a)) - Number(isCounted(b)) ||
                (a.item_name || "").localeCompare(b.item_name || "") ||
                (a.item_size || "").localeCompare(b.item_size || "", undefined, { numeric: true }) ||
                (a.item_color || "").localeCompare(b.item_color || "")
            );

            setItemLocations(filtered);
        })
        .catch(() => setError("Couldn't load items. Check your connection and try again."))
        .finally(() => setLoading(false));
        
    }, [locationId]);


    //always look the location up, so we know its hotel for the back arrow
    useEffect(() => {

        getLocations()
            .then((data) => {
                const match = data.find(
                    (loc) => String(loc.id) === String(locationId)
                );

                if (match) {
                    setLocationName(match.name);
                    setHotelId(match.hotel_id);
                }
            })
            .catch(() => {});

    }, [locationId]);


    const visibleItems = useMemo(() => {

        if (!search.trim()) {
            return itemLocations;
        }

        const term = search.trim().toLowerCase();

        //the search also finds codes, sizes, colors and materials
        return itemLocations.filter((il) =>
            [il.item_name, il.item_code, il.item_size, il.item_color, il.item_material]
                .some((value) => (value || "").toLowerCase().includes(term))
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
                background: "linear-gradient(180deg, #F3F5FA 0%, #DCE4F5 100%)",
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
                <IconButton onClick={() => navigate(hotelId ? `/quick-count?hotel=${hotelId}` : "/quick-count")}>
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
                    placeholder="Search name, size, color, code..."
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
                    {visibleItems.map((itemLocation) => {

                        const details = itemDetailsLine(itemLocation);

                        const isCounted =
                            itemLocation.staff_counted_quantity !== null &&
                            itemLocation.staff_counted_quantity !== undefined;

                        return (
                            <ListItemButton
                                key={itemLocation.id}
                                onClick={() => handlePick(itemLocation)}
                            sx={{
                                mb: 1,
                                borderRadius: 2,
                                backgroundColor: isCounted ? "#c8e6c9" : "white",
                                border: "2px solid",
                                borderColor: isCounted ? "#66bb6a" : "transparent",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 1
                            }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                                    <Avatar
                                        variant="rounded"
                                        src={itemLocation.item_image_url ? `${API_URL}/${itemLocation.item_image_url}` : undefined}
                                        alt={itemLocation.item_name || "Item"}
                                        slotProps={{ img: { loading: "lazy" } }}
                                        sx={{ width: 48, height: 48, backgroundColor: "#f5f5f5", color: "#9e9e9e" }}
                                    >
                                        <ImageNotSupportedIcon fontSize="small" />
                                    </Avatar>

                                    <ListItemText
                                        primary={itemLocation.item_name}
                                        secondary={
                                            <>
                                                {details && (
                                                    <Box component="span" sx={{ display: "block", color: "text.primary" }}>
                                                        {details}
                                                    </Box>
                                                )}
                                                {itemLocation.item_code && (
                                                    <Box component="span" sx={{ display: "block", fontSize: "0.75rem" }}>
                                                        {itemLocation.item_code}
                                                    </Box>
                                                )}
                                            </>
                                        }
                                    />
                                </Box>

                                {isCounted && (
                                    <Chip
                                        icon={<CheckCircleIcon />}
                                        label={`Counted: ${itemLocation.staff_counted_quantity}`}
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                        sx={{ flexShrink: 0 }}
                                    />
                                )}
                            </ListItemButton>
                        );
                    })}

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