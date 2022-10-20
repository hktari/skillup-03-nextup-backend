export interface OsmAutocompleteQuery {
    type: string
    features: OsmAddress[]
    query: OsmQuery
}

export interface OsmQuery {
    text: string
    parsed: any
}
export interface OsmAddress {
    type:       string;
    properties: Properties;
    geometry:   Geometry;
}

export interface Geometry {
    type:        string;
    coordinates: Array<number[]>;
}

export interface Properties {
    feature_type:  string;
    name:          string;
    restrictions:  Restrictions;
    categories:    string[];
    datasource:    Datasource;
    street:        string;
    city:          string;
    postcode:      string;
    country:       string;
    country_code:  string;
    formatted:     string;
    address_line1: string;
    address_line2: string;
    lat:           number;
    lon:           number;
    timezone:      Timezone;
    place_id:      string;
}

export interface Datasource {
    sourcename:  string;
    attribution: string;
    license:     string;
    url:         string;
    raw:         Raw;
}

export interface Raw {
    ref:      number;
    name:     string;
    lanes:    number;
    osm_id:   number;
    highway:  string;
    section:  number;
    surface:  string;
    z_order:  number;
    maxspeed: number;
    osm_type: string;
    sidewalk: string;
}

export interface Restrictions {
    max_speed: number;
}

export interface Timezone {
    name:               string;
    name_alt:           string;
    offset_STD:         string;
    offset_STD_seconds: number;
    offset_DST:         string;
    offset_DST_seconds: number;
    abbreviation_STD:   string;
    abbreviation_DST:   string;
}
