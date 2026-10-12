import { API_URL } from "../config";
import { getToken } from "./auth";
import { handleResponse } from "./api";


//every number for the dashboard tiles in one call (only what this user is allowed to see)
export async function getDashboard() {

    const response = await fetch(`${API_URL}/dashboard`, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    await handleResponse(response);

    if (!response.ok) {
        throw new Error("Can't load the dashboard.");
    }

    return await response.json();
    
}