import { useState, useEffect } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
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
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { getPurchases, deletePurchase } from "../services/purchaseService";
import { getItems } from "../services/itemService";
import { getCategories } from "../services/categoryService";
import { getSuppliers } from "../services/supplierService";
import { getLocations } from "../services/locationService";
import { getUser } from "../services/auth";
import PurchaseLogDialog from "../components/purchases/PurchaseLogDialog";



function Purchases() {

    const user = getUser();
    const [searchParams] = useSearchParams();
    const routerLocation = useLocation();
    const navigate = useNavigate();

    const categoryId = searchParams.get("category_id");
    const supplierId = searchParams.get("supplier_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const filterLabel = routerLocation.state?.filterLabel;

    const hasFilters = Boolean(categoryId || supplierId || startDate || endDate);

    const [purchases, setPurchases] = useState([]);
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [locations, setLocations] = useState([]);

    const [dialogOpen, setDialogOpen] = useState(false);

    const [purchaseToDelete, setPurchaseToDelete] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("error");

    const fetchPurchases = async () => {
        const data = await getPurchases({ categoryId, supplierId, startDate, endDate });
        setPurchases(data);
    };

    const fetchLookups = async () => {

        const [itemsData, categoriesData, suppliersData, locationsData] = await Promise.all([
            getItems(),
            getCategories(),
            getSuppliers(),
            getLocations()
        ]);

        setItems(itemsData);
        setCategories(categoriesData);
        setSuppliers(suppliersData);
        setLocations(locationsData);
    };

    useEffect(() => {
        fetchPurchases();
    }, [categoryId, supplierId, startDate, endDate]);

    useEffect(() => {
        fetchLookups();
    }, []);

    const handleSaved = async () => {

        await fetchPurchases();
        await fetchLookups();

        setSnackbarMessage("Purchase logged successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
    };

    const confirmDelete = async () => {

        if (!purchaseToDelete) {
            return;
        }

        try {

            await deletePurchase(purchaseToDelete.id);

            await fetchPurchases();

            setSnackbarMessage("Purchase deleted successfully");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);

            setDeleteDialogOpen(false);
            setPurchaseToDelete(null);

        } catch (error) {

            setSnackbarMessage(error.message);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const formatDate = (value) => {

        if (!value) {
            return "-";
        }

        return new Date(value + "Z").toLocaleDateString();
    };

    return (
        <>
            <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h4">
                        Purchases
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={() => setDialogOpen(true)}
                    >
                        Log Purchase
                    </Button>
                </Box>

                {hasFilters && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                        <Typography variant="body" color="text.secondary">
                            Filtered{filterLabel ? ` to ${filterLabel}` : ""}
                            {startDate || endDate
                                ? ` (${startDate || "…"} to ${endDate || "…"})`
                                : ""}:
                        </Typography>

                        <Chip
                            label="Clear filters"
                            size="small"
                            onDelete={() => navigate("/purchases")}
                            onClick={() => navigate("/purchases")}
                        />
                    </Box>
                )}

                <TableContainer component={Paper} sx={{ mt: 3 }}>
                    <Table size="small">
                        <TableHead
                            sx={{
                                "& .MuiTableCell-root": {
                                    fontWeight: "bold",
                                    backgroundColor: "#aee9f3"
                                }
                            }}
                        >
                            <TableRow>
                                <TableCell>Logged</TableCell>
                                <TableCell>Doc Date</TableCell>
                                <TableCell>Item</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell align="center">Qty</TableCell>
                                <TableCell>Received Into</TableCell>
                                <TableCell align="center">Unit Cost</TableCell>
                                <TableCell>Supplier</TableCell>
                                <TableCell>Doc #</TableCell>
                                <TableCell>Notes</TableCell>
                                {user.role === "admin" && (
                                    <TableCell align="center">Delete</TableCell>
                                )}

                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {purchases.map((purchase) => (
                                <TableRow key={purchase.id}>
                                    <TableCell>{formatDate(purchase.created_at)}</TableCell>
                                    <TableCell>{formatDate(purchase.document_date)}</TableCell>
                                    <TableCell>{purchase.item_name || "-"}</TableCell>
                                    <TableCell>{purchase.category || "-"}</TableCell>
                                    <TableCell align="center">{purchase.quantity}</TableCell>
                                    <TableCell>{purchase.location || "-"}</TableCell>
                                    <TableCell align="center">
                                        {purchase.unit_cost != null
                                            ? `€ ${Number(purchase.unit_cost).toFixed(2)}`
                                            : "-"}
                                    </TableCell>
                                    <TableCell>{purchase.supplier || "-"}</TableCell>
                                    <TableCell>{purchase.document_number || "-"}</TableCell>
                                    <TableCell>{purchase.notes || "-"}</TableCell>

                                    {user.role === "admin" && (
                                        <TableCell align="center">
                                            <IconButton
                                                variant="contained"
                                                size="small"
                                                onClick={() => {
                                                    setPurchaseToDelete(purchase);
                                                    setDeleteDialogOpen(true);
                                                }}
                                                sx={{
                                                    minWidth : 0,
                                                    color: "red",
                                                    backgroundColor: "black"
                                                }}
                                            >
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </TableCell>
                                    )}

                                </TableRow>
                            ))}

                            {purchases.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={user.role === "admin" ? 11 : 10} align="center">
                                        {hasFilters ? "No purchases match this filter." : "No purchases logged yet."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <PurchaseLogDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                items={items}
                categories={categories}
                suppliers={suppliers}
                locations={locations}
                onSaved={handleSaved}
            />

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>
                    Delete Purchase
                </DialogTitle>

                <DialogContent>
                    Are you sure you want to delete this purchase of

                    <b> {purchaseToDelete?.quantity} × {purchaseToDelete?.item_name}</b>

                    ?
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
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
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
}


export default Purchases;