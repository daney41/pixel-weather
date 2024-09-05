import React, { useState, useEffect } from 'react';
import { PermissionsAndroid, Platform, View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker } from 'react-native-maps';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';


const API_KEY = '9480d17e216cfcf5b44da6050c7286a4'; // 替换为你的天气API密钥

// GradientTheme component
const GradientTheme = ({children}) => {
  return (
    <LinearGradient
      colors={['#6a11cb', '#2575fc']} // 紫色漸層效果
      style={{flex: 1}}>
      {children}
    </LinearGradient>
  );
};

GradientTheme.propTypes = {
  children: PropTypes.node.isRequired,
};

// 請求位置權限的函數
const requestLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    return result === RESULTS.GRANTED;
  } else if (Platform.OS === 'android') {
    const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    return result === RESULTS.GRANTED;
  }
  return false;
};

// 獲取當前位置的函數
const getCurrentLocation = async (setLocation) => {
  const hasPermission = await requestLocationPermission();
  if (hasPermission) {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
      },
      (error) => {
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  } else {
    Alert.alert('Permission denied');
  }
};

// Home page component
const HomeScreen = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [weather, setWeather] = useState(JSON);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const getLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
            fetchWeather(latitude, longitude);
          },
          (error) => {
            console.warn(error.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
      }
    };

    getLocation();
  }, []);

  const fetchWeather = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();
      console.log(1);
      setWeather(data);
    } catch (error) {
      console.error(error);
    }
  };

  const searchLocation = async () => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${searchQuery}&units=metric&appid=${API_KEY}`
      );
      console.log(searchQuery);
      const data = await response.json();
      console.log(2);
      console.log(data);
      const { lon, lat } = data.coord;
      setLocation({ latitude: lat, longitude: lon });
      fetchWeather(lat, lon);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <GradientTheme>
      <View style={{ flex: 1, padding: 20 }}>
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1, borderCurve: 2, marginBottom: 20, paddingHorizontal: 10, backgroundColor: '#ffffff', }}
          placeholder="Search Location"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Button title="Search" onPress={searchLocation} />

        {weather ? (
          <View>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
              {/* 顯示城市名稱和國家，確保其值為字符串 */}
              <Text style={styles.textWhite}>Location: {weather.name ? `${weather.name}, ${weather.sys?.country || ''}` : ''}</Text>

              {/* 天氣描述，確保其值為字符串 */}
              <Text style={styles.textWhite}>Weather: {weather.weather?.[0]?.description || ''}</Text>

              {/* 當前溫度，確保 temp 存在並且為數字 */}
              <Text style={styles.textWhite}>Temp: {weather.main?.temp ? `${weather.main.temp.toFixed(2)}°C` : ''}</Text>
              <Text style={styles.textWhite}>
              {/* 高溫和低溫，確保 temp_max 和 temp_min 存在並且為數字 */}
              High: {weather.main?.temp_max ? `${weather.main.temp_max.toFixed(2)}°C` : ''}
              {' | '}Low: {weather.main?.temp_min ? `${weather.main.temp_min.toFixed(2)}°C` : ''}
            </Text>
            </View>


            <MapView
              style={{ height: 400, marginTop: 50, borderStyle: 'solid', borderWidth: 0.2, }}
              region={{
                latitude: location?.latitude || 0,
                longitude: location?.longitude || 0,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}>
              {location && <Marker coordinate={location} title="Your Location" />}
            </MapView>
          </View>
        ) : null}
      </View>
    </GradientTheme>
  );
};

// PastScreen 組件
const PastScreen = () => (
  <GradientTheme>
    <View>
      <Text>Past Weather</Text>
    </View>
  </GradientTheme>
);

// AlertsScreen 組件
const AlertsScreen = () => (
  <GradientTheme>
    <View>
      <Text>Weather Alerts</Text>
    </View>
  </GradientTheme>
);

// SettingsScreen 組件
const SettingsScreen = () => (
  <GradientTheme>
    <View>
      <Text>Settings</Text>
    </View>
  </GradientTheme>
);

// 底部導航配置
const Tab = createBottomTabNavigator();

// 頂層組件 App
const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName;

                  // 根据路由名称设置不同的图标
                  if (route.name === 'Location') {
                    iconName = focused ? 'location-pin' : 'location-pin';
                  } else if (route.name === 'Past') {
                    iconName = focused ? 'settings' : 'settings-outline';
                  } else if (route.name === 'Alerts') {
                    iconName = focused ? 'settings' : 'settings-outline';
                  } else if (route.name === 'Settings') {
                    iconName = focused ? 'settings' : 'settings-outline';
                  }
                  

                  // 使用 Icon 组件并返回
                  return <Icon name={iconName} size={25} color={focused ? '#FFFFFF' : '#FFFFFF'} />;
                },
                tabBarBackground: () => (
                  <View style={{ flex: 1, backgroundColor: 'transparent' }} /> // 設置為透明背景
                ),
                tabBarStyle: {
                  backgroundColor: 'transparent', // 設置為透明
                  position: 'absolute', // 設置 TabBar 絕對定位
                  bottom: 10, // 調整位置
                  left: 10,
                  right: 10,
                  elevation: 0, // 移除陰影
                  borderTopWidth: 0, // 移除頂部邊框
                },
                tabBarLabelStyle: {
                  fontSize: 14, // 字體大小
                  fontWeight: 'bold', // 字體加粗
                  color: '#FFFFFF', // 字體顏色設為白色
                },
                tabBarActiveTintColor: '#FFFFFF', // 選中標籤顏色
                tabBarInactiveTintColor: '#888888', // 未選中標籤顏色
              })}
            >
          <Tab.Screen name="Location" component={HomeScreen} />
          <Tab.Screen name="Past" component={PastScreen} />
          <Tab.Screen name="Alerts" component={AlertsScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  textWhite: {
    color: '#ffffff',
  },
});

export default App;
