import { IconButton, Tooltip } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {
    Paper,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer
} from "@mui/material";
import { getUser } from "../../services/auth";



function LocationsTable({
    itemLocations,
    onDelete,
    onEdit,
    onSort,
    sortColumn,
    sortDirection
}) {

    const user = getUser();

    const getSortArrow = (column) => {

        if (sortColumn !== column) {
            return "";
        }

        return sortDirection === "asc"
            ?<ArrowUpwardIcon fontSize="small" />
            :<ArrowDownwardIcon fontSize="small" />;

    };

    return (
        <Paper sx={{ p: 2 }}>

            <h2>Locations</h2>

                <TableContainer>

                    <Table size="small">

                        <TableHead
                        sx={{
                            " .MuiTableCell-root": {
                                fontWeight: "bold",
                                backgroundColor: "#7becc3"
                            }
                        }}
                        >
                            <TableRow>
                                <TableCell onClick={() => onSort("id")}>
                                    ID{getSortArrow("id")}
                                </TableCell>

                                <TableCell onClick={() => onSort("item_name")}>
                                    Item{getSortArrow("item_name")}
                                </TableCell>

                                <TableCell onClick={() => onSort("location")}>
                                    Location{getSortArrow("location")}
                                </TableCell>

                                <TableCell
                                    align="center"
                                    onClick={() => onSort("total_quantity")}>
                                        Total Quantity{getSortArrow("total_quantity")}
                                </TableCell>

                                <TableCell
                                    align="left"
                                    sx={{ pl: 1 }}
                                    onClick={() => onSort("broken_quantity")}
                                >
                                    Broken Quantity{getSortArrow("broken_quantity")}
                                </TableCell>

                                <TableCell>
                                    Edit / Delete
                                </TableCell>

                            </TableRow>

                        </TableHead>

                        <TableBody>

                            {itemLocations.map((itemLocation) => (

                                <TableRow
                                    key={itemLocation.id}
                                    sx={{
                                        "&:nth-of-type(odd)": {
                                            backgroundColor: "#ddc9b6"
                                        },
                                        "&:hover": {
                                            backgroundColor: "#d1ebce"
                                        },
                                        "& .MuiTableCell-root": {
                                            py: 0
                                        }
                                    }}
                                >

                                    <TableCell>{itemLocation.id}</TableCell>
                                    <TableCell>{itemLocation.item_name}</TableCell>
                                    <TableCell>{itemLocation.location}</TableCell>
                                    <TableCell align="center">{itemLocation.total_quantity}</TableCell>
                                    <TableCell
                                        align="left"
                                        sx={{ pl: 6 }}
                                    >
                                        {itemLocation.broken_quantity}
                                    </TableCell>

                                    <TableCell>

                                        <Tooltip title="Edit Quantity">
                                            <IconButton
                                                color="primary"
                                                onClick={() => onEdit(itemLocation)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>

                                        {(user.role === "admin" || user.permissions?.includes("assets_access")) && (
                                            <Tooltip title="Remove from this location">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => onDelete(itemLocation)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
        </Paper>
    );

}


export default LocationsTable;