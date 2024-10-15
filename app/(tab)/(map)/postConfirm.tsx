import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, TextInput, Image, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import GradientTheme from '@/components/GradientTheme';
import * as ColorScheme from '@/constants/ColorScheme';
import * as Mappings from '@/constants/Mappings';
import { useRouter } from 'expo-router';
import { API_LINK } from '@/constants/API_link';
import { useAuth } from '@/components/accAuth'; // Import authentication hook

const weatherId = {
    'Clear Sky': 40,
    'Rainy': 21,
    'Cloudy': 43,
    'Thunderstorm': 5,
    'Windy': 45,
    'Storm': 46,
    'Fog': 34,
    'Hail': 47,
    'Hot': 48,
    'Cold': 49,
};

export default function PostConfirm() {
    const { weather, preparationText, location } = useLocalSearchParams(); // Get the query params
    const router = useRouter();
    const { userToken } = useAuth(); // Get the auth token from the useAuth hook

    const weatherIcon = Mappings.weatherIconMap[weather];

    const handlePostPress = async () => {

        try {
            // Make sure the required fields are available
            if (!weather) {
                Alert.alert('Error', 'Missing weather information');
                return;
            }

            // Construct the post body as per API documentation
            const requestBody = {
                latitude: JSON.parse(location).coords.latitude,
                longitude: JSON.parse(location).coords.longitude,
                weather_id: weatherId[weather],
                comment: preparationText || '',
            };

            // Send the POST request
            const response = await fetch(`${API_LINK}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`, // Include the user token in the headers
                },
                body: JSON.stringify(requestBody),
            });

            // Parse the response data
            const data = await response.json();

            if (response.status === 201) {
                // Successful post, navigate to the post completed screen
                console.log('posted data: ' + JSON.stringify(data.data));
                router.push({
                    pathname: 'postCompleted',
                    params: { returnData: JSON.stringify(data.data) }, // Pass the returned data
                });
            } else if (response.status === 400) {
                Alert.alert('Error', data.error || 'Invalid request. Check the input parameters.');
            } else if (response.status === 401) {
                Alert.alert('Error', data.error || 'Invalid or expired token');
            } else if (response.status === 500) {
                Alert.alert('Error', 'An internal server error occurred. Please try again later.');
                console.log('Error Code: ' + response.status + '. ');
                console.log('Response: ' + JSON.stringify(response));
            } else {
                console.log('Error Code: ' + response.status + '. ');
                console.log('Response: ' + JSON.stringify(response));
                Alert.alert('Error', 'An unknown error occurred.');
            }
        } catch (error) {
            console.error('Error posting data:', error);
            Alert.alert('Error', 'Failed to connect to the server. Please try again.');
        }
    };

    return (
        <GradientTheme>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>←</Text>
                </TouchableOpacity>
                <View style={styles.card}>
                    <Text style={styles.header}>Post Confirm</Text>

                    {weatherIcon && (
                        <Image source={weatherIcon} style={styles.icon} resizeMode="contain"/>
                    )}

                    <Text style={styles.label}>Now it's {weather}</Text>
                    <View style={styles.preparationTextContainer}>
                        <Text style={styles.preparationText}>{preparationText}</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>BACK</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handlePostPress} style={styles.saveButton}>
                            <Text style={styles.saveText}>POST</Text>
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
        paddingHorizontal: '10%',
        paddingTop: '10%',
        borderRadius: 10,
    },
    header: {
        fontSize: 40,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginBottom: '10%',
    },
    icon: {
        width: '55%',
        height: '30%',
        alignSelf: 'center',
        marginBottom: '10%',
    },
    label: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: '5%',
        alignSelf: 'center',
    },
    preparationTextContainer: {
        backgroundColor: '#FFFFFF',
        marginBottom: '10%',
        padding: '7%',
        borderRadius: 10,
    },
    preparationText: {
        fontSize: 18,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    backButton: {
        fontSize: 40,
        color: 'black',
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
