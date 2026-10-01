import { API_URL } from "../config";
import { handleResponse } from "./api";


function getAuthHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

}

export async function getHistory() {

    const response = await fetch(
        `${API_URL}/history`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    );

    await handleResponse(response);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to load history");
    }

    return data;
    
}