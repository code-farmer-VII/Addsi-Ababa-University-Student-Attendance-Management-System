import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StatusBar } from 'react-native';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Link } from 'expo-router';
import { supabase } from '../../db/supaconfigration';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signUpWithEmail } from '../../db/Auth';
import { RegisterTeacher } from '../../db/Auth';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

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

  const handleSignUp = async () => {
    // Ensure all input fields are filled
    if (!email || !password || !username) {
      console.log('Please fill in all fields');
      return; 
    }
  
    try {
      // Sign up the user with Supabase authentication
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
  
      // Check for sign-up error
      if (error) {
        console.error('Sign-up error:', error.message);
        // Optionally, show this error to the user in the UI
        return { error: error.message };
      }
  
      // Check if a session was created (e.g., user needs to verify email)
      if (!data.user) {
        console.log('Sign-up succeeded. Please check your email to verify your account.');
        return; // Optionally, inform the user to check their email
      }
  
      // Retrieve necessary session data
      const userId = data.user.id; // The auth ID provided by Supabase
      const accessToken = data.session?.access_token; // The access token from Supabase
      const userEmail = data.user.email; // The email the user signed up with
   console.log("userId: ", userId);
   console.log("accessToken: ", accessToken);
   await AsyncStorage.setItem("userId", userId);
   console.log("userEmail: ", userEmail);
      const { data: teacherData, error: teacherError } = await supabase
        .from('Teachers') 
        .insert([{id: userId, email: email, name: username, auth_id: userId }]);
  
      if (teacherError) {
        console.error('Error adding teacher:', teacherError);
        return; 
      }
  
      console.log('Teacher added successfully:', teacherData);
  
      // Store access token and user details securely in AsyncStorage
      if (accessToken) {
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('userId', userId);
        await AsyncStorage.setItem('userEmail', userEmail);
      }
  
      // Navigate to the attendance screen upon successful registration
      router.push('/attendance');
  
      // Return the user object if needed
      return { user: data.user };
    } catch (err) {
      // Catch and log any unexpected errors
      console.error('Unexpected error during sign-up:', err.message);
    }
  };
  
  

  return (
    <View className="flex-1 justify-center items-center bg-blue-700">
      <Text className="text-white text-3xl font-semibold mb-6">Sign Up</Text>

      <View className="flex-row items-center bg-white w-3/4 p-4 mb-4 rounded-lg shadow">
      <Icon name="user" size={20} color="#999" className="mr-3 ml-3" />

        <TextInput
          placeholder="Enter your full name"
          value={username}
          onChangeText={setUsername}
          className="flex-1 border-l-2 border-gray-300 ml-2 pl-2"
          placeholderTextColor="#999"
        />
      </View>
      <View className="flex-row items-center bg-white w-3/4 p-4 mb-4 rounded-lg shadow">
      <Icon name="envelope" size={20} color="#999" className="mr-3 ml-3" />

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
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
        <Button title="Sign Up" onPress={handleSignUp} color="red" />
      </View>
      <View className="flex my-5 flex-row">
        <Text className="text-red-500 text-sm">if you have an account you can</Text>
        <Link href={'/(auth)/signIn'} className='text-red-500 px-3'><Text className="text-white px-4 underline underline-offset-2">signin here</Text></Link>
      </View>
      <StatusBar barStyle="light-content" backgroundColor={'red'}/>

    </View>
  );
};

export default SignUp;
