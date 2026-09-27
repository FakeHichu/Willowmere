import type { WorldEvent } from '@shared/types';

export const worldEventsData: WorldEvent[] = [
  {
    id: 'event_travelling_merchant',
    name: 'Wandering Artisan Merchant',
    description: 'A travelling merchant with rare exotic goods has set up a stall near the crossroads!',
    regionId: 'village',
    position: { x: 3200, y: 2200 },
    radius: 120,
    durationSeconds: 600,
    type: 'merchant',
    data: { merchantName: 'Jasper the Wanderer', itemsForSale: ['rare_herb', 'elixir_flask', 'exotic_seeds'] },
  },
  {
    id: 'event_village_festival',
    name: 'Willowmere Solstice Festival',
    description: 'Music, lanterns, and celebrations fill the town square!',
    regionId: 'village',
    position: { x: 3000, y: 2300 },
    radius: 300,
    durationSeconds: 1200,
    requiredTimeOfDay: 'evening',
    type: 'festival',
  },
  {
    id: 'event_broken_cart',
    name: 'Overturned Freight Cart',
    description: 'A merchant cart lost a wheel along the West Road. Spilled goods need retrieval.',
    regionId: 'abandoned_camp',
    position: { x: 1200, y: 2100 },
    radius: 150,
    durationSeconds: 900,
    type: 'broken_cart',
    data: { questId: 'quest_recover_cargo' },
  },
  {
    id: 'event_mountain_blizzard',
    name: 'Highland Ridge Blizzard',
    description: 'A heavy snowstorm has descended upon the Northern Mountain peaks!',
    regionId: 'northern_mountains',
    position: { x: 3000, y: -800 },
    radius: 800,
    durationSeconds: 450,
    activeWeather: 'snow',
    type: 'storm',
  },
  {
    id: 'event_rare_bloom',
    name: 'Moonlit Lotus Bloom',
    description: 'Rare luminescent flowers are blooming at the Sunlit Healing Springs!',
    regionId: 'hidden_grove',
    position: { x: 3000, y: 3800 },
    radius: 200,
    durationSeconds: 500,
    requiredTimeOfDay: 'night',
    type: 'rare_resource',
    data: { resourceId: 'moonlight_lotus', maxHarvest: 5 },
  },
];

export function getActiveWorldEventsForRegion(regionId: string): WorldEvent[] {
  return worldEventsData.filter(e => e.regionId === regionId);
}
