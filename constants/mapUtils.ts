import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import {weatherIconById} from "@/constants/weatherCode";
import * as WeatherIcons from "@/constants/Mappings";
import {API_LINK} from "@/constants/API_link";
import {router} from "expo-router";

const API_KEY = 'acbdc80633478d6533e96ea77d9cd3a8';

// ask for location permission
export const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
};

// get the current location
export const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (hasPermission) {
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });
        return location.coords;
    } else {
        Alert.alert('Permission denied', 'Permission to access location was denied.');
        return null;
    }
};

// fetch weather data
export const fetchWeather = async (latitude: number, longitude: number) => {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
};

// fetch hourly forecast
export const fetchHourlyForecast = async (latitude: number, longitude: number) => {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,daily,alerts&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();
        const forecastData = data.hourly.slice(1, 24).map((hourData, index) => {
            const weatherType = weatherIconById[hourData.weather[0].id] || 'Clear Sky';
            return {
                time: new Date(hourData.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                temp: hourData.temp.toFixed(0),
                icon: WeatherIcons.weatherIconMap[weatherType],
            };
        });
        return forecastData;
    } catch (error) {
        console.error('Error fetching hourly forecast:', error);
        return [];
    }
};

export const handleInputChange = (text, suburb ,setSearchQuery, setFilteredSuggestions, setShowSuggestions) => {
    setSearchQuery(text);
    if (text.length > 0) {
        const filtered = suburb.filter((item) => {
            return item.suburb_name.toLowerCase().startsWith(text.toLowerCase())||
                item.postcode.toString().includes(text)
        });
        setFilteredSuggestions(filtered);
        setShowSuggestions(true);
    } else {
        setShowSuggestions(false);
    }
};

// update Textinput value when clicking suggestion
export const handleSuggestionSelect = (suggestion, setSearchQuery, setShowSuggestions) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
};

// save recent search
export const saveRecentSearch = async (query: string, recentSearches: string[], setRecentSearches: Function) => {
    try {
        const updatedSearches = [query, ...recentSearches].slice(0, 5);
        setRecentSearches(updatedSearches);
        await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (error) {
        console.error("Error saving recent search:", error);
    }
};

// load recent search
export const loadRecentSearches = async (setRecentSearches: Function) => {
    try {
        const savedSearches = await AsyncStorage.getItem('recentSearches');
        if (savedSearches) {
            setRecentSearches(JSON.parse(savedSearches));
        }
    } catch (error) {
        console.error("Error loading recent searches:", error);
    }
};

// remove recent search
export const removeSearchItem = async (index: number, recentSearches: string[], setRecentSearches: Function) => {
    try {
        const updatedSearches = recentSearches.filter((_, i) => i !== index);
        setRecentSearches(updatedSearches);
        await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (error) {
        console.error("Error removing search item:", error);
    }
};

// fetch past 1 day post
export const fetchFilteredPosts = async (userToken, suburbId, mins = 60) => {
    try {

        const param = `get_posts?time_interval=${mins}${suburbId ? `&suburb_id=${suburbId}` : ''}`;

        const response = await fetch(`${API_LINK}/get_posts?time_interval=${mins}`
            , {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${userToken}`,
                }}
        );
        const data = await response.json();
        if (response.status === 200) {
            console.log('fetch success: ', data);
            return data.data;
        } else {
            console.error('Failed to fetch posts:', data.error);
        }
    } catch (error) {
        console.error('Error fetching posts:', error);

    }
};

// handle add post
export const handleAddPost = async (isLoggedIn: boolean,) => {
    if (!isLoggedIn) {
        Alert.alert('Warning', 'Please login to use this function', [
            { text: 'login', onPress: () => router.push('/login') },
            { text: 'cancel' },
        ]);
    } else {
        router.push('/post');
    }
};

// get saved location
export const fetchSavedLocations = async (userToken) => {
    try {
        const response = await fetch(`${API_LINK}/user_saved_suburb`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userToken}`,
            },
        });

        if (response.ok) {
            const result = await response.json();
            console.log('success: ', result);
            return result.data;
        } else {
            console.log('failed: ', response);
            Alert.alert('Error', 'Failed to fetch saved locations.');
        }
    } catch (error) {
        console.error('Error fetching saved locations:', error);
        Alert.alert('Error', 'An error occurred while fetching saved locations.');
    }
};

// check if this location was in saved locations
export const isLocationSaved = async (weather, savedLocations) => {
    if (!weather) return false;
    return savedLocations.some(
        (loc) => loc.suburb_name.toLowerCase() === weather.name.toLowerCase()
    );
};


export const setPostModalVisible = (setPostVisible: Function) =>{
    setPostVisible(true);
}

// handle when user like a post
export const handleToggleLike = async (userToken, postid, isLiked, prevCount, setLikeCount, setIsLiked) => {
    try {
        const response = await fetch(`${API_LINK}/posts/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({ post_id: postid }),
        });

        const data = await response.json();
        if (response.status === 200) {
            setLikeCount((prevCount) => (!isLiked) ? prevCount + 1 : prevCount - 1);
            setIsLiked(data.liked);
        } else {
            console.log("Error toggling like:", data.error);
        }
    } catch (error) {
        console.error("Failed to toggle like status:", error);
    }
};

// show the correct like number and liked post or not in post
export const handleLikedPost = async (userToken, postId, setIsLiked) => {
    try {
        const response = await fetch(`${API_LINK}/posts/like/${postId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userToken}`,
            },
        });

        const data = await response.json();
        if (response.status === 200) {
            setIsLiked(data.liked);
        } else {
            console.log("Error getting liked status:", data.error);
        }
    } catch (error) {
        console.error("Failed to handle liked status:", error);
    }
}

export const handleViewPost = async (userToken, post_id) => {
    try{
        const response = await fetch(`${API_LINK}/posts/view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({ post_id: post_id }),
        })

        const data = await response.json();
        if (response.status === 200) {
        } else {
            console.log("Error toggling like:", data.error);
        }

    } catch (error) {
        console.error("Failed to view psot:", error);
    }
}


export const formatTimeDifference = (postedTime) => {
    const now = new Date();
    const postDate = new Date(postedTime);
    const differenceInMs = now - postDate;
    const differenceInMins = Math.floor(differenceInMs / 60000);
    const differenceInHours = Math.floor(differenceInMins / 60);

    if (differenceInMins < 1) {
        return "Now";
    } else if (differenceInMins < 60) {
        return `${differenceInMins} mins ago`;
    } else if (differenceInHours < 24) {
        return `${differenceInHours} hrs ago`;
    } else {
        const differenceInDays = Math.floor(differenceInHours / 24);
        return `${differenceInDays} days ago`;
    }
};
