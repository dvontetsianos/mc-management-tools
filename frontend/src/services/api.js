import { logout } from "./auth";

export async function handleResponse(response) {

    if (response.status === 401) {
        logout();

        window.location.href = "/";

        throw new Error("Session expired");

    }

    return response;
}