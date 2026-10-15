import { API_URL } from "../config";

function getAuthHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
    
}

export async function getLocations(hotelId) {

    const url = hotelId
        ? `${API_URL}/locations?hotel_id=${hotelId}`
        : `${API_URL}/locations`;

    const response = await fetch(
        url,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to load locations");
    }

    return data;

}

export async function createLocation(locationName, hotelId) {

    const params = new URLSearchParams({ location_name: locationName });

    if (hotelId) {
        params.append("hotel_id", hotelId);
    }

    const response = await fetch(
        `${API_URL}/locations?${params.toString()}`,
        {
            method: "POST",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Failed to create location"
        );

    }

    return data;

}


export async function deleteLocation(id) {

    const response = await fetch(
        `${API_URL}/locations/${id}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Failed to delete location"
        );

    }


    return data;

}


export async function renameLocation(id, name) {

    const response = await fetch(`${API_URL}/locations/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name})
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to rename location");
    }

    return data;
}