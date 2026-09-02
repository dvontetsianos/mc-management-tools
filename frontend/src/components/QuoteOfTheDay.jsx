import { useState } from "react";
import { Typography, IconButton, Box } from "@mui/material";
import ShuffleIcon from "@mui/icons-material/Shuffle";


const SAYINGS = [
    "Κύλησε ο τέντζερης, και έπεσε στον τράφο.",
    "Και στραβός ειν' ο γυαλός, και στραβά 'ρμενίζουμε",
    "Τρέχοντας γυμνός μέσα στο πλήθος, ο ηλίθιος άνδρας καλύπτει τους όρχεις του, ο έξυπνος άνδρας καλύπτει τα μούτρα του.",
    "Για να ξυπνήσεις, πρέπει πρώτα να πιείς καφέ, αλλά για να πιείς καφέ, πρέπει πρώτα να ξυπνήσεις.",
    "",
    ""
];

const FUNNY_AUTHORS = [
    "Σωκράτης",
    "Πλάτωνας",
    "Ηράκλειτος",
    "Αρχιμήδης",
    "Θαλής",
    "Πυθαγόρας",
    "Δημόκριτος",
    "Αριστοτέλης",
    "Ζήνων",
];

function generateRandomQuote(){

    const text = SAYINGS[
        Math.floor(Math.random() * SAYINGS.length)
    ];

    const author = FUNNY_AUTHORS[
        Math.floor(Math.random() * FUNNY_AUTHORS.length)
    ];

    return { text, author };
}

function QuoteOfTheDay() {

    const [quote, setQuote] = useState(generateRandomQuote());

    return (
        <Box
            sx={{
                position: "fixed",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                gap: 1,
                zIndex: 1000
            }}
        >

            <Typography sx={{ fontStyle: "italic" }}>
                "{quote.text}"{" "}
                <Typography
                    component="span"
                    sx={{ fontStyle: "normal", opacity: 0.7 }}
                >
                    ~{quote.author}
                </Typography>
            </Typography>

            <IconButton
                size="small"
                onClick={() => setQuote(generateRandomQuote())}
            >
                <ShuffleIcon fontSize="small" />
            </IconButton>
        </Box>
    )
}

export default QuoteOfTheDay;