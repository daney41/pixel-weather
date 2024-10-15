import { Stack } from 'expo-router';
import GradientTheme from '@/components/GradientTheme';
import {AuthProvider} from "@/components/accAuth";

export default function RootLayout() {

  return (
      <AuthProvider>
        <GradientTheme>
            <Stack
              screenOptions={{
                headerShown: false,
              }}>
                <Stack.Screen name="(tab)" />
            </Stack>
        </GradientTheme>
      </AuthProvider>
  );
}