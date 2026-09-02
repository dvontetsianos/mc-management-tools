import { useState, useEffect } from "react";
import { getLocations, createLocation, deleteLocation } from "../services/locationService";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {
    Box,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from "@mui/material";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";


function Locations() {

    const [locations, setLocations] = useState([]);

    const [newLocation, setNewLocation] = useState("");

    const [locationToDelete, setLocationToDelete] = useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [snackbarMessage, setSnackbarMessage] = useState("");

    const [snackbarSeverity, setSnackbarSeverity] = useState("error");

    const fetchLocations = async () => {

        const data = await getLocations();

        setLocations(data);

    };

    const handleCreate = async () => {

        if (!newLocation.trim()) {
            return;
        }

        try {

            await createLocation(newLocation);

            setNewLocation("");

            await fetchLocations();

            setSnackbarMessage("Location created successfully");

            setSnackbarSeverity("success");

            setSnackbarOpen(true);

        } catch (error) {

            setSnackbarMessage(error.message);

            setSnackbarSeverity("error");

            setSnackbarOpen(true);

        }

    };

    const confirmDelete = async () => {

        if (!locationToDelete) {
            return;
        }

        try {

            await deleteLocation(locationToDelete.id);

            await fetchLocations();

            setSnackbarMessage("Location deleted successfully");

            setSnackbarSeverity("success");

            setSnackbarOpen(true);

            setDeleteDialogOpen(false);

            setLocationToDelete(null);

        } catch (error) {

            setSnackbarMessage(error.message);

            setSnackbarSeverity("error");
                
            setSnackbarOpen(true);

        }

    };



    useEffect(() => {
        fetchLocations();
    }, []);


    return (
        <Box>
            <Typography variant="h4">
                Location Management
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    mt: 3
                }}
            >
                <TextField
                    label="New Location"
                    value={newLocation}
                    onChange={(e) =>
                        setNewLocation(e.target.value)
                    }
                />

                <Button
                    variant="contained"
                    onClick={handleCreate}
                >
                    Add Location
                </Button>

            </Box>

            <Typography sx={{ mt: 2 }}>
                Locations currently loaded: {locations.length}
            </Typography>

            <TableContainer
                component={Paper}
                sx={{ mt: 3 }}
            >
                <Table>
                    <TableHead
                        sx={{
                            ".MuiTableCell-root": {
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
                                Location Name
                            </TableCell>

                            <TableCell>
                                Actions
                            </TableCell>

                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {locations.map((location) => (

                            <TableRow key={location.id}>
                                <TableCell>
                                    {location.id}
                                </TableCell>

                                <TableCell>
                                    {location.name}
                                </TableCell>

                                <TableCell>
                                    <IconButton
                                    color="error"
                                        onClick={() => {
                                            setLocationToDelete(location);
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

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>
                    Delete Location
                </DialogTitle>

                <DialogContent>
                    Are you sure you want to delete location

                    <b>
                        {" "}
                        {locationToDelete?.name}
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

        </Box>
    );

}


export default Locations;