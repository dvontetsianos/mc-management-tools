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
import LocationLabel from "../LocationLabel";
import { formatCountedAt } from "../../utils/countedAt";



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


//compares every counted location with its own system quantity (Unassigned is never counted)
function getCountSummary(item) {

    //count_locations = the locations in the current location filter (set by the page), otherwise all of them
    const locations = (item.count_locations || item.locations || []).filter((loc) => loc.location !== "Unassigned");

    const counted = locations.filter(
        (loc) => loc.staff_counted_quantity !== null && loc.staff_counted_quantity !== undefined
    );

    const countedTotal = counted.reduce((sum, loc) => sum + loc.staff_counted_quantity, 0);
    const systemTotal = counted.reduce((sum, loc) => sum + (loc.total_quantity || 0), 0);

    //the total matches, but some locations have more and others less(items moved around)
    const moved = countedTotal === systemTotal
        && counted.some((loc) => loc.staff_counted_quantity !== (loc.total_quantity || 0));


    //locations that have stock but no count yet
    const uncounted = locations.filter(
        (loc) => (loc.total_quantity || 0) > 0
            && (loc.staff_counted_quantity === null || loc.staff_counted_quantity === undefined)
    );

    return { counted, countedTotal, systemTotal, moved, uncounted };
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

                                <TableCell
                                    onClick={() => onSort("subcategory")}
                                    align="center"
                                    sx={{ width: 120 }}
                                >
                                    Subcategory{getSortArrow("subcategory")}
                                </TableCell>

                                <TableCell
                                    align="center"
                                    sx={{ width: 140 }}
                                    onClick={() => onSort("expected_total")}
                                >
                                    Expected Total{getSortArrow("expected_total")}
                                </TableCell>

                                <TableCell
                                    align="center"
                                    sx={{ width: 140 }}
                                    onClick={() => onSort("assigned_quantity")}>
                                        Assigned Quantity{getSortArrow("assigned_quantity")}
                                </TableCell>

                                <TableCell
                                    align="center"
                                    sx={{ width: 140 }}
                                    onClick={() => onSort("staff_counted_quantity")}
                                >
                                    Staff Count{getSortArrow("staff_counted_quantity")}
                                </TableCell>

                                <TableCell
                                    align="center"
                                    sx={{ width: 120 }}
                                    onClick={() => onSort("missing")}
                                >
                                    Missing{getSortArrow("missing")}
                                </TableCell>

                                <TableCell align="center" sx={{ width: 250 }}>
                                    Locations
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
                                    <TableCell sx={{ width: 100 }} align="center">{item.subcategory || "-"}</TableCell>
                                    <TableCell align="center" sx={{ width: 140 }}>{item.expected_total}</TableCell>
                                    <TableCell align="center" sx={{ width: 140}}>{item.assigned_quantity}</TableCell>
                                    <TableCell align="center" sx={{ width: 140 }}>
                                        {(() => {
                                            const summary = getCountSummary(item);

                                            if (summary.counted.length === 0) {
                                                return <Chip label="Not Counted" size="small" variant="outlined" />;
                                            }

                                            return (
                                                <Tooltip
                                                    arrow
                                                    title={
                                                        <Box>
                                                            {summary.counted.map((loc) => {
                                                                const difference = loc.staff_counted_quantity - (loc.total_quantity || 0);

                                                                return (
                                                                    <div key={loc.id}>
                                                                        {loc.location}{loc.hotel_name ? ` (${loc.hotel_name})` : ""}: counted {loc.staff_counted_quantity}, assigned {loc.total_quantity || 0}{difference !== 0 ? ` (${difference > 0 ? "+" : ""}${difference})` : ""}, by {loc.staff_counted_by || "unknown"}{loc.staff_counted_at ? `, ${formatCountedAt(loc.staff_counted_at)}` : ""}
                                                                    </div>
                                                                );
                                                            })}

                                                            {summary.uncounted.map((loc) => (
                                                                <div key={loc.id}>
                                                                    {loc.location}{loc.hotel_name ? ` (${loc.hotel_name})` : ""}: not counted, assigned {loc.total_quantity}
                                                                </div>
                                                            ))}
                                                        </Box>
                                                    }
                                                >
                                                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                                                        <Chip
                                                            label={summary.countedTotal}
                                                            size="small"
                                                            sx={{
                                                                ...getStaffCountStyle(summary.countedTotal, summary.systemTotal),
                                                                fontWeight: "bold"
                                                            }}
                                                        />

                                                        {summary.moved && (
                                                            <SwapHorizIcon fontSize="small" sx={{ color: "warning.main" }} />
                                                        )}

                                                        {summary.uncounted.length > 0 && (
                                                            <Box component="span" sx={{ fontSize: "0.75em", opacity: 0.7 }}>
                                                                partial
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Tooltip>
                                            );
                                        })()}
                                    </TableCell>

                                    <TableCell
                                        align="center"
                                        sx={{ width:120 }}
                                    >
                                        {item.missing ?? "-"}
                                    </TableCell>

                                    <TableCell align="center" sx={{ width: 250, maxWidth: 250 }}>
                                        {item.locations && item.locations.filter((loc) => loc.total_quantity > 0).length > 0 ? (
                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0, justifyContent: "center" }}>
                                                {item.locations.filter((loc) => loc.total_quantity > 0).map((loc) => (
                                                    <Chip
                                                        key={loc.id}
                                                        label={<LocationLabel name={loc.location} hotel={loc.hotel_name} />}
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

                                        <Tooltip title="Edit">
                                            <IconButton
                                                color="primary"
                                                onClick={() => onEdit(item)}
                                            >
                                                <EditIcon fontSize="large"/>
                                            </IconButton>
                                        </Tooltip>

                                        {canViewMovements && (
                                            <Tooltip title="Move Item">
                                                <IconButton
                                                    color="secondary"
                                                    onClick={() => onMove(item)}
                                                >
                                                    <SwapHorizIcon fontSize="large"/>
                                                </IconButton>
                                            </Tooltip>
                                        )}

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