import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import GradientTheme from '@/components/GradientTheme';
import * as ColorScheme from '@/constants/ColorScheme';
import {BTN_BACKGROUND} from "@/constants/ColorScheme";

export default function SignUpSuccessScreen() {
    const router = useRouter();

    return (
        <GradientTheme>
            <View style={styles.container}>

                <View style={styles.card}>

                    <Text style={styles.emojiText}>🎉</Text>

                    <Text style={styles.successText}>Sign Up Successful!</Text>


                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push('/login')}
                    >

                        <Text style={styles.buttonText}>Sign in with new account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </GradientTheme>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    card: {
        width: '80%',
        padding: 40,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    emojiText: {
        fontSize: 80,  // 設置 Emoji 的大小
        marginBottom: 20,
    },
    successText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4A00E0',
        marginBottom: 30,
    },
    button: {
        backgroundColor: BTN_BACKGROUND,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        // marginTop: 20,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
});