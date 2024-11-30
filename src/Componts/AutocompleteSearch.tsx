import { useEffect, useState, useCallback } from 'react'
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useHubLocation } from '@/contexts/useHubLoc'

interface Props {
    onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
    mapInstanceReq: boolean;
    mapId: string;
    attributionDiv: React.RefObject<HTMLDivElement>;
}

export function PlaceSearch({ onPlaceSelect, mapInstanceReq, attributionDiv, mapId }: Props) {

    const map = useMap(mapId)
    const { selectedHub } = useHubLocation()
    const places = useMapsLibrary('places')

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState<string>("")

    const [sessionToken, setSessionToken] = useState<google.maps.places.AutocompleteSessionToken | null>(null)
    const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null)
    const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null)
    const [predictionResults, setPredictionResults] = useState<Array<google.maps.places.AutocompletePrediction>>([])
    const [fetchingData, setFetchingData] = useState<boolean>(false)

    useEffect(() => {
        if (!places) return
        try {
            setAutocompleteService(new places.AutocompleteService())

            if (mapInstanceReq) {
                if (map) {
                    setPlacesService(new places.PlacesService(map))
                }
            } else {
                if (attributionDiv.current) {
                    setPlacesService(new places.PlacesService(attributionDiv.current))
                }
            }

            setSessionToken(new places.AutocompleteSessionToken())
        } catch (error) {
            console.error('Error initializing Google Maps services:', error)
        }

        return () => {
            setAutocompleteService(null)
            setPlacesService(null)
            setSessionToken(null)
        }
    }, [map, places])

    const fetchPredictions = useCallback(async (inputValue: string) => {
        if (!autocompleteService || !sessionToken || !inputValue) {
            setPredictionResults([])
            return
        }

        setFetchingData(true)

        try {
            const request = {
                input: inputValue, sessionToken,
                locationBias: selectedHub?.cordinateCenter,
                region: "tz",
                componentRestrictions: { country: ["tz"] },
            }
            const response = await autocompleteService.getPlacePredictions(request)
            setPredictionResults(response.predictions || [])
        } catch (error) {
            console.error('Error fetching predictions:', error)
            setPredictionResults([])
        } finally {
            setFetchingData(false)
        }
    }, [autocompleteService, sessionToken])

    const onInputChange = useCallback((newValue: string) => {
        setValue(newValue)
        if (newValue.trim()) {
            fetchPredictions(newValue)
        } else {
            setPredictionResults([])
        }
    }, [fetchPredictions])

    const onSelect = useCallback((placeId: string) => {
        if (!places || !placesService || !sessionToken) return
        setFetchingData(true)
        const detailRequestOptions = {
            placeId: placeId,
            fields: ['geometry', 'name', 'formatted_address'],
            sessionToken,
        }

        placesService.getDetails(detailRequestOptions, (placeDetails, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && placeDetails) {
                onPlaceSelect(placeDetails)
                setValue(placeDetails.name || '')
                setSessionToken(new places.AutocompleteSessionToken())
            } else {
                console.error('Error fetching place details:', status)
                onPlaceSelect(null)
            }
            setOpen(false)
            setFetchingData(false)
        })
    }, [onPlaceSelect, places, placesService, sessionToken])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value || "Search for a place..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput
                        placeholder="Search for a place..."
                        value={value}
                        onValueChange={onInputChange}
                    />
                    <CommandEmpty>{fetchingData ? "Loading..." : "No places found."}</CommandEmpty>
                    <CommandGroup>
                        <CommandList>
                            {predictionResults.map((result) => (
                                <CommandItem
                                    key={result.place_id}
                                    value={result.description}
                                    onSelect={() => onSelect(result.place_id)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === result.description ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {result.description}
                                </CommandItem>
                            ))}
                        </CommandList>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}