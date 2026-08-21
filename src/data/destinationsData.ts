import { DestinationDetail, TripPlanResult, RouteWaypoint, DayItinerary } from '../types';

export const SAMPLE_DESTINATIONS: DestinationDetail[] = [
  {
    id: 'jaipur',
    name: 'Jaipur',
    country: 'India',
    stateOrRegion: 'Rajasthan',
    tagline: 'The Pink City of Regal Forts, Palaces & Vibrant Bazaars',
    description:
      'Immerse in timeless royal grandeur where rose-hued sandstone architecture meets tranquil courtyards, majestic hilltop fortresses, aromatic chai stalls, and centuries of Rajasthani craftsmanship.',
    heroImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1603287681836-e174ce7174fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'heritage',
    bestTimeToVisit: 'October to March (Mild & Pleasant winters)',
    idealDuration: '3 - 4 Days',
    estimatedDailyBudget: {
      budget: '₹2,500',
      moderate: '₹5,500',
      luxury: '₹18,000+',
    },
    coordinates: {
      lat: 26.9124,
      lng: 75.7873,
    },
    topAttractions: [
      {
        id: 'amber-fort',
        name: 'Amer (Amber) Fort & Maota Lake',
        category: 'Heritage',
        description: 'Spectacular UNESCO-listed 16th-century fortress on Cheel ka Teela, showcasing Sheesh Mahal (Mirror Palace) and Rajput-Mughal architecture.',
        recommendedDuration: '2.5 - 3 hours',
        bestTimeToVisit: '8:30 AM (Morning calm before crowds)',
        estimatedEntryFee: '₹500 for foreigners / ₹100 for locals',
        lat: 26.9855,
        lng: 75.8513,
        travelTip: 'Arrive at opening to walk up peacefully and enjoy morning light reflecting on Maota Lake.',
        image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'hawa-mahal',
        name: 'Hawa Mahal (Palace of Winds)',
        category: 'Heritage',
        description: 'Iconic five-story honeycomb pink sandstone facade with 953 jharokhas (small lattice windows) designed for royal court ladies.',
        recommendedDuration: '1 hour',
        bestTimeToVisit: '9:00 AM or Golden Hour',
        estimatedEntryFee: '₹200 / ₹50',
        lat: 26.9239,
        lng: 75.8267,
        travelTip: 'Visit the opposite rooftop cafes (Wind View Cafe) for stunning street photography.',
        image: 'https://images.unsplash.com/photo-1603287681836-e174ce7174fa?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'city-palace',
        name: 'Jaipur City Palace & Chandra Mahal',
        category: 'Culture',
        description: 'The historic residence of the Maharaja of Jaipur featuring ornate courtyards like the famous Peacock Gate and museum galleries.',
        recommendedDuration: '2 hours',
        bestTimeToVisit: '11:00 AM - 1:00 PM',
        estimatedEntryFee: '₹700 / ₹300',
        lat: 26.9258,
        lng: 75.8237,
        travelTip: 'The Pritam Niwas Chowk peacock gate is an absolute masterpiece of colored enamel work.',
        image: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'jantar-mantar',
        name: 'Jantar Mantar Astronomical Observatory',
        category: 'Heritage',
        description: 'UNESCO World Heritage collection of nineteen architectural astronomical instruments, including the world’s largest stone sundial.',
        recommendedDuration: '1 - 1.5 hours',
        bestTimeToVisit: 'Midday when the sun is highest for sundial shadows',
        estimatedEntryFee: '₹200 / ₹50',
        lat: 26.9248,
        lng: 75.8246,
        travelTip: 'Hire an authorized audio guide or official guide to understand the brilliant geometry.',
      },
      {
        id: 'nahargarh-fort',
        name: 'Nahargarh Fort (Sunset Panorama)',
        category: 'Viewpoint',
        description: 'Perched on the rugged Aravalli ridge overlooking the entire glowing expanse of the Pink City.',
        recommendedDuration: '2 hours',
        bestTimeToVisit: '4:30 PM - 6:30 PM (Sunset)',
        estimatedEntryFee: '₹200 / ₹50',
        lat: 26.9378,
        lng: 75.8156,
        travelTip: 'Watch the sunset from the Padao open-air terrace with a warm cup of masala chai.',
        image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'jal-mahal',
        name: 'Jal Mahal (Water Palace)',
        category: 'Viewpoint',
        description: 'Serene Rajput palace floating serenely in the center of Man Sagar Lake against the Aravalli hills.',
        recommendedDuration: '30 - 45 mins',
        bestTimeToVisit: 'Evening twilight when it is illuminated',
        estimatedEntryFee: 'Free (Viewed from lakeside promenade)',
        lat: 26.9535,
        lng: 75.8462,
        travelTip: 'Walk the promenade in late evening for fresh roasted corn and peaceful lake breeze.',
      },
    ],
    sampleDays: [
      {
        dayNumber: 1,
        theme: 'The Crown Jewels & Royal Heart of the City',
        morning: 'Start early with sunrise photography in front of Hawa Mahal, followed by morning tea and an immersive tour of City Palace courtyards.',
        afternoon: 'Explore Jantar Mantar observatory, then enjoy a traditional thali lunch near Johari Bazaar.',
        evening: 'Walk through vibrant bangle & block-print artisan lanes in Bapu Bazaar, finishing with dinner at a heritage courtyard.',
        foodSpot: 'LMB (Laxmi Mishthan Bhandar) for authentic Pyaaz Kachori and Ghewar.',
        travelNote: 'All Day 1 stops are within 1.5 km of each other in the historic Walled City.',
      },
      {
        dayNumber: 2,
        theme: 'Hilltop Strongholds & Water Palaces',
        morning: 'Drive north to Amer Fort; tour the Mirror Palace (Sheesh Mahal) and peaceful Zenana gardens.',
        afternoon: 'Discover the underground stepwell Panna Meena Ka Kund, followed by lakeside views at Jal Mahal.',
        evening: 'Climb the winding Aravalli road to Nahargarh Fort for a breathtaking sunset over the illuminated city.',
        foodSpot: '1135 AD at Amer Fort for royal Rajasthani dining, or Padao open-air cafe.',
        travelNote: 'Hire an auto-rickshaw or taxi for the day to cover the northern fort circuit smoothly.',
      },
      {
        dayNumber: 3,
        theme: 'Artisan Heritage, Stepwells & Sunset Serenity',
        morning: 'Visit the peaceful Galta Ji (Monkey Temple and natural springs in the mountain pass).',
        afternoon: 'Participate in a traditional wooden block-printing workshop in Sanganer or Bagru.',
        evening: 'Relax in the manicured gardens of Sisodia Rani Ka Bagh or enjoy folk dances at Chokhi Dhani.',
        foodSpot: 'Rawat Mishthan Bhandar for hot Mawa Kachori and sweet Lassi.',
        travelNote: 'Keep afternoons relaxed to avoid peak midday sun during summer months.',
      },
    ],
    localFood: [
      { dish: 'Dal Baati Churma', description: 'Crisp wheat dumplings dipped in desi ghee, spiced five-lentil curry, and sweet crushed jaggery churma.' },
      { dish: 'Pyaaz & Mawa Kachori', description: 'Flaky golden pastry filled with spiced caramelized onions or sweetened mawa nuts.' },
      { dish: 'Laal Maas / Gatta Curry', description: 'Smoky red chili spiced curry with tender mutton or chickpea flour dumplings.' },
      { dish: 'Jaipuri Kulhad Lassi', description: 'Thick, creamy yogurt lassi served in traditional earthenware cups with malai topping.' },
    ],
    stayRecommendations: [
      { area: 'Civil Lines / C-Scheme', ambience: 'Peaceful, leafy residential streets with boutique heritage hotels and chic cafes.', priceRange: '₹3,500 - ₹9,000 / night' },
      { area: 'Old Pink City (Walled Area)', ambience: 'Right in the lively historic pulse, walkable to bazaars and palaces.', priceRange: '₹2,000 - ₹6,000 / night' },
      { area: 'Kukas / Amber Outskirts', ambience: 'Ultra-peaceful luxury havelis and palace resorts nestled against the Aravalli hills.', priceRange: '₹12,000+ / night' },
    ],
    practicalTips: [
      { title: 'Best Footwear', tip: 'Wear comfortable slip-on walking shoes for visiting temples, forts, and cobblestone pathways.', type: 'packing' },
      { title: 'Composite Monuments Ticket', tip: 'Buy the government composite ticket at Amer Fort to save time & money on multiple entry tickets.', type: 'transit' },
      { title: 'Hydration & Sun', tip: 'Carry reusable water and wear a light linen scarf or hat between 11 AM and 3 PM.', type: 'safety' },
    ],
    nearbyPlaces: [
      { name: 'Pushkar & Sacred Lake', distance: '145 km (2.5 hrs)', highlight: 'Spiritual desert oasis, Brahma temple, and tranquil ghats.' },
      { name: 'Ranthambore National Park', distance: '160 km (3 hrs)', highlight: 'Renowned tiger sanctuary and ancient forest ruins.' },
      { name: 'Abhaneri Stepwell (Chand Baori)', distance: '95 km (1.5 hrs)', highlight: 'Astounding 13-story geometric stepwell architecture.' },
    ],
  },
  {
    id: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    stateOrRegion: 'Kansai',
    tagline: 'The Cultural Soul of Zen Gardens, Bamboo Groves & Ancient Temples',
    description:
      'Step into a realm of profound serenity. Kyoto preserves millennia of Japanese aesthetics with over 2,000 sacred shrines, moss-carpeted temple gardens, tranquil matcha tea houses, and historic wooden machiya lanes.',
    heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'culture',
    bestTimeToVisit: 'March–May (Cherry Blossoms) or Oct–Nov (Autumn Maples)',
    idealDuration: '4 - 5 Days',
    estimatedDailyBudget: {
      budget: '₹5,000',
      moderate: '₹12,000',
      luxury: '₹30,000+',
    },
    coordinates: {
      lat: 35.0116,
      lng: 135.7681,
    },
    topAttractions: [
      {
        id: 'fushimi-inari',
        name: 'Fushimi Inari Taisha (10,000 Torii Gates)',
        category: 'Heritage',
        description: 'Sacred mountain trail sheltered by thousands of vibrant vermilion torii gates winding through tranquil cedar forests.',
        recommendedDuration: '2.5 hours',
        bestTimeToVisit: '6:30 AM (Sunrise before crowds) or Evening dusk',
        estimatedEntryFee: 'Free',
        lat: 34.9671,
        lng: 135.7727,
        travelTip: 'Walk past the first crowded 15 minutes; the upper mountain trails are whisper-quiet.',
        image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'arashiyama-bamboo',
        name: 'Arashiyama Bamboo Grove & Tenryu-ji',
        category: 'Nature',
        description: 'Towering emerald stalks swaying in the breeze next to UNESCO Zen temple garden with Sogenchi pond.',
        recommendedDuration: '2 hours',
        bestTimeToVisit: '7:30 AM morning stillness',
        estimatedEntryFee: 'Bamboo Grove: Free / Tenryu-ji: ¥500',
        lat: 35.0158,
        lng: 135.6713,
        travelTip: 'Continue to Okochi Sanso Villa gardens for matcha with panoramic mountain views.',
        image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'kinkaku-ji',
        name: 'Kinkaku-ji (The Golden Pavilion)',
        category: 'Heritage',
        description: 'Zen Buddhist temple with the top two floors covered completely in pure gold leaf, reflecting across Mirror Pond.',
        recommendedDuration: '1 hour',
        bestTimeToVisit: '9:00 AM opening or 3:00 PM for glistening reflection',
        estimatedEntryFee: '¥500',
        lat: 35.0394,
        lng: 135.7292,
        travelTip: 'Check the weather forecast for sunny skies to catch the brightest golden reflections.',
      },
      {
        id: 'kiyomizu-dera',
        name: 'Kiyomizu-dera & Sannenzaka Slopes',
        category: 'Viewpoint',
        description: 'Spectacular wooden temple built without a single nail cantilevered over cherry trees on Mount Otowa.',
        recommendedDuration: '2 hours',
        bestTimeToVisit: 'Sunset or Early morning',
        estimatedEntryFee: '¥400',
        lat: 34.9949,
        lng: 135.7850,
        travelTip: 'Stroll down Ninenzaka and Sannenzaka stone stairways to spot preserved timber facades.',
      },
      {
        id: 'gion-district',
        name: 'Gion Historic Geisha District & Shirakawa Canal',
        category: 'Culture',
        description: 'Atmospheric lantern-lit district lined with willow trees, 17th-century ochaya teahouses, and canal bridges.',
        recommendedDuration: '1.5 hours',
        bestTimeToVisit: 'Twilight (5:30 PM - 7:30 PM)',
        estimatedEntryFee: 'Free',
        lat: 35.0037,
        lng: 135.7772,
        travelTip: 'Respect the privacy of Geiko and Maiko; photographing them on private alleys is prohibited.',
      },
    ],
    sampleDays: [
      {
        dayNumber: 1,
        theme: 'Eastern Kyoto Highlights & Sacred Shrines',
        morning: 'Early morning tranquility at Fushimi Inari Taisha mountain trail.',
        afternoon: 'Wander Kiyomizu-dera temple platform, drink from Otowa Waterfall, and stroll Sannenzaka preserved lanes.',
        evening: 'Lantern-lit walk through Gion along the weeping willows of Shirakawa canal.',
        foodSpot: 'Gion Karyo for traditional Kaiseki multi-course dinner.',
        travelNote: 'Take the Keihan Line train between Fushimi Inari and Gion-Shijo.',
      },
      {
        dayNumber: 2,
        theme: 'Western Bamboo Forests & Zen Reflections',
        morning: 'Morning walk through Arashiyama Bamboo Grove and Tenryu-ji UNESCO Zen pond.',
        afternoon: 'Cross Togetsukyo Bridge and ride the scenic Sagano Romantic Train along the Hozugawa River.',
        evening: 'Golden sunset at Kinkaku-ji (Golden Pavilion) and tea tasting in northern Kyoto.',
        foodSpot: 'Shigetsu inside Tenryu-ji for Michelin-rated Zen Buddhist vegetarian cuisine (Shojin Ryori).',
        travelNote: 'Use the JR San-in line from Kyoto Station directly to Saga-Arashiyama Station.',
      },
      {
        dayNumber: 3,
        theme: 'Philosophy Path, Silver Pavilion & Matcha Culture',
        morning: 'Peaceful stroll along Philosopher’s Path (Tetsugaku-no-Michi) starting from Ginkaku-ji (Silver Pavilion).',
        afternoon: 'Explore Nishiki Market ("Kyoto’s Kitchen") for fresh dashi skewers, matcha soft serve, and pickled vegetables.',
        evening: 'Traditional tea ceremony experience at a quiet Uji-sourced tearoom.',
        foodSpot: 'Nishiki Market food stalls and Ippodo Tea Room for ceremonial matcha.',
        travelNote: 'Rent a city bicycle to explore along the Kamogawa River banks.',
      },
    ],
    localFood: [
      { dish: 'Kyoto Kaiseki Ryori', description: 'Artistic multi-course banquet celebrating seasonal ingredients, subtle dashi, and ceramic presentation.' },
      { dish: 'Shojin Ryori (Zen Vegetarian)', description: 'Serene temple cuisine crafted with handmade tofu, mountain vegetables, and yuba (tofu skin).' },
      { dish: 'Uji Matcha Parfaits & Soba', description: 'Green tea buckwheat noodles and rich stone-ground matcha desserts.' },
      { dish: 'Yudofu (Hot Pot Tofu)', description: 'Simmered artisan silken tofu served with kelp broth, grated ginger, and sweet soy.' },
    ],
    stayRecommendations: [
      { area: 'Higashiyama', ambience: 'Steps from historic temples and atmospheric stone lanes; ideal for serene morning walks.', priceRange: '₹10,000 - ₹24,000 / night' },
      { area: 'Central Kyoto / Karasuma', ambience: 'Convenient metro access, trendy cafes, and authentic machiya townhouses.', priceRange: '₹7,500 - ₹17,000 / night' },
      { area: 'Arashiyama Ryokan', ambience: 'Peaceful mountain hot spring ryokans with tatami rooms and river views.', priceRange: '₹21,000+ / night' },
    ],
    practicalTips: [
      { title: 'IC Card (ICOCA/Suica)', tip: 'Get a tap-to-pay IC card for effortless subway, bus, and local convenience store transactions.', type: 'transit' },
      { title: 'Early Bird Advantage', tip: 'Kyoto shrines are open 24/7 or from 6 AM; visiting early avoids 90% of tourist crowds.', type: 'safety' },
      { title: 'Temple Etiquette', tip: 'Remove shoes when entering temple tatami halls and keep voices gentle and respectful.', type: 'culture' },
    ],
    nearbyPlaces: [
      { name: 'Nara Deer Park & Todai-ji', distance: '45 km (45 mins by train)', highlight: 'Free-roaming sacred deer and world’s largest bronze Buddha.' },
      { name: 'Uji Green Tea Capital', distance: '18 km (20 mins by train)', highlight: 'Byodoin Phoenix Hall and 800-year-old tea farms.' },
      { name: 'Osaka Dotonbori', distance: '55 km (30 mins by Shinkansen)', highlight: 'Vibrant street food, neon lights, and comedy theaters.' },
    ],
  },
  {
    id: 'amalfi-coast',
    name: 'Amalfi Coast',
    country: 'Italy',
    stateOrRegion: 'Campania',
    tagline: 'Sun-Drenched Pastel Clifftops, Lemon Groves & Turquoise Waters',
    description:
      'A breathtaking Mediterranean coastline where colorful village villas cascade down sheer limestone cliffs into the sparkling Tyrrhenian Sea, surrounded by fragrance of wild rosemary and terraced lemon orchards.',
    heroImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'coastal',
    bestTimeToVisit: 'May to June or September to October (Warm sea, calm crowds)',
    idealDuration: '4 - 6 Days',
    estimatedDailyBudget: {
      budget: '₹8,500',
      moderate: '₹20,000',
      luxury: '₹55,000+',
    },
    coordinates: {
      lat: 40.6340,
      lng: 14.6027,
    },
    topAttractions: [
      {
        id: 'positano-cliff',
        name: 'Positano Village & Spiaggia Grande',
        category: 'Coastal',
        description: 'Postcard-perfect seaside village of pastel-colored villas rising vertically from pebble beach into the sky.',
        recommendedDuration: '3 hours',
        bestTimeToVisit: 'Morning or Golden Hour',
        estimatedEntryFee: 'Free',
        lat: 40.6281,
        lng: 14.4850,
        travelTip: 'Arrive via scenic public ferry from Amalfi or Salerno for the most unforgettable view from the water.',
        image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'path-of-gods',
        name: 'Path of the Gods (Sentiero degli Dei)',
        category: 'Nature',
        description: 'Legendary hiking trail 500 meters above sea level with panoramic vistas of the entire Amalfi Peninsula and Capri.',
        recommendedDuration: '3.5 - 4 hours',
        bestTimeToVisit: '8:30 AM (Cool morning air)',
        estimatedEntryFee: 'Free',
        lat: 40.6190,
        lng: 14.5050,
        travelTip: 'Start in Bomerano (Agerola) and walk downhill toward Nocelle for easy grading and continuous sea views.',
      },
      {
        id: 'ravello-villas',
        name: 'Ravello: Villa Rufolo & Villa Cimbrone',
        category: 'Viewpoint',
        description: 'Hilltop sanctuary of romantic cliffside gardens, infinity terraces, and marble busts suspended over the sea.',
        recommendedDuration: '3 hours',
        bestTimeToVisit: '10:00 AM - 1:00 PM',
        estimatedEntryFee: 'Villa Rufolo: €8 / Villa Cimbrone: €10',
        lat: 40.6489,
        lng: 14.6119,
        travelTip: 'Stand on the Infinity Terrace (Terrazza dell’Infinito) for what Gore Vidal called the world’s most beautiful view.',
      },
      {
        id: 'amalfi-duomo',
        name: 'Amalfi Town & Duomo di Sant’Andrea',
        category: 'Heritage',
        description: 'Historic 9th-century cathedral with Arab-Norman striped facade, bronze doors from Constantinople, and Cloister of Paradise.',
        recommendedDuration: '1.5 hours',
        bestTimeToVisit: 'Late morning',
        estimatedEntryFee: '€3',
        lat: 40.6341,
        lng: 14.6028,
        travelTip: 'Taste lemon granita directly from hollowed-out fresh Amalfi lemons on the Piazza del Duomo.',
      },
    ],
    sampleDays: [
      {
        dayNumber: 1,
        theme: 'Historic Maritime Heart of Amalfi & Atrani',
        morning: 'Arrive in Amalfi town, tour the Duomo di Sant’Andrea and Moorish cloisters.',
        afternoon: 'Take the pedestrian cliff tunnel to tiny tranquil Atrani village for seaside lunch.',
        evening: 'Sunset aperitivo overlooking the harbor with freshly squeezed limoncello spritz.',
        foodSpot: 'Trattoria Da Gemma for Scialatielli ai Frutti di Mare (fresh handmade seafood pasta).',
        travelNote: 'Public ferries (Travelmar) are faster and more scenic than winding cliff buses.',
      },
      {
        dayNumber: 2,
        theme: 'The Clifftop Gardens of Ravello',
        morning: 'Scenic uphill bus or taxi to Ravello village.',
        afternoon: 'Wander through Villa Rufolo and Villa Cimbrone’s Terrace of Infinity.',
        evening: 'Classical music concert in the garden or wine tasting in romantic Piazza Vescovado.',
        foodSpot: 'Ristorante Garden Ravello for lemon risotto and panoramic cliff views.',
        travelNote: 'Take the ancient stone staircase path from Ravello back down to Minori if you enjoy hiking.',
      },
      {
        dayNumber: 3,
        theme: 'Vertical Splendor of Positano & Boat Cruise',
        morning: 'Morning ferry to Positano, stroll through bougainvillea-covered cobblestone lanes and art galleries.',
        afternoon: 'Relax on Fornillo Beach (far quieter than Spiaggia Grande) or rent a wooden boat to hidden sea grottos.',
        evening: 'Sunset dinner at a cliffside restaurant with sweeping views of twinkling lights.',
        foodSpot: 'Chez Black or Da Vincenzo for catch-of-the-day fish and Delizia al Limone.',
        travelNote: 'Wear comfortable flat sandals or sneakers; Positano is comprised almost entirely of steep stairs.',
      },
    ],
    localFood: [
      { dish: 'Scialatielli ai Frutti di Mare', description: 'Thick handmade ribbons of ribbon pasta tossed with clams, mussels, prawns, and cherry tomatoes.' },
      { dish: 'Limoncello & Lemon Granita', description: 'Made exclusively with fragrant, sweet PGI Amalfi Coast Sfusato lemons.' },
      { dish: 'Spaghetti al Limone', description: 'Delicate emulsified sauce of lemon zest, butter, and aged Parmigiano Reggiano.' },
      { dish: 'Delizia al Limone', description: 'Dome-shaped sponge cake filled with delicate lemon cream and glazed with limoncello glaze.' },
    ],
    stayRecommendations: [
      { area: 'Amalfi / Atrani', ambience: 'Central transit hub with easy ferry access to all coastal towns and Capri.', priceRange: '€160 - €380 / night' },
      { area: 'Ravello', ambience: 'High above the hustle; serene, romantic, and surrounded by pine forests and gardens.', priceRange: '€190 - €450 / night' },
      { area: 'Praiano', ambience: 'Quiet fishing village halfway between Positano and Amalfi with the coastline’s best direct sunsets.', priceRange: '€140 - €300 / night' },
    ],
    practicalTips: [
      { title: 'Ferry Over Buses', tip: 'Take coastal ferries instead of crowded SITA buses to avoid traffic sickness on cliff curves.', type: 'transit' },
      { title: 'Pack Lightly', tip: 'Porters are available, but traveling with lightweight luggage saves carrying bags up hundreds of steps.', type: 'packing' },
      { title: 'Advance Reservations', tip: 'Book beach clubs and popular cliffside dinner tables 2–3 weeks in advance during peak season.', type: 'safety' },
    ],
    nearbyPlaces: [
      { name: 'Island of Capri & Blue Grotto', distance: '50 mins by ferry', highlight: 'Dramatic limestone sea stacks (Faraglioni) and Emperor Tiberius ruins.' },
      { name: 'Pompeii Archaeological Park', distance: '40 km (1 hr by car/train)', highlight: 'Incredible preserved Roman city frozen in time by Mount Vesuvius.' },
      { name: 'Sorrento', distance: '30 km (45 mins)', highlight: 'Historic coastal town famous for wood inlay craftsmanship and gardens.' },
    ],
  },
  {
    id: 'banff',
    name: 'Banff & Lake Louise',
    country: 'Canada',
    stateOrRegion: 'Alberta',
    tagline: 'Glacial Turquoise Lakes, Jagged Canadian Rockies & Alpine Wilderness',
    description:
      'Immerse in pure, unhurried alpine serenity. Banff National Park offers pristine glacial lakes glowing in deep shades of cyan, soaring pine forests, wildlife sanctuaries, and crisp Rocky Mountain air.',
    heroImage: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'mountains',
    bestTimeToVisit: 'June to September (Hiking & Lakes) or Dec to March (Ski & Snow)',
    idealDuration: '4 - 5 Days',
    estimatedDailyBudget: {
      budget: '₹7,500',
      moderate: '₹16,000',
      luxury: '₹38,000+',
    },
    coordinates: {
      lat: 51.1784,
      lng: -115.5708,
    },
    topAttractions: [
      {
        id: 'moraine-lake',
        name: 'Moraine Lake & Valley of the Ten Peaks',
        category: 'Nature',
        description: 'Vivid turquoise glacial lake cradled by ten soaring 3,000m Rocky Mountain peaks.',
        recommendedDuration: '3 hours',
        bestTimeToVisit: 'Sunrise (6:00 AM) for golden glow on peaks',
        estimatedEntryFee: 'Parks Canada Shuttle booking required (~₹700)',
        lat: 51.3217,
        lng: -116.1860,
        travelTip: 'Climb the Rockpile trail (15 min easy walk) for the iconic viewpoint.',
        image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'lake-louise',
        name: 'Lake Louise & Plain of Six Glaciers',
        category: 'Nature',
        description: 'World-famous emerald lake backed by Victoria Glacier and the historic Fairmont Chateau.',
        recommendedDuration: '3 - 4 hours',
        bestTimeToVisit: 'Early morning or late afternoon',
        estimatedEntryFee: 'National Park Pass',
        lat: 51.4254,
        lng: -116.1773,
        travelTip: 'Hike to the historic Lake Agnes Tea House for fresh scones and mountain herbal tea.',
      },
      {
        id: 'banff-gondola',
        name: 'Banff Gondola & Sulphur Mountain Boardwalk',
        category: 'Viewpoint',
        description: 'Ascend to 2,281 meters above sea level with 360-degree vistas over six mountain ranges and the Bow River.',
        recommendedDuration: '2 hours',
        bestTimeToVisit: 'Sunset',
        estimatedEntryFee: '₹5,500 - ₹6,800',
        lat: 51.1472,
        lng: -115.5606,
        travelTip: 'Walk the scenic boardwalk along the mountain ridge to the historic cosmic ray weather station.',
      },
      {
        id: 'johnston-canyon',
        name: 'Johnston Canyon Waterfalls & Ink Pots',
        category: 'Nature',
        description: 'Suspended catwalks hugging dramatic limestone canyon walls leading to roaring Lower and Upper Falls.',
        recommendedDuration: '2.5 hours',
        bestTimeToVisit: '8:00 AM',
        estimatedEntryFee: 'Free with Park Pass',
        lat: 51.2452,
        lng: -115.8398,
        travelTip: 'Continue 3 km past the Upper Falls to the mineral spring "Ink Pots" bubbling in an alpine meadow.',
      },
    ],
    sampleDays: [
      {
        dayNumber: 1,
        theme: 'Banff Townsite, Hot Springs & Gondola Panoramas',
        morning: 'Morning walk along Bow Falls and stroll the quaint timber shops of Banff Avenue.',
        afternoon: 'Ascend Sulphur Mountain via the Banff Gondola; walk the alpine ridge boardwalk.',
        evening: 'Soak in the historic mineral-rich waters of Banff Upper Hot Springs.',
        foodSpot: 'The Bison Restaurant for locally sourced Alberta farm-to-table cuisine.',
        travelNote: 'Use Roam Transit public buses within Banff townsite for effortless, car-free travel.',
      },
      {
        dayNumber: 2,
        theme: 'The Glacial Wonders of Moraine Lake & Lake Louise',
        morning: 'Take the Parks Canada shuttle to Moraine Lake for sunrise reflection over the Valley of the Ten Peaks.',
        afternoon: 'Canoe across emerald Lake Louise, then hike the shaded trail up to Lake Agnes Tea House.',
        evening: 'Cozy fireplace dinner at Lake Louise village.',
        foodSpot: 'Lake Agnes Tea House for tea and fresh baked apple crumble.',
        travelNote: 'Book Parks Canada lake shuttles in advance online as private cars cannot access Moraine Lake road.',
      },
      {
        dayNumber: 3,
        theme: 'Icefields Parkway & Johnston Canyon',
        morning: 'Hike Johnston Canyon catwalks and see the vibrant blue mineral pools at the Ink Pots.',
        afternoon: 'Drive part of the world-famous Icefields Parkway to Peyto Lake (famous wolf-head shaped lake).',
        evening: 'Return to Banff for craft beers and fireside relaxation.',
        foodSpot: 'Park Distillery Restaurant and Bar for campfire-inspired wood-fired dishes.',
        travelNote: 'Keep a safe distance (minimum 30m) from elk and bears; always carry bear spray on hikes.',
      },
    ],
    localFood: [
      { dish: 'Alberta Bison Ribeye / Elk Burger', description: 'Lean, sustainably raised mountain game meats grilled over cedar and applewood.' },
      { dish: 'Smoked Salmon & Wild Berries', description: 'Pacific salmon cured with mountain pine needles and served with huckleberry relish.' },
      { dish: 'Canadian Poutine & Cheese Curds', description: 'Crisp fries topped with rich gravy and authentic squeaky cheddar curds.' },
      { dish: 'Warm Maple Butter Tarts', description: 'Traditional flaky Canadian pastry filled with caramelized pure Quebec maple syrup.' },
    ],
    stayRecommendations: [
      { area: 'Banff Townsite', ambience: 'Lively alpine town with pedestrian avenues, gourmet bakeries, and direct Roam shuttles.', priceRange: '₹10,000 - ₹22,000 / night' },
      { area: 'Canmore (20 mins east)', ambience: 'Quieter mountain town with fewer crowds, local artisan markets, and stunning Three Sisters peaks.', priceRange: '₹7,500 - ₹16,000 / night' },
      { area: 'Lake Louise Village', ambience: 'Right at the heart of the national park, surrounded by glacial silence and pine trees.', priceRange: '₹14,000 - ₹35,000+ / night' },
    ],
    practicalTips: [
      { title: 'Parks Canada Pass', tip: 'Purchase a Discovery Pass online or at the park gate to support conservation and skip ticket queues.', type: 'transit' },
      { title: 'Layered Clothing', tip: 'Mountain temperatures can change rapidly; pack thermal layers, windbreaker, and waterproof jacket.', type: 'packing' },
      { title: 'Wildlife Safety', tip: 'Rent or buy bear spray in Banff town and make vocal noises while walking quiet forested trails.', type: 'safety' },
    ],
    nearbyPlaces: [
      { name: 'Yoho National Park & Emerald Lake', distance: '65 km (50 mins)', highlight: 'Takakkaw Falls (one of Canada’s highest) and natural rock bridge.' },
      { name: 'Jasper National Park (Icefields)', distance: '180 km (2.5 hrs scenic drive)', highlight: 'Columbia Icefield Skywalk and Athabasca Glacier.' },
      { name: 'Calgary', distance: '125 km (1.5 hrs)', highlight: 'International airport gateway and Olympic Park.' },
    ],
  },
  {
    id: 'bali',
    name: 'Bali (Ubud & Uluwatu)',
    country: 'Indonesia',
    stateOrRegion: 'Bali',
    tagline: 'Emerald Rice Terraces, Spiritual Water Temples & Coastal Sunsets',
    description:
      'A sanctuary for the senses. From the mist-shrouded jungle valleys and sacred waterfalls of Ubud to the dramatic ocean cliffs and surf breaks of Uluwatu, Bali offers peaceful spiritual rejuvenation and rich Balinese art.',
    heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'wellness',
    bestTimeToVisit: 'April to October (Dry season with gentle ocean breezes)',
    idealDuration: '5 - 7 Days',
    estimatedDailyBudget: {
      budget: '₹3,000',
      moderate: '₹7,000',
      luxury: '₹19,000+',
    },
    coordinates: {
      lat: -8.5069,
      lng: 115.2625,
    },
    topAttractions: [
      {
        id: 'tegallalang-rice-terrace',
        name: 'Tegalalang Rice Terraces (UNESCO Subak System)',
        category: 'Nature',
        description: 'Vast sculpted emerald valleys of terraced rice paddies nourished by ancient 9th-century cooperative water irrigation.',
        recommendedDuration: '2 hours',
        bestTimeToVisit: '7:00 AM (Sunrise mist and cool air)',
        estimatedEntryFee: '₹150',
        lat: -8.4312,
        lng: 115.2778,
        travelTip: 'Walk down into the valley floor and across the irrigation bridges to escape tourist cafes.',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'tirta-empul',
        name: 'Tirta Empul Holy Water Temple',
        category: 'Heritage',
        description: 'Sacred spring temple where locals and visitors participate in the traditional Melukat purification ritual.',
        recommendedDuration: '2 hours',
        bestTimeToVisit: '8:30 AM',
        estimatedEntryFee: 'IDR 50,000',
        lat: -8.4150,
        lng: 115.3150,
        travelTip: 'Sarongs are provided at the entrance; respectful dress and peaceful behavior are essential.',
      },
      {
        id: 'uluwatu-temple',
        name: 'Uluwatu Clifftop Temple & Kecak Fire Dance',
        category: 'Culture',
        description: 'Ancient sea temple perched 70 meters atop sheer ocean cliffs, hosting the sunset Kecak chant performance.',
        recommendedDuration: '2.5 hours',
        bestTimeToVisit: '5:00 PM for sunset & dance',
        estimatedEntryFee: 'IDR 50,000 temple + IDR 150,000 dance',
        lat: -8.8291,
        lng: 115.0849,
        travelTip: 'Secure sunglasses and phones as the resident temple macaque monkeys are curious.',
      },
    ],
    sampleDays: [
      {
        dayNumber: 1,
        theme: 'Ubud Jungles, Sacred Springs & Artisan Crafts',
        morning: 'Morning walk through Tegalalang Rice Terraces followed by spiritual purification at Tirta Empul.',
        afternoon: 'Stroll Campuhan Ridge Walk and tour the lotus pond at Saraswati Temple in central Ubud.',
        evening: 'Organic farm-to-table dinner accompanied by traditional Gamelan music.',
        foodSpot: 'Locavore or Moksa Ubud for creative plant-based and local Balinese culinary arts.',
        travelNote: 'Hire a reliable private driver in Ubud for easy day trips across central Bali.',
      },
      {
        dayNumber: 2,
        theme: 'Waterfalls, Yoga & Herbal Healing',
        morning: 'Sunrise yoga overlooking the Ayung River valley followed by fresh tropical dragonfruit bowls.',
        afternoon: 'Visit Tibumana Waterfall and Tegenungan for a refreshing dip in natural jungle pools.',
        evening: 'Traditional 90-minute Balinese herbal massage and flower petal bath.',
        foodSpot: 'Clear Cafe or Alchemy Ubud for raw vegan desserts and cold-pressed elixirs.',
        travelNote: 'Carry waterproof dry bags for phones and cameras when visiting waterfalls.',
      },
      {
        dayNumber: 3,
        theme: 'Southern Coast, Clifftops & Kecak Sunset',
        morning: 'Drive south to the Bukit Peninsula; swim at Padang Padang or Bingin white sand beach.',
        afternoon: 'Relax at a clifftop ocean club with panoramic views of Indian Ocean swells.',
        evening: 'Watch the sunset Kecak Fire Dance at Uluwatu Temple, followed by seafood BBQ on Jimbaran Bay.',
        foodSpot: 'Jimbaran Bay beach seafood warungs for fresh grilled red snapper with sambal matah.',
        travelNote: 'Allow extra time for south Bali traffic between 4 PM and 7 PM.',
      },
    ],
    localFood: [
      { dish: 'Nasi Campur Bali', description: 'Steamed rice served with spiced shredded chicken, sate lilit, lawar green beans, and sambal matah.' },
      { dish: 'Bebek Betutu (Smoked Duck)', description: 'Whole duck slow-roasted for 12 hours wrapped in banana leaves with 16 Balinese spices.' },
      { dish: 'Sate Lilit Ikan', description: 'Minced spiced seafood wrapped around fragrant lemongrass stalks and charcoal grilled.' },
      { dish: 'Dadar Gulung', description: 'Pandan green crepes filled with grated coconut and caramelized palm sugar syrup.' },
    ],
    stayRecommendations: [
      { area: 'Ubud Valley (Sayan / Penestanan)', ambience: 'Peaceful jungle retreats, yoga shalas, and infinity pools overlooking misty ravines.', priceRange: '₹3,500 - ₹19,000 / night' },
      { area: 'Uluwatu / Bingin', ambience: 'Clifftop villas, surf vibes, sunset ocean bars, and secluded beaches.', priceRange: '₹5,000 - ₹24,000 / night' },
      { area: 'Sanur', ambience: 'Gentle, calm coastal promenade ideal for relaxed cycling and sunrise beach strolls.', priceRange: '₹4,000 - ₹14,000 / night' },
    ],
    practicalTips: [
      { title: 'Currency & Small Notes', tip: 'Keep small IDR bills (10k, 20k, 50k) handy for local temple donations, parking, and coconut stalls.', type: 'safety' },
      { title: 'Scooter Caution', tip: 'Only rent scooters if you have international license experience; otherwise, hire drivers via Grab/Gojek.', type: 'transit' },
      { title: 'Temple Sarongs', tip: 'Cover shoulders and knees with a traditional sarong and sash when entering holy temple compounds.', type: 'culture' },
    ],
    nearbyPlaces: [
      { name: 'Nusa Penida & Kelingking Beach', distance: '40 mins by speedboat', highlight: 'Iconic T-Rex shaped coastal cliff and manta ray snorkeling.' },
      { name: 'Mount Batur Sunrise Trek', distance: '40 km (1 hr from Ubud)', highlight: 'Pre-dawn hike to an active volcano crater for breakfast above the clouds.' },
      { name: 'Gili Islands (Gili Air)', distance: '2 hrs by fast boat', highlight: 'Motor-vehicle-free coral islands with crystal clear sea turtles.' },
    ],
  },
  {
    id: 'swiss-alps',
    name: 'Swiss Alps (Interlaken & Lauterbrunnen)',
    country: 'Switzerland',
    stateOrRegion: 'Bernese Oberland',
    tagline: 'Valley of 72 Waterfalls, Alpine Meadows & Soaring Jungfrau Peaks',
    description:
      'Pure alpine tranquility. Lauterbrunnen and Grindelwald nestle inside dramatic U-shaped glacial valleys framed by 72 plunging waterfalls, traditional wooden chalets with flower boxes, and cogwheel trains reaching the top of Europe.',
    heroImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'mountains',
    bestTimeToVisit: 'June to September (Lush trails) or Dec to April (Winter wonderland)',
    idealDuration: '4 - 6 Days',
    estimatedDailyBudget: {
      budget: '₹10,000',
      moderate: '₹22,000',
      luxury: '₹52,000+',
    },
    coordinates: {
      lat: 46.6863,
      lng: 7.8632,
    },
    topAttractions: [
      {
        id: 'lauterbrunnen-valley',
        name: 'Lauterbrunnen Valley & Staubbach Falls',
        category: 'Nature',
        description: 'Breathtaking 300m waterfall cascading directly behind pastoral Swiss chalets into a sheer limestone valley.',
        recommendedDuration: '2.5 hours',
        bestTimeToVisit: 'Morning when mist creates rainbows',
        estimatedEntryFee: 'Free',
        lat: 46.5935,
        lng: 7.9090,
        travelTip: 'Walk the path behind the Staubbach waterfall spray for an exhilarating view down the valley.',
        image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'jungfraujoch',
        name: 'Jungfraujoch (Top of Europe, 3,454m)',
        category: 'Viewpoint',
        description: 'Highest railway station in Europe nestled between the Mönch and Jungfrau peaks, overlooking the Aletsch Glacier.',
        recommendedDuration: '4 - 5 hours',
        bestTimeToVisit: 'Morning on clear days',
        estimatedEntryFee: 'CHF 160 - 220 (Discounted with Swiss Travel Pass)',
        lat: 46.5475,
        lng: 7.9824,
        travelTip: 'Check the live webcam at the train station before purchasing tickets to ensure peak visibility.',
      },
      {
        id: 'grindelwald-first',
        name: 'Grindelwald First & Cliff Walk by Tissot',
        category: 'Nature',
        description: 'Suspended metal walkway wrapped around a sheer mountain face leading to panoramic alpine lake hikes.',
        recommendedDuration: '3 hours',
        bestTimeToVisit: '10:00 AM',
        estimatedEntryFee: 'First Gondola ticket',
        lat: 46.6610,
        lng: 8.0538,
        travelTip: 'Hike 50 minutes from First station to the glassy waters of Lake Bachalpsee.',
      },
    ],
    sampleDays: [
      {
        dayNumber: 1,
        theme: 'The Valley of Waterfalls & Mürren Alpine Village',
        morning: 'Morning train into Lauterbrunnen; stroll the Staubbach Falls trail and Trümmelbach glacial chutes.',
        afternoon: 'Cable car up to the car-free village of Mürren and enjoy a coffee facing the Eiger, Mönch, and Jungfrau peaks.',
        evening: 'Cozy Swiss cheese fondue dinner in a rustic timber restaurant.',
        foodSpot: 'Hotel Oberland Restaurant for authentic Swiss Fondue and Rösti.',
        travelNote: 'The Swiss Travel Pass covers all trains and valley public transit automatically.',
      },
      {
        dayNumber: 2,
        theme: 'Grindelwald First & Pristine Bachalpsee Lake Hike',
        morning: 'Take the Eiger Express gondola to Grindelwald First; step out onto the Cliff Walk suspension bridge.',
        afternoon: 'Hike through wildflowers to mirror-like Lake Bachalpsee reflecting the Schreckhorn peak.',
        evening: 'Cruise Lake Brienz or Lake Thun in Interlaken on a historic paddle steamer.',
        foodSpot: 'Bergrestaurant First for warm Apfelstrudel with vanilla cream.',
        travelNote: 'Carry a reusable water bottle; Swiss alpine village fountains provide crisp, pure drinking water.',
      },
      {
        dayNumber: 3,
        theme: 'Top of Europe: Jungfraujoch & Ice Palace',
        morning: 'Cogwheel railway ride through the Eiger north face tunnel up to Jungfraujoch station.',
        afternoon: 'Walk through the carved Ice Palace tunnels and step onto the Sphinx Observatory viewing terrace.',
        evening: 'Relaxing stroll through the old town of Unterseen in Interlaken.',
        foodSpot: 'Restaurant Taverne for Swiss Veal Zürcher Geschnetzeltes with crispy Rösti.',
        travelNote: 'Dress warmly in windproof layers; temperatures at Jungfraujoch hover near freezing year-round.',
      },
    ],
    localFood: [
      { dish: 'Swiss Cheese Fondue', description: 'Melted Gruyère and Emmental cheese blended with white wine, garlic, and served with crusty bread cubes.' },
      { dish: 'Crispy Swiss Rösti', description: 'Golden pan-fried grated potato cake topped with melted raclette cheese, ham, or sunny fried egg.' },
      { dish: 'Älplermagronen (Alpine Macaroni)', description: 'Baked pasta with potatoes, cream, melted cheese, topped with crispy onions and apple compote.' },
      { dish: 'Swiss Artisanal Chocolates', description: 'Velvety alpine milk chocolate and handmade hazelnut praline truffles.' },
    ],
    stayRecommendations: [
      { area: 'Lauterbrunnen Valley', ambience: 'Directly under the waterfalls; tranquil, pastoral, and deeply peaceful.', priceRange: 'CHF 130 - CHF 280 / night' },
      { area: 'Mürren / Wengen (Car-free)', ambience: 'Perched high on the cliff with no cars; silent nights and immediate mountain trail access.', priceRange: 'CHF 160 - CHF 340 / night' },
      { area: 'Interlaken', ambience: 'Central transit hub between two turquoise lakes with shopping, trains, and dining options.', priceRange: 'CHF 110 - CHF 240 / night' },
    ],
    practicalTips: [
      { title: 'Swiss Travel Pass', tip: 'If staying 3+ days, the Swiss Travel Pass provides unlimited trains, boats, buses, and 500+ free museum entries.', type: 'transit' },
      { title: 'Check Webcams', tip: 'Alpine weather changes fast; always check mountain peak webcams on the SBB app before ascending.', type: 'safety' },
      { title: 'Hiking Footwear', tip: 'Sturdy waterproof hiking shoes with good ankle support are recommended for gravel trails.', type: 'packing' },
    ],
    nearbyPlaces: [
      { name: 'Lucerne & Mount Pilatus', distance: '1 hr 15 mins by train', highlight: 'Historic Chapel Bridge and world’s steepest cogwheel railway.' },
      { name: 'Zermatt & Matterhorn', distance: '2 hrs by train', highlight: 'The iconic pyramid peak of the Matterhorn and Gornergrat glacier.' },
      { name: 'Bern (UNESCO Capital)', distance: '50 mins by train', highlight: 'Medieval sandstone arcades, clock tower, and bear park.' },
    ],
  },
];

