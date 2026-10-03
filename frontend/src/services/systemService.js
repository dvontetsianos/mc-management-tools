import { API_URL } from "../config";
import { getToken } from "./auth";
import { handleResponse } from "./api";

export async function getSystemStatus() {

    const response = await fetch(`${API_URL}/system/status`, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    await handleResponse(response);

    if (!response.ok) {
        throw new Error("Can't load the server status.");
    }

    return await response.json();
}