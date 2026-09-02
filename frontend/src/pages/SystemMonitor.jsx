import { useEffect, useState } from "react";
import { getSystemStatus } from "../services/systemService";
import SurfaceChart from "../components/analytics/SurfaceChart";

function SystemMonitor() {

    const [systemStatus, setSystemStatus] = useState(null);

    const [history, setHistory] = useState([]);

    useEffect(() => {
        async function loadSystemStatus() {

            try {
                const data = await getSystemStatus();

                setSystemStatus(data);

                setHistory((previous) => [
                    ...previous,
                    {
                        time: new Date().toLocaleTimeString(),
                        cpu: data.cpu_percent,
                        memory: data.memory_percent,
                        disk: data.disk_percent
                    }
                ].slice(-60));

            } catch (error) {

                console.error(error);

            }
        }

        loadSystemStatus();

        const interval = setInterval(() => {
            loadSystemStatus();
        }, 5000);

        return () => clearInterval(interval);

    }, []);

    return (

        <div
            style={{
                backgroundColor: "#4a658d",
                minHeight: "10vh",
                padding: "10px",
                minWidth: "200px",
                display: "flex",
                alignItems: "flex-start",
                gap: "30px"
                
            }}>
                
            {systemStatus && (
                <div
                    style={{
                        color: "#ece90dd3"
                    }}>

                    <h1>
                        Analytics
                    </h1>

                    <h3>
                        Server Status
                    </h3>

                    <p>
                        Hostname: {systemStatus.hostname}
                    </p>

                    <p>
                        🔵 CPU: {systemStatus.cpu_percent}%
                    </p>

                    <p>
                        🟠 Memory: {systemStatus.memory_percent}%
                    </p>

                    <p>
                        🟢 Disk: {systemStatus.disk_percent}%
                    </p>
                </div>
            )}

                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start"
                    }}
                >
                    <SurfaceChart 
                        history={history}
                    />
                </div>
            </div>

        
    );
}

export default SystemMonitor;