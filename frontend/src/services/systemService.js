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



export async function runBackupNow() {

    const response = await fetch(`${API_URL}/system/backup`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    await handleResponse(response);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.detail || "The backup failed.");
    }

    return data;
}

export async function getSettings() {

    const response = await fetch(`${API_URL}/settings`, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    await handleResponse(response);

    if (!response.ok) {
        throw new Error("Can't load the settings.");
    }

    return await response.json();
}

//Quick Count's top 3 counters of the last 7 days (empty while the switch is off)
//with a departmentId only that department's items count (e.g. on the F&B Items page)
export async function getCountLeaderboard(departmentId = null) {

    const query = departmentId ? `?department_id=${departmentId}` : "";

    const response = await fetch(`${API_URL}/quickcount/leaderboard${query}`, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    await handleResponse(response);

    if (!response.ok) {
        throw new Error("Can't load the leaderboard.");
    }

    return await response.json();
}

export async function updateSettings(changes) {

    const response = await fetch(`${API_URL}/settings`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(changes)
    });

    await handleResponse(response);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.detail || "Can't save the setting.");
    }

    return data;
}