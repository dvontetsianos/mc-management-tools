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

    return await response.json();

}


export async function createSupplier(supplierName) {

    const response = await fetch(
        `${API_URL}/suppliers?supplier_name=${encodeURIComponent(supplierName)}`,
        {
            method: "POST",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Failed to create supplier"
        );
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