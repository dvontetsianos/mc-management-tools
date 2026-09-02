import { useEffect,useState } from "react";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";

function Clock() {

    const timezones = [

        // UTC-11 to UTC-8
        { name: "Pago Pago", timezone: "Pacific/Pago_Pago", flag: "AS" },
        { name: "Honolulu", timezone: "Pacific/Honolulu", flag: "US" },
        { name: "Anchorage", timezone: "America/Anchorage", flag: "US" },
        { name: "Los Angeles", timezone: "America/Los_Angeles", flag: "US" },

        // UTC-7 to UTC-3
        { name: "Denver", timezone: "America/Denver", flag: "US" },
        { name: "Chicago", timezone: "America/Chicago", flag: "US" },
        { name: "Mexico City", timezone: "America/Mexico_City", flag: "MX" },
        { name: "New York", timezone: "America/New_York", flag: "US" },
        { name: "Toronto", timezone: "America/Toronto", flag: "CA" },
        { name: "Bogotá", timezone: "America/Bogota", flag: "CO" },
        { name: "Santiago", timezone: "America/Santiago", flag: "CL" },
        { name: "Caracas", timezone: "America/Caracas", flag: "VE" },
        { name: "São Paulo", timezone: "America/Sao_Paulo", flag: "BR" },
        { name: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires", flag: "AR" },

        // UTC-1 to UTC+1
        { name: "Azores", timezone: "Atlantic/Azores", flag: "PT" },
        { name: "London", timezone: "Europe/London", flag: "UK" },
        { name: "Lisbon", timezone: "Europe/Lisbon", flag: "PT" },
        { name: "Berlin", timezone: "Europe/Berlin", flag: "DE" },
        { name: "Paris", timezone: "Europe/Paris", flag: "FR" },
        { name: "Rome", timezone: "Europe/Rome", flag: "IT" },
        { name: "Lagos", timezone: "Africa/Lagos", flag: "NG" },

        // UTC+2 to UTC+3:30
        { name: "Athens", timezone: "Europe/Athens", flag: "GR" },
        { name: "Cairo", timezone: "Africa/Cairo", flag: "EG" },
        { name: "Johannesburg", timezone: "Africa/Johannesburg", flag: "ZA" },
        { name: "Moscow", timezone: "Europe/Moscow", flag: "RU" },
        { name: "Istanbul", timezone: "Europe/Istanbul", flag: "TR" },
        { name: "Nairobi", timezone: "Africa/Nairobi", flag: "KE" },
        { name: "Riyadh", timezone: "Asia/Riyadh", flag: "SA" },
        { name: "Tehran", timezone: "Asia/Tehran", flag: "IR" },

        // UTC+4 to UTC+6:30
        { name: "Dubai", timezone: "Asia/Dubai", flag: "AE" },
        { name: "Baku", timezone: "Asia/Baku", flag: "AZ" },
        { name: "Kabul", timezone: "Asia/Kabul", flag: "AF" },
        { name: "Karachi", timezone: "Asia/Karachi", flag: "PK" },
        { name: "Tashkent", timezone: "Asia/Tashkent", flag: "UZ" },
        { name: "Mumbai", timezone: "Asia/Kolkata", flag: "IN" },
        { name: "Kathmandu", timezone: "Asia/Kathmandu", flag: "NP" },
        { name: "Dhaka", timezone: "Asia/Dhaka", flag: "BD" },
        { name: "Almaty", timezone: "Asia/Almaty", flag: "KZ" },
        { name: "Yangon", timezone: "Asia/Yangon", flag: "MM" },

        // UTC+7 to UTC+9:30
        { name: "Bangkok", timezone: "Asia/Bangkok", flag: "TH" },
        { name: "Jakarta", timezone: "Asia/Jakarta", flag: "ID" },
        { name: "Singapore", timezone: "Asia/Singapore", flag: "SG" },
        { name: "Hong Kong", timezone: "Asia/Hong_Kong", flag: "HK" },
        { name: "Beijing", timezone: "Asia/Shanghai", flag: "CN" },
        { name: "Perth", timezone: "Australia/Perth", flag: "AU" },
        { name: "Tokyo", timezone: "Asia/Tokyo", flag: "JP" },
        { name: "Seoul", timezone: "Asia/Seoul", flag: "KR" },
        { name: "Adelaide", timezone: "Australia/Adelaide", flag: "AU" },

        // UTC+10 to UTC+14
        { name: "Sydney", timezone: "Australia/Sydney", flag: "AU" },
        { name: "Nouméa", timezone: "Pacific/Noumea", flag: "NC" },
        { name: "Auckland", timezone: "Pacific/Auckland", flag: "NZ" },
        { name: "Nukuʻalofa", timezone: "Pacific/Tongatapu", flag: "TO" },
        { name: "Kiritimati", timezone: "Pacific/Kiritimati", flag: "KI" },

        // Generic UTC offsets (fixed, no DST — for "what timezone are you on" lookups)
        { name: "UTC+0", timezone: "UTC", flag: "UTC" },
        { name: "UTC-11", timezone: "Etc/GMT+11", flag: "UTC" },
        { name: "UTC-10", timezone: "Etc/GMT+10", flag: "UTC" },
        { name: "UTC-9", timezone: "Etc/GMT+9", flag: "UTC" },
        { name: "UTC-8", timezone: "Etc/GMT+8", flag: "UTC" },
        { name: "UTC-7", timezone: "Etc/GMT+7", flag: "UTC" },
        { name: "UTC-6", timezone: "Etc/GMT+6", flag: "UTC" },
        { name: "UTC-5", timezone: "Etc/GMT+5", flag: "UTC" },
        { name: "UTC-4", timezone: "Etc/GMT+4", flag: "UTC" },
        { name: "UTC-3", timezone: "Etc/GMT+3", flag: "UTC" },
        { name: "UTC-1", timezone: "Etc/GMT+1", flag: "UTC" },
        { name: "UTC+1", timezone: "Etc/GMT-1", flag: "UTC" },
        { name: "UTC+2", timezone: "Etc/GMT-2", flag: "UTC" },
        { name: "UTC+3", timezone: "Etc/GMT-3", flag: "UTC" },
        { name: "UTC+3:30", timezone: "Asia/Tehran", flag: "UTC" },
        { name: "UTC+4", timezone: "Etc/GMT-4", flag: "UTC" },
        { name: "UTC+4:30", timezone: "Asia/Kabul", flag: "UTC" },
        { name: "UTC+5", timezone: "Etc/GMT-5", flag: "UTC" },
        { name: "UTC+5:30", timezone: "Asia/Kolkata", flag: "UTC" },
        { name: "UTC+5:45", timezone: "Asia/Kathmandu", flag: "UTC" },
        { name: "UTC+6", timezone: "Etc/GMT-6", flag: "UTC" },
        { name: "UTC+6:30", timezone: "Asia/Yangon", flag: "UTC" },
        { name: "UTC+7", timezone: "Etc/GMT-7", flag: "UTC" },
        { name: "UTC+8", timezone: "Etc/GMT-8", flag: "UTC" },
        { name: "UTC+9", timezone: "Etc/GMT-9", flag: "UTC" },
        { name: "UTC+9:30", timezone: "Australia/Adelaide", flag: "UTC" },
        { name: "UTC+10", timezone: "Etc/GMT-10", flag: "UTC" },
        { name: "UTC+11", timezone: "Etc/GMT-11", flag: "UTC" },
        { name: "UTC+12", timezone: "Etc/GMT-12", flag: "UTC" },
        { name: "UTC+13", timezone: "Etc/GMT-13", flag: "UTC" },
        { name: "UTC+14", timezone: "Etc/GMT-14", flag: "UTC" },

    ];
        

    const [open, setOpen] = useState(false);
    const [selectedTimezone, setSelectedTimezone] = useState("Europe/Athens");

    const [time, setTime] = useState("");

    const [search, setSearch] = useState("");

    useEffect(() => {

        function updateTime() {

            setTime(
                new Date().toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: selectedTimezone
                })
            );
        }

        updateTime();

        const timer = setInterval(updateTime, 1000);

        return () => clearInterval(timer);

    }, [selectedTimezone]);

    const filteredTimezones = timezones.filter((zone) =>
        zone.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            {!open && (
                <Button
                    variant="contained"
                    onClick={() => setOpen(true)}
                    sx={{
                        position: "fixed",
                        bottom: 75,
                        right: 20,
                        minWidth: "40px",
                        width: "40px",
                        height: "40px",
                        padding: 0,
                        zIndex: 1000
                    }}
                >
                    <span style={{ fontSize: "30px" }}>
                        🕐
                    </span>
                </Button>
            )}

            {open && (
                <Paper
                    elevation={4}
                    sx={{
                        position: "fixed",
                        bottom: 20,
                        right: 80,
                        width: 280,
                        padding: 2,
                        zIndex: 1000
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{ mb: 1, fontSize: 30 }}
                    >
                        World Clock 🌍
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{ mb: 1, color: "green" }}
                    >
                        ~[{selectedTimezone}]~
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{ mb: 0.5 }}
                    >
                        {timezones.find(
                            (zone) => zone.timezone === selectedTimezone
                        )?.name}
                    </Typography>

                    <TextField
                        fullWidth
                        value={time}
                        size="small"
                        slotProps={{
                            input: {
                                readOnly: true
                            }
                        }}
                        sx={{ mb: 1 }}
                    />

                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search city or timezone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ mb: 1 }}
                    />

                    <Box
                        sx={{
                            maxHeight: 260,
                            overflowY: "auto",
                            mb: 1,
                            pr: 0.5
                        }}
                    >
                        {filteredTimezones.map((zone) => (
                            <Button
                                key={zone.name}
                                fullWidth
                                variant="text"
                                sx={{
                                    justifyContent: "flex-start",
                                    textTransform: "none",
                                    mb: 0.5
                                }}
                                onClick={() => setSelectedTimezone(zone.timezone)}
                            >
                                <span style={{ fontSize: "20px", marginRight: "10px" }}>
                                    {zone.flag}
                                </span>

                                {zone.name}
                            </Button>
                        ))}
                    </Box>

                    <Button
                        fullWidth
                        variant="text"
                        sx={{ color: "red" }}
                        onClick={() => { setOpen(false); setSearch(""); }}
                    >
                        Close
                    </Button>

            </Paper>
        )}
    </>
    )
}

export default Clock;