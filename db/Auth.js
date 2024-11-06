import { supabase } from "./supaconfigration";

export async function registerAndAssignStudents(teacherId, students) {
    try {
        // Extract unique student school IDs
        const studentSchoolIds = students.map(student => student.student_school_id);

        // Step 1: Retrieve existing students from the Students table
        const { data: existingStudents, error: existingStudentsError } = await supabase
            .from('Students')
            .select('*')
            .in('student_school_id', studentSchoolIds);

        if (existingStudentsError) throw existingStudentsError;

        // Map existing students by student_school_id for quick lookup
        const existingStudentMap = new Map(existingStudents.map(student => [student.student_school_id, student]));

        // Step 2: Register students that are not in the Students table
        const newStudentsData = students.filter(student => !existingStudentMap.has(student.student_school_id));
        const { data: newStudents, error: newStudentsError } = await supabase
            .from('Students')
            .insert(newStudentsData)
            .select('*');

        if (newStudentsError) throw newStudentsError;

        // Combine existing and newly created students
        const allStudents = [...existingStudents, ...newStudents];

        // Step 3: Retrieve existing assignments for this teacher
        const { data: existingAssignments, error: existingAssignmentsError } = await supabase
            .from('Teacher_Student_Assignments')
            .select('student_id')
            .eq('teacher_id', teacherId)
            .in('student_id', allStudents.map(student => student.student_id));

        if (existingAssignmentsError) throw existingAssignmentsError;

        // Map existing assignments by student_id for quick lookup
        const existingAssignmentSet = new Set(existingAssignments.map(assignment => assignment.student_id));

        // Step 4: Prepare new assignments data for students not already assigned
        const newAssignmentsData = allStudents
            .filter(student => !existingAssignmentSet.has(student.student_id))
            .map(student => ({
                teacher_id: teacherId,
                student_id: student.student_id,
            }));

        // Insert new assignments
        const { error: newAssignmentsError } = await supabase
            .from('Teacher_Student_Assignments')
            .insert(newAssignmentsData);

        if (newAssignmentsError) throw newAssignmentsError;

        return {
            message: 'Students registered and assigned successfully',
            newRegistrations: newStudents.length,
            newAssignments: newAssignmentsData.length,
        };
    } catch (error) {
        console.error("Error registering and assigning students:", error);
        throw new Error("Could not register and assign students");
    }
}



export async function recordStudentAttendance(teacherId, qrCode) {
  try {
      // Step 1: Find the student by QR code
      const { data: student, error: studentError } = await supabase
          .from('Students')
          .select('student_id')
          .eq('qr_code', qrCode)
          .single();

      // Check if there was an error or if the student was not found
      if (studentError || !student) {
          throw new Error("Student not found with the provided QR code");
      }

      console.log("Fetched Student ID:", student.student_id); // Log student ID

      // Step 2: Check if the student is assigned to the teacher
      const { data: assignment, error: assignmentError } = await supabase
          .from('Teacher_Student_Assignments')
          .select('teacher_id')
          .eq('teacher_id', teacherId)
          .eq('student_id', student.student_id)
          .single();

      if (assignmentError || !assignment) {
          throw new Error("Student is not assigned to this teacher");
      }

      // Step 3: Prepare the attendance record
      const currentDate = new Date(); // Current date and time
      const attendanceRecord = {
          teacher_id: teacherId,
          student_id: student.student_id, // Ensure this ID is valid
          date: currentDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
          time: currentDate.toTimeString().split(' ')[0], // Format: HH:mm:ss
          status:'Present' 
      };

      console.log("Attendance Record:", attendanceRecord); // Log attendance record

      // Step 4: Record the attendance in the Attendance table
      const { error: insertError } = await supabase
          .from('Attendance')
          .insert([attendanceRecord]);

      if (insertError) {
          throw new Error("Error recording attendance: " + insertError.message);
      }

      console.log("Attendance recorded successfully");
      return attendanceRecord;

  } catch (error) {
      console.error("Error recording attendance:", error);
      throw new Error(error.message || "Could not record attendance");
  }
}


export async function registerAndAssignStudent(teacherId, studentInfo) {
  try {
     

      // Step 1: Check if the student already exists in the Students table
      const { data: student, error: studentError } = await supabase
          .from('Students')
          .select('student_id')
          .eq('qr_code', studentInfo.qr_code)
          .single(); // Fetch only one record

      // Step 2: If the student doesn't exist, create a new student
      let registeredStudent;
      if (studentError || !student) {
          const { data: newStudent, error: newStudentError } = await supabase
              .from('Students')
              .insert([{
                  student_school_id: studentInfo.studentSchoolId,
                  name: studentInfo.fullName,
                  section: studentInfo.section,
                  department: studentInfo.department,
                  qr_code: studentInfo.qrCode,
                  course_code: studentInfo.courseCode // Include course_code
              }])
              .select(); // Fetch the newly created student

          if (newStudentError) {
              throw new Error("Error registering new student: " + newStudentError.message);
          }

          registeredStudent = newStudent[0]; // Get the first student in the array
          console.log("New student registered:", registeredStudent);
      } else {
          registeredStudent = student; // Student already exists
          console.log("Student already registered:", registeredStudent);
      }

      // Step 3: Check if the student is already assigned to the teacher
      const { data: existingAssignment, error: assignmentError } = await supabase
          .from('Teacher_Student_Assignments')
          .select('assignment_id') // Fetch assignment_id for checking
          .eq('teacher_id', teacherId)
          .eq('student_id', registeredStudent.student_id)
          .single();
       console.log(registeredStudent.student_id)
      // Step 4: If not assigned, create an assignment for the teacher
      if (assignmentError || !existingAssignment) {
          const { error: createAssignmentError } = await supabase
              .from('Teacher_Student_Assignments')
              .insert([{
                  teacher_id: teacherId,
                  student_id: registeredStudent.student_id
              }]);

          if (createAssignmentError) {
              throw new Error("Error assigning student to teacher: " + createAssignmentError.message);
          }

          console.log("Student assigned to teacher successfully");
      } else {
          console.log("Student is already assigned to this teacher");
      }

      return registeredStudent; // Return the student object (new or existing)

  } catch (error) {
      console.error("Error registering or assigning student:", error);
      throw new Error(error.message || "Could not register or assign student");
  }
}


