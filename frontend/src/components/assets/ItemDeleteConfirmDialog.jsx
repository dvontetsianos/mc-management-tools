import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText
} from "@mui/material";



function ItemDeleteConfirmDialog({
    open,
    onClose,
    onConfirm,
    itemName,
    itemLocations
}) {
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
                    <b>To proceed with the deletion, this Item should only by assigned to "Unassigned" location.</b>
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