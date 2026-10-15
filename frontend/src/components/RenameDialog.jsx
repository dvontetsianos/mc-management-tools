import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Alert,
    Stack
} from "@mui/material";


//a small window to rename something (a location, a category...).
//onSave(newName) does the saving; if it fails, its error message shows here and the window stays open
function RenameDialog({ open, title, currentName, onSave, onClose }) {

    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    //start from the current name every time it opens
    useEffect(() => {
        if (open) {
            setName(currentName || "");
            setError("");
        }
    }, [open]);

    const handleSave = async () => {

        if (!name.trim()) {
            setError("Enter a name.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            await onSave(name.trim());
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">

            <DialogTitle>{title}</DialogTitle>

            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                        autoFocus
                        fullWidth
                    />

                    {error && <Alert severity="error">{error}</Alert>}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" disabled={saving} onClick={handleSave}>
                    {saving ? "Saving..." : "Save"}
                </Button>
            </DialogActions>

        </Dialog>
    );
}

export default RenameDialog;
