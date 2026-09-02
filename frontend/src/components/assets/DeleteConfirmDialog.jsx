import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from "@mui/material";


function DeleteConfirmDialog({
    open,
    onClose,
    onConfirm,
    assetName
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            <DialogTitle>
                Delete Asset
            </DialogTitle>

            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete{" "}. This will also delete the corresponding image of the asset  {" "}
                    <strong>{assetName}</strong>?
                    <br />
                    <br />
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


export default DeleteConfirmDialog;