import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';

const AddLabScreen = ({ navigation }) => (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Lab Test</Text>
            <View style={{ width: 40 }} />
        </View>
        <View style={styles.content}>
            <Ionicons name="flask" size={60} color={colors.border} />
            <Text style={styles.text}>Add Lab Test Form</Text>
            <Text style={styles.subtext}>Lab test registration form will be here</Text>
        </View>
    </SafeAreaView>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
    backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginTop: 16 },
    subtext: { fontSize: 14, color: colors.textSecondary, marginTop: 8 },
});

export default AddLabScreen;
