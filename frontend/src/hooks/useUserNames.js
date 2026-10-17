import { useState, useEffect } from "react";
import { API_URL } from "../config";
import { getToken } from "../services/auth";


//every username with the name to show ("First Last", or the username when no name was filled in)
//loaded once per page load and shared by every page that needs it
let namesPromise = null;

function loadUserNames() {

    if (!namesPromise) {
        namesPromise = fetch(`${API_URL}/users/names`, {
            headers: { Authorization: `Bearer ${getToken()}` }
        })
            .then((response) => (response.ok ? response.json() : {}))
            .catch(() => ({}));
    }

    return namesPromise;
}

//after names are changed on the Users page, the next page asks the server again
export function clearUserNames() {
    namesPromise = null;
}


//nameOf("papadopoulos.g") -> "Giorgos Papadopoulos" (until the names arrive, or for unknown users: the username itself)
export function useUserNames() {

    const [names, setNames] = useState({});

    useEffect(() => {
        let active = true;
        loadUserNames().then((data) => { if (active) setNames(data); });
        return () => { active = false; };
    }, []);

    return (username) => (username ? names[username] || username : username);
}