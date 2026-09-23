import { useState, useEffect } from "react";
import {
    getLostFoundItems,
    createLostFoundItem,
    claimLostFoundItem,
    unclaimLostFoundItem,
    deleteLostFoundItem
} from "../services/lostFoundService";
import {
    Box,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Switch
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { getUser } from "../services/auth";


function LostFound() {

    const [items, setItems] = useState([]);

    const user = getUser();

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [description, setDescription] = useState("");
    const [locationFound, setLocationFound] = useState("");
    const [foundBy, setFoundBy] = useState("");
    const [notes, setNotes] = useState("");

    const [showClaimed, setShowClaimed] = useState(false);

    const [claimDialogOpen, setClaimDialogOpen] = useState(false);
    const [itemToClaim, setItemToClaim] = useState(null);
    const [claimedByInput, setClaimedByInput] = useState("");

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [adding, setAdding] = useState(false);
    const [claiming, setClaiming] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const showNotification = (message, severity = "success") => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const fetchItems = async () => {

        try {

            const data = await getLostFoundItems();

            setItems(data);

        } catch (error) {

            console.error(error);

        }

    };

    useEffect(() => {
        fetchItems();
    }, []);

    const openAddDialog = () => {

        setDescription("");
        setLocationFound("");
        setFoundBy("");
        setNotes("");

        setAddDialogOpen(true);

    };

    const handleAdd = async () => {

        if (!description.trim()) {
            return;
        }

        setAdding(true);

        try {

            await createLostFoundItem({
                description: description.trim(),
                location_found: locationFound.trim() || null,
                found_by: foundBy.trim() || null,
                notes: notes.trim() || null
            });

            setAddDialogOpen(false);

            fetchItems();

            showNotification("Item added.");

        } catch (error) {

            showNotification("Failed to add item.", "error");

            console.error(error);

        } finally {

            setAdding(false);

        }

    };

    const openClaimDialog = (item) => {

        setItemToClaim(item);
        setClaimedByInput("");
        setClaimDialogOpen(true);

    };

    const handleClaim = async ()=> {

        if (!itemToClaim || !claimedByInput.trim()) {
            return;
        }

        setClaiming(true);

        try {

            await claimLostFoundItem(itemToClaim.id, claimedByInput.trim());

            setClaimDialogOpen(false);
            setItemToClaim(null);

            fetchItems();

            showNotification("Item marked as claimed.");

        } catch (error) {

            showNotification("Failed to claim item.", "error");

            console.error(error);

        } finally {

            setClaiming(false);

        }

    };

    const handleUnclaim = async (item) => {

        try{

            await unclaimLostFoundItem(item.id);

            fetchItems();

            showNotification("Item unclaimed");

        } catch (error) {

            showNotification("Failed to unclaim item.", "error");

            console.error(error);

        }

    };

    const openDeleteDialog = (item) => {

        setItemToDelete(item);
        setDeleteDialogOpen(true);

    };

    const handleDelete = async () => {

        if (!itemToDelete) {
            return;
        }

        try {

            await deleteLostFoundItem(itemToDelete.id);

            setDeleteDialogOpen(false);
            setItemToDelete(null);

            fetchItems();

            showNotification("Item deleted.");

        } catch (error) {

            showNotification("Failed to delete Item.", "error");

            console.error(error);

        }

    };

    const visibleItems = [...(showClaimed
        ? items
        : items.filter((item) => item.status !== "claimed"))].sort((a, b) => {

        if (a.status === b.status) {
            return 0;
        }

        return a.status === "claimed" ? 1 : -1;

    });

        return (
            <Box sx={{ p: 3 }}>

                <Typography variant="h4" gutterBottom>
                    Lost & Found
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                        mt: 2
                    }}
                >

                    <FormControlLabel
                        control={
                            <Switch
                                checked={showClaimed}
                                onChange={(e) => setShowClaimed(e.target.checked)}
                            />
                        }
                        label="Show claimed items"
                    />

                    <Button
                        variant="contained"
                        onClick={openAddDialog}
                    >
                        Add Item
                    </Button>

                </Box>



                <TableContainer component={Paper}>

                    <Table>

                        <TableHead
                            sx={{
                                "& .MuiTableCell-root": {
                                    fontWeight: "bold",
                                    backgroundColor: "#aee9fe"
                                }
                            }}
                        >
                            <TableRow>
                                <TableCell>Date Found</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Location Found</TableCell>
                                <TableCell>Found By</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Claimed By</TableCell>
                                <TableCell>Notes</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {visibleItems.map((item) => (

                                <TableRow key={item.id}>

                                    <TableCell>
                                       {new Date(item.date_found + "Z").toLocaleString()} 
                                    </TableCell>

                                    <TableCell>
                                        {item.description}
                                    </TableCell>

                                    <TableCell>
                                        {item.location_found || "-"}
                                    </TableCell>

                                    <TableCell>
                                        {item.found_by || "-"}
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={item.status}
                                            color={item.status === "claimed" ? "success" : "warning"}
                                            size="small"
                                        />
                                    </TableCell>

                                    <TableCell>
                                        {item.claimed_by || "-"}
                                    </TableCell>

                                    <TableCell>
                                        {item.notes || "-"}
                                    </TableCell>

                                    <TableCell>

                                        {item.status !== "claimed" && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => openClaimDialog(item)}
                                                sx={{ mr: 1 }}
                                            >
                                                Claim
                                            </Button>
                                        )}

                                        {item.status === "claimed" && user?.role === "admin" && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => handleUnclaim(item)}
                                                sx={{ mr: 1, color: "orange", backgroundColor: "#070000" }}
                                            >
                                                Unclaim (admin only)
                                            </Button>
                                        )}

                                        {user?.role === "admin" && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => openDeleteDialog(item)}
                                                sx={{ color: "red", backgroundColor: "#070000" }}
                                            >
                                                Delete
                                            </Button>
                                        )}

                                    </TableCell>
                                    
                                </TableRow>
                            ))}

                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog
                    open={addDialogOpen}
                    onClose={() => setAddDialogOpen(false)}
                >

                    <DialogTitle>
                        Add Lost & Found Item
                    </DialogTitle>

                    <DialogContent>

                        <TextField
                            label="Description"
                            placeholder="e.g. black wallet"
                            required
                            fullWidth
                            margin="dense"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <TextField
                            label="Location Found"
                            fullWidth
                            margin="dense"
                            value={locationFound}
                            onChange={(e) => setLocationFound(e.target.value)}
                        />

                        <TextField
                            label="Found By"
                            fullWidth
                            margin="dense"
                            value={foundBy}
                            onChange={(e) => setFoundBy(e.target.value)}
                        />

                        <TextField
                            label="Notes"
                            fullWidth
                            margin="dense"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />

                    </DialogContent>

                    <DialogActions>

                        <Button onClick={() => setAddDialogOpen(false)}>
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleAdd}
                            disabled={!description.trim() || adding}
                        >
                            {adding ? "Adding..." : "Add"}
                        </Button>

                    </DialogActions>

                </Dialog>

                <Dialog
                    open={claimDialogOpen}
                    onClose={() => setClaimDialogOpen(false)}
                >

                    <DialogTitle>
                        Mark as Claimed
                    </DialogTitle>

                    <DialogContent>

                        <Typography sx={{ mb: 2 }}>
                            {itemToClaim?.description}
                        </Typography>

                        <TextField
                            label="Claimed by (guest name)"
                            fullWidth
                            value={claimedByInput}
                            onChange={(e) => setClaimedByInput(e.target.value)}
                        />
                        
                    </DialogContent>

                    <DialogActions>

                        <Button onClick={() => setClaimDialogOpen(false)}>
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleClaim}
                            disabled={!claimedByInput.trim() || claiming}
                        >
                            {claiming ? "Saving..." : "Confirm"}
                        </Button>

                    </DialogActions>

                </Dialog>

                <Dialog
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                >

                    <DialogTitle>
                        Delete Item
                    </DialogTitle>

                    <DialogContent>
                        Are you sure you want to delete: <b>{itemToDelete?.description}</b>?
                    </DialogContent>

                    <DialogActions>

                        <Button onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>

                    </DialogActions>

                </Dialog>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={5000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                    <Alert
                        severity={snackbar.severity}
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>

            </Box>
        );
}


export default LostFound;