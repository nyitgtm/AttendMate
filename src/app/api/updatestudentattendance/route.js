import { MongoClient } from 'mongodb';

export async function POST(req) {
    try {
        // Parse the request body
        const { studentId, classId, date, status, points } = await req.json();

        // Connect to the database
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db('attendmate');

        // Parse the date for matching
        const dateRegex = new RegExp(`^${date.slice(0, 10)}`); // Match only the first 10 characters (YYYY-MM-DD)

        console.log('Query Inputs:', { studentId, classId, date, status, points });

        // Find the student by studentId
        const student = await db.collection('students').findOne({
            studentId: studentId,
            'classes.classId': classId,
        });

        // Check if student is found
        if (!student) {
            return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
        }

        // Find the class index within the classes array
        const classIndex = student.classes.findIndex(cls => cls.classId === classId);
        if (classIndex === -1) {
            return new Response(JSON.stringify({ message: 'Class not found in student record' }), { status: 404 });
        }

        // Find the attendance index within the selected class's attendance array
        const attendanceIndex = student.classes[classIndex].attendance.findIndex(att => {
            const attendanceDate = new Date(att.scheduledTime).toISOString().slice(0, 10);
            return attendanceDate === date.slice(0, 10); // Compare only the date part (YYYY-MM-DD)
        });

        // If the attendance record is not found, create a new one
        if (attendanceIndex === -1) {
            const newAttendance = {
                scheduledTime: new Date(date),
                status: status,
                points: points,
                checkInTime: new Date()
            };
            student.classes[classIndex].attendance = [...student.classes[classIndex].attendance, newAttendance];
        } else {
            // Update the attendance status and points
            student.classes[classIndex].attendance[attendanceIndex].status = status;
            student.classes[classIndex].attendance[attendanceIndex].points = points;
            student.classes[classIndex].attendance[attendanceIndex].checkInTime = new Date();
        }

        // Save the updated student record
        const result = await db.collection('students').updateOne(
            { studentId: studentId },
            { $set: { 'classes': student.classes } } // Update the entire 'classes' array with the modified class
        );

        client.close();

        if (result.modifiedCount === 0) {
            return new Response(JSON.stringify({ message: 'Failed to update attendance' }), { status: 500 });
        }

        return new Response(JSON.stringify({ message: 'Attendance updated successfully' }), { status: 200 });

    } catch (error) {
        console.error('Error in API route:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}
