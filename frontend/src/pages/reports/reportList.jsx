import EuroIcon from "@mui/icons-material/Euro";
import RemoveCircleOutlinedIcon from "@mui/icons-material/RemoveCircleOutlined";


//every report in one list: the Reports page shows the ones the user has permission for,
//and the menu shows "Reports" if they have at least one.
//a new report = one more line here (+ its page and its route in App.jsx)
export const REPORTS = [
    {
        title: "Spend",
        description: "What was spent on purchases over a date range, by category and supplier.",
        path: "/reports/spend",
        permission: "spend_report_access",
        icon: <EuroIcon />
    },
    {
        title: "Losses",
        description: "What was broken, went missing or was found, by location, item and month.",
        path: "/reports/losses",
        permission: "losses_report_access",
        icon: <RemoveCircleOutlinedIcon />
    }
];


export const REPORT_PERMISSIONS = REPORTS.map((report) => report.permission);
