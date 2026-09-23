import { useState } from "react";
import { getUser } from "../../services/auth";
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



function ItemFormDialog({
    open,
    onClose,
    form,
    setForm,
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

    const user = getUser();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                {editingId !== null ? "Edit Item" : "Add New Item"}
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>

                {error && (
                    <Alert severity="error">
                        {error}
                    </Alert>
                )}

                <Stack spacing={2} sx={{ mt: 1 }}>

                    <TextField
                        label="Item Name"
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

                    {user?.role === "admin" && (
                        <TextField
                            label="Opening Quantity"
                            type="number"
                            value={form.opening_quantity}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    opening_quantity: e.target.value
                                })
                            }
                            helperText="Baseline stock this item's Total Quantity is built from. Admin only - correct after a physical count."
                        />
                    )}


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

export default ItemFormDialog;