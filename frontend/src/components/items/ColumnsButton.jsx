import { useState } from "react";
import { Button, Menu, MenuItem, Checkbox, ListItemText, Divider } from "@mui/material";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import { ITEM_TABLE_COLUMNS, DEFAULT_HIDDEN_COLUMNS, CATALOGUE_COLUMNS } from "../../utils/itemFields";



//lets each user show or hide table columns for themselves
//   hiddenColumns: the columns this user has hidden
//   onChange:      called with the new list(the page saves it on the user's account)
//   itemFields:    the department's fields, catalogue columns (Code, Size...) are only offered when the department shows them

function ColumnsButton({ hiddenColumns, onChange, itemFields = [] }) {

    const [anchor, setAnchor] = useState(null);

    const columns = ITEM_TABLE_COLUMNS.filter(
        ({ column }) => !CATALOGUE_COLUMNS.includes(column) || itemFields.includes(column)
    );

    //ticked = shown, so clicking a shown column hides it and the other way around
    const toggleColumn = (column) => {
        onChange(
            hiddenColumns.includes(column)
                ? hiddenColumns.filter((c) => c !== column)
                : [...hiddenColumns, column]
        );
    };

    return (
        <>
            <Button
                variant="outlined"
                startIcon={<ViewColumnIcon />}
                onClick={(e) => setAnchor(e.currentTarget)}
            >
                Columns
            </Button>

            <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
            >
                {columns.map(({ column, label }) => (
                    <MenuItem key={column} dense onClick={() => toggleColumn(column)}>
                        <Checkbox size="small" checked={!hiddenColumns.includes(column)} />
                        <ListItemText primary={label} />
                    </MenuItem>
                ))}

                <Divider />

                <MenuItem dense onClick={() => onChange([])}>
                    Show all
                </MenuItem>

                <MenuItem dense onClick={() => onChange(DEFAULT_HIDDEN_COLUMNS)}>
                    Default View
                </MenuItem>
            </Menu> 
        </>
    );
}

export default ColumnsButton;