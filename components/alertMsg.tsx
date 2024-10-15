import { Alert } from 'react-native';

export const showAlert = () => {
    Alert.alert(
        'Function is still under development!',
        'Please wait for further notification.',
        [
            {
                text: 'Confirm',
                onPress: () => console.log('彈窗關閉'),
            }
        ]
    );
};