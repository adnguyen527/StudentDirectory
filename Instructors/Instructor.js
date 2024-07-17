import { UUID } from "mongodb";

class Instructor {
    constructor(name) {
        this.uid = new UUID();
        this.name = name;
        this.center = []; // list of all centers
        this.datesWorked = []; // list of all dates worked
        this.pagesChecked = 0;
        this.masteryChecks = 0;
        this.dwps = [];
    }

    static setDWP(dwps) {
        this.dwps = dwps;
    }

    static setDatesWorked() {
        var dates = [];
        for (const doc of dwps) {
            console.log(doc["Date"]);
        }
    }
}
export {Instructor};