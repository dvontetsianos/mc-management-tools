import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    Box,
    Typography,
    IconButton,
    Button,
    CircularProgress,
    TextField,
    Paper
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { getItemLocations, updateItemLocation } from "../../services/itemService";



function ItemQuantity() {

    const navigate = useNavigate();
    const { locationId, itemLocationId } = useParams();
    const routerLocation = useLocation();

    const [itemLocation, setItemLocation] = useState(
        routerLocation.state?.itemLocation || null
    );
    const [locationName] = useState(routerLocation.state?.locationName || "");

    const [totalQuantity, setTotalQuantity] = useState(
        routerLocation.state?.itemLocation?.total_quantity ?? 0
    );

    const [brokenQuantity, setBrokenQuantity] = useState(
        routerLocation.state?.itemLocation?.broken_quantity ?? 0
    );

    const [loading, setLoading] = useState(!routerLocation.state?.itemLocation);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");


    useEffect(() => {

        if (itemLocation) {
            return;
        }

        getItemLocations()
            .then((data) => {
                const match = data.find(
                    (il) => String(il.id_ == String(itemLocationId))
                );

                if (match) {
                    setItemLocation(match);
                    setTotalQuantity(match.total_quantity);
                    setBrokenQuantity(match.broken_quantity);
                } else {
                    setError("Couldn't find this item. Go back and try again.");
                }

            })
            .catch(() => setError("Couldn't loadthis item. Check your connection and try again."))
            .finally(() => setLoading(false));

    }, [itemLocation, itemLocationId]);


    async function handleSave() {

        setSaving(true);
        setError("");

        try {
            await updateItemLocation(itemLocationId, {
                total_quantity: totalQuantity,
                broken_quantity: brokenQuantity
            });

            navigate(`/quick-count/${locationId}`, {
                state: { locationName }
            });

        } catch (err) {
            setError(err.message || "Failed to save. Try again.");
            setSaving(false);
        }

    }


        if (loading) {
            return (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                    <CircularProgress />
                </Box>
            );
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
                <IconButton onClick={() => navigate(`/quick-count/${locationId}`, { state: { locationName } })}>
                    <ArrowBackIcon />
                </IconButton>

                <Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold", lineHeight: 1.2 }}>
                        {itemLocation?.item_name || "Item"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {locationName}
                    </Typography>
                </Box>
            </Box>

            {error && (
                <Typography sx={{ px: 2, mb: 1, color: "error.main" }}>
                    {error}
                </Typography>
            )}

            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 3 }}>

                <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
                        Total on hand
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                        <IconButton
                            size="large"
                            onClick={() => setTotalQuantity((q) => Math.max(0, q -1))}
                            sx={{ border: "1px solid #ccc" }}
                        >
                            <RemoveIcon />
                        </IconButton>

                        <TextField
                            type="number"
                            value={totalQuantity}
                            onChange={(e) => {
                                const value = e.target.value;
                                setTotalQuantity(value === "" ? 0 : Math.max(0, Number(value)));
                            }}
                            onFocus={(e) => e.target.select()}
                            inputProps={{
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                                style: {
                                    textAlign: "center",
                                    fontSize: "2.5rem",
                                    fontVariantNumeric: "tabular-nums",
                                    padding: "8px 0"
                                }
                            }}
                            sx={{ width: 120 }}
                        />

                        <IconButton
                            size="large"
                            onClick={() => setTotalQuantity((q) => q + 1)}
                            sx={{ border: "1px solid #ccc" }}
                        >
                            <AddIcon />
                        </IconButton>
                    </Box>
                </Paper>

                {/*
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
                        Broken / out of service
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap : 3 }}>
                        <IconButton
                            size="large"
                            onClick={() => setBrokenQuantity((q) => Math.max(0, q - 1))}
                            sx={{ border: "1px soled #ccc" }}
                        >
                            <RemoveIcon />
                        </IconButton>

                        <Typography
                            variant="h3"
                            sx={{ minWidth: 80, textAlign: "center", fontVariantNumeric: "tabular-nums" }}
                        >
                            {brokenQuantity}
                        </Typography>

                        <IconButton
                            size="large"
                            onClick={() => setBrokenQuantity((q) => q + 1)}
                            sx={{ border: "1px solid #ccc" }}
                        >
                            <AddIcon />
                        </IconButton>
                    </Box>
                </Paper>
                */}
            </Box>

            <Box sx={{ px: 2, mt: 4, mb: 4 }}>
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={saving}
                    onClick={handleSave}
                    sx={{ py: 1.5, fontWeight: "bold" }}
                >
                    {saving ? "Saving..." : "Save count"}
                </Button>
            </Box>
        </Box>
    );
}


export default ItemQuantity;