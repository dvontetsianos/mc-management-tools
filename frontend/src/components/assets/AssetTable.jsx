import { IconButton, Tooltip } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import {
    Paper,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Avatar
} from "@mui/material";
import { getUser } from "../../services/auth";
import { API_URL } from "../../config";


function AssetTable({
    assets,
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

            <h2>Assets</h2>

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
                                <TableCell onClick={() => onSort("id")}>
                                    ID{getSortArrow("id")}
                                </TableCell>

                                <TableCell align="left">
                                    Image
                                </TableCell>

                                <TableCell onClick={() => onSort("name")}>
                                    Name{getSortArrow("name")}
                                </TableCell>

                                <TableCell onClick={() => onSort("category")}>
                                    Category{getSortArrow("category")}
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
                                    sx={{
                                        pl: 1
                                    }}
                                    onClick={() => onSort("broken_quantity")}
                                >
                                    Broken Quantity{getSortArrow("broken_quantity")}
                                </TableCell>

                                <TableCell
                                    onClick={() => onSort("supplier")}
                                >
                                    Supplier{getSortArrow("supplier")}
                                </TableCell>

                                <TableCell
                                    align="center"
                                    onClick={() => onSort("cost_per_unit")}
                                >
                                    Cost/Unit{getSortArrow("cost_per_unit")}
                                </TableCell>

                                <TableCell>
                                    Edit / Assing / Delete
                                </TableCell>

                            </TableRow>
                        </TableHead>

                        <TableBody>

                            {assets.map((asset) => (

                                <TableRow
                                    key={asset.id}
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

                                    <TableCell>{asset.id}</TableCell>
                                    <TableCell align="center">
                                        <Avatar
                                            src={
                                                asset.image_url
                                                    ? `${API_URL}/${asset.image_url}`
                                                    : undefined
                                            }
                                            sx={{
                                                width: 80,
                                                height: 80
                                            }}
                                        >
                                            {!asset.image_url && 
                                            <ImageNotSupportedIcon />}
                                        </Avatar>

                                    </TableCell>
                                    <TableCell>{asset.name}</TableCell>
                                    <TableCell>{asset.category}</TableCell>
                                    <TableCell>{asset.location}</TableCell>
                                    <TableCell align="center">{asset.total_quantity}</TableCell>
                                    <TableCell
                                        align="left"
                                        sx={{
                                            pl: 6
                                        }}
                                    >
                                        {asset.broken_quantity}
                                    </TableCell>

                                    <TableCell>
                                        {asset.supplier || "-"}
                                    </TableCell>

                                    <TableCell align="center">
                                        {asset.cost_per_unit != null
                                        ? `€ ${Number(asset.cost_per_unit).toFixed(2)}` : "-"}
                                    </TableCell>

                                    <TableCell>

                                        <Tooltip title="Edit">
                                            <IconButton
                                                color="primary"
                                                onClick={() => onEdit(asset)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>

                                        {(user.role ==="admin" || user.permissions?.includes("assets_access"))  && (
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => onDelete(asset)}
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

export default AssetTable;