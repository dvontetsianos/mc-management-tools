import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSpendReport } from "../../services/reportService";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Grid,
    Alert,
    TextField,
    Button
} from "@mui/material";


const currencyFormatter = new Intl.NumberFormat(
    "en-US",
    {
        style: "currency",
        currency: "EUR"
    }
);


function SpendReport() {

    const navigate = useNavigate();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    //dates actually applied to the last fetch
    const [appliedStartDate, setAppliedStartDate] = useState("");
    const [appliedEndDate, setAppliedEndDate] = useState("");

    //draft values bound to the date pickers, only applied on click
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchReport = useCallback(async (startDate, end) => {

        setLoading(true);

        try {

            const data = await getSpendReport(startDate, end);

            setReport(data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }
    }, []);

    useEffect(() => {
        fetchReport(appliedStartDate, appliedEndDate);
    }, []);

    const handleApply = () => {
        setAppliedStartDate(startDate);
        setAppliedEndDate(endDate);
        fetchReport(startDate, endDate);
    };

    const handleClear = () => {
        setStartDate("");
        setEndDate("");
        setAppliedStartDate("");
        setAppliedEndDate("");
        fetchReport("", "");
    };

    const goToPurchases = (filterKey, row) => {

        //"Uncategorized" / "No Supplier" rows have no id to filter by - leave them as plain text
        if (row.id === null || row.id === undefined) {
            return;
        }

        const params = new URLSearchParams();

        params.append(filterKey, row.id);

        if (appliedStartDate) params.append("start_date", appliedStartDate);
        if (appliedEndDate) params.append("end_date", appliedEndDate);

        navigate(`/purchases?${params.toString()}`, {
            state: {filterLabel: row.name }
        });

    };

    const renderBreakdownTable = (title, rows, filterKey) => (

        <TableContainer component={Paper} sx={{ mt: 2 }}>

            <Typography
                variant="h6"
                sx={{ p: 2 }}
            >
                {title}
            </Typography>

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
                            Name
                        </TableCell>

                        <TableCell align="right">
                            Spend
                        </TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {rows.map((row) => {

                        const clickable = row.id !== null && row.id !== undefined;

                        return (
                            <TableRow
                                key={row.name}
                                hover={clickable}
                                onClick={() => clickable && goToPurchases(filterKey, row)}
                                sx={{ cursor: clickable ? "pointer" : "default" }}
                            >
                                <TableCell>
                                    {row.name}
                                </TableCell>

                                <TableCell align="right">
                                    {currencyFormatter.format(row.value)}
                                </TableCell>
                            </TableRow>
                        );
                    })}

                    {rows.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={2} align="center">
                                No purchases in this period.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Box sx={{ p: 3 }}>

            <Typography variant="h4" gutterBottom>
                Spend Report
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                    mt: 2,
                    mb: 2
                }}
            >

                <TextField
                    label="From"
                    type="date"
                    size="small"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                />

                <TextField
                    label="To"
                    type="date"
                    size="small"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                />

                <Button
                    variant="contained"
                    onClick={handleApply}
                >
                    Apply
                </Button>

                <Button
                    variant="outlined"
                    onClick={handleClear}
                >
                    Clear (All Time)
                </Button>

            </Box>

            {loading && (
                <Typography>Loading...</Typography>
            )}

            {!loading && report && (
                <>
                    <Card sx={{ mt: 2, mb: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle1">
                                Total Spend
                                {" "}
                                {appliedStartDate || appliedEndDate
                                    ? `(${appliedStartDate || "…"} to ${appliedEndDate || "…"})`
                                    : "(All Time)"}
                            </Typography>

                            <Typography variant="h3">
                                {currencyFormatter.format(report.grand_total)}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                Based on {report.purchase_count} logged purchase{report.purchase_count === 1 ? "" : "s"}.
                            </Typography>
                        </CardContent>
                    </Card>

                    {report.missing_cost_count > 0 && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            {report.missing_cost_count} purchase{report.missing_cost_count === 1 ? "" : "s"} in this period have no unit cost set and are excluded from this total.
                        </Alert>
                    )}

                    <Grid container spacing={2}>

                        <Grid size={{ xs: 12, md: 6 }}>
                            {renderBreakdownTable("By Category", report.by_category, "category_id")}
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            {renderBreakdownTable("By Supplier", report.by_supplier, "supplier_id")}
                        </Grid>
                    </Grid>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
                        Click a row to see the individual purchases behind that total.
                    </Typography>
                </>
            )}

        </Box>
    );
}

export default SpendReport;