import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import GradientTheme from '@/components/GradientTheme';

export default function ErrorMessage({ error, onRetry }) {
    return (
        <GradientTheme>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                <Text style={{ margin: '2%' }}>Error: {error}</Text>
                <Button title="Retry" onPress={onRetry} />
            </View>
        </GradientTheme>
    );
}
