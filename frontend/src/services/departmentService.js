import { API_URL } from "../config";


function getAuthHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

export async function getDepartments() {

    const response = await fetch(
        `${API_URL}/departments`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    );

    return await response.json();

}


export async function createDepartment(name) {

    const response = await fetch(
        `${API_URL}/departments`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ name})
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to create department");
    }

    return data;

}

export async function deleteDepartment(id) {

    const response = await fetch(
        `${API_URL}/departments/${id}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to delete department");
    }

    return data;
    
}