import { useState, useEffect } from "react";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "../services/supplierService";
import { getHotels } from "../services/hotelService";
import { getUser } from "../services/auth";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Stack,
    FormGroup,
    FormControlLabel,
    Checkbox
} from "@mui/material";


//the hotel checkboxes, used when adding and when editing a supplier
function HotelChecks({ hotels, selected, onChange }) {

    const toggle = (hotelId) =>
        onChange(
            selected.includes(hotelId)
                ? selected.filter((id) => id !== hotelId)
                : [...selected, hotelId]
        );

    return (
        <FormGroup row>
            {hotels.map((hotel) => (
                <FormControlLabel
                    key={hotel.id}
                    label={hotel.name}
                    control={
                        <Checkbox
                            checked={selected.includes(hotel.id)}
                            onChange={() => toggle(hotel.id)}
                        />
                    }
                />
            ))}
        </FormGroup>
    );
}


function Suppliers() {

    const [suppliers, setSuppliers] = useState([]);
    const [hotels, setHotels] = useState([]);

    const [newSupplier, setNewSupplier] = useState("");
    const [newSupplierHotelIds, setNewSupplierHotelIds] = useState([]);
    const [creating, setCreating] = useState(false);

    //the supplier being edited: { id, name, hotel_ids }
    const [editing, setEditing] = useState(null);
    const [editError, setEditError] = useState("");
    const [saving, setSaving] = useState(false);

    const [supplierToDelete, setSupplierToDelete] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("error");

    //admins and all-hotels users can tick every hotel, everyone else only their own
    //(the backend keeps the other hotels as they were)
    const user = getUser();
    const isAdmin = user?.role === "admin";
    const hasAllHotels = isAdmin || user?.permissions?.includes("all_hotels_access");
    const myHotels = hotels.filter(
        (hotel) => hasAllHotels || (user?.hotel_ids || []).includes(hotel.id)
    );

    const notify = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const fetchSuppliers = async () => {
        const data = await getSuppliers();
        setSuppliers(data);
    };

    const fetchHotels = async () => {
        const data = await getHotels();
        setHotels(data);
    };

    useEffect(() => {
        fetchSuppliers();
        fetchHotels();
    }, []);

    const handleCreate = async () => {

        if (!newSupplier.trim()) {
            return;
        }

        setCreating(true);

        try {
            await createSupplier(newSupplier.trim(), newSupplierHotelIds);
            setNewSupplier("");
            setNewSupplierHotelIds([]);
            await fetchSuppliers();
            notify("Supplier created successfully", "success");
        } catch (error) {
            notify(error.message, "error");
        } finally {
            setCreating(false);
        }
    };

    const handleSaveEdit = async () => {

        if (!editing.name.trim()) {
            setEditError("Enter a name.");
            return;
        }

        setSaving(true);
        setEditError("");

        try {
            await updateSupplier(editing.id, editing.name.trim(), editing.hotel_ids);
            await fetchSuppliers();
            setEditing(null);
            notify("Supplier saved", "success");
        } catch (error) {
            setEditError(error.message);
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {

        if (!supplierToDelete) {
            return;
        }

        try {
            await deleteSupplier(supplierToDelete.id);
            await fetchSuppliers();
            notify("Supplier deleted successfully", "success");
            setDeleteDialogOpen(false);
            setSupplierToDelete(null);
        } catch (error) {
            notify(error.message, "error");
        }
    };

    return (
        <>
            <Box>
                <Typography variant="h4">
                    Supplier Management
                </Typography>

                {/* add a supplier: name + the hotels it delivers to */}
                <Paper sx={{ p: 2, mt: 3 }}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                        <TextField
                            label="New Supplier"
                            value={newSupplier}
                            onChange={(e) => setNewSupplier(e.target.value)}
                        />

                        <HotelChecks
                            hotels={myHotels}
                            selected={newSupplierHotelIds}
                            onChange={setNewSupplierHotelIds}
                        />

                        <Button
                            variant="contained"
                            onClick={handleCreate}
                            disabled={creating}
                        >
                            {creating ? "Adding..." : "Add Supplier"}
                        </Button>
                    </Box>
                </Paper>

                <TableContainer component={Paper} sx={{ mt: 3 }}>
                    <Table>
                        <TableHead
                            sx={{
                                "& .MuiTableCell-root": {
                                    fontWeight: "bold",
                                    backgroundColor: "background.tableHead"
                                }
                            }}
                        >
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Supplier Name</TableCell>
                                <TableCell>Hotels</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {suppliers.map((supplier) => (
                                <TableRow key={supplier.id}>
                                    <TableCell>{supplier.id}</TableCell>

                                    <TableCell>{supplier.name}</TableCell>

                                    <TableCell>
                                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                            {supplier.hotels.length > 0
                                                ? supplier.hotels.map((name) => (
                                                    <Chip key={name} label={name} size="small" />
                                                ))
                                                : <Typography variant="body2" color="text.secondary">No hotels yet</Typography>}
                                        </Stack>
                                    </TableCell>

                                    <TableCell>
                                        <IconButton
                                            color="primary"
                                            onClick={() => {
                                                setEditError("");
                                                setEditing({ id: supplier.id, name: supplier.name, hotel_ids: supplier.hotel_ids });
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>

                                        {/* only admins can delete a supplier */}
                                        {isAdmin && (
                                            <IconButton
                                                color="error"
                                                onClick={() => {
                                                    setSupplierToDelete(supplier);
                                                    setDeleteDialogOpen(true);
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}

                            {suppliers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                        No suppliers yet. Add the first one above.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* edit: rename and/or change hotels */}
            <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
                <DialogTitle>Edit supplier</DialogTitle>

                <DialogContent>
                    {editing && (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                label="Name"
                                value={editing.name}
                                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                fullWidth
                            />

                            <Box>
                                <Typography variant="subtitle2">Delivers to</Typography>
                                <HotelChecks
                                    hotels={myHotels}
                                    selected={editing.hotel_ids}
                                    onChange={(hotelIds) => setEditing({ ...editing, hotel_ids: hotelIds })}
                                />
                            </Box>

                            {editError && <Alert severity="error">{editError}</Alert>}
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setEditing(null)}>Cancel</Button>
                    <Button variant="contained" disabled={saving} onClick={handleSaveEdit}>
                        {saving ? "Saving..." : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Supplier</DialogTitle>

                <DialogContent>
                    Are you sure you want to delete Supplier <b>{supplierToDelete?.name}</b>?
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={confirmDelete}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={10000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
}

export default Suppliers;
