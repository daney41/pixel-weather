import React from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Alert} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import GradientTheme from '@/components/GradientTheme';
import { useRouter } from 'expo-router';
import {useAuth} from '@/components/accAuth'
import {API_LINK} from "@/constants/API_link";

const data = [
    { id: '1', title: 'Account Center', icon: 'arrow-right', route: '/(accountSetting)/accountSetting', requireLogin: true },
    { id: '2', title: 'Saved Location', icon: 'arrow-right', route: '/savedLocation', requireLogin: true },
    { id: '3', title: 'Help Center', icon: 'arrow-right', route: '/helpCenter', requireLogin: false },
    { id: '4', title: 'Privacy', icon: 'arrow-right', route: '/privacy', requireLogin: false },
];

export default function SettingScreen() {
    const router = useRouter();
    const { isLoggedIn, login, logout ,userToken} = useAuth();
    const filteredData = data.filter((item) => (isLoggedIn || !item.requireLogin));


    const handlePress = () => {
        if (isLoggedIn) {
            // 當前為已登入狀態
            Alert.alert(
                'Warning',
                "You're about to log out",
                [
                    {
                        text: 'Confirm',
                        onPress: async () => {
                            await logout();
                        },
                    },
                    { text: 'Cancel', style: 'cancel' },
                ],
                { cancelable: true }
            );
        } else {
            // 當前為未登入狀態，跳轉到登入畫面
            router.push('/login'); // 根據你的路由結構，這裡設定跳轉路徑
        }
    };


  return (
      <GradientTheme>
          <View style={styles.container}>
          {/* List */}
          <FlatList
              data={filteredData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.listItem} onPress={() => router.push(item.route)}>
                  <Text style={styles.itemText}>{item.title}</Text>
                  <FontAwesome6 name={item.icon} size={24} color="black" />
                </TouchableOpacity>
              )}
              style={styles.list}
            />
            {/* Log Out Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handlePress}>
              <Text style={styles.logoutText}>{isLoggedIn ? 'Log Out' : 'Log In'}</Text>
            </TouchableOpacity>
          </View>
      </GradientTheme>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: '4%',
        marginTop: '15%',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        backgroundColor: '#DABFFF', // Match the header color in your design
        paddingVertical: 10,
        marginVertical: 20,
        borderRadius: 10,
    },
    list: {
        flex: 1,
        marginTop: 10
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginVertical: 8,
        borderRadius: 10,
    },
    itemText: {
        fontSize: 18,
        color: 'black',
    },
    logoutButton: {
        backgroundColor: '#4600DB',
        paddingVertical: 15,
        alignItems: 'center',
        borderRadius: 10,
        marginVertical: 20,
    },
    logoutText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
    },
});