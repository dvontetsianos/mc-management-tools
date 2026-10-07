import { useState, useEffect } from "react";
import { formatDateTime } from "../utils/formatDate";
import { getHistory } from "../services/historyService";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination
} from "@mui/material";


function History() {

    const [logs, setLogs] = useState([]);

    const [page, setPage] = useState(0);

    const [rowsPerPage, setRowsPerPage] = useState(25);

    const fetchHistory = async () => {

        const data = await getHistory();

        setLogs(data.logs);

    };

    useEffect(() => {
        fetchHistory();
    }, []);


    const getRowColor = (action) => {

        if (action === "created") {
            return "#81f3a1";
        }

        if (action === "updated") {
            return "#f1d5af";
        }

        if (action === "deleted") {
            return "#eeb2ab";
        }

        if (action === "uploaded image for") {
            return "#6f8aff7e";
        }

        if (action === "removed image from") {
            return "#a3a0a3";
        }

        return "#ffffff";
    }

    const getActionTextColor = (action) => {

        if (action === "created") {
            return "#1b8a3a";
        }

        if (action === "updated") {
            return "#c9750d";
        }

        if (action === "deleted") {
            return "#c62828";
        }

        if (action === "uploaded image for") {
            return "#0097a7";
        }

        if (action === "removed image from") {
            return "#7b1fa2";
        }

        return "#000000";
    }

    const paginatedLogs = rowsPerPage === -1
        ? logs
        : logs.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        );

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4">
                Action History
            </Typography>

            <TableContainer
                component={Paper}
                sx={{ mt:3 }}
            >
                <Table>
                    <TableHead
                        sx={{
                            "& .MuiTableCell-root": {
                                fontWeight: "bold",
                                backgroundColor: "#aee9f3",
                                py: 5
                            }
                        }}
                    >
                        <TableRow>
                            <TableCell>
                                Timestamp
                            </TableCell>

                            <TableCell>
                                User
                            </TableCell>

                            <TableCell>
                                Action
                            </TableCell>

                            <TableCell>
                                Entity Type
                            </TableCell>

                            <TableCell>
                                ID
                            </TableCell>

                            <TableCell>
                                Entity Name
                            </TableCell>

                            <TableCell>
                                Details
                            </TableCell>

                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {paginatedLogs.map((log, index) => (

                            <TableRow 
                                key={log.id} 
                                sx={{
                                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f4f6fb"
                                    }}
                            >
                                    <TableCell>
                                        {formatDateTime(log.timestamp)}
                                    </TableCell>

                                    <TableCell>
                                        {log.username}
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            color: getActionTextColor(log.action)
                                            }}
                                    >
                                        {log.action}
                                    </TableCell>

                                    <TableCell>
                                        <b>{log.entity_type}</b>
                                    </TableCell>

                                    <TableCell>
                                        {log.entity_id ?? "-"}
                                    </TableCell>

                                    <TableCell>
                                        {log.entity_name}
                                    </TableCell>

                                    <TableCell>
                                        <b>{log.details || "-"}</b>
                                    </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={logs.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
                rowsPerPageOptions={[25, 50, 100, { label: "All", value: -1 }]}
            ></TablePagination>
        </Box>
    );

}

export default History;