import React, { useEffect, useState, useCallback } from 'react';
import { TouchableOpacity, View, Text, Alert, StyleSheet, ScrollView, ActivityIndicator, Button, RefreshControl } from 'react-native';
import { DeleteAlertTypeButton, DeleteAlertAreaButton, DeleteAlertTimingButton } from '@/components/DeleteButtons';
import * as ColorScheme from '@/constants/ColorScheme';
import * as Mappings from '@/constants/Mappings';
import GradientTheme from '@/components/GradientTheme';
import EditButton from '@/components/EditButton';
import AddButton from '@/components/AddButton';
import AlertButton from '@/components/AlertButton';
import ErrorMessage from '@/components/ErrorMessage';
import TimingBar from '@/components/TimingBar';
import { useRouter } from 'expo-router';
import { useAuth } from '@/components/accAuth';
import { API_LINK } from '@/constants/API_link';

// Main screen
export default function AlertsScreen() {
    const router = useRouter();
    const newAlert = router.params?.newAlert; // Safely check for newAlert
    const newLocation = router.params?.newLocation; // Safely check for newAlert
    const newAlertTiming = router.params?.newAlertTiming; // Safely check for newAlert
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState(null); // Track the section being edited
    const [error, setError] = useState(null); // error use state
    const [weatherAlerts, setWeatherAlerts] = useState([]); // alert weather types use state
    const [alertLocations, setAlertLocations] = useState([]); // alert location use state
    const [alertTiming, setAlertTiming] = useState([]); // alert timing use state
    const { userToken, isLoggedIn } = useAuth(); // log in state
    const [wholeDayTiming, setWholeDayTiming] = useState([]); // storing whole day timing bar
    const [refreshing, setRefreshing] = useState(false); // Track refreshing state

    useEffect(() => {
        if (newAlert) {
            setWeatherAlerts((prevAlerts) => [...prevAlerts, newAlert]); // Add the new alert to the list
        }
        if (newLocation) {
            setAlertLocations((prevLocations) => [...prevLocations, newLocation]);
        }
        if (newAlertTiming) {
            setAlertTiming((prevTimings) => [...prevTimings, newAlertTiming]);
        }
    }, [newAlert, newLocation, newAlertTiming]);

    // Generalized fetch function
    const fetchData = async (url, setState) => {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const jsonResponse = await response.json();
                console.log(JSON.stringify(jsonResponse));
                setState(jsonResponse.data);
                setLoading(false);
            } else {
                throw new Error('Failed to fetch data.');
            }
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    // Render Alert Type Buttons with or without delete button based on edit mode
    function renderAlertTypeButtons(data, isEditMode) {
        return data
            .sort((a, b) => Mappings.WeatherNamesMapping[a.weather].localeCompare(Mappings.WeatherNamesMapping[b.weather]))
            .map((item, index) => (
                <View key={index} style={styles.alertButtonContainer}>
                    {isEditMode && (
                        <DeleteAlertTypeButton item={item} setWeatherAlerts={setWeatherAlerts} />
                    )}
                    <AlertButton alertText={Mappings.WeatherNamesMapping[item.weather]} />
                </View>
            ));
    }

    // Render Alert Area Buttons with or without delete button based on edit mode
    function renderAlertAreaButtons(data, isEditMode) {
        return data
            .sort((a, b) => a.suburb_name.localeCompare(b.suburb_name))
            .map((item, index) => (
                <View key={index} style={styles.alertButtonContainer}>
                    {isEditMode && (
                        <DeleteAlertAreaButton item={item} setAlertLocations={setAlertLocations} />
                    )}
                    <AlertButton alertText={item.suburb_name} />
                </View>
            ));
    }

    function renderAlertTiming(data, isEditMode) {
        return data
            .sort((a, b) => a.start_time.localeCompare(b.start_time))
            .map((item, index) => (
                <View key={index} style={styles.alertTimingContainer}>
                    {isEditMode && (
                        <DeleteAlertTimingButton item={item} setAlertTiming={setAlertTiming} />
                    )}
                    <TimingBar
                        startTime={item.start_time}
                        endTime={item.end_time}
                        isActive={item.is_active}
                        onToggle={() => toggleTiming(item)}
                    />
                </View>
            ));
    }

// Toggle active alert timing
const toggleTiming = async (item) => {

    // Function to update all timings via the API
    const updateAllTimings = async (updatedTimings) => {
        try {
            // Send an API request for each timing in updatedTimings
            await Promise.all(
                updatedTimings.map(async (timing) => {
                    const requestBody = {
                        id: timing.id,
                        start_time: timing.start_time,
                        end_time: timing.end_time,
                        is_active: timing.is_active // Use the updated is_active value
                    };

                    const response = await fetch(`${API_LINK}/user_alert_time`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${userToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody),
                    });

                    // Handle each response
                    if (!response.ok) {
                        const errorResponse = await response.json();
                        console.error(`Failed to update timing for id: ${timing.id}`, errorResponse);
                    }
                })
            );
            console.log('All timings have been updated successfully.');
        } catch (error) {
            console.error('Failed to update timings:', error);
            Alert.alert('Error', 'Failed to update alert timings. Please try again.');
        }
    };

    // Function to update a specific timing
    const updateTiming = async (timing, isWholeDayTiming) => {
        try {
            const response = await fetch(`${API_LINK}/user_alert_time`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(timing),
            });

            if (response.ok) {
                const updatedIsActive = timing.is_active;

                // Update the state locally based on whether it's a whole-day timing or not
                if (!isWholeDayTiming) {
                    setAlertTiming(prevTimings =>
                        prevTimings.map(alert =>
                            alert.id === timing.id ? { ...alert, is_active: updatedIsActive } : alert
                        )
                    );
                } else {
                    setWholeDayTiming(prevTimings =>
                        prevTimings.map(alert => ({ ...alert, is_active: updatedIsActive }))
                    );
                }
            } else {
                // Handle errors
                const errorResponse = await response.json();
                Alert.alert('Error', errorResponse.error || 'An error occurred');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to connect to the server. Please try again.');
        }
    };

    // Check if the item being toggled is the whole-day timing
    const isWholeDayTiming = item.start_time === "00:00:00" && item.end_time === "23:59:59";

    if (isWholeDayTiming) {
        // Deactivate all other timings
        let updatedTimings = alertTiming.map(timing => ({
            ...timing,
            is_active: false, // Deactivate all other timings
        }));

        // Add the whole-day timing itself to the updatedTimings array
        updatedTimings = [...updatedTimings, { ...item, is_active: !item.is_active }];

        // Update all timings in the database
        await updateAllTimings(updatedTimings);

        // Update the state locally after successful update
        setAlertTiming(updatedTimings);
    } else {
        // If a non-whole-day timing is toggled on, deactivate the whole day timing
        const updatedTimingItem = { ...item, is_active: !item.is_active };
        updateTiming(updatedTimingItem, false);

        if (wholeDayTiming.length > 0) {
            // Ensure you're working with an array of whole day timings
            const updatedWholeDayTiming = wholeDayTiming[0];  // Assuming you only have one whole day timing

            const updatedWholeDay = {
                ...updatedWholeDayTiming,
                is_active: false // Deactivate whole day timing
            };

            updateTiming(updatedWholeDay, true);
        }
    }
};

    // Toggle edit mode for a specific section
    const toggleEditMode = (section) => {
        if (editingSection === section) {
            setEditingSection(null); // Exit edit mode for this section
        } else {
            setEditingSection(section); // Enter edit mode for this section
        }
    };

    // Fetch all data on refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true); // Start refreshing
        fetchData(`${API_LINK}/user_alert_weather`, setWeatherAlerts);
        fetchData(`${API_LINK}/user_alert_suburb`, setAlertLocations);
        fetchData(`${API_LINK}/user_alert_time`, setAlertTiming).finally(() => {
            setRefreshing(false); // Stop refreshing once data is fetched
        console.log('userToken: ' + userToken);
        });
    }, []);

    useEffect(() => {
        if (userToken) {
            // Re-fetch data when the token changes (after login/logout)
            fetchData(`${API_LINK}/user_alert_weather`, setWeatherAlerts);
            fetchData(`${API_LINK}/user_alert_suburb`, setAlertLocations);
            fetchData(`${API_LINK}/user_alert_time`, setAlertTiming);
        }
    }, [userToken]);  // Add userToken as a dependency

    useEffect(() => {
        if (alertTiming.length > 0) {
            // Process the alert timing after it is fetched
            const wholeDayTiming = alertTiming.find(
                (item) => item.start_time === "00:00:00" && item.end_time === "23:59:59"
            );

            if (wholeDayTiming) {
                const wholeDayTimingArray = [wholeDayTiming];
                setWholeDayTiming(wholeDayTimingArray); // Set the whole-day timing bar

                // Remove the whole-day timing from the rest of the timings
                const otherTimings = alertTiming.filter(
                    (item) => !(item.start_time === "00:00:00" && item.end_time === "23:59:59")
                );
                setAlertTiming(otherTimings);
            }
        }
    }, [alertTiming]);

    // loading screen if still fetching the data from database
    if (loading) {
        return <ActivityIndicator size="large" color={ColorScheme.BTN_BACKGROUND} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }} />;
    }

    // return log in message if user is not logged in
    if (!isLoggedIn) {
        return (
            <GradientTheme>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                    <Text style={{ fontSize: 15, marginBottom: '3%' }}>Please log in to customize your weather alert</Text>
                    <TouchableOpacity style={styles.popUpBtn} onPress={() => router.push('/login')}>
                        <Text style={styles.popUpBtnText}>Sign up or log in</Text>
                    </TouchableOpacity>
                </View>
            </GradientTheme>
        );
    }

    // return error message if any errors occurred when rendering the screen
    if (error) {
        return (
            <ErrorMessage error={error} onRefresh={onRefresh} />
        );
    }

    return (
        <GradientTheme>
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Alert Type Section */}
                <View>
                    <View style={styles.headerContainer}>
                        <Text style={styles.header}>Active Alert Type</Text>
                        <View style={styles.headerActionBtns}>
                            <AddButton onPress={() => router.push('/addAlertWeather')} />
                            <EditButton onPress={toggleEditMode} section="alertType" />
                        </View>

                    </View>
                    <View style={styles.buttonContainer}>
                        {renderAlertTypeButtons(weatherAlerts, editingSection === 'alertType')}
                    </View>
                </View>

                {/* Alert Location Section */}
                <View>
                    <View style={styles.headerContainer}>
                        <Text style={styles.header}>Active Alert Areas</Text>
                        <View style={styles.headerActionBtns}>
                            <AddButton onPress={() => router.push('/addAlertLocation')} />
                            <EditButton onPress={toggleEditMode} section="alertArea" />
                        </View>
                    </View>
                    <View style={styles.buttonContainer}>
                        {renderAlertAreaButtons(alertLocations, editingSection === 'alertArea')}
                    </View>
                </View>

                {/* Alert Timing Section */}
                <View style={{ paddingBottom: 30 }}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.header}>Alert Timing</Text>
                        <View style={styles.headerActionBtns}>
                            <AddButton onPress={() => router.push('/addAlertTiming')} />
                            <EditButton onPress={toggleEditMode} section="alertTiming" />
                        </View>
                    </View>
                    <View style={styles.timingBarContainer}>
                        {renderAlertTiming(wholeDayTiming)}
                        {renderAlertTiming(alertTiming, editingSection === 'alertTiming')}
                    </View>
                </View>
            </ScrollView>
        </GradientTheme>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: '5%',
        marginTop: '15%',
    },
    headerContainer: {
        flexDirection: 'row', // Puts the text and icon in a row
        justifyContent: 'space-between', // Aligns text to the left and icon to the right
        alignItems: 'center', // Vertically centers the text and icon
        marginBottom: '2%',
        width: '100%',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: '3%',
        alignSelf: 'flex-start',
    },
    headerActionBtns: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '20%',
    },
    buttonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '96%',
        left: 7,
    },
    alertButtonContainer: {
        marginBottom: '1%',
        width: '48%',
    },
    alertTimingContainer: {
        width: '100%',
    },
    popUp: {
        backgroundColor: '#FFFFFFB3',
        padding: '6%',
        margin: '3%',
        borderRadius: 10,
    },
    popUpHeader: {
        fontWeight: 'bold',
        fontSize: 15,
        marginVertical: '3%',
    },
    popUpText: {
        color: ColorScheme.BTN_BACKGROUND,
        marginBottom: '5%',
    },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        padding: '4%',
        borderRadius: 5,
        marginBottom: '8%',
        backgroundColor: 'white',
    },
    popUpBtnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: '5%',
    },
    popUpBtn: {
        backgroundColor: ColorScheme.BTN_BACKGROUND,
        padding: '4%',
        borderRadius: 10,
        width: '45%',
    },
    popUpBtnText: {
        color: 'white',
        textAlign: 'center',
    }
});
