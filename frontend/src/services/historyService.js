import { API_URL } from "../config";


function getAuthHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

}

export async function getHistory() {

    const response = await fetch(
        `${API_URL}/history`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    );

    return await response.json();
    
}