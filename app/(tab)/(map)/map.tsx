import React, {useState, useEffect, useRef, useCallback} from 'react';
import * as RN from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, {Marker} from 'react-native-maps';
import GradientTheme from '@/components/GradientTheme';
import { useAuth } from '@/components/accAuth';
import * as WeatherIcons from "@/constants/Mappings";
import * as ColorScheme from "@/constants/ColorScheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
    getCurrentLocation,
    fetchWeather,
    fetchHourlyForecast,
    loadRecentSearches,
    saveRecentSearch,
    removeSearchItem,
    fetchFilteredPosts,
    handleAddPost,
    isLocationSaved,
    fetchSavedLocations,
    setPostModalVisible,
    fetchSuburbs,
    handleInputChange,
    handleSuggestionSelect,
    handleToggleLike,
    handleLikedPost,
    handleViewPost,
    formatTimeDifference,
    getLocationLaLon,
} from '@/constants/mapUtils';
import {BTN_BACKGROUND} from "@/constants/ColorScheme";
import {Modal, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View} from "react-native";
import {weatherIconById} from "@/constants/weatherCode";
import {router} from "expo-router";


const SCREEN_HEIGHT = RN.Dimensions.get('window').height;  // 取得螢幕高度
const SCREEN_WIDTH = RN.Dimensions.get('window').width;    // 取得螢幕寬度

const SEARCH_CONTAINER_WIDTH = SCREEN_WIDTH - 30;  // SearchContainer 的寬度 (左右 margin 各 15)
const BUTTON_TO_TOP_DISTANCE = SCREEN_HEIGHT*0.08;

const API_KEY = '9480d17e216cfcf5b44da6050c7286a4'; // 替换为你的天气API密钥


