import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, TextInput, Image, Alert } from 'react-native';
import GradientTheme from '@/components/GradientTheme';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { API_LINK } from '@/constants/API_link';
import { useAuth } from '@/components/accAuth';

export default function deleteAccountScreen() {

    const { userToken, logout } = useAuth();
    const [password, setPassword] = useState();
    const router = useRouter();
    const navigation = useNavigation();

    // Function to delete the account
    const handleDeleteAccount = async () => {
        try {
            // Show confirmation alert before deleting the account
            Alert.alert(
                'Confirm Delete',
                'Are you sure you want to delete your account? This action is irreversible.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', onPress: async () => {
                        const response = await fetch(`${API_LINK}/handle_delete_account`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${userToken}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ password: password }) // Send the user's ID
                        });

                        const result = await response.json();

                        if (response.status === 200) {
                            Alert.alert('Success', 'Your account has been deleted successfully.');
                            await logout();  // Log the user out
                            navigation.replace('setting');
                            router.push('/login'); // Redirect to the login screen
                        } else {
                            Alert.alert('Error', result.error || 'Failed to delete the account. Please try again.');
                        }
                    }},
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'An error occurred while deleting your account. Please try again later.');
            console.error('Error deleting account:', error);
        }
    };

    return (
        <GradientTheme>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>←</Text>
                </TouchableOpacity>
                <View style={styles.card}>
                    <Image
                        source={require('@/assets/images/warning-sign.png')}
                        style={styles.image}
                        resizeMode="contain"
                    />
                    <Text style={styles.label}>Enter your password to proceed. {"\n"}
                        This action is permanent.</Text>
                    <TextInput
                        onChangeText={setPassword}
                        style={styles.input}
                        placeholder={'Please enter your password'}
                        secureTextEntry={true}
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteAccount()} style={styles.saveButton}>
                            <Text style={styles.saveText}>DELETE</Text>
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
        alignSelf: 'center',
    },
    image: {
        width: 100,
        height: 100,
        alignSelf: 'center',
        marginBottom: '5%',
    },
    backButton: {
        fontSize: 40,
        color: 'black',
        marginBottom: '3%',
    },
    label: {
        fontSize: 18,
        marginBottom: '4%',
        textAlign: 'center',
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