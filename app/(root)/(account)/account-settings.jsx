import MobileProfilePage from "@/external-components/MobileProfilePage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box } from "@/components/ui";
import { useAuth } from "@clerk/clerk-expo";
import UnloggedState from "@/components/auth/unlogged-state";

export default function AccountSettings() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <UnloggedState />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Box className="flex-1 bg-white">
        <MobileProfilePage isActive={true} />
      </Box>
    </SafeAreaView>
  );
}
