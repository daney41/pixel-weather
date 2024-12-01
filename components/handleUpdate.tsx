import { Alert } from 'react-native';
import {API_LINK} from "@/constants/API_link";

export const handleUpdateRequest = async (route, method, requestBody, userToken) => {
    try {
        // Send API request
        const response = await fetch(`${API_LINK}/${route}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        // Handle different response status
        if (response.status === 200) {
            Alert.alert('Success', data.message || 'Update successful!');
            return data;
        } else if (response.status === 400) {
            Alert.alert('Error', data.error || 'Missing required information.');
        } else if (response.status === 401) {
            Alert.alert('Unauthorized', data.error || 'Invalid or expired token.');
        } else if (response.status === 403) {
            Alert.alert('Forbidden', data.error || 'Incorrect password.');
        } else if (response.status === 409) {
            Alert.alert('Conflict', data.error || 'Email is already in use.');
        } else if (response.status === 422) {
            let errorMessage = data.error || 'Invalid format.';
            if (data.message) {
                for (const [key, value] of Object.entries(data.message)) {
                    if (!value.valid) {
                        errorMessage += `\n${key}: ${value.error}`;
                    }
                }
            }
            Alert.alert('Unprocessable Entity', errorMessage);
        } else if (response.status === 500) {
            Alert.alert('Server Error', data.error || 'An internal server error occurred. Please try again later.');
        } else {
            Alert.alert('Error', 'An unexpected error occurred.');
        }
    } catch (error) {
        Alert.alert('Error', `An error occurred: ${error.message}`);
    }
};