import React, { createContext, useState, useContext, ReactNode } from "react";

type MyLatLng = google.maps.LatLngLiteral;

interface RegionLocation {
    regionName: string;
    cordinateCenter: MyLatLng;
}

interface HubLocations {
    regionLocations: RegionLocation[];
    selectedHub: RegionLocation | null;
    selectHub: (regionName: string) => void;
}

const HubLocationContext = createContext<HubLocations | undefined>(undefined);

const initialHubLocations: RegionLocation[] = [
    {
        regionName: "Arusha",
        cordinateCenter: { lat: -3.3721577222131813, lng: 36.694529011016684 },
    },
];

interface HubLocationProviderProps {
    children: ReactNode;
}

export const HubLocationProvider: React.FC<HubLocationProviderProps> = ({
    children,
}) => {
    const [regionLocations] = useState<RegionLocation[]>(initialHubLocations);

    const [selectedHub, setSelectedHub] = useState<RegionLocation | null>(null);
    const selectHub = (regionName: string) => {
        const hub = regionLocations.find(
            (location) => location.regionName === regionName
        );
        if (hub) {
            setSelectedHub(hub);
        } else {
            console.warn(`Hub with region name "${regionName}" not found.`);
        }
    };
    return (
        <HubLocationContext.Provider
            value={{ regionLocations, selectedHub, selectHub }}
        >
            {children}
        </HubLocationContext.Provider>
    );
};

export const useHubLocation = (): HubLocations => {
    const context = useContext(HubLocationContext);
    if (!context) {
        throw new Error("useHubLocation must be used within a HubLocationProvider");
    }
    return context;
};
