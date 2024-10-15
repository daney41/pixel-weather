import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, FlatList, Alert} from 'react-native';
import GradientTheme from '@/components/GradientTheme';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import {API_LINK} from "@/constants/API_link";
import {useAuth} from "@/components/accAuth";

// simulation of data from saved suburb API calls
const data = {
  'message': 'Data retrieved successfully',
  'data': [
    {
      'id': 1,
      'suburb_id': 1,
      'label': 'Home',
      'suburb_name': 'Suburb 1',
      'post_code': 4000,
      'latitude': -33.8688,
      'longitude': 151.2093,
      'state_code': 'QLD'
    },
    {
      'id': 14,
      'suburb_id': 2,
      'label': 'Work',
      'suburb_name': 'Suburb 2',
      'post_code': 4067,
      'latitude': -37.8136,
      'longitude': 144.9631,
      'state_code': 'QLD'
    }
  ]
};

export default function SavedLocationScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { isLoggedIn, userToken } = useAuth(); // 使用 `useAuth` 取得登入狀態
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
                setSavedLocations(result.data);  // 將取得的地點設定到狀態中
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
            <Text style={styles.locationText}>{item.suburb_name}</Text>
            <TouchableOpacity onPress={() => router.push(`/editLocation/${item.id}`)}>
                <Text style={styles.editIcon}>✏️</Text>
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
                    <TouchableOpacity style={styles.addLocationButton} onPress={() => router.push('/addLocation')}>
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
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    list: {
        marginBottom: 20,
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
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    locationText: {
        fontSize: 16,
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
});
