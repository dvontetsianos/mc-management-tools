import { useEffect, useMemo, useState } from "react";
import { formatDateOnly } from "../../utils/formatDate";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    Box,
    Typography,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getPurchases } from "../../services/purchaseService";



const currencyFormatter = new Intl.NumberFormat(
    "en-US",
    {
        style: "currency",
        currency: "EUR"
    }
);


function ItemPurchaseHistory() {

    const navigate = useNavigate();
    const { itemId } = useParams();
    const routerLocation = useLocation();

    const [itemName] = useState(routerLocation.state?.itemName || "");
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        setLoading(true);

        getPurchases({ itemId })
            .then((data) => setPurchases(data))
            .catch(() => setError("Couldn't load purchase history. Check your connection and try again."))
            .finally(() => setLoading(false));
    }, [itemId]);

    const formatDate = (value) => {

        if (!value) {
            return "-";
        }

        return formatDateOnly(value);
    };

    //most recent purchase (by document date, falling back to when it was logged) first
    const sortedPurchases = useMemo(() => {

        return [...purchases].sort((a, b) => {

            const dateA = new Date(a.document_date || a.created_at);
            const dateB = new Date(b.document_date || b.created_at);

            return dateB - dateA;
        });
    }, [purchases]);



    return (
        <Box sx={{ p: 3 }}>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>

                <Typography variant="h4">
                    {itemName ? `Purchase History: ${itemName}` : "Purchase History"}
                </Typography>
            </Box>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Typography color="error.main">
                    {error}
                </Typography>
            )}

            {!loading && !error && (
                <TableContainer component={Paper}>
                    <Table size="small">

                        <TableHead
                            sx={{
                                "& .MuiTableCell-root": {
                                    fontWeight: "bold",
                                    backgroundColor: "#aee9f3"
                                }
                            }}
                        >
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell align="center">Qty</TableCell>
                                <TableCell align="center">Unit Cost</TableCell>
                                <TableCell>Supplier</TableCell>
                                <TableCell>Doc #</TableCell>
                                <TableCell>Notes</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {sortedPurchases.map((purchase, index) => (
                                <TableRow key={purchase.id}>
                                    <TableCell>
                                        {formatDate(purchase.document_date || purchase.created_at)}
                                    </TableCell>
                                    <TableCell align="center">{purchase.quantity}</TableCell>
                                    <TableCell align="center">
                                        {purchase.unit_cost != null
                                            ? currencyFormatter.format(purchase.unit_cost)
                                        : "-"}
                                    </TableCell>
                                    <TableCell>{purchase.supplier || "-"}</TableCell>
                                    <TableCell>{purchase.document_number || "-"}</TableCell>
                                    <TableCell>{purchase.notes || "-"}</TableCell>
                                </TableRow>
                            ))}

                            {sortedPurchases.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No purchase logged for this item yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>

                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}


export default ItemPurchaseHistory;