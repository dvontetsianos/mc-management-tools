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