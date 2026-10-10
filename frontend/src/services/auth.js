import { jwtDecode } from "jwt-decode";
import { API_URL } from "../config";



export async function login(username, password) {

    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Login failed");
    }

    return data;
}

export function logout() {
    localStorage.removeItem("token");
}


export function getToken() {
    return localStorage.getItem("token");
}


export function getUser() {
    const token = getToken();

    if (!token) {
        return null;
    }

    try {

        const decoded = jwtDecode(token);

        if (decoded.exp * 1000 < Date.now()) {

            logout();

            return null;
        }

        return decoded;

    } catch (error) {

        logout();
        
        return null;
    }
}

export function hasPermission(permission) {

    const user = getUser();

    if (!user) {
        return false;
    }

    return user.permissions?.includes(permission);
}

//can this user add and edit items (name, category, codes, photo...)? admins always, others with "edit_items_access"
//only decides which buttons are shown: the backend checks it again on every save
export function canEditItems() {

    const user = getUser();

    return user?.role === "admin" || user?.permissions?.includes("edit_items_access");
}


//gets a fresh token (another 15 minutes) after the user did something, e.g. saved a count.
//if it fails (no connection, already expired) nothing changes: the normal expiry logs them out
export async function renewSession() {

    const token = getToken();

    if (!token) {
        return;
    }

    try {

        const response = await fetch(`${API_URL}/refresh-token`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        if (data.access_token) {
            localStorage.setItem("token", data.access_token);
        }
    } catch (error) {

        console.error(error);
    }
}