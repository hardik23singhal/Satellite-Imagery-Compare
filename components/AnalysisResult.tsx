import React, { useEffect, useRef, useState } from 'react';
import type { NewBuilding } from '../types';
import L from 'leaflet';

interface AnalysisResultProps {
  imageUrl: string;
  imageDimensions: { width: number; height: number; };
  buildings: NewBuilding[];
  onReset: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ imageUrl, imageDimensions, buildings, onReset }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerRefs = useRef<{ [key: number]: L.Rectangle }>({});
  const [activeBuilding, setActiveBuilding] = useState<number | null>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const { width, height } = imageDimensions;
      const map = L.map(mapRef.current, {
        crs: L.CRS.Simple,
        minZoom: -5,
        maxZoom: 5,
        center: [height / 2, width / 2],
        zoom: 0,
      });

      const bounds: L.LatLngBoundsExpression = [[0, 0], [height, width]];
      L.imageOverlay(`data:image/jpeg;base64,${imageUrl}`, bounds).addTo(map);

      buildings.forEach((building, index) => {
        const x = building.x / 100 * width;
        const y = building.y / 100 * height;
        const w = building.width / 100 * width;
        const h = building.height / 100 * height;
        const buildingBounds: L.LatLngBoundsExpression = [[y, x], [y + h, x + w]];

        const rectangle = L.rectangle(buildingBounds, {
          color: "#facc15", // yellow-400
          weight: 4,
          fillOpacity: 0.2,
        }).addTo(map);

        rectangle.bindTooltip(`<b>${index + 1}:</b> ${building.description}`);

        rectangle.on('click', () => {
             document.getElementById(`building-item-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
             setActiveBuilding(index);
        });
        
        layerRefs.current[index] = rectangle;
      });

      map.fitBounds(bounds);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [imageUrl, imageDimensions, buildings]);
  
  const handleItemHover = (index: number | null) => {
     setActiveBuilding(index);
     // Reset all styles
     Object.values(layerRefs.current).forEach(layer => layer.setStyle({ color: '#facc15', weight: 4 }));
     // Highlight the active one
     if (index !== null && layerRefs.current[index]) {
         layerRefs.current[index].setStyle({ color: '#38bdf8', weight: 5 }); // cyan-400
         layerRefs.current[index].bringToFront();
     }
  }
  
  const handleItemClick = (index: number) => {
      if (mapInstanceRef.current && layerRefs.current[index]) {
          const layer = layerRefs.current[index];
          mapInstanceRef.current.fitBounds(layer.getBounds().pad(0.2), { animate: true });
      }
  }

  return (
    <div className="w-full h-full bg-gray-800 rounded-xl shadow-2xl flex flex-col md:flex-row">
      <div className="w-full md:w-2/3 h-96 md:h-auto relative">
         <div ref={mapRef} className="w-full h-full rounded-t-xl md:rounded-l-xl md:rounded-r-none" />
      </div>
      <div className="w-full md:w-1/3 p-4 sm:p-6 flex flex-col">
        <div className="flex-shrink-0 mb-4 flex justify-between items-center">
             <h3 className="text-xl font-bold text-cyan-400">Detected Constructions</h3>
             <button
                    onClick={onReset}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                    New Analysis
            </button>
        </div>
        {buildings.length > 0 ? (
          <ul className="space-y-3 overflow-y-auto flex-grow pr-2">
            {buildings.map((building, index) => (
              <li 
                id={`building-item-${index}`}
                key={index} 
                className={`p-3 rounded-lg flex items-start space-x-4 cursor-pointer transition-all duration-200 ${activeBuilding === index ? 'bg-cyan-900/50 ring-2 ring-cyan-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                onMouseEnter={() => handleItemHover(index)}
                onMouseLeave={() => handleItemHover(null)}
                onClick={() => handleItemClick(index)}
                >
                <div className={`flex-shrink-0 w-8 h-8 font-bold rounded-full flex items-center justify-center transition-colors ${activeBuilding === index ? 'bg-cyan-400 text-black' : 'bg-yellow-400 text-black'}`}>
                  {index + 1}
                </div>
                <p className="text-gray-300 flex-1 pt-1">{building.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-gray-400 bg-gray-700 p-4 rounded-lg text-center">
                No new constructions were detected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResult;