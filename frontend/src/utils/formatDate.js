// one place for how dates look in the whole app: 05/10/2026 14:35
//the same on every PC, phone and PDA, whatever language the browser is set to


const pad = (number) => String(number).padStart(2, "0");


//most times from the backend are saved in UTC but without the Z at the end,
//so we add it, and the browser shows them in local greek time
function fromUtc(value) {

    if (value === null || value === undefined || value === "") {
        return null;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    const text = String(value).trim().replace(" ", "T");
    const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(text);
    const date = new Date(hasTimezone ? text : `${text}Z`);

    return Number.isNaN(date.getTime()) ? null : date;
}


// a few times (System Monitor, the login log) are already the server's local time: no Z added
function fromLocal(value) {

    if (value === null || value === undefined || value === "") {
        return null;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    const date = new Date(String(value).trim().replace(" ", "T"));

    return Number.isNaN(date.getTime()) ? null : date;
}


function dateText(date) {
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}


function timeText(date) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}


//05/10/2026 14:34
export function formatDateTime(value) {
    const date = fromUtc(value);
    return date ? `${dateText(date)} ${timeText(date)}` : "-";
}


//05/10/2026
export function formatDateOnly(value) {
    const date = fromUtc(value);
    return date ? dateText(date) : "-";
}


//05/10/2026 14:34, for times that are already in the server's local time
export function formatLocalDateTime(value) {
    const date = fromLocal(value);
    return date ? `${dateText(date)} ${timeText(date)}` : "-";
}