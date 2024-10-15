import React, { useState } from 'react';
import { TouchableOpacity, View, Text, Alert, StyleSheet, Platform } from 'react-native';
import GradientTheme from '@/components/GradientTheme';
import * as ColorScheme from '@/constants/ColorScheme';
import * as Mappings from '@/constants/Mappings';
import RNPickerSelect from 'react-native-picker-select';
import { useRouter } from 'expo-router';
import { useAuth } from '@/components/accAuth'
import { API_LINK } from '@/constants/API_link';

export default function AddAlertWeather() {

    const router = useRouter();
    const [selectedValue, setSelectedValue] = useState(null);
    const { userToken } = useAuth();

    // Placeholder for the picker
    const placeholder = {
        label: 'Select an alert weather type',
        value: null,
    };

    // Options for the weather types
    const options = [];

    Object.entries(Mappings.WeatherIdMapping).forEach(([label, value]) => {
        options.push({ label: label, value: value });
    });

    // Function to handle adding the alert weather type
    const handleAddAlertWeather = async () => {
        // Check if a weather type is selected
        if (!selectedValue) {
            Alert.alert('Error', 'Please select a weather type.');
            return;
        }

        // Define the body of the POST request
        const requestBody = {
            weather_id: selectedValue
        };

        try {
            // Send the POST request
            const response = await fetch(`${API_LINK}/user_alert_weather`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}` // Token required in the header
                },
                body: JSON.stringify(requestBody)
            });

            // Handle the response
            const data = await response.json();
            if (response.status === 201) {
                Alert.alert('Success', 'Weather alert added successfully');
                const newAlert = { id: data.data.id, category: selectedValue };
                // Handle successful creation, e.g., navigate back or update UI
                router.push({
                    pathname: '/alert', // The path to the Alerts screen
                    params: { newAlert }, // Pass the new alert data as params
                });
            } else if (response.status === 400) {
                Alert.alert('Error', 'Missing or invalid weather ID.');
            } else if (response.status === 401) {
                Alert.alert('Error', 'Invalid or expired token.');
            } else if (response.status === 409) {
                Alert.alert('Error', 'You have already saved this weather alert.');
            } else if (response.status === 422) {
                Alert.alert('Error', 'The record does not exist or is in the wrong format.');
            } else if (response.status === 500) {
                Alert.alert('Error', 'An internal server error occurred. Please try again later.');
            } else {
                Alert.alert('Error', 'An unknown error occurred.');
            }
        } catch (error) {
            // Handle any network or unexpected errors
            Alert.alert('Error', 'Failed to connect to the server. Please try again.');
        }
    };

    return (
        <GradientTheme>
            <View style={styles.container}>
                <View style={styles.popUp}>
                    <Text style={styles.popUpHeader}>Add Alert Weather Type</Text>
                    <Text style={styles.popUpText}>Select alert type</Text>
                    <View style={styles.pickerContainer}>
                        <RNPickerSelect
                            placeholder={placeholder}
                            items={options}
                            onValueChange={(value) => setSelectedValue(value)}
                            value={selectedValue}
                            style={styles.RNPicker}
                        />
                    </View>
                    <View style={styles.popUpBtnContainer}>
                        <TouchableOpacity style={styles.popUpBtn} onPress={() => router.back()}>
                            <Text style={styles.popUpBtnText}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.popUpBtn} onPress={handleAddAlertWeather}>
                            <Text style={styles.popUpBtnText}>Add Type</Text>
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
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: '5%',
    },
    popUp: {
        backgroundColor: '#FFFFFFB3',
        padding: '8%',
        width: '100%',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    popUpHeader: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: '5%',
        color: ColorScheme.BTN_BACKGROUND,
        textAlign: 'center',
    },
    popUpText: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: '5%',
        textAlign: 'center',
    },
    pickerContainer: {
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 5,
        width: '100%',
        marginBottom: '10%',
        padding: Platform.OS === 'ios' ? '5%' : 0,
    },
    popUpBtnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    popUpBtn: {
        backgroundColor: ColorScheme.BTN_BACKGROUND,
        paddingVertical: '4%',
        borderRadius: 10,
        width: '45%',
    },
    popUpBtnText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 16,
    },
});
