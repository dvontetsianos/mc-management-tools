import { API_URL } from "../config";


function getAuthHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

}


export async function getItemMovements({
    itemId = null,
    locationId = null,
    startDate = null,
    endDate = null
} = {}) {

    const params = new URLSearchParams();

    if (itemId) params.append("item_id", itemId);
    if (locationId) params.append("location_id", locationId);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const queryString = params.toString();
    const url = `${API_URL}/item-movements${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders()
    });

    return await response.json();
}


export async function createItemMovement(movement) {

    const response = await fetch(`${API_URL}/item-movements`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(movement)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to move item");
    }

    return data;
}