import React, { useState, useEffect, useRef } from 'react';
import * as RN from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import GradientTheme from '@/components/GradientTheme';
import { useAuth } from '@/components/accAuth';
import * as WeatherIcons from "@/constants/Mappings";
import * as ColorScheme from "@/constants/ColorScheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
    getCurrentLocation, fetchWeather, fetchHourlyForecast, loadRecentSearches, saveRecentSearch,
    removeSearchItem, fetchFilteredPosts, handleAddPost, isLocationSaved, fetchSavedLocations,
    setPostModalVisible, handleInputChange, handleSuggestionSelect, handleToggleLike,
    handleLikedPost, handleViewPost, formatTimeDifference,
} from '@/constants/mapUtils';
import { BTN_BACKGROUND } from "@/constants/ColorScheme";
import { weatherIconById } from "@/constants/weatherCode";
import { API_LINK } from "@/constants/API_link";
import ModalSelector from 'react-native-modal-selector';
import { fetchSuburbs, loadCachedSuburbs } from '@/constants/suburbService';
// <a href="https://www.flaticon.com/packs/weather-163" title="weather icons">weather icons created by iconixar - Flaticon</a>

const timeOptions = [
    { id: 1, label: '1 HR AGO', value: '60' },
    { id: 2, label: '3 HRS AGO', value: '180' },
    { id: 3, label: '6 HRS AGO', value: '360' },
    { id: 4, label: '12 HRS AGO', value: '720' },
    { id: 5, label: '1 DAY AGO', value: '1440' },
]

const SCREEN_HEIGHT = RN.Dimensions.get('window').height;
const SCREEN_WIDTH = RN.Dimensions.get('window').width;

const SEARCH_CONTAINER_WIDTH = SCREEN_WIDTH - 30;
const BUTTON_TO_TOP_DISTANCE = SCREEN_HEIGHT * 0.08;

// OpenWeather api keys
const API_KEY = 'acbdc80633478d6533e96ea77d9cd3a8';
// const API_KEY = '9480d17e216cfcf5b44da6050c7286a4';

