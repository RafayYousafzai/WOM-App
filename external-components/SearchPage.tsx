import React from "react";
import {
  HStack,
  Text,
  Heading,
  VStack,
  Pressable,
  Divider,
  Button,
  ButtonText,
  Input,
  InputSlot,
  InputIcon,
  InputField,
  SearchIcon,
} from "../components/ui";
import { Image } from "react-native";
import { ScrollView } from "react-native";

const SearchPage = ({ isActive }: any) => {
  const recentSearches = [
    "ice cream",
    "dessert",
    "bingsu",
    "penguin ice",
    "mykori dessert",
  ];
  const popularRestaurants = [
    "burger",
    "bread",
    "kfc",
    "pizza",
    "medonalds",
    "burger king",
    "pizza hut",
  ];
  const popularShops = ["bread", "egg", "soju"];

  return (
    <ScrollView style={{ display: isActive ? "flex" : "none" }}>
      <VStack className="px-5 pt-10 flex-1" space="lg">
        <Heading size="xl">Search</Heading>

        <Input className="bg-[#f2f2f2]  rounded-full">
          <InputSlot>
            <InputIcon as={SearchIcon} className=" ml-4 text-gray-400" />
          </InputSlot>
          <InputField placeholder="Search for food, shops, or restaurants..." />
        </Input>

        <VStack space="md">
          <Text size="lg" className="font-bold">
            Recent searches
          </Text>
          {recentSearches.map((search, index) => (
            <Pressable
              key={index}
              className="flex-row items-center justify-between py-0"
            >
              <Text>{search}</Text>
              <Button variant="link" className="p-0">
                <ButtonText>
                  <Image
                    source={require("@/assets/icons/close.png")}
                    className="absolute left-6 h-4 w-4"
                  />
                </ButtonText>
              </Button>
            </Pressable>
          ))}
        </VStack>

        <Divider className="my-0.5" />

        <VStack space="md">
          <Text size="lg" className="font-bold">
            Popular searches in Restaurants
          </Text>
          <HStack className="flex-wrap">
            {popularRestaurants.map((item, index) => (
              <Button key={index} variant="outline" className="m-1">
                <ButtonText>{item}</ButtonText>
              </Button>
            ))}
          </HStack>
        </VStack>

        <Divider className="my-0.5" />

        <VStack space="md">
          <Text size="lg" className="font-bold">
            Popular searches in Shops
          </Text>
          <HStack className="flex-wrap">
            {popularShops.map((item, index) => (
              <Button key={index} variant="outline" className="m-1">
                <ButtonText>{item}</ButtonText>
              </Button>
            ))}
          </HStack>
        </VStack>
      </VStack>
    </ScrollView>
  );
};

export default SearchPage;
