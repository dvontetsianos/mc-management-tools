import { Typography, Grid, Card, CardContent, Button, Box } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";



function Reports() {

    return (
        <Box sx={{ p: 3 }}>

            <Typography variant="h4" gutterBottom>
                Reports
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>

                <Grid size={{ xs: 12, md: 4 }}>

                    <Card>

                        <CardContent>

                            <AttachMoneyIcon fontSize="large" />

                            <Typography variant="h6">
                                Inventory Value
                            </Typography>

                            <Typography align="center">
                                Total inventory value broken down by category, location and supplier.
                            </Typography>

                            <Button
                                variant="contained"
                                sx={{ mt: 2 }}
                                href="/reports/inventory-value"
                            >
                                GO
                            </Button>

                        </CardContent>

                    </Card>

                </Grid>

            </Grid>

        </Box>
    );

}


export default Reports;