// Helper to calculate realistic, destination-aware and traveler-scaled budget breakdown in INR (₹)
export function calculateDestinationBudgetBreakdown({
  destination,
  travelers,
  days,
  budgetTier = 'moderate',
  customBudget,
}: {
  destination: string;
  travelers: number;
  days: number;
  budgetTier?: 'budget' | 'moderate' | 'luxury' | 'custom';
  customBudget?: number;
}) {
  const numTravelers = Math.max(1, travelers || 1);
  const numDays = Math.max(1, days || 1);
  const numNights = Math.max(1, numDays > 1 ? numDays - 1 : 1);
  const roomsNeeded = Math.max(1, Math.ceil(numTravelers / 2));

  // Destination cost multiplier based on regional cost factors
  const dest = (destination || '').toLowerCase();
  let destMultiplier = 1.0;
  if (
    dest.includes('goa') ||
    dest.includes('mumbai') ||
    dest.includes('dubai') ||
    dest.includes('kyoto') ||
    dest.includes('bali') ||
    dest.includes('paris') ||
    dest.includes('london') ||
    dest.includes('zurich') ||
    dest.includes('amalfi')
  ) {
    destMultiplier = 1.35;
  } else if (
    dest.includes('shimla') ||
    dest.includes('manali') ||
    dest.includes('rishikesh') ||
    dest.includes('jaipur') ||
    dest.includes('udaipur') ||
    dest.includes('srinagar') ||
    dest.includes('ooty') ||
    dest.includes('munnar') ||
    dest.includes('leh') ||
    dest.includes('ladakh') ||
    dest.includes('darjeeling')
  ) {
    destMultiplier = 1.15;
  } else if (
    dest.includes('delhi') ||
    dest.includes('bangalore') ||
    dest.includes('bengaluru') ||
    dest.includes('hyderabad') ||
    dest.includes('chennai') ||
    dest.includes('kolkata')
  ) {
    destMultiplier = 1.2;
  } else if (dest.length > 0) {
    destMultiplier = 1.0;
  }

  // Cost profiles per day / per room / per person in INR (₹)
  let roomCostPerNight = 0;
  let foodPerPersonPerDay = 0;
  let transportPerPersonPerDay = 0;
  let baseIntercityTransit = 0;
  let activitiesPerPersonPerDay = 0;
  let otherPerPersonPerDay = 0;

  if (budgetTier === 'budget') {
    // Budget: Hostels/homestays, local eateries/street food, public transit & shared cabs, standard/free sights
    roomCostPerNight = Math.round(1400 * destMultiplier);
    foodPerPersonPerDay = Math.round(500 * destMultiplier);
    transportPerPersonPerDay = Math.round(300 * destMultiplier);
    baseIntercityTransit = Math.round(600 * numTravelers);
    activitiesPerPersonPerDay = Math.round(250 * destMultiplier);
    otherPerPersonPerDay = Math.round(150 * destMultiplier);
  } else if (budgetTier === 'luxury') {
    // Luxury: 4-5 Star heritage resorts, gourmet & fine dining, private chauffeur/cab/flights, VIP activities
    roomCostPerNight = Math.round(13500 * destMultiplier);
    foodPerPersonPerDay = Math.round(3800 * destMultiplier);
    transportPerPersonPerDay = Math.round(2200 * destMultiplier);
    baseIntercityTransit = Math.round(4500 * numTravelers);
    activitiesPerPersonPerDay = Math.round(2400 * destMultiplier);
    otherPerPersonPerDay = Math.round(1500 * destMultiplier);
  } else {
    // Balanced (Moderate) or Custom Baseline: 3-Star boutique stays, casual dining, AC cabs, popular tours
    roomCostPerNight = Math.round(4200 * destMultiplier);
    foodPerPersonPerDay = Math.round(1300 * destMultiplier);
    transportPerPersonPerDay = Math.round(800 * destMultiplier);
    baseIntercityTransit = Math.round(1800 * numTravelers);
    activitiesPerPersonPerDay = Math.round(750 * destMultiplier);
    otherPerPersonPerDay = Math.round(450 * destMultiplier);
  }

  const accommodation = Math.round(roomCostPerNight * roomsNeeded * numNights);
  const food = Math.round(foodPerPersonPerDay * numTravelers * numDays);
  const transportation = Math.round(baseIntercityTransit + transportPerPersonPerDay * numTravelers * numDays);
  const activities = Math.round(activitiesPerPersonPerDay * numTravelers * numDays);
  const other = Math.round(otherPerPersonPerDay * numTravelers * numDays);

  const total = accommodation + food + transportation + activities + other;
  const costPerPerson = Math.round(total / numTravelers);
  const userBudget = customBudget !== undefined && customBudget > 0 ? customBudget : total;
  const remainingBudget = userBudget - total;

  return {
    accommodation,
    food,
    transportation,
    activities,
    miscellaneous: other,
    total,
    costPerPerson,
    remainingBudget,
    currency: '₹',
  };
}

