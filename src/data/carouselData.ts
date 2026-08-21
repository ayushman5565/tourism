import indiaCinematicSplitImg from '../assets/images/india_cinematic_split_1787154854837.jpg';
import vintageTravelCollageImg from '../assets/images/vintage_travel_collage_1787154882264.jpg';
import indiaHeritageMoodboardImg from '../assets/images/india_heritage_moodboard_1787154911119.jpg';
import montBlancHikeImg from '../assets/images/mont_blanc_hike_1787154417165.jpg';
import ladakhCollageImg from '../assets/images/ladakh_travel_collage_1787155692773.jpg';
import meghalayaCollageImg from '../assets/images/meghalaya_travel_collage_1787155713728.jpg';

export interface CarouselSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  tag: string;
}

export const SHOWCASE_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'india-cinematic-split',
    image: indiaCinematicSplitImg,
    title: 'Colors of India',
    subtitle: 'Jaipur, Taj Mahal & Cultural Wonders',
    tag: 'Cultural Heritage',
  },
  {
    id: 'vintage-travel-world',
    image: vintageTravelCollageImg,
    title: 'Wanderlust Around The World',
    subtitle: 'Global Sanctuaries & Scenic Highways',
    tag: 'Scenic Discovery',
  },
  {
    id: 'india-heritage-moodboard',
    image: indiaHeritageMoodboardImg,
    title: 'Saare Jahan Se Acha',
    subtitle: 'Sacred Ghats, Palaces & Heritage Trails',
    tag: 'Living Traditions',
  },
  {
    id: 'mont-blanc-hiking',
    image: montBlancHikeImg,
    title: 'Tour du Mont Blanc',
    subtitle: 'Alpine Horizons & High-Altitude Treks',
    tag: 'Mountain Expeditions',
  },
  {
    id: 'ladakh-travel',
    image: ladakhCollageImg,
    title: 'Ladakh High Pass',
    subtitle: 'Rugged Mountain Passes & Serene Monasteries',
    tag: 'High Altitude Serenity',
  },
  {
    id: 'meghalaya-travel',
    image: meghalayaCollageImg,
    title: 'Meghalaya Living Roots',
    subtitle: 'Lush Waterfalls, Living Root Bridges & Cloud Forests',
    tag: 'Living Nature',
  },
];
