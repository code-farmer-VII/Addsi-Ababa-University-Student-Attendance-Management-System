import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StatusBar, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from '../../db/supaconfigration';

const SignIn = () => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to control password visibility

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          router.push("/attendance");
        }
      } catch (err) {
        console.log("Error checking login status:", err);
      }
    };
    checkLoginStatus();
  }, []);

  const handleSignIn = async () => {
    setError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        const { session } = data;
        const userId = session.user.id;
        const accessToken = session.access_token;
        const userEmail = session.user.email;

        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("userId", userId);
        await AsyncStorage.setItem("userEmail", userEmail);

        router.push('/attendance');
      }
    } catch (error) {
      console.error("An error occurred:", error);
      setError(error.message);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-blue-600 text-3xl font-semibold mb-6">Sign In</Text>

      <View className="flex-row items-center bg-white border-2 border-blue-600 w-3/4 p-4 mb-4 rounded-lg shadow">
        <Icon name="envelope" size={20} color="#999" className="mr-3 ml-3" />
        <TextInput
          placeholder="Enter your email" 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none"
          className="flex-1 border-l-2 border-gray-300 ml-2 pl-2 text-black"
          placeholderTextColor="#999"
        />
      </View>

      <View className="flex-row items-center bg-white border-2 border-blue-600 w-3/4 p-4 mb-6 rounded-lg shadow">
        <Icon name="lock" size={20} color="#999" className="mr-3 ml-3" />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          className="flex-1 border-l-2 border-gray-300 ml-2 pl-2"
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? "eye" : "eye-slash"} size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {error && (
        <View> 
          <Text className="text-red-500 text-sm">{error}</Text>
        </View>
      )}

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
            <Text className="text-gray-500 px-4 underline underline-offset-2">sign up here</Text>
          </Link>
        </Text>
      </View>

      <StatusBar barStyle="light-content" backgroundColor={'blue'} />
    </View>
  );
};

export default SignIn;
