import { UUID } from "mongodb";

export default class Attendance {
    constructor() {
        this.uuid = new UUID();
        this.accountId = "";
        this.studentName = "";
        this.attendanceDate = "";
        this.arrivalTime = "";
        this.departureTime = "";
        this.durationMinutes = 0;
        this.center = "";
    }

    // import relevent attendance data
    importReport(attendance_report) {
        this.accountId = attendance_report["Account Id"];
        this.studentName = `${attendance_report["First Name"]} ${attendance_report["Last Name"]}`;
        this.attendanceDate = attendance_report["Attendance Date"];
        this.arrivalTime = attendance_report["Arrival Time"];
        this.departureTime = attendance_report["Departure Time"];
        this.durationMinutes = attendance_report["Duration (Minutes)"];
        this.center = attendance_report["Center"];
    }

    // return amount of hours attended
    getHours() {
        return this.durationMinutes / 60;
    }
}
