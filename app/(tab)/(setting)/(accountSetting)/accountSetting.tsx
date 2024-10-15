import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import GradientTheme from '@/components/GradientTheme';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/components/accAuth';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as ColorScheme from '@/constants/ColorScheme';
import {BTN_BACKGROUND} from "@/constants/ColorScheme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function AccountSettingScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { userData, isLoggedIn } = useAuth();


    return (
        <GradientTheme>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>
                        <FontAwesome6 size={28} name="arrow-left"/>
                    </Text>
                </TouchableOpacity>
                <View style={styles.card}>
                    <View style={styles.infoContainer}>
                        <View>
                             <Text style={styles.label}>Email:</Text>
                             <Text style={styles.info}>{userData.email}</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/changeEmail')}>
                            <Text style={styles.editIcon}><FontAwesome6 size={20} name="pencil"/></Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoContainer}>
                        <View>
                            <Text style={styles.label}>Username:</Text>
                            <Text style={styles.info}>{userData.username}</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/changeName')}>
                            <Text style={styles.editIcon}><FontAwesome6 size={20} name="pencil"/></Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoContainer}>
                        <View>
                            <Text style={styles.label}>Password:</Text>
                            <Text style={styles.info}>********</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/changePassword')}>
                            <Text style={styles.editIcon}><FontAwesome6 size={20} name="pencil"/></Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.deleteButton} onPress={() => router.push('/deleteAccount')}>
                    <Text style={styles.deleteText}>Delete Account</Text>
                </TouchableOpacity>
            </View>
        </GradientTheme>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        marginTop: '20%',
        marginBottom: '10%',
        paddingHorizontal: '5%',
    },
    card: {
        height: '38%',
        backgroundColor: '#FFFFFF95',
        padding: '7%',
        borderRadius: 10,
    },
    backButton: {
        fontSize: 40,
        color: 'black',
        marginBottom: '3%',

    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: '5%',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    info: {
        fontSize: 16,
    },
    editIcon: {
        fontSize: 20,
        color: 'black',
    },
    deleteButton: {

        justifyContent: 'flex-end',
        backgroundColor: 'red',
        marginTop: '10%',
        padding: '4%',
        alignItems: 'center',
        borderRadius: 10,
    },
    deleteText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});