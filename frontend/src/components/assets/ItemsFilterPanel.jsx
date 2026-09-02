import { useState } from "react";
import {
    Box,
    Button,
    Paper,
    Typography,
    FormGroup,
    FormControlLabel,
    Switch,
    Divider,
    Checkbox
} from "@mui/material";



function ItemsFilterPanel({
    open,
    categories,
    locationsList,
    suppliersList,
    selectedCategories,
    selectedLocations,
    selectedSuppliers,
    onToggleCategory,
    onToggleLocation,
    onToggleSupplier,
    onClearAll,
    qtyAtLocation,
    onQtyModeChange
}) {

    return (
        <Box sx={{ mb: 3 }}>

            {open && (
                <Paper sx={{ p: 2, mt: 1 }}>

                    <Box sx={{ display: "flex", gap: 6, flexWrap: "wrap" }}>

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Category
                            </Typography>

                            <FormGroup>
                                {categories.map((name) => (
                                    <FormControlLabel
                                        key={name}
                                        control={
                                            <Checkbox
                                                checked={selectedCategories.includes(name)}
                                                onChange={() => onToggleCategory(name)}
                                            />
                                        }
                                        label={name}
                                    />
                                ))}
                            </FormGroup>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Location
                            </Typography>

                            <FormGroup>
                                {locationsList.map((name) => (
                                    <FormControlLabel
                                        key={name}
                                        control={
                                            <Checkbox
                                                checked={selectedLocations.includes(name)}
                                                onChange={() => onToggleLocation(name)}
                                            />
                                        }
                                        label={name}
                                    />
                                ))}
                            </FormGroup>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Supplier
                            </Typography>

                            <FormGroup>
                                {suppliersList.map((name) => (
                                    <FormControlLabel
                                        key={name}
                                        control={
                                            <Checkbox
                                                checked={selectedSuppliers.includes(name)}
                                                onChange={() => onToggleSupplier(name)}
                                            />
                                        }
                                        label={name}
                                    />
                                ))}
                            </FormGroup>
                        </Box>

                    </Box>

                    <Button
                        size="small"
                        color="error"
                        onClick={onClearAll}
                        sx={{ mt: 1 }}
                    >
                        Clear all filters
                    </Button>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

                        <Typography variant="subtitle2">
                            Quantity columns:
                        </Typography>

                        <Typography variant="body2">
                            Hotel-wide total
                        </Typography>

                        <Switch
                            checked={qtyAtLocation}
                            onChange={(e) => onQtyModeChange(e.target.checked)}
                        />

                        <Typography variant="body2">
                            Only at checked locations
                        </Typography>

                    </Box>

                </Paper>
            )}

        </Box>
    );
}

export default ItemsFilterPanel;