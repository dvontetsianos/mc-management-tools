import { API_URL } from "../config";


function getAuthHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}


export async function getPurchases({
    itemId = null,
    categoryId = null,
    supplierId = null,
    startDate = null,
    endDate = null
} = {}) {

    const params = new URLSearchParams();

    if (itemId) params.append("item_id", itemId);
    if (categoryId) params.append("category_id", categoryId);
    if (supplierId) params.append("supplier_id", supplierId);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const queryString = params.toString();
    const url = `${API_URL}/purchases${queryString ? `?${queryString}` : ""}`;

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