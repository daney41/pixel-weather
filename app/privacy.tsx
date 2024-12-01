import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import GradientTheme from '@/components/GradientTheme';
import { useNavigation } from '@react-navigation/native';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

// Data for Terms of Use and Privacy Policy
const termsOfUse = [
    { id: '1', text: 'Eligibility: You must be at least 13 years old. Users under 18 need parental consent.' },
    { id: '2', text: 'Account: Create an account with accurate information to access certain features.' },
    { id: '3', text: 'License: Use the App for personal, non-commercial purposes only. No copying or modification allowed.' },
    { id: '4', text: 'Prohibited Conduct: Don’t use the App for illegal activities, or to disrupt its functionality.' },
    { id: '5', text: 'Intellectual Property: All content in the App is owned by Yakiniku or its licensors.' },
    { id: '6', text: 'Termination: We can suspend or terminate your access at any time.' },
    { id: '7', text: 'Disclaimers: The App is provided "as is" without guarantees of uninterrupted service.' },
    { id: '8', text: 'Limitation of Liability: Yakiniku is not liable for indirect or consequential damages.' },
    { id: '9', text: 'Changes: We may update these Terms; continued use means acceptance of changes.' },
    { id: '10', text: 'Governing Law: These Terms are governed by the laws of Australia.' },
    { id: '11', text: 'Contact: For questions, email support@yakiniku.com.' },
];

const privacyPolicy = [
    { id: '12', text: 'Information We Collect: Personal details, usage data, and device information.' },
    { id: '13', text: 'Use of Information: To operate, improve, and personalize the App; to communicate with you; and for analytics.' },
    { id: '14', text: 'Sharing Information: With service providers and as required by law.' },
    { id: '15', text: 'Security: We take measures to protect your information but cannot guarantee absolute security.' },
    { id: '16', text: 'Your Choices: Access and update your information; opt out of promotional communications.' },
    { id: '17', text: 'Children\'s Privacy: The App is not for children under 13. We don’t knowingly collect their information.' },
    { id: '18', text: 'Changes: We may update the Policy; continued use signifies acceptance of updates.' },
    { id: '19', text: 'Contact: For privacy questions, email support@yakiniku.com.' },
];

// Combine both sections of data into one array
const combinedData = [
    { id: 'terms-header', isHeader: true, section: 'Terms of Use' },
    ...termsOfUse.map((item) => ({ ...item, section: 'terms' })),
    { id: 'privacy-header', isHeader: true, section: 'Privacy Policy' },
    ...privacyPolicy.map((item) => ({ ...item, section: 'privacy' })),
];

export default function PrivacyScreen() {
    const navigation = useNavigation();

    return (
        <GradientTheme>
            <View style={styles.container}>
                <View>
                    <TouchableOpacity style={{marginBottom: '3%', }} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}><FontAwesome6 size={28} name="arrow-left"/></Text>
                    </TouchableOpacity>
                    <Text style={styles.header}>Pixel Weather {"\n"}Terms of Use and Privacy Policy</Text>
                </View>

                {/* FlatList for both sections */}
                <FlatList
                    data={combinedData}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) =>
                        item.isHeader ? (
                            <Text style={styles.sectionTitle}>{item.section === 'Terms of Use' ? '1. Terms of Use' : '2. Privacy Policy'}</Text>
                        ) : (
                            <View style={styles.listItem}>
                                <Text style={styles.bulletPoint}>•</Text>
                                <Text style={styles.listText}>{item.text}</Text>
                            </View>
                        )
                    }
                    ListFooterComponent={
                        <Text style={styles.agreementText}>
                            By using the Pixel Weather App, you agree to these Terms of Use and acknowledge our Privacy Policy.
                        </Text>
                    }
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
        fontSize: 20,
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
        marginBottom: '20%',
        marginTop: '5%',
    },
    listItem: {
        flexDirection: 'row',
        marginVertical: 5,
        alignItems: 'flex-start',
    },
    bulletPoint: {
        fontSize: 20,
        lineHeight: 24,
        marginRight: 10,
    },
    listText: {
        fontSize: 16,
        lineHeight: 24,
        flex: 1,
    },
    agreementText: {
        fontSize: 16,
        marginTop: 20,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
