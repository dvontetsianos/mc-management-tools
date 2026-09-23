import { useState, useEffect } from "react";
import { getSuppliers, createSupplier, deleteSupplier } from "../services/supplierService";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
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
    DialogActions
} from "@mui/material";


function Suppliers() {

    const [suppliers, setSuppliers] = useState([]);

    const [newSupplier, setNewSupplier] = useState("");

    const [supplierToDelete, setSupplierToDelete] = useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [snackbarMessage, setSnackbarMessage] = useState("");

    const [snackbarSeverity, setSnackbarSeverity] = useState("error");

    const [creating, setCreating] = useState(false);

    const fetchSuppliers = async () => {

        const data = await getSuppliers();

        setSuppliers(data);

    };

    const handleCreate = async () => {

        if (!newSupplier.trim()) {
            return;
        }

        setCreating(true);

        try {

            await createSupplier(newSupplier);

            setNewSupplier("");

            await fetchSuppliers();

            setSnackbarMessage("Supplier created successfully");

            setSnackbarSeverity("success");

            setSnackbarOpen(true);

        } catch (error) {

            setSnackbarMessage(error.message);

            setSnackbarSeverity("error");

            setSnackbarOpen(true);

        } finally {

            setCreating(false);

        }
    };

    const confirmDelete = async () => {

        if (!supplierToDelete) {
            return;
        }

        try {

            await deleteSupplier(supplierToDelete.id);

            await fetchSuppliers();

            setSnackbarMessage("Supplier deleted successfully");

            setSnackbarSeverity("success");

            setSnackbarOpen(true);

            setDeleteDialogOpen(false);

            setSupplierToDelete(null);
            
        } catch (error) {

            setSnackbarMessage(error.message);

            setSnackbarSeverity("error");

            setSnackbarOpen(true);

        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    return (
        <>
            <Box>
                <Typography variant="h4">
                    Supplier Management
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        mt: 3
                    }}
                >
                    <TextField
                        label="New Supplier"
                        value={newSupplier}
                        onChange={(e) =>
                            setNewSupplier(e.target.value)
                        }
                    />

                    <Button
                        variant="contained"
                        onClick={handleCreate}
                        disabled={creating}
                    >
                        {creating ? "Adding..." : "Add Supplier"}
                    </Button>
                </Box>

                <TableContainer
                    component={Paper}
                    sx={{ mt: 3 }}
                >
                    <Table>
                        <TableHead
                            sx={{
                                "& .MuiTableCell-root": {
                                    fontWeight: "bold",
                                    backgroundColor: "#aee9f3"
                                }
                            }}
                        >
                            <TableRow>
                                <TableCell>
                                    ID
                                </TableCell>

                                <TableCell>
                                    Supplier Name
                                </TableCell>

                                <TableCell>
                                    Actions
                                </TableCell>

                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {suppliers.map((supplier) => (

                                <TableRow key={supplier.id}>
                                    <TableCell>
                                        {supplier.id}
                                    </TableCell>

                                    <TableCell>
                                        {supplier.name}
                                    </TableCell>

                                    <TableCell>
                                        <IconButton
                                        color="error"
                                            onClick={() => {
                                                setSupplierToDelete(supplier);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>
                    Delete Supplier
                </DialogTitle>

                <DialogContent>
                    Are you sure you want to delete Supplier

                    <b>
                        {" "}
                        {supplierToDelete?.name}
                    </b>

                    ?


                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        onClick={confirmDelete}
                    >
                        Delete
                    </Button>

                </DialogActions>

            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={10000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center"
                }}
            >

                <Alert
                    severity={snackbarSeverity}
                    onClose={() => setSnackbarOpen(false)}
                >
                    {snackbarMessage}
                </Alert>

            </Snackbar>
        </>
    );
}

export default Suppliers;