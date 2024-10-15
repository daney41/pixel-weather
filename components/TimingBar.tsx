import React from 'react';
import { View, Text, Switch, StyleSheet, Platform } from 'react-native';

// Timing Component
export default function TimingBar({ startTime, endTime, isActive, onToggle }) {
    return (
        <View style={styles.timingBar}>
            {startTime !== "00:00:00" && endTime !== "23:59:59" ? (
                <Text style={styles.timingBarText}>{startTime.slice(0, 5)} - {endTime.slice(0, 5)}</Text>
            ) : (
                <Text style={styles.timingBarText}>Whole Day</Text>
            )}

            <Switch
                trackColor={{ false: '#767577', true: '#363EFF' }}
                thumbColor={isActive ? '#BCB2FE' : '#f4f3f4'}
                onValueChange={onToggle}
                value={isActive}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    timingBar: {
        backgroundColor: '#FFFFFFB3',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderRadius: 20,
        padding: Platform.OS === 'ios' ? '3.5%' : '1.5%',
        marginBottom: 10,
    },
    timingBarText: {
        fontSize: 20,
    },
});
