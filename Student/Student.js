import { UUID } from "mongodb";

export default class Student {
    constructor(accountId) {
        this.uid = new UUID();
        this.accountId = accountId;
        this.firstName = "";
        this.lastName = "";
        this.center = "";
        this.grade = "";
        this.schoolYear = "";
        this.enrollmentStatus = "";
        this.birthday = "";
        this.attendanceRecords = [];
    }

    // constructor(accountId, firstName, lastName, center, grade, schoolYear, enrollmentStatus, birthday, attendanceRecords) {
    //     this.uid = new UUID();
    //     this.accountId = accountId;
    //     this.firstName = firstName;
    //     this.lastName = lastName;
    //     this.center = center;
    //     this.grade = grade;
    //     this.schoolYear = schoolYear;
    //     this.enrollmentStatus = enrollmentStatus;
    //     this.birthday = birthday;
    //     this.attendanceRecords = attendanceRecords;
    // }

    static addAttendances(attendances) {
        this.attendanceRecords.push.apply(this.attendanceRecords, attendances);
    }
}