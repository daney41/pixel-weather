
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import {weatherIconById} from "@/constants/weatherCode";
import * as WeatherIcons from "@/constants/Mappings";
import {API_LINK} from "@/constants/API_link";
import {router} from "expo-router";

const API_KEY = '9480d17e216cfcf5b44da6050c7286a4';

// 請求位置權限
export const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
};

// 獲取當前位置
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

export const getLocationLaLon = async (location) => {
    try {
        const response = await fetch(`${API_LINK}/suburbs`, {
            method: 'GET',
        })
        const result = await response.json();
        if (!location) {
            throw new Error('Location name is missing');
        }

        const matchingData = result.data.filter(item => {
            return item.suburb_name.toLowerCase() === location.toLowerCase()
        });

        return matchingData;
    } catch (error) {
        console.error('Error fetching or processing data:', error); // 顯示錯誤信息
        return null;
    }
}
// 獲取天氣資訊
export const fetchWeather = async (latitude: number, longitude: number) => {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
            //`https://api.openweathermap.org/data/2.5/weather?q=Greenslopes&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();
        console.log('fetched data: ', data);
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
};

// 獲取每小時天氣預報
export const fetchHourlyForecast = async (latitude: number, longitude: number) => {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,daily,alerts&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();
        const forecastData = data.hourly.slice(1, 24).map((hourData, index) => {
            const weatherType = weatherIconById[hourData.weather[0].id] || 'Clear Sky';
            return {
                time: new Date(hourData.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // 轉換成可讀格式
                temp: hourData.temp.toFixed(0), // 溫度
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

// 點選建議項目時，更新 TextInput 的值
export const handleSuggestionSelect = (suggestion, setSearchQuery, setShowSuggestions) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
};

// 儲存最近搜尋
export const saveRecentSearch = async (query: string, recentSearches: string[], setRecentSearches: Function) => {
    try {
        const updatedSearches = [query, ...recentSearches].slice(0, 5);  // 最多保存 5 個最近搜尋
        setRecentSearches(updatedSearches);
        await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (error) {
        console.error("Error saving recent search:", error);
    }
};

// 讀取最近搜尋
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

// 移除某個搜尋紀錄
export const removeSearchItem = async (index: number, recentSearches: string[], setRecentSearches: Function) => {
    try {
        const updatedSearches = recentSearches.filter((_, i) => i !== index);
        setRecentSearches(updatedSearches);
        await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (error) {
        console.error("Error removing search item:", error);
    }
};

export const fetchFilteredPosts = async (userToken) => {
    try {
        const response = await fetch(`${API_LINK}/get_posts?time_interval=1440`
            , {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${userToken}`,
                }}
        );
        const data = await response.json();
        if (response.status === 200) {
            return data.data;
        } else {
            console.error('Failed to fetch posts:', data.error);
        }
    } catch (error) {
        console.error('Error fetching posts:', error);

    }
};

export const handleAddPost = async (isLoggedIn: boolean,) => {
    if (!isLoggedIn) {
        // 未登入：彈出提示，並跳轉到登入頁面
        Alert.alert('Warning', 'Please login to use this function', [
            { text: 'login', onPress: () => router.push('/login') },
            { text: 'cancel' },
        ]);
    } else {
        // 已登入：跳轉到發文頁面
        router.push('/post');
    }
};

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
            return result.data;  // 將取得的地點設定到狀態中
        } else {
            Alert.alert('Error', 'Failed to fetch saved locations.');
        }
    } catch (error) {
        console.error('Error fetching saved locations:', error);
        Alert.alert('Error', 'An error occurred while fetching saved locations.');
    }
};

export const isLocationSaved = async (weather, savedLocations) => {
    if (!weather) return false;
    return savedLocations.some(
        (loc) => loc.suburb_name.toLowerCase() === weather.name.toLowerCase()
    );
};

export const setPostModalVisible = (setPostVisible: Function) =>{
    setPostVisible(true);
}

export const fetchSuburbs = async (userToken) => {
    try {
        // 發送 GET 請求以獲取 suburbs 資料
        const response = await fetch(`${API_LINK}/suburbs`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userToken}`,
            },
        });

        if (response.ok) {
            const result = await response.json();
            // console.log(result.data);
            if (result && result.data) {
                return result.data;
            } else {
                throw new Error('Unexpected response format.');
            }

        } else {
            switch (response.status) {
                case 500:
                    Alert.alert('Error', 'An internal server error occurred. Please try again later.');
                    break;
                default:
                    Alert.alert('Error', 'Failed to fetch suburbs. Please try again.');
            }
        }

    } catch (error) {
        // 捕捉 API 請求或解析中的異常情況
        console.error('Error fetching suburbs:', error);
        Alert.alert('Error', `Failed to retrieve suburbs: ${error.message}`);
    }
};


export const handleToggleLike = async (userToken, postid, isLiked, prevCount, setLikeCount, setIsLiked) => {
    try {
        const response = await fetch(`${API_LINK}/posts/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userToken}`, // 設定 Authorization Token
            },
            body: JSON.stringify({ post_id: postid }), // 傳遞 post_id 參數
        });

        const data = await response.json();
        console.log(data);
        if (response.status === 200) {
            setLikeCount((prevCount) => (!isLiked) ? prevCount + 1 : prevCount - 1);
            setIsLiked(data.liked);
        } else {
            // 處理錯誤狀態碼
            console.log("Error toggling like:", data.error);
        }
    } catch (error) {
        console.error("Failed to toggle like status:", error);
    }
};

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
            // 處理錯誤狀態碼
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
        console.log(data);
        if (response.status === 200) {
        } else {
            // 處理錯誤狀態碼
            console.log("Error toggling like:", data.error);
        }

    } catch (error) {
        console.error("Failed to view psot:", error);
    }
}

export const handleReportPost = async (userToken, postId,report_comment) => {
    try{
        const response = await fetch(`${API_LINK}/posts/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({
                post_id: postId,
                report_comment: report_comment,
            }),
        })
        const data = await response.json();
        console.log(data);
        if (response.status === 200) {
        } else {
            // 處理錯誤狀態碼
            console.log("Error toggling like:", data.error);
        }

    } catch (error) {
        console.error("Failed to report post:", error);
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

