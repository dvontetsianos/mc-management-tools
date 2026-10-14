import { getToken } from "./auth";
import { handleResponse } from "./api";
import { API_URL } from "../config";


function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    };
}


//anyone logged in: send a feedback (type + message, the backend adds who sent it)
export async function sendFeedback(feedback) {

    const response = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(feedback)
    });

    await handleResponse(response);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.detail || "Failed to send feedback");
    }

    return data;
}


//admin: every feedback, newest first
export async function getFeedback() {

    const response = await fetch(`${API_URL}/feedback`, {
        headers: authHeaders()
    });

    await handleResponse(response);

    if (!response.ok) {
        throw new Error("Can't load the feedback.");
    }

    return await response.json();
}


//admin: how many are still new (the red dot in the menu)
export async function getNewFeedbackCount() {

    const response = await fetch(`${API_URL}/feedback/new-count`, {
        headers: authHeaders()
    });

    await handleResponse(response);

    if (!response.ok) {
        throw new Error("Can't load the feedback count.");
    }

    const data = await response.json();

    return data.count;
}


//admin: mark one as "new", "seen" or "done"
export async function updateFeedbackStatus(id, status) {

    const response = await fetch(`${API_URL}/feedback/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status })
    });

    await handleResponse(response);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.detail || "Can't change the status.");
    }

    return data;
}