// HomeScreen 組件
export default function HomeScreen() {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [weather, setWeather] = useState(null);
    const [suburb, setSuburb] = useState(null);
    const [hourlyForecast, setHourlyForecast] = useState([]);

    // Search constant
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);

    // Map related
    const [mapExpanded, setMapExpanded] = useState(false);
    const [markerPressed, setMarkerPressed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);  // 控制搜尋框是否展開
    const [savedLocations, setSavedLocations] = useState([]);
    const [isSaved, setIsSaved] = useState(false); // is this location in saved location
    const [region, setRegion] = useState(null);

    // Post constant
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isLiked, setIsLiked] = useState(null);
    const [likeCount, setLikeCount] = useState(0);

    // Modal control
    const [modalVisible, setModalVisible] = useState(false);
    const [postVisible, setPostVisible] = useState(false);

    const [refreshing, setRefreshing] = useState(false); // 控制刷新狀態

    const animatedHeight = useRef(new RN.Animated.Value(400)).current;  // 初始化地圖高度動畫
    const animatedWidth = useRef(new RN.Animated.Value(SEARCH_CONTAINER_WIDTH)).current;  // 初始化地圖寬度動畫
    const animatedPadding = useRef(new RN.Animated.Value(15)).current;  // 初始化 `paddingHorizontal`
    const animatedBorderRadius = useRef(new RN.Animated.Value(15)).current;  // 初始化 `borderRadius`
    const animatedBtnTop = useRef(new RN.Animated.Value(50)).current; // 控制按鈕的 top 屬性

    const { isLoggedIn, userToken } = useAuth(); // 使用 `useAuth` 取得登入狀態

    useEffect(() => {
        const getLocationAndWeather = async () => {
            try {
                setLoading(true);
                const coords = await getCurrentLocation();
                if (coords) {
                    setLocation(coords);

                    // 並行取得天氣與小時預報
                    const [weatherData, hourlyData, suburbListData,] = await Promise.all([
                        fetchWeather(coords.latitude, coords.longitude),
                        fetchHourlyForecast(coords.latitude, coords.longitude),
                        fetchSuburbs(userToken),
                    ]);

                    setRegion({
                        latitude: coords.latitude, longitude: coords.longitude,
                        latitudeDelta: 0.0922, longitudeDelta: 0.0421,
                    });

                    setSuburb(suburbListData);
                    setWeather(weatherData);
                    setHourlyForecast(hourlyData);

                }
            } catch (error) {
                console.error('Error fetching location or weather data:', error);
            } finally {
                setLoading(false);
            }
        };
        getLocationAndWeather();
    }, []);

    useEffect(() => {
        if (!userToken) return; // 若尚未登入，不執行資料載入

        const loadAdditionalData = async () => {
            try {
                const [savedLocationsData, filteredPostsData] = await Promise.all([
                    fetchSavedLocations(userToken),
                    fetchFilteredPosts(userToken),
                ]);

                setSavedLocations(savedLocationsData);
                setPosts(filteredPostsData);

                if (weather) {
                    const isCurrentLocationSaved = await isLocationSaved(weather, savedLocationsData);
                    setIsSaved(isCurrentLocationSaved);
                }
            } catch (error) {
                console.error('Error loading additional data:', error);
            }
        };

        loadRecentSearches(setRecentSearches);
        loadAdditionalData();
    }, [userToken]);

    useEffect(() => {
        if (weather && posts.length > 0) {
            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const sameLocationPosts = posts.filter(post => {
                const postTime = new Date(post.created_at); // 將 `created_at` 轉換為日期對象
                return (
                    post.suburb_name.toLowerCase() === (weather?.name || '').toLowerCase() &&
                    postTime >= oneDayAgo // 僅選擇一天內的貼文
                );
            });
            setFilteredPosts(sameLocationPosts);
        }
    }, [weather, posts]);


    // const filteredPosts = posts.filter(post => post.suburb_name.toLowerCase() === (weather?.name || '').toLowerCase());

    const searchLocation = async (searchQuery: string | undefined) => {
        if (!searchQuery.trim()) {
            RN.Alert.alert('Please enter a location to search.');
            return;
        }
        try {
            // const data = await getLocationLaLon(searchQuery)
            //
            // const lat = data[0].latitude;
            // const lon = data[0].longitude;
            // const weather = await fetchWeather(lat, lon);
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${searchQuery}&units=metric&appid=${API_KEY}`
            )
            const weather = await response.json();
            const lat = weather.coord.lat
            const lon = weather.coord.lon
            setWeather(weather);
            setLocation({ latitude: lat, longitude: lon });
            const hourlyData = await fetchHourlyForecast(lat, lon);
            setHourlyForecast(hourlyData);
            await saveRecentSearch(searchQuery, recentSearches, setRecentSearches);
            const isCurrentLocationSaved = await isLocationSaved(weather, savedLocations)
            setIsSaved(isCurrentLocationSaved);
            const savedPosts = await fetchFilteredPosts(userToken);
            setPosts(savedPosts);
        } catch (error) {
            console.error(error);
        }
    };

    const handleMapPress = () => {
        if (markerPressed || postVisible) {
            return;
        }
        setMapExpanded(!mapExpanded);
        RN.Animated.timing(animatedHeight, {
            toValue: mapExpanded ? 400 : SCREEN_HEIGHT,  // 高度改變
            duration: 300,
            useNativeDriver: false,
        }).start();

        RN.Animated.timing(animatedWidth, {
            toValue: mapExpanded ? SEARCH_CONTAINER_WIDTH : SCREEN_WIDTH,  // 寬度改變
            duration: 300,
            useNativeDriver: false,
        }).start();

        RN.Animated.timing(animatedPadding, {
            toValue: mapExpanded ? 15 : 0,  // 根據地圖狀態更改 `paddingHorizontal`
            duration: 300,
            useNativeDriver: false,
        }).start();

        RN.Animated.timing(animatedBorderRadius, {
            toValue: mapExpanded ? 15 : 0,  // 邊角半徑變化：展開時為 0（直角），收起時為 15（圓角）
            duration: 300,
            useNativeDriver: false,
        }).start();

        RN.Animated.timing(animatedBtnTop, {
            toValue: mapExpanded ? 15 : BUTTON_TO_TOP_DISTANCE,
            duration: 300,
            useNativeDriver: false,
        }).start();

    };


    if (loading) {
        return (
            <GradientTheme>
                <RN.ActivityIndicator size="large" color={ColorScheme.BTN_BACKGROUND} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />
            </GradientTheme>
        );
    }

    return (
        <GradientTheme>
            <SafeAreaView style={{ flex: 1 }}>
                <RN.View style={{ flex: 1 }}>
                    <RN.Animated.View style={{ flex: 1, paddingTop: 10, paddingHorizontal: animatedPadding }}>
                        <RN.View style={styles.searchContainer}>
                            <RN.TextInput
                                style={styles.searchInput}
                                placeholder="Search Location"
                                value={searchQuery}
                                onFocus={() => {
                                    setExpanded(true);
                                    setModalVisible(true); // 當點擊 TextInput 時顯示 Modal
                                }}
                                onChangeText={setSearchQuery}
                                onSubmitEditing={() => {
                                    searchLocation(searchQuery);
                                }}
                            />
                            {/* 點擊放大鏡執行搜尋 */}
                            <FontAwesome6 name="magnifying-glass" size={20} color="gray" style={styles.searchIcon} onPress={searchLocation} />
                        </RN.View>

                        {weather && location ? (
                            <RN.View>
                                {/* 天氣資訊顯示容器 */}
                                <RN.View style={styles.weatherInfoContainer}>
                                    <RN.View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <RN.Text style={styles.locationText}>
                                            {weather?.name ? `${weather.name}` : 'Unknown Location'}
                                            {/* 顯示書籤符號，如果是已保存的地點 */}
                                        </RN.Text>
                                        <RN.Text>{isSaved && <FontAwesome name="bookmark"  size={24} color="#FFFFFF" />}</RN.Text>
                                    </RN.View>
                                    <RN.View style={{ flexDirection: 'row', marginBottom: 30, marginTop:20, width: '75%', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <RN.Image source={WeatherIcons.weatherIconMap[weatherIconById?.[weather?.weather?.[0]?.id] ?? 'Clear Sky']} style={styles.weatherIcon} />

                                        <RN.View style={{alignItems:'center', padding: 5}}>
                                            <RN.Text style={styles.temperatureText}>
                                                {weather.main?.temp ? `${weather.main.temp.toFixed(0)}` : 'N/A'}
                                                <RN.Text style={{fontSize: 20}}>{'°C'}</RN.Text>
                                            </RN.Text>

                                            {/* 高溫和低溫顯示 */}
                                            <RN.Text style={styles.highLowText}>
                                                {weather.main?.temp_max ? `H: ${weather.main.temp_max.toFixed(0)}` : 'H: N/A'} |
                                                {weather.main?.temp_min ? ` L: ${weather.main.temp_min.toFixed(0)}` : 'L: N/A'}
                                            </RN.Text>
                                        </RN.View>
                                    </RN.View>

                                    <RN.ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyForecastContainer}>
                                        {hourlyForecast.map((forecast, index) => (

                                            <RN.View key={index} style={styles.hourlyForecast}>
                                                <RN.Image source={forecast.icon} style={styles.hourIcon} />
                                                <RN.Text style={styles.hourText}>{forecast.time}</RN.Text>
                                            </RN.View>
                                        ))}
                                    </RN.ScrollView>
                                </RN.View>

                                {/* 地圖顯示 */}
                                <RN.Animated.View
                                    style={[
                                        styles.mapContainer,
                                        {
                                            height: animatedHeight,
                                            width: animatedWidth,
                                            borderRadius: animatedBorderRadius,
                                            position: 'absolute',
                                            bottom: -400,
                                            left: 0,
                                            right: 0,
                                        },
                                    ]}
                                >
                                    <MapView
                                        style={{ flex: 1, borderRadius: 15, }}
                                        region={{
                                            latitude: location.latitude,
                                            longitude: location.longitude,
                                            latitudeDelta: 0.05,
                                            longitudeDelta: 0.05,
                                        }}
                                        onRegionChangeComplete={async (region) => {
                                            if (postVisible){
                                                return
                                            }
                                            // 當地圖中心點改變後更新 location
                                            const {latitude: lat, longitude: lon} = region;
                                            setLocation({
                                                latitude: lat,
                                                longitude: lon,
                                            });
                                            const weather = await fetchWeather(lat, lon);
                                            const hourlyWeather = await fetchHourlyForecast(lat, lon);
                                            const isCurrentLocationSaved = await isLocationSaved(weather, savedLocations)
                                            setWeather(weather);
                                            setHourlyForecast(hourlyWeather);
                                            setIsSaved(isCurrentLocationSaved);
                                        }}
                                        onPress={(e) => {
                                            if (!markerPressed) {
                                                handleMapPress();  // 僅當未點擊 Marker 時觸發展開地圖行為
                                            } else {
                                                setMarkerPressed(false);  // 重置狀態
                                            }
                                        }}
                                    >
                                        {filteredPosts.map((marker, index) => (
                                            <Marker
                                                key={index}
                                                coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                                                title={marker.title}
                                                onPress={() => {
                                                    setMarkerPressed(true);
                                                    setPostModalVisible(setPostVisible);

                                                }}
                                            >
                                                <RN.View style={styles.circleContainer}>
                                                    <RN.Text style={styles.circleText}>{filteredPosts.length}</RN.Text>
                                                </RN.View>
                                            </Marker>
                                        ))}
                                    </MapView>

                                    <RN.Animated.View style={[styles.mapBtnContainer, { top: animatedBtnTop }]}>
                                        <RN.TouchableOpacity style={styles.mapBtn}>
                                            <RN.Text style={styles.btnText}>1 HR AGO</RN.Text>
                                        </RN.TouchableOpacity>
                                        <RN.TouchableOpacity style={styles.mapBtn} onPress={() => handleAddPost(isLoggedIn)}>
                                            <RN.Text style={styles.btnText}>+ ADD POST</RN.Text>
                                        </RN.TouchableOpacity>
                                    </RN.Animated.View>
                                </RN.Animated.View>
                            </RN.View>
                        ) : null}
                    </RN.Animated.View>
                </RN.View>

                {/* search modal*/}
                <RN.Modal
                    animationType="slide"
                    transparent={false}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <RN.View style={{ flex: 1, paddingTop: 50, paddingHorizontal: 15 }}>
                        <RN.View style={styles.fullScreenSearchContainer}>
                            <FontAwesome6
                                name="arrow-left"
                                size={20}
                                color="gray"
                                style={styles.fullScreenSearchIcon}
                                onPress={() => {
                                    setExpanded(false);
                                    setModalVisible(false);
                                }}
                            />
                            <RN.TextInput
                                style={styles.fullScreenSearchInput}
                                placeholder="Search Here"
                                value={searchQuery}
                                onChangeText={(text) => handleInputChange(text, suburb, setSearchQuery, setFilteredSuggestions, setShowSuggestions)}
                                onSubmitEditing={() => {
                                    searchLocation(searchQuery);
                                    setExpanded(false);
                                    setModalVisible(false);
                                }}
                            />
                            <FontAwesome6 name="magnifying-glass" size={20} color="gray" style={styles.searchIcon} onPress={() => {
                                searchLocation(searchQuery);
                                setExpanded(false);
                                setModalVisible(false);
                            }}
                            />
                        </RN.View>
                        <RN.View style={{height: '7%', paddingHorizontal: 15}}>
                            <RN.ScrollView horizontal>
                                {savedLocations.map((location, index) => (
                                    <RN.TouchableOpacity
                                        key={index}
                                        style={styles.savedLocationBtn}
                                        onPress={() => {
                                         searchLocation(location.suburb_name);
                                         setExpanded(false);
                                         setModalVisible(false);
                                        }}>
                                        <RN.Text style={styles.savedLocationBtnText}>{location.suburb_name}</RN.Text>
                                    </RN.TouchableOpacity>
                                ))}
                            </RN.ScrollView>
                        </RN.View>
                            {showSuggestions && filteredSuggestions.length > 0 && (
                                <RN.FlatList
                                    data={filteredSuggestions}
                                    keyExtractor={(item) => item.suburb_id}
                                    renderItem={({ item }) => { // 檢查 renderItem 中的 item
                                        return (
                                            <RN.TouchableOpacity
                                                style={styles.suggestionItem}
                                                onPress={() => {
                                                    handleSuggestionSelect(item.suburb_name, setSearchQuery, setShowSuggestions);
                                                }}
                                            >
                                                <RN.Text style={styles.suggestionText}>{item.suburb_name}, {item.postcode}</RN.Text>
                                            </RN.TouchableOpacity>
                                        );
                                    }}
                                    style={styles.suggestionList}
                                />
                            )}
                        {/*</RN.View>*/}

                        {/* Recent Searches List */}
                        <RN.ScrollView style={styles.recentSearchContainer}>
                            {recentSearches.length > 0 ? (
                                recentSearches.map((item, index) => (
                                    <RN.View key={index} style={styles.recentSearchItem}>
                                        <RN.View style={{flexDirection:'row', alignItems:'center'}}>
                                            <FontAwesome6 name="clock-rotate-left" size={20} color="gray" style={{ marginRight: 10 }} />
                                            <RN.TouchableOpacity onPress={() => setSearchQuery(item)}>
                                                <RN.Text style={{ fontSize: 20}}>{item}</RN.Text>
                                            </RN.TouchableOpacity>
                                        </RN.View>
                                        <RN.TouchableOpacity onPress={() => removeSearchItem(index, recentSearches, setRecentSearches)}>
                                            <FontAwesome6 name="xmark" size={20} color="black" />
                                        </RN.TouchableOpacity>
                                    </RN.View>
                                ))
                            ) : (
                                <RN.Text style={styles.noRecentSearch}>No recent searches</RN.Text>
                            )}
                        </RN.ScrollView>
                    </RN.View>
                </RN.Modal>

                {/* post list Modal*/}
                <RN.Modal
                    animationType="slide"
                    transparent={true}
                    visible={postVisible}
                    onRequestClose={() => {
                        setSelectedPost(null);
                        setPostVisible(false);
                    }} // Hide the modal when user taps outside
                >

                    <RN.View style={styles.modalBackdrop}>
                        {/* Modal 容器 */}

                        <RN.View style={styles.modalContainer}>
                            <GradientTheme>
                            {!selectedPost ? (
                                <>
                                    <RN.ScrollView style={styles.modalContent}>
                                        <RN.Text style={[styles.locationText,{marginBottom: 10, marginLeft: 5, color: '#000000'}]}>{weather?.name ? `${weather.name}` : 'Unknown Location'}</RN.Text>
                                        {filteredPosts.map((post, index) => (
                                            <RN.TouchableOpacity
                                                key={index}
                                                style={styles.postContainer}
                                                onPress={() => {
                                                    setSelectedPost(post);
                                                    handleLikedPost(userToken, post.post_id, setIsLiked);
                                                    setLikeCount(post.likes);
                                                    handleViewPost(userToken, post.post_id);
                                                }} // 點擊某篇 post 顯示詳細內容
                                            >
                                                <RN.View style={{ flexDirection: 'row',}}>
                                                    <RN.Text style={styles.postTitle}>Now it is {weatherIconById[post.weather_code]}</RN.Text>
                                                    <RN.Image source={WeatherIcons.weatherIconMap[weatherIconById[post.weather_code]]} style={{width: 30, height: 30, marginLeft: 5,}}/>
                                                </RN.View>
                                                <RN.Text style={styles.postText}>{post.comment}</RN.Text>
                                                <View style={styles.infoContainer}>
                                                    <View style={styles.statusContainer}>
                                                        <RN.Text style={styles.postDetails}>Likes: {post.likes} | Views: {post.views}</RN.Text>
                                                    </View>
                                                    <View style={styles.timeContainer}>
                                                        <Text style={styles.timeText}>{formatTimeDifference(post.created_at)}</Text>
                                                    </View>
                                                </View>
                                            </RN.TouchableOpacity>
                                        ))}
                                    </RN.ScrollView>
                                    {/* 底部按鈕區域 */}
                                    <RN.View style={styles.footer}>
                                        <RN.Button title="Close" onPress={() => setPostVisible(false)} />
                                    </RN.View>
                                </>
                            ) : (
                                // 顯示選中 post 的詳細內容
                                <RN.View style={styles.postDetailContainer}>
                                    <FontAwesome6
                                        name="arrow-left"
                                        size={26}
                                        color= {BTN_BACKGROUND}
                                        style={styles.postBackIcon}
                                        onPress={async () => {
                                            try {
                                                // 返回的時候先將選中的貼文設為 null
                                                setSelectedPost(null);

                                                // 取得過濾後的貼文
                                                const savedPosts = await fetchFilteredPosts(userToken);
                                                const filteredPosts = savedPosts.filter(post =>
                                                    post.suburb_name.toLowerCase() === (weather?.name || '').toLowerCase()
                                                );
                                                // 更新 `posts` 狀態
                                                setPosts(savedPosts);
                                                setFilteredPosts(filteredPosts);
                                            } catch (error) {
                                                console.error("Error retrieving filtered posts:", error);
                                            }
                                    }}
                                    />
                                    <RN.View style={{ marginTop: 30 }}>
                                        <RN.View style={{height:'45%', marginVertical:10,}}>
                                            <RN.Text style={styles.postDetailTitle}>Now it is</RN.Text>
                                            <RN.View style={{alignItems:'center'}}>
                                                <RN.Image source={WeatherIcons.weatherIconMap[weatherIconById[selectedPost.weather_code]]} style={styles.weatherIcon} />
                                                <RN.Text style={styles.postDetailTitle}>{weatherIconById[selectedPost.weather_code]}</RN.Text>
                                            </RN.View>
                                        </RN.View>
                                        <RN.View style={{height:'45%',flexDirection: 'column', justifyContent:'space-around', marginVertical:10}}>
                                            <RN.ScrollView>
                                                <RN.Text style={styles.postDetailText}>comment: {selectedPost.comment}</RN.Text>
                                            </RN.ScrollView>
                                            <RN.View style={styles.infoContainer}>
                                                <RN.View style={styles.postLikeView}>
                                                    <TouchableOpacity
                                                        style={styles.iconGroup}
                                                        onPress={() => {
                                                            handleToggleLike(userToken, selectedPost.post_id, isLiked, likeCount, setLikeCount, setIsLiked);
                                                        }}
                                                    >
                                                        <Icon
                                                            name={isLiked ? "favorite" : "favorite-border"}
                                                            size={24}
                                                            color={isLiked ? "red" : "black"} // Red when liked
                                                        />
                                                        <Text style={styles.likeCount}>{likeCount} </Text>
                                                    </TouchableOpacity>
                                                    <RN.Text style={{fontSize: 16}}>
                                                        | Views: {selectedPost.views}
                                                    </RN.Text>
                                                </RN.View>
                                                <RN.View style={styles.timeContainer}>
                                                    <Text style={styles.timeText}>{formatTimeDifference(selectedPost.created_at)}</Text>
                                                </RN.View>
                                            </RN.View>
                                        </RN.View>
                                    </RN.View>
                                </RN.View>
                            )}
                        </GradientTheme>
                        </RN.View>

                    </RN.View>

                </RN.Modal>
            </SafeAreaView>
        </GradientTheme>
    );
}

const styles = RN.StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // borderColor: 'gray',
        // borderWidth: 1,
        backgroundColor: '#ffffff90',
        borderRadius: 30,
    },
    searchInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 15,
        fontSize: 20,
    },
    searchIcon: {
        paddingRight: 15,
    },
    weatherInfoContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    weatherIcon: {
        width: 120,
        height: 120,
    },
    locationText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        paddingRight: 10,
    },
    temperatureText: {
        fontSize: 90,
        color: '#FFFFFF',
    },
    highLowText: {
        fontSize: 18,
        color: '#FFFFFF',
    },
    mapContainer: {
        // borderStyle: 'solid',
        // borderWidth: 0.2,
        borderRadius: 15,
    },
    mapView: {
        height: 400,
        marginTop: 10,
        borderStyle: 'solid',
        borderWidth: 0.2,
        borderRadius: 15,
    },
    btnText: {
        color: '#000000',
        // fontWeight: 'bold',
    },
    mapBtnContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'absolute',
        width: '100%',
    },
    mapBtn: {
        backgroundColor: '#FFFFFF95',
        padding: 10,
        borderRadius: 30,
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    hourlyForecastContainer: {
        width: '100%',
        backgroundColor: '#FFFFFF50',
        borderRadius: 20,
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    hourlyForecast: {
        padding: 10,
        alignItems: 'center',
    },
    hourIcon: {
        width: 50,
        height: 50,
    },
    hourText: {
        fontSize: 14,
        color: '#FFFFFF',
    },

    // Full screen style
    fullScreenSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: ColorScheme.BTN_BACKGROUND,
        borderWidth: 1,
        backgroundColor: '#ffffff90',
        borderRadius: 30,
        marginTop: 10
    },
    fullScreenSearchInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 15,
        fontSize: 20,
    },
    fullScreenSearchIcon: {
        paddingLeft: 15,
        color: ColorScheme.BTN_BACKGROUND,
    },

    // recent search style
    recentSearchContainer: {
        flexDirection: 'row',
        paddingLeft:15,
        paddingTop: 10,
    },
    recentSearchItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: SCREEN_WIDTH*0.85,
        // borderWidth: 1,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#D0D0D090',
    },
    noRecentSearch: {
        flexDirection: 'row',
    },
    savedLocationBtn: {
        backgroundColor: BTN_BACKGROUND,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        paddingHorizontal: 20,
        marginLeft: 5,
    },
    savedLocationBtnText: {
        color: '#FFFFFF',
        fontSize: 20,
        marginVertical: 10,
    },

    circleContainer: {
        backgroundColor: 'rgba(0, 150, 255, 0.7)',
        borderRadius: 30,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    calloutContainer:{
        flexDirection: 'column',
        width: 400,
    },
    calloutTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    calloutText: {
        fontSize: 14,
    },
    modalView: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明背景
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        width: '85%',
        height: '60%', // 固定 Modal 的高度
        borderRadius: 20,
        overflow: 'hidden',
    },
    modalContent: {
        padding: 20,
        height: '80%', // ScrollView 的高度，讓內部 post 可以滾動
    },
    footer: {
        height: '10%', // 預留按鈕區域的高度
        justifyContent: 'center',
        alignItems: 'center',
    },
    postContainer: {
        marginBottom: 15,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#f9f9f990',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    postTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    postText: {
        marginVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    postDetails: {
        fontSize: 12,
        color: '#555',
    },
    postDetailContainer: {
        height: '90%',
        borderRadius: 20,
        backgroundColor: '#f9f9f990',
        marginHorizontal: 15,
        marginVertical: 25,
        justifyContent: 'center',
        padding: 20,
    },
    postDetailTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    postDetailText: {
        fontSize: 18,
        marginVertical: 10,
    },
    postDetailInfo: {
        fontSize: 16,
        color: 'gray',
        marginBottom: 20,
    },
    additionalInfo: {
        fontSize: 16,
        marginBottom: 20,
    },

    suggestionList: {
        position: 'absolute', // 設置為絕對定位
        top: 120, // 根據輸入框位置調整，確保它顯示在輸入框下方
        width: '100%',
        maxHeight: '40%',
        backgroundColor: '#ffffff',
        zIndex: 100, // 確保它顯示在其他元素上方
        marginLeft:15,
        borderLeftWidth: 1,
        borderLeftColor:BTN_BACKGROUND,
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    suggestionText: {
        fontSize: 16,
    },
    postBackIcon: {
        position: 'absolute',
        top: 20,
        left: 20,
    },
    iconGroup: {
        flexDirection:'row',
        alignItems: 'center',
    },
    postLikeView: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusContainer: {
        flex: 1,
    },
    statusText: {
        fontWeight: 'bold',
        color: '#333',
    },
    timeContainer: {
        width: 'auto',
    },
    timeText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
    },

});