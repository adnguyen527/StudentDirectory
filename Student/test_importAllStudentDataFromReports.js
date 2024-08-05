import { MongoClient } from "mongodb";
import { uri } from "../mongo_url.js";
import Student from "./Student.js";

async function main() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("StudentDirectory");
        const collStudent = db.collection("student_reports");
        const collEnrollment = db.collection("enrollment_reports");
        const collDWP = db.collection("dwp_reports");
        const collAttendance = db.collection("attendance_reports");

        // test subject hehe
        const firstName = "Itash";
        const lastName = "Shukla";
        const studentName = `${firstName} ${lastName}`;

        // get all the report documents
        const student_report = await collStudent.findOne({
            "Student Name": studentName,
        });
        const queryEnrollment = {
            "Student First Name": firstName,
            "Student Last Name": lastName,
        };
        const enrollment_report = await collEnrollment.findOne(queryEnrollment);
        const dwp_reports = await collDWP
            .find({
                "Student Name": studentName,
            })
            .toArray();
        const queryAttendance = {
            "First Name": firstName,
            "Last Name": lastName,
        };
        const attendance_reports = await collAttendance
            .find(queryAttendance)
            .toArray();

        // import all the data into student object
        const student = new Student(studentName);
        student.importEnrollmentReport(enrollment_report);
        student.importStudentReport(student_report);
        student.addDWPReports(dwp_reports);
        student.addAttendances(attendance_reports);
        console.log(student);

        // add to student collection
        // const studentMaster = db.collection("students");
        // await studentMaster.insertOne(student);
        // console.log(
        //     `${student.studentName} has been inserted into students collection`
        // );
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }
}
main().catch(console.error);
