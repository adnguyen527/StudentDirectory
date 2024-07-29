import { UUID } from "mongodb";
import DigitalWorkoutPlan from "../DWP Reports/DigitalWorkoutPlan.js";
import Attendance from "../Attendance Reports/Attendance.js";

export default class Student {
    constructor(accountId, firstName, lastName) {
        this.uid = new UUID();
        this.accountId = accountId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.center = "";
        this.grade = "";
        this.schoolYear = "24-25";
        this.enrollmentStatus = "";
        this.stayLength = "";
        this.level = 0;
        this.birthday = "";
        this.age = 0;
        this.lastAttendance = "";
        this.lastAssessment = "";
        this.lastLPUpdate = "";
        this.attendanceRecords = [];
        this.dwpReports = [];
        this.lastModified = new Date();
    }

    // set relevant enrollment data
    importEnrollmentReport(enrollment_report) {
        this.center = enrollment_report["Center"]; // "Southlake"
        this.grade = enrollment_report["Grade"]; // 5 or PreK
        this.enrollmentStatus = enrollment_report["Status"]; // "Enrolled"
        this.stayLength = enrollment_report["Enrollment Length of Stay"];
        this.level = this.setLevel();
    }

    // set relevant student report data
    importStudentReport(student_report) {
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
    setSchoolYear(schoolYear) {
        this.schoolYear = schoolYear;
    }

    // format: mm/dd/yyyy
    importBirthdayReport(birthday_report) {
        if (birthday_report) {
            this.setBirthday(birthday_report["Birthday"]);
        }
    }

    setBirthday(birthday) {
        this.birthday = birthday;
        this.age = this.getAge();
    }

    // get age based on birthday string
    getAge() {
        const [month, day, year] = this.birthday.split("/").map(Number);
        const birthdate = new Date(year, month - 1, day);
        const today = new Date();

        // Calculate the age
        let age = today.getFullYear() - birthdate.getFullYear();

        // Check if the current date is before the birthday this year, and adjust the age if necessary
        const currentMonth = today.getMonth();
        const currentDate = today.getDate();
        if (
            currentMonth < month - 1 ||
            (currentMonth === month - 1 && currentDate < day)
        ) {
            age--;
        }

        return age;
    }

    // calc and set current level
    setLevel() {
        let months = parseFloat(doc["Student Length of Stay"].split(" ")[0]);
        var level = 1;
        if (months >= 4) level = 2;
        if (months >= 10) level += Math.floor((months - 4) / 6);
        return level;
    }
}
