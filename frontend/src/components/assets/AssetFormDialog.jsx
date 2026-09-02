import { useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";
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
    Box,
    IconButton
} from "@mui/material";

function AssetFormDialog({
    open,
    onClose,
    form,
    setForm,
    locations,
    categories,
    suppliers,
    editingId,
    onSubmit,
    onImageChange,
    selectedImage,
    currentImageName,
    onRemoveImage
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
                {editingId !== null ? "Edit Asset" : "Add New Asset"}
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>

                {error && (
                    <Alert severity="error">
                        {error}
                    </Alert>
                )}

                <Stack spacing={2} sx={{ mt: 1 }}>

                    <TextField
                        label="Asset Name"
                        value={form.name}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                name: e.target.value
                            })
                        }
                        fullWidth
                    />

                    <FormControl fullWidth>
                        <InputLabel>
                            Category
                        </InputLabel>

                        <Select
                            value={form.category_id}
                            label="Category"
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    category_id: e.target.value
                                })
                            }
                        >
                            {categories.map((cat) => (
                                <MenuItem
                                    key={cat.id}
                                    value={cat.id}
                                >
                                    {cat.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

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

                    <FormControl fullWidth>

                        <InputLabel>
                            Supplier
                        </InputLabel>

                        <Select
                            value={form.supplier_id}
                            label="Supplier"
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    supplier_id: e.target.value
                                })
                            }
                        >
                            {suppliers.map((sup) => (
                                <MenuItem
                                    key={sup.id}
                                    value={sup.id}
                                >
                                    {sup.name}
                                </MenuItem>
                            ))}
                            
                        </Select>
                        
                    </FormControl>


                    <TextField
                        label="Cost per unit"
                        type="number"
                        value={form.cost_per_unit}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                cost_per_unit: e.target.value
                            })
                        }
                        fullWidth
                    />


                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1
                        }}
                    >
                            <Button
                                variant="outlined"
                                component="label"
                            >
                                {selectedImage
                                    ? `Choose Image: ${selectedImage.name}`
                                    : currentImageName
                                        ? `Choose Image: ${currentImageName}`
                                        : "Choose Image"
                                }

                                <input
                                    type="file"
                                    hidden
                                    accept="image/png,image/jpg,image/webp"
                                    onChange={(e) => {

                                        const file = e.target.files[0];

                                        onImageChange(file);

                                        e.target.value = "";
                                    }}
                                />
                            </Button>

                            {(selectedImage || currentImageName) && (
                                <IconButton
                                    size="small"
                                    onClick={onRemoveImage}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            )}

                    </Box>

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

export default AssetFormDialog;