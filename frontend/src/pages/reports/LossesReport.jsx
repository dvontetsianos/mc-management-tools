import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    TextField,
    MenuItem,
    Button,
    Alert,
    Tabs,
    Tab,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Chip,
    CircularProgress
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { getLossesReport, exportLossesReport } from "../../services/reportService";
import { formatDateTime } from "../../utils/formatDate";


//the three kinds of stock change the report shows, with their colour
const REASONS = [
    { key: "broken", label: "Broken", color: "#C62828" },
    { key: "missing", label: "Missing", color: "#E65100" },
    { key: "found", label: "Found", color: "#2E7D32" }
];

//so a dropdown left on "All..." still shows that text (MUI hides an empty choice by default)
const SHOW_ALL = { select: { displayEmpty: true }, inputLabel: { shrink: true } };

const euro = new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" });

const monthName = (month) =>
    new Date(2000, month - 1, 1).toLocaleString("en-GB", { month: "long" });


//one table cell per reason: units in bold, the value under it ("-" when nothing)
function ReasonCells({ group }) {
    return REASONS.map((reason) => {
        const { units, value } = group[reason.key];

        return (
            <TableCell key={reason.key} align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                {units > 0 ? (
                    <>
                        <Box sx={{ fontWeight: 700, color: reason.color }}>{units}</Box>
                        <Box sx={{ fontSize: "0.8em", color: "text.secondary" }}>{euro.format(value)}</Box>
                    </>
                ) : (
                    <Box sx={{ color: "text.disabled" }}>-</Box>
                )}
            </TableCell>
        );
    });
}

const reasonHeaders = REASONS.map((reason) => (
    <TableCell key={reason.key} align="right">{reason.label}</TableCell>
));


