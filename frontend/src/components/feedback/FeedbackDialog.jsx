import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from "@mui/material";
import { useState } from "react";
import { sendFeedback } from "../../services/feedbackService";


function FeedbackDialog({ open, onClose }) {
    
    const handleSend = async () => {

        console.log("SENDING:", feedback);
        await sendFeedback(feedback);
        
        setFeedback({
            type: "Bug",
            message: ""
        });

        onClose();
        
    };

    const [feedback, setFeedback] = useState({
        type: "Bug",
        message: ""
    });

    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                    
            </DialogContent>

            <DialogActions>

                <Button onClick={onClose}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSend}
                >
                    Send
                </Button>

            </DialogActions>

        </Dialog>
    );
}


export default FeedbackDialog;