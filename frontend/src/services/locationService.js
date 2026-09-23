import { API_URL } from "../config";

function getAuthHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
    
}

export async function getLocations() {

    const response = await fetch(
        `${API_URL}/locations`,
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

export async function createLocation(locationName) {

    const response = await fetch(
        `${API_URL}/locations?location_name=${encodeURIComponent(locationName)}`,
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