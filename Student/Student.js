import { UUID } from "mongodb";

export default class Student {
    constructor(accountId) {
        this.uid = new UUID();
        this.accountId = accountId;
        this.firstName = "";
        this.lastName = "";
        this.center = "";
        this.grade = "";
        this.schoolYear = "24-25";
        this.enrollmentStatus = "";
        this.birthday = "";
        this.attendanceRecords = [];
        this.lastAttendance = "";
        this.lastAssessment = "";
        this.dwpReports = [];
    }

    // set relevant enrollment data
    static importEnrollmentReport(enrollment_report) {
        // format: Cindy, Wang - case sensitive for now :3
        this.firstName = enrollment_report["Student First Name"]; 
        this.lastName = enrollment_report["Student Last Name"];
        this.center = enrollment_report["Center"]; // "Southlake"
        this.grade = grade; // 5 or PreK
        this.enrollmentStatus = enrollment_report["Enrollment Status"]; // "Enrolled"
    }

    // set relevant student report data
    static importStudentReport(student_report) {
        this.lastAttendance = student_report["Last Attendance"];
        this.lastAssessment = student_report["Last Assessment"];
    }

    // parameter dwp object
    static addDWPReport(dwp_report) {
        this.dwpReports.push.apply(this.dwpReports, dwp_report);
    }

    // format: 24-25
    static setSchoolYear(schoolYear) {
        this.schoolYear = schoolYear;
    }

    // format: mm/dd/yyyy
    static setBirthday(birthday) {
        this.birthday = birthday;
    }

    // parameter attendance object
    static addAttendances(attendance) {
        this.attendanceRecords.push.apply(this.attendanceRecords, attendance);
    }
}