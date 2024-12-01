import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, FlatList, Alert} from 'react-native';
import GradientTheme from '@/components/GradientTheme';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import {useAuth} from "@/components/accAuth";
import {API_LINK} from "@/constants/API_link";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function SavedLocationScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { isLoggedIn, userToken } = useAuth();
    const [savedLocations, setSavedLocations] = useState([]);

    const fetchSavedLocations = async () => {
        try {
            const response = await fetch(`${API_LINK}/user_saved_suburb`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userToken}`,
                },
            });

            if (response.ok) {
                const result = await response.json();
                console.log(result.data);
                setSavedLocations(result.data);
            } else {
                Alert.alert('Error', 'Failed to fetch saved locations.');
            }
        } catch (error) {
            console.error('Error fetching saved locations:', error);
            Alert.alert('Error', 'An error occurred while fetching saved locations.');
        }
    };

    useEffect(() => {
        fetchSavedLocations();
    }, []);

    // Function to render each suburb item in the FlatList
    const renderSuburbItem = ({ item }) => (
        <View style={styles.locationContainer}>
            <View>
                <Text style={styles.locationTitle}>{item.label}</Text>
                <Text style={styles.locationText}>{item.suburb_name}, {item.post_code}</Text>
            </View>
            <TouchableOpacity>
                <Text style={styles.editIcon}><FontAwesome6 size={20} name="pencil"/></Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <GradientTheme>
            <View style={styles.container}>
                {/* 返回按鈕 */}
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>←</Text>
                </TouchableOpacity>

                {/* 顯示儲存地點的卡片 */}
                <View style={styles.card}>
                    <Text style={styles.headerText}>Your Saved Locations</Text>

                    {/* FlatList 顯示儲存地點 */}
                    <FlatList
                        data={savedLocations}  // 使用儲存地點的狀態
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderSuburbItem}
                        style={styles.list}
                    />

                    {/* 新增地點按鈕 */}
                    <TouchableOpacity style={styles.addLocationButton}>
                        <Text style={styles.addLocationText}>Add Location</Text>
                        <Text style={styles.addIcon}>+</Text>
                    </TouchableOpacity>
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
        backgroundColor: 'white',
        padding: '7%',
        borderRadius: 10,
    },
    backButton: {
        fontSize: 40,
        color: 'black',
        marginBottom: '3%',
    },
    locationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        margin:5,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    locationText: {
        fontSize: 13,
        color: 'black',
    },
    editIcon: {
        fontSize: 20,
        color: 'black',
    },
    addLocationButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        marginTop: 20,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        paddingHorizontal: 15,
    },
    addLocationText: {
        fontSize: 16,
        color: 'black',
    },
    addIcon: {
        fontSize: 24,
        color: 'black',
    },
    locationTitle: {
        fontSize: 24,
        color: 'black',
        marginBottom: 5,
    }

});