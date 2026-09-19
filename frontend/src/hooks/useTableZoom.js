import { useState,  useEffect } from "react";

export const ZOOM_PRESETS = {
    small: { label: "Small", zoom: 0.55 },
    medium: { label: "Medium", zoom: 0.8 },
    large: { label: "Large", zoom: 1 }
};


const STORAGE_KEY = "mc_table_zoom";
const DEFAULT_ZOOM = "medium";


export function useTableZoom() {

    const [zoomLevel, setZoomLevel] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored && ZOOM_PRESETS[stored] ? stored : DEFAULT_ZOOM;
        } catch {
            return DEFAULT_ZOOM;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, zoomLevel);
        } catch {
            // localStorage unavailable - ignore
        }
    }, [zoomLevel]);

    return [zoomLevel, setZoomLevel];
}