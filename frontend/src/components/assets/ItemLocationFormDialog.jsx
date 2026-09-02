import { useState } from "react";
import {
    Button,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography
} from "@mui/material";



function ItemLocationFormDialog({
    open,
    onClose,
    form,
    setForm,
    items,
    locations,
    editingId,
    onSubmit
}) {

    const [error, setError] = useState("");


    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                {editingId !== null ? "Edit Quantity" : "Assign Item to Location"}
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>

                {error && (
                    <Alert severity="error">
                        {error}
                    </Alert>
                )}

                <Stack spacing={2} sx={{ mt: 1 }}>

                    {editingId !== null ? (
                        <>
                            <Typography>
                                <strong>Item:</strong> {form.item_name}
                            </Typography>
                            
                            <Typography>
                                <strong>Location:</strong> {form.location_name}
                            </Typography>
                        </>
                    ) : (
                        <>
                            <FormControl fullWidth>
                                <InputLabel>
                                    Item
                                </InputLabel>
                                
                                <Select
                                    value={form.item_id}
                                    label="Item"
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            item_id: e.target.value
                                        })
                                    }
                                >
                                    {items.map((it) => (
                                        <MenuItem
                                            key={it.id}
                                            value={it.id}
                                        >
                                            {it.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>
                                    Location
                                </InputLabel>

                                <Select
                                    value={form.location_id}
                                    label="Location"
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            location_id: e.target.value
                                        })
                                    }
                                >
                                    {locations.map((loc) => (
                                        <MenuItem
                                            key={loc.id}
                                            value={loc.id}
                                        >
                                            {loc.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </>
                    )}

                    <TextField
                        label="Total Quantity"
                        type="number"
                        value={form.total_quantity}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                total_quantity: e.target.value
                            })
                        }
                        fullWidth
                    />

                    <TextField
                        label="Broken Quantity"
                        type="number"
                        value={form.broken_quantity}
                        onChange={(e) => 
                            setForm({
                                ...form,
                                broken_quantity: e.target.value
                            })
                        }
                        fullWidth
                    />

                </Stack>

            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={async () => {

                        try {

                            const success = await onSubmit();

                            if (success) {
                                setError("");
                                onClose();
                            } else {
                                setError("Please fill all required fields.");
                            }

                        } catch (error) {

                            setError(error.message);
                        }
                    }}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );

}


export default ItemLocationFormDialog;