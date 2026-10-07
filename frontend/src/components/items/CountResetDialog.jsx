import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Alert,
    Stack,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    Typography
} from "@mui/material";
import { getItems, resetCounts } from "../../services/itemService";
import { getHotels } from "../../services/hotelService";
import { getDepartments } from "../../services/departmentService";
import { getLocations } from "../../services/locationService";



//only departments that have an items page
const ITEM_PAGE_DEPARTMENTS = ["F&B", "Housekeeping", "Kitchen"];


//admin only: clear staff counts by hotel / department / location / item ("" = all)
function CountResetDialog({ open, onClose, onDone, defaultDepartmentId }) {

    const [hotels, setHotels] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [locations, setLocations] = useState([]);
    const [items, setItems] = useState([]);

    const [hotelId, setHotelId] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);

    const [previewCount, setPreviewCount] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const [working, setWorking] = useState(false);
    const [error, setError] = useState("");


    //fresh start every time the dialog opens, with this page's department pre-selected
    useEffect(() => {

        if (!open) {
            return;
        }

        setHotelId("");
        setDepartmentId(defaultDepartmentId || "");
        setLocationId("");
        setSelectedItem(null);
        setConfirming(false);
        setError("");

        Promise.all([getHotels(), getDepartments(), getLocations()])
            .then(([hotelsData, departmentsData, locationsData]) => {
                setHotels([...hotelsData].sort((a, b) => a.id - b.id));
                setDepartments(departmentsData.filter((d) => ITEM_PAGE_DEPARTMENTS.includes(d.name)));
                setLocations(locationsData.filter((l) => l.name !== "Unassigned"));
            })
            .catch(() => setError("Couldn't load the lists. Close and try again."));

    }, [open, defaultDepartmentId]);


    //the item list follows the chosen department
    useEffect(() => {

        if (!open) {
            return;
        }

        setSelectedItem(null);

        getItems(departmentId || undefined)
            .then((data) => setItems([...data].sort((a, b) => a.name.localeCompare(b.name))))
            .catch(() => setItems([]));

    }, [open, departmentId]);


    const filters = {
        hotel_id: hotelId || null,
        department_id: departmentId || null,
        location_id: locationId || null,
        item_id: selectedItem ? selectedItem.id : null
    };


    //live preview: how many counts match right now
    useEffect(() => {

        if (!open) {
            return;
        }

        setPreviewCount(null);
        setConfirming(false);
        setError("");

        resetCounts(filters, true)
            .then((data) => setPreviewCount(data.count))
            .catch((err) => setError(err.message));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, hotelId, departmentId, locationId, selectedItem]);


    //locations follow the chosen hotel
    const visibleLocations = locations
        .filter((l) => !hotelId || l.hotel_id === hotelId)
        .sort((a, b) =>
            (a.hotel_name || "").localeCompare(b.hotel_name || "") || a.name.localeCompare(b.name)
        );


    async function handleReset() {

        setWorking(true);
        setError("");

        try {
            const data = await resetCounts(filters, false);
            onDone(data.count);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setWorking(false);
            setConfirming(false);
        }
    }


    return (
        <Dialog open={open} onClose={working ? undefined : onClose} fullWidth maxWidth="sm">

            <DialogTitle>Reset counts</DialogTitle>

            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>

                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Clears the staff counts that match your choices, so they can be counted again.
                        Stock, purchases and moves are not touched.
                    </Typography>

                    <FormControl fullWidth size="small">
                        <InputLabel>Hotel</InputLabel>
                        <Select
                            value={hotelId}
                            label="Hotel"
                            onChange={(e) => {
                                setHotelId(e.target.value);
                                setLocationId("");
                            }}
                        >
                            <MenuItem value="">All hotels</MenuItem>
                            {hotels.map((hotel) => (
                                <MenuItem key={hotel.id} value={hotel.id}>{hotel.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                        <InputLabel>Department</InputLabel>
                        <Select
                            value={departmentId}
                            label="Department"
                            onChange={(e) => setDepartmentId(e.target.value)}
                        >
                            <MenuItem value="">All departments</MenuItem>
                            {departments.map((department) => (
                                <MenuItem key={department.id} value={department.id}>{department.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                        <InputLabel>Location</InputLabel>
                        <Select
                            value={locationId}
                            label="Location"
                            onChange={(e) => setLocationId(e.target.value)}
                        >
                            <MenuItem value="">All locations</MenuItem>
                            {visibleLocations.map((location) => (
                                <MenuItem key={location.id} value={location.id}>
                                    {location.name}{!hotelId && location.hotel_name ? ` (${location.hotel_name})` : ""}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Autocomplete
                        size="small"
                        options={items}
                        value={selectedItem}
                        onChange={(event, value) => setSelectedItem(value)}
                        getOptionLabel={(item) => item.name || ""}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={(params) => (
                            <TextField {...params} label="Item" placeholder="All items (type to pick one)" />
                        )}
                    />

                    {error && <Alert severity="error">{error}</Alert>}

                    {!error && previewCount !== null && (
                        <Alert severity={previewCount > 0 ? "warning" : "info"}>
                            {previewCount > 0
                                ? `This will clear ${previewCount} count${previewCount !== 1 ? "s" : ""}.`
                                : "Nothing to reset for these choices."}
                        </Alert>
                    )}

                    {confirming && (
                        <Alert severity="error">
                            Clear {previewCount} count{previewCount !== 1 ? "s" : ""}? This can't be undone.
                        </Alert>
                    )}

                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={confirming ? () => setConfirming(false) : onClose} disabled={working}>
                    {confirming ? "Back" : "Cancel"}
                </Button>

                <Button
                    color="error"
                    variant="contained"
                    disabled={working || !previewCount}
                    onClick={confirming ? handleReset : () => setConfirming(true)}
                >
                    {working ? "Resetting..." : confirming ? "Yes, reset" : "Reset"}
                </Button>
            </DialogActions>

        </Dialog>
    );
}


export default CountResetDialog;
