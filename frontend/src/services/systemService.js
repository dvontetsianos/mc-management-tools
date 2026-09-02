import { API_URL } from "../config";

export async function getSystemStatus() {
    const response = await fetch(
        `${API_URL}/system/status`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch system status");
    }

    return await response.json();

}