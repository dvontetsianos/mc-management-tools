import { useState, useEffect } from "react";
import { formatDateTime } from "../utils/formatDate";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from "@mui/material";
import { getItemMovements } from "../services/movementService";
import LocationLabel from "../components/LocationLabel";



function Movements() {

    const [movements, setMovements] = useState([]);

    const fetchMovements = async () => {
        const data = await getItemMovements();
        setMovements(data);
    };

    useEffect(() => {
        fetchMovements();
    }, []);

    const formatDate = (value) => {

        if (!value) {
            return "-";
        }

        return formatDateTime(value);
    };

    return (
        <Box>
            <Typography variant="h4">
                Item Movements
            </Typography>

            <TableContainer component={Paper} sx={{ mt: 3 }}>
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
                            <TableCell>Item</TableCell>
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
                                <TableCell>{formatDate(movement.created_at)}</TableCell>
                                <TableCell>{movement.item_name || "-"}</TableCell>
                                <TableCell>
                                    {movement.from_location
                                        ? <LocationLabel name={movement.from_location} hotel={movement.from_hotel_name} />
                                        : "Initial Placement"}
                                </TableCell>
                                <TableCell>
                                    <LocationLabel name={movement.to_location} hotel={movement.to_hotel_name} />
                                </TableCell>
                                <TableCell align="center">{movement.quantity}</TableCell>
                                <TableCell>{movement.moved_by}</TableCell>
                                <TableCell>{movement.reason || "-"}</TableCell>
                            </TableRow>
                        ))}

                        {movements.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No movements logged yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}


export default Movements;