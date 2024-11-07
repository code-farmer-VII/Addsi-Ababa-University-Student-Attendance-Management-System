import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import { Buffer } from 'buffer';

export const ReadExcelFile = async (fileUri) => {
    if (!fileUri) {
        alert('No file to read!');
        return;
    }
    try {
        const file = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        const binary = Buffer.from(file, 'base64').toString('binary');
        const workbook = XLSX.read(binary, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Validate the header
        const requiredColumns = ['studentschoolid', 'name', 'department', 'section', 'qrcode', 'coursecode'];
        const header = jsonData[0].map((column) => column.toLowerCase());

        // Check for required columns
        if (!requiredColumns.every((column) => header.includes(column))) {
            alert('The Excel file does not follow the required format. Please ensure the header has the columns: studentSchoolId, name, department, section, qrcode, and courseCode.');
            return;
        }

        // Check for unique columns
        if (header.length !== new Set(header).size) {
            alert('The Excel file has repeated columns in the header. Please make sure the header columns are unique.');
            return;
        }

        // Clean and parse the data
        const cleanedData = jsonData
            .slice(1) // Skip header row
            .map((row) => row.filter((cell) => cell !== null && cell !== undefined && cell !== ''))
            .filter((row) => row.length > 0);

        if (cleanedData.length === 0) {
            alert('No data to insert. Please make sure the Excel file has data rows.');
            return;
        }

        console.log("The file has been read successfully");

        // Map cleaned data to student objects
        const students = cleanedData.map(item => ({
            student_school_id: item[0]?.toString() || '',
            name: item[1] || '',
            department: item[2] || '',
            section: item[3] || '',
            qr_code: item[4] || '',
            course_code: item[5] || '' // Assuming this is at index 5
        }));



        return students;
    } catch (error) {
        console.error('Error reading Excel file:', error);
    }
};
