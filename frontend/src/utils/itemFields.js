//the group catalogue details every item can have, in the order the form shows them
//each department chooses which of these it uses (Departments page)
//  wide: takes the whole row in the item form
//  example: shown in the form, e.g. "Code (e.g. HK-LIN-01)"
export const ITEM_SPEC_FIELDS = [
    { field: "code", label: "Code", example: "HK-LIN-01" },
    { field: "size", label: "Size" },
    { field: "material", label: "Material" },
    { field: "color", label: "Color" },
    { field: "specification", label: "Specification", wide: true },
    { field: "supplier_description", label: "Supplier Description", wide: true }
];


//the items table columns each user can hide for themselves (Columns button)
//Name and the Edit / Assign / History buttons always stay
export const ITEM_TABLE_COLUMNS = [
    { column: "id", label: "ID" },
    { column: "code", label: "Code" },
    { column: "image", label: "Image" },
    { column: "category", label: "Category" },
    { column: "subcategory", label: "Subcategory" },
    { column: "size", label: "Size" },
    { column: "color", label: "Color" },
    { column: "material", label: "Material", hiddenByDefault: true },
    { column: "specification", label: "Specification", hiddenByDefault: true },
    { column: "supplier_description", label: "Supplier Description", hiddenByDefault: true },
    { column: "supplier", label: "Supplier" },
    { column: "cost_per_unit", label: "Cost per Unit" },
    { column: "hotels", label: "Hotels" },
    { column: "expected_total", label: "Expected Total" },
    { column: "assigned_quantity", label: "Assigned Quantity" },
    { column: "staff_count", label: "Staff Count" },
    { column: "missing", label: "Missing" },
    { column: "locations", label: "Locations" }
];


//what a user sees before they change anything themselves
export const DEFAULT_HIDDEN_COLUMNS = ITEM_TABLE_COLUMNS
    .filter((c) => c.hiddenByDefault)
    .map((c) => c.column);


//the catalogue columns (Code, Size...) exist only when the department uses them (Departments page)
export const CATALOGUE_COLUMNS = ITEM_SPEC_FIELDS.map((spec) => spec.field)



//departments that have their own items page (F&B Items, Housekeeping Items, Kitchen Items)
//a new items page needs its department's exact name added here
export const DEPARTMENTS_WITH_ITEMS = ["F&B", "Housekeeping", "Kitchen"];