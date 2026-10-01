import { API_URL } from "../config";

function getAuthHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

}

export async function getHotels() {

    const response = await fetch(
        `${API_URL}/hotels`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to load hotels");
    }

    return data;
}


export async function createHotel(hotelName) {

    const response = await fetch(
        `${API_URL}/hotels?hotel_name=${encodeURIComponent(hotelName)}`,
        {
            method: "POST",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Failed to create hotel"
        );
    }

    return data;
}


export async function deleteHotel(id) {

    const response = await fetch(
        `${API_URL}/hotels/${id}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Failed to delete hotel"
        );
    }

    return data;
}