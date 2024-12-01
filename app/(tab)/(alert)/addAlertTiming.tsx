import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import GradientTheme from '@/components/GradientTheme';
import * as ColorScheme from '@/constants/ColorScheme';
import { useRouter } from 'expo-router';
import { useAuth } from '@/components/accAuth'
import { API_LINK } from '@/constants/API_link';

export default function AddTimingScreen({ navigation }) {
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const { userToken } = useAuth();
    const router = useRouter();

    const onChangeStart = (event, selectedDate) => {
        const currentDate = selectedDate || startTime;
        setShowStartPicker(false);
        setStartTime(currentDate);
    };

    const onChangeEnd = (event, selectedDate) => {
        const currentDate = selectedDate || endTime;
        setShowEndPicker(false);
        setEndTime(currentDate);
    };

    // Function to add timing
    const handleAddTiming = async () => {
        // Ensure that start_time is earlier than end_time
        if (startTime >= endTime) {
            Alert.alert('Error', 'Start time must be earlier than end time.');
            return;
        }

        const startTimeFormatted = startTime.toTimeString().slice(0, 8); // Format: 'HH:MM:SS'
        const endTimeFormatted = endTime.toTimeString().slice(0, 8); // Format: 'HH:MM:SS'

        const requestBody = {
            start_time: startTimeFormatted,
            end_time: endTimeFormatted,
            is_active: false,
        };

        try {
            const response = await fetch(`${API_LINK}/user_alert_time`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}`, // Replace with actual token
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (response.status === 201) {
                Alert.alert('Success', 'Alert timing added successfully.');
                const newAlertTiming = {
                    id: data.data.id,
                    start_time: data.start_time,
                    end_time: data.end_time,
                    is_active: data.is_active,
                };
                router.push({
                    pathname: '/alert', // The path to the Alerts screen
                    params: { newAlertTiming }, // Pass the new alert data as params
                });
            } else if (response.status === 400) {
                Alert.alert('Error', 'Missing required data. Please try again.');
            } else if (response.status === 401) {
                Alert.alert('Error', 'Invalid or expired token.');
            } else if (response.status === 409) {
                Alert.alert('Error', 'This time range has already been added.');
            } else if (response.status === 422) {
                Alert.alert('Error', 'Invalid time range: start_time cannot be later than end_time.');
            } else {
                Alert.alert('Error', 'An unknown error occurred.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to connect to the server. Please try again.');
        }
    };

    return (
        <GradientTheme>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.title}>Add Alert Timing</Text>

                    <Text style={styles.label}>Select Start Time</Text>
                    <TouchableOpacity style={styles.timeButton} onPress={() => setShowStartPicker(true)}>
                        <Text style={styles.timeButtonText}>Pick Start Time</Text>
                    </TouchableOpacity>
                    {showStartPicker && (
                        <DateTimePicker
                            value={startTime}
                            mode="time"
                            is24Hour={true}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onChangeStart}
                        />
                    )}
                    <View style={styles.timeDisplayContainer}>
                        <Text style={styles.selectedTimeText}>
                            {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>

                    <Text style={styles.label}>Select End Time</Text>
                    <TouchableOpacity style={styles.timeButton} onPress={() => setShowEndPicker(true)}>
                        <Text style={styles.timeButtonText}>Pick End Time</Text>
                    </TouchableOpacity>
                    {showEndPicker && (
                        <DateTimePicker
                            value={endTime}
                            mode="time"
                            is24Hour={true}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onChangeEnd}
                        />
                    )}
                    <View style={styles.timeDisplayContainer}>
                        <Text style={styles.selectedTimeText}>
                            {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => router.back()}>
                            <Text style={styles.actionButtonText}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={handleAddTiming}>
                            <Text style={styles.actionButtonText}>Add Timing</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </GradientTheme>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: '5%',
    },
    card: {
        backgroundColor: '#fff',
        padding: '5%',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: ColorScheme.BTN_BACKGROUND,
        marginBottom: '5%',
        textAlign: 'center',
    },
    label: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: '2%',
        color: '#333',
    },
    timeButton: {
        backgroundColor: ColorScheme.BTN_BACKGROUND,
        paddingVertical: '3%',
        borderRadius: 10,
        marginBottom: '5%',
    },
    timeButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    timeDisplayContainer: {
        backgroundColor: '#f3f3f3',
        padding: '3%',
        borderRadius: 10,
        marginBottom: '5%',
        alignItems: 'center',
    },
    selectedTimeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: '5%',
    },
    actionButton: {
        backgroundColor: ColorScheme.BTN_BACKGROUND,
        paddingVertical: '3%',
        paddingHorizontal: '5%',
        borderRadius: 10,
        width: '45%',
    },
    actionButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
    },
});
