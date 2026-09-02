import { API_URL } from "../config";

export async function previewExcel(file, sheetName = "") {
    const formData = new FormData();

    formData.append("file", file);

    if (sheetName) {
        formData.append("sheet_name", sheetName);
    }

    const response = await fetch(`${API_URL}/excel/preview`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to preview workbook.");
    }

    return data;
}