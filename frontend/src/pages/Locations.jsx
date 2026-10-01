import { useState, useEffect } from "react";
import { getLocations, createLocation, deleteLocation } from "../services/locationService";
import { getHotels } from "../services/hotelService";
import { getUser } from "../services/auth";
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
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";


function Locations() {

    const [locations, setLocations] = useState([]);
    const [hotels, setHotels] = useState([]);

    const [newLocation, setNewLocation] = useState("");
    const [newLocationHotelId, setNewLocationHotelId] = useState("");

    const [locationToDelete, setLocationToDelete] = useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [snackbarMessage, setSnackbarMessage] = useState("");

    const [snackbarSeverity, setSnackbarSeverity] = useState("error");

    const [creating, setCreating] = useState(false);

    //admins and all-hotels users can add locations to every hotel, everyone else only to their own
    const user = getUser();
    const hasAllHotels = user?.role === "admin" || user?.permissions?.includes("all_hotels_access");
    const canUseHotel = (hotelId) => hasAllHotels || (user?.hotel_ids || []).includes(hotelId);
    const selectableHotels = hotels.filter((hotel) => canUseHotel(hotel.id));

    const fetchLocations = async () => {

        const data = await getLocations();

        setLocations(data);

    };

    const fetchHotels = async () => {

        const data = await getHotels();

        setHotels(data);

        //a user with only one hotel gets it pre-selected
        const myHotels = data.filter((hotel) => canUseHotel(hotel.id));

        if (myHotels.length === 1) {
            setNewLocationHotelId(myHotels[0].id);
        }

    };

    const getHotelName = (hotelId) => {

        const hotel = hotels.find((h) => h.id === hotelId);

        return hotel ? hotel.name : "-";
    };

    const handleCreate = async () => {

        if (!newLocation.trim()) {
            return;
        }

        if (!newLocationHotelId) {

            setSnackbarMessage("Please choose a hotel.");

            setSnackbarSeverity("error");

            setSnackbarOpen(true);

            return;
        }

        setCreating(true);

        try {

            await createLocation(newLocation, newLocationHotelId);

            setNewLocation("");

            await fetchLocations();

            setSnackbarMessage("Location created successfully");

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

        if (!locationToDelete) {
            return;
        }

        try {

            const result = await deleteLocation(locationToDelete.id);

            await fetchLocations();

            setSnackbarMessage(result.message || "Location deleted successfully");

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
        fetchHotels();
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
                    mt: 3,
                    alignItems: "center"
                }}
            >
                <TextField
                    label="New Location"
                    value={newLocation}
                    onChange={(e) =>
                        setNewLocation(e.target.value)
                    }
                />

                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Hotel</InputLabel>

                    <Select
                        value={newLocationHotelId}
                        label="Hotel"
                        onChange={(e) =>
                            setNewLocationHotelId(e.target.value)
                        }
                    >
                        {selectableHotels.map((hotel) => (
                            <MenuItem key={hotel.id} value={hotel.id}>
                                {hotel.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    onClick={handleCreate}
                    disabled={creating}
                >
                    {creating ? "Adding..." : "Add Location"}
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
                                Hotel
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
                                    {getHotelName(location.hotel_id)}
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