import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_LINK } from '@/constants/API_link';
import { fetchSuburbs, loadCachedSuburbs } from '@/constants/suburbService';
import { useAuth } from '@/components/accAuth';

export default function SuburbSearch({ onSuburbSelect, token }) {
    const [query, setQuery] = useState('');
    const [filteredSuburbs, setFilteredSuburbs] = useState([]);
    const [selectedSuburb, setSelectedSuburb] = useState(null);
    const [suburbData, setSuburbData] = useState([]);
    const { userToken } = useAuth();

    // Load cached suburbs when the component mounts
    useEffect(() => {
        loadCachedSuburbs(setSuburbData, fetchSuburbs);
    }, [userToken]);

    // Function to filter suburbs based on input (either name or postal code)
    const filterSuburbs = (input) => {
        if (input.length === 0) {
            setFilteredSuburbs([]);
        } else {
            const filtered = suburbData
                .filter(suburb =>
                    suburb.suburb_name.toString().toLowerCase().includes(input.toLowerCase()) ||
                    suburb.postcode.toString().includes(input)
                )
                .slice(0, 10); // Limit to top 6 results
            setFilteredSuburbs(filtered);
        }
    };

    // Handle input changes and filter suburbs with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => filterSuburbs(query), 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    // Handle suburb selection
    const handleSelectSuburb = (suburb) => {
        setSelectedSuburb(suburb);
        // Set the selected suburb in the input field
        setQuery(suburb.suburb_name + ', ' + suburb.postcode);
        setFilteredSuburbs([]); // Hide the dropdown
        onSuburbSelect(suburb.id); // Call the parent function with selected suburb_id
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                value={query}
                placeholder="Search suburb name or postcode in QLD"
                onChangeText={(text) => setQuery(text)}
            />

            {filteredSuburbs.length > 0 && (
                <View style={styles.dropdown}>
                    <FlatList
                        data={filteredSuburbs}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => handleSelectSuburb(item)}
                            >
                                <Text style={styles.itemText}>{item.suburb_name}, {item.postcode}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

            {selectedSuburb && (
                <Text style={styles.selectedSuburb}>
                    Selected Suburb: {selectedSuburb.suburb_name}, {selectedSuburb.postcode}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: 'black',
        padding: Platform.OS === 'ios' ? '5%' : '3%',
        borderRadius: 5,
        width: '100%',
    },
    dropdown: {
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        marginTop: '1%',
        maxHeight: 200,
        width: '100%',
        backgroundColor: 'white',
    },
    dropdownItem: {
        padding: '3%',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
    },
    itemText: {
        fontSize: 16,
    },
    selectedSuburb: {
        marginTop: '3%',
        fontSize: 16,
        color: 'green',
    },
});
