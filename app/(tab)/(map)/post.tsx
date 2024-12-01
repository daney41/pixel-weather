import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import GradientTheme from '@/components/GradientTheme';
import * as ColorScheme from '@/constants/ColorScheme';
import { useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import * as Location from 'expo-location';

export default function NewPostScreen() {

    // useStat for setting the post weather condition
    const [weather, setWeather] = useState(null);
    // useState for opening up the dropdown picker
    const [open, setOpen] = useState(false);
    // Options for dropdown picker
    const [items, setItems] = useState([
        { label: 'Clear Sky', value: 'Clear Sky' },
        { label: 'Rainy', value: 'Rainy' },
        { label: 'Cloudy', value: 'Cloudy' },
        { label: 'Thunderstorm', value: 'Thunderstorm' },
        { label: 'Windy', value: 'Windy' },
        { label: 'Storm', value: 'Storm' },
        { label: 'Fog', value: 'Fog' },
        { label: 'Hail', value: 'Hail' },
        { label: 'Hot', value: 'Hot' },
        { label: 'Cold', value: 'Cold' },
        { label: 'High UV', value: 'High UV' },
    ]);
    // Expo router for navigation
    const router = useRouter();
    // useState storing comment
    const [preparationText, setPreparationText] = useState('');
    // useState for storing current location for posting posts
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                // Request location permission
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    alert('Permission to access location was denied');
                    setLoading(false);  // Stop loading and return
                    return;
                }

                // Get the user's current location
                let location = await Location.getCurrentPositionAsync({});
                setLocation(location);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching location:", error);
                setLoading(false);
            }
        })();
    }, []);

    // Loading screen
    if (loading) {
        return (
            <GradientTheme>
                <ActivityIndicator
                    size="large"
                    color={ColorScheme.BTN_BACKGROUND}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />
            </GradientTheme>
        );
    }

    // Function to push to the post confirm page with post information
    const handleNextPress = () => {
        if (weather) {
            // Navigate to postConfirm with query params
            router.push({
                pathname: 'postConfirm',
                params: { weather, preparationText, location: JSON.stringify(location) },
            });
        } else {
            alert("You must select a weather condition!");
        }
    };

    return (
        <GradientTheme>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>←</Text>
                </TouchableOpacity>
                <View style={styles.card}>
                    <Text style={styles.header}>New Post</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                        <Text style={styles.label}>Now it's...</Text>
                        <Text style={{ color: 'red', }}>*required</Text>
                    </View>

                    <DropDownPicker
                        open={open}
                        value={weather}
                        items={items}
                        setOpen={setOpen}
                        setValue={setWeather}
                        setItems={setItems}
                        placeholder="Type to search..."
                        searchable={true}
                        searchPlaceholder="Search for weather..."
                        style={styles.input}
                        dropDownContainerStyle={styles.dropdownContainer}
                    />

                    <Text style={styles.label}>Comment</Text>
                    <TextInput
                        value={preparationText}
                        onChangeText={setPreparationText}
                        style={styles.input}
                        placeholder="Enter preparation notes"
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleNextPress} style={styles.saveButton}>
                            <Text style={styles.saveText}>Next</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </GradientTheme>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: '5%',
        justifyContent: 'center',
    },
    card: {
        backgroundColor: '#FFFFFFA3',
        padding: '10%',
        borderRadius: 10,
    },
    header: {
        fontSize: 40,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginBottom: '10%',
    },
    backButton: {
        fontSize: 40,
        color: 'black',
        marginBottom: '3%',
    },
    label: {
        fontSize: 18,
        marginBottom: '4%',
    },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        padding: '4%',
        borderRadius: 5,
        marginBottom: '8%',
        backgroundColor: 'white',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        backgroundColor: ColorScheme.SECOND_BTN,
        padding: '5%',
        borderRadius: 10,
        width: '45%',
    },
    cancelText: {
        textAlign: 'center',
        color: 'red',
    },
    saveButton: {
        backgroundColor: ColorScheme.BTN_BACKGROUND,
        padding: '5%',
        borderRadius: 10,
        width: '45%',
    },
    saveText: {
        color: 'white',
        textAlign: 'center',
    },
});
