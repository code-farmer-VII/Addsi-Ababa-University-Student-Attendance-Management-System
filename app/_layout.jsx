import { router, Stack } from 'expo-router';
import { AttendanceProvider } from '../hook/context';
import { Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Layout() {
  const handleLogout = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    await AsyncStorage.removeItem('accessToken');
    console.log('Logout successful');
    router.push("/")
  }
  return (
    <AttendanceProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },

        }}
              initialRouteName="index"
        >
        <Stack.Screen
        name="index"
        options={{
          headerShown: false, 
        }}
      />
        <Stack.Screen
        name="(auth)" 
        options={{
          headerShown: false, 
        }}
      />
<Stack.Screen
  name="attendance"
  options={{
    headerTitle: 'Attendance App',
    headerStyle: {
      backgroundColor: 'blue',
    },
    headerTitleAlign: 'center',
    headerRight:() => (
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          marginRight: 10,
        }}
      >
        <Text style={{ color: 'white' }}>Logout</Text>
      </TouchableOpacity>
    ),
  }}
/>
          <Stack.Screen name="home" options={{
          headerTitle: 'Home',
          headerStyle: {
            backgroundColor: 'blue',
          },
          headerTitleAlign: 'center',
        }} />

<Stack.Screen name="QrCodeScanner" options={{
          headerTitle: 'QrCodeScanner',
          headerStyle: {
            backgroundColor: 'blue',
          },
          headerTitleAlign: 'center',
        }} />
<Stack.Screen name="addStudent" options={{
          headerTitle: 'Add Student',
          headerStyle: {
            backgroundColor: 'blue',
          },
          headerTitleAlign: 'center',
        }} />
<Stack.Screen name="registerQrCode" options={{
          headerTitle: 'Register QrCode',
          headerStyle: {
            backgroundColor: 'blue',
          },
          headerTitleAlign: 'center',
        }} />
<Stack.Screen name="retriveStudentQrCode" options={{
          headerTitle: 'Retrive Student QrCode',
          headerStyle: {
            backgroundColor: 'blue',
          },
          headerTitleAlign: 'center',
        }} />
<Stack.Screen name="scanner" options={{
          headerTitle: 'Scanner',
          headerStyle: {
            backgroundColor: 'blue',
          },
          headerTitleAlign: 'center',
        }} />

      </Stack>
    </AttendanceProvider>
  );
}
