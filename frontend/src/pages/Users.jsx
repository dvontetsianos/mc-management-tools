import { useEffect, useState } from "react";
import { getUsers, createUser, deleteUser, updateUserPermissions, updateUserDepartment, updateUserHotels } from "../services/userService";
import { getDepartments } from "../services/departmentService";
import { getHotels } from "../services/hotelService";
import { getUser } from "../services/auth";
import QuoteOfTheDay from "../components/QuoteOfTheDay";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ChangePasswordDialog from "../components/ChangePasswordDialog";
import SecurityIcon from "@mui/icons-material/Security";
import LockIcon from "@mui/icons-material/Lock";
import BusinessIcon from "@mui/icons-material/Business";
import DeleteIcon from "@mui/icons-material/Delete";
import HotelIcon from "@mui/icons-material/Hotel";

function Users() {

    const user = getUser();

    const [users, setUsers] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = users.filter((user) =>
        user.username
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

    const [open, setOpen] = useState(false);

    const [creatingUser, setCreatingUser] = useState(false);

    const [newUser, setNewUser] = useState({
        username: "",
        password: "",
        role: "user",
        department_id: "",
        permissions: [],
        hotel_ids: []
    });

    const [deleteOpen, setDeleteOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);

    const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);

    const [userToEditPermissions, setUserToEditPermissions] = useState(null);

    const [editPermissions, setEditPermissions] = useState([]);

    const [departments, setDepartments] = useState([]);

    const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);

    const [userToEditDepartment, setUserToEditDepartment] = useState(null);

    const [editDepartmentId, setEditDepartmentId] = useState("");

    const [hotels, setHotels] = useState([]);

    const [hotelsDialogOpen, setHotelsDialogOpen] = useState(false);

    const [userToEditHotels, setUserToEditHotels] = useState(null);

    const [editHotelIds, setEditHotelIds] = useState([]);

    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

    const [userToChangePassword, setUserToChangePassword] = useState(null);

    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const handleChangePassword = (user) => {

        setUserToChangePassword(user);

        setPasswordDialogOpen(true);
    };

    useEffect(() => {
        loadUsers();
        loadDepartments();
        loadHotels();
    }, []);

    async function loadUsers() {
        try {

            const data = await getUsers();

            setUsers(data);

        } catch (error) {

            console.error(error);

        }
    
    }

    async function loadDepartments() {

        try {

            const data = await getDepartments();

            setDepartments(data);

        } catch (error) {

            console.error(error);

        }

    }

    async function loadHotels() {

        try {

            const data = await getHotels();

            setHotels(data);

        } catch (error) {

            console.error(error);

        }

    }

    //admins and all_hotels_access users cover every hotel, everyone else needs at least one
    function needsHotel(role, permissions) {
        return role !== "admin" && !permissions.includes("all_hotels_access");
    }

    function hotelNames(hotelIds) {
        return hotels
            .filter((hotel) => hotelIds.includes(hotel.id))
            .map((hotel) => hotel.name)
            .join(", ");
    }

    function showNotification(message, severity = "success") {
        setNotification({
            open: true,
            message,
            severity
        });
    }

    const availablePermissions = [
        "fnb_items_access",
        "housekeeping_items_access",
        "kitchen_items_access",
        "categories_access",
        "locations_access",
        "suppliers_access",
        "view_excel_access",
        "lost_found_access",
        "reports_access",
        "purchases_access",
        "all_departments_access",
        "all_hotels_access",
        "movements_access",
        "requests_access"
    ];

    function handleInputChange(event) {

        const { name, value } = event.target;

        setNewUser({
            ...newUser,
            [name]: value
        });
    }

    function handlePermissionChange(permission) {

        let updatedPermissions = [...newUser.permissions];


        if (updatedPermissions.includes(permission)) {

            updatedPermissions = updatedPermissions.filter(
                (p) => p !== permission
            );

        } else {
            updatedPermissions.push(permission);
        }

        setNewUser({
            ...newUser,
            permissions: updatedPermissions
        });
    }

    function openPermissionsDialog(user) {

        setUserToEditPermissions(user);

        setEditPermissions([
            ...user.permissions
        ]);

        setPermissionsDialogOpen(true);
    }

    function handleEditPermissionChange(permission) {

        let updatedPermissions = [...editPermissions];

        if (updatedPermissions.includes(permission)) {

            updatedPermissions = updatedPermissions.filter(
                (p) => p !== permission
            );
        } else {
            updatedPermissions.push(permission);
        }

        setEditPermissions(updatedPermissions);
    }

    async function handleUpdatePermissions() {

        try {

            await updateUserPermissions(
                userToEditPermissions.id,
                editPermissions
            );

            setPermissionsDialogOpen(false);

            setUserToEditPermissions(null);

            setEditPermissions([]);

            loadUsers();

            showNotification(
                "Permissions updated successfully",
                "success"
            );

        } catch (error) {
            showNotification(
                "Failed to update permissions",
                "error"
            )

            console.error(error);
        }
    }

    function openDepartmentDialog(user) {

        setUserToEditDepartment(user);

        setEditDepartmentId(user.department_id ?? "");

        setDepartmentDialogOpen(true);
    }

    async function handleUpdateDepartment() {

        try {

            await updateUserDepartment(
                userToEditDepartment.id,
                editDepartmentId === "" ? null : editDepartmentId
            );

            setDepartmentDialogOpen(false);

            setUserToEditDepartment(null);

            setEditDepartmentId("");

            loadUsers();

            showNotification(
                "Department updated successfully",
                "success"
            );

        } catch (error) {
            showNotification(
                "Failed to update department",
                "error"
            )

            console.error(error);
        }
    }

    function openHotelsDialog(user) {

        setUserToEditHotels(user);

        setEditHotelIds([
            ...(user.hotel_ids || [])
        ]);

        setHotelsDialogOpen(true);
    }

    async function handleUpdateHotels() {

        if (
            needsHotel(userToEditHotels.role, userToEditHotels.permissions) &&
            editHotelIds.length === 0
        ) {
            showNotification(
                "This user needs at least one hotel",
                "error"
            );
            return;
        }

        try {

            await updateUserHotels(
                userToEditHotels.id,
                editHotelIds
            );

            setHotelsDialogOpen(false);

            setUserToEditHotels(null);

            setEditHotelIds([]);

            loadUsers();

            showNotification(
                "Hotels updated - the user sees the change the next time they log in",
                "success"
            );

        } catch (error) {
            showNotification(
                error.message || "Failed to update hotels",
                "error"
            );

            console.error(error);
        }
    }

    async function handleCreateUser() {

        if (
            needsHotel(newUser.role, newUser.permissions) &&
            newUser.hotel_ids.length === 0
        ) {
            showNotification(
                "Pick at least one hotel for this user",
                "error"
            );
            return;
        }

        setCreatingUser(true);

        try {

            await createUser({
                ...newUser,
                department_id: newUser.department_id === "" ? null : newUser.department_id
            });

            setOpen(false);

            const isUnderProvisionedQuickCount =
                newUser.role === "quickcount" &&
                !newUser.permissions.includes("fnb_items_access") &&
                !newUser.permissions.includes("housekeeping_items_access");

            setNewUser({
                username: "",
                password: "",
                role: "user",
                department_id: "",
                permissions: [],
                hotel_ids: []
            });

            loadUsers();

            if (isUnderProvisionedQuickCount) {
                showNotification(
                    "User created - but Quickcount staff need at least 1 Items access to use Quickcount",
                    "warning"
                );
            } else {
                showNotification(
                    "User created successfully",
                    "success"
                );
            }

        } catch (error) {
            showNotification(
                error.message || "Failed to create user",
                "error"
            );

            console.error(error);
        } finally {

            setCreatingUser(false);
        }
    }

    function openDeleteDialog(user) {

        setSelectedUser(user);

        setDeleteOpen(true);
    }

    async function handleDeleteUser() {

        try {

            await deleteUser(selectedUser.id);

            setDeleteOpen(false);

            setSelectedUser(null);

            loadUsers();

            showNotification(
                "User deleted successfully",
                "success"
            );

        } catch (error) {
            showNotification(
                error.message || "Failed to delete user",
                "error"
            );

            console.error(error);
            
        }
    }



