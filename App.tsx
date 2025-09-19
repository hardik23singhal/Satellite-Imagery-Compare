import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';
import { analyzeImagesForNewConstruction } from './services/geminiService';
import type { NewBuilding } from './types';

const App: React.FC = () => {
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [afterImageDimensions, setAfterImageDimensions] = useState<{width: number; height: number;} | null>(null);
  const [results, setResults] = useState<NewBuilding[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSetAfterImage = useCallback((base64: string) => {
    setAfterImage(base64);
    const img = new Image();
    img.onload = () => {
        setAfterImageDimensions({ width: img.width, height: img.height });
    };
    img.src = `data:image/jpeg;base64,${base64}`;
  }, []);

  const handleAnalysis = useCallback(async () => {
    if (!beforeImage || !afterImage) {
      setError("Please upload both 'before' and 'after' images.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await analyzeImagesForNewConstruction(beforeImage, afterImage);
      setResults(response.new_constructions);
    } catch (e) {
      const err = e as Error;
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [beforeImage, afterImage]);

  const handleReset = () => {
    setBeforeImage(null);
    setAfterImage(null);
    setAfterImageDimensions(null);
    setResults(null);
    setError(null);
    setIsLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col p-4">
      <header className="text-center mb-6 flex-shrink-0">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              Temporal Satellite Analysis AI
            </span>
          </h1>
          <p className="mt-3 text-lg text-gray-400 max-w-3xl mx-auto">
            Detect new building constructions by comparing satellite images from two different points in time.
          </p>
      </header>
    
      <main className="flex-grow container mx-auto max-w-7xl flex items-center justify-center">
        {results && afterImage && afterImageDimensions ? (
            <AnalysisResult 
                imageUrl={afterImage} 
                imageDimensions={afterImageDimensions}
                buildings={results} 
                onReset={handleReset}
            />
        ) : (
          <div className="w-full max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <ImageUploader id="before-image" title="Before" onImageUpload={setBeforeImage} imageUrl={beforeImage} />
                <ImageUploader id="after-image" title="After" onImageUpload={handleSetAfterImage} imageUrl={afterImage} />
              </div>

              <div className="text-center p-4 bg-gray-800/50 rounded-lg mb-6">
                 <p className="text-gray-400">
                    <span className="font-bold text-gray-300">How to get images?</span> For historical satellite data, especially for India, explore ISRO's <a href="https://bhuvan.nrsc.gov.in/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Bhuvan portal</a>. Other resources include public archives like USGS EarthExplorer.
                 </p>
              </div>

              <div className="text-center">
                <button
                  onClick={handleAnalysis}
                  disabled={!beforeImage || !afterImage || isLoading}
                  className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:shadow-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </div>
                  ) : (
                    'Analyze for New Constructions'
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-6 bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative text-center" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
              )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;