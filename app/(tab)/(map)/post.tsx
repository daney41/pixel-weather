import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import GradientTheme from '@/components/GradientTheme';
import * as ColorScheme from '@/constants/ColorScheme';
import {useLocalSearchParams, useRouter} from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import * as Location from 'expo-location';

export default function NewPostScreen() {
    const [weather, setWeather] = useState(null);
    const [open, setOpen] = useState(false);
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
    ]);

    const router = useRouter();
    const [preparationText, setPreparationText] = useState('');
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);  // New loading state

    useEffect(() => {
        const getPermissionAndLocation = async () => {
            try {
                // 檢查是否已獲得權限
                const { status } = await Location.getForegroundPermissionsAsync();
                if (status !== 'granted') {
                    // 如果沒有授權，請求權限
                    const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
                    if (newStatus !== 'granted') {
                        Alert.alert('Permission denied', 'Location permission is required to use this feature.');
                        setLoading(false);
                        return;
                    }
                }

                // 已授權，取得目前位置
                const currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                setLocation(currentLocation);
                setLoading(false);
            } catch (error) {
                console.error('Failed to get location:', error);
                setLoading(false);
            }
        };

        getPermissionAndLocation();
    }, []);

if (loading) {
        return (
            <GradientTheme>
                <ActivityIndicator size="large" color={ColorScheme.BTN_BACKGROUND} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />
            </GradientTheme>
        );
    }

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
