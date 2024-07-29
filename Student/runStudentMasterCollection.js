import { MongoClient } from "mongodb";
import { uri } from "../mongo_url.js";
import Student from "./Student.js";

const ignore_memberships = ["* ISEE Boot Camp (Private Sessions Package)"];

async function importAllStudentDataToCollection() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("StudentDirectory");
        const studentMaster = db.collection("students");

        // access student report collection
        const coll_student_reports = await db.collection("student_reports");
        const coll_attendance = db.collection("attendance_reports");
        const coll_dwp = db.collection("dwp_reports");
        const coll_enrollment = db.collection("enrollment_reports");
        const coll_birthday = db.collection("birthday_reports");

        // iterate through enrollment reports and import each report into respective student or create new
        var insertCount = 0;
        var updateCount = 0;
        for await (const doc of await coll_enrollment.find().toArray()) {
            if (!ignore_memberships.includes(doc["Membership Type"])) {
                const firstName = doc["Student First Name"];
                const lastName = doc["Student Last Name"];
                const accountId = doc["Account Id"];
                if (
                    !(await studentExists(
                        studentMaster,
                        accountId,
                        firstName,
                        lastName
                    ))
                ) {
                    // new student
                    insertCount++;
                    await addStudent(accountId, firstName, lastName);
                } else {
                    // update existing student
                    updateCount++;
                    await updateStudent(accountId, firstName, lastName);
                }
            }
        }

        console.log(`${insertCount} students inserted.`);
        console.log(`${updateCount} students updated.`);

        // HELPER FUNCTIONS

        async function updateStudent(accountId, firstName, lastName) {
            const student = new Student(accountId, firstName, lastName);
            console.log(`${firstName}_${lastName} is being updated.`);
            await importReports(student);
            await studentMaster.updateOne(
                {
                    accountId: accountId,
                    firstName: firstName,
                    lastName: lastName,
                },
                {
                    $set: {
                        center: student.center,
                        grade: student.grade,
                        schoolYear: student.schoolYear,
                        enrollmentStatus: student.enrollmentStatus,
                        birthday: student.birthday,
                        age: student.age,
                        lastAttendance: student.lastAttendance,
                        lastAssessment: student.lastAssessment,
                        lastLPUpdate: student.lastLPUpdate,
                        attendanceRecords: student.attendanceRecords,
                        dwpReports: student.dwpReports,
                        lastModified: student.lastModified,
                    },
                }
            );
        }

        async function addStudent(accountId, firstName, lastName) {
            const student = new Student(accountId, firstName, lastName);
            console.log(`${firstName}_${lastName} is being added.`);
            await importReports(student);
            await studentMaster.insertOne(student);
        }

        async function importReports(student) {
            const studentName = student.firstName + " " + student.lastName;
            // student report
            var query = {
                "Account Id": student.accountId,
                "Student Name": studentName,
            };
            const student_report = await coll_student_reports.findOne(query);
            if (student_report) {
                await student.importStudentReport(student_report);
            }

            // attendance report
            query = {
                "Account Id": student.accountId,
                "First Name": student.firstName,
                "Last Name": student.lastName,
            };
            const attendance_reports = await coll_attendance
                .find(query)
                .toArray();
            await student.addAttendances(attendance_reports);

            // dwp report
            query = {
                "Account Id": student.accountId,
                "Student Name": studentName,
            };
            const dwp_reports = await coll_dwp.find(query).toArray();
            await student.addDWPReports(dwp_reports);

            // enrollment report
            query = {
                "Account Id": student.accountId,
                "Student First Name": student.firstName,
                "Student Last Name": student.lastName,
            };
            const enrollment_report = await coll_enrollment.findOne(query);
            await student.importEnrollmentReport(enrollment_report);

            // birthday report
            query = {
                "Account Id": student.accountId,
                "Student First Name": student.firstName,
                "Last Name": student.lastName,
            };
            const birthday_report = await coll_birthday.findOne(query);
            await student.importBirthdayReport(birthday_report);
        }

        // check if student already exists in Student collection by student name and accountId
        async function studentExists(
            studentMaster,
            accountId,
            firstName,
            lastName
        ) {
            const pipeline = [
                {
                    $match: {
                        firstName: firstName,
                        lastName: lastName,
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
            // console.log(firstName + " " + lastName + " " + (result[0] ? true : false));
            return result[0] ? true : false;
        }
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}
importAllStudentDataToCollection();
