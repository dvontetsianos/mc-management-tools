import { useEffect, useState } from "react";
import { useUserNames } from "../hooks/useUserNames";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import { getFeedback, updateFeedbackStatus } from "../services/feedbackService";
import { formatDateTime } from "../utils/formatDate";


//the colour of each feedback type
const TYPE_COLORS = {
    Bug: "error",
    Suggestion: "primary",
    Improvement: "success",
    Other: "default"
};

const STATUS_LABELS = {
    new: "New",
    seen: "Seen",
    done: "Done"
};


//admin only: every feedback people sent, with a status so you know what's still open
function Feedback() {

    const nameOf = useUserNames();

    const [feedback, setFeedback] = useState([]);
    const [filter, setFilter] = useState("open");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        getFeedback()
            .then(setFeedback)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));

    }, []);


    async function changeStatus(item, status) {

        setError("");

        try {
            const updated = await updateFeedbackStatus(item.id, status);

            setFeedback((list) => list.map((f) => (f.id === updated.id ? updated : f)));

            //the menu's red dot listens for this and updates straight away
            window.dispatchEvent(new Event("feedback-changed"));

        } catch (err) {
            setError(err.message);
        }
    }


    //open = new + seen, i.e. everything that isn't done yet
    const matches = (item) =>
        filter === "all" || (filter === "open" ? item.status !== "done" : item.status === filter);

    const visible = feedback.filter(matches);

    const countOf = (value) => feedback.filter((item) =>
        value === "all" || (value === "open" ? item.status !== "done" : item.status === value)
    ).length;


    return (
        <Box>

            <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Feedback
                </Typography>

                <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={filter}
                    onChange={(event, value) => value && setFilter(value)}
                    sx={{ ml: "auto", backgroundColor: "background.paper" }}
                >
                    <ToggleButton value="open">Open ({countOf("open")})</ToggleButton>
                    <ToggleButton value="new">New ({countOf("new")})</ToggleButton>
                    <ToggleButton value="done">Done ({countOf("done")})</ToggleButton>
                    <ToggleButton value="all">All ({countOf("all")})</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading && <CircularProgress />}

            {!loading && visible.length === 0 && (
                <Alert severity="info">
                    {feedback.length === 0 ? "Nobody has sent feedback yet." : "Nothing here for this filter."}
                </Alert>
            )}

            <Stack spacing={1.5}>
                {visible.map((item) => (
                    <Paper
                        key={item.id}
                        sx={{
                            p: 2,
                            opacity: item.status === "done" ? 0.65 : 1,
                            //new ones get a blue edge so they stand out
                            borderLeft: "4px solid",
                            borderLeftColor: item.status === "new" ? "primary.main" : "transparent"
                        }}
                    >
                        {/* who, what kind, when */}
                        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 1 }}>
                            <Chip size="small" label={item.type} color={TYPE_COLORS[item.type] || "default"} />

                            <Typography sx={{ fontWeight: 700 }}>
                                {nameOf(item.username)}
                            </Typography>

                            {item.role === "quickcount" && (
                                <Chip size="small" variant="outlined" label="Quick Count" />
                            )}

                            <Typography variant="body2" sx={{ color: "text.secondary", ml: "auto" }}>
                                {formatDateTime(item.created_at)}
                            </Typography>
                        </Box>

                        {/* the message, keeping the lines the way they were typed */}
                        <Typography sx={{ whiteSpace: "pre-wrap", mb: 1.5 }}>
                            {item.message}
                        </Typography>

                        {/* status and the buttons to change it */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip
                                size="small"
                                variant="outlined"
                                label={STATUS_LABELS[item.status] || item.status}
                                color={item.status === "new" ? "primary" : item.status === "done" ? "success" : "default"}
                            />

                            <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                                {item.status === "new" && (
                                    <Button size="small" onClick={() => changeStatus(item, "seen")}>
                                        Mark seen
                                    </Button>
                                )}

                                {item.status !== "done" && (
                                    <Button size="small" variant="outlined" color="success" onClick={() => changeStatus(item, "done")}>
                                        Done
                                    </Button>
                                )}

                                {item.status === "done" && (
                                    <Button size="small" onClick={() => changeStatus(item, "new")}>
                                        Reopen
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Paper>
                ))}
            </Stack>
        </Box>
    );
}


export default Feedback;