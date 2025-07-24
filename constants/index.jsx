import arrowDown from "@/assets/icons/arrow-down.png";
import arrowUp from "@/assets/icons/arrow-up.png";
import backArrow from "@/assets/icons/back-arrow.png";
import chat from "@/assets/icons/chat.png";
import checkmark from "@/assets/icons/check.png";
import close from "@/assets/icons/close.png";
import dollar from "@/assets/icons/dollar.png";
import email from "@/assets/icons/email.png";
import eyecross from "@/assets/icons/eyecross.png";
import google from "@/assets/icons/google.png";
import home from "@/assets/icons/home.png";
import list from "@/assets/icons/list.png";
import lock from "@/assets/icons/lock.png";
import map from "@/assets/icons/map.png";
import marker from "@/assets/icons/marker.png";
import out from "@/assets/icons/out.png";
import person from "@/assets/icons/person.png";
import pin from "@/assets/icons/pin.png";
import point from "@/assets/icons/point.png";
import profile from "@/assets/icons/profile.png";
import search from "@/assets/icons/search.png";
import selectedMarker from "@/assets/icons/selected-marker.png";
import star from "@/assets/icons/star.png";
import target from "@/assets/icons/target.png";
import to from "@/assets/icons/to.png";
import check from "@/assets/images/check.png";
import getStarted from "@/assets/images/get-started.png";
import message from "@/assets/images/message.png";
import noResult from "@/assets/images/no-result.png";
import onboarding1 from "@/assets/images/mock.png";
import onboardingIPAD1 from "@/assets/images/IPAD.png";
import onboardingIPAD2 from "@/assets/images/IPAD2.png";
import onboarding2 from "@/assets/images/onboarding2.png";
import onboarding3 from "@/assets/images/world.png";
import onboardingIPAD3 from "@/assets/images/IPAD3.png";
import signUpCar from "@/assets/images/signup-car.png";
import telephone from "@/assets/icons/telephone.png";
import user from "@/assets/icons/user.png";
import calendar from "@/assets/icons/calendar.png";
import { Platform, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export const images = {
  onboarding1,
  onboardingIPAD1,
  onboardingIPAD2,
  onboardingIPAD3,
  onboarding2,
  onboarding3,
  getStarted,
  signUpCar,
  check,
  noResult,
  message,
};

export const icons = {
  telephone,
  calendar,
  user,
  arrowDown,
  arrowUp,
  backArrow,
  chat,
  checkmark,
  close,
  dollar,
  email,
  eyecross,
  google,
  home,
  list,
  lock,
  map,
  marker,
  out,
  person,
  pin,
  point,
  profile,
  search,
  selectedMarker,
  star,
  target,
  to,
};

// Function to detect if device is iPad
const isIPad = () => {
  if (Platform.OS === "ios") {
    // iPad detection logic for iOS
    const aspectRatio = height / width;
    const minTabletWidth = 768;

    // iPads typically have aspect ratios between 1.2 and 1.4
    // and minimum width of 768 points
    return width >= minTabletWidth && aspectRatio > 1.2 && aspectRatio < 1.4;
  }

  // For Android tablets, you can use similar logic
  if (Platform.OS === "android") {
    const minTabletWidth = 768;
    return width >= minTabletWidth;
  }

  return false;
};
const onboardingPhone = [
  {
    id: 1,
    title: "Discover Dishes, Not Just Places",
    headline: "Craving something amazing?",
    description:
      "Search by dishes, not just restaurants. Whether it's the best ramen in town or that crispy birria taco your friend won't shut up about—we've got it.",
    image: images.onboarding1, // Regular phone image
    backgroundColor: "#FFF8EE",
    accentColor: "#FF7A00",
  },
  {
    id: 2,
    title: "Find Cravings You Didn't Know You Had",
    headline: "Not sure what you're craving?",
    description:
      "Scroll through your friends' favorite dishes—whether they're dining out or cooking in. Word of Mouth helps you figure out what's for breakfast, lunch, or dinner.",
    image: images.onboarding2,
    backgroundColor: "#F5FFF6",
    accentColor: "#12A454",
  },
  {
    id: 3,
    title: "Join the Ultimate Food Circle",
    headline: "Join the ultimate food circle.",
    description:
      "Word of Mouth connects you with friends, food lovers, and local gems—whether you're hunting for the perfect bite in a new city or sharing grandma's go-to recipe.",
    image: images.onboarding3,
    backgroundColor: "#FFF5F9",
    accentColor: "#E83F5B",
  },
];

const onboardingIPad = [
  {
    id: 1,
    title: "Discover Dishes, Not Just Places",
    headline: "Craving something amazing?",
    description:
      "Search by dishes, not just restaurants. Whether it's the best ramen in town or that crispy birria taco your friend won't shut up about—we've got it.",
    image: images.onboardingIPAD1, // iPad-specific image
    backgroundColor: "#FFF8EE",
    accentColor: "#FF7A00",
  },
  {
    id: 2,
    title: "Find Cravings You Didn't Know You Had",
    headline: "Not sure what you're craving?",
    description:
      "Scroll through your friends' favorite dishes—whether they're dining out or cooking in. Word of Mouth helps you figure out what's for breakfast, lunch, or dinner.",
    image: images.onboardingIPAD2, // You can add onboardingIPAD2 if you have it
    backgroundColor: "#F5FFF6",
    accentColor: "#12A454",
  },
  {
    id: 3,
    title: "Join the Ultimate Food Circle",
    headline: "Join the ultimate food circle.",
    description:
      "Word of Mouth connects you with friends, food lovers, and local gems—whether you're hunting for the perfect bite in a new city or sharing grandma's go-to recipe.",
    image: images.onboardingIPAD3, // You can add onboardingIPAD3 if you have it
    backgroundColor: "#FFF5F9",
    accentColor: "#E83F5B",
  },
];

// Export the appropriate onboarding array based on device
export const onboarding = isIPad() ? onboardingIPad : onboardingPhone;

export const data = {
  onboarding,
};
