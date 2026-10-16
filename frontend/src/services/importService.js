import { API_URL } from "../config";


function authHeader() {

    return {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    };
}


//the empty Excel template (one sheet per department), saved as a file
export async function downloadImportTemplate() {

    const response = await fetch(`${API_URL}/item-import/template`, {
        method: "GET",
        headers: authHeader()
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to download the template");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "Import Items template.xlsx";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
}


//sends the file, path says what to do with it: check only, or import
async function sendImportFile(path, file, failMessage) {

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: authHeader(),
        body: formData
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.detail || failMessage);
    }

    return data;
}


//what would happen, nothing is saved
export function checkImportFile(file) {
    return sendImportFile("/item-import/check", file, "Failed to read the file");
}


//adds the new items of the file
export function importItems(file) {
    return sendImportFile("/item-import", file, "Failed to import the items");
}