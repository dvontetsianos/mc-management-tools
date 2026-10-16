import { useState, useEffect } from "react";
import { Alert, Box } from "@mui/material";
import { getCountLeaderboard } from "../services/systemService";


//the top 3 counters of the last 7 days, shown while the switch in System Monitor is on
//departmentId: only that department's items count (wait until it's known, null = not yet)
function CountLeaderboard({ departmentId, departmentName, sx }) {

    const [leaders, setLeaders] = useState([]);

    useEffect(() => {
        if (!departmentId) return;

        getCountLeaderboard(departmentId)
            .then((data) => setLeaders(data.top || []))
            .catch(() => setLeaders([]));
    }, [departmentId]);

    if (leaders.length === 0) return null;

    return (
        <Alert severity="success" icon={false} sx={sx}>
            <Box sx={{ fontWeight: 600, mb: 0.5 }}>
                🏆 Περισσότερα είδη {departmentName} μετρήθηκαν τις τελευταίες 7 μέρες από:
            </Box>
            {leaders.map((leader, index) => (
                <Box key={leader.username}>
                    {["🥇", "🥈", "🥉"][index]} {leader.username}: {leader.items} είδη
                </Box>
            ))}
        </Alert>
    );
}

export default CountLeaderboard;