import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StatusBar, TouchableOpacity } from 'react-native';
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
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");

        if (token) {
          router.push("/attendance");
        }
      } catch (err) {
        console.log("error message", err);
      }
    };
    checkLoginStatus();
  }, []);

  const handleSignUp = async () => {
    setError("");
    if (!email || !password || !username) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return { error: error.message };
      }

      const userId = data.user.id;
      const accessToken = data.session?.access_token;
      const userEmail = data.user.email;
      console.log("userId: ", userId);
      console.log("accessToken: ", accessToken);
      await AsyncStorage.setItem("userId", userId);
      console.log("userEmail: ", userEmail);
      const { data: teacherData, error: teacherError } = await supabase
        .from('Teachers')
        .insert([{ id: userId, email: email, name: username, auth_id: userId }]);

      if (teacherError) {
        console.error('Error adding teacher:', teacherError);
        return;
      }

      console.log('Teacher added successfully:', teacherData);

      if (accessToken) {
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('userId', userId);
        await AsyncStorage.setItem('userEmail', userEmail);
      }

      router.push('/attendance');

      return { user: data.user };
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-Red text-3xl font-semibold mb-6">Sign Up</Text>

      <View className="flex-row items-center bg-white border-2 border-red-600 w-3/4 p-4 mb-4 rounded-lg shadow">
        <Icon name="user" size={20} color="#999" className="mr-3 ml-3" />

        <TextInput
          placeholder="Enter your full name"
          value={username}
          onChangeText={setUsername}
          className="flex-1 border-l-2 border-gray-300 ml-2 pl-2"
          placeholderTextColor="#999"
        />
      </View>
      <View className="flex-row items-center bg-white border-2 border-red-600 w-3/4 p-4 mb-4 rounded-lg shadow">
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

      <View className="flex-row items-center bg-white border-2 border-red-600 w-3/4 p-4 mb-6 rounded-lg shadow">
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
          <Text className="text-red text-sm">{error}</Text>
        </View>
      )}
      <View className="w-3/4">
        <Button title="Sign Up" onPress={handleSignUp} color="red" />
      </View>
      <View className="flex my-5 flex-row">
        <Text className="text-gray-500 text-sm">if you have an account you can</Text>
        <Link href={'/(auth)/signIn'} className='text-red-500 px-3'>
          <Text className="text-blue-500 px-4 underline underline-offset-2">sign in here</Text>
        </Link>
      </View>
      <StatusBar barStyle="light-content" backgroundColor={'red'} />
    </View>
  );
};

export default SignUp;
