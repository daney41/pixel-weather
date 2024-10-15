import React from 'react';
import { TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// Add button component for add alert type, location and timing
export default function AddButton({ onPress }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <FontAwesome name="plus" size={24} color="black" />
        </TouchableOpacity>
    );
}