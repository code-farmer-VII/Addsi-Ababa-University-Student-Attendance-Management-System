import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { AttendanceContext } from '../hook/context';
import { PickDocument } from '../xlFileManuplation/DocumentPicker';
import { ReadExcelFile } from '../xlFileManuplation/ReadXlFile';
import { registerAndAssignStudents } from '../db/Auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BottomSheet = ({ visible, onClose }) => {
  const {
    setData,
    setFileName,
    setFileSize,
    setMimeType,
    setFileUri,
    toggleModal
  } = useContext(AttendanceContext);

  const pickDocumentFile = async () => {
    try {
      setData(null);
      setFileName(null);
      setFileSize(null);
      setMimeType(null);  
      setFileUri(null);

      toggleModal();

      const result = await PickDocument();

      if (result && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;

        if (fileUri) {
          console.log("File URI:", fileUri);
          setFileUri(fileUri); // Confirm that setFileUri is accessible

          const data = await ReadExcelFile(fileUri);
          if (data) {
            console.log("Excel file data:", data);
            setData(data);
            setFileName(result.assets[0].name);
            setMimeType(result.assets[0].mimeType);
            setFileSize(result.assets[0].size);

            const userId = await AsyncStorage.getItem("userId");
            if (userId) {
               await registerAndAssignStudents(userId, data)
                .then(Alert.alert("Registration Successful", "Students registered successfully."))
                .catch(error => console.error("Error during registration:", error));

                
            } else {
              console.error("User ID not found in AsyncStorage.");
            }
          } else {
            console.error("Failed to read data from Excel file.");
          }
        } else {
          console.error('No file URI found.');
        }
      } else {
        console.error('No file selected.');
      }
    } catch (error) {
      console.error("Error in pickDocumentFile:", error);
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={{ justifyContent: 'flex-end', margin: 0 }}
    >
      <View className="flex-1 justify-end">
        <View className="bg-white rounded-t-lg p-4 shadow-lg">
          <View className="justify-center items-center p-4 rounded-lg">
            <Text className="text-2xl font-bold mb-4">File Upload Requirements</Text>
            <Text className="text-base mb-1">The file must be an Excel (.xl) file.</Text>
            <Text className="text-base mb-1">The following columns are mandatory:</Text>
            <Text className="text-base mb-1">- ID</Text>
            <Text className="text-base mb-1">- name</Text>
            <Text className="text-base mb-1">- college</Text>
            <Text className="text-base mb-1">- department</Text>
            <Text className="text-base mb-1">- section</Text>
            <Text className="text-base mb-1">- QR code</Text>
          </View>
          <TouchableOpacity onPress={pickDocumentFile} className="bg-blue-600 py-4 px-6 rounded-lg">
            <Text className="text-white text-center">search from device</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

function ModalDisplay() {
  const { isModalVisible, toggleModal } = useContext(AttendanceContext);

  return (
    <View>
      <BottomSheet visible={isModalVisible} onClose={toggleModal} />
    </View>
  );
}

export default ModalDisplay;
