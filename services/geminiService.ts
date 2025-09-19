
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResponse } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    new_constructions: {
      type: Type.ARRAY,
      description: "A list of newly constructed buildings or significant structures.",
      items: {
        type: Type.OBJECT,
        properties: {
          x: {
            type: Type.NUMBER,
            description: "The x-coordinate of the top-left corner of the bounding box, as a percentage of the image width.",
          },
          y: {
            type: Type.NUMBER,
            description: "The y-coordinate of the top-left corner of the bounding box, as a percentage of the image height.",
          },
          width: {
            type: Type.NUMBER,
            description: "The width of the bounding box, as a percentage of the image width.",
          },
          height: {
            type: Type.NUMBER,
            description: "The height of the bounding box, as a percentage of the image height.",
          },
          description: {
            type: Type.STRING,
            description: "A brief description of the new structure, e.g., 'New residential building', 'Warehouse added'.",
          },
        },
        required: ["x", "y", "width", "height", "description"],
      },
    },
  },
  required: ["new_constructions"],
};

export const analyzeImagesForNewConstruction = async (
  beforeImageBase64: string,
  afterImageBase64: string
): Promise<AnalysisResponse> => {
  const beforeImagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: beforeImageBase64,
    },
  };

  const afterImagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: afterImageBase64,
    },
  };

  const textPart = {
    text: `
      Analyze these two satellite images of the same location at different times.
      The first image is the "before" state and the second is the "after" state.
      Your task is to identify all new buildings or significant man-made structures present in the "after" image that are not in the "before" image.
      Ignore minor changes like vehicles, vegetation growth, or shadows. Focus only on new constructions.
      Provide the bounding box coordinates (as percentages of image dimensions) and a brief description for each new structure you identify.
      If no new constructions are found, return an empty list.
    `,
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, beforeImagePart, afterImagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    // Basic validation of the parsed object
    if (result && Array.isArray(result.new_constructions)) {
       return result as AnalysisResponse;
    } else {
       console.error("Parsed JSON does not match expected structure:", result);
       throw new Error("AI response format is invalid.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to analyze images. Please check the console for details.");
  }
};
