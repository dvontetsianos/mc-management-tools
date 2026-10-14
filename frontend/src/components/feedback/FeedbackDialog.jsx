import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Alert } from "@mui/material";
import { useState } from "react";
import { sendFeedback } from "../../services/feedbackService";


const EMPTY_FEEDBACK = { type: "Bug", message: "" };


//report a bug / suggestion. Used in the menu and in Quick Count.
//onSent = optional, called after it was saved (e.g. to show a "thank you" message)
function FeedbackDialog({ open, onClose, onSent }) {

    const [feedback, setFeedback] = useState(EMPTY_FEEDBACK);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const handleClose = () => {
        setError("");
        onClose();
    };

    const handleSend = async () => {

        setSending(true);
        setError("");

        try {
            await sendFeedback(feedback);

            setFeedback(EMPTY_FEEDBACK);
            onClose();

            if (onSent) {
                onSent();
            }

        } catch (err) {
            //e.g. no connection: the text stays in the box, so nothing typed is lost
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={sending ? undefined : handleClose}
            fullWidth
            maxWidth="xs"
        >

            <DialogTitle>
                Report a Bug / Suggestion
            </DialogTitle>

            <DialogContent>
                <TextField
                    select
                    label="Type"
                    fullWidth
                    margin="normal"
                    value={feedback.type}
                    onChange={(e) =>
                        setFeedback({
                            ...feedback,
                            type: e.target.value
                        })
                    }
                >

                    <MenuItem value="Bug">
                        Bug
                    </MenuItem>

                    <MenuItem value="Suggestion">
                        Suggestion
                    </MenuItem>

                    <MenuItem value="Improvement">
                        Improvement
                    </MenuItem>

                    <MenuItem value="Other">
                        Other
                    </MenuItem>

                </TextField>


                <TextField
                    label="Message"
                    multiline
                    rows={4}
                    fullWidth
                    margin="normal"
                    value={feedback.message}
                    onChange={(e) =>
                        setFeedback({
                            ...feedback,
                            message: e.target.value
                        })
                    }
                />

                {error && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                        {error}
                    </Alert>
                )}

            </DialogContent>

            <DialogActions>

                <Button onClick={handleClose} disabled={sending}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={sending || !feedback.message.trim()}
                >
                    {sending ? "Sending..." : "Send"}
                </Button>

            </DialogActions>

        </Dialog>
    );
}


export default FeedbackDialog;