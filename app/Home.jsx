
import React, { useContext } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { AttendanceContext } from '../hook/context';

const StudentAttendance = () => {
  const {singleInfoData , setSingleInfodata} = useContext(AttendanceContext)
  const {studentInfo, attendance} = singleInfoData


  return (
    <View className="flex-1 p-4 bg-white">
      <ScrollView 
       showsVerticalScrollIndicator={false}
       >
      {/* Student Information Section */}
      <View className="mb-4 p-4 bg-blue-500 rounded-lg">
        <Text className="text-lg font-semibold text-white">Student Information</Text>
        <Text className="text-sm text-gray-200">Name: {studentInfo?.name}</Text>
        <Text className="text-sm text-gray-200">Department: {studentInfo?.department}</Text>
        <Text className="text-sm text-gray-200">Section: {studentInfo?.section}</Text>
        <Text className="text-sm text-gray-200">School ID: {studentInfo?.student_school_id}</Text>
        <Text className="text-sm text-gray-200">QR Code: {studentInfo?.qr_code}</Text>
      </View>

      {/* Attendance Records Section */}
      <View className="mt-4">
        <Text className="text-lg font-semibold text-blue-500">Attendance Records</Text>
        <Text className="text-lg font-semibold text-blue-500">Total: {attendance?.length}</Text>
        <ScrollView className="mt-2">
          {attendance?.map((record, index) => (
            <View key={index} className="p-4 mb-2 bg-gray-200 rounded-lg">
              <Text className="text-sm text-gray-800">Date: {record.date}</Text>
              <Text className="text-sm text-gray-800">Status: {record.status}</Text>
              <Text className="text-sm text-gray-800">Time: {record.time}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
      </ScrollView>
    </View>
  );
};

export default StudentAttendance;
