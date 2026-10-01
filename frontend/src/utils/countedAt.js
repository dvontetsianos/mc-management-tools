//the backend saves count times in utc but without the z at the and
//add z for the local time
export function formatCountedAt(value) {

    if (!value) {
        return"";
    }

    const text = String(value);
    const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(text);
    const date = new Date(hasTimezone ? text : `${text}Z`);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    });
}