import { useSupabase } from "@/context/supabaseContext";
import {
  extractSuggestionsIdByCategory,
  FILTER_CATEGORIES,
} from "@/constants/SearchFilters";

const userIDs = ["user_2zxQfTPsVGJdYmlxig6h9qq9TvN"];

const allImages = [
  "https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=710&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1675252369719-dd52bc69c3df?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=781&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1673580742890-4af144293960?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=1075&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=780&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1432139555190-58524dae6a55?q=80&w=1476&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1484980972926-edee96e0960d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1485962398705-ef6a13c41e8f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1669150849080-241bf2ec9b4a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1669150849080-241bf2ec9b4a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=780&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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

// Data generators
const restaurantNames = [
  "The Golden Fork",
  "Spice Garden",
  "Ocean Breeze",
  "Urban Eats",
  "Pasta Paradise",
  "Burger Haven",
  "Sushi Temple",
  "Taco Fiesta",
  "Burger Bliss",
  "Curry Corner",
  "Pizza Palace",
  "Noodle Nirvana",
];
const dishes = [
  "Truffle Pasta",
  "Sushi Platter",
  "BBQ Ribs",
  "Caesar Salad",
  "Margherita Pizza",
  "Beef Bourguignon",
  "Pad Thai",
  "Chicken Tikka Masala",
  "Fish and Chips",
  "Vegetable Stir Fry",
  "Chocolate Lava Cake",
  "Croissant",
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
const reviews = [
  "The pizza was delicious with a perfect crispy crust!",
  "The burger was overcooked and dry, not worth the price.",
  "Amazing sushi, fresh fish and great presentation!",
  "The pasta was undercooked and the sauce was bland.",
  "Best tacos I've ever had, full of flavor!",
  "The salad was fresh but the dressing was too salty.",
  "The steak was cooked to perfection, juicy and tender.",
  "The fries were cold and soggy, very disappointing.",
  "Great portion size and the flavors were outstanding!",
  "The soup was too watery and lacked seasoning.",
  "The chicken wings were crispy and the sauce was perfect.",
  "The dessert was way too sweet, couldn’t finish it.",
  "Excellent service and the food came out quickly!",
  "The sandwich was stale and the fillings were minimal.",
  "The ramen broth was rich and flavorful, loved it!",
  "The nachos were soggy and the cheese was cold.",
  "The pancakes were fluffy and delicious!",
  "The coffee was burnt and tasted terrible.",
  "The seafood platter was fresh and well-prepared.",
  "The curry was too spicy and overpowering.",
  "The lasagna was cheesy and perfectly baked!",
  "The omelette was dry and lacked fillings.",
  "The dumplings were juicy and full of flavor!",
  "The milkshake was too thick and hard to drink.",
  "The fried chicken was crispy and well-seasoned!",
  "The guacamole was bland and needed more lime.",
  "The pho had a rich broth and tender meat!",
  "The mac and cheese was too greasy and heavy.",
  "The crepes were light and delicious with fresh fruit!",
  "The hot dog was overcooked and the bun was stale.",
  "The pad thai was perfectly balanced and tasty!",
  "The grilled cheese was burnt and the cheese wasn’t melted.",
  "The donuts were fresh and had a great glaze!",
  "The smoothie was too watery and lacked flavor.",
  "The bbq ribs were fall-off-the-bone tender!",
  "The fish and chips were greasy and underwhelming.",
  "The bruschetta was fresh and full of flavor!",
  "The enchiladas were dry and lacked sauce.",
  "The waffles were crispy on the outside, soft inside!",
  "The margarita was too sour and unbalanced.",
  "The gyro was flavorful with tender meat!",
  "The onion rings were soggy and not crispy.",
  "The paella had perfectly cooked seafood and rice!",
  "The baked potato was undercooked and hard.",
  "The tiramisu was light and not too sweet!",
  "The nacho cheese was artificial-tasting.",
  "The shawarma was juicy and well-spiced!",
  "The coleslaw was too mayonnaise-heavy.",
  "The chocolate cake was rich and decadent!",
  "The iced tea was overly sweet and artificial.",
];
const randomHashtags = [
  "hiddenGem",
  "foodieFind",
  "mustTry",
  "budgetFriendly",
  "familyFriendly",
  "lateNightEats",
  "quickBite",
  "aestheticVibes",
  "cozyCorner",
  "authenticTaste",
  "spicyLovers",
  "sweetTooth",
  "localsFavorite",
  "fusionFlavors",
  "plantBasedPower",
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
      restaurant_name: `${randomElement(restaurantNames)} ${randomElement([
        "Cafe",
        "Bistro",
        "Grill",
        "",
      ])}`.trim(),
      recommend_dsh: Math.random() > 0.1, // 90% true
      price: parseFloat(randomFloat(10, 100).toFixed(2)),
      rating: randomInt(1, 5),
      dish_name: dishName,
      amenities: amenitiesTags,
      cuisines: cuisinesTags,
      info_tags: extraInfoTags,
      dietary_tags: dietaryTags,
      people: peoplesTags,
      all_tags: allTags,
      images: shuffledImages.slice(0, numImages),
      location: randomElement(locations),
      user_id: randomElement(userIDs),
      isReview: Math.random() > 0.1, // 90% true
      quote: Math.random() > 0.8, // 20% true
      review: randomElement(reviews),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
}

export default async function populate_reviews(count = 10) {
  const { supabase } = useSupabase();
  const reviews = generateMockReviews(count);

  const { error } = await supabase.from("reviews").insert(reviews);

  if (error) {
    console.error("Error inserting reviews:", error);
    return false;
  }

  console.info(`Successfully inserted ${count} reviews`);
  return true;
}
