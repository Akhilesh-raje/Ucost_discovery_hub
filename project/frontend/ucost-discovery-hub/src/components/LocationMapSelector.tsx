import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, RotateCcw } from 'lucide-react';

// Import the actual map images
import outsideMap from './maps/outside.png';
import groundMap from './maps/ground.png';
import firstFloorMap from './maps/1st-floor.png';

// Debug: Log the imported images
console.log('Map images imported:', { 
  outsideMap: outsideMap ? 'Loaded' : 'Failed', 
  groundMap: groundMap ? 'Loaded' : 'Failed', 
  firstFloorMap: firstFloorMap ? 'Loaded' : 'Failed' 
});

interface LocationData {
  floor: 'outside' | 'ground' | 'first';
  x: number;
  y: number;
}

interface LocationMapSelectorProps {
  selectedLocation: LocationData | null;
  onLocationSelect: (location: LocationData) => void;
  selectedFloor: 'outside' | 'ground' | 'first';
  onFloorChange: (floor: 'outside' | 'ground' | 'first') => void;
}

export function LocationMapSelector({ selectedLocation, onLocationSelect, selectedFloor, onFloorChange }: LocationMapSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Local state to track the current floor being displayed
  const [currentFloor, setCurrentFloor] = useState(selectedFloor);
  
  // Sync local floor state with prop changes
  useEffect(() => {
    setCurrentFloor(selectedFloor);
  }, [selectedFloor]);

  const floorOptions = [
    { value: 'outside', label: 'Outside Area', color: 'bg-green-500' },
    { value: 'ground', label: 'Ground Floor', color: 'bg-blue-500' },
    { value: 'first', label: '1st Floor', color: 'bg-purple-500' },
  ];

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    console.log(`Map clicked at: ${x.toFixed(1)}%, ${y.toFixed(1)}% on ${currentFloor} floor`);
    console.log('Click coordinates:', { clientX: event.clientX, clientY: event.clientY });
    console.log('Container rect:', { left: rect.left, top: rect.top, width: rect.width, height: rect.height });
    
    onLocationSelect({
      floor: currentFloor,
      x,
      y,
    });
  };

  const clearLocation = () => {
    onLocationSelect(null as any);
  };

  const getMapImage = (floor: string) => {
    console.log(`Getting map image for floor: ${floor}`);
    switch (floor) {
      case 'outside':
        return outsideMap;
      case 'ground':
        return groundMap;
      case 'first':
        return firstFloorMap;
      default:
        console.warn(`Unknown floor: ${floor}, defaulting to outside`);
        return outsideMap;
    }
  };

  const getMapContainerStyle = (floor: string) => {
    const style = (() => {
      switch (floor) {
        case 'outside':
          return "w-[800px] h-[500px]"; // Keep outside map unchanged
        case 'ground':
        case 'first':
          return "w-[600px] h-[600px]"; // Bigger square for ground and 1st floor
        default:
          return "w-[600px] h-[600px]";
      }
    })();
    console.log(`Container style for ${floor}: ${style}`);
    return style;
  };


  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base font-semibold">Select Floor & Pin Location *</Label>
        <p className="text-sm text-muted-foreground">
          Choose a floor and click on the map to place the exhibit location pin.
        </p>
        
        {/* Floor Selection and Map Layout */}
        <div className="flex gap-6">
          {/* Floor Selection - Vertical on left */}
          <div className="flex flex-col gap-3">
            {floorOptions.map((option) => (
                              <Button
                  key={option.value}
                  variant={currentFloor === option.value ? "default" : "outline"}
                  onClick={() => {
                    console.log(`Floor changed to: ${option.value}`);
                    setCurrentFloor(option.value as any);
                    onFloorChange(option.value as any);
                  }}
                  className="h-auto p-4 flex flex-col items-center gap-2 w-32"
                >
                <div className={`w-4 h-4 rounded-full ${option.color}`}></div>
                <span className="text-sm">{option.label}</span>
              </Button>
            ))}
          </div>

          {/* Interactive Map */}
          <div className="flex-1">
            <Card className={selectedFloor === 'outside' ? 'w-fit h-fit' : ''}>
              <CardContent className="p-4">
                <div
                  ref={mapRef}
                  className={`${getMapContainerStyle(currentFloor)} cursor-crosshair border-2 border-dashed border-muted-foreground/50 rounded-lg overflow-hidden relative bg-gray-100`}
                  onClick={handleMapClick}
                  style={{ minHeight: '400px' }}
                  onMouseEnter={() => {
                    if (mapRef.current) {
                      const rect = mapRef.current.getBoundingClientRect();
                      console.log('Map container dimensions:', { width: rect.width, height: rect.height });
                    }
                  }}
                >
                  {getMapImage(currentFloor) ? (
                    <img
                      src={getMapImage(currentFloor)}
                      alt={`${currentFloor} floor map`}
                      className="w-full h-full object-contain"
                      onLoad={() => {
                        console.log(`Map loaded: ${currentFloor}`);
                        if (mapRef.current) {
                          const rect = mapRef.current.getBoundingClientRect();
                          console.log('Map loaded, container dimensions:', { width: rect.width, height: rect.height });
                        }
                      }}
                      onError={(e) => {
                        console.error(`Failed to load map: ${currentFloor}`, e);
                        console.error('Image src:', getMapImage(currentFloor));
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <p>Map not available for {currentFloor} floor</p>
                      <p className="text-xs mt-2">Current floor: {currentFloor}</p>
                      <p className="text-xs">Map image: {getMapImage(currentFloor) ? 'Available' : 'Not available'}</p>
                      <p className="text-xs">Debug: {JSON.stringify({ currentFloor, outsideMap: !!outsideMap, groundMap: !!groundMap, firstFloorMap: !!firstFloorMap })}</p>
                      <p className="text-xs">getMapImage result: {getMapImage(currentFloor) ? 'Truthy' : 'Falsy'}</p>
                      <p className="text-xs">Raw values: outsideMap={typeof outsideMap}, groundMap={typeof groundMap}, firstFloorMap={typeof firstFloorMap}</p>
                      <p className="text-xs">getMapImage call: getMapImage('{currentFloor}')</p>
                      <p className="text-xs">getMapImage('outside'): {getMapImage('outside') ? 'Truthy' : 'Falsy'}</p>
                      <p className="text-xs">getMapImage('ground'): {getMapImage('ground') ? 'Truthy' : 'Falsy'}</p>
                      <p className="text-xs">getMapImage('first'): {getMapImage('first') ? 'Truthy' : 'Falsy'}</p>
                      <p className="text-xs">All imports: outsideMap={outsideMap}, groundMap={groundMap}, firstFloorMap={firstFloorMap}</p>
                      <p className="text-xs">getMapImage('outside') === outsideMap: {getMapImage('outside') === outsideMap ? 'Yes' : 'No'}</p>
                      <p className="text-xs">getMapImage('ground') === groundMap: {getMapImage('ground') === groundMap ? 'Yes' : 'No'}</p>
                      <p className="text-xs">getMapImage('first') === firstFloorMap: {getMapImage('first') === firstFloorMap ? 'Yes' : 'No'}</p>
                      <p className="text-xs">getMapImage('outside') === groundMap: {getMapImage('outside') === groundMap ? 'Yes' : 'No'}</p>
                      <p className="text-xs">getMapImage('ground') === outsideMap: {getMapImage('ground') === outsideMap ? 'Yes' : 'No'}</p>
                      <p className="text-xs">getMapImage('first') === outsideMap: {getMapImage('first') === outsideMap ? 'Yes' : 'No'}</p>
                      <p className="text-xs">getMapImage('first') === outsideMap: {getMapImage('first') === outsideMap ? 'Yes' : 'No'}</p>
                      <p className="text-xs">getMapImage('first') === groundMap: {getMapImage('first') === groundMap ? 'Yes' : 'No'}</p>
                      <p className="text-xs">getMapImage('outside') === firstFloorMap: {getMapImage('outside') === firstFloorMap ? 'Yes' : 'No'}</p>
                      <p className="text-xs">getMapImage('ground') === firstFloorMap: {getMapImage('ground') === firstFloorMap ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  
                  {/* Pin location */}
                  {selectedLocation && selectedLocation.floor === currentFloor && (
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-full z-10"
                      style={{
                        left: `${selectedLocation.x}%`,
                        top: `${selectedLocation.y}%`,
                      }}
                    >
                      <MapPin className="w-6 h-6 text-red-500 drop-shadow-lg" fill="currentColor" />
                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {selectedLocation.x.toFixed(1)}%, {selectedLocation.y.toFixed(1)}%
                      </div>
                    </div>
                  )}
                  
                  {/* Instructions overlay */}
                  {!selectedLocation && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                      <div className="text-center">
                        <MapPin className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">Click anywhere to place exhibit location</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Location Info */}
                {selectedLocation && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium">
                          Location: {floorOptions.find(f => f.value === selectedLocation.floor)?.label}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearLocation}
                        className="text-red-500 hover:text-red-700"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}