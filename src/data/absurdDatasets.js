const absurdDatasets = [
  {
    id: 1,
    name: 'Global Instant Noodle Consumption',
    emoji: '🍜',
    unit: 'billion servings',
    baseMin: 50,
    baseMax: 120,
    sourceUrl: 'https://instantnoodles.org/en/noodles/market/'
  },
  {
    id: 2,
    name: 'Pigeons Spotted in Central Park',
    emoji: '🐦',
    unit: 'thousands',
    baseMin: 200,
    baseMax: 800,
    sourceUrl: 'https://www.centralparknyc.org/animals/rock-pigeon'
  },
  {
    id: 3,
    name: 'Average Reddit Post Length',
    emoji: '📝',
    unit: 'characters',
    baseMin: 140,
    baseMax: 3200,
    sourceUrl: 'https://www.reddit.com/'
  },
  {
    id: 4,
    name: 'Taylor Swift Spotify Streams',
    emoji: '🎤',
    unit: 'million streams/day',
    baseMin: 40,
    baseMax: 180,
    sourceUrl: 'https://open.spotify.com/artist/06HL4z0CvFAxyCO2z7ao1g'
  },
  {
    id: 5,
    name: 'Global Banana Exports',
    emoji: '🍌',
    unit: 'million metric tons',
    baseMin: 18,
    baseMax: 45,
    sourceUrl: 'https://www.fao.org/economic/est/est-commodities/bananas/en/'
  },
  {
    id: 6,
    name: 'Corn Prices in Iowa',
    emoji: '🌽',
    unit: '$/bushel',
    baseMin: 3,
    baseMax: 8,
    sourceUrl: 'https://www.iowacorn.org/'
  },
  {
    id: 7,
    name: 'Times Someone Said "Synergy" in Meetings',
    emoji: '🤝',
    unit: 'incidents/day',
    baseMin: 5000,
    baseMax: 42000,
    sourceUrl: 'https://www.dictionary.com/browse/synergy'
  },
  {
    id: 8,
    name: 'UFO Sightings Reported to the Pentagon',
    emoji: '🛸',
    unit: 'reports',
    baseMin: 12,
    baseMax: 370,
    sourceUrl: 'https://www.aaro.mil/'
  },
  {
    id: 9,
    name: 'Average Uber Surge Pricing',
    emoji: '🚗',
    unit: 'x multiplier',
    baseMin: 1,
    baseMax: 5,
    sourceUrl: 'https://www.uber.com/us/en/ride/how-it-works/upfront-pricing/'
  },
  {
    id: 10,
    name: 'Dog Adoption Rates in Brooklyn',
    emoji: '🐕',
    unit: 'adoptions/month',
    baseMin: 80,
    baseMax: 600,
    sourceUrl: 'https://www.brooklynanimalaction.org/'
  },
  {
    id: 11,
    name: 'Number of Tabs Open on Average Chrome User',
    emoji: '🌐',
    unit: 'tabs',
    baseMin: 14,
    baseMax: 137,
    sourceUrl: 'https://www.google.com/chrome/'
  },
  {
    id: 12,
    name: 'Global Avocado Toast Sales',
    emoji: '🥑',
    unit: 'million servings',
    baseMin: 25,
    baseMax: 200,
    sourceUrl: 'https://en.wikipedia.org/wiki/Avocado_toast'
  },
  {
    id: 13,
    name: 'Frequency of "Disruption" in TechCrunch',
    emoji: '💥',
    unit: 'mentions/week',
    baseMin: 40,
    baseMax: 400,
    sourceUrl: 'https://techcrunch.com/'
  },
  {
    id: 14,
    name: 'IKEA Furniture Assembly Rage Incidents',
    emoji: '🪑',
    unit: 'reported tantrums',
    baseMin: 1200,
    baseMax: 9500,
    sourceUrl: 'https://en.wikipedia.org/wiki/IKEA_effect'
  },
  {
    id: 15,
    name: 'Time Spent Looking for TV Remote',
    emoji: '📺',
    unit: 'minutes/household/day',
    baseMin: 2,
    baseMax: 18,
    sourceUrl: 'https://www.pewresearch.org/fact-tank/2021/06/09/remote-work-remote-control/'
  },
  {
    id: 16,
    name: 'Llama Instagram Follower Growth',
    emoji: '🦙',
    unit: 'new followers/week',
    baseMin: 500,
    baseMax: 12000,
    sourceUrl: 'https://www.instagram.com/explore/tags/llama/'
  },
  {
    id: 17,
    name: 'Global Pumpkin Spice Latte Orders',
    emoji: '🎃',
    unit: 'million cups',
    baseMin: 10,
    baseMax: 480,
    sourceUrl: 'https://en.wikipedia.org/wiki/Pumpkin_Spice_Latte'
  },
  {
    id: 18,
    name: 'Flat Earth Society Membership',
    emoji: '🌍',
    unit: 'active members',
    baseMin: 2000,
    baseMax: 35000,
    sourceUrl: 'https://www.theflatearthsociety.org/'
  },
  {
    id: 19,
    name: 'Nicolas Cage Movie Releases',
    emoji: '🎬',
    unit: 'films/year',
    baseMin: 2,
    baseMax: 7,
    sourceUrl: 'https://www.imdb.com/name/nm0000115/'
  },
  {
    id: 20,
    name: 'Times "Per My Last Email" Was Written',
    emoji: '📧',
    unit: 'million occurrences/day',
    baseMin: 3,
    baseMax: 45,
    sourceUrl: 'https://en.wiktionary.org/wiki/per_my_last_email'
  },
  {
    id: 21,
    name: 'Sourdough Starter Instagram Posts',
    emoji: '🍞',
    unit: 'thousand posts/week',
    baseMin: 5,
    baseMax: 120,
    sourceUrl: 'https://www.instagram.com/explore/tags/sourdoughstarter/'
  },
  {
    id: 22,
    name: 'Average Speed of NYC Taxi Drivers',
    emoji: '🚕',
    unit: 'mph',
    baseMin: 6,
    baseMax: 22,
    sourceUrl: 'https://www.nyc.gov/site/tlc/index.page'
  },
  {
    id: 23,
    name: 'Roomba-Related Cat Videos Uploaded',
    emoji: '🐱',
    unit: 'videos/day',
    baseMin: 30,
    baseMax: 900,
    sourceUrl: 'https://www.youtube.com/results?search_query=cat+riding+roomba'
  },
  {
    id: 24,
    name: 'Standing Desk Sit-Down Cheaters',
    emoji: '🪑',
    unit: '% of users',
    baseMin: 30,
    baseMax: 92,
    sourceUrl: 'https://en.wikipedia.org/wiki/Standing_desk'
  },
  {
    id: 25,
    name: 'Socks Lost in Dryers Worldwide',
    emoji: '🧦',
    unit: 'million/year',
    baseMin: 80,
    baseMax: 400,
    sourceUrl: 'https://en.wikipedia.org/wiki/Lost_socks'
  },
];

export default absurdDatasets;
