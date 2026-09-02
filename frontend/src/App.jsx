import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import PermissionRoute from "./components/PermissionRoute";
import Users from "./pages/Users";
import SystemMonitor from "./pages/SystemMonitor";
import Categories from "./pages/Categories";
import Locations from "./pages/Locations";
import Suppliers from "./pages/Suppliers";
import Excel from "./pages/Excel";
import Departments from "./pages/Departments";
import Requests from "./pages/Requests";
import History from "./pages/History";
import Reports from "./pages/Reports";
import InventoryValue from "./pages/reports/InventoryValue";
import LostFound from "./pages/LostFound";
import LocationPicker from "./pages/quickcount/LocationPicker";
import ItemList from "./pages/quickcount/ItemList";
import ItemQuantity from "./pages/quickcount/ItemQuantity";




function App() {

    return (
        <Routes>

            <Route path="/" element={<Login />} />

            <Route
                path="/quick-count"
                element={
                    <ProtectedRoute>
                        <PermissionRoute permission="assets_access">
                            <LocationPicker />
                        </PermissionRoute>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/quick-count/:locationId"
                element={
                    <ProtectedRoute>
                        <PermissionRoute permission="assets_access">
                            <ItemList />
                        </PermissionRoute>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/quick-count/:locationId/item/:itemLocationId"
                element={
                    <ProtectedRoute>
                        <PermissionRoute permission="assets_access">
                            <ItemQuantity />
                        </PermissionRoute>
                    </ProtectedRoute>
                }
            />

            <Route
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >

                <Route 
                    path="/dashboard" 
                    element={<Dashboard />} 
                />

                <Route
                    path="/requests"
                    element={<Requests />}
                />

                <Route
                    path="/system-monitor"
                    element={
                        <PermissionRoute adminOnly>
                            <SystemMonitor />
                        </PermissionRoute>
                    }
                />

                <Route
                    path="/users"
                    element={
                        <PermissionRoute adminOnly>
                            <Users />
                        </PermissionRoute>
                    }
                />

                <Route 
                    path="/assets" 
                    element={
                        <PermissionRoute permission="assets_access">
                            <Assets />
                        </PermissionRoute>
                    } 
                />

                <Route
                    path="/excel"
                    element={
                        <PermissionRoute permission="view_excel_access">
                            <Excel />
                        </PermissionRoute>
                    }
                />

                <Route
                    path="/categories"
                    element={
                        <PermissionRoute permission="categories_access">
                            <Categories />
                        </PermissionRoute>
                    }
                />

                <Route
                    path="/locations"
                    element={
                        <PermissionRoute permission="locations_access">
                            <Locations />
                        </PermissionRoute>
                    }
                />

                <Route
                    path="/suppliers"
                    element={
                        <PermissionRoute permission="suppliers_access">
                            <Suppliers />
                        </PermissionRoute>
                    }
                />

                <Route
                    path="/departments"
                    element={
                        <PermissionRoute adminOnly>
                            <Departments />
                        </PermissionRoute>
                    }
                />

                <Route
                    path="/history"
                    element={
                        <PermissionRoute adminOnly>
                            <History />
                        </PermissionRoute>
                    }
                />

                <Route
                    path="/reports"
                    element={
                        <PermissionRoute permission="reports_access">
                            <Reports />
                        </PermissionRoute>
                    }
                />

                <Route
                    path="/reports/inventory-value"
                    element={
                        <PermissionRoute permission="reports_access">
                            <InventoryValue />
                        </PermissionRoute>
                    }
                />

                <Route
                    path="/lost-found"
                    element={
                        <PermissionRoute permission="lost_found_access">
                            <LostFound />
                        </PermissionRoute>
                    }
                />

            </Route>


        </Routes>
    );
}

export default App;