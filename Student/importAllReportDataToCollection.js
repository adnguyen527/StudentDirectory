import { MongoClient } from "mongodb";
import { uri } from "../mongo_url.js";
import Student from "./Student.js";

async function importAllStudentDataToCollection() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("StudentDirectory");
        const studentMaster = db.collection("students");

        // access every report collection
        const coll_attendance = db.collection("attendance_reports");
        const coll_dwp = db.collection("dwp_reports");
        const coll_enrollment = db.collection("enrollment_reports");
        const coll_student_reports = db.collection("student_reports");

        // iterate through student reports and import each report into respective student
        var insertCount = 0;
        var updateCount = 0;
        for (const doc of coll_student_reports) {
            const studentName = doc["Student Name"];
            const accountId = doc["Account Id"];
            const student = new Student(accountId, studentName);
            if (!studentExists(accountId, studentName)) {
                // new student
                insertCount++;
            } else {
                // update existing student
                updateCount++;
            }
        }
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }

    // check if student already exists in Student collection by student name and accountId
    async function studentExists(accountId, studentName) {
        const pipeline = [
            {
                $match: {
                    studentName: studentName,
                    accountId: accountId,
                },
            },
            {
                $count: "count",
            },
            {
                $project: {
                    exists: {
                        $gt: ["$count", 0],
                    },
                },
            },
        ];
        const result = await studentMaster.aggregate(pipeline).toArray();
        return result["exists"];
    }
}
importAllStudentDataToCollection();
