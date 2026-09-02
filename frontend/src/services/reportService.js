import { API_URL } from "../config";


function getAuthHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

}

export async function getInventoryValueReport() {

    const response = await fetch(
        `${API_URL}/reports/inventory-value`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    );

    return await response.json();
    
}