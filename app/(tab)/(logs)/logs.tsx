import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import ViewedScreen from './ViewedScreen';
import PostedScreen from './PostedScreen';
import GradientTheme from '@/components/GradientTheme';
import * as ColorScheme from '@/constants/ColorScheme';
import { useRouter } from 'expo-router';
import { useAuth } from '@/components/accAuth';

const Tab = createMaterialTopTabNavigator();

export default function LogsScreen() {
    const router = useRouter();
    const { isLoggedIn } = useAuth();

        // If the user is not logged in, login screen is displayed
        if (!isLoggedIn) {
            return (
                <GradientTheme>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                        <Text style={{fontSize: 15, marginBottom: '3%'}}>
                            Please log in to view your viewed or posted posts.
                        </Text>
                        <TouchableOpacity
                            style={styles.popUpBtn}
                            onPress={() => router.push('/login')}>
                            <Text style={styles.popUpBtnText}>Sign up or log in</Text>
                        </TouchableOpacity>
                    </View>
                </GradientTheme>
            );
        }

    return (
        <GradientTheme>
            <Tab.Navigator
                initialRouteName={'Viewed'}
                screenOptions={{
                    tabBarActiveTintColor: '#6200EE',
                    tabBarInactiveTintColor: '#AAA',
                    tabBarIndicatorStyle: { backgroundColor: '#6200EE' },
                    tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
                    tabBarStyle: { backgroundColor: 'translucent', elevation: 0, paddingTop: 50 },
                }}
            >
                <Tab.Screen
                    name="Viewed"
                    component={ViewedScreen}
                    options={{ tabBarLabel: 'VIEWED' }}
                />
                <Tab.Screen
                    name="Posted"
                    component={PostedScreen}
                    options={{ tabBarLabel: 'POSTED' }}
                />
            </Tab.Navigator>
        </GradientTheme>
    );
}

const styles = StyleSheet.create({
    popUpBtn: {
        backgroundColor: ColorScheme.BTN_BACKGROUND,
        padding: '4%',
        borderRadius: 10,
        width: '45%',
    },
    popUpBtnText: {
        color: 'white',
        textAlign: 'center',
    }
});
