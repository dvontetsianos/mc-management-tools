//if .env.local sets an address (laptop / phone app), use it; otherwise use the address the page was opened from (server)
export const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

export const PRODUCT_NAME = "MC Management Tools"; 

export const APP_TITLE = PRODUCT_NAME;