import { useState, useEffect } from "react";
import { getCategories, createCategory, deleteCategory } from "../services/categoryService";
import { getDepartments } from "../services/departmentService";
import { getUser } from "../services/auth";
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
    DialogActions,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem
 } from "@mui/material";



function Categories() {

    const user = getUser();
    const isAdmin = user?.role === "admin";

    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);

    const [newCategory, setNewCategory] = useState("");
    const [newCategoryDepartmentId, setNewCategoryDepartmentId] = useState("");

    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [snackbarMessage, setSnackbarMessage] = useState("");

    const [snackbarSeverity, setSnackbarSeverity] = useState("error");

    const fetchCategories = async () => {

        const data = await getCategories();

        setCategories(data);

    };

    const fetchDepartments = async () => {

        const data = await getDepartments();

        setDepartments(data);
    };

    useEffect(() => {
        fetchCategories();
        fetchDepartments();
    }, []);

    //only departments that actually have at least one category get a tab
    const tabDepartments = departments.filter((dept) =>
        categories.some((cat) => cat.department_id === dept.id)
    );

    const tabDepartmentIds = tabDepartments.map((dept) => dept.id).join(",");


    //keep the selected tab valid as tabs appear/disappear, without jumping to wrong one
    useEffect(() => {

        if (!isAdmin) {
            return;
        }

        const stillExists = tabDepartments.some(
            (dept) => dept.id === selectedDepartmentId
        );

        if (!stillExists && tabDepartments.length > 0) {
            setSelectedDepartmentId(tabDepartments[0].id);
        }
    }, [isAdmin, tabDepartmentIds]);

    const activeDepartment = isAdmin
        ? tabDepartments.find((dept) => dept.id === selectedDepartmentId)
        : departments.find((dept) => dept.id === user?.department_id);


    //default the "add category" department picker to whickever tab is open
    useEffect(() => {

        if (isAdmin && activeDepartment) {
            setNewCategoryDepartmentId(activeDepartment.id);
        }
    }, [isAdmin, activeDepartment?.id]);

    const visibleCategories = activeDepartment
        ? categories.filter((cat) => cat.department_id === activeDepartment.id)
        : [];

    
    let emptyMessage = "No categories yet for this department.";

    if (isAdmin && tabDepartments.length === 0) {
        emptyMessage = "No categories exist yet. Add one below to get started.";
    } else if (!isAdmin && !activeDepartment) {
        emptyMessage = "Your account has no department assigned - contact an admin.";
    }


    const handleCreate = async () => {

        if (!newCategory.trim()) {
            return;
        }

        const departmentIdToUse = isAdmin
            ? newCategoryDepartmentId
            : user?.department_id;


        if (!departmentIdToUse) {

            setSnackbarMessage(
                isAdmin
                    ? "Please choose a department."
                    : "Your account has no department assigned - contact an admin."
            );

            setSnackbarSeverity("error");

            setSnackbarOpen(true);

            return;
        }

        try {

            await createCategory(newCategory, departmentIdToUse);

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


    return (
        <>
            <Box>
                <Typography variant="h4">
                    Category Management
                </Typography>

                {isAdmin && tabDepartments.length > 0 && (
                    <Tabs
                        value={selectedDepartmentId ?? false}
                        onChange={(event, newValue) => setSelectedDepartmentId(newValue)}
                        sx={{ mt: 3 }}
                    >
                        {tabDepartments.map((dept) => (
                            <Tab
                                key={dept.id}
                                value={dept.id}
                                label={dept.name}
                            />
                        ))}
                    </Tabs>
                )}

                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        mt: 3,
                        alignItems: "center"
                    }}
                >

                    <TextField
                        label="New Category"
                        value={newCategory}
                        onChange={(e) =>
                            setNewCategory(e.target.value)
                        }
                    />

                    {isAdmin && (
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Department</InputLabel>

                            <Select
                                value={newCategoryDepartmentId}
                                label="Department"
                                onChange={(e) =>
                                    setNewCategoryDepartmentId(e.target.value)
                                }
                            >
                                {departments.map((dept) => (
                                    <MenuItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

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
                            {visibleCategories.map((category) => (

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

                            {visibleCategories.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        {emptyMessage}
                                    </TableCell>
                                </TableRow>
                            )}
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