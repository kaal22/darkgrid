// Satellite icon SVG builder and mission-type mappings
// Extracted from MaplibreViewer.tsx — pure data, no JSX

export const makeSatSvg = (color: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <rect x="9" y="9" width="6" height="6" rx="1" fill="${color}" stroke="#0a0e1a" stroke-width="0.5"/>
        <rect x="1" y="10" width="7" height="4" rx="1" fill="${color}" opacity="0.7" stroke="#0a0e1a" stroke-width="0.3"/>
        <rect x="16" y="10" width="7" height="4" rx="1" fill="${color}" opacity="0.7" stroke="#0a0e1a" stroke-width="0.3"/>
        <line x1="8" y1="12" x2="1" y2="12" stroke="${color}" stroke-width="0.8"/>
        <line x1="16" y1="12" x2="23" y2="12" stroke="${color}" stroke-width="0.8"/>
        <circle cx="12" cy="12" r="1.5" fill="#fff" opacity="0.8"/>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};

export const MISSION_COLORS: Record<string, string> = {
    'military_recon': '#ff3333', 'military_sar': '#ff3333',
    'sar': '#00e5ff', 'sigint': '#ffffff',
    'navigation': '#4488ff', 'early_warning': '#ff00ff',
    'commercial_imaging': '#44ff44', 'space_station': '#ffdd00'
};

export const MISSION_ICON_MAP: Record<string, string> = {
    'military_recon': 'sat-mil', 'military_sar': 'sat-mil',
    'sar': 'sat-sar', 'sigint': 'sat-sigint',
    'navigation': 'sat-nav', 'early_warning': 'sat-ew',
    'commercial_imaging': 'sat-com', 'space_station': 'sat-station'
};
