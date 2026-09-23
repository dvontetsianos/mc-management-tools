import { useState, useEffect } from "react";
import { getDepartments, createDepartment, deleteDepartment } from "../services/departmentService";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Alert from "@mui/material/Alert";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar
} from "@mui/material";


function Departments() {

    const [departments, setDepartments] = useState([]);
    const [newDepartment, setNewDepartment] = useState("");
    const [departmentToDelete, setDepartmentToDelete] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("error");

    const [creating, setCreating] = useState(false);

    const fetchDepartments = async () => {

        const data = await getDepartments();

        setDepartments(data);

    };

    const handleCreate = async () => {

        if (!newDepartment.trim()) {
            return;
        }

        setCreating(true);

        try {

            await createDepartment(newDepartment);

            setNewDepartment("");

            await fetchDepartments();

            setSnackbarMessage("Department created successfully");

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

    const confirmDelete = async () => {

        if (!departmentToDelete) {
            return;
        }

        try {

            await deleteDepartment(departmentToDelete.id);

            await fetchDepartments();

            setSnackbarMessage("Department delete successfully");

            setSnackbarSeverity("success");

            setSnackbarOpen(true);

            setDeleteDialogOpen(false);

            setDepartmentToDelete(null);

        } catch (error) {

            setSnackbarMessage(error.message);

            setSnackbarSeverity("error");

            setSnackbarOpen(true);

        }

    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    return (
        <>
            <Box>
                <Typography variant="h4">
                    Department Management
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        mt: 3
                    }}
                >

                    <TextField
                        label="New Department"
                        value={newDepartment}
                        onChange={(e) =>
                            setNewDepartment(e.target.value)
                        }
                    />

                    <Button
                        variant="contained"
                        onClick={handleCreate}
                        disabled={creating}
                    >
                        {creating ? "Adding..." : "Add Department"}
                    </Button>
                </Box>

                <TableContainer
                    component={Paper}
                    sx={{ mt: 3 }}
                >

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
                                <TableCell>
                                    ID
                                </TableCell>

                                <TableCell>
                                    Department Name
                                </TableCell>

                                <TableCell>
                                    Actions
                                </TableCell>

                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {departments.map((department) => (

                                <TableRow key={department.id}>
                                    <TableCell>
                                        {department.id}
                                    </TableCell>

                                    <TableCell>
                                        {department.name}
                                    </TableCell>

                                    <TableCell>
                                        <IconButton
                                            color="error"
                                            onClick={() => {
                                                setDepartmentToDelete(department);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <DeleteIcon />

                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>
                    Delete Department
                </DialogTitle>

                <DialogContent>
                    Are you sure you want to delete Department
                    <b>
                        {" "}
                        {departmentToDelete?.name}
                    </b>

                    ?
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        onClick={confirmDelete}
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


export default Departments;