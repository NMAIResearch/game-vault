// New places share the existing growth, movement and seeded placement rules.
export const WORLD_MAPS = {
  moonbase: { id: 'moonbase', name: 'Moonbase Munch', defaultSeed: 7, colour: '#b8caff', icon: '☾',
    description: 'Moon dust, wandering astronauts and rovers. Finish with a rocket-sized snack.',
    landmarks: [[-90, -80], [75, -90], [-90, 15], [85, 90]],
    start: { x: -18, z: 35 }, look: 'lunar', sky: 0x111b36, outer: 0x626c86, land: '#a9aec6', water: '#565f7c' },
  jurassic: { id: 'jurassic', name: 'Jurassic Jungle', defaultSeed: 7, colour: '#a4dd65', icon: '🦕',
    description: 'Follow a winding river through ferns, dinosaur herds and towering volcanoes.',
    landmarks: [[-82, -80], [82, -80], [-82, 80], [82, 80]],
    start: { x: 50, z: 40 }, look: 'fern-crown', sky: 0xb8e2bb, outer: 0x277e79, land: '#7ba447', water: '#3baba5' },
  alien: { id: 'alien', name: 'Alien Bloom', defaultSeed: 7, colour: '#e4a0ff', icon: '✧',
    description: 'A violet planet of crystals, curious blobs, flying saucers and enormous blooms.',
    landmarks: [[0, 95], [-95, 10], [85, 65], [55, -78]],
    start: { x: -15, z: 35 }, look: 'cosmic', sky: 0x36274f, outer: 0x59356d, land: '#a178b5', water: '#49345f' },
  atlantis: { id: 'atlantis', name: 'Sunken City', defaultSeed: 7, colour: '#65e5d5', icon: '♆',
    description: 'Roam the seabed among colourful fish, coral gardens and lost underwater temples.',
    landmarks: [[-82, -80], [82, -80], [-82, 80], [82, 80]],
    start: { x: 0, z: 58 }, look: 'diver', sky: 0x245e78, outer: 0x277c91, land: '#abc7a0', water: '#29778e' },
};

export const MOON_CRATERS = [[-62, -34, 18], [35, -65, 21], [62, 45, 16], [-65, 72, 13]];
export const ALIEN_POOLS = [[-55, -38, 17], [49, 29, 19], [10, -83, 12]];
export const jungleRiverX = z => -22 + 15 * Math.sin(z / 28);

export function worldLandAt(id, x, z) {
  if (id === 'moonbase') return Math.hypot(x, z) < 137 && MOON_CRATERS.every(([cx, cz, r]) => Math.hypot(x-cx, z-cz) > r);
  if (id === 'jurassic') return x*x/(137*137) + z*z/(135*135) < 1 &&
    (Math.abs(x-jungleRiverX(z)) > 6 || [-72, 0, 72].some(b => Math.abs(z-b) < 6));
  if (id === 'alien') return Math.hypot(x, z) < 129 + 7 * Math.cos(Math.atan2(z, x) * 3) &&
    ALIEN_POOLS.every(([cx, cz, r]) => Math.hypot(x-cx, z-cz) > r);
  if (id === 'atlantis') return Math.hypot(x, z) < 138 && Math.hypot(x, z+24) > 28;
  return null;
}

export const WORLD_TYPES = [
  { id: 'moonrock', label: 'moon pebbles', s: .26, h: .35 },
  { id: 'sample', label: 'sample capsules', s: .48, h: .75 },
  { id: 'battery', label: 'power cells', s: .65, h: 1.2 },
  { id: 'astronaut', label: 'astronauts', s: .76, h: 1.9, mover: 'walker' },
  { id: 'solar', label: 'solar panels', s: 1.65, h: 2 },
  { id: 'rover', label: 'moon rovers', s: 2.7, h: 3, solid: [1.5, 1.9] },
  { id: 'habitat', label: 'moon habitats', s: 5.3, h: 6, solid: [3.5, 3.5] },
  { id: 'dish', label: 'radio dishes', s: 8.6, h: 15, solid: [4, 4] },
  { id: 'rocket', label: 'rockets', s: 13.2, h: 32, solid: [8, 8] },
  { id: 'spore', label: 'amber seeds', s: .26, h: .45 },
  { id: 'fossil', label: 'fossils', s: .48, h: .3 },
  { id: 'egg', label: 'dinosaur eggs', s: .65, h: 1.3 },
  { id: 'hatchling', label: 'hatchlings', s: .76, h: 1.2, mover: 'animal' },
  { id: 'fern', label: 'giant ferns', s: 1.65, h: 3 },
  { id: 'triceratops', label: 'triceratops', s: 2.7, h: 3.4, mover: 'animal' },
  { id: 'stegosaurus', label: 'stegosaurs', s: 5.3, h: 6.8, mover: 'animal' },
  { id: 'longneck', label: 'long-neck dinosaurs', s: 8.6, h: 16, mover: 'animal' },
  { id: 'volcano', label: 'volcanoes', s: 13.2, h: 25, solid: [8, 8] },
  { id: 'stardust', label: 'star stones', s: .26, h: .56 },
  { id: 'pod', label: 'alien pods', s: .48, h: 1.1 },
  { id: 'crystal', label: 'crystals', s: .65, h: 2 },
  { id: 'blob', label: 'curious blobs', s: .76, h: 1.4, mover: 'animal' },
  { id: 'mushroom', label: 'glow mushrooms', s: 1.65, h: 3.4 },
  { id: 'saucer', label: 'flying saucers', s: 2.7, h: 3.1 },
  { id: 'nest', label: 'alien nests', s: 5.3, h: 8, solid: [3.5, 3.5] },
  { id: 'spire', label: 'crystal spires', s: 8.6, h: 22, solid: [4.5, 4.5] },
  { id: 'bloom', label: 'cosmic blooms', s: 13.2, h: 27, solid: [7, 7] },
  { id: 'pearl', label: 'pearls', s: .26, h: .4 },
  { id: 'starfish', label: 'starfish', s: .48, h: .25 },
  { id: 'anemone', label: 'anemones', s: .65, h: 1.5 },
  { id: 'fish', label: 'reef fish', s: .76, h: 1.2, mover: 'animal' },
  { id: 'coral', label: 'coral fans', s: 1.65, h: 3.1 },
  { id: 'chest', label: 'treasure chests', s: 2.7, h: 2.8, solid: [1.8, 1.5] },
  { id: 'column', label: 'ruined columns', s: 5.3, h: 10, solid: [3.5, 3.5] },
  { id: 'arch', label: 'ancient arches', s: 8.6, h: 14, solid: [5.5, 3] },
  { id: 'temple', label: 'sunken temples', s: 13.2, h: 21.6, solid: [8, 8] },
];

// Smallest to largest; landmarks are placed before the smaller props are scattered.
export const WORLD_FOOD = {
  moonbase: ['moonrock', 'sample', 'battery', 'astronaut', 'solar', 'rover', 'habitat', 'dish', 'rocket'],
  jurassic: ['spore', 'fossil', 'egg', 'hatchling', 'fern', 'triceratops', 'stegosaurus', 'longneck', 'volcano'],
  alien: ['stardust', 'pod', 'crystal', 'blob', 'mushroom', 'saucer', 'nest', 'spire', 'bloom'],
  atlantis: ['pearl', 'starfish', 'anemone', 'fish', 'coral', 'chest', 'column', 'arch', 'temple'],
};
