export default class Student {
    constructor(accountId, firstName, lastName, center, grade, schoolYear, enrollmentStatus, birthday, attendanceRecords) {
        this.accountId = accountId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.center = center;
        this.grade = grade;
        this.schoolYear = schoolYear;
        this.enrollmentStatus = enrollmentStatus;
        this.birthday = birthday;
        this.attendanceRecords = attendanceRecords;
    }

    static addAttendances(attendances) {
        this.attendanceRecords.push.apply(this.attendanceRecords, attendances);
    }
}