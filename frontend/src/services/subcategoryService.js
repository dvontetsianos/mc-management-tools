import { API_URL } from "../config";


function getAuthHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

export async function getSubcategories(category_id) {

    const url = category_id
        ? `${API_URL}/subcategories?category_id=${category_id}`
        : `${API_URL}/subcategories`;

    const response = await fetch(
        url,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to load subcategories");
    }

    return data;
}


export async function createSubcategory(subcategory_name, category_id) {

    const response = await fetch(
        `${API_URL}/subcategories?subcategory_name=${encodeURIComponent(subcategory_name)}&category_id=${category_id}`,
        {
            method: "POST",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to create subcategory");
    }

    return data;
}


export async function deleteSubcategory(id) {

    const response = await fetch(
        `${API_URL}/subcategories/${id}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to delete subcategory");
    }

    return data;
}