import { useState, useEffect } from "react";
import { getMyPreferences, saveMyPreference } from "../services/preferenceService";
import { DEFAULT_HIDDEN_COLUMNS } from "../utils/itemFields";


//the table column this user has hidden on one page, saved on their account(never affects other users)
//   tableName: e.g. "Housekeeping", so every page keeps its own choice
export function useHiddenColumns(tableName) {

    const key = `hidden_columns:${tableName}`;

    const [hiddenColumns, setHiddenColumns] = useState(DEFAULT_HIDDEN_COLUMNS);

    //load this user's choice once, when the page opens
    useEffect(() => {
        getMyPreferences()
            .then((preferences) => setHiddenColumns(preferences[key] ?? DEFAULT_HIDDEN_COLUMNS))
            .catch((error) => console.error("LOAD COLUMN ERROR:", error));
    }, [key]);

    //show the change straight away, and save it in the background
    const changeHiddenColumns = (columns) => {
        setHiddenColumns(columns);

        saveMyPreference(key, columns)
            .catch((error) => console.error("SAVE COLUMNS ERROR:", error));
    };

    return [hiddenColumns, changeHiddenColumns];
}