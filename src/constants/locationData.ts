
export interface CityData {
  name: string;
  slug: string;
  description?: string;
}

export interface RegionData {
  name: string;
  slug: string;
  cities: CityData[];
}

export const REGIONS: RegionData[] = [
  {
    name: "United States",
    slug: "usa",
    cities: [
      // Top cities for key states (Sampling for now, will expand)
      { name: "New York City", slug: "new-york-city" },
      { name: "Los Angeles", slug: "los-angeles" },
      { name: "Chicago", slug: "chicago" },
      { name: "Houston", slug: "houston" },
      { name: "Phoenix", slug: "phoenix" },
      { name: "Philadelphia", slug: "philadelphia" },
      { name: "San Antonio", slug: "san-antonio" },
      { name: "San Diego", slug: "san-diego" },
      { name: "Dallas", slug: "dallas" },
      { name: "San Jose", slug: "san-jose" },
      { name: "Austin", slug: "austin" },
      { name: "Jacksonville", slug: "jacksonville" },
      { name: "Fort Worth", slug: "fort-worth" },
      { name: "Columbus", slug: "columbus" },
      { name: "San Francisco", slug: "san-francisco" },
      { name: "Charlotte", slug: "charlotte" },
      { name: "Indianapolis", slug: "indianapolis" },
      { name: "Seattle", slug: "seattle" },
      { name: "Denver", slug: "denver" },
      { name: "Washington D.C.", slug: "washington-dc" },
      { name: "Boston", slug: "boston" },
      { name: "Nashville", slug: "nashville" },
      { name: "El Paso", slug: "el-paso" },
      { name: "Detroit", slug: "detroit" },
      { name: "Oklahoma City", slug: "oklahoma-city" },
      { name: "Portland", slug: "portland" },
      { name: "Las Vegas", slug: "las-vegas" },
      { name: "Memphis", slug: "memphis" },
      { name: "Louisville", slug: "louisville" },
      { name: "Baltimore", slug: "baltimore" },
      { name: "Milwaukee", slug: "milwaukee" },
      { name: "Albuquerque", slug: "albuquerque" },
      { name: "Tucson", slug: "tucson" },
      { name: "Fresno", slug: "fresno" },
      { name: "Sacramento", slug: "sacramento" },
      { name: "Kansas City", slug: "kansas-city" },
      { name: "Mesa", slug: "mesa" },
      { name: "Atlanta", slug: "atlanta" },
      { name: "Omaha", slug: "omaha" },
      { name: "Colorado Springs", slug: "colorado-springs" },
      { name: "Raleigh", slug: "raleigh" },
      { name: "Long Beach", slug: "long-beach" },
      { name: "Virginia Beach", slug: "virginia-beach" },
      { name: "Miami", slug: "miami" },
    ]
  },
  {
    name: "Canada",
    slug: "canada",
    cities: [
      { name: "Toronto", slug: "toronto" },
      { name: "Montreal", slug: "montreal" },
      { name: "Vancouver", slug: "vancouver" },
      { name: "Calgary", slug: "calgary" },
      { name: "Edmonton", slug: "edmonton" },
      { name: "Ottawa", slug: "ottawa" },
    ]
  },
  {
    name: "Europe",
    slug: "europe",
    cities: [
      { name: "London", slug: "london" },
      { name: "Berlin", slug: "berlin" },
      { name: "Paris", slug: "paris" },
      { name: "Madrid", slug: "madrid" },
      { name: "Rome", slug: "rome" },
      { name: "Amsterdam", slug: "amsterdam" },
      { name: "Munich", slug: "munich" },
      { name: "Hamburg", slug: "hamburg" },
      { name: "Frankfurt", slug: "frankfurt" },
      { name: "Vienna", slug: "vienna" },
      { name: "Brussels", slug: "brussels" },
      { name: "Stockholm", slug: "stockholm" },
      { name: "Zurich", slug: "zurich" },
    ]
  },
  {
    name: "Middle East",
    slug: "middle-east",
    cities: [
      { name: "Dubai", slug: "dubai" },
      { name: "Abu Dhabi", slug: "abu-dhabi" },
      { name: "Riyadh", slug: "riyadh" },
      { name: "Jeddah", slug: "jeddah" },
      { name: "Doha", slug: "doha" },
      { name: "Kuwait City", slug: "kuwait-city" },
      { name: "Istanbul", slug: "istanbul" },
    ]
  },
  {
    name: "Africa",
    slug: "africa",
    cities: [
      { name: "Lagos", slug: "lagos" },
      { name: "Abuja", slug: "abuja" },
      { name: "Johannesburg", slug: "johannesburg" },
      { name: "Cape Town", slug: "cape-town" },
      { name: "Nairobi", slug: "nairobi" },
      { name: "Cairo", slug: "cairo" },
      { name: "Accra", slug: "accra" },
    ]
  },
  {
    name: "Asia",
    slug: "asia",
    cities: [
      { name: "Tokyo", slug: "tokyo" },
      { name: "Seoul", slug: "seoul" },
      { name: "Singapore", slug: "singapore" },
      { name: "Hong Kong", slug: "hong-kong" },
      { name: "Bangkok", slug: "bangkok" },
      { name: "Mumbai", slug: "mumbai" },
      { name: "Delhi", slug: "delhi" },
      { name: "Jakarta", slug: "jakarta" },
      { name: "Manila", slug: "manila" },
    ]
  },
  {
    name: "Oceania",
    slug: "oceania",
    cities: [
      { name: "Sydney", slug: "sydney" },
      { name: "Melbourne", slug: "melbourne" },
      { name: "Brisbane", slug: "brisbane" },
      { name: "Perth", slug: "perth" },
      { name: "Auckland", slug: "auckland" },
    ]
  }
];
