import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import * as Sharing from 'expo-sharing';

export const saveExcelFile = async (data, fileName) => {
  try {
    // Create an Excel worksheet from the array of objects
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // Convert the workbook to binary and then to base64 format
    const excelBinary = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    const base64Excel = Buffer.from(excelBinary, 'binary').toString('base64');

    // Save the file to the device's document directory
    const documentDirectory = FileSystem.documentDirectory;
    const newFileUri = documentDirectory + fileName;
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

// Example usage
const data = [
    {
        student_school_id: "12345",
        name: "John Doe",
        section: "A",
        department: "Science",
        qr_code: "sample_qr_code",
        attendanceCount: 10
    },
    {
        student_school_id: "67890",
        name: "Jane Smith",
        section: "A",
        department: "Math",
        qr_code: "another_qr_code",
        attendanceCount: 8
    },
    // Additional student objects...
];

// Call the function to save and share the file
saveExcelFile(data, 'students_with_attendance.xlsx');
