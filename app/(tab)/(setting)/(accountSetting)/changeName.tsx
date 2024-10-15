import React, { useState } from 'react';
import {TouchableOpacity, View, Text, StyleSheet, TextInput, Alert} from 'react-native';
import GradientTheme from '@/components/GradientTheme';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/components/accAuth';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {handleUpdateRequest} from "@/components/handleUpdate";
import {email} from "@sideway/address";

export default function ChangeNameScreen() {
    const { login, userData, userToken } = useAuth();
    const [username, setUserName] = useState(userData?.username || '');
    const router = useRouter();
    const navigation = useNavigation();

    const handleChangeUsername = async() => {
        if (!username) {
            Alert.alert('Error', 'Please enter your new username.');
            return;
        }
        const requestBody = { username: username};
        console.log(requestBody);
        const response = await handleUpdateRequest('/handle_update_username', 'PATCH', requestBody, userToken);

        if (response) {
            // 合併更新的 username 到現有的 userData 中，而不覆蓋其他屬性
            const updatedUserData = { ...userData, username: response.data.username };
            login(userToken, updatedUserData); // 使用更新後的完整 userData
            navigation.goBack(); // 返回到 AccountSetting 頁面
        }
    };

    return (
        <GradientTheme>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}><FontAwesome6 size={28} name="arrow-left"/></Text>
                </TouchableOpacity>
                <View style={styles.card}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={(text) => setUserName(text)}
                        editable={true}
                        placeholder="Enter your name."
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleChangeUsername} style={styles.saveButton}>
                            <Text style={styles.saveText}>Save</Text>
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
        backgroundColor: 'white',
        padding: '10%',
        borderRadius: 10,
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
        backgroundColor: '#d3d3d3',
        padding: '5%',
        borderRadius: 10,
        width: '45%',
    },
    cancelText: {
        textAlign: 'center',
        color: 'red',
    },
    saveButton: {
        backgroundColor: '#5b67f7',
        padding: '5%',
        borderRadius: 10,
        width: '45%',
    },
    saveText: {
        color: 'white',
        textAlign: 'center',
    },
});