import { UUID } from "mongodb";

export default class DigitalWorkoutPlan {
    constructor(accountId) {
        this.uuid = new UUID();
        this.accountId = accountId;
        this.studentName = "";
        this.start = "";
        this.end = "";
        this.instructors = [];
        this.pagesCompleted = 0;
        this.topics = [];
        this.sessionNote = "";
        this.centerNote = "";
        this.assessment = "";
    }

    importDWP(dwp_report) {
        this.studentName = dwp_report["Student Name"];
        this.start = dwp_report["Session"].split(";  ")[1].split(": ")[1];
        this.end = dwp_report["Session"].split(";  ")[2].split(": ")[1];
        this.instructors.push(dwp_report["Session"].split(";  ")[3].split(": ")[1].split(", "));
    }
}