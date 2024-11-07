import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import * as Sharing from 'expo-sharing';
import { Buffer } from 'buffer';

export const saveExcelFile = async (data, fileName) => {
  try {
    // Create an Excel worksheet from the array of objects
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // Convert the workbook to binary and then to base64 format
    const excelBinary = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    const base64Excel = Buffer.from(excelBinary, 'binary').toString('base64');

    // Ensure that the file name is valid and simple
    const sanitizedFileName = fileName.replace(/[^\w\s.-]/g, '') + '.xlsx';

    // Save the file to the device's document directory
    const documentDirectory = FileSystem.documentDirectory;
    const newFileUri = documentDirectory + sanitizedFileName;

    console.log("Saving file at path: ", newFileUri); // Debugging log

    await FileSystem.writeAsStringAsync(newFileUri, base64Excel, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('File saved at:', newFileUri);

    // Share the file after saving
    await shareFile(newFileUri);
  } catch (error) {
    console.error('Error saving or sharing file:', error);
  }
};

const shareFile = async (fileUri) => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri);
      console.log('File shared successfully.');
    } else {
      console.error('Sharing is not available on this device.');
    }
  } catch (error) {
    console.error('Error sharing file:', error);
  }
};
