import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import GradientTheme from '@/components/GradientTheme';
import { AuthProvider } from "@/components/accAuth"; // You don't need useAuth here
import LocationUpdateComponent from '@/components/LocationUpdateComponent';

export default function RootLayout() {
    return (
        <AuthProvider>
            <GradientTheme>
            <LocationUpdateComponent />
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
