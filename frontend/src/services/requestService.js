import { API_URL } from "../config";


function getAuthHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

}

export async function getRequests() {

    const response = await fetch(
        `${API_URL}/requests`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    );

    return await response.json();

}

export async function createRequest(requestData) {

    const response = await fetch(
        `${API_URL}/requests`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(requestData)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to create request");
    }

    return data;

}

export async function updateRequestStatus(requestId, status) {

    const response = await fetch(
        `${API_URL}/requests/${requestId}/status`,
        {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to update request");
    }

    return data;

}


export async function deleteRequest(requestId) {

    const response = await fetch(
        `${API_URL}/requests/${requestId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to delete request");
    }

    return data;
}


export async function getPendingRequestCount() {

    const response = await fetch(
        `${API_URL}/requests/pending-count`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    return data.count;
    
}