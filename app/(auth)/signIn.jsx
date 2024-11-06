import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import { logInWithEmail } from '../../db/Auth';
import AsyncStorage from "@react-native-async-storage/async-storage";


const SignIn = () => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");

        if (token) {
          router.push("/attendance")
        }
      } catch (err) {
        console.log("error message", err);
      }
    };
    checkLoginStatus();
  }, []);
const handleSignIn = async () => {
  logInWithEmail(email, password).then(response => {

    if (response.error) {
      alert(`Login failed: ${response.error.message}`);

    } else {
      const session = response.data.session;
      const userId = session.user.id;
      const accessToken = session.access_token;
      const userEmail = session.user.email;
      AsyncStorage.setItem("accessToken", accessToken);
      AsyncStorage.setItem("userId", userId);
      AsyncStorage.setItem("userEmail", userEmail);

      console.log('User ID:', userId);
      console.log('Access Token:', accessToken);
      console.log('User Email:', userEmail);
      router.push('/attendance');
      alert('Login successful!');


    }
  });
}

  return (
    <View className="flex-1 justify-center items-center bg-red-500">
      <Text className="text-white text-3xl font-semibold mb-6">Sign In</Text>

      <View className="flex-row items-center bg-white w-3/4 p-4 mb-4 rounded-lg shadow">
        <Icon name="user" size={20} color="#999" className="mr-3 ml-3" /> 
        <TextInput
          placeholder="Enter your email" 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none"
          className="flex-1 border-l-2 border-gray-300 ml-2 pl-2"
          placeholderTextColor="#999"
        />
      </View>

      <View className="flex-row items-center bg-white w-3/4 p-4 mb-6 rounded-lg shadow">
        <Icon name="lock" size={20} color="#999" className="mr-3 ml-3" />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="flex-1 border-l-2 border-gray-300 ml-2 pl-2"
          placeholderTextColor="#999"
        />
      </View>

      <View className="w-3/4">
        <Button 
          title={loading ? "Signing In..." : "Sign In"} 
          onPress={handleSignIn} 
          color="blue" 
          className="rounded-md" 
          disabled={loading} 
        />
      </View>

      <View className="flex my-5 flex-row">
        <Text className="text-blue-500 text-sm">
          If you don't have an account,{' '}
          <Link href={'/(auth)/signup'} className='text-blue-500 px-3'>
            <Text className="text-white px-4 underline underline-offset-2">sign up here</Text>
          </Link>
        </Text>
      </View>

      <StatusBar barStyle="light-content" backgroundColor={'blue'} />
    </View>
  );
};

export default SignIn;
