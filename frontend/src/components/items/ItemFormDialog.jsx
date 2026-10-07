import { useState, useEffect } from "react";
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
    IconButton,
    FormHelperText
} from "@mui/material";



function ItemFormDialog({
    open,
    onClose,
    form,
    setForm,
    categories,
    subcategories,
    hotels,
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

    //admins and all-hotels users can use every hotel, everyone else only their own
    const hasAllHotels = user?.role === "admin" || user?.permissions?.includes("all_hotels_access");
    const myHotelIds = user?.hotel_ids || [];
    const canUseHotel = (hotelId) => hasAllHotels || myHotelIds.includes(hotelId);

    //the user's own hotels, plus other hotels already on this item (shown locked)
    const visibleHotels = (hotels || []).filter(
        (hotel) => canUseHotel(hotel.id) || form.hotel_ids.includes(hotel.id)
    );

    //a shared item (it also belongs to hotels that aren't the user's) keeps its details for hotel users
    const detailsLocked = editingId !== null && form.hotel_ids.some((hotelId) => !canUseHotel(hotelId));
    
    //start every opening of the dialog without an old error,
    //and pre-select the hotel of a new item when the user has only one
    useEffect(() => {
        if (open) {
            setError("");

            if (editingId === null && !hasAllHotels && myHotelIds.length === 1 && form.hotel_ids.length === 0) {
                setForm({ ...form, hotel_ids: [myHotelIds[0]] });
            }
        }
    }, [open]);

    const subcategoriesForCategory = (subcategories || []).filter(
        (sub) => sub.category_id === form.category_id
    );

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

                {detailsLocked && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                        This item is shared with other hotels, so only an admin can change its details. You can still add or remove your own hotels.
                    </Alert>
                )}

                <Stack spacing={2} sx={{ mt: 1 }}>

                    <TextField
                        label="Item Name"
                        value={form.name}
                        disabled={detailsLocked}
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
                            disabled={detailsLocked}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    category_id: e.target.value,
                                    subcategory_id: ""
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
                            Subcategory (optional)
                        </InputLabel>

                        <Select
                            value={form.subcategory_id}
                            label="Subcategory (optional)"
                            disabled={detailsLocked || !form.category_id}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    subcategory_id: e.target.value
                                })
                            }
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>

                            {subcategoriesForCategory.map((sub) => (
                                <MenuItem
                                    key={sub.id}
                                    value={sub.id}
                                >
                                    {sub.name}
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
                            disabled={detailsLocked}
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

                    <FormControl fullWidth>

                        <InputLabel>
                            Hotels
                        </InputLabel>

                        <Select
                            multiple
                            value={form.hotel_ids}
                            label="Hotels"
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    hotel_ids: e.target.value
                                })
                            }
                            renderValue={(selected) =>
                                (hotels || [])
                                    .filter((hotel) => selected.includes(hotel.id))
                                    .map((hotel) => hotel.name)
                                    .join(", ")
                            }
                        >
                            {visibleHotels.map((hotel) => (
                                <MenuItem
                                    key={hotel.id}
                                    value={hotel.id}
                                    disabled={!canUseHotel(hotel.id)}
                                >
                                    {hotel.name}
                                </MenuItem>
                            ))}
                        </Select>

                        {!hasAllHotels && (
                            <FormHelperText>
                                You can only add or remove your own hotels
                            </FormHelperText>
                        )}
                    </FormControl>


                    <TextField
                        label="Cost per unit"
                        disabled={detailsLocked}
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

                    {user?.role === "admin" && form.hotel_ids.length > 0 && (
                        <Stack spacing={2}>
                            {(hotels || [])
                                .filter((hotel) => form.hotel_ids.includes(hotel.id))
                                .map((hotel) => (
                                    <TextField
                                        key={hotel.id}
                                        label={`Opening Quantity - ${hotel.name}`}
                                        type="number"
                                        value={form.opening_quantities?.[hotel.id] ?? 0}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                opening_quantities: {
                                                    ...(form.opening_quantities || {}),
                                                    [hotel.id]: Math.max(0, parseInt(e.target.value, 10) || 0)
                                                }
                                            })
                                        }
                                    />
                                ))}

                                <FormHelperText>
                                    Baseline stock at each hotel that the Expected Total is built from. Admin only - correct after a physical count.
                                </FormHelperText>
                            </Stack>
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
                            disabled={detailsLocked}
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
                                disabled={detailsLocked}
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