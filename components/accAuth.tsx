import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Alert, Platform } from 'react-native';
import { API_LINK } from "@/constants/API_link";
import { useRouter } from 'expo-router';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

// Create a context for managing authentication state
export const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userToken, setUserToken] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isSettingUpNotifications, setIsSettingUpNotifications] = useState(false);
    const router = useRouter();

    // Function requesting location permission
    // Related to privacy considerations, always request permissions from users when accessing
    // their location information
    const requestLocationPermissions = async () => {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== 'granted') {
            console.error('Foreground location permission not granted');
            return false;
        }

        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
            console.error('Background location permission not granted');
            return false;
        }

        console.log('Background location permission granted');
        return true;
    };

    // Function to register for registering FCM token for receiving notifications
    // Related 
    const registerForPushNotificationsAsync = async () => {
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('Notification permissions not granted');
                return;
            }

            const { data } = await Notifications.getDevicePushTokenAsync();
            // console.log('FCM Token:', data);

            await SecureStore.setItemAsync('fcmToken', data);

            const response = await fetch(`${API_LINK}/register_fcm_token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify({ fcm_token: data }),
            });

            if (response.status !== 200) {
                console.log('Failed to register FCM token. Status:', response.status);
                return;
            }

            console.log('FCM token registered successfully');
            return data;
        } catch (error) {
            console.error('Error registering for push notifications:', error);
        }
    };

    const loadToken = async () => {
        try {
            const storedToken = await SecureStore.getItemAsync('userToken');
            const storedUserData = await SecureStore.getItemAsync('userData');

            if (storedToken) {
                setUserToken(storedToken);
                setUserData(JSON.parse(storedUserData));
                setIsLoggedIn(true);
            }
        } catch (error) {
            console.error('Failed to load token:', error);
        }
    };

    // method to login in to the app to retrieve userToken,
    // this is considered as privacy and security consideration since we will upload user's password to the server.
    // the data that retrived from server will be stored in secureStore to build the privacy and security.
    const login = async (email, password) => {
        if (!email || !password) {
            Alert.alert('Error', 'Missing email or password.');
            return false;
        }

        try {
            const response = await fetch(`${API_LINK}/handle_login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const rawResponse = await response.text();

            if (rawResponse.includes('<')) {
                console.error('Server returned HTML instead of JSON:', rawResponse);
                Alert.alert('Server Error', 'Received unexpected response from server.');
                return false;
            }

            const data = JSON.parse(rawResponse);

            if (response.status === 200) {
                // Update SecureStore and state
                await SecureStore.setItemAsync('userToken', data.data.token);
                await SecureStore.setItemAsync('userData', JSON.stringify({
                    email: data.data.email,
                    username: data.data.username,
                }));

                setUserToken(data.data.token);
                setUserData({ email: data.data.email, username: data.data.username });
                setIsLoggedIn(true);

                Alert.alert('Success', 'Login successful!');
                return true;
            } else {
                Alert.alert('Error', data.error || 'Invalid credentials.');
                return false;
            }
        } catch (error) {
            console.error("Error: couldn't send the request", error);
            Alert.alert('Error', `${error.message}`);
            return false;
        }
    };

    const logout = async () => {
        if (!userToken) {
            Alert.alert('Error', 'No active session to log out.');
            return false;
        }

        try {
            const response = await fetch(`${API_LINK}/handle_logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ logout_all: false }),
            });

            if (response.status === 200 || response.status === 400 || response.status === 401) {

                // Clear SecureStore
                await SecureStore.deleteItemAsync('userToken');
                await SecureStore.deleteItemAsync('userData');
                await SecureStore.deleteItemAsync('fcmToken');

                // Reset state
                setIsLoggedIn(false);
                setUserToken(null);
                setUserData(null);

                Alert.alert('Success', 'Log out successful.');

                router.push('/login');
                return true;
            } else {
                Alert.alert('Error', 'An error occurred while logging out.');
                return false;
            }
        } catch (error) {
            Alert.alert('Error', `An error occurred: ${error.message}`);
            return false;
        }
    };

    useEffect(() => {
        loadToken();
    }, []);

    useEffect(() => {
        const setupNotifications = async () => {
            if (!userToken || isSettingUpNotifications) return;

            setIsSettingUpNotifications(true);
            await registerForPushNotificationsAsync();
            setIsSettingUpNotifications(false);
        };

        if (userToken) {
            setupNotifications();
        }
    }, [userToken]);

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, userToken, userData, setUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);