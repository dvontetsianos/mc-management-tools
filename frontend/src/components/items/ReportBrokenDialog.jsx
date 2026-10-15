import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Alert,
    Stack,
    TextField,
    MenuItem,
    Typography
} from "@mui/material";
import { reportBroken } from "../../services/itemService";
import LocationLabel from "../LocationLabel";


//"Report broken" for one item: where, how many, and an optional note.
//used on the Items pages (item.locations = every location with stock)
//and in Quick Count (item.locations = only the location being counted).
//showStock = false hides how many the system has, so Quick Count staff still count without knowing it
function ReportBrokenDialog({ open, onClose, item, onReported, showStock = true }) {

    const [itemLocationId, setItemLocationId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [note, setNote] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const stockLocations = (item?.locations || []).filter((loc) => loc.total_quantity > 0);

    //start fresh every time it opens (only then, not while typing); with only one location, it's already chosen
    useEffect(() => {
        if (open) {
            setItemLocationId(stockLocations.length === 1 ? stockLocations[0].id : "");
            setQuantity("");
            setNote("");
            setError("");
        }
    }, [open]);

    if (!item) {
        return null;
    }

    const chosen = stockLocations.find((loc) => loc.id === itemLocationId);

    const handleSave = async () => {

        setError("");

        if (!chosen) {
            setError("Choose where they broke.");
            return;
        }

        const number = Number(quantity);

        if (!Number.isInteger(number) || number <= 0) {
            setError("Enter how many broke (a whole number above 0).");
            return;
        }

        if (number > chosen.total_quantity) {
            setError(`That's more than there are at ${chosen.location}. Check the number.`);
            return;
        }

        setSaving(true);

        try {
            const result = await reportBroken(chosen.id, number, note);
            onReported(result.message);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">

            <DialogTitle>
                Report broken
                <Typography variant="body2" color="text.secondary">
                    {item.name}
                </Typography>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>

                    <TextField
                        select
                        label="Where"
                        value={itemLocationId}
                        onChange={(e) => setItemLocationId(e.target.value)}
                        disabled={stockLocations.length === 1}
                        fullWidth
                    >
                        {stockLocations.map((loc) => (
                            <MenuItem key={loc.id} value={loc.id}>
                                <LocationLabel name={loc.location} hotel={loc.hotel_name} />
                                {showStock && <>&nbsp;({loc.total_quantity})</>}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="How many broke"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        slotProps={{ htmlInput: { min: 1, inputMode: "numeric" } }}
                        fullWidth
                    />

                    <TextField
                        label="Note (optional)"
                        placeholder="e.g. dropped tray"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        fullWidth
                    />

                    {error && <Alert severity="error">{error}</Alert>}

                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    color="error"
                    disabled={saving}
                    onClick={handleSave}
                >
                    {saving ? "Saving..." : "Report broken"}
                </Button>
            </DialogActions>

        </Dialog>
    );
}

export default ReportBrokenDialog;
