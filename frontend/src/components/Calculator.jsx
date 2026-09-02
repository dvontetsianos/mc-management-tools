import { useState } from "react";
import {
    Paper,
    Typography,
    TextField,
    Button
} from "@mui/material";

import CalculateIcon from "@mui/icons-material/Calculate";

function Calculator() {

    const [open, setOpen] = useState(false);
    const [display, setDisplay] = useState("0");
    const [expression, setExpression] = useState("");
    const [firstNumber, setFirstNumber] = useState(null);
    const [operator, setOperator] = useState(null);

    function handleNumber(value) {

        if (operator !== null) {

            setExpression(expression + value);
        }

        if (display ==="0") {

            setDisplay(value);

        } else {

            setDisplay(display + value);
        }
    }

    function handleDecimal() {

        if (!display.includes(".")) {

            setDisplay(display + ".");

        }
    }

    function handleOperator(selectedOperator) {

        if (operator !== null) {

            setOperator(selectedOperator);

            setExpression(
                expression.slice(0, -2) + " " + selectedOperator + " "
            );

            return;
        }

        setFirstNumber(parseFloat(display));
        setOperator(selectedOperator);
        setExpression(
            display + " " + selectedOperator + " "
        );
        setDisplay("0");
    }

    function handleEquals() {

        if (firstNumber === null || operator === null) {
            return;
        }

        const secondNumber = parseFloat(display);

        let result;

        if (operator === "+") {
            result = firstNumber + secondNumber;
        }

        if (operator === "-") {
            result = firstNumber - secondNumber;
        }

        if (operator === "*") {
            result = firstNumber * secondNumber;
        }

        if (operator === "/") {

            if (secondNumber === 0) {
                setDisplay("Error");
                setFirstNumber(null);
                setOperator(null);
                return;
            }

            result = firstNumber / secondNumber;
        }

        setDisplay(String(Number(result.toFixed(8))));
        setExpression("");
        setFirstNumber(null);
        setOperator(null);
    }

    function handleClear() {

        setDisplay("0");
        setExpression("");
        setFirstNumber(null);
        setOperator(null);
    }

    return (
    <>
        {!open && (
            <Button
                variant="contained"
                onClick={() => setOpen(true)}
                sx={{
                    position: "fixed",
                    bottom: 20,
                    right: 20,
                    minWidth: "40px",
                    width: "40px",
                    height: "40px",
                    padding: 0,
                    zIndex: 1000
                }}
            >
                <CalculateIcon style={{ fontSize: "30px" }}/>
            </Button>
        )}

        {open && (
            <Paper
                elevation={4}
                sx={{
                    position: "fixed",
                    bottom: 20,
                    right: 20,
                    width: 280,
                    padding: 2,
                    zIndex: 1000
                }}
            >

                <Typography
                    variant="h6"
                    sx={{ mb: 1 }}
                >
                    Calculator
                </Typography>

                <TextField
                    fullWidth
                    value={expression || display}
                    size="small"
                    inputProps={{
                        readOnly: true
                    }}
                    sx={{ mb: 1 }}
                />

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "5px"
                    }}
                >

                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleClear}
                    >
                        C
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={() => handleNumber("7")}
                    >
                        7
                    </Button>
                                        <Button
                        variant="outlined"
                        onClick={() => handleNumber("8")}
                    >
                        8
                    </Button>
                                        <Button
                        variant="outlined"
                        onClick={() => handleNumber("9")}
                    >
                        9
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() => handleOperator("/")}
                        sx={{ fontSize: "22px" }}
                    >
                        ÷
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => handleNumber("4")}
                    >
                        4
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => handleNumber("5")}
                    >
                        5
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => handleNumber("6")}
                    >
                        6
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => handleOperator("*")}
                        sx={{ fontSize: "22px" }}
                    >
                        ×
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={() => handleNumber("1")}
                    >
                        1
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => handleNumber("2")}
                    >
                        2
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => handleNumber("3")}
                    >
                        3
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => handleOperator("-")}
                        sx={{ fontSize: "22px" }}
                    >
                        -
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={() => handleNumber("0")}
                    >
                        0
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleDecimal}
                    >
                        .
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleEquals}
                    >
                        =
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => handleOperator("+")}
                        sx={{ fontSize: "22px" }}
                    >
                        +
                    </Button>

                </div>

                <Button
                    fullWidth
                    variant="text"
                    onClick={() => setOpen(false)}
                    sx={{ mt: 1, color: "red" }}
                >
                    Close
                </Button>

            </Paper>
        )}
    </>
)

}

export default Calculator;