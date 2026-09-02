import { 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField
} from "@mui/material";
import { useState } from "react";
import { changeUserPassword } from "../services/userService";

export default function ChangePasswordDialog({
    open,
    onClose,
    user,
    onSuccess
}) {

    const [password, setPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    async function handleSave() {

        console.log("SAVE CLICKED");

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {

            await changeUserPassword(
                user.id,
                password
            );

            setPassword("");
            setConfirmPassword("");

            onClose();

            onSuccess();

        } catch (error) {

            console.error(error);
            alert("Failed to update password");
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            <DialogTitle>
                Change Password for {user?.username}
            </DialogTitle>

            <DialogContent>

                <TextField
                    margin="dense"
                    label="New Password"
                    type="password"
                    fullWidth
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                <TextField
                    margin="dense"
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    value={confirmPassword}
                    onChange={(e) =>
                        setConfirmPassword(e.target.value)
                    }
                />

            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    Cancel
                </Button>

                <Button 
                    variant="contained"
                    onClick={handleSave}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}