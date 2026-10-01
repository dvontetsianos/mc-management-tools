import { API_URL } from "../config";


function getAuthHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}


export async function getItems(department_id, hotel_ids = []) {

    //department and hotel filter go in the address, e.g. /items?department_id=2&hotel_ids=1,3
    const params = new URLSearchParams();

    if (department_id) {
        params.append("department_id", department_id);
    }

    if (hotel_ids.length > 0) {
        params.append("hotel_ids", hotel_ids.join(","));
    }

    const query = params.toString();

    const url = query
        ? `${API_URL}/items?${query}`
        : `${API_URL}/items`;


    const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to load items");
    }

    return data;
    
}


export async function exportItems(items, searchTerm = "") {

    const response = await fetch(`${API_URL}/items/export`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(items)
    });

    if (!response.ok) {
        throw new Error("Failed to export items");
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    const safeName = searchTerm.trim()
        ? searchTerm.trim().replace(/[\\/:*?"<>|]/g, "")
        : "";

    const filename = safeName ? `Items(${safeName}).xlsx` : "Items.xlsx";

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
    
}


export async function createItem(item) {

    const response = await fetch(`${API_URL}/items`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(item)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to create item");
    }

    return data;
}


export async function updateItem(id, item) {

    const response = await fetch(`${API_URL}/items/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(item)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to update item");
    }

    return data;

}


export async function deleteItem(id) {

    const response = await fetch(`${API_URL}/items/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });


    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to delete item");
    }


    return await response.json();
}

//admin only: deletes the item and ALL its history (purchases, movements, stock per location, History lines)
export async function deleteItemWithHistory(id) {

    const response = await fetch(`${API_URL}/items/${id}/with-history`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to delete item");
    }

    return data;
}


export async function uploadItemImage(id, file) {

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
        `${API_URL}/items/${id}/image`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },

            body: formData
        }
    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(
            data.detail || "Failed to upload image"
        );
    }

    return data;

}



export async function deleteItemImage(id) {

    const response = await fetch(`${API_URL}/items/${id}/image`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error("Failed to remove image");
    }

    return await response.json();

}



export async function getItemLocations() {

    const response = await fetch(`${API_URL}/item-locations`, {
        method: "GET",
        headers: getAuthHeaders()
    });

    return await response.json();

}


export async function createItemLocation(itemLocation) {

    const response = await fetch(`${API_URL}/item-locations`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(itemLocation)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to assign item to location");
    }

    return data;
}


export async function updateItemLocation(id, itemLocation) {

    const response = await fetch(`${API_URL}/item-locations/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(itemLocation)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to update quantity");
    }

    return data;

}

export async function submitItemLocationCount(id, countedQuantity, previousCountedAt = null) {

    //previous_counted_at = the count time this page saw when it opened,
    //so the backend can refuse if someone else saved in the meantime
    const response = await fetch(`${API_URL}/item-locations/${id}/count`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            counted_quantity: countedQuantity,
            previous_counted_at: previousCountedAt
        })
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.detail || "Failed to submit count");
        error.status = response.status;
        throw error;
    }

    return data;

}


export async function dismissItemLocationCount(id) {

    const response = await fetch(`${API_URL}/item-locations/${id}/dismiss-count`, {
        method: "POST",
        headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to dismiss count");
    }

    return data;

}


export async function deleteItemLocation(id) {

    const response = await fetch(`${API_URL}/item-locations/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to remove item from location");
    }

    return await response.json();

}