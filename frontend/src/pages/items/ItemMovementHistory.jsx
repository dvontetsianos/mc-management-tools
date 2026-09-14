import { useEffect, useState } from "react";
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
import { getItemMovements } from "../../services/movementService";



function ItemMovementHistory() {

    const navigate = useNavigate();
    const { itemId } = useParams();
    const routerLocation = useLocation();

    const [itemName] = useState(routerLocation.state?.itemName || "");
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    
    useEffect(() => {

        setLoading(true);

        getItemMovements({ itemId })
            .then((data) => setMovements(data))
            .catch(() => setError("Couldn't load movement history. Check your connection and try again."))
            .finally(() => setLoading(false));
    }, [itemId]);

    const formatDate = (value) => {

        if (!value) {
            return "-";
        }

        return new Date(value + "Z").toLocaleString();
    };


    return (
        <Box sx={{ p: 3 }}>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>

                <Typography variant="h4">
                    {itemName ? `Movement History: ${itemName}` : "Movement History"}
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
                                <TableCell>From</TableCell>
                                <TableCell>To</TableCell>
                                <TableCell align="center">Qty</TableCell>
                                <TableCell>Moved By</TableCell>
                                <TableCell>Reason</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {movements.map((movement) => (
                                <TableRow key={movement.id}>
                                    <TableCell>
                                        {formatDate(movement.created_at)}
                                    </TableCell>
                                    <TableCell>{movement.from_location || "Initial Placement"}</TableCell>
                                    <TableCell>{movement.to_location}</TableCell>
                                    <TableCell align="center">{movement.quantity}</TableCell>
                                    <TableCell>{movement.moved_by}</TableCell>
                                    <TableCell>{movement.reason || "-"}</TableCell>
                                </TableRow>
                            ))}

                            {movements.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No movements logged for this item yet.
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


export default ItemMovementHistory;