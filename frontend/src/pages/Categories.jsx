import { useState, useEffect } from "react";
import { getCategories, createCategory, deleteCategory } from "../services/categoryService";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
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
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
 } from "@mui/material";



function Categories() {

    const [categories, setCategories] = useState([]);

    const [newCategory, setNewCategory] = useState("");

    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [snackbarMessage, setSnackbarMessage] = useState("");

    const [snackbarSeverity, setSnackbarSeverity] = useState("error");

    const fetchCategories = async () => {

        const data = await getCategories();

        setCategories(data);

    };

    const handleCreate = async () => {

        if (!newCategory.trim()) {
            return;
        }

        try {

            await createCategory(newCategory);

            setNewCategory("");

            await fetchCategories();

            setSnackbarMessage("Category created successfully");

            setSnackbarSeverity("success");

            setSnackbarOpen(true);
            
        } catch (error) {

            setSnackbarMessage(error.message);

            setSnackbarSeverity("error");

            setSnackbarOpen(true);

        }

    };

    const confirmDelete = async () => {

        if (!categoryToDelete) {
            return;
        }

        try {

            await deleteCategory(categoryToDelete.id);

            await fetchCategories();

            setSnackbarMessage("Category deleted successfully");

            setSnackbarSeverity("success");

            setSnackbarOpen(true);

            setDeleteDialogOpen(false);

            setCategoryToDelete(null);

        } catch (error) {

            setSnackbarMessage(error.message);

            setSnackbarSeverity("error");

            setSnackbarOpen(true);

        }

    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <>
            <Box>
                <Typography variant="h4">
                    Category Management
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        mt: 3
                    }}
                >

                    <TextField
                        label="New Category"
                        value={newCategory}
                        onChange={(e) =>
                            setNewCategory(e.target.value)
                        }
                    />

                    <Button
                        variant="contained"
                        onClick={handleCreate}
                    >
                        Add Category
                    </Button>
                </Box>

                <TableContainer
                    component={Paper}
                    sx={{ mt: 3 }}
                >
                    <Table>
                        <TableHead
                            sx={{
                                "& .MuiTableCell-root": {
                                    fontWeight: "bold",
                                    backgroundColor: "#aee9f3"
                                }
                            }}
                        >
                            <TableRow>
                                <TableCell>
                                    ID
                                </TableCell>

                                <TableCell>
                                    Category Name
                                </TableCell>

                                <TableCell>
                                    Actions
                                </TableCell>

                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {categories.map((category) => (

                                <TableRow key={category.id}>
                                    <TableCell>
                                        {category.id}
                                    </TableCell>

                                    <TableCell>
                                        {category.name}
                                    </TableCell>

                                    <TableCell>
                                        <IconButton
                                        color="error"
                                            onClick={() => {
                                                setCategoryToDelete(category);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>


            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>
                    Delete Category
                </DialogTitle>

                <DialogContent>
                    Are you sure you want to delete Category

                    <b>
                        {" "}
                        {categoryToDelete?.name}
                    </b>

                    ?


                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        onClick={confirmDelete}
                    >
                        Delete
                    </Button>

                </DialogActions>
            
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={10000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center"
                }}
            >

                <Alert
                    severity={snackbarSeverity}
                    onClose={() => setSnackbarOpen(false)}
                >
                    {snackbarMessage}
                </Alert>

            </Snackbar>
        </>
    );

}

export default Categories;