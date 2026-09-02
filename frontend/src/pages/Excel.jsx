import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Checkbox
} from "@mui/material";
import { previewExcel } from "../services/excelService";

function Excel() {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [sheetNames, setSheetNames] = useState([]);
    const [selectedSheet, setSelectedSheet] = useState("");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedRow, setSelectedRow] = useState(null);
    const [checkedRows, setCheckRows] = useState({});


    const loadPreview = async (selectedFile, sheetName = "") => {
        setLoading(true);
        setError("");

        try {
            const data = await previewExcel(selectedFile, sheetName);

            setFileName(data.file_name);
            setSheetNames(data.sheet_names);
            setSelectedSheet(data.selected_sheet);
            setRows(data.rows);
        } catch (error) {
            setError(error.message);
            setRows([]);
            setSheetNames([]);
            setSelectedSheet("");
        } finally {
            setLoading(false);
        }
    };


    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) return;

        setFile(selectedFile);
        loadPreview(selectedFile);
    };

    const handleSheetChange = (event) => {
        loadPreview(file, event.target.value);
    };

    const columnCount = rows.reduce(
        (largestRow, row) => Math.max(largestRow, row.length),
        0
    );

    const headers = rows[0] || [];
    const dataRows = rows.slice(1);

    const highlightedColumnName = "Due in:";

    const highlightedColumnNameIndex = headers.findIndex(
        (header) => 
            String(header).trim().toLowerCase() ===
            highlightedColumnName.toLowerCase()
    );

    const lowValueRows =
        highlightedColumnNameIndex === -1
            ? []
            : dataRows
                .map((row, rowIndex) => ({
                    sourceRowNumber: rowIndex + 2,
                    value: row[highlightedColumnNameIndex],
                    row
                }))
                .filter(({ value }) => {
                    const valueText = String(value ?? "").trim();

                    if (valueText === "") {
                        return false;
                    }

                    const numericValue = Number(
                        valueText.replace(/,/g, "")
                    );

                    return (
                        Number.isFinite(numericValue) &&
                        numericValue < 10
                    );

                })
                .sort((firstRow, secondRow) => {
                    const firstValue = Number(
                        String(firstRow.value).replace(/,/g,"")
                    );
                    const secondValue = Number(
                        String(secondRow.value).replace(/,/g, "")
                    );

                    return firstValue - secondValue;

                });

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
                Excel Viewer
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Upload an Excel workbook to preview its worksheet data.
            </Typography>

            <Button variant="contained" component="label">
                Choose .xlsx File
                <input
                    hidden
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                />
            </Button>

            {fileName && (
                <Typography sx={{ mt: 2 }}>
                    File: {fileName}
                </Typography>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {sheetNames.length > 0 && (
                <FormControl sx={{ mt: 2, minWidth: 220 }}>
                    <InputLabel id="sheet-select-label">Worksheet</InputLabel>
                    
                    <Select
                        labelId="sheet-select-label"
                        value={selectedSheet}
                        label="Worksheet"
                        onChange={handleSheetChange}
                    >
                        {sheetNames.map((sheetName) => (
                            <MenuItem key={sheetName} value={sheetName}>
                                {sheetName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {loading && (
                <Box sx={{ mt: 3 }}>
                    <CircularProgress size={28} />
                </Box>
            )}


            {!loading && rows.length > 0 && (
                <>
                    <Typography sx={{ mt: 3, mb: 1 }}>
                        {dataRows.length} data rows · {columnCount} columns
                    </Typography>
                    
                    <TableContainer
                        component={Paper}
                        sx={{ overflowX: "auto" }}
                    >
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {Array.from(
                                        { length: columnCount },
                                        (_, columnIndex) => (
                                            <TableCell
                                                key={columnIndex}
                                                sx={
                                                    columnIndex === highlightedColumnNameIndex
                                                        ? {
                                                            backgroundColor: "#e3f2fd",
                                                            color: "#0d47a1",
                                                            fontWeight: "bold",
                                                            borderLeft: "2px solid #1976d2",
                                                            borderRight: "2px solid #1976d2"
                                                        } 
                                                        : undefined
                                                }
                                            >
                                                {headers[columnIndex] || `Column ${columnIndex + 1}`}
                                            </TableCell>
                                        )
                                    )}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {dataRows.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        {Array.from(
                                            { length: columnCount },
                                            (_, columnIndex) => (
                                                <TableCell 
                                                    key={columnIndex}
                                                    sx={() => {
                                                        const cellValue = row[columnIndex] ?? "";
                                                        const numericValue = Number(
                                                            String(cellValue).replace(/,/g, "")
                                                        );

                                                        const isHighlightedColumn = 
                                                            columnIndex === highlightedColumnNameIndex;
                                                            
                                                        const isBelowTen = 
                                                            isHighlightedColumn &&
                                                            Number.isFinite(numericValue) &&
                                                            numericValue < 10;

                                                        return isHighlightedColumn
                                                            ? {
                                                                backgroundColor: "#f1f8ff",
                                                                color: isBelowTen ? "#d32f2f" : "inherit",
                                                                borderLeft: "2px solid #1976d22",
                                                                borderRight: "2px solid #1976d2"
                                                            }
                                                            :undefined;
                                                    }}
                                                >
                                                    {row[columnIndex] ?? ""}
                                                </TableCell>
                                            )
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {highlightedColumnNameIndex !== -1 && (
                        <Box sx={{ mt: 4, maxWidth: 500 }}>
                            <Typography variant="h6" gutterBottom>
                                Due in less than 10 days:
                            </Typography>

                            {lowValueRows.length === 0 ? (
                                <Typography color="text.secondary">
                                    No values below 10 were found in the {highlightedColumnName} column.
                                </Typography>
                            ) : (
                                <TableContainer component={Paper}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Excel Row</TableCell>
                                                <TableCell>{highlightedColumnName}</TableCell>
                                                <TableCell>Details</TableCell>
                                                <TableCell>Done</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {lowValueRows.map((item) => (
                                                <TableRow key={item.sourceRowNumber}>
                                                    <TableCell>
                                                        {item.sourceRowNumber}
                                                    </TableCell>

                                                    <TableCell sx={{ color: "#d32f2f"}}>
                                                        {item.value}
                                                    </TableCell>

                                                    <TableCell>
                                                        <Button
                                                            size="small"
                                                            onClick={() => setSelectedRow(item)}
                                                        >
                                                            View Row
                                                        </Button>
                                                    </TableCell>

                                                    <TableCell>
                                                        <Checkbox
                                                            size="small"
                                                            checked={Boolean(checkedRows[item.sourceRowNumber])}
                                                            onChange={() =>
                                                                setCheckRows((currentRows) => ({
                                                                    ...currentRows,
                                                                    [item.sourceRowNumber]:
                                                                        !currentRows[item.sourceRowNumber]
                                                                }))
                                                            }
                                                            slotProps={{
                                                                input: {
                                                                    "aria-label": `Mark Excel row ${item.sourceRowNumber} as done`
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    )}
                </>
            )}

            <Dialog
                open={selectedRow !== null}
                onClose={() => setSelectedRow(null)}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    Excel Row {selectedRow?.sourceNumber}
                </DialogTitle>

                <DialogContent>
                    {selectedRow && (
                        <TableContainer
                            component={Paper}
                            sx={{ overflowX: "auto" }}
                        >
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        {Array.from(
                                            { length: columnCount },
                                            (_, columnIndex) => (
                                                <TableCell
                                                    key={columnIndex}
                                                    sx={{ fontWeight: "bold" }}
                                                >
                                                    {headers[columnIndex] || `Column ${columnIndex + 1}`}
                                                </TableCell>
                                            )
                                        )}
                                    </TableRow>
                                </TableHead>
                                
                                <TableBody>
                                    <TableRow>
                                        {Array.from(
                                            { length: columnCount },
                                            (_, columnIndex) => (
                                                <TableCell key={columnIndex}>
                                                    {selectedRow.row[columnIndex] ?? ""}
                                                </TableCell>
                                            )
                                        )}
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setSelectedRow(null)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Excel;