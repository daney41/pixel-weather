import React from 'react';
import { TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// Edit button component for editing Alert Type and Areas
export default function EditButton({ onPress, section }) {
    return (
        <TouchableOpacity onPress={() => onPress(section)}>
            <FontAwesome name="edit" size={24} color="black" />
        </TouchableOpacity>
    );
}