import React, { useState } from 'react';
import {TouchableOpacity, View, Text, StyleSheet, TextInput, Alert} from 'react-native';
import GradientTheme from '@/components/GradientTheme';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/components/accAuth';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {handleUpdateRequest} from "@/components/handleUpdate";
import {email} from "@sideway/address";

export default function ChangeNameScreen() {
    const { userData, setUserData, userToken } = useAuth();
    const [username, setUserName] = useState(userData?.username || '');
    const navigation = useNavigation();

    const handleChangeUsername = async() => {
        if (!username) {
            Alert.alert('Error', 'Please enter your new username.');
            return;
        }
        const requestBody = { username: username };
        console.log(requestBody);
        const response = await handleUpdateRequest('/handle_update_username', 'PATCH', requestBody, userToken);

        if (response) {
            // Update context with new username
            setUserData((prevData) => ({ ...prevData, username: username }));
            // Redirect to Account Setting and refresh
            navigation.replace('(accountSetting)/accountSetting');
        }
    };

    return (
        <GradientTheme>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => navigation.navigate('(accountSetting)/accountSetting')}>
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
                        <TouchableOpacity
                            onPress={() => navigation.navigate('(accountSetting)/accountSetting')}
                            style={styles.cancelButton}
                        >
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