return (

    <div>

        <div
            style={{
                position: "relative",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "20px"
            }}
        >
            <h1
                style={{
                    margin: 10,
                    textAlign: "center"
                }}
            >
                User Management
            </h1>




        </div>

        {/*
        {user?.role === "admin" && (
            <QuoteOfTheDay />
        )}
        */}


        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2
            }}
        >
                <TextField
                    label="Search users"
                    size="small"
                    value={searchTerm}
                    onChange={(e) =>
                        setSearchTerm(e.target.value)
                    }
                    sx={{
                        width: "200px"
                    }}
                />

                    <Button
                        variant="contained"
                        onClick={() => setOpen(true)}
                    >
                        + Create User
                    </Button>
            </Box>

        <TableContainer component={Paper}>

            <Table>

                <TableHead>

                    <TableRow>

                        <TableCell>
                            Username
                        </TableCell>

                        <TableCell>
                            Role
                        </TableCell>

                        <TableCell>
                            Department
                        </TableCell>

                        <TableCell>
                            Hotels
                        </TableCell>

                        <TableCell>
                            Permissions
                        </TableCell>

                        <TableCell>
                            Actions
                        </TableCell>

                    </TableRow>

                </TableHead>


                <TableBody>

                    {filteredUsers.map((user) => (

                        <TableRow key={user.id}>

                            <TableCell>
                                {user.username}
                            </TableCell>


                            <TableCell>
                                <Chip
                                    label={user.role}
                                />
                            </TableCell>

                            <TableCell>
                                {user.department || "-"}
                            </TableCell>

                            <TableCell>

                                {!needsHotel(user.role, user.permissions) ? (

                                    <Chip
                                        label="All hotels"
                                        color="primary"
                                        sx={{ mr: 1 }}
                                    />

                                ) : (user.hotels || []).length === 0 ? (

                                    "-"

                                ) : (

                                    user.hotels.map((hotelName) => (

                                        <Chip
                                            key={hotelName}
                                            label={hotelName}
                                            sx={{ mr: 1 }}
                                        />

                                    ))

                                )}

                            </TableCell>


                            <TableCell>

                                {user.permissions.length === 0 ? (

                                    "-"

                                ) : (

                                    user.permissions.map((permission) => (

                                        <Chip
                                            key={permission}
                                            label={permission}
                                            sx={{ mr: 1 }}
                                        />

                                    ))

                                )}

                            </TableCell>

                            <TableCell>

                                <Button
                                    variant="contained"
                                    startIcon={<SecurityIcon />}
                                    onClick={() => openPermissionsDialog(user)}
                                    sx={{ mr: 1, color: "green", backgroundColor: "black" }}
                                >
                                    Edit Permissions
                                </Button>

                                <Button
                                    variant="contained"
                                    startIcon={<BusinessIcon />}
                                    onClick={() => openDepartmentDialog(user)}
                                    sx={{ mr: 1, color: "yellow", backgroundColor: "black" }}
                                >
                                    Edit Department
                                </Button>

                                <Button
                                    variant="contained"
                                    startIcon={<HotelIcon />}
                                    onClick={() => openHotelsDialog(user)}
                                    sx={{ mr: 1, color: "orange", backgroundColor: "black" }}
                                >
                                    Edit Hotels
                                </Button>

                                <Button
                                    variant="contained"
                                    startIcon={<LockIcon />}
                                    onClick={() => handleChangePassword(user)}
                                    sx={{ mr: 1, color: "blue", backgroundColor: "black" }}
                                >
                                    Change Password
                                </Button>

                                <Button
                                    variant="contained"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => openDeleteDialog(user)}
                                    sx={{ mr: 1, color: "red", backgroundColor: "black" }}
                                >
                                    Delete
                                </Button>

                            </TableCell>


                        </TableRow>

                    ))}


                </TableBody>


            </Table>

        </TableContainer>

        <Dialog
            open={open}
            onClose={() => setOpen(false)}
        >
            <DialogTitle>
                Create User
            </DialogTitle>

            <DialogContent>
                <TextField
                    margin="dense"
                    label="Username"
                    name="username"
                    fullWidth
                    value={newUser.username}
                    onChange={handleInputChange}
                />

                <TextField
                    margin="dense"
                    label="Password"
                    name="password"
                    type="password"
                    fullWidth
                    value={newUser.password}
                    onChange={handleInputChange}
                />

                <FormControl
                    fullWidth
                    margin="dense"
                >

                    <InputLabel>
                        Role
                    </InputLabel>

                    <Select
                        name="role"
                        value={newUser.role}
                        label="Role"
                        onChange={handleInputChange}
                    >

                        <MenuItem value="user">
                            User
                        </MenuItem>

                        <MenuItem value="admin">
                            Admin
                        </MenuItem>

                        <MenuItem value="quickcount">
                            Quick Count Staff
                        </MenuItem>

                    </Select>

                </FormControl>

                <FormControl
                    fullWidth
                    margin="dense"
                >
                    <InputLabel>
                    Department
                    </InputLabel>

                    <Select
                        name="department_id"
                        value={newUser.department_id}
                        label="Department"
                        onChange={handleInputChange}
                    >

                        <MenuItem value="">
                            None
                        </MenuItem>

                        {departments.map((department) => (
                            <MenuItem
                                key={department.id}
                                value={department.id}
                            >
                                {department.name}
                            </MenuItem>
                        ))}

                    </Select>

                </FormControl>

                <FormControl
                    fullWidth
                    margin="dense"
                >
                    <InputLabel>
                        Hotels
                    </InputLabel>

                    <Select
                        multiple
                        value={newUser.hotel_ids}
                        label="Hotels"
                        onChange={(e) =>
                            setNewUser({
                                ...newUser,
                                hotel_ids: e.target.value
                            })
                        }
                        renderValue={(selected) => hotelNames(selected)}
                    >

                        {hotels.map((hotel) => (
                            <MenuItem
                                key={hotel.id}
                                value={hotel.id}
                            >
                                <Checkbox checked={newUser.hotel_ids.includes(hotel.id)} />
                                {hotel.name}
                            </MenuItem>
                        ))}

                    </Select>

                </FormControl>


                <h4>
                    Permissions
                </h4>

                {availablePermissions.map((permission) => (
                    <FormControlLabel
                        key={permission}
                        control={
                            <Checkbox
                                checked={
                                    newUser.permissions.includes(permission)
                                }
                                onChange={() =>
                                    handlePermissionChange(permission)
                                }
                            />
                        }

                        label={permission}

                    />

                ))}

            </DialogContent>

            <DialogActions>
                <Button
                    onClick={() => setOpen(false)}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleCreateUser}
                    disabled={creatingUser}
                >
                    {creatingUser ? "Creating..." : "Create"}
                </Button>

            </DialogActions>

        </Dialog>

        <Dialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
        >

            <DialogTitle>
                Delete User
            </DialogTitle>

            <DialogContent>
                Are you sure you want to delete user:

                <b>
                    {" "}
                    {selectedUser?.username}
                </b>

                ?

            </DialogContent>

            <DialogActions>
                <Button
                    onClick={() => setDeleteOpen(false)}
                >
                    Cancel
                </Button>

                <Button
                    color="error"
                    variant="contained"
                    onClick={handleDeleteUser}
                >
                    Delete
                </Button>

            </DialogActions>

        
        </Dialog>

        <Dialog
            open={permissionsDialogOpen}
            onClose={() => setPermissionsDialogOpen(false)}
        >

            <DialogTitle>
                Edit Permissions
            </DialogTitle>

            <DialogContent>

                <h4>
                    {userToEditPermissions?.username}
                </h4>

                {availablePermissions.map((permission) => (

                    <FormControlLabel
                        key={permission}
                        control={
                            <Checkbox
                                checked={
                                    editPermissions.includes(permission)
                                }
                                onChange={() =>
                                    handleEditPermissionChange(permission)
                                }
                            />
                        }
                        label={permission}
                    />
                ))}
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={() => setPermissionsDialogOpen(false)}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleUpdatePermissions}
                >
                    Save
                </Button>

            </DialogActions>

        </Dialog>

        <Dialog
            open={departmentDialogOpen}
            onClose={() => setDepartmentDialogOpen(false)}
            fullWidth
            maxWidth="sm"
        >

            <DialogTitle>
                Edit Department
            </DialogTitle>

            <DialogContent>

                <h4>
                    {userToEditDepartment?.username}
                </h4>

                <FormControl
                    fullWidth
                    margin="dense"
                >

                    <InputLabel>
                        Department 
                    </InputLabel>

                    <Select
                        value={editDepartmentId}
                        label="Department"
                        onChange={(e) => setEditDepartmentId(e.target.value)}
                    >

                        <MenuItem value="">
                            None
                        </MenuItem>

                        {departments.map((department) => (
                            <MenuItem
                                key={department.id}
                                value={department.id}
                            >
                                {department.name}
                            </MenuItem>
                        ))}

                    </Select>

                </FormControl>

            </DialogContent>

            <DialogActions>
                <Button
                    onClick={() => setDepartmentDialogOpen(false)}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleUpdateDepartment}
                >
                    Save
                </Button>

            </DialogActions>

        </Dialog>

        <Dialog
            open={hotelsDialogOpen}
            onClose={() => setHotelsDialogOpen(false)}
            fullWidth
            maxWidth="sm"
        >

            <DialogTitle>
                Edit Hotels
            </DialogTitle>

            <DialogContent>

                <h4>
                    {userToEditHotels?.username}
                </h4>

                {userToEditHotels && !needsHotel(userToEditHotels.role, userToEditHotels.permissions) && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        This user already covers every hotel (admin or all_hotels_access). The hotels ticked here only matter if that changes.
                    </Alert>
                )}

                {hotels.map((hotel) => (

                    <FormControlLabel
                        key={hotel.id}
                        control={
                            <Checkbox
                                checked={editHotelIds.includes(hotel.id)}
                                onChange={() =>
                                    setEditHotelIds((prev) =>
                                        prev.includes(hotel.id)
                                            ? prev.filter((id) => id !== hotel.id)
                                            : [...prev, hotel.id]
                                    )
                                }
                            />
                        }
                        label={hotel.name}
                    />
                ))}

            </DialogContent>

            <DialogActions>
                <Button
                    onClick={() => setHotelsDialogOpen(false)}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleUpdateHotels}
                >
                    Save
                </Button>

            </DialogActions>

        </Dialog>

        <ChangePasswordDialog
            open={passwordDialogOpen}
            onClose={() => setPasswordDialogOpen(false)}
            user={userToChangePassword}
            onSuccess={() =>
                showNotification(
                    "Password changed successfully",
                    "success"
                )
            }
        />

        <Snackbar
            open={notification.open}
            autoHideDuration={10000}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "center"
            }}
            onClose={() =>
                setNotification({
                    ...notification,
                    open: false
                })
            }
        >
            <Alert
                severity={notification.severity}
                onClose={() =>
                    setNotification({
                        ...notification,
                        open: false
                    })
                }
            >
                {notification.message}

            </Alert>

        </Snackbar>

    </div>

);

}

export default Users;
