import React, {useRef, useState, useEffect} from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Image,
    KeyboardAvoidingView, ScrollView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import GradientTheme from "@/components/GradientTheme";
import * as ColorScheme from '@/constants/ColorScheme';
import {API_LINK} from '@/constants/API_link';
import { useAuth } from '@/components/accAuth'

export default function SignUpScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const router = useRouter();
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const { isLoggedIn } = useAuth();

    // Use useEffect to handle navigation when the user is already logged in
    useEffect(() => {
        if (isLoggedIn) {
            router.push('/(map)/map');
        }
    }, [isLoggedIn]);  // Dependency array ensures this effect only runs when isLoggedIn changes

    const handleGuestLogin = () => {
        Alert.alert('Guest Mode', 'You have entered the app as a guest.');
        router.push('/(map)/map');
    };

    const handleSignUp = async () => {
        // check validtity of all 3 input texts
        if (!email || !username || !password) {
            Alert.alert('Error', 'Missing email, username or password.');
            return;
        }

        // sign up API calls
        try {
            const response = await fetch(`${API_LINK}/handle_signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "email": email,
                    "username": username,
                    "password": password,
                }),
            });

            const data = await response.json();

            switch (response.status) {
                case 201:
                    Alert.alert('Success', 'Sign up successful!');

                    // Get user token
                    const userToken = data.data.token; // Use the data from the first call

                    // Set up default whole-day alert timing
                    const requestBody = {
                        start_time: '00:00:00',
                        end_time: '23:59:59',
                        is_active: true,
                    };

                    try {
                        const alertResponse = await fetch(`${API_LINK}/user_alert_time`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${userToken}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(requestBody),
                        });

                        const alertData = await alertResponse.json(); // Handle the second response

                        if (alertResponse.status === 201) {
                            console.log('Success', 'Alert timing added successfully.');
                        } else if (alertResponse.status === 400) {
                            console.log('Error', 'Missing required data. Please try again.');
                        } else if (alertResponse.status === 401) {
                            console.log('Error', 'Invalid or expired token.');
                        } else if (alertResponse.status === 409) {
                            console.log('Error', 'This time range has already been added.');
                        } else if (alertResponse.status === 422) {
                            console.log('Error', 'Invalid time range: start_time cannot be later than end_time.');
                        } else {
                            console.log('Error', 'An unknown error occurred.');
                        }
                    } catch (error) {
                        console.log('Error', 'Failed to connect to the server. Please try again.');
                    }
                    router.push('/signupSuccess');
                    break;
                case 400:
                    // lacking necessary information
                    Alert.alert('Error', data.error || 'Missing email, username or password.');
                    break;
                case 409:
                    // email registered
                    Alert.alert('Error', data.error || 'Email is already in use.');
                    break;
                case 422:
                    // invalid information
                    const invalidEmail = data.message?.email?.error || '';
                    const invalidUsername = data.message?.username?.error || '';
                    const invalidPassword = data.message?.password?.error || '';

                    Alert.alert(
                        'Invalid Data',
                        `Invalid email or password format.\n${invalidEmail}\n${invalidUsername}\n${invalidPassword}`
                    );
                    break;
                case 500:
                    // server error
                    Alert.alert('Error', data.error || 'An internal server error occurred. Please try again later.');
                    break;
                default:
                    // other errors
                    Alert.alert('Error', data.error || 'An error occurred. Please try again.');
                    break;
            }
        } catch (error) {
            // Server error
            console.error(error);
            Alert.alert('Error', 'An internal server error occurred. Please try again later.');
        }
    };

    const handleLogin = () => {
        router.push('/login');
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <GradientTheme>
                    <View style={styles.container}>
                        {/* Welcome Text */}
                        <Text style={styles.title}>Welcome</Text>

                        {/* Visitor button */}
                        <View style={styles.signupContainer}>
                            <View style={{width: '85%'}}>
                                <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
                                    <Text style={styles.guestButtonText}>Continue as a guest!</Text>
                                </TouchableOpacity>

                                {/* Breaker */}
                                <View style={styles.dividerContainer}>
                                    <View style={styles.line} />
                                    <Text style={styles.dividerText}> Or create an account </Text>
                                    <View style={styles.line} />
                                </View>

                                {/* Text input */}
                                <Text>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="email@example.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    returnKeyType="next"
                                    onSubmitEditing={() => usernameRef.current.focus()}
                                />
                                <Text>Username</Text>
                                <TextInput
                                    ref={usernameRef}
                                    style={styles.input}
                                    placeholder="username"
                                    value={username}
                                    onChangeText={setUsername}
                                    returnKeyType="next"
                                    onSubmitEditing={() => passwordRef.current.focus()}
                                />
                                <Text>Password</Text>
                                <TextInput
                                    ref={passwordRef}
                                    style={styles.input}
                                    placeholder="Password"
                                    value={password}
                                    onChangeText={setPassword}
                                    returnKeyType="done"
                                    onSubmitEditing={() => handleSignUp()}
                                    secureTextEntry
                                />

                                {/* Registration button */}
                                <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                                    <Text style={styles.signUpButtonText}>Join our community!</Text>
                                </TouchableOpacity>
                            </View>
                            {/* Login Button */}
                            <Text style={styles.loginLink} onPress={handleLogin}>
                                Already have an account? Login
                            </Text>

                            {/* Terms & Privacy */}
                            <View style={styles.termsContainer}>
                                <Text
                                    style={styles.termsText}
                                    onPress={() => router.push('/privacy')}
                                >
                                    Terms of Use | Privacy Policy
                                </Text>
                            </View>
                        </View>
                    </View>
                </GradientTheme>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        width: '100%',
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 20,
    },
    signupContainer: {
        width: '100%',
        backgroundColor: '#FFFFFF90',
        borderRadius: 15,
        paddingVertical: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    guestButton: {
        backgroundColor: ColorScheme.BTN_BACKGROUND,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 30,
    },
    guestButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#45415A',
    },
    dividerText: {
        color: '#45415A',
        fontSize: 14,
    },
    input: {
        height: 40,
        borderColor: '#D9D9D9',
        borderWidth: 1,
        marginTop: 5,
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: 'white',
    },
    signUpButton: {
        backgroundColor: ColorScheme.BTN_BACKGROUND,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    signUpButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
    },
    loginLink: {
        marginTop: 20,
        color: '#4A44EF',
        fontSize: 14,
    },
    termsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15,
    },
    termsDivider:{
        color: '#45415A',
        marginHorizontal: 2,
        fontSize: 10,
    },
    termsText: {
        color: '#45415A',
        marginHorizontal: 2,
        fontSize: 10,
        textDecorationLine: 'underline',
    },
});