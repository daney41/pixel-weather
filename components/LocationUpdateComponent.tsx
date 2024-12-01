import React, { useEffect } from 'react';
import { View, Text, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import { API_LINK } from '@/constants/API_link';
import { useAuth } from '@/components/accAuth';

const LOCATION_TASK_NAME = 'background-location-task';

// Define the background task globally
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error('Background location task error:', error);
        return;
    }

    if (data) {
        const { locations } = data;
        const location = locations[0];

        if (location) {
            const { latitude, longitude } = location.coords;
            console.log(`Location: ${latitude}, ${longitude}`);

            const fcmToken = await SecureStore.getItemAsync('fcmToken');
            const userToken = await SecureStore.getItemAsync('userToken');

            if (!userToken) {
                console.error('User token is missing, skipping location submission.');
                return;
            }

            try {
                const response = await fetch(`${API_LINK}/handle_periodical_submitted_location`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${userToken}`,
                    },
                    body: JSON.stringify({ latitude, longitude, fcm_token: fcmToken }),
                });

                if (response.ok) {
                    console.log('Location sent successfully.');
                } else {
                    console.error(`Error sending location: ${response.status}`);
                }
            } catch (error) {
                console.error('Failed to send location:', error);
            }
        }
    }
});

export default function LocationUpdateComponent() {
    const { userToken, isLoggedIn } = useAuth();

    useEffect(() => {

        const initializeTracking = async () => {
            const fcmToken = await SecureStore.getItemAsync('fcmToken');
            const hasPermissions = await requestPermissions();

            if (hasPermissions) {
                console.log('Starting background location tracking...');
                await startBackgroundLocationTracking(fcmToken, userToken);
            }
        };

        const unregisterTaskIfLoggedOut = async () => {
            try {
                const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
                if (isTaskRegistered) {
                    console.log('Unregistering background task...');
                    await TaskManager.unregisterTaskAsync(LOCATION_TASK_NAME);
                    console.log('Background task unregistered.');
                } else {
                    console.log(`Task '${LOCATION_TASK_NAME}' not registered, skipping unregistration.`);
                }
            } catch (error) {
                console.error('Error during task unregistration:', error);
            }
        };

        if (userToken) {
            initializeTracking(); // Start tracking when the component mounts
        }

        if (!isLoggedIn) {
            unregisterTaskIfLoggedOut();
        }

        // Cleanup on unmount
        return () => {
            unregisterTaskIfLoggedOut();
        };
    }, [userToken, isLoggedIn]); // Re-run when userToken or login status changes

    return (
        <>
        </>
    );
}

// Request foreground and background location permissions
const requestPermissions = async () => {
    try {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== 'granted') {
            Alert.alert('Permission denied', 'Foreground location access is required.');
            return false;
        }

        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
            Alert.alert('Permission denied', 'Background location access is required.');
            return false;
        }

        return true;
    } catch (error) {
        console.log('Error requesting location permissions:', error);
        return false;
    }
};

// Start background location tracking
const startBackgroundLocationTracking = async (fcmToken, userToken) => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (isRegistered) {
        console.log('Location tracking task already registered.');
        return;
    }

    try {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
            timeInterval: 300000, // Every 5 minutes (300,000 ms)
            distanceInterval: 0, // Trigger based on time, not distance
            foregroundService: {
                notificationTitle: 'Location Tracking',
                notificationBody: 'Your location is being tracked.',
            },
        });

        console.log('Background location tracking started.');
    } catch (error) {
        console.log('Error starting background location tracking:', error);
    }
};
