import Box from "@mui/material/Box";


//a location name with its hotel next to it in smaller, lighter letters
function LocationLabel({ name, hotel}) {

    return (
        <>
            {name}
            
            {hotel && (
                <Box
                    component="span"
                    sx={{
                        opacity: 0.6,
                        fontSize: "0.8em",
                        ml: 0.75
                    }}
                >
                    {hotel}
                </Box>
            )}
        </>
    );
}

export default LocationLabel;