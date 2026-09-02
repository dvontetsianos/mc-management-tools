import { getToken } from "./auth";
import { API_URL } from "../config";


export async function getUsers() {

    const token = getToken();

    const response = await fetch(`${API_URL}/users`, {

        headers: {
            "Authorization": `Bearer ${token}`
        }

    });

    if (!response.ok) {
        throw new Error("Failed to fetch users");
    }

    return await response.json();

}

export async function createUser(userData) {

    const token = getToken();

    const response = await fetch(`${API_URL}/users`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },

        body: JSON.stringify(userData)

    });


    if (!response.ok) {
        throw new Error("Failed to create user");
    }

    return await response.json();
    
}

export async function deleteUser(userId) {

    const token = getToken();

    const response = await fetch(
        `${API_URL}/users/${userId}`,
        {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );


    if (!response.ok) {
        throw new Error("Failed to delete user");
    }

    return await response.json();
    
}


export async function changeUserPassword(userId, password) {

    const token = getToken();

    const response = await fetch(
        `${API_URL}/users/${userId}/password`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify({
                password: password
            })
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update password");
    }

    return await response.json();
}


export async function updateUserPermissions(userId, permissions) {

    const token = getToken();

    const response = await fetch(
        `${API_URL}/users/${userId}/permissions`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                permissions: permissions
            })
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update permissions");
    }

    return await response.json();
}



export async function updateUserDepartment(userId, departments) {

    const token = getToken();

    const response = await fetch(
        `${API_URL}/users/${userId}/department`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                department_id: departmentId
            })
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update department");
    }

    return await response.json();
    
}