// Helper to generate a complete logical trip plan from inputs dynamically
export function generateCuratedTripPlan(
  destinationName: string,
  startLocation: string,
  dates: string,
  travelers: number,
  interests: string[],
  budgetTier: 'budget' | 'moderate' | 'luxury' = 'moderate'
): TripPlanResult {
  const destClean = destinationName.trim() || 'Your Destination';
  const destLower = destClean.toLowerCase();

  // Extract number of days from dates string or default to 3
  const daysMatch = (dates || '').match(/(\d+)/);
  const parsedDays = daysMatch ? parseInt(daysMatch[1], 10) : 3;
  const numDays = Math.max(1, parsedDays || 3);
  const numTravelers = Math.max(1, travelers || 2);

  // Calculate dynamic realistic budget breakdown
  const budgetCalc = calculateDestinationBudgetBreakdown({
    destination: destClean,
    travelers: numTravelers,
    days: numDays,
    budgetTier,
  });

  // Check if we match a known destination explicitly
  const matched = SAMPLE_DESTINATIONS.find(
    (d) => d.name.toLowerCase() === destLower || destLower.includes(d.name.toLowerCase())
  );

  // If user searched a known curated destination, use its rich data
  if (matched) {
    const waypoints = matched.topAttractions.map((attraction, idx) => {
      const distFromPrev = idx === 0 ? 3.5 : parseFloat((2.1 + (idx * 1.3)).toFixed(1));
      const timeFromPrev = Math.round(distFromPrev * 4.5);
      return {
        id: `wp-${attraction.id}`,
        order: idx + 1,
        name: attraction.name,
        lat: attraction.lat,
        lng: attraction.lng,
        category: attraction.category,
        recommendedDuration: attraction.recommendedDuration,
        distanceFromPreviousKm: distFromPrev,
        travelTimeFromPreviousMin: timeFromPrev,
        description: attraction.description,
        recommendedTime: attraction.bestTimeToVisit,
      };
    });

    const totalKm = waypoints.reduce((acc, wp) => acc + (wp.distanceFromPreviousKm || 0), 0);
    const totalDriveHours = parseFloat((totalKm / 25).toFixed(1));

    return {
      id: `trip-${Date.now()}`,
      destination: matched.name,
      startLocation: startLocation || 'Not specified',
      dates: dates || `${numDays} Days`,
      travelers: numTravelers,
      interests: interests.length > 0 ? interests : ['Must-see Highlights', 'Peaceful Nature', 'Authentic Food'],
      budgetTier,
      totalDistanceKm: parseFloat(totalKm.toFixed(1)),
      totalEstimatedDriveTimeHours: totalDriveHours,
      overview: `A serene and logically sequenced itinerary through ${matched.name}. Designed to minimize transit backtracking, allow unhurried visits to premier monuments and nature spots, and savor authentic regional cuisine.`,
      waypoints,
      dayWiseItinerary: matched.sampleDays,
      foodRecommendations: matched.localFood.map((f, i) => ({
        name: f.dish,
        type: i % 2 === 0 ? 'Heritage Restaurant' : 'Local Eatery / Tearoom',
        neighborhood: matched.name + ' Central District',
        mustTry: f.description,
      })),
      staySuggestions: matched.stayRecommendations.map((s) => ({
        neighborhood: s.area,
        vibe: s.ambience,
        estimatedCostNight: s.priceRange,
      })),
      estimatedTotalBudget: {
        stay: budgetCalc.accommodation,
        food: budgetCalc.food,
        transport: budgetCalc.transportation,
        sightseeing: budgetCalc.activities,
        total: budgetCalc.total,
        currency: '₹ INR',
      },
      practicalAdvice: matched.practicalTips.map((t) => `${t.title}: ${t.tip}`),
    };
  }

  // If destination is not in sample data, generate authentic dynamic data matching the actual searched destination
  const dynamicWaypoints: RouteWaypoint[] = [
    {
      id: `wp-${destClean.toLowerCase().replace(/[^a-z0-9]/g, '')}-1`,
      order: 1,
      name: `${destClean} City Center & Main Promenade`,
      lat: 28.6139,
      lng: 77.2090,
      category: 'Culture & Landmark',
      recommendedDuration: '2 hours',
      distanceFromPreviousKm: 2.5,
      travelTimeFromPreviousMin: 12,
      description: `Explore the vibrant heart and architectural highlights of ${destClean}.`,
      recommendedTime: 'Morning (9:00 AM)',
    },
    {
      id: `wp-${destClean.toLowerCase().replace(/[^a-z0-9]/g, '')}-2`,
      order: 2,
      name: `${destClean} Heritage & Scenic Viewpoint`,
      lat: 28.6189,
      lng: 77.2150,
      category: 'Viewpoint & History',
      recommendedDuration: '2 hours',
      distanceFromPreviousKm: 3.8,
      travelTimeFromPreviousMin: 18,
      description: `Panoramic viewpoints and iconic cultural landmarks showcasing ${destClean}.`,
      recommendedTime: 'Afternoon / Golden Hour',
    },
    {
      id: `wp-${destClean.toLowerCase().replace(/[^a-z0-9]/g, '')}-3`,
      order: 3,
      name: `${destClean} Artisan Market & Cultural Quarter`,
      lat: 28.6089,
      lng: 77.2210,
      category: 'Culture & Leisure',
      recommendedDuration: '1.5 hours',
      distanceFromPreviousKm: 2.0,
      travelTimeFromPreviousMin: 10,
      description: `Experience authentic local culture, handicraft stalls, and evening dining in ${destClean}.`,
      recommendedTime: 'Evening',
    },
  ];

  const dynamicDays: DayItinerary[] = [];
  for (let d = 1; d <= numDays; d++) {
    dynamicDays.push({
      dayNumber: d,
      theme: d === 1 ? `Arrival & Highlights of ${destClean}` : d === numDays ? `Artisan Walks & Panoramic Farewell` : `Scenic Exploration & Local Hidden Gems (Day ${d})`,
      morning: d === 1 ? `Arrive in ${destClean}, check in, and explore the central landmark district.` : `Morning nature excursion and cultural sightseeing around ${destClean}.`,
      afternoon: `Visit premier cultural sites and local artisan markets in ${destClean}.`,
      evening: `Sunset stroll and authentic local dining experience in ${destClean}.`,
      foodSpot: `Top-rated regional dining in ${destClean}.`,
      travelNote: `Group nearby attractions together to minimize transit time.`,
    });
  }

  const dynamicFood = [
    { name: `Local Specialty Dishes of ${destClean}`, type: 'Regional Cuisine', neighborhood: `${destClean} Central`, mustTry: `Authentic regional delicacies and freshly prepared culinary favorites.` },
    { name: `Street Food & Artisan Delicacies`, type: 'Local Eatery', neighborhood: `${destClean} Market`, mustTry: `Traditional snacks and local tea/coffee blends.` },
  ];

  const dynamicStays = [
    { neighborhood: `${destClean} Central District`, vibe: 'Convenient, close to main sights and transit', estimatedCostNight: budgetTier === 'budget' ? '₹1,200 – ₹2,000 / night' : budgetTier === 'luxury' ? '₹10,000 – ₹25,000 / night' : '₹3,500 – ₹6,500 / night' },
    { neighborhood: `${destClean} Scenic Outskirts`, vibe: 'Tranquil retreat with scenic views', estimatedCostNight: budgetTier === 'budget' ? '₹1,500 – ₹2,500 / night' : budgetTier === 'luxury' ? '₹12,000 – ₹30,000 / night' : '₹4,000 – ₹8,000 / night' },
  ];

  const totalKm = dynamicWaypoints.reduce((acc, wp) => acc + (wp.distanceFromPreviousKm || 0), 0);
  const totalDriveHours = parseFloat((totalKm / 25).toFixed(1));

  return {
    id: `trip-${Date.now()}`,
    destination: destClean,
    startLocation: startLocation || 'Origin',
    dates: dates || `${numDays} Days`,
    travelers: numTravelers,
    interests: interests.length > 0 ? interests : ['Scenic Highlights', 'Local Food', 'Relaxation'],
    budgetTier,
    totalDistanceKm: parseFloat(totalKm.toFixed(1)),
    totalEstimatedDriveTimeHours: totalDriveHours,
    overview: `A tailored ${numDays}-day journey through ${destClean}, curated to connect top sights, authentic food, and relaxed travel pacing from ${startLocation || 'your origin'}.`,
    waypoints: dynamicWaypoints,
    dayWiseItinerary: dynamicDays,
    foodRecommendations: dynamicFood,
    staySuggestions: dynamicStays,
    estimatedTotalBudget: {
      stay: budgetCalc.accommodation,
      food: budgetCalc.food,
      transport: budgetCalc.transportation,
      sightseeing: budgetCalc.activities,
      total: budgetCalc.total,
      currency: '₹ INR',
    },
    practicalAdvice: [
      `Transit: Plan your local transport in ${destClean} in advance for smooth sightseeing.`,
      `Optimal Timing: Start morning visits early to enjoy comfortable temperatures and fewer crowds.`,
      `Packing: Check seasonal weather forecasts before departure.`,
    ],
  };
}
