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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography
} from "@mui/material";
import { createItemMovement } from "../../services/movementService";



function MoveItemDialog({
    open,
    onClose,
    item,
    locations,
    onChange
}) {

    const [fromLocationId, setFromLocationId] = useState("");
    const [toLocationId, setToLocationId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("");

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    //reset the form fresh each time the dialog is opened for an item
    useEffect(() => {

        if (open && item) {
            setFromLocationId("");
            setToLocationId("");
            setQuantity("");
            setReason("");
            setError("");
        }
    }, [open, item]);

    if (!item) {
        return null;
    }

    const sourceOptions = (item.locations || []).filter(
        (loc) => loc.total_quantity > 0
    );

    const selectedSource = sourceOptions.find(
        (loc) => String(loc.location_id) === String(fromLocationId)
    );

    const destinationOptions = locations.filter(
        (loc) => String(loc.id) !== String(fromLocationId)
    );

    const handleMove = async () => {

        setError("");

        if (!fromLocationId) {
            setError("Please choose a source location.");
            return;
        }

        if (!toLocationId) {
            setError("Please choose a destination location.");
            return;
        }

        if (!quantity || Number(quantity) <= 0) {
            setError("Please enter a quantity greater than 0.");
            return;
        }

        if (selectedSource && Number(quantity) > selectedSource.total_quantity) {
            setError(`Only ${selectedSource.total_quantity} available at that location.`);
            return;
        }

        setSaving(true);

        try {

            await createItemMovement({
                item_id: item.id,
                from_location_id: Number(fromLocationId),
                to_location_id: Number(toLocationId),
                quantity: Number(quantity),
                reason: reason || null
            });

            setSaving(false);
            onChange();
            onClose();

        } catch (err) {
            setSaving(false);
            setError(err.message || "Failed to move item.");

        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                Move Item - {item.name}
            </DialogTitle>

            <DialogContent>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {sourceOptions.length === 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        This item has no stock at any location yet, so it can't be moved. Stock needs to be placed into a location first.
                    </Alert>
                )}

                <Stack spacing={2} sx={{ mt: 1 }}>

                    <FormControl fullWidth disabled={sourceOptions.length === 0}>
                        <InputLabel>From</InputLabel>

                        <Select
                            value={fromLocationId}
                            label="From"
                            onChange={(e) => setFromLocationId(e.target.value)}
                        >
                            {sourceOptions.map((loc) => (
                                <MenuItem key={loc.location_id} value={loc.location_id}>
                                    {loc.location} (Available: {loc.total_quantity})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>To</InputLabel>

                        <Select
                            value={toLocationId}
                            label="To"
                            onChange={(e) => setToLocationId(e.target.value)}
                        >
                            {destinationOptions.map((loc) => (
                                <MenuItem key={loc.id} value={loc.id}>
                                    {loc.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        fullWidth
                    />

                    {selectedSource && (
                        <Typography variant="caption" color="text.secondary">
                            {selectedSource.total_quantity} available at {selectedSource.location}
                        </Typography>
                    )}

                    <TextField
                        label="Reason (optional)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        fullWidth
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={saving}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleMove}
                    disabled={saving || sourceOptions.length === 0}
                >
                    Move
                </Button>
            </DialogActions>
        </Dialog>
    );
}


export default MoveItemDialog;