import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Alert,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box
} from "@mui/material";
import {
    createItemLocation,
    updateItemLocation,
    deleteItemLocation
} from "../../services/itemService";



function ItemAssignLocationsDialog({
    open,
    onClose,
    item,
    locations,
    onChange
}) {

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const [draftAssignments, setDraftAssignments] = useState([]);

    const [newLocationId, setNewLocationId] = useState("");
    const [newTotalQty, setNewTotalQty] = useState("0");

    const tempIdRef = useRef(0);

    //restart the draft fresh each time the dialog is opened for an item

    useEffect(() => {

        if (open && item) {
            setDraftAssignments(
                (item.locations || []).map((loc) => ({
                    id: loc.id,
                    isNew: false,
                    location_id: loc.location_id,
                    location: loc.location,
                    total_quantity: loc.total_quantity,
                    broken_quantity: loc.broken_quantity
                }))
            );

            setNewLocationId("");
            setNewTotalQty("0");
            setError("");
        }
    }, [open, item]);

    if (!item) {
        return null;
    }

    const assignedLocationIds = draftAssignments.map((row) => row.location_id);

    const availableLocations = locations.filter(
        (loc) => !assignedLocationIds.includes(loc.id)
    );

    const handleAddToDraft = () => {

        if (!newLocationId) {
            setError("Please select a location.");
            return;
        }

        const locationObj = locations.find((loc) => loc.id === newLocationId);

        tempIdRef.current -= 1;

        setDraftAssignments((prev) => [
            ...prev,
            {
                id: tempIdRef.current,
                isNew: true,
                location_id: newLocationId,
                location: locationObj ? locationObj.name : "",
                total_quantity: newTotalQty,
                broken_quantity: 0
            }
        ]);

        setError("");
        setNewLocationId("");
        setNewTotalQty("0");
    };

    const handleRemoveFromDraft = (rowId) => {
        setDraftAssignments((prev) => prev.filter((row) => row.id !== rowId));
    };

    const handleDraftFieldChange = (rowId, field, value) => {
        setDraftAssignments((prev) =>
            prev.map((row) =>
                row.id === rowId ? { ...row, [field]: value } : row
            )
        );
    };

    const handleSave = async () => {

        setSaving(true);

        const originalLocations = item.locations || [];
        const draftIds = new Set(
            draftAssignments.filter((row) => !row.isNew).map((row) => row.id)
        );

        const removed = originalLocations.filter((loc) => !draftIds.has(loc.id));

        const added = draftAssignments.filter((row) => row.isNew);

        const updated = draftAssignments.filter((row) => {

            if (row.isNew) return false;

            const original = originalLocations.find((loc) => loc.id === row.id);

            if (!original) return false;

            return (
                String(row.total_quantity) !== String(original.total_quantity) ||
                String(row.broken_quantity) !== String(original.broken_quantity)
            );
        });

        try {

            for (const row of removed) {
                await deleteItemLocation(row.id);
            }

            for (const row of updated) {
                await updateItemLocation(row.id, {
                    total_quantity: row.total_quantity,
                    broken_quantity: row.broken_quantity
                });
            }

            for (const row of added) {
                await createItemLocation({
                    item_id: item.id,
                    location_id: row.location_id,
                    total_quantity: row.total_quantity,
                    broken_quantity: row.broken_quantity
                });
            }

            setError("");
            setSaving(false);
            onChange();
            onClose();

        } catch (err) {
            setError(err.message || "Failed to save changes.");
            setSaving(false);
            onChange();
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
                Manage Locations - {item.name}
            </DialogTitle>

            <DialogContent>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {draftAssignments.length === 0 ? (
                    <Typography sx={{ mb: 2 }}>
                        This item is not currently assigned to any location.
                    </Typography>
                ) : (
                    <Table size="small" sx={{ mb: 3 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Location</TableCell>
                                <TableCell align="center">Total Qty</TableCell>
                                <TableCell align="center">Broken Qty</TableCell>
                                <TableCell align="right">Remove</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {draftAssignments.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>
                                        {row.location}
                                        {row.isNew && (
                                            <Typography component="span" variant="caption" sx={{ ml: 1, color: "success.main" }}>
                                                (new)
                                            </Typography>
                                        )}
                                    </TableCell>

                                    <TableCell align="center">
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={row.total_quantity}
                                            onChange={(e) => 
                                                handleDraftFieldChange(row.id, "total_quantity", e.target.value)
                                            }
                                            sx={{ width: 80 }}
                                        />
                                    </TableCell>

                                    <TableCell align="center">
                                       {row.broken_quantity}
                                    </TableCell>

                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => handleRemoveFromDraft(row.id)}
                                        >
                                            Remove
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Add to a new location
                </Typography>

                <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>

                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Location</InputLabel>

                        <Select
                            value={newLocationId}
                            label="Location"
                            onChange={(e) => setNewLocationId(e.target.value)}
                        >
                            {availableLocations.map((loc) => (
                                <MenuItem key={loc.id} value={loc.id}>
                                    {loc.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Total Qty"
                        type="number"
                        size="small"
                        value={newTotalQty}
                        onChange={(e) => setNewTotalQty(e.target.value)}
                        sx={{ width: 100 }}
                    />

                    <Button
                        variant="outlined"
                        onClick={handleAddToDraft}
                        disabled={availableLocations.length === 0}
                    >
                        + Add to List
                    </Button>

                </Box>

                {availableLocations.length === 0 && (
                    <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                        This item is already assigned to every location.
                    </Typography>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={saving}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ItemAssignLocationsDialog;