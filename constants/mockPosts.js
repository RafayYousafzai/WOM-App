import { v4 as uuidv4 } from "uuid";
import "react-native-get-random-values";

const users = [
  {
    username: "foodie_explorer",
    userAvatar: "https://randomuser.me/api/portraits/women/43.jpg",
  },
  {
    username: "pasta_lover",
    userAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    username: "culinary_critic",
    userAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
  },
  {
    username: "taste_hunter",
    userAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    username: "gourmet_guru",
    userAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    username: "flavor_seeker",
    userAvatar: "https://randomuser.me/api/portraits/men/57.jpg",
  },
  {
    username: "dining_diva",
    userAvatar: "https://randomuser.me/api/portraits/women/33.jpg",
  },
  {
    username: "meal_maestro",
    userAvatar: "https://randomuser.me/api/portraits/men/29.jpg",
  },
];

const restaurants = [
  {
    name: "Sunny Side Café",
    cuisine: "Brunch",
    price: "$30",
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
      label: "Downtown, San Francisco",
    },
    images: [
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=2680&q=80",
      "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=2680&q=80",
    ],
  },
  {
    name: "Trattoria Milano",
    cuisine: "Italian",
    price: "$100",
    location: {
      latitude: 37.78,
      longitude: -122.43,
      label: "North Beach, San Francisco",
    },
    images: [
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=2664&q=80",
    ],
  },
  {
    name: "Sakura Sushi",
    cuisine: "Japanese",
    price: "$100",
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      label: "Japantown, San Francisco",
    },
    images: [
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=2670&q=80",
      "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=2670&q=80",
    ],
  },
  {
    name: "Taco Fiesta",
    cuisine: "Mexican",
    price: "$10",
    location: {
      latitude: 37.7599,
      longitude: -122.4148,
      label: "Mission District, San Francisco",
    },
    images: [
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=2680&q=80",
      "https://images.unsplash.com/photo-1613514785940-daed07799d9b?auto=format&fit=crop&w=2680&q=80",
    ],
  },
  {
    name: "Le Petit Bistro",
    cuisine: "French",
    price: "$200",
    location: {
      latitude: 37.7915,
      longitude: -122.4123,
      label: "Nob Hill, San Francisco",
    },
    images: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2670&q=80",
      "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=2670&q=80",
    ],
  },
  {
    name: "Spice Garden",
    cuisine: "Indian",
    price: "$30",
    location: {
      latitude: 37.7833,
      longitude: -122.4167,
      label: "Tenderloin, San Francisco",
    },
    images: [
      "https://images.unsplash.com/photo-1631515242808-497c3fbd3972?auto=format&fit=crop&w=2670&q=80",
    ],
  },
  {
    name: "Green Leaf Salad Bar",
    cuisine: "Healthy",
    price: "$30",
    location: {
      latitude: 37.7937,
      longitude: -122.3965,
      label: "Financial District, San Francisco",
    },
    images: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=2670&q=80",
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=2680&q=80",
    ],
  },
  {
    name: "Smokey BBQ Pit",
    cuisine: "American",
    price: "$30",
    location: {
      latitude: 37.7694,
      longitude: -122.4862,
      label: "Sunset District, San Francisco",
    },
    images: [
      "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=2670&q=80",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=2670&q=80",
    ],
  },
  {
    name: "Dim Sum Palace",
    cuisine: "Chinese",
    price: "$30",
    location: {
      latitude: 37.7941,
      longitude: -122.4078,
      label: "Chinatown, San Francisco",
    },
    images: [
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=2670&q=80",
      "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=2670&q=80",
    ],
  },
  {
    name: "Coastal Seafood",
    cuisine: "Seafood",
    price: "$100",
    location: {
      latitude: 37.8083,
      longitude: -122.4156,
      label: "Fisherman's Wharf, San Francisco",
    },
    images: [
      "https://images.unsplash.com/photo-1579631542720-3a87824fff86?auto=format&fit=crop&w=2670&q=80",
      "https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=2670&q=80",
    ],
  },
];

const amenitiesList = [
  { name: "Outdoor Seating", icon: "umbrella-beach" },
  { name: "Parking", icon: "parking" },
  { name: "Wifi", icon: "wifi" },
  { name: "Dog Friendly", icon: "dog" },
  { name: "Vegetarian Options", icon: "leaf" },
  { name: "Reservations", icon: "calendar-check" },
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomRating = () => Math.random() * 2 + 3;
const getRandomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomAmenities = () =>
  amenitiesList.sort(() => 0.5 - Math.random()).slice(0, getRandomNumber(3, 6));
const getRandomTimeAgo = () => `${getRandomNumber(1, 24)} hours ago`;

export const generatePosts = (count = 5) => {
  return Array.from({ length: count }, () => {
    const user = getRandomElement(users);
    const restaurant = getRandomElement(restaurants);
    return {
      id: uuidv4(),
      username: user.username,
      userAvatar: user.userAvatar,
      postTimeAgo: getRandomTimeAgo(),
      title: `Amazing experience at ${restaurant.name}!`,
      restaurantName: restaurant.name,
      description:
        "Delicious food and great atmosphere. Highly recommend!Delicious food and great atmosphere. Highly recommend!Delicious food and great atmosphere. Highly recommend!Delicious food and great atmosphere. Highly recommend!Delicious food and great atmosphere. Highly recommend!Delicious food and great atmosphere. Highly recommend!Delicious food and great atmosphere. Highly recommend!Delicious food and great atmosphere. Highly recommend!Delicious food and great atmosphere. Highly recommend!Delicious food and great atmosphere. Highly recommend!Delicious food and great atmosphere. Highly recommend!Delicious food and great atmosphere. Highly recommend!Delicious food and great atmosphere. Highly recommend!Delicious food and great atmosphere. Highly recommend!Delicious food and great atmosphere. Highly recommend!Delicious food and great atmosphere. Highly recommend!Delicious food and great atmosphere. Highly recommend!Delicious food and great atmosphere. Highly recommend!",
      rating: getRandomRating(),
      price: restaurant.price,
      cuisine: restaurant.cuisine,
      images: restaurant.images.map((uri) => ({ uri })),
      likesCount: getRandomNumber(50, 200),
      commentsCount: getRandomNumber(5, 30),
      isFavorited: Math.random() < 0.5,
      amenities: getRandomAmenities(),
      location: restaurant.location,
      userId: "1",
    };
  });
};

export const posts = generatePosts(10);

export const generateSearchResults = (query) => {
  if (!query) return [];

  return [
    {
      id: "u1",
      name: `${query}_official`,
      type: "user",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      verified: true,
    },
    {
      id: "u2",
      name: `${query}_fan`,
      type: "user",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
      id: "u3",
      name: `${query}_world`,
      type: "user",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    // Posts
    {
      id: "p1",
      title: `Amazing ${query} photo`,
      type: "post",
      thumbnail: "https://picsum.photos/200/200?random=1",
      likes: 1243,
    },
    {
      id: "p2",
      title: `${query} adventure`,
      type: "post",
      thumbnail: "https://picsum.photos/200/200?random=2",
      likes: 532,
    },
    {
      id: "p3",
      title: `${query} lifestyle`,
      type: "post",
      thumbnail: "https://picsum.photos/200/200?random=3",
      likes: 892,
    },
  ];
};
