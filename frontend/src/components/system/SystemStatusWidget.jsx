import { useEffect, useState } from "react";
import { API_URL } from "../../config";

function SystemMonitor() {

    const [system, setSystem] = useState(null);

    useEffect(() => {

        fetch(`${API_URL}/system/status`)
        .then(response => response.json())
        .then(data => setSystem(data));
    }, []);

    if (!system) {
        return <p>Loading system information...</p>
    }

    return ( <div>

        <h2>🖥 System Monitor</h2>

        <p>
            Hostname: {system.hostname}
        </p>

        <p>
            CPU Usage: {system.cpu_percent}%
        </p>

        <p>
            Memory Usage: {system.memory_percent}%
        </p>

        <p>
            Disk Usage: {system.disk_percent}%
        </p>

        </div>
    );
}

export default SystemMonitor;