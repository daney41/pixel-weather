import React from 'react';
import { TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '@/components/accAuth';
import { API_LINK } from '@/constants/API_link';
import * as Mappings from '@/constants/Mappings';

// Delete button for Alert Types
export function DeleteAlertTypeButton({ item, setWeatherAlerts }) {
    const { userToken } = useAuth();

    const handleDelete = async () => {
        const url = `${API_LINK}/user_alert_weather`;

        Alert.alert(
            "Confirm Deletion",
            `Are you sure you want to delete ${Mappings.WeatherNamesMapping[item.weather]}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            const response = await fetch(url, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${userToken}`,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ id: item.id }),
                            });

                            if (response.ok) {
                                Alert.alert('Success', `Successfully deleted ${Mappings.WeatherNamesMapping[item.weather]}`);
                                setWeatherAlerts((prev) => prev.filter(alert => alert.id !== item.id));
                            } else {
                                Alert.alert('Error', 'Failed to delete the alert');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to connect to the server.');
                        }
                    },
                },
            ]
        );
    };

    return (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <FontAwesome name="minus-circle" size={20} color="red" />
        </TouchableOpacity>
    );
}

// Delete button for Alert Areas
export function DeleteAlertAreaButton({ item, setAlertLocations }) {
    const { userToken } = useAuth();

    const handleDelete = async () => {
        const url = `${API_LINK}/user_alert_suburb`;

        Alert.alert(
            "Confirm Deletion",
            `Are you sure you want to delete ${item.suburb_name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            const response = await fetch(url, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${userToken}`,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ id: item.id }),
                            });

                            if (response.ok) {
                                Alert.alert('Success', `Successfully deleted ${item.suburb_name}`);
                                setAlertLocations((prev) => prev.filter(location => location.id !== item.id));
                            } else {
                                Alert.alert('Error', 'Failed to delete the location.');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to connect to the server.');
                        }
                    },
                },
            ]
        );
    };

    return (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <FontAwesome name="minus-circle" size={20} color="red" />
        </TouchableOpacity>
    );
}

// Delete button for Alert Timing
export function DeleteAlertTimingButton({ item, setAlertTiming }) {
    const { userToken } = useAuth();

    const handleDelete = async () => {
        const url = `${API_LINK}/user_alert_time`;

        Alert.alert(
            "Confirm Deletion",
            `Are you sure you want to delete timing from ${item.start_time} to ${item.end_time}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            const response = await fetch(url, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${userToken}`,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ id: item.id }),
                            });

                            if (response.ok) {
                                Alert.alert('Success', `Successfully deleted timing from ${item.start_time} to ${item.end_time}`);
                                setAlertTiming((prev) => prev.filter(timing => timing.id !== item.id));
                            } else {
                                Alert.alert('Error', 'Failed to delete the alert timing.');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to connect to the server.');
                        }
                    },
                },
            ]
        );
    };

    return (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <FontAwesome name="minus-circle" size={20} color="red" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    deleteButton: {
        position: 'absolute',
        top: -5,
        zIndex: 10,
    },
});
