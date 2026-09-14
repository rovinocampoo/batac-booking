export type OsmTags = {
  name?: string;
  amenity?: string;
  leisure?: string;
  sport?: string;
  cuisine?: string;
  website?: string;
  facebook?: string;
  "addr:city"?: string;
  "addr:street"?: string;
  "addr:postcode"?: string;
};

export type OsmElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: OsmTags;
};

export type OverpassResponse = {
  version: number;
  generator: string;
  elements: OsmElement[];
};