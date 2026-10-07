import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionRoute from "./components/PermissionRoute";

//pages are loaded only when they are opened, so e.g. Quick Count on a PDA
//doesn't download the office pages (and the big chart library of System Monitor)
const Layout = lazy(() => import("./components/Layout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FnbItems = lazy(() => import("./pages/FnbItems"));
const HousekeepingItems = lazy(() => import("./pages/HousekeepingItems"));
const KitchenItems = lazy(() => import("./pages/KitchenItems"));
const Users = lazy(() => import("./pages/Users"));
const SystemMonitor = lazy(() => import("./pages/SystemMonitor"));
const Categories = lazy(() => import("./pages/Categories"));
const Locations = lazy(() => import("./pages/Locations"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const Excel = lazy(() => import("./pages/Excel"));
const Departments = lazy(() => import("./pages/Departments"));
const Requests = lazy(() => import("./pages/Requests"));
const History = lazy(() => import("./pages/History"));
const Reports = lazy(() => import("./pages/Reports"));
const SpendReport = lazy(() => import("./pages/reports/SpendReport"));
const LostFound = lazy(() => import("./pages/LostFound"));
const LocationPicker = lazy(() => import("./pages/quickcount/LocationPicker"));
const ItemList = lazy(() => import("./pages/quickcount/ItemList"));
const ItemQuantity = lazy(() => import("./pages/quickcount/ItemQuantity"));
const Purchases = lazy(() => import("./pages/Purchases"));
const ItemPurchaseHistory = lazy(() => import("./pages/items/ItemPurchaseHistory"));
const ItemMovementHistory = lazy(() => import("./pages/items/ItemMovementHistory"));
const Movements = lazy(() => import("./pages/Movements"));


//shown for a moment while a page is being downloaded
const pageLoading = (
    <div style={{ padding: 40, textAlign: "center" }}>
        Loading...
    </div>
);




function App() {

    return (
        <Suspense fallback={pageLoading}>
        <Routes>

            <Route path="/" element={<Login />} />

            <Route
                path="/quick-count"
                element={
                    <ProtectedRoute>
                        <PermissionRoute permissions={["fnb_items_access", "housekeeping_items_access"]}>
                            <LocationPicker />
                        </PermissionRoute>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/quick-count/:locationId"
                element={
                    <ProtectedRoute>
                        <PermissionRoute permissions={["fnb_items_access", "housekeeping_items_access"]}>
                            <ItemList />
                        </PermissionRoute>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/quick-count/:locationId/item/:itemLocationId"
                element={
                    <ProtectedRoute>
                        <PermissionRoute permissions={["fnb_items_access", "housekeeping_items_access"]}>
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
                    element={
                        <PermissionRoute permission="requests_access">
                            <Requests />
                        </PermissionRoute>
                    }
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
                    path="/fnb-items" 
                    element={
                        <PermissionRoute permission="fnb_items_access">
                            <FnbItems />
                        </PermissionRoute>
                    } 
                />

                <Route
                    path="/housekeeping-items"
                    element={
                        <PermissionRoute permission="housekeeping_items_access">
                            <HousekeepingItems />
                        </PermissionRoute>
                    }
                />

                <Route
                    path="/kitchen-items"
                    element={
                        <PermissionRoute permission="kitchen_items_access">
                            <KitchenItems />
                        </PermissionRoute>
                    }
                />

                <Route
                    path="/purchases"
                    element={
                        <PermissionRoute permission="purchases_access">
                            <Purchases />
                        </PermissionRoute>
                    }
                />

                <Route
                    path="/movements"
                    element={
                        <PermissionRoute permission="movements_access">
                            <Movements />
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
                    path="/reports/spend"
                    element={
                        <PermissionRoute permission="reports_access">
                            <SpendReport />
                        </PermissionRoute>
                    }
                />

                <Route
                    path="/items/:itemId/purchases"
                    element={
                        <PermissionRoute permission="purchases_access">
                            <ItemPurchaseHistory />
                        </PermissionRoute>
                    }
                />

                <Route
                    path="/items/:itemId/movements"
                    element={
                        <PermissionRoute permission="movements_access">
                            <ItemMovementHistory />
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
        </Suspense>
    );
}

export default App;