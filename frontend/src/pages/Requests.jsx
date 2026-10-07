import { useState, useEffect } from "react";
import { formatDateTime } from "../utils/formatDate";
import { getRequests, createRequest, updateRequestStatus, deleteRequest } from "../services/requestService";
import { getDepartments } from "../services/departmentService";
import { getUser } from "../services/auth";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";


function Requests() {

    const user = getUser();

    const [requests, setRequests] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newRequest, setNewRequest] = useState({
        title: "",
        description: "",
        target_department_id: ""
    });

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("error");
    const [requestToDelete, setRequestToDelete] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    const [resolvedPage, setResolvedPage] = useState(0);
    const [resolvedRowsPerPage, setResolvedRowsPerPage] = useState(5);

    const fetchRequests = async () => {

        const data = await getRequests();

        setRequests(data);

    };

    const fetchDepartments = async () => {

        const data = await getDepartments();

        setDepartments(data);

    };

    useEffect(() => {

        fetchRequests();
        fetchDepartments();

        const interval = setInterval(fetchRequests, 30000);

        return () => clearInterval(interval);

    }, []);


    const handleCreate = async () => {

        if (!newRequest.title.trim() || !newRequest.description.trim() || !newRequest.target_department_id) {
            return;
        }

        setCreating(true);

        try {

            await createRequest(newRequest);

            setNewRequest({
                title: "",
                description: "",
                target_department_id: ""
            });

            setCreateDialogOpen(false);

            await fetchRequests();

            setSnackbarMessage("Request sent successfully");

            setSnackbarSeverity("success");

            setSnackbarOpen(true);

        } catch (error) {

            setSnackbarMessage(error.message);

            setSnackbarSeverity("error");

            setSnackbarOpen(true);
        } finally {

            setCreating(false);
        }
    };

    const handleResolve = async (requestId) => {

        try {

            await updateRequestStatus(requestId, "resolved");

            await fetchRequests();

            setSnackbarMessage("Request marked as resolved");

            setSnackbarSeverity("success");

            setSnackbarOpen(true);

        } catch (error) {

            setSnackbarMessage(error.message);

            setSnackbarSeverity("error");

            setSnackbarOpen(true);
        }

    };


    const handleDeleteClick = (req) => {

        setRequestToDelete(req);

        setDeleteDialogOpen(true);
        
    };

    const confirmDeleteRequest = async () => {

        if (!requestToDelete) return;

        try {

            await deleteRequest(requestToDelete.id);

            await fetchRequests();

            setSnackbarMessage("Request deleted successfully");

            setSnackbarSeverity("success");

            setSnackbarOpen(true);

            setDeleteDialogOpen(false);

            setRequestToDelete(null);

        } catch (error) {

            setSnackbarMessage(error.message);

            setSnackbarSeverity("error");

            setSnackbarOpen(true);
        }
    };

    const canResolve = (req) => {

        if (user?.role === "admin") {
            return true;
        }

        return user?.department_id != null && req.target_department_id === user.department_id;

    };

    const pendingRequests = requests.filter((req) => req.status === "pending");

    const allResolvedRequests = requests
        .filter((req) => req.status === "resolved")
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const resolvedRequests = resolvedRowsPerPage === -1
        ? allResolvedRequests
        : allResolvedRequests.slice(
            resolvedPage * resolvedRowsPerPage,
            resolvedPage * resolvedRowsPerPage + resolvedRowsPerPage
        );

    const getBackgroundColor = (count) => {
        const maxRequests = 10;
        const intensity = Math.min(count / maxRequests, 1);
        const fade = Math.round(255 - intensity * 255);

        return `rgb(255, ${fade}, ${fade})`;
    };

    return (
        <>
            <Box
                sx={{
                    backgroundColor: getBackgroundColor(pendingRequests.length),
                    transition: "background-color 20s ease",
                    minHeight: "100vh",
                    p: 3
                }}
            >
                <Box
                    sx={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >

                    <Typography variant="h2" sx={{ mt: -4 }}>
                        Requests
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={() => setCreateDialogOpen(true)}
                        sx={{ position: "absolute", right: 0, mr: 5 }}
                    >
                        New Request
                    </Button>

                    </Box>

                    <Typography variant="h2" sx={{ mt: 4, mr: 0, fontWeight: "bold", fontSize: 35 }}>
                        Pending ⏳
                    </Typography>

                    <TableContainer component={Paper} sx={{ mt: 1 }}>

                        <Table>
                            <TableHead
                                sx={{
                                    "& .MuiTableCell-root": {
                                        fontWeight: "bold",
                                        backgroundColor: "#aee9f3"
                                    }
                                }}
                            >
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>From</TableCell>
                                    <TableCell>To</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {pendingRequests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell>{req.title}</TableCell>
                                        <TableCell sx={{ maxWidth: 200, whiteSpace: "normal", wordBreak: "break-word" }}>{req.description}</TableCell>
                                        <TableCell>
                                            <b>{req.sender_username}</b>
                                              {"\u00A0\u00A0\u00A0"}|{"\u00A0\u00A0\u00A0"}
                                            {req.sender_department && (
                                                <Typography variant="caption" display="block" color="text.primary" sx={{ fontWeight: "bold", fontSize: 18 }}>
                                                    {req.sender_department}
                                                </Typography>
                                            )}
                                        </TableCell>

                                        <TableCell><b>{req.target_department}</b></TableCell>
                                        <TableCell>{formatDateTime(req.created_at)}</TableCell>
                                        <TableCell>
                                            {canResolve(req) && (
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    onClick={() => handleResolve(req.id)}
                                                >
                                                    Resolve
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                    </TableContainer>


                    <Typography variant="h2" sx={{ mt: 15, fontWeight: "bold", fontSize: 35 }}>
                        Resolved ✅
                    </Typography>

                    <TableContainer component={Paper} sx={{ mt: 1 }}>

                        <Table>
                            <TableHead
                                sx={{
                                    "& .MuiTableCell-root": {
                                        fontWeight: "bold",
                                        backgroundColor: "#aee9f3"
                                    }
                                }}
                            >
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>From</TableCell>
                                    <TableCell>To</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {resolvedRequests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell>{req.title}</TableCell>
                                        <TableCell sx={{ maxWidth: 200, whiteSpace: "normal", wordBreak: "break-word" }}>{req.description}</TableCell>
                                        <TableCell>
                                            <Typography variant="caption" sx={{ fontWeight: "bold", fontSize: 14}}>{req.sender_username}</Typography>
                                            {"\u00A0\u00A0\u00A0"}|{"\u00A0\u00A0\u00A0"}
                                            {req.sender_department && (
                                                <Typography variant="caption" display="block" color="text.secondary" sx={{ fontWeight: "bold", fontSize: 18}}>
                                                    {req.sender_department}
                                                </Typography>
                                            )}
                                        </TableCell>

                                        <TableCell>{req.target_department}</TableCell>
                                        <TableCell>{formatDateTime(req.created_at)}</TableCell>
                                        <TableCell>
                                            {user?.role === "admin" && (
                                                <IconButton
                                                    onClick={() => handleDeleteClick(req)}
                                                    sx={{ backgroundColor: "#070000", color: "red"}}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={allResolvedRequests.length}
                        page={resolvedPage}
                        onPageChange={(e, newPage) => setResolvedPage(newPage)}
                        rowsPerPage={resolvedRowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setResolvedRowsPerPage(parseInt(e.target.value, 10));
                            setResolvedPage(0);
                        }}
                        rowsPerPageOptions={[5, 25, 50, 100, {label: "All", value: -1 }]}
                    />
                </Box>

                <Dialog
                    open={createDialogOpen}
                    onClose={() => setCreateDialogOpen(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>
                        New Request
                    </DialogTitle>

                    <DialogContent>

                        <TextField
                            label="Title"
                            fullWidth
                            sx={{ mt: 1 }}
                            value={newRequest.title}
                            onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                        />

                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            sx={{ mt: 2 }}
                            value={newRequest.description}
                            onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                        />

                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Department</InputLabel>
                            <Select
                                value={newRequest.target_department_id}
                                label="Department"
                                onChange={(e) => setNewRequest({ ...newRequest, target_department_id: e.target.value })}
                            >
                                {departments.map((dept) => (
                                    <MenuItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>

                        <Button variant="contained" onClick={handleCreate} disabled={creating}>
                            {creating ? "Sending..." : "Send"}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                >
                    <DialogTitle>
                        Delete Request
                    </DialogTitle>

                    <DialogContent>
                        Are you sure you want to delete the request titled
                        <b>
                            {" "}
                            {requestToDelete?.title}
                        </b>

                        ?
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>

                        <Button
                            coloer="error"
                            variant="contained"
                            onClick={confirmDeleteRequest}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={10000}
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center"
                    }}
                >
                    <Alert
                        severity={snackbarSeverity}
                        onClose={() => setSnackbarOpen(false)}
                    >
                        {snackbarMessage}
                    </Alert>
                </Snackbar>

        </>
    );

}

export default Requests;