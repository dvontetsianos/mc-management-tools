import { createTheme, alpha } from "@mui/material/styles";


//the app's look in one place: colours, font, corners and how buttons, tables, cards and dialogs look.
//pages use these through MUI (color="primary", "background.tableHead", variant="h4"...),
//so changing a value here changes it everywhere.

export const BRAND = "#0B4EA2";      //the blue of the MC logo
export const NAVY = "#080125";       //sidebar and login, the app's dark colour
const INK = "#171A2E";               //main text
const MUTED = "#5E6380";             //secondary text, table headers
const LINE = "#E2E5EE";              //borders and dividers
const CANVAS = "#F3F5FA";            //page background
const TABLE_HEAD = "#EEF1F8";
const STRIPE = "#F8F9FD";


const theme = createTheme({

    palette: {
        primary: { main: BRAND, dark: "#083B7C", light: "#4A7FC6", contrastText: "#FFFFFF" },
        secondary: { main: NAVY, contrastText: "#FFFFFF" },
        background: {
            default: CANVAS,
            paper: "#FFFFFF",
            tableHead: TABLE_HEAD,
            stripe: STRIPE,
            navy: NAVY
        },
        text: { primary: INK, secondary: MUTED },
        divider: LINE
    },

    shape: { borderRadius: 10 },

    typography: {
        //Commissioner has Greek letters too (item names), the others are fallbacks if it can't load
        fontFamily: '"Commissioner", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        h4: { fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.25 },
        h5: { fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.01em" },
        h6: { fontSize: "1.05rem", fontWeight: 650 },
        subtitle1: { fontWeight: 600 },
        button: { textTransform: "none", fontWeight: 600, letterSpacing: 0 }
    },

    components: {

        MuiCssBaseline: {
            styleOverrides: {
                body: { backgroundColor: CANVAS, color: INK },
                "::selection": { backgroundColor: alpha(BRAND, 0.18) }
            }
        },

        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: { borderRadius: 8, paddingInline: 14 },
                sizeSmall: { paddingInline: 10 }
            }
        },

        MuiIconButton: {
            styleOverrides: {
                root: { borderRadius: 8 }
            }
        },

        //cards and table boxes: white, a thin border and a very soft shadow instead of the heavy default one
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: "none" },
                rounded: { borderRadius: 12 },
                elevation1: {
                    boxShadow: "0 1px 2px rgba(23, 26, 46, 0.05), 0 1px 3px rgba(23, 26, 46, 0.04)",
                    border: `1px solid ${LINE}`
                }
            }
        },

        MuiCard: {
            styleOverrides: {
                root: { borderRadius: 14 }
            }
        },

        MuiDialog: {
            styleOverrides: {
                paper: { borderRadius: 16 }
            }
        },

        MuiDialogTitle: {
            styleOverrides: {
                root: { fontWeight: 700, fontSize: "1.15rem" }
            }
        },

        MuiTableCell: {
            styleOverrides: {
                root: { borderBottomColor: LINE },
                head: {
                    backgroundColor: TABLE_HEAD,
                    color: MUTED,
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap"
                }
            }
        },

        MuiTableRow: {
            styleOverrides: {
                root: {
                    "&.MuiTableRow-hover:hover": { backgroundColor: alpha(BRAND, 0.04) }
                }
            }
        },

        MuiTextField: {
            defaultProps: { size: "small" }
        },

        MuiFormControl: {
            defaultProps: { size: "small" }
        },

        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    backgroundColor: "#FFFFFF"
                }
            }
        },

        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 600 }
            }
        },

        MuiTooltip: {
            styleOverrides: {
                tooltip: { backgroundColor: NAVY, fontSize: "0.78rem", borderRadius: 6 },
                arrow: { color: NAVY }
            }
        },

        MuiAlert: {
            styleOverrides: {
                root: { borderRadius: 10 }
            }
        },

        MuiTablePagination: {
            styleOverrides: {
                root: { borderTop: `1px solid ${LINE}` }
            }
        }
    }
});


export default theme;
