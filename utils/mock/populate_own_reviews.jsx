import { useSupabase } from "@/context/supabaseContext";
import {
  extractSuggestionsIdByCategory,
  FILTER_CATEGORIES,
} from "@/constants/SearchFilters";

const userIDs = ["user_2zxQfTPsVGJdYmlxig6h9qq9TvN"];

// Updated with spicy tuna sushi images
const allImages = [
  "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1617196034183-421b4917abd8?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1563612116625-3012372fccce?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1617196034183-421b4917abd8?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1564671165093-20688ff1fffa?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1617196034183-421b4917abd8?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1563612116625-3012372fccce?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1564671165093-20688ff1fffa?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1617196034183-421b4917abd8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1563612116625-3012372fccce?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1564671165093-20688ff1fffa?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

const locations = [
  {
    address: "Via del Corso 305, 00186 Roma RM, Italy",
    latitude: 41.9027835,
    longitude: 12.4963655,
  },
  {
    address: "1-1-2 Oshiage, Sumida City, Tokyo 131-8634, Japan",
    latitude: 35.710063,
    longitude: 139.8107,
  },
  {
    address: "Thames 1759, C1414DDG CABA, Argentina",
    latitude: -34.5875,
    longitude: -58.4326,
  },
  {
    address: "15-17 Wilton Road, London SW1V 1LG, United Kingdom",
    latitude: 51.4944,
    longitude: -0.1393,
  },
  {
    address: "Al Muroor Road, Abu Dhabi, United Arab Emirates",
    latitude: 24.4539,
    longitude: 54.3773,
  },
  {
    address: "B-45, Connaught Place, New Delhi, Delhi 110001, India",
    latitude: 28.6315,
    longitude: 77.2167,
  },
  {
    address: "12 Rue Lepic, 75018 Paris, France",
    latitude: 48.8841,
    longitude: 2.3329,
  },
  {
    address:
      "Av. Paseo de la Reforma 50, Juárez, 06600 Ciudad de México, CDMX, Mexico",
    latitude: 19.4326,
    longitude: -99.1332,
  },
  {
    address: "10 Itaewon-ro 14-gil, Yongsan-gu, Seoul, South Korea",
    latitude: 37.5346,
    longitude: 126.9949,
  },
  {
    address: "123 Collins St, Melbourne VIC 3000, Australia",
    latitude: -37.8136,
    longitude: 144.9631,
  },
  {
    address: "234 Elm Street, Austin, TX 78701, USA",
    latitude: 30.2672,
    longitude: -97.7431,
  },
  {
    address: "880 Park Ave, New York, NY 10075, USA",
    latitude: 40.7736,
    longitude: -73.9647,
  },
  {
    address: "1450 3rd Street, San Francisco, CA 94158, USA",
    latitude: 37.7689,
    longitude: -122.3925,
  },
  {
    address: "119 Broadway Ave, Nashville, TN 37201, USA",
    latitude: 36.1627,
    longitude: -86.7816,
  },
  {
    address: "4527 W Sunset Blvd, Los Angeles, CA 90027, USA",
    latitude: 34.0983,
    longitude: -118.2915,
  },
  {
    address: "291 Lakeshore Blvd, Cleveland, OH 44114, USA",
    latitude: 41.5055,
    longitude: -81.6813,
  },
  {
    address: "2333 Massachusetts Ave NW, Washington, DC 20008, USA",
    latitude: 38.9175,
    longitude: -77.0515,
  },
  {
    address: "720 S Michigan Ave, Chicago, IL 60605, USA",
    latitude: 41.8721,
    longitude: -87.6247,
  },
  {
    address: "1100 S Limestone, Lexington, KY 40508, USA",
    latitude: 38.0326,
    longitude: -84.5058,
  },
  {
    address: "180 Pier Ave, Hermosa Beach, CA 90254, USA",
    latitude: 33.8617,
    longitude: -118.4016,
  },
  {
    address: "123 Ferozepur Road, Lahore, Punjab, Pakistan",
    latitude: 31.5204,
    longitude: 74.3587,
  },
  {
    address: "Plot #34, SMCHS, Karachi, Sindh, Pakistan",
    latitude: 24.8607,
    longitude: 67.0011,
  },
  {
    address: "University Road, Peshawar, Khyber Pakhtunkhwa, Pakistan",
    latitude: 34.008,
    longitude: 71.5785,
  },
  {
    address: "Sariab Road, Quetta, Balochistan, Pakistan",
    latitude: 30.1798,
    longitude: 66.975,
  },
  {
    address: "F-7 Markaz, Jinnah Super Market, Islamabad, Pakistan",
    latitude: 33.7206,
    longitude: 73.0652,
  },
  {
    address: "Thandi Sarak, Hyderabad, Sindh, Pakistan",
    latitude: 25.3969,
    longitude: 68.3578,
  },
  {
    address: "Paris Road, Sialkot, Punjab, Pakistan",
    latitude: 32.4972,
    longitude: 74.5361,
  },
  {
    address: "Boson Road, Multan, Punjab, Pakistan",
    latitude: 30.1575,
    longitude: 71.5249,
  },
  {
    address: "Satiana Road, Faisalabad, Punjab, Pakistan",
    latitude: 31.418,
    longitude: 73.0791,
  },
  {
    address: "Shahrah-e-Quaid-e-Azam, Gilgit, Pakistan",
    latitude: 35.9187,
    longitude: 74.2973,
  },
];

// Updated dishes to focus on spicy tuna varieties
const dishes = [
  "Spicy Tuna Roll",
  "Spicy Tuna Handroll",
  "Spicy Tuna Sashimi",
  "Spicy Tuna Nigiri",
  "Spicy Tuna Poke Bowl",
  "Spicy Tuna Crispy Rice",
  "Spicy Tuna Tartare",
  "Spicy Tuna Inside-Out Roll",
  "Spicy Tuna Temaki",
  "Spicy Tuna Donburi",
  "Spicy Tuna Aburi",
  "Spicy Tuna Rainbow Roll",
];

const amenities = extractSuggestionsIdByCategory(FILTER_CATEGORIES).amenities;
const cuisines = extractSuggestionsIdByCategory(FILTER_CATEGORIES).cuisine;
const dietaryRestrictions =
  extractSuggestionsIdByCategory(FILTER_CATEGORIES).food;
const extraInfoOptions =
  extractSuggestionsIdByCategory(FILTER_CATEGORIES).extras;

const peopleNames = [
  "Alex Johnson",
  "Sam Lee",
  "Jordan Smith",
  "Taylor Brown",
  "Chris Davis",
  "Pat Miller",
  "Casey White",
  "Jamie Green",
  "Drew Black",
  "Morgan Blue",
  "Riley Red",
  "Skyler Yellow",
  "Quinn Purple",
  "Sawyer Jasper",
  "Remy Agate",
  "Avery Quartz",
  "Charlie Zircon",
  "Eden Spinel",
  "Jordan Tanzanite",
  "Taylor Kunzite",
];

// Updated reviews to focus on spicy tuna dishes
const reviews = [
  "The spicy tuna roll was absolutely perfect - just the right amount of heat!",
  "Amazing spicy tuna with fresh fish and the perfect kick of spice!",
  "Best spicy tuna roll I've ever had, creamy and flavorful!",
  "The spicy tuna was too mild for my taste, needed more sriracha.",
  "Incredible spicy tuna poke bowl, so fresh and well-seasoned!",
  "The spicy tuna handroll was messy but delicious!",
  "Perfect balance of spice and freshness in this spicy tuna sashimi.",
  "The spicy tuna crispy rice was innovative and tasty!",
  "Excellent spicy tuna tartare with great presentation!",
  "The spicy tuna was a bit too mayo-heavy for my liking.",
  "Outstanding spicy tuna nigiri - the fish was incredibly fresh!",
  "The spicy tuna donburi was filling and packed with flavor!",
  "Great spicy tuna roll with perfect rice-to-fish ratio!",
  "The spicy tuna aburi was beautifully torched and seasoned.",
  "Amazing spicy tuna rainbow roll with vibrant colors!",
  "The spicy tuna temaki was fresh but could use more spice.",
  "Perfect spicy tuna roll with a nice crunchy texture!",
  "The spicy tuna was overpriced for the portion size.",
  "Incredible spicy tuna with the perfect amount of mayo!",
  "The spicy tuna roll fell apart too easily when eating.",
  "Outstanding spicy tuna poke with fresh avocado!",
  "The spicy tuna was too fishy-tasting for my preference.",
  "Amazing spicy tuna with a great wasabi kick!",
  "The spicy tuna roll was soggy and disappointing.",
  "Perfect spicy tuna crispy rice - crispy and flavorful!",
  "The spicy tuna tartare was bland and needed more seasoning.",
  "Excellent spicy tuna roll with fresh ingredients!",
  "The spicy tuna was too salty and overwhelming.",
  "Great spicy tuna handroll with perfect nori wrapper!",
  "The spicy tuna poke bowl was fresh and satisfying!",
  "Amazing spicy tuna nigiri with excellent rice texture!",
  "The spicy tuna roll was too spicy - overpowering heat.",
  "Perfect spicy tuna sashimi with clean, fresh flavors!",
  "The spicy tuna donburi was too heavy and rich.",
  "Outstanding spicy tuna aburi with perfect char!",
  "The spicy tuna rainbow roll was beautiful and tasty!",
  "Great spicy tuna temaki with fresh cucumber crunch!",
  "The spicy tuna was perfectly balanced and delicious!",
  "Amazing spicy tuna roll with great texture contrast!",
  "The spicy tuna poke was fresh but needed more toppings.",
  "Perfect spicy tuna crispy rice with amazing presentation!",
  "The spicy tuna tartare was creative and well-executed!",
  "Excellent spicy tuna roll with premium ingredients!",
  "The spicy tuna was too mushy and lacked texture.",
  "Great spicy tuna handroll - perfectly wrapped and fresh!",
  "The spicy tuna poke bowl was colorful and nutritious!",
  "Amazing spicy tuna nigiri with buttery texture!",
  "The spicy tuna roll was standard but well-made.",
  "Perfect spicy tuna sashimi - clean and flavorful!",
  "The spicy tuna donburi was hearty and satisfying!",
];

const randomHashtags = [
  "spicyTuna",
  "sushiLovers",
  "freshFish",
  "spicyFood",
  "japaneseCuisine",
  "sushiRoll",
  "pokeBowl",
  "foodieFind",
  "spicyKick",
  "tunaSashimi",
  "handrollLove",
  "crispyRice",
  "authenticSushi",
  "spicyGoodness",
  "sushiTime",
];

// Helper functions
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomElements = (arr, max) =>
  Array.from({ length: Math.floor(Math.random() * max) + 1 }, () =>
    randomElement(arr)
  );
const randomFloat = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function generateMockReviews(count) {
  return Array.from({ length: count }, (_, i) => {
    const numImages = Math.floor(Math.random() * 3) + 2; // 2-4 images
    const shuffledImages = [...allImages].sort(() => 0.5 - Math.random());

    const amenitiesTags = [...new Set(randomElements(amenities, 3))];
    const cuisinesTags = [...new Set(randomElements(cuisines, 2))];
    const hashtagsTags = [...new Set(randomElements(randomHashtags, 2))];
    const peoplesTags = [...new Set(randomElements(peopleNames, 2))];
    const dietaryTags = [...new Set(randomElements(dietaryRestrictions, 2))];
    const extraInfoTags = [...new Set(randomElements(extraInfoOptions, 2))];
    const allTags = [
      ...amenitiesTags,
      ...cuisinesTags,
      ...hashtagsTags,
      ...dietaryTags,
      ...extraInfoTags,
    ];
    const dishName = `${randomElement(dishes)}`.trim();

    return {
      caption: dishName,
      dish_name: dishName,
      rating: randomInt(1, 5),
      amenities: amenitiesTags,
      cuisines: cuisinesTags,
      info_tags: extraInfoTags,
      dietary_tags: dietaryTags,
      people: peoplesTags,
      all_tags: allTags,
      hashtags: hashtagsTags,
      images: shuffledImages.slice(0, numImages),
      location: randomElement(locations),
      user_id: randomElement(userIDs),
      anonymous: Math.random() > 0.8, // 20% true
      quote: Math.random() > 0.8, // 20% true
      review: randomElement(reviews),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
}

export default async function populate_own_reviews(count = 5) {
  const { supabase } = useSupabase();
  const reviews = generateMockReviews(count);
  console.log(reviews);

  const { error } = await supabase.from("own_reviews").insert(reviews);

  if (error) {
    console.error("Error inserting reviews:", error);
    return false;
  }

  console.info(`Successfully inserted ${count} reviews`);
  return true;
}
