import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ItemTable from "../components/assets/ItemTable";
import ItemFormDialog from "../components/assets/ItemFormDialog";
import ItemDeleteConfirmDialog from "../components/assets/ItemDeleteConfirmDialog";
import MoveItemDialog from "../components/assets/MoveItemDialog";
import CountResetDialog from "../components/assets/CountResetDialog";
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  deleteItemWithHistory,
  uploadItemImage,
  deleteItemImage,
  exportItems
} from "../services/itemService";
import { getCategories } from "../services/categoryService";
import { getLocations } from "../services/locationService";
import { getSuppliers } from "../services/supplierService";
import { getDepartments } from "../services/departmentService";
import { getSubcategories } from "../services/subcategoryService";
import { getHotels } from "../services/hotelService";
import { getUser } from "../services/auth";
import {
  Button,
  Box,
  Typography,
  TextField,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ItemsFilterPanel from "../components/assets/ItemsFilterPanel";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useTableZoom } from "../hooks/useTableZoom";
import TableZoomToggle from "../components/TableZoomToggle";


const HOUSEKEEPING_DEPARTMENT_NAME = "Housekeeping";

function HousekeepingItems() {

  const navigate = useNavigate();

  const [tab, setTab] = useState(0);

  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [housekeepingDepartmentId, setHousekeepingDepartmentId] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // ---items tab state -----

  const [itemSearch, setItemSearch] = useState("");
  const [itemFiltersOpen, setItemFiltersOpen] = useState(false);
  const [itemSearchField, setItemSearchField] = useState("all");
  const [itemSortColumn, setItemSortColumn] = useState(null);
  const [itemSortDirection, setItemSortDirection] = useState("asc");
  const [itemPage, setItemPage] = useState(0);
  const [itemRowsPerPage, setItemRowsPerPage] = useState(25);
  const [itemZoom, setItemZoom] = useTableZoom();

  const [itemForm, setItemForm] = useState({
    name: "",
    category_id: "",
    subcategory_id: "",
    supplier_id: "",
    cost_per_unit: "",
    opening_quantity: "0",
    hotel_ids: []
  });

  const [itemEditingId, setItemEditingId] = useState(null);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageName, setCurrentImageName] = useState(null);
  const [removeImage, setRemovedImage] = useState(false);

  const [itemDeleteDialogOpen, setItemDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [movingItemId, setMovingItemId] = useState(null);
  const [countResetOpen, setCountResetOpen] = useState(false);

  const [selectedItemCategories, setSelectedItemCategories] = useState([]);
  const [selectedItemSubcategories, setSelectedItemSubcategories] = useState([]);
  const [selectedItemLocations, setSelectedItemLocations] = useState([]);
  const [selectedItemSuppliers, setSelectedItemSuppliers] = useState([]);
  const [selectedItemHotels, setSelectedItemHotels] = useState([]);
  const [itemQtyAtLocation, setItemQtyAtLocation] = useState(true);


  //-------fetchers-----------


  const fetchItems = async () => {
    if (!housekeepingDepartmentId) {
      return;
    }
    try {
      // the hotel filter goes to the backend, so the numbers only count those hotels
      const selectedHotelIds = hotels
        .filter((hotel) => selectedItemHotels.includes(hotel.name))
        .map((hotel) => hotel.id);
      
      const data = await getItems(housekeepingDepartmentId, selectedHotelIds);
      setItems(data);
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message || "Failed to load items");
      setSnackbarOpen(true);
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message || "Failed to load locations");
      setSnackbarOpen(true);
    }
  };

  const fetchCategories = async () => {
    if (!housekeepingDepartmentId) {
      return;
    }
    try {
      const data = await getCategories(housekeepingDepartmentId);
      setCategories(data);
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message || "Failed to load categories");
      setSnackbarOpen(true);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message || "Failed to load suppliers");
      setSnackbarOpen(true);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const data = await getSubcategories();
      setSubcategories(data);
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message || "Failed to load subcategories");
      setSnackbarOpen(true);
    }
  };

  const fetchHotels = async () => {
    try {
      const data = await getHotels();
      setHotels(data);
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message || "Failed to load hotels");
      setSnackbarOpen(true);
    }
  };

  const resolveHousekeepingDepartment = async () => {
    try {
      const departments = await getDepartments();
      const hkDept = departments.find((d) => d.name === HOUSEKEEPING_DEPARTMENT_NAME);
      setHousekeepingDepartmentId(hkDept ? hkDept.id : null);
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message || "Failed to load departments");
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    resolveHousekeepingDepartment();
    fetchLocations();
    fetchSuppliers();
    fetchSubcategories();
    fetchHotels();
  }, []);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [housekeepingDepartmentId]);

  //reload the items when the hotel filter changes
  useEffect(() => {
    fetchItems();
  }, [selectedItemHotels]);


  //-----item handlers----------


  const handleItemSubmit = async () => {

    if (!itemForm.name || !itemForm.category_id) {
      return false;
    }

    const payload = {
      ...itemForm,
      subcategory_id: itemForm.subcategory_id === "" ? null : itemForm.subcategory_id,
      supplier_id: itemForm.supplier_id === "" ? null : itemForm.supplier_id,
      cost_per_unit: itemForm.cost_per_unit === "" ? null : itemForm.cost_per_unit,
      opening_quantity: itemForm.opening_quantity === "" ? 0 : itemForm.opening_quantity,
      department_id: housekeepingDepartmentId
    };

    try {

      if (itemEditingId !== null) {
        await updateItem(itemEditingId, payload);

        if (selectedImage) {
          await uploadItemImage(itemEditingId, selectedImage);
        } else if (removeImage) {
          await deleteItemImage(itemEditingId);
        }

      } else {

        const newItem = await createItem(payload);

        if (selectedImage) {
          await uploadItemImage(newItem.id, selectedImage);
        }
      }

      fetchItems();

      setItemForm({
        name: "",
        category_id: "",
        subcategory_id: "",
        supplier_id: "",
        cost_per_unit: "",
        opening_quantity: "0",
        hotel_ids: []
      });


      setItemEditingId(null);
      setSelectedImage(null);
      setRemovedImage(false);

      return true;

    } catch (error) {
      console.error("SAVE ERROR:", error);
      throw error;
    }
  };

  const handleItemRemoveImage = () => {

    if (selectedImage) {
      setSelectedImage(null);
      return;
    }

    if (itemEditingId !== null && currentImageName) {
      setRemovedImage(true);
      setCurrentImageName(null);
    }
  };

  const handleItemDelete = (item) => {
    setItemToDelete(item);
    setItemDeleteDialogOpen(true);
  };

    const confirmItemDelete = async () => {

    if (!itemToDelete) return;

    try {
      await deleteItem(itemToDelete.id);

      fetchItems();

      setSnackbarSeverity("success");
      setSnackbarMessage("Item deleted successfully.");
      setSnackbarOpen(true);

    } catch (error) {
      //e.g. "This item has purchase or movement history, so it can't be deleted."
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message || "Failed to delete item");
      setSnackbarOpen(true);
    }

    setItemDeleteDialogOpen(false);
    setItemToDelete(null);
  }

  //admin only: removes the item and all its history, as if it never existed
  const confirmItemDeleteWithHistory = async () => {

    if (!itemToDelete) return;

    try {
      await deleteItemWithHistory(itemToDelete.id);

      fetchItems();

      setSnackbarSeverity("success");
      setSnackbarMessage("Item and all its history deleted.");
      setSnackbarOpen(true);

    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message || "Failed to delete item");
      setSnackbarOpen(true);
    }

    setItemDeleteDialogOpen(false);
    setItemToDelete(null);
  }


  const handleMoveClick = (item) => {
    setMovingItemId(item.id);
    setMoveDialogOpen(true);
  };

  const toggleItemCategory = (name) => {
    setSelectedItemCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
    setItemPage(0);
  };

  const toggleItemSubcategory = (name) => {
    setSelectedItemSubcategories((prev) => 
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
    setItemPage(0);
  };

  const toggleItemLocationFilter = (name) => {
    setSelectedItemLocations((prev) =>
      prev.includes(name) ? prev.filter((l) => l !==name) : [...prev, name]
    );
    setItemPage(0);
  };

  const toggleItemSupplier = (name) => {
    setSelectedItemSuppliers((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
    setItemPage(0);
  };

  const toggleItemHotel = (name) => {
    setSelectedItemHotels((prev) =>
      prev.includes(name) ? prev.filter((h) => h !== name) : [...prev, name]
    );
    setItemPage(0);
  };

  const clearItemFilters = () => {
    setSelectedItemCategories([]);
    setSelectedItemSubcategories([]);
    setSelectedItemLocations([]);
    setSelectedItemSuppliers([]);
    setSelectedItemHotels([]);
    setItemPage(0);
  };


  //-------items tab: filter/sort/paginate ----


  const filteredItems = items.filter((item) => {

    const term = itemSearch.toLowerCase();

    const matchesSearch = 
      itemSearchField === "name"
        ? item.name.toLowerCase().includes(term)
        : itemSearchField === "category"
        ? (item.category || "").toLowerCase().includes(term)
        : itemSearchField === "supplier"
        ? (item.supplier || "").toLowerCase().includes(term)
        : (
            item.name.toLowerCase().includes(term) ||
            (item.category || "").toLowerCase().includes(term) ||
            (item.supplier || "").toLowerCase().includes(term)
        );

    if (!matchesSearch) {
      return false;
    }

    if (selectedItemCategories.length > 0 && !selectedItemCategories.includes(item.category)) {
      return false;
    }

    if (selectedItemSubcategories.length > 0 && !selectedItemSubcategories.includes(item.subcategory)) {
      return false;
    }

    if (selectedItemSuppliers.length > 0 && !selectedItemSuppliers.includes(item.supplier)) {
      return false;
    }

    if (selectedItemHotels.length > 0) {
      const itemHotels = item.hotels || [];
      const hasHotelMatch = itemHotels.some((h) => selectedItemHotels.includes(h));
      if (!hasHotelMatch) {
        return false;
      }
    }

    if (selectedItemLocations.length > 0) {
      const itemLocs = item.locations || [];
      const hasMatch = itemLocs.some(
        (loc) => loc.total_quantity > 0 && selectedItemLocations.includes(loc.location)
      );
      if (!hasMatch) {
        return false;
      }
    }

    return true;
  });


  const genericSort = (list, column, direction) => {

    return [...list].sort((a, b) => {

      if (!column) {
        return 0;
      }

      let valueA = a[column];
      let valueB = b[column];

      if (valueA === null || valueA === undefined) {
        valueA = "";
      }

      if (valueB === null || valueB === undefined) {
        valueB = "";
      }

      if (typeof valueA === "string" || typeof valueB === "string") {
        valueA = valueA.toString().toLowerCase();
        valueB = valueB.toString().toLowerCase();
      } else {
        valueA = Number(valueA);
        valueB = Number(valueB);
      }

      if (valueA < valueB) {
        return direction === "asc" ? -1 : 1;
      }

      if (valueA > valueB) {
        return direction === "asc" ? 1 : -1;
      }

      return 0;
    });
  };


  const sortedItems = genericSort(filteredItems, itemSortColumn, itemSortDirection);

  const paginatedItems = itemRowsPerPage === -1
    ? sortedItems
    : sortedItems.slice(
      itemPage * itemRowsPerPage,
      itemPage * itemRowsPerPage + itemRowsPerPage
    );


  const handleItemSort = (column) => {

    setItemPage(0);

    if (itemSortColumn === column) {
      setItemSortDirection(itemSortDirection === "asc" ? "desc" : "asc");
    } else {
      setItemSortColumn(column);
      setItemSortDirection("asc");
    }
  };



  const movingItem = items.find((i) => i.id === movingItemId) || null;

  const displayItems = paginatedItems.map((item) => {

    if (!itemQtyAtLocation || selectedItemLocations.length === 0) {
      return item;
    }

    const relevant = (item.locations || []).filter((loc) =>
    selectedItemLocations.includes(loc.location)
    );

    const total = relevant.reduce((sum, loc) => sum + (loc.total_quantity || 0), 0);
    const broken = relevant.reduce((sum, loc) => sum + (loc.broken_quantity || 0), 0);

    return {
      ...item,
      total_quantity: total,
      assigned_quantity: total,
      broken_quantity: broken
    };
  });


  return (
    <Box sx={{ p: 3 }}>

      {/* HEADER */}

      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 5,
          mt: -5
        }}
      >
        <h1>Housekeeping Items</h1>
      </Box>

      {/* ITEMS TAB */}
      {tab === 0 && (
        <>
          <Button
            variant="outlined"
            onClick={async () => {
              try {
                await exportItems(sortedItems, itemSearch);
              } catch (error) {
                alert(error.message);
              }
            }}
            sx={{
              position: "absolute",
              top: 9,
              right: 24,
              zIndex: 10,
              fontWeight: "bold",
              letterSpacing: 0.5,
              backgroundColor: "white",
              color: "green",
              "&:hover": {
                backgroundColor: "#217346",
                borderColor: "#217346",
                color: "white"
              }
            }}
          >
            .XLSX
          </Button>

          <Typography
            variant="body1"
            sx={{ mb: 5, maxWidth: 900, mx: "auto", textAlign: "center", fontSize: "1.15rem", lineHeight: 1.4 }}
          >
            Check the boxes in the filter section to filter for specific columns. If location filters are used, the corresponding locations in the table will turn {" "}
            <Box component="span" sx={{ color: "success.main", fontWeight: "bold" }}>
              green 
            </Box>
              {" "}to let you know which locations the "Total Quantity" column is taking into account.
          </Typography>

          <ItemFormDialog
            open={itemDialogOpen}
            onClose={() => {
              setItemDialogOpen(false);
              setSelectedImage(null);
              setRemovedImage(false);
            }}

            form={itemForm}
            setForm={setItemForm}
            categories={categories}
            subcategories={subcategories}
            hotels={hotels}
            suppliers={suppliers}
            editingId={itemEditingId}
            onSubmit={handleItemSubmit}
            onImageChange={setSelectedImage}
            selectedImage={selectedImage}
            currentImageName={currentImageName}
            onRemoveImage={handleItemRemoveImage}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 2,
              mb: 5
            }}
          >

            <TextField
              type="text"
              placeholder="Search items..."
              value={itemSearch}
              onChange={(e) => {
                setItemSearch(e.target.value);
                setItemPage(0);
              }}
            />

            <FormControl
              size="small"
              sx={{ minWidth: 150 }}
            >
              <InputLabel>
                Search In
              </InputLabel>

              <Select
                value={itemSearchField}
                label="Search In"
                onChange={(e) => {
                  setItemSearchField(e.target.value);
                  setItemPage(0);
                }}
              >

                <MenuItem value="all">All Fields</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="category">Category</MenuItem>
                <MenuItem value="supplier">Supplier</MenuItem>
              </Select>
            </FormControl>


            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setItemFiltersOpen(!itemFiltersOpen)}
            >
              Filters
            </Button>

            <TableZoomToggle zoomLevel={itemZoom} onChange={setItemZoom} />


            <Button
              variant="contained"
              sx={{ ml: "auto" }}
              onClick={() => {

                setItemEditingId(null);

                setItemForm({
                  name: "",
                  category_id: "",
                  subcategory_id: "",
                  supplier_id: "",
                  cost_per_unit: "",
                  opening_quantity: "0",
                  hotel_ids: []
                });

                setSelectedImage(null);
                setCurrentImageName(null);

                setItemDialogOpen(true);
              }}
            >
              Add Item
            </Button>

            {getUser()?.role === "admin" && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setCountResetOpen(true)}
              >
                Reset counts
              </Button>
            )}
          </Box>

          <ItemsFilterPanel
            open={itemFiltersOpen}
            categories={categories.map((c) => c.name)}
            subcategoriesList={subcategories.map((s) => s.name)}
            locationsList={locations.map((l) => l.name)}
            suppliersList={suppliers.map((s) => s.name)}
            hotelsList={hotels.map((h) => h.name)}
            selectedCategories={selectedItemCategories}
            selectedSubcategories={selectedItemSubcategories}
            selectedLocations={selectedItemLocations}
            selectedSuppliers={selectedItemSuppliers}
            selectedHotels={selectedItemHotels}
            onToggleCategory={toggleItemCategory}
            onToggleSubcategory={toggleItemSubcategory}
            onToggleLocation={toggleItemLocationFilter}
            onToggleSupplier={toggleItemSupplier}
            onToggleHotel={toggleItemHotel}
            onClearAll={clearItemFilters}
            qtyAtLocation={itemQtyAtLocation}
            onQtyModeChange={setItemQtyAtLocation}
          />


          <ItemDeleteConfirmDialog
            open={itemDeleteDialogOpen}
            onClose={() => {
              setItemDeleteDialogOpen(false);
              setItemToDelete(null);
            }}
            onConfirm={confirmItemDelete}
            onConfirmWithHistory={confirmItemDeleteWithHistory}
            isAdmin={getUser()?.role === "admin"}
            itemName={itemToDelete?.name}
            itemLocations={itemToDelete?.locations}
          />

          <CountResetDialog
            open={countResetOpen}
            onClose={() => setCountResetOpen(false)}
            defaultDepartmentId={housekeepingDepartmentId}
            onDone={(count) => {
              fetchItems();
              setSnackbarSeverity("success");
              setSnackbarMessage(`${count} count${count !== 1 ? "s" : ""} reset`);
              setSnackbarOpen(true);
            }}
          />
          
          <MoveItemDialog
            open={moveDialogOpen}
            onClose={() => {
              setMoveDialogOpen(false);
              setMovingItemId(null);
            }}
            item={movingItem}
            locations={locations}
            onChange={() => {
              fetchItems();
            }}
          />

          <ItemTable
            items={displayItems}
            selectedLocations={selectedItemLocations}
            zoomLevel={itemZoom}
            onDelete={handleItemDelete}
            onMove={handleMoveClick}
            onHistory={(item, type) =>
              navigate(`/items/${item.id}/${type}`, {
                state: { itemName: item.name }
              })
            }
            onSort={handleItemSort}
            sortColumn={itemSortColumn}
            sortDirection={itemSortDirection}
            onEdit={(item) => {

              setItemEditingId(item.id);
              setSelectedImage(null);
              setRemovedImage(false);

              setItemForm({
                name: item.name,
                category_id: item.category_id,
                subcategory_id: item.subcategory_id || "",
                supplier_id: item.supplier_id || "",
                cost_per_unit: item.cost_per_unit || "",
                opening_quantity: item.opening_quantity ?? 0,
                hotel_ids: item.hotel_ids || [],
                opening_quantities: item.opening_quantities || {}
              });

              if (item.image_url) {
                setCurrentImageName(item.image_url.split("/").pop());
              } else {
                setCurrentImageName(null);
              }

              setItemDialogOpen(true);
            }}
          />

          <TablePagination
            component="div"
            count={sortedItems.length}
            page={itemPage}
            onPageChange={(e, newPage) => setItemPage(newPage)}
            rowsPerPage={itemRowsPerPage}
            onRowsPerPageChange={(e) => {
              setItemRowsPerPage(parseInt(e.target.value, 10));
              setItemPage(0);
            }}
            rowsPerPageOptions={[25, 50, 100, { label: "All", value: -1 }]}
          />
        </>
      )}


      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </Box>
  );
}


export default HousekeepingItems;