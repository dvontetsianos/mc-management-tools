import { useState, useEffect } from "react";
import { getInventoryValueReport } from "../../services/reportService";
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
    Alert
} from "@mui/material";


const currencyFormatter = new Intl.NumberFormat(
    "en-US",
    {
        style: "currency",
        currency: "EUR"
    }

);

function InventoryValue() {

    const [report, setReport] = useState(null);

    const fetchReport = async () => {

        try {

            const data = await getInventoryValueReport();

            setReport(data);

        } catch (error) {

            console.error(error);

        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const renderBreakdownTable = (title, rows) => (

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
                            Value
                        </TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.name}>
                            <TableCell>
                                {row.name}
                            </TableCell>

                            <TableCell align="right">
                                {currencyFormatter.format(row.value)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            
        </TableContainer>
    );

    if (!report) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>
                    Loading...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>

            <Typography variant="h4" gutterBottom>
                Inventory Value Report
            </Typography>

            <Card sx={{ mt: 2, mb: 2 }}>
                <CardContent>
                    <Typography variant="subtitle1">
                        Total Inventory Value
                    </Typography>

                    <Typography variant="h3">
                        {currencyFormatter.format(report.grand_total)}
                    </Typography>
                </CardContent>
            </Card>

            {report.missing_cost_count > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {report.missing_cost_count} assets have no cost set and are excluded from this report.
                </Alert>
            )}

            <Grid container spacing={2}>

                <Grid size={{ xs:12, md: 4 }}>
                    {renderBreakdownTable("By Category", report.by_category)}
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    {renderBreakdownTable("By Location", report.by_location)}
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    {renderBreakdownTable("By Supplier", report.by_supplier)}
                </Grid>

            </Grid>

        </Box>
    );
}


export default InventoryValue;