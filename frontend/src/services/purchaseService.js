import { API_URL } from "../config";


function getAuthHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}


export async function getPurchases(itemId = null) {

    const url = itemId
        ? `${API_URL}/purchases?item_id=${itemId}`
        : `${API_URL}/purchases`;

    
    const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders()
    });

    return await response.json();

}


export async function createPurchase(purchase) {

    const response = await fetch(`${API_URL}/purchases`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(purchase)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to log purchase");
    }

    return data;
}


export async function deletePurchase(id) {

    const response = await fetch(`${API_URL}/purchases/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to delete purchase");
    }

    return await response.json();
    
}