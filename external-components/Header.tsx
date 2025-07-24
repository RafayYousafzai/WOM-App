import React, { useContext } from "react";
import {
  Box,
  HStack,
  Input,
  InputField,
  InputIcon,
  InputSlot,
  SearchIcon,
  Text,
} from "../components/ui";
import HeaderTabs from "./header/HeaderTabs";
import HomestayLogo from "./header/HomestayLogo";
// import ToggleMode from "./header/ToggleMode";
import UserProfile from "./header/UserProfile";
import { ThemeContext } from "@/app/_layout";

const Header = React.memo(() => {
  const { colorMode } = useContext(ThemeContext);
  return (
    <>
      {/* big screen */}
      <Box className="px-16 w-full border-b hidden md:flex border-outline-100 min-h-20">
        <HStack className="items-center justify-between mx-auto w-full">
          <Text className="text-2xl font-bold">WOM</Text>
          <HeaderTabs />
          <HStack space="lg" className="items-center pr-1.5">
            {/* <ToggleMode /> */}
            <UserProfile />
          </HStack>
        </HStack>
      </Box>
      {/* small screen */}
      <Box className="p-4 md:hidden w-full">
        <Input className="bg-[#f2f2f2]  rounded-full  h-12">
          <InputSlot className="bg-[#f39f1e] rounded-full h-8 w-8 m-1.5">
            <InputIcon
              as={SearchIcon}
              color={colorMode === "light" ? "#FEFEFF" : "#171717"}
            />
          </InputSlot>
          <InputField placeholder="Search for food, shops, or restaurants..." />
        </Input>
      </Box>
    </>
  );
});
export default Header;