// Main home screen component
export default function HomeScreen() {
    // Use state for storing locations and related information
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [weather, setWeather] = useState(null);
    const [suburbs, setSuburbs] = useState(null);
    const [hourlyForecast, setHourlyForecast] = useState([]);

    // Use states for searching
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);

    // Map related useStates
    const [mapExpanded, setMapExpanded] = useState(false);
    const [markerPressed, setMarkerPressed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [savedLocations, setSavedLocations] = useState([]);
    const [isSaved, setIsSaved] = useState(false);
    const [region, setRegion] = useState(null);
    const [selectedTime, setSelectedTime] = useState('60');
    const [selectedLabel, setSelectedLabel] = useState('1 HR AGO');
    const mapRef = useRef(null); // Ref for the MapView

    const [visibleSuburbs, setVisibleSuburbs] = useState([]);
    const previousRegion = useRef(null);

    // Post modal useStates
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isLiked, setIsLiked] = useState(null);
    const [likeCount, setLikeCount] = useState(0);

    // Modal control useStates
    const [focusSuburb, setFocusSuburb] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [postVisible, setPostVisible] = useState(false);

    // Constants and sizes for map animation
    const animatedHeight = useRef(new RN.Animated.Value(400)).current;
    const animatedWidth = useRef(new RN.Animated.Value(SEARCH_CONTAINER_WIDTH)).current;
    const animatedPadding = useRef(new RN.Animated.Value(15)).current;
    const animatedBorderRadius = useRef(new RN.Animated.Value(15)).current;
    const animatedBtnTop = useRef(new RN.Animated.Value(50)).current;

    // Login status
    const { isLoggedIn, userToken } = useAuth();

    useEffect(() => {
        // Function for retrieving location and weather information when the app loads
        const getLocationAndWeather = async () => {

            try {
                // Set loading screen true
                setLoading(true);

                // Fetch suburbs
                // fetchSuburbs(setSuburbs);
                loadCachedSuburbs(setSuburbs, fetchSuburbs);

                // Get current location
                const coords = await getCurrentLocation();

                // If successfully retrieved the coordinates
                if (coords) {

                    // Save current location
                    setLocation(coords);

                    // Fetch all weather information based on current location
                    const [currentWeather, hourlyForecast] = await Promise.all([
                        fetchWeather(coords.latitude, coords.longitude),
                        fetchHourlyForecast(coords.latitude, coords.longitude),
                    ]);

                    // Save region so it updates on the map
                    setRegion({
                        latitude: coords.latitude, longitude: coords.longitude,
                        latitudeDelta: 0.05, longitudeDelta: 0.05,
                    });

                    // Save weather information
                    setWeather(currentWeather);
                    setHourlyForecast(hourlyForecast);
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
        // If user is not logged in, do not run this code block
        if (!userToken) return;

        // Load additional data that user saved
        const loadAdditionalData = async () => {
            try {
                // Fetch saved locations and users' posts & save locally
                const [savedLocationsData, filteredPostsData] = await Promise.all([
                    fetchSavedLocations(userToken),
                    fetchFilteredPosts(userToken),
                ]);

                setSavedLocations(savedLocationsData);
                setPosts(filteredPostsData);

                // If weather retrieved successfully from weather API
                if (weather) {
                    // Save current location if not already
                    const isCurrentLocationSaved = await isLocationSaved(weather, savedLocationsData);
                    setIsSaved(isCurrentLocationSaved);
                }
            } catch (error) {
                console.error('Error loading additional data:', error);
            }
        };

        // Load search history and additional data
        loadRecentSearches(setRecentSearches);
        loadAdditionalData();
    }, [userToken]);

    useEffect(() => {
        // If weather information retrieved successfully and there are posts to show
        if (weather && posts?.length > 0) {
            // Set and format the posted timing in comparison to current time
            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const sameLocationPosts = posts.filter(post => {
                const postTime = new Date(post.created_at);
                return (
                    post.suburb_name.toLowerCase() === (weather?.name || '').toLowerCase() &&
                    postTime >= oneDayAgo
                );
            });
            setFilteredPosts(sameLocationPosts);
        }
    }, [weather, posts]);

    // Update saved states of the current location
    const updateLocationData = async (lat, lon) => {
        try {
            // Fetch current weather condition based on new location
            const [currentWeather, hourlyForecast] = await Promise.all([
                fetchWeather(lat, lon),
                fetchHourlyForecast(lat, lon),
            ]);

            // Save them in use states
            setWeather(currentWeather);
            setLocation({ latitude: lat, longitude: lon });
            setHourlyForecast(hourlyForecast);

            // Format of new region data
            const newRegion = {
                latitude: lat,
                longitude: lon,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };

            // Update region only via animateToRegion
            if (mapRef.current) {
                // Smooth transition to avoid flickering
                mapRef.current.animateToRegion(newRegion, 1000);
            }

            // Store the latest region in state
            setRegion(newRegion);
        } catch (error) {
            console.error('Error fetching weather or location data:', error);
        }
    };

    // Function to search for location from the search bar
    const searchLocation = async (query) => {
        // If there is no query enter, update according to current location and return
        if (!query || !query.trim()) {
            try {
                const coords = await getCurrentLocation();
                await updateLocationData(coords.latitude, coords.longitude);
            } catch (error) {
                console.error('Error fetching current location:', error);
            }
            return;
        }

        try {
            // Split the query for further processing
            const queryParts = query.split(',').map(part => part.trim());

            let matchedSuburb;

            // if search according to suburb suggestion
            if (queryParts.length === 2) {
                // If the query is in the format 'suburb_name, postcode'
                const suburbName = queryParts[0].toLowerCase();
                const postcode = queryParts[1];

                // Search for matching suburb with both name and postcode
                matchedSuburb = suburbs.find(suburb =>
                    suburb.suburb_name.toLowerCase() === suburbName &&
                    suburb.postcode.toString() === postcode
                );

            } else if (queryParts.length === 1) {
                // else directly search through the typed query
                const input = queryParts[0];

                // Check if the input is a number (postcode search)
                if (/^\d+$/.test(input)) {
                    // Search for matching suburb based on postcode only
                    matchedSuburb = suburbs.find(suburb =>
                        suburb.postcode.toString() === input
                    );

                    if (matchedSuburb) {

                        const { latitude, longitude } = matchedSuburb;
                        // Update location based on postcode
                        updateLocationData(latitude, longitude);
                        await saveRecentSearch(matchedSuburb.postcode, recentSearches,
                            setRecentSearches);

                    } else {
                        console.log('No suburb found for the postcode.');
                        Alert.alert('Error', 'No suburb found for the provided postcode.');
                    }

                } else {
                    // Else search the name directly on OpenWeather API
                    const response = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?q=${queryParts[0].toLowerCase()}
                        ,AU&units=metric&appid=${API_KEY}`
                    );

                    // Using weather condition data returned
                    const weather = await response.json();
                    const { lat, lon } = weather.coord;

                    // Update the location and region
                    await updateLocationData(lat, lon);

                    await saveRecentSearch(query, recentSearches, setRecentSearches);
                }
            }

            // If a matcheed suburb is found
            if (matchedSuburb) {
                console.log('Suburb found:', matchedSuburb);

                // Retrieve latitude and longitude
                const { latitude, longitude } = matchedSuburb;
                console.log('Latitude:', latitude, 'Longitude:', longitude);

                // Update the location based on the latitude and longitude
                updateLocationData(latitude, longitude);

                // Save to recent search
                await saveRecentSearch(`${matchedSuburb.suburb_name}, ${matchedSuburb.postcode}`, recentSearches, setRecentSearches);

            } else {
                console.log('No suburb suggestion found for the query.');
            }

            // Save current search to saved location (simulation, non-functional)
            const isCurrentLocationSaved = await isLocationSaved(weather, savedLocations);
            setIsSaved(isCurrentLocationSaved);

        } catch (error) {
            // Else raise an error alert
            console.error('Error searching location:', error);
            RN.Alert.alert('Error', 'Suburb or city not found in Australia.');
        }
    };

    // Function handling when the map is pressed, expand or minimize
    const handleMapPress = () => {
        if (markerPressed || postVisible) {
            return;
        }
        setMapExpanded(!mapExpanded);

        // Height change
        RN.Animated.timing(animatedHeight, {
            toValue: mapExpanded ? 400 : SCREEN_HEIGHT,
            duration: 300,
            useNativeDriver: false,
        }).start();

        // Width change
        RN.Animated.timing(animatedWidth, {
            toValue: mapExpanded ? SEARCH_CONTAINER_WIDTH : SCREEN_WIDTH,
            duration: 300,
            useNativeDriver: false,
        }).start();

        // Change the `paddingHorizontal` according to map Expanded or not
        RN.Animated.timing(animatedPadding, {
            toValue: mapExpanded ? 15 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();

        // change border radius
        RN.Animated.timing(animatedBorderRadius, {
            toValue: mapExpanded ? 15 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();

        // Animate buttons on map
        RN.Animated.timing(animatedBtnTop, {
            toValue: mapExpanded ? 15 : BUTTON_TO_TOP_DISTANCE,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    // Function to calculate the lat-long range of the map view based on the region
    const calculateLatLongRange = (region) => {
        const { latitude, longitude, latitudeDelta, longitudeDelta } = region;

        const northEast = {
            latitude: latitude + latitudeDelta / 2,
            longitude: longitude + longitudeDelta / 2,
        };

        const southWest = {
            latitude: latitude - latitudeDelta / 2,
            longitude: longitude - longitudeDelta / 2,
        };

        return { northEast, southWest };
    };

    // Filter suburbs within the visible map range
    const filterSuburbs = (region) => {
        const { northEast, southWest } = calculateLatLongRange(region);

        const filtered = suburbs.filter((suburb) => {
            return (
                suburb.latitude >= southWest.latitude &&
                suburb.latitude <= northEast.latitude &&
                suburb.longitude >= southWest.longitude &&
                suburb.longitude <= northEast.longitude
            );
        });

        setVisibleSuburbs(filtered); // Store filtered suburbs in state
        fetchPostCounts(filtered); // Fetch post counts for the visible suburbs
    };

    // Fetch the number of posts for each visible suburb
    const fetchPostCounts = async (filteredSuburbs) => {
        try {
            const suburbPostCounts = await Promise.all(
                filteredSuburbs.map(async (suburb) => {
                    const response = await fetch(
                        `${API_LINK}/get_posts?suburb_id=${suburb.id}&time_interval=${selectedTime}`
                    );
                    if (response.ok) {
                        const result = await response.json();
                        // Store post count with suburb
                        return { ...suburb, postCount: result.data.length };
                    } else {
                        console.error(`Failed to fetch posts for suburb ${suburb.id}`);
                        return { ...suburb, postCount: 0 }; // Default to 0 if API fails
                    }
                })
            );
            setVisibleSuburbs(suburbPostCounts); // Update visible suburbs with post counts
        } catch (error) {
            console.log('Error fetching post counts:', error);
        }
    };

    // const [ignoreMapPress, setIgnoreMapPress] = React.useState(false);

    // Function to check if the changes on map is completed (after user scrolling)
    const handleRegionChangeComplete = (newRegion) => {
        if (hasRegionChanged(newRegion)) {
            previousRegion.current = newRegion;
            setRegion(newRegion); // Store the new region
            filterSuburbs(newRegion); // Filter suburbs based on the new region
        }
    };

    // Function to minimize the sensitivity for map changes to avoid minor flickers
    const hasRegionChanged = (newRegion) => {
        if (!previousRegion.current) return true; // Allow the first change

        const { latitude, longitude, latitudeDelta, longitudeDelta } = newRegion;
        const prev = previousRegion.current;

        // Check for significant changes to avoid minor flickers
        const threshold = 0.0001;
        return (
            Math.abs(latitude - prev.latitude) > threshold ||
            Math.abs(longitude - prev.longitude) > threshold ||
            Math.abs(latitudeDelta - prev.latitudeDelta) > threshold ||
            Math.abs(longitudeDelta - prev.longitudeDelta) > threshold
        );
    };

    // Loading screen
    if (loading) {
        return (
            <GradientTheme>
                <RN.ActivityIndicator
                    size="large"
                    color={ColorScheme.BTN_BACKGROUND}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />
            </GradientTheme>
        );
    }

    return (
        <GradientTheme>
            <SafeAreaView style={{ flex: 1 }}>
                <RN.View style={{ flex: 1 }}>
                    <RN.Animated.View
                        style={{ flex: 1, paddingTop: 10, paddingHorizontal: animatedPadding }}>
                        <RN.View style={styles.searchContainer}>
                            <RN.TextInput
                                style={styles.searchInput}
                                placeholder="Search QLD suburb or city here"
                                value={searchQuery}
                                onFocus={() => {
                                    setExpanded(true);
                                    // expand search modal when clicking TextInput
                                    setModalVisible(true);
                                }}
                                onChangeText={setSearchQuery}
                            />
                            {/* click the magnifier to search */}
                            <FontAwesome6
                                name="magnifying-glass"
                                size={20}
                                color="gray"
                                style={styles.searchIcon}
                                onPress={() => {
                                    searchLocation(searchQuery);
                                    setModalVisible(false);
                                    setExpanded(false);
                                    RN.Keyboard.dismiss();
                                }} />
                        </RN.View>

                        {weather && location ? (
                            <RN.View>
                                {/* Weather info container */}
                                <RN.View style={styles.weatherInfoContainer}>
                                    <RN.View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <RN.Text style={styles.locationText}>
                                            {weather?.name ? `${weather.name}` : 'Unknown Location'}
                                        </RN.Text>
                                        {/* show the bookmark sign if location is saved */}
                                        <RN.Text>
                                            {isSaved &&
                                                <FontAwesome
                                                    name="bookmark" size={24} color="#FFFFFF" />}
                                        </RN.Text>
                                    </RN.View>
                                    <RN.View style={{ flexDirection: 'row', marginBottom: 30, marginTop: 20, width: '75%', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <RN.Image source={WeatherIcons.weatherIconMap[weatherIconById?.[weather?.weather?.[0]?.id] ?? 'Clear Sky']} style={styles.weatherIcon} />

                                        <RN.View style={{ alignItems: 'center', padding: 5 }}>
                                            <RN.Text style={styles.temperatureText}>
                                                {weather.main?.temp ? `${weather.main.temp.toFixed(0)}` : 'N/A'}
                                                <RN.Text style={{ fontSize: 20 }}>{'°C'}</RN.Text>
                                            </RN.Text>

                                            {/* showing highest and lowest temp */}
                                            <RN.Text style={styles.highLowText}>
                                                {weather.main?.temp_max ? `H: ${weather.main.temp_max.toFixed(0)}` : 'H: N/A'} |
                                                {weather.main?.temp_min ? ` L: ${weather.main.temp_min.toFixed(0)}` : 'L: N/A'}
                                            </RN.Text>
                                        </RN.View>
                                    </RN.View>

                                    {/* hourly weather forecast */}
                                    <RN.ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyForecastContainer}>
                                        {hourlyForecast.map((forecast, index) => (

                                            <RN.View key={index} style={styles.hourlyForecast}>
                                                <RN.Text style={styles.hourText}>{forecast.time}</RN.Text>
                                                <RN.Image source={forecast.icon} style={styles.hourIcon} />
                                                <RN.Text style={styles.hourText}>{forecast.temp}{'°C'}</RN.Text>
                                            </RN.View>
                                        ))}
                                    </RN.ScrollView>
                                </RN.View>
                                {/*<RN.Text style={{color: 'grey'}} onPress={() => RN.Linking.openURL('https://www.flaticon.com/packs/weather-163')}>*/}
                                {/*    weather icons created by iconixar - Flaticon*/}
                                {/*</RN.Text>*/}
                                {/* map view */}
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
                                        ref={mapRef} // Attach the ref to the MapView
                                        style={{ flex: 1, borderRadius: 15 }}
                                        region={region} // Bind the region to MapView
                                        onRegionChangeComplete={handleRegionChangeComplete}
                                        showsUserLocation
                                        minZoomLevel={11.5}
                                        onPress={(e) => {
                                            // Only handle map press if a marker isn't clicked
                                            if (!markerPressed) {
                                                handleMapPress();
                                            } else {
                                                // Reset marker state after marker is clicked
                                                setMarkerPressed(false);
                                            }
                                        }}
                                    >
                                        {visibleSuburbs.map((suburb) => (
                                            suburb.postCount > 0 && (
                                                <Marker
                                                    key={suburb.id}
                                                    coordinate={{ latitude: suburb.latitude, longitude: suburb.longitude }}
                                                    title={suburb.suburb_name}
                                                    onPress={async () => {
                                                        setFocusSuburb(suburb);
                                                        setMarkerPressed(true);
                                                        try {
                                                            const posts = await fetchFilteredPosts(userToken, suburb.suburb_id, selectedTime);
                                                            // Filter posts by suburb name
                                                            const filteredPostsClick = posts.filter((post) => post.suburb_name.trim().toLowerCase() === suburb.suburb_name.trim().toLowerCase());
                                                            setFilteredPosts(() => [...filteredPostsClick]);
                                                        } catch (error) {
                                                            console.log('Error fetching posts:', error);
                                                        };
                                                        setPostModalVisible(setPostVisible);
                                                    }}
                                                >
                                                    <RN.View style={styles.circleContainer}>
                                                        <RN.Text style={styles.circleText}>{suburb.postCount}</RN.Text>
                                                    </RN.View>
                                                </Marker>
                                            )
                                        ))}
                                    </MapView>

                                    <RN.Animated.View style={[styles.mapBtnContainer, { top: animatedBtnTop }]}>
                                        <ModalSelector
                                            data={timeOptions.map(({ id, label, value }) => ({
                                                key: id,
                                                label,
                                                value,
                                            }))}
                                            initValue={selectedLabel}
                                            onChange={(option) => {
                                                setSelectedTime(option.value);
                                                filterSuburbs(region);
                                                setSelectedLabel(option.label)
                                            }}
                                            style={styles.selectorOverride}
                                            initValueTextStyle={styles.btnText}
                                            selectTextStyle={styles.btnText}
                                        />
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
                    onRequestClose={() => { RN.Keyboard.dismiss(); setModalVisible(false); setExpanded(false); }}
                >
                    <RN.View style={{ flex: 1, paddingTop: '15%' }}>
                        <RN.View style={styles.fullScreenSearchContainer}>
                            <FontAwesome6
                                name="arrow-left"
                                size={20}
                                color="gray"
                                style={styles.fullScreenSearchIcon}
                                onPress={() => {
                                    setExpanded(false);
                                    setModalVisible(false);
                                    RN.Keyboard.dismiss();
                                }}
                            />
                            <RN.TextInput
                                style={styles.fullScreenSearchInput}
                                placeholder="Search Here"
                                value={searchQuery}
                                onChangeText={(text) => handleInputChange(text, suburbs, setSearchQuery, setFilteredSuggestions, setShowSuggestions)}
                                onSubmitEditing={() => {
                                    searchLocation(searchQuery);
                                    setExpanded(false);
                                    setModalVisible(false);
                                    RN.Keyboard.dismiss();
                                }}
                            />
                            <FontAwesome6 name="magnifying-glass" size={20} color="gray" style={styles.searchIcon} onPress={() => {
                                searchLocation(searchQuery);
                                setExpanded(false);
                                setModalVisible(false);
                                RN.Keyboard.dismiss();
                            }}
                            />
                        </RN.View>
                        {savedLocations?.length ? (
                            <RN.View style={{ height: '7%', paddingHorizontal: 15 }}>
                                <RN.ScrollView horizontal>
                                    {savedLocations.map((location, index) => (
                                        <RN.TouchableOpacity
                                            key={index}
                                            style={styles.savedLocationBtn}
                                            onPress={() => {
                                                searchLocation(location.suburb_name);
                                                setSearchQuery(location.suburb_name);
                                                setExpanded(false);
                                                setModalVisible(false);
                                            }}>
                                            <RN.Text style={styles.savedLocationBtnText}>
                                                {location.label}: <RN.Text style={{ fontSize: 16 }}>{location.suburb_name}</RN.Text>
                                            </RN.Text>
                                        </RN.TouchableOpacity>
                                    ))}
                                </RN.ScrollView>
                            </RN.View>
                        ) : null}

                        {showSuggestions && filteredSuggestions.length > 0 && (
                            <RN.FlatList
                                data={filteredSuggestions}
                                keyExtractor={(item) => item.suburb_id}
                                renderItem={({ item }) => {
                                    return (
                                        <RN.TouchableOpacity
                                            style={styles.suggestionItem}
                                            onPress={() => {
                                                handleSuggestionSelect(`${item.suburb_name}, ${item.postcode}`, setSearchQuery, setShowSuggestions);
                                            }}
                                        >
                                            <RN.Text style={styles.suggestionText}>{item.suburb_name}, {item.postcode}</RN.Text>
                                        </RN.TouchableOpacity>
                                    );
                                }}
                                style={styles.suggestionList}
                            />
                        )}

                        {/* Recent Searches List */}
                        <RN.ScrollView style={styles.recentSearchContainer}>
                            {recentSearches.length > 0 ? (
                                recentSearches.map((item, index) => (
                                    <RN.View key={index} style={styles.recentSearchItem}>
                                        <RN.View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <FontAwesome6 name="clock-rotate-left" size={20} color="gray" style={{ marginRight: '10%' }} />
                                            <RN.TouchableOpacity onPress={() => setSearchQuery(item)}>
                                                <RN.Text style={{ fontSize: 20 }}>{item}</RN.Text>
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
                        <RN.View style={styles.modalContainer}>
                            <GradientTheme>
                                {!selectedPost ? (
                                    <>
                                        <RN.ScrollView style={styles.modalContent}>
                                            <RN.Text style={[styles.locationText, { marginBottom: 10, marginLeft: 5, color: '#000000' }]}>{focusSuburb?.suburb_name ? `${focusSuburb.suburb_name}` : 'Unknown Location'}</RN.Text>
                                            {filteredPosts.map((post, index) => (
                                                <RN.TouchableOpacity
                                                    key={index}
                                                    style={styles.postContainer}
                                                    onPress={() => {
                                                        setSelectedPost(post);
                                                        handleLikedPost(userToken, post.post_id, setIsLiked);
                                                        setLikeCount(post.likes);
                                                        handleViewPost(userToken, post.post_id);
                                                    }} // click to show the content of selected post
                                                >
                                                    <RN.View style={{ flexDirection: 'row', }}>
                                                        <RN.Text style={styles.postTitle}>Now it is {weatherIconById[post.weather_code]}</RN.Text>
                                                        <RN.Image source={WeatherIcons.weatherIconMap[weatherIconById[post.weather_code]]} style={{ width: 30, height: 30, marginLeft: 5, }} />
                                                    </RN.View>
                                                    <RN.Text style={styles.postText}>{post.comment}</RN.Text>
                                                    <RN.View style={styles.infoContainer}>
                                                        <RN.View style={styles.statusContainer}>
                                                            <RN.Text style={styles.postDetails}>Likes: {post.likes} | Views: {post.views}</RN.Text>
                                                        </RN.View>
                                                        <RN.View style={styles.timeContainer}>
                                                            <RN.Text style={styles.timeText}>{formatTimeDifference(post.created_at)}</RN.Text>
                                                        </RN.View>
                                                    </RN.View>
                                                </RN.TouchableOpacity>
                                            ))}
                                        </RN.ScrollView>
                                        <RN.View style={styles.footer}>
                                            <RN.Button title="Close" onPress={() => setPostVisible(false)} />
                                        </RN.View>
                                    </>
                                ) : (
                                    // showing the content of selected post
                                    <RN.View style={styles.postDetailContainer}>
                                        <FontAwesome6
                                            name="arrow-left"
                                            size={26}
                                            color={BTN_BACKGROUND}
                                            style={styles.postBackIcon}
                                            onPress={() => {
                                                setPostVisible(true);
                                                setSelectedPost(null);
                                            }
                                            }
                                        />
                                        <RN.View style={{ marginTop: 30 }}>
                                            <RN.View style={{ height: '45%', marginVertical: 10, }}>
                                                <RN.Text style={styles.postDetailTitle}>Now it is</RN.Text>
                                                <RN.View style={{ alignItems: 'center' }}>
                                                    <RN.Image source={WeatherIcons.weatherIconMap[weatherIconById[selectedPost.weather_code]]} style={styles.weatherIcon} />
                                                    <RN.Text style={styles.postDetailTitle}>{weatherIconById[selectedPost.weather_code]}</RN.Text>
                                                </RN.View>
                                            </RN.View>
                                            <RN.View style={{ height: '45%', flexDirection: 'column', justifyContent: 'space-around', marginVertical: 10 }}>
                                                <RN.ScrollView>
                                                    <RN.Text style={styles.postDetailText}>comment: {selectedPost.comment}</RN.Text>
                                                </RN.ScrollView>
                                                <RN.View style={styles.infoContainer}>
                                                    <RN.View style={styles.postLikeView}>
                                                        <RN.TouchableOpacity
                                                            style={styles.iconGroup}
                                                            onPress={() => {
                                                                handleToggleLike(userToken, selectedPost.post_id, isLiked, likeCount, setLikeCount, setIsLiked);
                                                            }}
                                                        >
                                                            <Icon
                                                                name={isLiked ? "favorite" : "favorite-border"}
                                                                size={24}
                                                                color={isLiked ? "red" : "black"}
                                                            />
                                                            <RN.Text style={styles.likeCount}>{likeCount} </RN.Text>
                                                        </RN.TouchableOpacity>
                                                        <RN.Text style={{ fontSize: 16 }}>
                                                            | Views: {selectedPost.views}
                                                        </RN.Text>
                                                    </RN.View>
                                                    <RN.View style={styles.timeContainer}>
                                                        <RN.Text style={styles.timeText}>{formatTimeDifference(selectedPost.created_at)}</RN.Text>
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

    // weather information
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
        fontWeight: 'bold',
    },

    // map
    mapContainer: {
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
    },
    mapBtnContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'absolute',
        width: '100%',
    },
    mapBtn: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 9.5,
        paddingHorizontal: 15,
        borderRadius: 7,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: '#A1A1A1'
    },
    selectorOverride: {
        width: 100,
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
    },


    // Full screen search
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
    suggestionList: {
        position: 'absolute',
        top: 120,
        width: '93%',
        maxHeight: '50%',
        backgroundColor: '#ffffff',
        zIndex: 100,
        marginLeft: 15,
        borderWidth: 1,
        borderColor: BTN_BACKGROUND,
    },
    suggestionItem: {
        borderWidth: 1,
        paddingVertical: '3%',
        width: '100%',
    },
    suggestionText: {
        fontSize: 16,
    },

    // recent search style
    recentSearchContainer: {
        flexDirection: 'row',
        paddingLeft: 15,
        paddingTop: 10,
    },
    recentSearchItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: SCREEN_WIDTH * 0.94,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#D0D0D090',
    },
    noRecentSearch: {
        flexDirection: 'row',
    },

    // saved location
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
        justifyContent: 'center',
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

    //post modal
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        width: '85%',
        height: '60%',
        borderRadius: 20,
        overflow: 'hidden',
    },
    modalContent: {
        padding: 20,
        height: '80%',
    },
    footer: {
        height: '10%',
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

    postBackIcon: {
        position: 'absolute',
        top: 20,
        left: 20,
    },
    iconGroup: {
        flexDirection: 'row',
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

    timeContainer: {
        width: 'auto',
    },
    timeText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
    },

});
