import { UUID } from "mongodb";

export default class Birthday {
    constructor(studentName) {
        this.uuid = new UUID();
        this.studentName = studentName;
        this.birthday = "";
        this.age = 0;
    }

    importReport(birthday_report) {
        this.birthday = birthday_report["Birthday"];
        this.age = getAge();

        // get age based on birthday string
        function getAge() {
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
    }
}
