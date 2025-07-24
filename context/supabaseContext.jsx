import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { SplashScreen } from "expo-router";
import React, { createContext, useContext } from "react";
import { ActivityIndicator, View } from "react-native";

const SupabaseContext = createContext();

export const useSupabase = () => useContext(SupabaseContext);

export const SupabaseProvider = ({ children }) => {
  const supabase = useSupabaseClient();

  if (!supabase)
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  else {
    SplashScreen.hide();
  }

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
};
