import React, { useState, useCallback } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import GradientTheme from '@/components/GradientTheme';
import { useAuth } from '@/components/accAuth';
import { useNavigation } from '@react-navigation/native';
import { handleUpdateRequest } from "@/components/handleUpdate";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function ChangePasswordScreen() {
    const { userToken } = useAuth(); // Get token from Auth context
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigation = useNavigation();

    // Password validation function
    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        return passwordRegex.test(password);
    };

    // this is considered as privacy consideration since we will upload user's old password and new password to the server.
    const handleChangePassword = async () => {
        // Validate inputs
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please enter all the required fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        const requestBody = {
            current_password: currentPassword,
            new_password: newPassword,
        };

        try {
            const response = await handleUpdateRequest(
                'handle_update_password', // Pass route without "/"
                'PATCH',
                requestBody,
                userToken
            );

            if (response) {
                setSuccessMessage('Password updated successfully!');
                setErrorMessage('');
                Alert.alert('Success', 'Password updated successfully!', [
                    { text: 'OK', onPress: () => navigation.navigate('(accountSetting)/accountSetting') }
                ]);
            }
        } catch (error) {
            console.error('Error updating password:', error);
            setErrorMessage('An error occurred. Please try again later.');
        }
    };


    return (
        <GradientTheme>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => navigation.navigate('(accountSetting)/accountSetting')}>
                    <Text style={styles.backButton}><FontAwesome6 size={28} name="arrow-left" /></Text>
                </TouchableOpacity>
                <View style={styles.card}>
                    <Text style={styles.label}>Current Password:</Text>
                    <TextInput
                        style={styles.input}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholder="Enter your current password"
                        secureTextEntry
                    />

                    <Text style={styles.label}>New Password:</Text>
                    <TextInput
                        style={styles.input}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Enter your new password"
                        secureTextEntry
                    />

                    <Text style={styles.label}>Confirm Password:</Text>
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            if (text !== newPassword) {
                                setErrorMessage('Passwords do not match.');
                            } else {
                                setErrorMessage('');
                            }
                        }}
                        placeholder="Confirm your new password"
                        secureTextEntry
                    />

                    {/* Display error message */}
                    {errorMessage !== '' && (
                        <Text style={styles.errorMessage}>{errorMessage}</Text>
                    )}

                    {/* Display success message */}
                    {successMessage !== '' && (
                        <Text style={styles.successMessage}>{successMessage}</Text>
                    )}

                    <TouchableOpacity onPress={handleChangePassword} style={styles.saveButton}>
                        <Text style={styles.saveText}>Update Password</Text>
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
    saveButton: {
        backgroundColor: '#5b67f7',
        padding: '5%',
        borderRadius: 10,
        width: '70%',
        alignSelf: 'center',
        marginTop: 20,
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
    successMessage: {
        color: 'green',
        fontSize: 14,
        marginBottom: 20,
    },
});
