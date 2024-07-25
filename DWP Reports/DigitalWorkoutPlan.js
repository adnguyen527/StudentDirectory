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
        this.start = getStartTime(dwp_report);
        this.end = getEndTime(dwp_report);
        this.instructors = getInstructors(dwp_report);
        this.pagesCompleted = getPagesCompleted(dwp_report);
        this.topics = getTopics(dwp_report);
        this.sessionNote = getSessionNote(dwp_report);
        this.centerNote = getCenterNote(dwp_report);
        this.assessment = dwp_report["Assessment"];

        function getStartTime(dwp_report) {
            return dwp_report["Session"].split(";  ")[1].split(": ")[1];
        }
        function getEndTime(dwp_report) {
            return dwp_report["Session"].split(";  ")[2].split(": ")[1];
        }
        function getInstructors(dwp_report) {
            return dwp_report["Session"].split(";  ")[3].split(": ")[1].split(", ");
        }
        function getPagesCompleted(dwp_report) {
            return parseInt(dwp_report["General Information"].split(";  ")[1].split(": ")[1]);
        }
        function getTopics(dwp_report) {
            return dwp_report["LP Assignment"].split(";  ");
        }
        function getSessionNote(dwp_report) {
            const note = dwp_report["Notes for this Session"];
            return (note ? note : "");
        }
        function getCenterNote(dwp_report) {
            const note = dwp_report["Notes from Center Director"];
            return (note ? note : "");
        }
    }
}