import { useState, useRef } from "react";
import {
    Box,
    Typography,
    Paper,
    Button,
    Alert,
    Tabs,
    Tab,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Chip,
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { downloadImportTemplate, checkImportFile, importItems } from "../services/importService";


//what happens to each row of the file, with its colour
const STATUSES = {
    add: { label: "New", color: "success" },
    skip: { label: "Already exists", color: "default" },
    error: { label: "Problem", color: "error" }
};


function ImportItems() {

    const fileInput = useRef(null);

    const [file, setFile] = useState(null);
    const [report, setReport] = useState(null);
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");
    const [done, setDone] = useState("");
    const [tab, setTab] = useState(0);
    const [show, setShow] = useState("all");


    async function handleTemplate() {

        setBusy("template");
        setError("");

        try {
            await downloadImportTemplate();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy("");
        }
    }


    //a file was picked: check it straight away (nothing is saved yet)
    async function handleFile(event) {

        const picked = event.target.files?.[0];

        //so picking the same file again (after fixing it) still works
        event.target.value = "";

        if (!picked) return;

        setFile(picked);
        setReport(null);
        setDone("");
        setError("");
        setBusy("check");

        try {
            const data = await checkImportFile(picked);
            setReport(data);
            setTab(0);
            setShow(data.error > 0 ? "error" : "all");
        } catch (err) {
            setError(err.message);
            setFile(null);
        } finally {
            setBusy("");
        }
    }


    async function handleImport() {

        setBusy("import");
        setError("");

        try {
            const data = await importItems(file);
            setDone(`${data.added} item${data.added === 1 ? "" : "s"} added.`);
            setReport(null);
            setFile(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy("");
        }
    }


    const sheets = report?.sheets || [];
    const sheet = sheets[tab];
    const rows = (sheet?.rows || []).filter((row) => show === "all" || row.status === show);


    return (
        <Box>

            <Box sx={{ mb: 2 }}>
                <Typography variant="h4">Import Items</Typography>
                <Typography color="text.secondary">
                    Add many items at once from an Excel file: one sheet per department, one row per item.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
            {done && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setDone("")}>{done}</Alert>}


            {/* the two steps: get the template, send it back filled in */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 3 }}>

                <Paper sx={{ p: 2.5 }}>
                    <Typography sx={{ fontWeight: 600, mb: 0.5 }}>1. Download the template</Typography>
                    <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", mb: 2 }}>
                        Sheets for F&B, Housekeeping and Kitchen, with the columns and drop-down lists of categories and
                        suppliers. The first sheet explains how to fill it in.
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={busy === "template" ? <CircularProgress size={18} /> : <FileDownloadIcon />}
                        disabled={busy !== ""}
                        onClick={handleTemplate}
                    >
                        Download template
                    </Button>
                </Paper>

                <Paper sx={{ p: 2.5 }}>
                    <Typography sx={{ fontWeight: 600, mb: 0.5 }}>2. Upload the filled file</Typography>
                    <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", mb: 2 }}>
                        You'll first see what will happen to every row. Nothing is saved until you press Import.
                    </Typography>
                    <input ref={fileInput} type="file" accept=".xlsx" hidden onChange={handleFile} />
                    <Button
                        variant="contained"
                        startIcon={busy === "check" ? <CircularProgress size={18} color="inherit" /> : <UploadFileIcon />}
                        disabled={busy !== ""}
                        onClick={() => fileInput.current?.click()}
                    >
                        Choose file
                    </Button>
                    {file && (
                        <Typography component="span" sx={{ ml: 2, fontSize: "0.9rem", color: "text.secondary" }}>
                            {file.name}
                        </Typography>
                    )}
                </Paper>
            </Box>


            {/* the check of the file */}
            {report && (
                <Paper sx={{ p: 2.5 }}>

                    {report.problems.map((problem) => (
                        <Alert key={problem} severity="error" sx={{ mb: 2 }}>{problem}</Alert>
                    ))}

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap", mb: 2 }}>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <Chip color="success" label={`${report.add} new`} />
                            <Chip label={`${report.skip} already exist`} />
                            <Chip color={report.error > 0 ? "error" : "default"} variant={report.error > 0 ? "filled" : "outlined"} label={`${report.error} with problems`} />
                        </Box>

                        <Button
                            variant="contained"
                            color="success"
                            disabled={report.add === 0 || busy !== ""}
                            startIcon={busy === "import" ? <CircularProgress size={18} color="inherit" /> : null}
                            onClick={handleImport}
                        >
                            Import {report.add} item{report.add === 1 ? "" : "s"}
                        </Button>
                    </Box>

                    {report.error > 0 && report.add > 0 && (
                        <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", mb: 2 }}>
                            Rows with a problem are not imported. Fix them in the file and upload it again, or import
                            the new ones now and the rest later (the ones already imported will then show as already existing).
                        </Typography>
                    )}

                    {sheets.length > 0 && (
                        <>
                            <Tabs value={tab} onChange={(event, value) => setTab(value)} sx={{ mb: 2 }} variant="scrollable">
                                {sheets.map((one) => (
                                    <Tab key={one.department} label={`${one.department} (${one.rows.length})`} />
                                ))}
                            </Tabs>

                            {sheet.notes.map((note) => (
                                <Alert key={note} severity="warning" sx={{ mb: 2 }}>{note}</Alert>
                            ))}

                            <ToggleButtonGroup
                                size="small"
                                exclusive
                                value={show}
                                onChange={(event, value) => value && setShow(value)}
                                sx={{ mb: 2, flexWrap: "wrap" }}
                            >
                                <ToggleButton value="all">All ({sheet.rows.length})</ToggleButton>
                                <ToggleButton value="add">New ({sheet.add})</ToggleButton>
                                <ToggleButton value="skip">Already exist ({sheet.skip})</ToggleButton>
                                <ToggleButton value="error">Problems ({sheet.error})</ToggleButton>
                            </ToggleButtonGroup>

                            {rows.length === 0 ? (
                                <Typography sx={{ color: "text.secondary", py: 2 }}>No rows here.</Typography>
                            ) : (
                                <TableContainer sx={{ maxHeight: 520 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ width: 70 }}>Row</TableCell>
                                                <TableCell sx={{ width: 150 }}>Status</TableCell>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Category</TableCell>
                                                <TableCell>Why</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {rows.map((row) => (
                                                <TableRow key={row.row}>
                                                    <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>{row.row}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            size="small"
                                                            color={STATUSES[row.status].color}
                                                            label={STATUSES[row.status].label}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{row.name}</TableCell>
                                                    <TableCell>{row.category}</TableCell>
                                                    <TableCell sx={{ color: row.status === "error" ? "error.main" : "text.secondary" }}>
                                                        {row.reason || "-"}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </>
                    )}
                </Paper>
            )}
        </Box>
    );
}

export default ImportItems;
