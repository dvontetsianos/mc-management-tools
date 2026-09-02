import { IconButton, Tooltip, Button } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
    Paper,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Avatar,
    Chip,
    Box
} from "@mui/material";
import { getUser } from "../../services/auth";
import { API_URL } from "../../config";



function ItemTable({
    items,
    selectedLocations,
    onDelete,
    onEdit,
    onAssign,
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

            <h2>Items</h2>

                <TableContainer>

                    <Table size="small">

                        <TableHead
                        sx={{
                            "& .MuiTableCell-root": {
                                fontWeight: "bold",
                                backgroundColor: "#7becc3"
                            }
                        }}
                        >
                            <TableRow>
                                <TableCell 
                                    onClick={() => onSort("id")}
                                    sx={{ width: 30 }}
                                >
                                    ID{getSortArrow("id")}
                                </TableCell>

                                <TableCell align="left" sx={{ width: 100, maxWidth: 100, px: 1 }}>
                                    Image
                                </TableCell>

                                <TableCell
                                    onClick={() => onSort("name")}
                                    align="center"
                                    sx={{ width: 300 }}
                                >
                                        Name{getSortArrow("name")}
                                </TableCell>

                                <TableCell 
                                    onClick={() => onSort("category")}
                                    align="center"
                                    sx={{ width: 100 }}
                                >
                                    Category{getSortArrow("category")}
                                </TableCell>

                                <TableCell
                                    align="center"
                                    onClick={() => onSort("total_quantity")}>
                                        Total Quantity{getSortArrow("total_quantity")}
                                </TableCell>

                                <TableCell
                                    align="center"
                                    sx={{ width: 120 }}
                                    onClick={() => onSort("broken_quantity")}
                                >
                                    Broken Quantity{getSortArrow("broken_quantity")}
                                </TableCell>

                                <TableCell align="center" sx={{ width: 250 }}>
                                    Locations
                                </TableCell>

                                <TableCell
                                    onClick={() => onSort("supplier")}
                                    align="center"
                                    sx={{ width: 140, maxWidth: 140 }}
                                >
                                    Supplier{getSortArrow("supplier")}
                                </TableCell>

                                <TableCell
                                    align="center"
                                    sx={{ width: 140 }}
                                    onClick={() => onSort("cost_per_unit")}
                                >
                                    Cost/Unit{getSortArrow("cost_per_unit")}
                                </TableCell>

                                <TableCell align="center" sx={{ width: 180 }}>
                                    Edit / Assign / Delete
                                </TableCell>

                            </TableRow>
                        </TableHead>

                        <TableBody>

                            {items.map((item) => (

                                <TableRow
                                    key={item.id}
                                    sx={{
                                        "&:nth-of-type(odd)": {
                                            backgroundColor: "#ddc9b6"
                                        },
                                        "& .MuiTableCell-root": {
                                            py: 0
                                        }
                                    }}
                                >

                                    <TableCell sx={{ width: 30}}>{item.id}</TableCell>
                                    <TableCell align="center">
                                        <Avatar
                                            variant="rounded"
                                            src={
                                                item.image_url
                                                ? `${API_URL}/${item.image_url}`
                                                :undefined
                                            }
                                            sx={{
                                                width: 100,
                                                height: 100
                                            }}
                                        >
                                            {!item.image_url &&
                                            <ImageNotSupportedIcon />}
                                        </Avatar>
                                    </TableCell>

                                    <TableCell align="center">{item.name}</TableCell>
                                    <TableCell sx={{ width: 100}} align="center">{item.category}</TableCell>
                                    <TableCell align="center" sx={{ width: 140}}>{item.total_quantity}</TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{ width:120 }}
                                    >
                                        {item.broken_quantity}
                                    </TableCell>

                                    <TableCell align="center" sx={{ width: 250, maxWidth: 250 }}>
                                        {item.locations && item.locations.length > 0 ? (
                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0, justifyContent: "center" }}>
                                                {item.locations.map((loc) => (
                                                    <Chip
                                                        key={loc.id}
                                                        label={loc.location}
                                                        size="small"
                                                        color={selectedLocations && selectedLocations.includes(loc.location) ? "success" : "default"}
                                                    />
                                                ))}
                                            </Box>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>

                                    <TableCell align="center">
                                        {item.supplier || "-"}
                                    </TableCell>

                                    <TableCell align="center">
                                        {item.cost_per_unit != null
                                        ? `€ ${Number(item.cost_per_unit).toFixed(2)}` : "-"}
                                    </TableCell>

                                    <TableCell align="center">

                                        <Tooltip title="Edit">
                                            <IconButton
                                                color="primary"
                                                onClick={() => onEdit(item)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Manage Locations">
                                            <IconButton
                                                color="secondary"
                                                onClick={() => onAssign(item)}
                                            >
                                                <LocationOnIcon />
                                            </IconButton>
                                        </Tooltip>

                                        {user.role === "admin" && (
                                            <Tooltip title="Delete (admin only)">
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    sx={{
                                                        minWidth: 0,
                                                        ml: 1,
                                                        backgroundColor: "#070000",
                                                        color: "red"
                                                    }}
                                                    onClick={() => onDelete(item)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </Button>
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


export default ItemTable;