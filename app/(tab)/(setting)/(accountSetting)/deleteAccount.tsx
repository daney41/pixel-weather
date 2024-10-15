import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, TextInput, Image } from 'react-native';
import GradientTheme from '@/components/GradientTheme';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

export default function deleteAccountScreen() {

    const [email, setEmail] = useState('xxxx@google.com');
    const router = useRouter();
    const navigation = useNavigation();

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
                        onChangeText={setEmail}
                        style={styles.input}
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {/* Delete Account Logic */ }} style={styles.saveButton}>
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