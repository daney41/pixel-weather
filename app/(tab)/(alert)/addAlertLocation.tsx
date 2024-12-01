import React, { useState } from 'react';
import { TouchableOpacity, View, Text, Alert, StyleSheet } from 'react-native';
import GradientTheme from '@/components/GradientTheme';
import * as ColorScheme from '@/constants/ColorScheme';
import { useRouter } from 'expo-router';
import SuburbSearch from '@/components/SuburbSearch';
import { useAuth } from '@/components/accAuth'
import { API_LINK } from '@/constants/API_link';

export default function AddAlertLocation() {
    const router = useRouter();
    const [selectedSuburbId, setSelectedSuburbId] = useState(null);
    const { userToken } = useAuth();

    // Function to handle adding the suburb alert
    const handleAddAlertLocation = async () => {
        // Check if a suburb is selected
        if (!selectedSuburbId) {
            Alert.alert('Error', 'Please select a suburb.');
            return;
        }

        // Define the body of the POST request
        const requestBody = {
            suburb_id: selectedSuburbId
        };

        try {
            // Send the POST request
            const response = await fetch(`${API_LINK}/user_alert_suburb`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`, // Token required in the header
                },
                body: JSON.stringify(requestBody),
            });

            // Parse the response data
            const data = await response.json();

            // Handle the response status
            if (response.status === 201) {
                Alert.alert('Success', 'Suburb alert added successfully.');
                const newLocation = { id: data.data.id, suburb_name: data.suburb_name };
                // Handle successful creation
                router.push({
                    pathname: '/alert', // The path to the Alerts screen
                    params: { newLocation }, // Pass the new alert data as params
                });
            } else if (response.status === 400) {
                Alert.alert('Error', 'Missing or invalid suburb ID.');
            } else if (response.status === 401) {
                Alert.alert('Error', 'Invalid or expired token.');
            } else if (response.status === 409) {
                Alert.alert('Error', 'This suburb has already been added.');
            } else if (response.status === 422) {
                Alert.alert('Error', 'Suburb does not exist or wrong format.');
            } else if (response.status === 500) {
                Alert.alert('Error', 'Internal server error. Please try again later.');
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
            {/* Add Alert Location Section */}
            <View style={styles.container}>
                <View style={styles.popUp}>
                    <Text style={styles.popUpHeader}>Add Alert Location</Text>
                    <Text style={styles.popUpText}>Search suburb name in Queensland</Text>

                    {/* SuburbSearch component should return suburb_id */}
                    <SuburbSearch onSuburbSelect={(id) => setSelectedSuburbId(id)} token={userToken} />

                    <View style={styles.popUpBtnContainer}>
                        <TouchableOpacity style={styles.popUpBtn} onPress={() => router.back()}>
                            <Text style={styles.popUpBtnText}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.popUpBtn} onPress={handleAddAlertLocation}>
                            <Text style={styles.popUpBtnText}>Add Location</Text>
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
        paddingHorizontal: '3%',
    },
    popUp: {
        backgroundColor: '#fff',
        padding: '8%',
        marginHorizontal: '3%',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    popUpHeader: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: '6%',
        color: ColorScheme.BTN_BACKGROUND,
        textAlign: 'center',
    },
    popUpText: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: '6%',
        textAlign: 'center',
    },
    popUpBtnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: '8%',
    },
    popUpBtn: {
        backgroundColor: ColorScheme.BTN_BACKGROUND,
        paddingVertical: '4%',
        borderRadius: 10,
        width: '45%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    popUpBtnText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
    },
});
