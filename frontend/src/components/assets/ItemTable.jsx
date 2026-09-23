import { useState } from "react";
import { IconButton, Tooltip, Button } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import HistoryIcon from "@mui/icons-material/History";
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
    Box,
    Menu,
    MenuItem
} from "@mui/material";
import { getUser } from "../../services/auth";
import { API_URL } from "../../config";
import { ZOOM_PRESETS } from "../../hooks/useTableZoom";



function getStaffCountStyle(staffCounted, expected) {

    const target = expected || 0;

    const GREEN = [46, 125, 50];
    const RED = [211, 47, 47];
    const WHITE = [255, 255, 255];
    const YELLOW = [255, 202, 40];

    let rgb;

    if (target === 0) {
        rgb = staffCounted === 0 ? GREEN : YELLOW;
    } else {

        const percentage = (staffCounted / target) * 100;

        if (percentage === 100) {
            rgb = GREEN;
        } else if (percentage > 100) {
            rgb = YELLOW;
        } else {
            const ratio = Math.max(0, Math.min(percentage, 100)) / 100;
            rgb = RED.map((channel, i) =>
                Math.round(channel + (WHITE[i] - channel) * ratio)
            );
        }
    }

    const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    const textColor = luminance > 0.6 ? "#000000" : "#ffffff";

    return {
        backgroundColor: `rgb(${rgb.join(",")})`,
        color: textColor
    };

}





function ItemTable({
    items,
    selectedLocations,
    onDelete,
    onEdit,
    onMove,
    onHistory,
    onSort,
    sortColumn,
    sortDirection,
    zoomLevel = "medium"
}) {

    const user = getUser();
    const zoom = (ZOOM_PRESETS[zoomLevel] || ZOOM_PRESETS.medium).zoom;

    const canViewPurchases = user?.role === "admin" || user?.permissions?.includes("purchases_access");
    const canViewMovements = user?.role === "admin" || user?.permissions?.includes("movements_access");

    const [historyMenuAnchor, setHistoryMenuAnchor] = useState(null);
    const [historyMenuItem, setHistoryMenuItem] = useState(null);

    const handleHistoryMenuOpen = (event, item) => {
        setHistoryMenuAnchor(event.currentTarget);
        setHistoryMenuItem(item);
    };

    const handleHistoryMenuClose = () => {
        setHistoryMenuAnchor(null);
        setHistoryMenuItem(null);
    };

    const handleHistoryChoice = (type) => {
        onHistory(historyMenuItem, type);
        handleHistoryMenuClose();
    };

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

                <TableContainer sx={{ zoom }}>

                    <Table size="small" sx={{ tableLayout: "fixed" }}>

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

                                <TableCell align="center" sx={{ width: 140 }}>
                                    Expected Total
                                </TableCell>

                                <TableCell
                                    align="center"
                                    sx={{ width: 140 }}
                                    onClick={() => onSort("assigned_quantity")}>
                                        Assigned Quantity{getSortArrow("assigned_quantity")}
                                </TableCell>

                                <TableCell
                                    align="center"
                                    sx={{ width: 120 }}
                                    onClick={() => onSort("broken_missing")}
                                >
                                    Broken/Missing{getSortArrow("broken_missing")}
                                </TableCell>

                                <TableCell
                                    align="center"
                                    sx={{ width: 140 }}
                                    onClick={() => onSort("staff_counted_quantity")}
                                >
                                    Staff Count{getSortArrow("staff_counted_quantity")}
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
                                    Edit / Assign{(canViewPurchases || canViewMovements) ? " / History" : ""}
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
                                        
                                    }}
                                >

                                    <TableCell sx={{ width: 30}}>{item.id}</TableCell>
                                    <TableCell align="center" sx={{ p: 0, position: "relative" }}>
                                        <Avatar
                                            variant="rounded"
                                            src={
                                                item.image_url
                                                ? `${API_URL}/${item.image_url}`
                                                :undefined
                                            }
                                            sx={{
                                                position: "relative",
                                                inset: 0,
                                                borderRadius: 0,
                                                height: 120,
                                                width: 120,
                                                backgroundColor: "#f5f5f5",
                                                "& img": {
                                                    objectFit: "cover"
                                                }
                                            }}
                                        >
                                            {!item.image_url &&
                                            <ImageNotSupportedIcon />}
                                        </Avatar>
                                    </TableCell>

                                    <TableCell align="center">{item.name}</TableCell>
                                    <TableCell sx={{ width: 100}} align="center">{item.category}</TableCell>
                                    <TableCell align="center" sx={{ width: 140 }}>{item.expected_total}</TableCell>
                                    <TableCell align="center" sx={{ width: 140}}>{item.assigned_quantity}</TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{ width:120 }}
                                    >
                                        {item.broken_missing}
                                    </TableCell>

                                    <TableCell align="center" sx={{ width: 140 }}>
                                        {item.staff_counted_quantity === null || item.staff_counted_quantity === undefined ? (
                                            <Chip label="Not Counted" size="small" variant="outlined" />
                                        ) : (
                                            <Chip
                                                label={item.staff_counted_quantity}
                                                size="small"
                                                sx={{
                                                    ...getStaffCountStyle(item.staff_counted_quantity, item.assigned_quantity),
                                                    fontWeight: "bold"
                                                }}
                                            />
                                        )}
                                    </TableCell>

                                    <TableCell align="center" sx={{ width: 250, maxWidth: 250 }}>
                                        {item.locations && item.locations.filter((loc) => loc.total_quantity > 0).length > 0 ? (
                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0, justifyContent: "center" }}>
                                                {item.locations.filter((loc) => loc.total_quantity > 0).map((loc) => (
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
                                                <EditIcon fontSize="large"/>
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Move Item">
                                            <IconButton
                                                color="secondary"
                                                onClick={() => onMove(item)}
                                            >
                                                <SwapHorizIcon fontSize="large"/>
                                            </IconButton>
                                        </Tooltip>

                                        {(canViewPurchases || canViewMovements) && (
                                            <Tooltip title="History">
                                                <IconButton
                                                    onClick={(e) => handleHistoryMenuOpen(e, item)}
                                                >
                                                    <HistoryIcon fontSize="large"/>
                                                </IconButton>
                                            </Tooltip>
                                        )}

                                        {user?.role === "admin" && (
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
            
            <Menu
                anchorEl={historyMenuAnchor}
                open={Boolean(historyMenuAnchor)}
                onClose={handleHistoryMenuClose}
            >
                {canViewPurchases && (
                    <MenuItem onClick={() => handleHistoryChoice("purchases")}>
                        Purchases
                    </MenuItem>
                )}

                {canViewMovements && (
                    <MenuItem onClick={() => handleHistoryChoice("movements")}>
                        Movements
                    </MenuItem>
                )}
            </Menu>

        </Paper>
    );

}


export default ItemTable;