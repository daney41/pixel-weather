import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import GradientTheme from '@/components/GradientTheme';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/components/accAuth';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { handleUpdateRequest } from "@/components/handleUpdate";

export default function ChangeEmailScreen() {
    const { userData, userToken, setUserData } = useAuth();
    const [email, setEmail] = useState(userData?.email || '');
    const navigation = useNavigation();

    // Update `email` when `userData` changes (in case it changes externally)
    useEffect(() => {
        setEmail(userData?.email || '');
    }, [userData]);

    // Email validation function using regex
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // Basic email pattern
        return emailRegex.test(email);
    };

    const handleChangeEmail = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your new email address.');
            return;
        }

        if (!isValidEmail(email)) {
            Alert.alert('Error', 'Please enter a valid email address.');
            return;
        }

        try {
            const response = await handleUpdateRequest(
                'handle_update_email',  // Adjust API route if necessary
                'PATCH',
                { email },  // Request body with new email
                userToken
            );

            if (response) {
                // Update the email in `userData` context
                const updatedUserData = { ...userData, email: response.data.email };
                setUserData(updatedUserData);  // Update state in context

                Alert.alert('Success', 'Email updated successfully');
                // Navigate back with a refresh
                navigation.replace('(accountSetting)/accountSetting');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update email. Please try again.');
        }
    };

    return (
        <GradientTheme>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => navigation.navigate('(accountSetting)/accountSetting')}>
                    <Text style={styles.backButton}><FontAwesome6 size={28} name="arrow-left" /></Text>
                </TouchableOpacity>
                <View style={styles.card}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('(accountSetting)/accountSetting')}
                            style={styles.cancelButton}
                        >
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
