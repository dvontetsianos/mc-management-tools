import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import { ZOOM_PRESETS } from "../hooks/useTableZoom";

function TableZoomToggle({ zoomLevel, onChange }) {
    return (
        <Tooltip title="Adjust table size for this screen">
            <ToggleButtonGroup
                value={zoomLevel}
                exclusive
                size="small"
                onChange={(e, value) => {
                    if (value) {
                        onChange(value);
                    }
                }}
            >
                {Object.entries(ZOOM_PRESETS).map(([key, preset]) => (
                    <ToggleButton key={key} value={key} sx={{ px: 2 }}>
                        {preset.label}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Tooltip>
    );
}

export default TableZoomToggle;