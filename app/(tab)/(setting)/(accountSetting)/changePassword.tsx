import React, {useCallback, useState} from 'react';
import { TouchableOpacity, View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import GradientTheme from '@/components/GradientTheme';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import {handleUpdateRequest} from "@/components/handleUpdate";
import { useAuth } from '@/components/accAuth';
import {email} from "@sideway/address";

export default function ChangePasswordScreen() {
    // 定義狀態變數
    const {userToken} = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // 確認密碼欄位
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // 定義處理更改密碼的函式
    const handleChangePassword = async () => {
        // 檢查新密碼和確認密碼是否一致
        if (!currentPassword || !newPassword ||!confirmPassword) {
            Alert.alert('Error', 'Please enter all the required fields.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        const requestBody = {current_password: currentPassword, new_password: newPassword};
        await handleUpdateRequest('/handle_update_password', 'PATCH', requestBody, userToken);
    };

    // 當使用者在確認密碼欄位中輸入時即進行即時比對
    const handleConfirmPasswordChange = (text) => {
        setConfirmPassword(text);
        if (text !== newPassword) {
            setErrorMessage('Passwords do not match.');
        } else {
            setErrorMessage('');
        }
    };

    return (
        <GradientTheme>
            <View style={styles.container}>
                {/* 顯示當前密碼 */}
                <Text style={styles.label}>Current Password:</Text>
                <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter your current password"
                    secureTextEntry
                />

                {/* 顯示新密碼 */}
                <Text style={styles.label}>New Password:</Text>
                <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter your new password"
                    secureTextEntry
                />

                {/* 顯示確認密碼 */}
                <Text style={styles.label}>Confirm Password:</Text>
                <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange} // 使用 handleConfirmPasswordChange 方法
                    placeholder="Confirm your new password"
                    secureTextEntry
                />

                {/* 當密碼不一致時顯示錯誤訊息 */}
                {errorMessage !== '' && (
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                )}

                {/* 顯示送出按鈕 */}
                <TouchableOpacity onPress={handleChangePassword} style={styles.saveButton}>
                    <Text style={styles.saveText}>Update Password</Text>
                </TouchableOpacity>
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
    errorMessage: {
        color: 'red',
        fontSize: 14,
        marginBottom: 20,
    },
});