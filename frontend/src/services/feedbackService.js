import { getToken } from "./auth";
import { handleResponse } from "./api";
import { API_URL } from "../config";





export async function sendFeedback(feedback) {

    const token = getToken();

    const response = await fetch(`${API_URL}/feedback`, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },

        body: JSON.stringify(feedback)
    });

    await handleResponse(response);


    if (!response.ok) {
        throw new Error("Failed to send feedback");
    }

    return await response.json();
}