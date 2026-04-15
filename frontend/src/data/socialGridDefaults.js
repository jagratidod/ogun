import { socialGridAssets } from './socialGridAssets';

const byValue = Object.fromEntries(socialGridAssets.map((a) => [a.value, a]));

const defaultSocialGridItems = [
  { id: 'sg-1', enabled: true, ...byValue.video1, views: 93800 },
  { id: 'sg-2', enabled: true, ...byValue.video2, views: 311000 },
  { id: 'sg-3', enabled: true, ...byValue.image2, views: 2900000 },
  { id: 'sg-4', enabled: true, ...byValue.image1, views: 242000 },
  { id: 'sg-5', enabled: true, ...byValue.video1, views: 2000000 },
  { id: 'sg-6', enabled: true, ...byValue.image2, views: 31100 },
  { id: 'sg-7', enabled: true, ...byValue.video2, views: 5300000 },
  { id: 'sg-8', enabled: true, ...byValue.image1, views: 74100 },
  { id: 'sg-9', enabled: true, ...byValue.video1, views: 140000 },
];

export default defaultSocialGridItems;