export async function getStudentInfoByQRCode(teacherId, qrCode) {
    try {
        // Step 1: Find the student by QR code
        const { data: student, error: studentError } = await supabase
            .from('Students')
            .select('student_id, student_school_id, name, section, department, qr_code')
            .eq('qr_code', qrCode)
            .single();
   
        if (studentError || !student) {
            throw new Error("Student not found with the provided QR code");
        }
        console.log("################3",student)

        // Step 2: Check if the student is assigned to the teacher
        const { data: assignment, error: assignmentError } = await supabase
            .from('Teacher_Student_Assignments')
            .select('student_id')
            .eq('teacher_id', teacherId)
            .eq('student_id', student.student_id)
            .single();

        if (assignmentError || !assignment) {
            throw new Error("Student is not assigned to this teacher");
        }

        console.log("***************", assignment)
        // Step 3: Retrieve the student's attendance records with this teacher
        const { data: attendanceRecords, error: attendanceError } = await supabase
            .from('Attendance')
            .select('date, time, status')
            .eq('teacher_id', teacherId)
            .eq('student_id', student.student_id);

        if (attendanceError) {
            throw new Error("Error retrieving attendance records");
        }

        const data =  {
            studentInfo: student,        // Basic information about the student
            attendance: attendanceRecords // Attendance records with this teacher
        };
        console.log(data);
        // Step 4: Combine the student information with their attendance records
        return data

    } catch (error) {
        console.error("Error retrieving student information:", error.message);
        throw new Error(error.message || "Could not retrieve student information");
    }
}

export async function getStudentInfoByStudent_id(teacherId, studentSchoolId) {
    try {
        // Step 1: Find the student by QR code
        const { data: student, error: studentError } = await supabase
            .from('Students')
            .select('student_id, student_school_id, name, section, department, qr_code')
            .eq('student_school_id', studentSchoolId)
            .single();

        if (studentError || !student) {
            throw new Error("Student not found with the provided QR code");
        }
        console.log(student)

        // Step 2: Check if the student is assigned to the teacher
        const { data: assignment, error: assignmentError } = await supabase
            .from('Teacher_Student_Assignments')
            .select('student_id')
            .eq('teacher_id', teacherId)
            .eq('student_id', student.student_id)
            .single();
        if (assignmentError || !assignment) {
            throw new Error("Student is not assigned to this teacher");
        }

        console.log("///////////////////",assignment)
        // Step 3: Retrieve the student's attendance records with this teacher
        const { data: attendanceRecords, error: attendanceError } = await supabase
            .from('Attendance')
            .select('date, time, status')
            .eq('teacher_id', teacherId)
            .eq('student_id', student.student_id);

        if (attendanceError) {
            throw new Error("Error retrieving attendance records");
        }
        console.log("object")
        console.log("************************************",attendanceRecords)
        const data = {
            studentInfo: student,        
            attendance: attendanceRecords // Attendance records with this teacher
        };
        // Step 4: Combine the student information with their attendance records
        console.log("********",data);
        return data;

    } catch (error) {
        console.error("Error retrieving student information:", error.message);
        throw new Error(error.message || "Could not retrieve student information");
    }
}



export async function getAssignedStudentsWithAttendance(teacherId, section,courseCode) {
    try {
        // Step 1: Retrieve students assigned to the teacher in the specified section
        const { data: assignedStudents, error: assignedStudentsError } = await supabase
            .from('Teacher_Student_Assignments')
            .select(`
                student_id,
                Students (
                    student_school_id,
                    name,
                    section,
                    department,
                    qr_code,
                    course_code
                )
            `)
            .eq('teacher_id', teacherId)
            .eq('Students.section', section)
            .eq('Students.course_code', courseCode);

        if (assignedStudentsError) {
            throw assignedStudentsError;
        }

        // Extract student IDs for attendance querying
        const studentIds = assignedStudents.map((record) => record.student_id);

        // Step 2: Count attendance for each student
        const { data: attendanceCounts, error: attendanceCountsError } = await supabase
            .from('Attendance')
            .select(`
                student_id,
                count:attendance_id
            `, { count: 'exact' })
            .eq('teacher_id', teacherId)
            .in('student_id', studentIds)
            .group('student_id');

        if (attendanceCountsError) {
            throw attendanceCountsError;
        }

        // Create a map for attendance counts
        const attendanceMap = attendanceCounts.reduce((map, attendance) => {
            map[attendance.student_id] = attendance.count;
            return map;
        }, {});

        // Map attendance counts to the assigned students
        const studentsWithAttendance = assignedStudents.map((record) => ({
            ...record.Students,
            attendanceCount: attendanceMap[record.student_id] || 0
        }));

        return studentsWithAttendance;
    } catch (error) {
        console.error("Error retrieving assigned students with attendance:", error);
        throw new Error("Could not retrieve assigned students with attendance");
    }
}
