import React from "react";
import { HStack, Link, LinkText, Text } from "../components/ui";

const Banner = () => {
  return (
    <HStack
      className="justify-center items-center min-h-16 bg-[#f39f1e]"
      space="sm"
    >
      <Text className="text-content-0" size="sm">
        First order? Here's Free delivery!
      </Text>
      <Link href="">
        <LinkText className="text-content-50 font-semibold" size="sm">
          Learn more
        </LinkText>
      </Link>
    </HStack>
  );
};
export default Banner;
