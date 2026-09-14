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
    Autocomplete,
    createFilterOptions
} from "@mui/material";
import { createItem } from "../../services/itemService";
import { createPurchase } from "../../services/purchaseService";



const filter = createFilterOptions();


const emptyForm = {
    quantity: "",
    unitCost: "",
    supplierId: "",
    documentNumber: "",
    documentDate: "",
    notes: ""
};


function PurchaseLogDialog({
    open,
    onClose,
    items,
    categories,
    suppliers,
    locations,
    onSaved
}) {

    const [selectedItem, setSelectedItem] = useState(null);
    const [newItemName, setNewItemName] = useState("");
    const [newItemCategoryId, setNewItemCategoryId] = useState("");

    const [form, setForm] = useState(emptyForm);
    const [locationId, setLocationId] = useState("");

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const isNewItem = Boolean(newItemName) && !selectedItem;

    //default the receiving location to Unassigned everytime the dialog opens
    useEffect(() => {

        if (open) {
            const unassigned = (locations || []).find((loc) => loc.name === "Unassigned");
            setLocationId(unassigned ? unassigned.id : "");
        }
    }, [open, locations]);

    const resetAndClose = () => {
        setSelectedItem(null);
        setNewItemName("");
        setNewItemCategoryId("");
        setForm(emptyForm);
        setLocationId("");
        setError("");
        onClose();
    };

    const handleSave = async () => {

        setError("");

        if (!selectedItem && !newItemName) {
            setError("Please choose an item.");
            return;
        }

        if (isNewItem && !newItemCategoryId) {
            setError("Please choose a cateogry for the new item.");
            return;
        }

        if (!form.quantity || Number(form.quantity) <= 0) {
            setError("Please enter a quantity greater than 0.");
            return;
        }

        if (!locationId) {
            setError("Please choose a receiving location.");
            return;
        }

        setSaving(true);


        try {

            let itemId = selectedItem ? selectedItem.id : null;

            if (isNewItem) {
                const created = await createItem({
                    name: newItemName,
                    category_id: newItemCategoryId,
                    supplier_id: form.supplierId || null,
                    cost_per_unit: form.unitCost ? Number(form.unitCost) : null
                });

                itemId = created.id;
            }

            await createPurchase({
                item_id: itemId,
                quantity: Number(form.quantity),
                location_id: Number(locationId),
                unit_cost: form.unitCost ? Number(form.unitCost) : null,
                supplier_id: form.supplierId || null,
                document_number: form.documentNumber || null,
                document_date: form.documentDate || null,
                notes: form.notes || null
            });

            setSaving(false);
            resetAndClose();
            onSaved();

        } catch (err) {

            setSaving(false);
            setError(err.message || "Failed to log purchase.");
        }
    };

    return (
        <Dialog
            open={open}
            onClose={resetAndClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                Log a Purchase
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Stack spacing={2} sx={{ mt: 1 }}>

                    <Autocomplete
                        options={items}
                        getOptionLabel={(option) => 
                            typeof option === "string" ? option : option.name
                        }
                        filterOptions={(options, params) => {

                            const filtered = filter(options, params);
                            const { inputValue } = params;

                            const exists = options.some(
                                (opt) => inputValue === opt.name
                            );

                            if (inputValue !== "" && !exists) {
                                filtered.push({
                                    inputValue,
                                    name: `+Add new item: "${inputValue}" ------->Only in emergency cases<-------`,
                                    isNew: true
                                });
                            }

                            return filtered;
                        }}
                        value={selectedItem}
                        onChange={(event, newValue) => {

                            if (newValue && newValue.isNew) {
                                setSelectedItem(null);
                                setNewItemName(newValue.inputValue);
                            } else {
                                setSelectedItem(newValue);
                                setNewItemName("");
                            }
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Item*" />
                        )}
                    />

                    {isNewItem && (
                        <FormControl fullWidth>
                            <InputLabel>Category (for new item)</InputLabel>

                            <Select
                                value={newItemCategoryId}
                                label="Category (for new item)"
                                onChange={(e) =>
                                    setNewItemCategoryId(e.target.value)
                                }
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}


                    <TextField
                        label="Quantity*"
                        type="number"
                        value={form.quantity}
                        onChange={(e) =>
                            setForm({ ...form, quantity: e.target.value })
                        }
                        fullWidth
                    />

                    <FormControl fullWidth>
                        <InputLabel>Receiving Location*</InputLabel>

                        <Select
                            value={locationId}
                            label="Receiving Location*"
                            onChange={(e) => setLocationId(e.target.value)}
                        >
                            {(locations || []).map((loc) => (
                                <MenuItem key={loc.id} value={loc.id}>
                                    {loc.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Unit Cost (optional)"
                        type="number"
                        value={form.unitCost}
                        onChange={(e) =>
                            setForm({ ...form, unitCost: e.target.value })
                        }
                        fullWidth
                    />

                    <FormControl fullWidth>
                        <InputLabel>Supplier (optional)</InputLabel>

                        <Select
                            value={form.supplierId}
                            label="Supplier (optional)"
                            onChange={(e) =>
                                setForm({ ...form, supplierId: e.target.value })
                            }
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>

                            {suppliers.map((sup) => (
                                <MenuItem key={sup.id} value={sup.id}>
                                    {sup.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>


                    <TextField
                        label="Document Number (Not currently in use)"
                        value={form.documentNumber}
                        onChange={(e) =>
                            setForm({ ...form, documentNumber: e.target.value })
                        }
                        fullWidth
                    />

                    <TextField
                        label=""
                        type="date"
                        value={form.documentDate}
                        onChange={(e) =>
                            setForm({ ...form, documentDate: e.target.value })
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />

                    <TextField
                        label="Notes (optional)"
                        value={form.notes}
                        onChange={(e) =>
                            setForm({ ...form, notes: e.target.value })
                        }
                        multiline
                        rows={2}
                        fullWidth
                    />
                </Stack>

            </DialogContent>

            <DialogActions>
                <Button onClick={resetAndClose} disabled={saving}>
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


export default PurchaseLogDialog;