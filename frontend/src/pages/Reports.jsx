import { useNavigate } from "react-router-dom";
import { Box, Typography, Card, CardActionArea, CardContent, Avatar } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getUser } from "../services/auth";
import { REPORTS } from "./reports/reportList";


function Reports() {

    const navigate = useNavigate();
    const user = getUser();

    //admins see every report, everyone else the ones they have permission for
    const myReports = REPORTS.filter(
        (report) => user?.role === "admin" || user?.permissions?.includes(report.permission)
    );

    return (
        <Box>

            <Typography variant="h4">Reports</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Choose a report.
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
                    gap: 2
                }}
            >
                {myReports.map((report) => (
                    <Card key={report.path} variant="outlined">
                        <CardActionArea onClick={() => navigate(report.path)} sx={{ height: "100%" }}>
                            <CardContent sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>

                                <Avatar
                                    sx={{
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                        color: "primary.main"
                                    }}
                                >
                                    {report.icon}
                                </Avatar>

                                <Box>
                                    <Typography variant="h6">{report.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {report.description}
                                    </Typography>
                                </Box>

                            </CardContent>
                        </CardActionArea>
                    </Card>
                ))}
            </Box>

        </Box>
    );
}


export default Reports;
