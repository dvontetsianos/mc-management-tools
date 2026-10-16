import { useState, useEffect } from "react";


//like useState, but the value survives a refresh (F5) of the page
//it's kept for this browser tab only: closing the tab (or the browser) starts clean
export function usePageState(key, initialValue) {

    const [value, setValue] = useState(() => {
        try {
            const saved = sessionStorage.getItem(key);
            return saved !== null ? JSON.parse(saved) : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch {
            // sessionStorage unavailable - the page still works, it just doesn't remember
        }
    }, [key, value]);

    return [value, setValue];
}