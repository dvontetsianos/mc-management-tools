import { API_URL } from "../config";


function getAuthHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

export async function getAssets() {

    const response = await fetch(`${API_URL}/assets`, {
        method: "GET",
        headers: getAuthHeaders()
    });

    return await response.json();

}


export async function createAsset(asset) {

    const response = await fetch(`${API_URL}/assets`, {
        method: "POST",

        headers: getAuthHeaders(),

        body: JSON.stringify(asset)

    });

    const data = await response.json();

    if (!response.ok) {
        throw Error(data.detail || "Failed to create asset");
    }

    return data;
}


export async function updateAsset(id, asset) {

    const response = await fetch(`${API_URL}/assets/${id}`, {
        method: "PUT",

        headers: getAuthHeaders(),

        body: JSON.stringify(asset)

    });

    return await response.json();
}


export async function deleteAsset(id) {

    const response = await fetch(`${API_URL}/assets/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });

    return response;


}


export async function exportAssets(assets, searchTerm = "") {

    const response = await fetch(`${API_URL}/assets/export`, {
        method: "POST",

        headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json"
        },

        body: JSON.stringify(assets)

    });

    if (!response.ok) {
        throw new Error("Failed to export assets");
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    const safeName = searchTerm.trim()
        ? searchTerm.trim().replace(/[\\/:*?"<>|]/g, "")
        : "";

    const filename = safeName ? `FB_Assets(${safeName}).xlsx` : "FB_Assets.xlsx";

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
    
}


export async function getCategories() {

    const response = await fetch(`${API_URL}/categories`, {
        method: "GET",
        headers: getAuthHeaders()
    });

    return await response.json();
    
}


export async function uploadAssetImage(id, file) {

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
        `${API_URL}/assets/${id}/image`,
        {
            method: "POST",

            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },

            body: formData
        });

    const data = await response.json();

    if (!response.ok) {

        throw new Error(
            JSON.stringify(data.detail) || "Failed to upload image"
        );
    }

    return data;

}


export async function deleteAssetImage(id) {

    const response = await fetch(`${API_URL}/assets/${id}/image`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error("Failed to remove image");
    }

    return await response.json();
}