import { MongoClient } from 'mongodb';

export async function POST(req) {
    const { studentId } = await req.json();

    let client;

    try {
        client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db('attendmate');

        // Find the student by studentId
        const student = await db.collection('students').findOne({
            studentId: studentId
        });

        // Check if student is found
        if (!student) {
            return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
        }

        // Convert MongoDB's native types to normal types (e.g., `points` from `$numberInt`)
        const points = student.points.$numberInt ? parseInt(student.points.$numberInt) : student.points;
        const classes = student.classes.map((classData) => ({
            classId: classData.classId,
            classPoints: classData.classPoints.$numberInt ? parseInt(classData.classPoints.$numberInt) : classData.classPoints,
            attendance: classData.attendance.map((attendanceRecord) => {
                // Correctly format the scheduledTime and checkInTime if they are in MongoDB's $date format
                const scheduledTime = attendanceRecord.scheduledTime?.$date
                    ? new Date(attendanceRecord.scheduledTime.$date).toISOString()
                    : new Date(attendanceRecord.scheduledTime).toISOString();
                const checkInTime = attendanceRecord.checkInTime?.$date
                    ? new Date(attendanceRecord.checkInTime.$date).toISOString()
                    : attendanceRecord.checkInTime
                    ? new Date(attendanceRecord.checkInTime).toISOString()
                    : null;

                return {
                    ...attendanceRecord,
                    scheduledTime,
                    checkInTime,
                    points: attendanceRecord.points.$numberInt ? parseInt(attendanceRecord.points.$numberInt) : attendanceRecord.points
                };
            }),
        }));

        // Successful response with student data
        return new Response(JSON.stringify({
            message: 'Student found',
            studentId: student.studentId,
            studentName: student.studentName,
            studentEmail: student.studentEmail,
            macAddress: student.macAddress,
            points,
            classes
        }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    } finally {
        if (client) {
            client.close();
        }
    }
}
