import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import {Alert} from "react-native";
import {API_LINK} from "@/constants/API_link";  // 引入 `expo-secure-store`

// 建立一個 context，用來管理登入狀態
export const AuthContext = createContext();

// 提供者組件，包裹應用所有的子組件
export const AuthProvider = ({ children }) => {
    // 管理登入狀態、用戶資料和 token 的狀態變數
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userToken, setUserToken] = useState(null); // 用來存儲用戶的登入 token
    const [userData, setUserData] = useState(null);  // 存儲使用者的其他資料

    // 當應用啟動時，檢查是否已經儲存了登入狀態
    useEffect(() => {
        const loadToken = async () => {
            try {
                const storedToken = await SecureStore.getItemAsync('userToken');  // 使用 SecureStore 取代 AsyncStorage
                const storedUserData = await SecureStore.getItemAsync('userData'); // 使用 SecureStore 取代 AsyncStorage

                if (storedToken) {
                    setUserToken(storedToken);
                    setUserData(JSON.parse(storedUserData));
                    setIsLoggedIn(true);
                }
            } catch (e) {
                console.error('Failed to load token');
            }

        };
        loadToken();
    }, []);

    // 定義登入方法
    const login = async (email, password) => {
        if (!email || !password) {
            Alert.alert('Error', 'Missing email or password.');
            return false;
        }

        try {
            const response = await fetch(`${API_LINK}/handle_login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "email": email,
                    "password": password,
                }),
            });

            const rawResponse = await response.text();

            if (rawResponse.includes('<')) {
                console.error('伺服器回傳了 HTML 而非 JSON:', rawResponse);
                Alert.alert('Server Error', 'Received unexpected response from server.');
                return false;
            }

            const data = JSON.parse(rawResponse);

            if (response.status === 200) {
                // 成功登入後，更新狀態並存儲 Token 和用戶資料
                await SecureStore.setItemAsync('userToken', data.data.token);
                await SecureStore.setItemAsync('userData', JSON.stringify({
                    email: data.data.email,
                    username: data.data.username,
                }));

                setIsLoggedIn(true);
                setUserToken(data.data.token);
                setUserData({
                    email: data.data.email,
                    username: data.data.username,
                });
                Alert.alert('Success', 'Login successful!');
                return true;
            } else {
                Alert.alert('Error', data.error || 'Invalid credentials.');
                return false;
            }
        } catch (error) {
            console.error("Error: didn't send the request", error);
            Alert.alert('Error', `${error.message}`);
            return false;
        }
    };

    // 定義登出方法，並且處理登出 API 請求
    const logout = async () => {
        if (!userToken) {
            Alert.alert('Error', 'No active session to log out.');
            return false;
        }

        try {
            const response = await fetch(`${API_LINK}/handle_logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userToken}`,
                },
                body: JSON.stringify({ logout_all: false }),
            });

            const data = await response.json();

            if (response.status === 200 || response.status === 400 || response.status === 401) {
                Alert.alert('Success', data.message || 'Log out successful.');

                // 清空 SecureStore 中的 token 和用戶資料
                await SecureStore.deleteItemAsync('userToken');
                await SecureStore.deleteItemAsync('userData');

                // 重置本地狀態
                setIsLoggedIn(false);
                setUserToken(null);
                setUserData(null);
                return true;
            } else if (response.status === 500) {
                Alert.alert('Server Error', data.error || 'An internal server error occurred. Please try again later.');
                return false;
            } else {
                Alert.alert('Error', 'An unexpected error occurred.');
                return false;
            }
        } catch (error) {
            Alert.alert('Error', `An error occurred: ${error.message}`);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, userToken, userData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);