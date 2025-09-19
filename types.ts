
export interface NewBuilding {
  x: number; // percentage from left
  y: number; // percentage from top
  width: number; // percentage width
  height: number; // percentage height
  description: string;
}

export interface AnalysisResponse {
  new_constructions: NewBuilding[];
}
