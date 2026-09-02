import { API_URL } from "../config";


function getAuthHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

export async function getCategories() {

    const response = await fetch(
        `${API_URL}/categories`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    );

    return await response.json();

}

export async function createCategory(category_name) {

    const response = await fetch(
        `${API_URL}/categories?category_name=${encodeURIComponent(category_name)}`,
        {
            method: "POST",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to create category");
    }

    return data;

}

export async function deleteCategory(id) {

    const response = await fetch(
        `${API_URL}/categories/${id}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to delete category");
    }

    return data;
    
}