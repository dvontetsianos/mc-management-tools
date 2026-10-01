import { API_URL } from "../config";
import { handleResponse } from "./api";


function getAuthHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

}

export async function getLostFoundItems() {

    const response = await fetch(
        `${API_URL}/lost-found`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    );

    await handleResponse(response);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to load lost & found items")
    }

    return data;

}

export async function createLostFoundItem(item) {

    const response = await fetch(
        `${API_URL}/lost-found`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(item)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to create item");
    }

    return data;

}


export async function claimLostFoundItem(itemId, claimedBy) {

    const response = await fetch(
        `${API_URL}/lost-found/${itemId}/claim`,
        {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ claimed_by: claimedBy })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to claim item");
    }

    return data;

}


export async function unclaimLostFoundItem(itemId) {

    const response = await fetch(
        `${API_URL}/lost-found/${itemId}/unclaim`,
        {
            method: "PUT",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to unclaim item");
    }

    return data;
    
}


export async function deleteLostFoundItem(itemId) {

    const response = await fetch(
        `${API_URL}/lost-found/${itemId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to delete item");
    }

    return data;
}