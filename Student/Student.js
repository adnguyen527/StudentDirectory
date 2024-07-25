import { UUID } from "mongodb";
import DigitalWorkoutPlan from "../DWP Reports/DigitalWorkoutPlan.js";
import Attendance from "../Attendance Reports/Attendance.js";

export default class Student {
    constructor(studentName) {
        this.uid = new UUID();
        this.accountId = "";
        this.studentName = studentName;
        this.center = "";
        this.grade = "";
        this.schoolYear = "24-25";
        this.enrollmentStatus = "";
        this.birthday = "";
        this.lastAttendance = "";
        this.lastAssessment = "";
        this.lastLPUpdate = "";
        this.attendanceRecords = [];
        this.dwpReports = [];
    }

    // set relevant enrollment data
    importEnrollmentReport(enrollment_report) {
        this.center = enrollment_report["Center"]; // "Southlake"
        this.grade = enrollment_report["Grade"]; // 5 or PreK
        this.enrollmentStatus = enrollment_report["Status"]; // "Enrolled"
    }

    // set relevant student report data
    importStudentReport(student_report) {
        this.accountId = student_report["Account Id"];
        this.lastAttendance = student_report["Last Attendance"];
        this.lastAssessment = student_report["Last Assessment"];
        this.lastLPUpdate = student_report["Last LP Update"];
    }

    // parameter dwp object
    addDWPReports(dwp_reports) {
        for (const report of dwp_reports) {
            const dwop = new DigitalWorkoutPlan();
            dwop.importReport(report);
            this.dwpReports.push(dwop);
        }
    }

    // parameter attendance object
    addAttendances(attendance_reports) {
        for (const report of attendance_reports) {
            const attendance = new Attendance();
            attendance.importReport(report);
            this.attendanceRecords.push(attendance);
        }
    }

    // format: 24-25
    static setSchoolear(schoolYear) {
        this.schoolYear = schoolYear;
    }

    // format: mm/dd/yyyy
    static setBirthday(birthday) {
        this.birthday = birthday;
    }
}
