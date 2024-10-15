import React, { useState } from 'react';
import {TouchableOpacity, View, Text, StyleSheet, TextInput, Alert} from 'react-native';
import GradientTheme from '@/components/GradientTheme';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/components/accAuth';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {handleUpdateRequest} from "@/components/handleUpdate";

export default function ChangeEmailScreen() {
    const { userData, userToken, login} = useAuth();
    const [email, setEmail] = useState(userData?.email || '')
    const router = useRouter();
    const navigation = useNavigation();

    const handleChangeEmail = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your new email address.');
            return;
        }
        const requestBody = {email}
        const response = await handleUpdateRequest('/handle_update_email', 'PATCH', requestBody, userToken);

        if (response) {
            // 更新 `useAuth` 中的資料並返回 AccountSetting
            const updatedUserData = { ...userData, email: response.data.email };
            login(userToken, updatedUserData); // 更新 useAuth 內的狀態
            navigation.goBack(); // 導航回到 AccountSetting 頁面
        }
    };

    return (
        <GradientTheme>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}><FontAwesome6 size={28} name="arrow-left"/></Text>
                </TouchableOpacity>
                <View style={styles.card}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={(text) => setEmail(text)}
                        editable={true}
                        placeholder="Enter your email"
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleChangeEmail} style={styles.saveButton}>
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