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
    Typography,
    Box,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell
} from "@mui/material";
import { getItems, closeCounts } from "../../services/itemService";
import { getHotels } from "../../services/hotelService";
import { getDepartments } from "../../services/departmentService";
import { getLocations } from "../../services/locationService";


//only departments that have an items page
const ITEM_PAGE_DEPARTMENTS = ["F&B", "Housekeeping", "Kitchen"];

const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" });


//admin only: close a count by hotel / department / location / item ("" = all).
//every counted location becomes the new truth, each difference is saved as missing / found,
//and the counts are cleared. Same filters as Reset counts.
function CountCloseDialog({ open, onClose, onDone, defaultDepartmentId }) {

    const [hotels, setHotels] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [locations, setLocations] = useState([]);
    const [items, setItems] = useState([]);

    const [hotelId, setHotelId] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);

    const [preview, setPreview] = useState(null);
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


    //live preview: what closing would change right now
    useEffect(() => {

        if (!open) {
            return;
        }

        setPreview(null);
        setConfirming(false);
        setError("");

        closeCounts(filters, true)
            .then(setPreview)
            .catch((err) => setError(err.message));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, hotelId, departmentId, locationId, selectedItem]);


    //locations follow the chosen hotel
    const visibleLocations = locations
        .filter((l) => !hotelId || l.hotel_id === hotelId)
        .sort((a, b) =>
            (a.hotel_name || "").localeCompare(b.hotel_name || "") || a.name.localeCompare(b.name)
        );


    async function handleClose() {

        setWorking(true);
        setError("");

        try {
            const data = await closeCounts(filters, false);
            onDone(data);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setWorking(false);
            setConfirming(false);
        }
    }


    return (
        <Dialog open={open} onClose={working ? undefined : onClose} fullWidth maxWidth="md">

            <DialogTitle>Close count</DialogTitle>

            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>

                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Every counted location becomes the new truth: its stock is set to what staff counted,
                        each difference is saved as Missing or Found, and the counts are cleared.
                        Locations nobody counted are not touched.
                    </Typography>

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
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
                                value={departments.some((d) => d.id === departmentId) ? departmentId : ""}
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
                            getOptionLabel={(item) => [item.name, item.size, item.color].filter(Boolean).join(" · ")}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => (
                                <TextField {...params} label="Item" placeholder="All items (type to pick one)" />
                            )}
                        />
                    </Box>

                    {error && <Alert severity="error">{error}</Alert>}

                    {!error && preview && preview.counts === 0 && (
                        <Alert severity="info">Nothing has been counted for these choices.</Alert>
                    )}

                    {!error && preview && preview.counts > 0 && (
                        <>
                            {/* the totals first */}
                            <Alert severity={preview.changes.length > 0 ? "warning" : "success"}>
                                <b>{preview.counts}</b> count{preview.counts !== 1 ? "s" : ""}: {preview.matching} match
                                {preview.units_missing > 0 && (
                                    <>, <b>{preview.units_missing} missing</b> ({currencyFormatter.format(preview.value_missing)})</>
                                )}
                                {preview.units_found > 0 && <>, <b>{preview.units_found} found</b></>}
                                .
                                {preview.not_counted > 0 && (
                                    <> {preview.not_counted} stock row{preview.not_counted !== 1 ? "s were" : " was"} not counted and will stay as {preview.not_counted !== 1 ? "they are" : "it is"}.</>
                                )}
                            </Alert>

                            {/* then every difference, one row each */}
                            {preview.changes.length > 0 && (
                                <Box sx={{ maxHeight: 320, overflowY: "auto", border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Location</TableCell>
                                                <TableCell>Item</TableCell>
                                                <TableCell align="right">System</TableCell>
                                                <TableCell align="right">Broken</TableCell>
                                                <TableCell align="right">Counted</TableCell>
                                                <TableCell align="right">Difference</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {preview.changes.map((change) => (
                                                <TableRow key={change.item_location_id}>
                                                    <TableCell>
                                                        {change.location}{change.hotel ? ` (${change.hotel})` : ""}
                                                    </TableCell>
                                                    <TableCell>
                                                        {change.item}
                                                        {change.item_details && (
                                                            <Box component="span" sx={{ color: "text.secondary" }}> · {change.item_details}</Box>
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right">{change.system}</TableCell>
                                                    <TableCell align="right">{change.broken || "-"}</TableCell>
                                                    <TableCell align="right">{change.counted}</TableCell>
                                                    <TableCell
                                                        align="right"
                                                        sx={{ fontWeight: "bold", color: change.difference < 0 ? "error.main" : "success.main" }}
                                                    >
                                                        {change.difference > 0 ? "+" : ""}{change.difference} {change.reason === "missing" ? "Missing" : "Found"}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            )}
                        </>
                    )}

                    {confirming && (
                        <Alert severity="error">
                            Close {preview.counts} count{preview.counts !== 1 ? "s" : ""}? The stock will be set to what staff counted.
                            A backup is made first, but this can't be undone from the app.
                        </Alert>
                    )}

                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={confirming ? () => setConfirming(false) : onClose} disabled={working}>
                    {confirming ? "Back" : "Cancel"}
                </Button>

                <Button
                    variant="contained"
                    disabled={working || !preview || preview.counts === 0}
                    onClick={confirming ? handleClose : () => setConfirming(true)}
                >
                    {working ? "Closing..." : confirming ? "Yes, close count" : "Close count"}
                </Button>
            </DialogActions>

        </Dialog>
    );
}


export default CountCloseDialog;