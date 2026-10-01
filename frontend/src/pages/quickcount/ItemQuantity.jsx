import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    Box,
    Typography,
    IconButton,
    Button,
    CircularProgress,
    TextField,
    Paper,
    Chip
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { getItemLocations, submitItemLocationCount, dismissItemLocationCount } from "../../services/itemService";
import { formatCountedAt } from "../../utils/countedAt";




function ItemQuantity() {

    const navigate = useNavigate();
    const { locationId, itemLocationId } = useParams();
    const routerLocation = useLocation();

    const [itemLocation, setItemLocation] = useState(
        routerLocation.state?.itemLocation || null
    );
    const [locationName] = useState(routerLocation.state?.locationName || "");

    const [totalQuantity, setTotalQuantity] = useState(
        () => routerLocation.state?.itemLocation?.staff_counted_quantity ?? 0
    );

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [error, setError] = useState("");


    //always get the latest count from the server, the list we came from can be minutes old
    //updateNumber = false keeps what the person typed in the box
    async function loadLatest(updateNumber) {

        const data = await getItemLocations();

        const match = data.find(
            (il) => String(il.id) === String(itemLocationId)
        );

        if (match) {
            setItemLocation(match);

            if (updateNumber) {
                setTotalQuantity(match.staff_counted_quantity ?? 0);
            }
        } else {
            setError("Couldn't find this item. Go back and try again.");
        }
    }

    useEffect(() => {

        loadLatest(true)
            .catch(() => setError("Couldn't load this item. Check your connection and try again."))
            .finally(() => setLoading(false));
    }, [itemLocationId]);


    async function handleSave() {

        setSaving(true);
        setError("");

        try {
            await submitItemLocationCount(
                itemLocationId,
                totalQuantity,
                itemLocation?.staff_counted_at ?? null
            );

            navigate(`/quick-count/${locationId}`, {
                state: { locationName }
            });

        } catch (err) {

            //someone else saved first: show their count, keep this person's number in the box
            if (err.status === 409) {
                try {
                    await loadLatest(false);
                } catch {
                    //the message below still explains what happened
                }
            }

            setError(err.message || "Failed to save. Try again.");
            setSaving(false);
        }

    }

    async function handleResetCount() {

        setResetting(true);
        setError("");

        try {
            await dismissItemLocationCount(itemLocationId);

            navigate(`/quick-count/${locationId}`, {
                state: { locationName }
            });

        } catch (err) {
            setError(err.message || "Failed to reset count. Try again.");
        } finally {
            setResetting(false);
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
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                            Total on hand
                        </Typography>

                        {(itemLocation?.staff_counted_quantity === null || itemLocation?.staff_counted_quantity === undefined) && (
                            <Chip label="Not Counted" size="small" variant="outlined" />
                        )}
                    </Box>

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

                    {itemLocation?.staff_counted_by && (
                        <Typography variant="body2" sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}>
                            Counted by {itemLocation.staff_counted_by}
                            {itemLocation.staff_counted_at ? `, ${formatCountedAt(itemLocation.staff_counted_at)}` : ""}
                        </Typography>
                    )}
                </Paper>

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

                {itemLocation?.staff_counted_quantity !== null && itemLocation?.staff_counted_quantity !== undefined && (
                    <Button
                        fullWidth
                        variant="text"
                        size="small"
                        disabled={resetting}
                        onClick={handleResetCount}
                        sx={{ mt: 1 }}
                    >
                        {resetting ? "Resetting..." : "Actually, not counted yet"}
                    </Button>
                )}
            </Box>
        </Box>
    );
}


export default ItemQuantity;