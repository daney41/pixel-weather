import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import GradientTheme from '@/components/GradientTheme';
import { useNavigation } from '@react-navigation/native';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

// Data for Help Center
const gettingStarted = [
    { id: '1', text: 'How do I create an account?', details: 'To create an account, open the Pixel Weather app and follow the on-screen instructions to sign up using your email address and a secure password.' },
    { id: '2', text: 'How do I update my account information?', details: 'Go to the "Settings" section in the app, select "Account," and update your personal details as needed.' },
];

const usingTheApp = [
    { id: '3', text: 'How do I customize my weather alert preferences?', details: 'Go to the Alerts section to customize your weather alerts.' },
    { id: '4', text: 'How can I view historical weather posts?', details: 'You can view historical weather posts in the Log section.' },
];

const troubleshooting = [
    { id: '5', text: 'The app is not working properly. What should I do?', details: 'First, try restarting the app or your device. If the problem persists, check for updates in your app store. If the issue continues, contact our support team.' },
    { id: '6', text: 'I forgot my password. How can I reset it?', details: 'On the login screen, select "Forgot Password" and follow the instructions to reset your password via email.' },
];

const privacyAndSecurity = [
    { id: '7', text: 'How is my data protected?', details: 'We use industry-standard security measures to protect your data. For detailed information, please review our Privacy Policy.' },
    { id: '8', text: 'How do I delete my account?', details: 'To delete your account, go to "Settings," select "Account," and choose "Delete Account." Follow the prompts to complete the process.' },
];

// Combine all sections into one array
const combinedData = [
    { id: 'gettingStarted-header', isHeader: true, section: 'Getting Started' },
    ...gettingStarted.map((item) => ({ ...item, section: 'gettingStarted' })),

    { id: 'usingTheApp-header', isHeader: true, section: 'Using the App' },
    ...usingTheApp.map((item) => ({ ...item, section: 'usingTheApp' })),

    { id: 'troubleshooting-header', isHeader: true, section: 'Troubleshooting' },
    ...troubleshooting.map((item) => ({ ...item, section: 'troubleshooting' })),

    { id: 'privacyAndSecurity-header', isHeader: true, section: 'Privacy and Security' },
    ...privacyAndSecurity.map((item) => ({ ...item, section: 'privacyAndSecurity' })),
];

export default function PrivacyScreen() {
    const navigation = useNavigation();
    const [expandedItems, setExpandedItems] = useState({});

    const toggleItem = (id) => {
        setExpandedItems((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Render the contact us section
    const renderContactUsSection = () => (
        <View style={styles.contactUsContainer}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.contactText}>If you need further assistance or have any other questions, please reach out to us:</Text>
            <Text style={styles.contactText}>✉️Email: support@yakiniku.com</Text>
            <Text style={styles.contactText}>📞Phone: 1800-xxx-xxx</Text>
            <Text style={styles.contactText}>Thank you for using Pixel Weather!</Text>
        </View>
    );

    return (
        <GradientTheme>
            <View style={styles.container}>
                <View>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}><FontAwesome6 size={28} name="arrow-left"/></Text>
                    </TouchableOpacity>
                    <Text style={styles.header}>{"\n"}Pixel Weather {"\n"}Help Center</Text>
                </View>

                {/* FlatList for sections */}
                <FlatList
                    data={combinedData}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) =>
                        item.isHeader ? (
                            <Text style={styles.sectionTitle}>
                                {"\n"}
                                {item.section}
                            </Text>
                        ) : (
                            <View style={styles.listItem}>
                                <TouchableOpacity onPress={() => toggleItem(item.id)} style={styles.listItemTouchable}>
                                    <Text style={styles.arrow}>
                                        {expandedItems[item.id] ? '↓' : '→'}
                                    </Text>
                                    <Text style={styles.listText}>{item.text}</Text>
                                </TouchableOpacity>
                                {expandedItems[item.id] && (
                                    <Text style={styles.detailsText}>{item.details}</Text>
                                )}
                            </View>
                        )
                    }
                    ListFooterComponent={renderContactUsSection} // Add contact us section as footer
                    style={styles.list}
                />
            </View>
        </GradientTheme>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: '5%',
        marginTop: '15%',
        paddingBottom: '15%',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    backButton: {
        fontSize: 40,
        color: 'black',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    list: {
        marginBottom: '5%',
        marginTop: '5%',
    },
    listItem: {
        marginVertical: 5,
    },
    listItemTouchable: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    arrow: {
        fontSize: 18,
        marginRight: 10,
    },
    listText: {
        fontSize: 16,
        lineHeight: 24,
        flex: 1,
    },
    detailsText: {
        fontSize: 14,
        marginTop: 5,
        marginLeft: 28,
        color: 'white',
    },
    contactUsContainer: {
        marginTop: 20,
        paddingBottom: '35%',
    },
    contactText: {
        fontSize: 16,
        marginTop: 5,
    },
});