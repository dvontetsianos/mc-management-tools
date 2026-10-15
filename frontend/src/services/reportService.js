import { API_URL } from "../config";


function getAuthHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

}

export async function getSpendReport(startDate = "", endDate = "") {

    const params = new URLSearchParams();

    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const queryString = params.toString();

    const response = await fetch(
        `${API_URL}/reports/spend${queryString ? `?${queryString}` : ""}`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    );

    return await response.json();
}



//the losses report's filters go in the address, e.g. ?year=2026&hotel_id=1
//empty ones are left out, which means "all"
function lossesQuery(filters) {

    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
            params.append(key, value);
        }
    });

    return params.toString();
}


export async function getLossesReport(filters) {

    const response = await fetch(`${API_URL}/reports/losses?${lossesQuery(filters)}`, {
        method: "GET",
        headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to load the losses report");
    }

    return data;
}


//the same report (same filters) as an Excel file
export async function exportLossesReport(filters) {

    const response = await fetch(`${API_URL}/reports/losses/export?${lossesQuery(filters)}`, {
        method: "GET",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error("Failed to export the losses report");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Losses ${filters.year}.xlsx`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
}