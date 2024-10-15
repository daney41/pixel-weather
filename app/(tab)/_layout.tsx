import { View, Text, StyleSheet, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Tabs } from 'expo-router';
import GradientTheme from '@/components/GradientTheme';
import * as ColorScheme from '@/constants/ColorScheme';
import { AuthProvider } from '@/components/accAuth';

export default function TabLayout() {
  return (
      <AuthProvider>
        <GradientTheme>
            <Tabs
              screenOptions={{
                tabBarActiveTintColor: ColorScheme.SECOND_BTN,
                tabBarInactiveTintColor: ColorScheme.BTN_BACKGROUND,
                tabBarActiveBackgroundColor: ColorScheme.BTN_BACKGROUND,
                tabBarInactiveBackgroundColor: 'transparent',
                tabBarStyle: {
                    backgroundColor: ColorScheme.SECOND_BTN,
                    bottom: 0,
                    elevation: 0,
                    height: Platform.OS === 'android' ? 80 : 80,  // 設定不同平台的 tabBar 高度
                    paddingBottom: 0,  // 增加 Android 中的內邊距
                    borderTopWidth: 0,
                },
                  tabBarIconStyle: {
                      marginTop: 10,
                  },
                headerTitleAlign: 'center',
                headerStyle: {
                   backgroundColor: '#363EFF',
                },
                headerTintColor: ColorScheme.SECOND_BTN,
                headerShown: false,
              }}
            >
              <Tabs.Screen
                name="(map)"
                options={{
                  title: '',
                  tabBarIcon: ({ color }) => (
                      <View style={styles.tabContainer}>
                          <FontAwesome6 size={28} name="location-dot" color={color} />
                          <Text style={[styles.tabLabel, { color }]}>Home</Text>
                      </View>
                    ),
                }}
              />
              <Tabs.Screen
                name="(logs)"
                options={{
                  title: '',
                  tabBarIcon: ({ color }) => (
                      <View style={styles.tabContainer}>
                          <FontAwesome size={28} name="folder" color={color} />
                          <Text style={[styles.tabLabel, { color }]}>Log</Text>
                      </View>
                    ),
                }}
              />
              <Tabs.Screen
                name="(alert)"
                options={{
                  title: '',
                  tabBarIcon: ({ color }) => (
                      <View style={styles.tabContainer}>
                          <FontAwesome size={28} name="bell" color={color} />
                          <Text style={[styles.tabLabel, { color }]}>Alerts</Text>
                      </View>
                  ),
                }}
              />
              <Tabs.Screen
                name="(setting)"
                options={{
                    title: '',
                    tabBarIcon: ({ color }) => (
                      <View style={styles.tabContainer}>
                          <FontAwesome size={28} name="cog" color={color} />
                          <Text style={[styles.tabLabel, { color }]}>Setting</Text>
                      </View>
                    ),
                }}
              />
            <Tabs.Screen
                name="(index)"
                options={{
                    title: 'Welcome Page',
                    tabBarStyle: { display: 'none' }, // 隱藏 TabBar
                    tabBarButton: () => null,         // 不顯示按鈕
                    headerShown: false,
                }}
            />
            </Tabs>
        </GradientTheme>
      </AuthProvider>
  );
}


const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        // height: Platform.OS === 'android' ? 60 : 50, // 調整 Tab 項目的高度，使其在 Android 中完整顯示
        // paddingBottom: Platform.OS === 'android' ? 5 : 0, // 在 Android 中加入額外的下邊距
    },
    tabLabel: {
        fontSize: 12,
        marginTop: 4,
        fontWeight: '600',
    },
    tabBarIcon: {
        position: 'relative',
    }
});