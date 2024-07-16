import { convertToDate } from "../scripts/convertToDate.js";

class Attendance {

    constructor(document) {
        this.accountId = document['Account Id'];
        this.attendanceDate = convertToDate(document['Attendance Date']);
        this.firstName = document['First Name'];
        this.lastName = document['Last Name'];
        this.arrivalTime = document['Arrival Time'];
        this.departureTime = document['Departure Time'];
        this.durationMinutes = document['Duration (Minutes)'];
        this.center = document['Center'];
    }
}
export {Attendance};