import React, { useEffect } from "react";
import { Platform } from "react-native";
import { Box } from "../components/ui";
import MobileBottomTabs from "./MobileBottomTabs";
import {
  Plus,
  Home,
  User,
  Search,
  SlidersHorizontal,
} from "lucide-react-native";
import MobileProfilePage from "./MobileProfilePage";
import Explorepage from "./ExplorePage";
import SearchPage from "./SearchPage";

const bottomTabs = [
  {
    icon: Home,
    label: "Home",
  },
  {
    icon: SlidersHorizontal,
    label: "Filter",
  },
  {
    icon: Search,
    label: "Search",
  },
  {
    icon: Plus,
    label: "Listing",
  },
  {
    icon: User,
    label: "Profile",
  },
];

const HomestayPage = () => {
  useEffect(() => {
    if (Platform.OS === "web") {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100%";
    }
  }, []);

  const [activeTab, setActiveTab] = React.useState("Home");

  return (
    <>
      <Box className="flex-1">
        <Box className="flex-1">
          <MobileProfilePage isActive={activeTab === "Profile"} />
          <SearchPage isActive={activeTab === "Search"} />

          <Explorepage setActiveTab={setActiveTab} activeTab={activeTab} />

          {/* <MobileModeChangeButton /> */}
        </Box>
        {/* mobile bottom tabs */}
        <Box className="h-[72px] items-center w-full flex md:hidden border-t border-outline-50">
          <MobileBottomTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            bottomTabs={bottomTabs}
          />
        </Box>
      </Box>
      {/* )} */}
    </>
  );
};
export default HomestayPage;
