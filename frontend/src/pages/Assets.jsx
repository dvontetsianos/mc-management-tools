import { useState, useEffect } from "react";
import ItemTable from "../components/assets/ItemTable";
import LocationsTable from "../components/assets/LocationsTable";
import ItemFormDialog from "../components/assets/ItemFormDialog";
import ItemLocationFormDialog from "../components/assets/ItemLocationFormDialog";
import ItemDeleteConfirmDialog from "../components/assets/ItemDeleteConfirmDialog";
import ItemAssignLocationsDialog from "../components/assets/ItemAssignLocationsDialog";
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  uploadItemImage,
  deleteItemImage,
  getItemLocations,
  createItemLocation,
  updateItemLocation,
  deleteItemLocation,
  exportItems
} from "../services/itemService";
import { getCategories } from "../services/assetService";
import { getLocations } from "../services/locationService";
import { getSuppliers } from "../services/supplierService";
import {
  Button,
  Box,
  Typography,
  TextField,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ItemsFilterPanel from "../components/assets/ItemsFilterPanel";
import FilterListIcon from "@mui/icons-material/FilterList";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";




function Assets() {

  const [tab, setTab] = useState(0);

  const [items, setItems] = useState([]);
  const [itemLocationsList, setItemLocationsList] = useState([]);
  const [locations, setLocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // ---items tab state -----

  const [itemSearch, setItemSearch] = useState("");
  const [itemFiltersOpen, setItemFiltersOpen] = useState(false);
  const [itemSearchField, setItemSearchField] = useState("all");
  const [itemSortColumn, setItemSortColumn] = useState(null);
  const [itemSortDirection, setItemSortDirection] = useState("asc");
  const [itemPage, setItemPage] = useState(0);
  const [itemRowsPerPage, setItemRowsPerPage] = useState(25);

  const [itemForm, setItemForm] = useState({
    name: "",
    category_id: "",
    supplier_id: "",
    cost_per_unit: ""
  });

  const [itemEditingId, setItemEditingId] = useState(null);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageName, setCurrentImageName] = useState(null);
  const [removeImage, setRemovedImage] = useState(false);

  const [itemDeleteDialogOpen, setItemDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigningItemId, setAssigningItemId] = useState(null);

  const [selectedItemCategories, setSelectedItemCategories] = useState([]);
  const [selectedItemLocations, setSelectedItemLocations] = useState([]);
  const [selectedItemSuppliers, setSelectedItemSuppliers] = useState([]);
  const [itemQtyAtLocation, setItemQtyAtLocation] = useState(true);


  //-----locations tab state-------


  const [locSearch, setLocSearch] = useState("");
  const [locSearchField, setLocSearchField] = useState("all");
  const [locSortColumn, setLocSortColumn] = useState(null);
  const [locSortDirection, setLocSortDirection] = useState("asc");
  const [locPage, setLocPage] = useState(0);
  const [locRowsPerPage, setLocRowsPerPage] = useState(25);

  const [ilForm, setIlForm] = useState({
    item_id: "",
    location_id: "",
    total_quantity: "0",
    broken_quantity: "0",
    item_name: "",
    location_name: ""
  });

  const [ilEditingId, setIlEditingId] = useState(null);
  const [ilDialogOpen, setIlDialogOpen] = useState(false);

  const [ilDeleteDialogOpen, setIlDeleteDialogOpen] = useState(false);
  const [ilToDelete, setIlToDelete] = useState(null);


  //-------fetchers-----------


  const fetchItems = async () => {
    const data = await getItems();
    setItems(data);
  };

  const fetchItemLocationsList = async () => {
    const data = await getItemLocations();
    setItemLocationsList(data);
  };

  const fetchLocations = async () => {
    const data = await getLocations();
    setLocations(data);
  };

  const fetchCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  const fetchSuppliers = async () => {
    const data = await getSuppliers();
    setSuppliers(data);
  };

  useEffect(() => {
    fetchItems();
    fetchItemLocationsList();
    fetchLocations();
    fetchCategories();
    fetchSuppliers();
  }, []);


  //-----item handlers----------


  const handleItemSubmit = async () => {

    if (!itemForm.name || !itemForm.category_id) {
      return false;
    }

    const payload = {
      ...itemForm,
      supplier_id: itemForm.supplier_id === "" ? null : itemForm.supplier_id,
      cost_per_unit: itemForm.cost_per_unit === "" ? null : itemForm.cost_per_unit
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
        supplier_id: "",
        cost_per_unit: ""
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

    await deleteItem(itemToDelete.id);

    fetchItems();
    fetchItemLocationsList();

    setSnackbarMessage("Item deleted successfully.");
    setSnackbarOpen(true);

    setItemDeleteDialogOpen(false);
    setItemToDelete(null);
  }


  const handleAssignClick = (item) => {
    setAssigningItemId(item.id);
    setAssignDialogOpen(true);
  };

  const toggleItemCategory = (name) => {
    setSelectedItemCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
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

  const clearItemFilters = () => {
    setSelectedItemCategories([]);
    setSelectedItemLocations([]);
    setSelectedItemSuppliers([]);
    setItemPage(0);
  };


  //---item=location handlers


  const handleIlSubmit = async () => {

    if (ilEditingId === null && (!ilForm.item_id || !ilForm.location_id)) {
      return false;
    }

    try {

      if (ilEditingId !== null) {

        await updateItemLocation(ilEditingId, {
          total_quantity: ilForm.total_quantity,
          broken_quantity: ilForm.broken_quantity
        });

      } else {

        await createItemLocation({
          item_id: ilForm.item_id,
          location_id: ilForm.location_id,
          total_quantity: ilForm.total_quantity,
          broken_quantity: ilForm.broken_quantity
        });
      }

      fetchItemLocationsList();
      fetchItems();


      setIlForm({
        item_id: "",
        location_id: "",
        total_quantity: "0",
        broken_quantity: "0",
        item_name: "",
        location_name: ""
      });

      setIlEditingId(null);

      return true;

    } catch (error) {
      console.error("SAVE ERROR:", error);
      throw error;
    }
  };

  const handleIlDelete = (itemLocation) => {
    setIlToDelete(itemLocation);
    setIlDeleteDialogOpen(true);
  };

  const confirmIlDelete = async () => {

    if (!ilToDelete) return;

    await deleteItemLocation(ilToDelete.id);

    fetchItemLocationsList();
    fetchItems();

    setSnackbarMessage("Item removed from location successfully.");
    setSnackbarOpen(true);

    setIlDeleteDialogOpen(false);
    setIlToDelete(null);
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

    if (selectedItemSuppliers.length > 0 && !selectedItemSuppliers.includes(item.supplier)) {
      return false;
    }

    if (selectedItemLocations.length > 0) {
      const itemLocs = item.locations || [];
      const hasMatch = itemLocs.some((loc) => selectedItemLocations.includes(loc.location));
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



  //-------locations tab: filter/sort/paginate----------



  const filteredItemLocations = itemLocationsList.filter((il) => {

    const term = locSearch.toLowerCase();

    if (locSearchField === "item_name") {
      return (il.item_name || "").toLowerCase().includes(term);
    }

    if (locSearchField === "location") {
      return (il.location || "").toLowerCase().includes(term);
    }

    return (
      (il.item_name || "").toLowerCase().includes(term) ||
      (il.location || "").toLowerCase().includes(term)
    );
  });


  const sortedItemLocations = genericSort(filteredItemLocations, locSortColumn, locSortDirection);

  const paginatedItemLocations = locRowsPerPage === -1
    ? sortedItemLocations
    : sortedItemLocations.slice(
      locPage * locRowsPerPage,
      locPage * locRowsPerPage + locRowsPerPage
    );

  const handleLocationSort = (column) => {

    setLocPage(0);

    if (locSortColumn === column) {
      setLocSortDirection(locSortDirection === "asc" ? "desc" : "asc");
    } else {
      setLocSortColumn(column);
      setLocSortDirection("asc");
    }
  };


  const assigningItem = items.find((i) => i.id === assigningItemId) || null;

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
        <h1>F&B Asset Management</h1>

        <Button
          variant="outlined"
          component="a"
          href="/quick-count"
          target="_blank"
          rel="noopener"
          startIcon={<PhoneIphoneIcon />}
          sx={{
            position: "absolute",
            right: 90,
            minWidth: 0,
            px: 1,
            "& .MuiButton-startIcon": {
              margin: 0
            }
          }}
        />
      </Box>

      <Tabs
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Items" />
        <Tab label="Locations (old)" />
      </Tabs>

      <ItemLocationFormDialog
        open={ilDialogOpen}
        onClose={() => setIlDialogOpen(false)}
        form={ilForm}
        setForm={setIlForm}
        items={items}
        locations={locations}
        editingId={ilEditingId}
        onSubmit={handleIlSubmit}
      />


      {/* ITEMS TAB */}
      {tab === 0 && (
        <>
          <Button
            variant="outlined"
            onClick={async () => {
              try {
                await exportItems(paginatedItems, itemSearch);
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


            <Button
              variant="contained"
              sx={{ ml: "auto" }}
              onClick={() => {

                setItemEditingId(null);

                setItemForm({
                  name: "",
                  category_id: "",
                  supplier_id: "",
                  cost_per_unit: ""
                });

                setSelectedImage(null);
                setCurrentImageName(null);

                setItemDialogOpen(true);
              }}
            >
              Add Item
            </Button>

            {/* Old assign item to location button
            <Button
              variant="contained"
              onClick={() => {

                setIlEditingId(null);

                setIlForm({
                  item_id: "",
                  location_id: "",
                  total_quantity: "0",
                  broken_quantity: "0",
                  item_name: "",
                  location_name: ""
                });

                setIlDialogOpen(true);
              }}
            >
              Assign Item to Location
            </Button>
            */}
          </Box>

          <ItemsFilterPanel
            open={itemFiltersOpen}
            categories={categories.map((c) => c.name)}
            locationsList={locations.map((l) => l.name)}
            suppliersList={suppliers.map((s) => s.name)}
            selectedCategories={selectedItemCategories}
            selectedLocations={selectedItemLocations}
            selectedSuppliers={selectedItemSuppliers}
            onToggleCategory={toggleItemCategory}
            onToggleLocation={toggleItemLocationFilter}
            onToggleSupplier={toggleItemSupplier}
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
            itemName={itemToDelete?.name}
            itemLocations={itemToDelete?.locations}
          />

          <ItemAssignLocationsDialog
            open={assignDialogOpen}
            onClose={() => {
              setAssignDialogOpen(false);
              setAssigningItemId(null);
            }}
            item={assigningItem}
            locations={locations}
            onChange={() => {
              fetchItems();
              fetchItemLocationsList();
            }}
          />

          <ItemTable
            items={displayItems}
            selectedLocations={selectedItemLocations}
            onDelete={handleItemDelete}
            onAssign={handleAssignClick}
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
                supplier_id: item.supplier_id || "",
                cost_per_unit: item.cost_per_unit || ""
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


      {/* locations tab */}

      {tab === 1 && (
        <>
          <Typography
            variant="h5"
            sx={{ mb: 5 }}
          >
            Every row below is one item assigned to one location. Add a new assignment, or edit/remove an existsing one.
          </Typography>

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
              placeholder="Search locations..."
              value={locSearch}
              onChange={(e) => {
                setLocSearch(e.target.value);
                setLocPage(0);
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
                value={locSearchField}
                label="Search In"
                onChange={(e) => {
                  setLocSearchField(e.target.value);
                  setLocPage(0);
                }}
              >
                <MenuItem value="all">All Fields</MenuItem>
                <MenuItem value="item_name">Item</MenuItem>
                <MenuItem value="location">Location</MenuItem>
              </Select>
            </FormControl>
          </Box>


          <Dialog
            open={ilDeleteDialogOpen}
            onClose={() => {
              setIlDeleteDialogOpen(false);
              setIlToDelete(null);
            }}
          >
            <DialogTitle>
              Remove Item From Location
            </DialogTitle>

            <DialogContent>
              <DialogContentText>
                Are you sure you want to remove{" "}
                <strong>{ilToDelete?.item_name}</strong> from {" "}
                <strong>{ilToDelete?.location}</strong>?
                <br />
                <br />
                The item itself will not be deleted, and will remain assigned to any other locations it has.
              </DialogContentText>
            </DialogContent>

            <DialogActions>
              <Button
                onClick={() => {
                  setIlDeleteDialogOpen(false);
                  setIlToDelete(null);
                }}
                variant="outlined"
              >
                Cancel
              </Button>


              <Button
                onClick={confirmIlDelete}
                color="error"
                variant="contained"
              >
                Remove
              </Button>
            </DialogActions>
          </Dialog>


          <LocationsTable
            itemLocations={paginatedItemLocations}
            onDelete={handleIlDelete}
            onSort={handleLocationSort}
            sortColumn={locSortColumn}
            sortDirection={locSortDirection}
            onEdit={(itemLocation) => {

              setIlEditingId(itemLocation.id);

              setIlForm({
                item_id: itemLocation.item_id,
                location_id: itemLocation.location_id,
                total_quantity: itemLocation.total_quantity,
                broken_quantity: itemLocation.broken_quantity,
                item_name: itemLocation.item_name,
                location_name: itemLocation.location
              });

              setIlDialogOpen(true);
            }}
          />

          <TablePagination
            component="div"
            count={sortedItemLocations.length}
            page={locPage}
            onPageChange={(e, newPage) => setLocPage(newPage)}
            rowsPerPage={locRowsPerPage}
            onRowsPerPageChange={(e) => {
              setLocRowsPerPage(parseInt(e.target.value, 10));
              setLocPage(0);
            }}
            rowsPerPageOptions={[25, 50, 100, { label: "all", value: -1 }]}
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
          severity="success"
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </Box>
  );
}


export default Assets;