import { MongoClient } from 'mongodb';

export async function POST(req) {
    try {
        // Parse the request body
        const { courseId, scheduledTime } = await req.json();

        // Connect to the database
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db('attendmate');

        // Find all students in the course
        const students = await db.collection('students').find({ 'classes.classId': courseId }).toArray();

        // Check if students are found
        if (students.length === 0) {
            return new Response(JSON.stringify({ message: 'No students found in the course' }), { status: 404 });
        }

        // Iterate over each student and add the attendance instance
        for (const student of students) {
            const classIndex = student.classes.findIndex(cls => cls.classId === courseId);
            if (classIndex !== -1) {
                const newAttendance = {
                    scheduledTime: new Date(new Date(scheduledTime).setDate(new Date(scheduledTime).getDate())).toISOString(),
                    checkInTime: null,
                    absent: null,
                    points: 0
                };
                student.classes[classIndex].attendance = [...student.classes[classIndex].attendance, newAttendance];

                // Save the updated student record
                await db.collection('students').updateOne(
                    { studentId: student.studentId },
                    { $set: { 'classes': student.classes } }
                );
            }
        }

        client.close();

        return new Response(JSON.stringify({ message: 'Attendance instances added successfully' }), { status: 200 });

    } catch (error) {
        console.error('Error in API route:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}