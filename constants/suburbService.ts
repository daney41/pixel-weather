import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_LINK } from '@/constants/API_link';
import { Alert } from 'react-native';

// Function to fetch suburbs from the API
export const fetchSuburbs = async (setSuburbData) => {
    try {
        console.log('Fetching suburbs from:', `${API_LINK}/suburbs`);

        const response = await fetch(`${API_LINK}/suburbs`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (response.status === 200) {
            setSuburbData(data.data); // Update state with fetched suburb data
            // Cache the suburb data
            await AsyncStorage.setItem('suburbData', JSON.stringify(data.data));
        } else {
            Alert.alert('Error', 'Failed to retrieve suburb data. Please try again later.');
        }
    } catch (error) {
        console.error('Error fetching suburbs:', error);
        Alert.alert('Error', 'Failed to connect to the server. Please try again later.');
    }
};

// Function to load suburb data from cache
export const loadCachedSuburbs = async (setSuburbData, fetchSuburbs) => {
    try {
        const cachedSuburbs = await AsyncStorage.getItem('suburbData');
        if (cachedSuburbs !== null) {
            setSuburbData(JSON.parse(cachedSuburbs)); // Load cached data
        } else {
            fetchSuburbs(setSuburbData); // If no cache, fetch from the API
        }
    } catch (error) {
        Alert.alert('Error', 'Failed to load cached data.');
    }
};
