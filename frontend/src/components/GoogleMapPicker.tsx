import { useLoadScript, GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const libraries: ("places")[] = ["places"];

interface GoogleMapPickerProps {
  onLocationSelect: (location: {
    name: string;
    address: string;
    city: string;
    coordinates: [number, number];
    place_id?: string;
  }) => void;
  onMarkerClick?: (marker: {
    id: string;
    name: string;
    address: string;
    city: string;
    coordinates: [number, number];
    place_id?: string;
  }) => void;
  height?: string;
}

export function GoogleMapPicker({ onLocationSelect, onMarkerClick, height = "400px" }: GoogleMapPickerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<google.maps.places.PlaceResult | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nearbyChurches, setNearbyChurches] = useState<Array<{
    id: string;
    name: string;
    address: string;
    city: string;
    coordinates: [number, number];
    place_id?: string;
  }>>([]);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  // Default center (world center) - show entire world
  const [center, setCenter] = useState({ lat: 20, lng: 0 });
  const [zoom, setZoom] = useState(2);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  // Show warning if API key is not set
  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && !loadError) {
    console.warn("Google Maps API key not found. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file");
  }

  const fetchNearbyChurches = useCallback((map: google.maps.Map, useTextSearch: boolean = false) => {
    if (!placesServiceRef.current) {
      placesServiceRef.current = new google.maps.places.PlacesService(map);
    }

    setIsLoading(true);

    if (useTextSearch) {
      // Use textSearch for worldwide church search
      const request: google.maps.places.TextSearchRequest = {
        query: 'church',
        type: 'church',
      };

      placesServiceRef.current.textSearch(request, (results, status, pagination) => {
        setIsLoading(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const churches = results.map((place, index) => {
            const address = place.formatted_address || "";
            let city = "";
            
            if (place.address_components) {
              const cityComponent = place.address_components.find(
                (component) =>
                  component.types.includes("locality") ||
                  component.types.includes("administrative_area_level_1")
              );
              if (cityComponent) {
                city = cityComponent.long_name;
              }
            }
            
            if (!city && address) {
              const parts = address.split(",");
              if (parts.length > 1) {
                city = parts[parts.length - 2]?.trim() || "";
              }
            }

            return {
              id: place.place_id || `church-${index}`,
              name: place.name || "Church",
              address: address || "Unknown Address",
              city: city || "Unknown",
              coordinates: [
                place.geometry?.location?.lng() || 0,
                place.geometry?.location?.lat() || 0,
              ] as [number, number],
              place_id: place.place_id,
            };
          });

          setNearbyChurches(prev => {
            // Merge with existing churches, avoiding duplicates
            const existingIds = new Set(prev.map(c => c.id));
            const newChurches = churches.filter(c => !existingIds.has(c.id));
            return [...prev, ...newChurches];
          });

          // If there are more results, fetch next page (limit to avoid too many requests)
          if (pagination && pagination.hasNextPage && results.length > 0) {
            pagination.nextPage();
          }
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          // Don't clear existing churches on zero results for text search
        }
      });
    } else {
      // Use nearbySearch for bounded area
      const bounds = map.getBounds();
      if (!bounds) {
        setIsLoading(false);
        return;
      }

      const request: google.maps.places.PlaceSearchRequest = {
        bounds: bounds,
        type: 'church',
        keyword: 'church',
      };

      placesServiceRef.current.nearbySearch(request, (results, status, pagination) => {
        setIsLoading(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const churches = results.map((place, index) => {
            const address = place.formatted_address || "";
            let city = "";
            
            if (place.address_components) {
              const cityComponent = place.address_components.find(
                (component) =>
                  component.types.includes("locality") ||
                  component.types.includes("administrative_area_level_1")
              );
              if (cityComponent) {
                city = cityComponent.long_name;
              }
            }
            
            if (!city && address) {
              const parts = address.split(",");
              if (parts.length > 1) {
                city = parts[parts.length - 2]?.trim() || "";
              }
            }

            return {
              id: place.place_id || `church-${index}`,
              name: place.name || "Church",
              address: address || "Unknown Address",
              city: city || "Unknown",
              coordinates: [
                place.geometry?.location?.lng() || 0,
                place.geometry?.location?.lat() || 0,
              ] as [number, number],
              place_id: place.place_id,
            };
          });

          setNearbyChurches(prev => {
            // Merge with existing churches, avoiding duplicates
            const existingIds = new Set(prev.map(c => c.id));
            const newChurches = churches.filter(c => !existingIds.has(c.id));
            return [...prev, ...newChurches];
          });

          // If there are more results, fetch next page
          if (pagination && pagination.hasNextPage) {
            pagination.nextPage();
          }
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          // Only clear if we're doing a bounded search and got zero results
          const currentZoom = map.getZoom();
          if (currentZoom && currentZoom >= 10) {
            // Keep existing churches if zoomed in
          }
        }
      });
    }
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    // Set map bounds to show entire world
    setTimeout(() => {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: -85, lng: -180 });
      bounds.extend({ lat: 85, lng: 180 });
      map.fitBounds(bounds);
      // Set minimum zoom to show world view
      map.setOptions({
        minZoom: 2,
        maxZoom: 20,
      });
      
      // Fetch initial churches using textSearch (worldwide)
      fetchNearbyChurches(map, true);
      
      // Fetch churches when map bounds change (for zoomed in views)
      map.addListener('bounds_changed', () => {
        const currentZoom = map.getZoom();
        if (currentZoom && currentZoom >= 10) {
          // Use nearbySearch for zoomed in views
          fetchNearbyChurches(map, false);
        }
        // Don't clear churches when zoomed out - keep the initial results
      });
    }, 100);
  }, [fetchNearbyChurches]);

  const onPlaceChanged = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        setSelectedLocation(place);
        setCenter({ lat, lng });
        setZoom(15);
        
        // Extract address components
        let address = "";
        let city = "";
        
        if (place.formatted_address) {
          address = place.formatted_address;
        }
        
        if (place.address_components) {
          const cityComponent = place.address_components.find(
            (component) =>
              component.types.includes("locality") ||
              component.types.includes("administrative_area_level_1")
          );
          if (cityComponent) {
            city = cityComponent.long_name;
          }
        }
        
        // If no city found, try to extract from formatted address
        if (!city && address) {
          const parts = address.split(",");
          if (parts.length > 1) {
            city = parts[parts.length - 2]?.trim() || "";
          }
        }
        
        onLocationSelect({
          name: place.name || "Selected Location",
          address: address || place.name || "",
          city: city || "Unknown",
          coordinates: [lng, lat], // [longitude, latitude]
          place_id: place.place_id,
        });

        // Fetch nearby churches after selecting a location
        if (map) {
          setTimeout(() => {
            fetchNearbyChurches(map);
          }, 500);
        }
      }
    }
  }, [onLocationSelect, map, fetchNearbyChurches]);

  const onAutocompleteLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
    // Restrict search to churches only
    autocomplete.setTypes(['church', 'place_of_worship']);
    autocomplete.addListener("place_changed", onPlaceChanged);
  }, [onPlaceChanged]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      setIsLoading(true);
      
      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        setIsLoading(false);
        
        if (status === "OK" && results && results[0]) {
          const result = results[0];
          const address = result.formatted_address || "";
          let city = "";
          
          if (result.address_components) {
            const cityComponent = result.address_components.find(
              (component) =>
                component.types.includes("locality") ||
                component.types.includes("administrative_area_level_1")
            );
            if (cityComponent) {
              city = cityComponent.long_name;
            }
          }
          
          if (!city && address) {
            const parts = address.split(",");
            if (parts.length > 1) {
              city = parts[parts.length - 2]?.trim() || "";
            }
          }
          
          onLocationSelect({
            name: result.formatted_address || "Selected Location",
            address: address || "Unknown Address",
            city: city || "Unknown",
            coordinates: [lng, lat],
            place_id: result.place_id,
          });
          
          setCenter({ lat, lng });
          setZoom(15);
          
          // Fetch nearby churches after clicking
          if (map) {
            setTimeout(() => {
              fetchNearbyChurches(map);
            }, 500);
          }
        } else {
          // Fallback if geocoding fails
          onLocationSelect({
            name: "Selected Location",
            address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
            city: "Unknown",
            coordinates: [lng, lat],
          });
          setCenter({ lat, lng });
          setZoom(15);
        }
      });
    }
  }, [onLocationSelect, map, fetchNearbyChurches]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center p-8 border border-border rounded-lg">
        <p className="text-destructive">Error loading Google Maps. Please check your API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8 border border-border rounded-lg" style={{ height }}>
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Autocomplete 
          onLoad={onAutocompleteLoad} 
          onPlaceChanged={onPlaceChanged}
          options={{
            types: ['church', 'place_of_worship'],
          }}
        >
          <Input
            placeholder="Search for churches only..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full"
          />
        </Autocomplete>
      </div>
      
      <div className="relative border border-border rounded-lg overflow-hidden" style={{ height }}>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={zoom}
          onLoad={onMapLoad}
          onClick={handleMapClick}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
            minZoom: 2,
            maxZoom: 20,
            restriction: {
              latLngBounds: {
                north: 85,
                south: -85,
                west: -180,
                east: 180,
              },
              strictBounds: false,
            },
          }}
        >
          {/* Show selected location marker */}
          {selectedLocation?.geometry?.location && (
            <Marker
              position={{
                lat: selectedLocation.geometry.location.lat(),
                lng: selectedLocation.geometry.location.lng(),
              }}
              title={selectedLocation.name || "Selected Location"}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
              }}
            />
          )}
          
          {/* Show nearby churches from Google Places */}
          {nearbyChurches.map((church) => (
            <Marker
              key={church.id}
              position={{
                lat: church.coordinates[1],
                lng: church.coordinates[0],
              }}
              title={church.name}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              }}
              onClick={async () => {
                if (onMarkerClick && church.place_id && placesServiceRef.current) {
                  setIsLoading(true);
                  
                  // Fetch full place details using place_id
                  const request: google.maps.places.PlaceDetailsRequest = {
                    placeId: church.place_id,
                    fields: ['name', 'formatted_address', 'address_components', 'geometry', 'place_id'],
                  };

                  placesServiceRef.current.getDetails(request, (place, status) => {
                    setIsLoading(false);
                    
                    if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                      const lat = place.geometry?.location?.lat() || church.coordinates[1];
                      const lng = place.geometry?.location?.lng() || church.coordinates[0];
                      
                      const address = place.formatted_address || church.address || "";
                      let city = "";
                      
                      // Extract city from address_components
                      if (place.address_components) {
                        // Try to find locality first
                        const localityComponent = place.address_components.find(
                          (component) => component.types.includes("locality")
                        );
                        
                        // If no locality, try administrative_area_level_2 (district)
                        const districtComponent = place.address_components.find(
                          (component) => component.types.includes("administrative_area_level_2")
                        );
                        
                        // If still no city, try administrative_area_level_1 (state/province)
                        const stateComponent = place.address_components.find(
                          (component) => component.types.includes("administrative_area_level_1")
                        );
                        
                        if (localityComponent) {
                          city = localityComponent.long_name;
                        } else if (districtComponent) {
                          city = districtComponent.long_name;
                        } else if (stateComponent) {
                          city = stateComponent.long_name;
                        }
                      }
                      
                      // Fallback: extract from formatted address
                      if (!city && address) {
                        const parts = address.split(",");
                        if (parts.length > 1) {
                          // Usually city is second to last part
                          city = parts[parts.length - 2]?.trim() || parts[parts.length - 3]?.trim() || "";
                        }
                      }
                      
                      onMarkerClick({
                        id: church.id,
                        name: place.name || church.name,
                        address: address || "Unknown Address",
                        city: city || "Unknown",
                        coordinates: [lng, lat],
                        place_id: place.place_id || church.place_id,
                      });
                      
                      // Update map center
                      setCenter({ lat, lng });
                      setZoom(15);
                    } else {
                      // Fallback to existing church data if details fetch fails
                      onMarkerClick(church);
                    }
                  });
                } else if (onMarkerClick) {
                  // Fallback if no place_id or placesService not available
                  onMarkerClick(church);
                }
              }}
            />
          ))}
        </GoogleMap>
        
        {isLoading && (
          <div className="absolute top-2 right-2 bg-background/80 p-2 rounded">
            <Loader2 className="w-4 h-4 animate-spin text-accent" />
          </div>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground">
        Search for churches or zoom in to see nearby churches. Click on blue markers to select a church.
      </p>
    </div>
  );
}

