import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    Box,
    TextField
} from "@mui/material";



function ItemDeleteConfirmDialog({
    open,
    onClose,
    onConfirm,
    itemName,
    itemLocations,
    isAdmin,
    onConfirmWithHistory
}) {

    //the admin has to type the item's exact name before "Delete with history" works
    const [confirmName, setConfirmName] = useState("");

    useEffect(() => {
        if (open) {
            setConfirmName("");
        }
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            <DialogTitle>
                Delete Item
            </DialogTitle>

            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete {" "}
                    <strong>{itemName}</strong>? This will also delete its image (if any).
                    <b>To proceed with the deletion, this Item should only be assigned to "Unassigned" location and have no purchase or movement history.</b>
                </DialogContentText>

                {itemLocations && itemLocations.length > 0 ? (
                    <>
                        <DialogContentText sx={{ mt: 2 , fontWeight: "bold" }}>
                            Currently assigned to:
                        </DialogContentText>
                        
                        <List dense>
                            {itemLocations.map((loc) => (
                                <ListItem key={loc.id} disablePadding sx={{ pl: 2 }}>
                                    <ListItemText
                                        primary={`${loc.location} (Qty: ${loc.total_quantity}, Broken: ${loc.broken_quantity})`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </>
                ) : (
                    <DialogContentText sx={{ mt: 2 }}>
                        This item is not currently assigned to any location.
                    </DialogContentText>
                )}

                <DialogContentText sx={{ mt: 2 }}>
                    This action cannot be undone.
                </DialogContentText>

                {isAdmin && (
                    <Box sx={{ mt: 3, p: 2, border: "1px solid", borderColor: "error.main", borderRadius: 1 }}>
                        <DialogContentText sx={{ fontWeight: "bold", color: "error.main" }}>
                            Admin: delete with all history
                        </DialogContentText>

                        <DialogContentText sx={{ mt: 1 }}>
                            Deletes the item AND all its purchases, movements, stock and History lines, as if it never existed.
                            Only for test items or mistakes. Type the item's name to confirm:
                        </DialogContentText>

                        <TextField
                            size="small"
                            fullWidth
                            sx={{ mt: 1 }}
                            placeholder={itemName}
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                        />

                        <Button
                            sx={{ mt: 1 }}
                            color="error"
                            variant="outlined"
                            disabled={!itemName || confirmName !== itemName}
                            onClick={onConfirmWithHistory}
                        >
                            Delete with history
                        </Button>
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={onClose}
                    variant="outlined"
                >
                    Cancel
                </Button>

                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}


export default ItemDeleteConfirmDialog;