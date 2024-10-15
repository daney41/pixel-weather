import { Stack } from 'expo-router';

export default function IndexLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="index" options={{ title: 'Welcome Page' }} />
            <Stack.Screen name="login" options={{ title: 'Log In' }} />
        </Stack>
    );
}