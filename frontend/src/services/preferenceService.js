import { API_URL } from "../config";


function getAuthHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}


//all of the logged-in user's own view settings, e.g. { "hidden_columns:Housekeeping": ["image"] }
export async function getMyPreferences() {

    const response = await fetch(`${API_URL}/me/preferences`, {
        method: "GET",
        headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to load your settings");
    }

    return data;
}


//saves one setting for the logged-in user only
export async function saveMyPreference(key, value) {

    const response = await fetch(`${API_URL}/me/preferences`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ key, value })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to save your setting");
    }

    return data;
}