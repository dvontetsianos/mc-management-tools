import { API_URL } from "../config";


function getAuthHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

}


export async function getSuppliers() {

    const response = await fetch(
        `${API_URL}/suppliers`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to load suppliers");
    }

    return data;

}


//a new supplier: its name and the hotels it delivers to (a list of hotel ids)
export async function createSupplier(name, hotelIds = []) {

    const response = await fetch(`${API_URL}/suppliers`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, hotel_ids: hotelIds })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to create supplier");
    }

    return data;
}


//rename a supplier and/or change its hotels
export async function updateSupplier(id, name, hotelIds) {

    const response = await fetch(`${API_URL}/suppliers/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, hotel_ids: hotelIds })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to save supplier");
    }

    return data;
}


export async function deleteSupplier(id) {

    const response = await fetch(
        `${API_URL}/suppliers/${id}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Failed to delete supplier"
        );
    }

    return data;
}