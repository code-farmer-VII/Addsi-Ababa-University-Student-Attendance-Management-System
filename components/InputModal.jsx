import React, {useContext, useState} from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { AttendanceContext } from '../hook/context';
import { router } from 'expo-router';
import { getAssignedStudentsWithAttendance } from '../db/Auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveExcelFile } from '../xlFileManuplation/SaveFile';

export const InputModal=()=>{
    const { isInputModal, toggleInputModal } = useContext(AttendanceContext)
    const [section, setSection] = useState('')
    const [courseCode, setCourseCode] = useState('')


    const RedirectToSection = async () => {
      const userId = await AsyncStorage.getItem("userId");
      const fileName = courseCode + "/`" + setSection ;
        const response = await getAssignedStudentsWithAttendance(userId,section, courseCode)
        if(response){
         await saveExcelFile(response, fileName)
        }
        console.log(userId,section, courseCode)
        router.push("/attendance")
        toggleInputModal()
        }
    return(
    <Modal 
    isVisible={isInputModal}
    onBackdropPress={toggleInputModal}
     >
      <View className="bg-gray-50 p-5 rounded-lg">
        <Text className="text-lg font-bold mb-3">Enter Section</Text>
        <TextInput
          placeholder="Enter section"
          value={section}
          onChangeText={setSection}
          keyboardType="numeric"
          className="mb-4 border-2 px-3 rounded-lg h-12 border-blue-100 text-lg"
        />
        <Text className="text-lg font-bold mb-3">Enter Course code</Text>
        <TextInput
          placeholder="Enter corse code"
          value={courseCode}
          onChangeText={setCourseCode}
          keyboardType="numeric"
          className="mb-4 border-2 px-3 rounded-lg h-12 border-blue-100 text-lg"
        />
        <View className="flex flex-row justify-between space-x-8 mt-6"> 
        <TouchableOpacity onPress={toggleInputModal} className="flex-1">
        <Text className="bg-red-600 font-semibold rounded-md text-lg text-white text-center">cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={RedirectToSection} className="flex-1">
          <Text className="text-white font-semibold rounded-md text-lg bg-blue-600 text-center">Okay</Text>
        </TouchableOpacity>
        </View>
      </View>
    </Modal>
    )
}