function LossesReport() {

    //the Dadhboard's Broken card opens this page with ?reason=broken
    const [searchParams] = useSearchParams();

    const [filters, setFilters] = useState({
        year: new Date().getFullYear(),
        hotel_id: "",
        department_id: "",
        location_id: "",
        reason: searchParams.get("reason") || ""
    });

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [tab, setTab] = useState("location");
    const [exporting, setExporting] = useState(false);

    //every filter change loads the report again
    useEffect(() => {
        setLoading(true);
        setError("");

        getLossesReport(filters)
            .then(setReport)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [filters]);

    //changing the hotel clears the location (it may belong to another hotel)
    const setFilter = (name, value) => {
        setFilters((current) => ({
            ...current,
            [name]: value,
            ...(name === "hotel_id" ? { location_id: "" } : {})
        }));
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            await exportLossesReport(filters);
        } catch (err) {
            setError(err.message);
        } finally {
            setExporting(false);
        }
    };

    const choices = report?.choices || { years: [filters.year], hotels: [], departments: [], locations: [] };
    const locationChoices = choices.locations.filter(
        (location) => !filters.hotel_id || location.hotel_id === filters.hotel_id
    );
    const hasEntries = (report?.entries || []).length > 0;


    return (
        <Box>

            {/* title + export */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap", mb: 2 }}>
                <Box>
                    <Typography variant="h4">Losses</Typography>
                    <Typography color="text.secondary">
                        Broken (reported when it happens), missing and found (from closed counts).
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    disabled={!hasEntries || exporting}
                    onClick={handleExport}
                >
                    {exporting ? "Exporting..." : "Export .xlsx"}
                </Button>
            </Box>

            {/* filters */}
            <Paper sx={{ p: 2, mb: 2, display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(5, 1fr)" } }}>

                <TextField select label="Year" value={filters.year} onChange={(e) => setFilter("year", e.target.value)}>
                    {choices.years.map((year) => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                </TextField>

                <TextField select label="Hotel" value={filters.hotel_id} onChange={(e) => setFilter("hotel_id", e.target.value)} slotProps={SHOW_ALL}>
                    <MenuItem value="">All hotels</MenuItem>
                    {choices.hotels.map((hotel) => (
                        <MenuItem key={hotel.id} value={hotel.id}>{hotel.name}</MenuItem>
                    ))}
                </TextField>

                <TextField select label="Department" value={filters.department_id} onChange={(e) => setFilter("department_id", e.target.value)} slotProps={SHOW_ALL}>
                    <MenuItem value="">All departments</MenuItem>
                    {choices.departments.map((department) => (
                        <MenuItem key={department.id} value={department.id}>{department.name}</MenuItem>
                    ))}
                </TextField>

                <TextField select label="Location" value={filters.location_id} onChange={(e) => setFilter("location_id", e.target.value)} slotProps={SHOW_ALL}>
                    <MenuItem value="">All locations</MenuItem>
                    {locationChoices.map((location) => (
                        <MenuItem key={location.id} value={location.id}>{location.name}</MenuItem>
                    ))}
                </TextField>

                <TextField select label="Type" value={filters.reason} onChange={(e) => setFilter("reason", e.target.value)} slotProps={SHOW_ALL}>
                    <MenuItem value="">Broken, missing and found</MenuItem>
                    {REASONS.map((reason) => (
                        <MenuItem key={reason.key} value={reason.key}>{reason.label} only</MenuItem>
                    ))}
                </TextField>

            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading && !report ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                    <CircularProgress />
                </Box>
            ) : report && (
                <Box sx={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.2s" }}>

                    {/* the three totals */}
                    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, mb: 2 }}>
                        {REASONS.map((reason) => (
                            <Paper
                                key={reason.key}
                                sx={{ p: 2, borderTop: `3px solid ${reason.color}` }}
                            >
                                <Typography variant="subtitle2" sx={{ color: reason.color }}>
                                    {reason.label}
                                </Typography>
                                <Typography variant="h4" sx={{ fontVariantNumeric: "tabular-nums" }}>
                                    {report.totals[reason.key].units}
                                    <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                                        units
                                    </Typography>
                                </Typography>
                                <Typography color="text.secondary">
                                    {euro.format(report.totals[reason.key].value)}
                                </Typography>
                            </Paper>
                        ))}
                    </Box>

                    {report.entries_without_cost > 0 && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            {report.entries_without_cost} broken or missing {report.entries_without_cost === 1 ? "entry has" : "entries have"} no
                            cost per unit, so the € totals are lower than the real loss.
                        </Alert>
                    )}

                    {!hasEntries ? (
                        <Paper sx={{ p: 4, textAlign: "center" }}>
                            <Typography color="text.secondary">
                                Nothing broken, missing or found in {report.year} for these filters.
                            </Typography>
                        </Paper>
                    ) : (
                        <Paper>

                            <Tabs
                                value={tab}
                                onChange={(e, value) => setTab(value)}
                                variant="scrollable"
                                sx={{ borderBottom: 1, borderColor: "divider", px: 1 }}
                            >
                                <Tab value="location" label="By location" />
                                <Tab value="item" label="By item" />
                                <Tab value="month" label="By month" />
                                <Tab value="entries" label={`All entries (${report.entries.length})`} />
                            </Tabs>

                            <TableContainer sx={{ overflowX: "auto" }}>

                                {tab === "location" && (
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Location</TableCell>
                                                <TableCell>Hotel</TableCell>
                                                {reasonHeaders}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {report.by_location.map((row) => (
                                                <TableRow key={`${row.hotel}-${row.location}`} hover>
                                                    <TableCell sx={{ fontWeight: 600 }}>{row.location}</TableCell>
                                                    <TableCell>{row.hotel}</TableCell>
                                                    <ReasonCells group={row} />
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}

                                {tab === "item" && (
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Item</TableCell>
                                                <TableCell>Department</TableCell>
                                                {reasonHeaders}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {report.by_item.map((row, index) => (
                                                <TableRow key={index} hover>
                                                    <TableCell>
                                                        <Box sx={{ fontWeight: 600 }}>{row.item}</Box>
                                                        <Box sx={{ fontSize: "0.8em", color: "text.secondary" }}>
                                                            {[row.item_code, row.item_details].filter(Boolean).join(" · ")}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{row.department}</TableCell>
                                                    <ReasonCells group={row} />
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}

                                {tab === "month" && (
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Month</TableCell>
                                                {reasonHeaders}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {report.by_month.map((row) => (
                                                <TableRow key={row.month} hover>
                                                    <TableCell sx={{ fontWeight: 600 }}>{monthName(row.month)}</TableCell>
                                                    <ReasonCells group={row} />
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}

                                {tab === "entries" && (
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Date</TableCell>
                                                <TableCell>Item</TableCell>
                                                <TableCell>Location</TableCell>
                                                <TableCell>Type</TableCell>
                                                <TableCell align="right">Units</TableCell>
                                                <TableCell align="right">Value</TableCell>
                                                <TableCell>By</TableCell>
                                                <TableCell>Note</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {report.entries.map((entry) => {
                                                const reason = REASONS.find((r) => r.key === entry.reason);

                                                return (
                                                    <TableRow key={entry.id} hover>
                                                        <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDateTime(entry.date)}</TableCell>
                                                        <TableCell>
                                                            <Box sx={{ fontWeight: 600 }}>{entry.item}</Box>
                                                            <Box sx={{ fontSize: "0.8em", color: "text.secondary" }}>{entry.item_details}</Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            {entry.location}
                                                            <Box sx={{ fontSize: "0.8em", color: "text.secondary" }}>{entry.hotel}</Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                size="small"
                                                                label={reason.label}
                                                                sx={{ bgcolor: alpha(reason.color, 0.12), color: reason.color }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>{entry.units}</TableCell>
                                                        <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                                                            {entry.unit_cost === null ? "-" : euro.format(entry.value)}
                                                        </TableCell>
                                                        <TableCell>{entry.created_by}</TableCell>
                                                        <TableCell sx={{ color: "text.secondary" }}>{entry.notes || ""}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                )}

                            </TableContainer>
                        </Paper>
                    )}
                </Box>
            )}
        </Box>
    );
}


export default LossesReport;
