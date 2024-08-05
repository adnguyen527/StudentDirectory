import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";
import { downloadTodayDWP } from "../scripts/downloadTodayDWP.js";
import { uri } from "../mongo_url.js";
import DigitalWorkoutPlan from "../DWP Reports/DigitalWorkoutPlan.js";

const filePath = path.resolve(
    process.cwd(),
    "report-data/reports/downloaded_dwps/08-02-2024/Digital Workout Plan Report.xlsx"
);

async function main() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db("StudentDirectory");

        // add dwps to existing student ONLY, dont add new student
        await addDWPtoStudents(db);
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}
main().catch(console.error);

// add dwps to existing students
async function addDWPtoStudents(db) {
    const student_master = db.collection("students");

    try {
        // read workbook
        const workbook = await xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // convert to JSON
        const data = await xlsx.utils.sheet_to_json(sheet);

        // iterate through each report
        var count = 0;
        for (const report of data) {
            if (studentExists(student_master, report)) {
                // update student by adding report to existing dwps
                const dwop = new DigitalWorkoutPlan();
                dwop.importReport(report);
                // console.log(dwop);
                await student_master.updateOne(
                    {
                        $expr: {
                            $eq: [
                                { $concat: ["$firstName", " ", "$lastName"] },
                                dwop.studentName,
                            ],
                        },
                        accountId: dwop.accountId,
                    },
                    {
                        $push: {
                            dwpReports: dwop,
                        },
                        $currentDate: { lastModified: true },
                    }
                );

                for (const topic of dwop.topics) {
                    const parts = topic.split(": ");
                    const status = parts.pop();
                    const topic_name = parts.join(": ");
                    if (status == "Mastered") {
                        // add unique topics to topicsMastered
                        await student_master.updateOne(
                            {
                                topicsMastered: { $ne: topic_name },
                                $expr: {
                                    $eq: [
                                        {
                                            $concat: [
                                                "$firstName",
                                                " ",
                                                "$lastName",
                                            ],
                                        },
                                        dwop.studentName,
                                    ],
                                },
                                accountId: dwop.accountId,
                            },
                            {
                                $addToSet: { topicsMastered: topic_name },
                            }
                        );
                        // increases the mc mastered count
                        await student_master.updateOne(
                            {
                                $expr: {
                                    $eq: [
                                        {
                                            $concat: [
                                                "$firstName",
                                                " ",
                                                "$lastName",
                                            ],
                                        },
                                        dwop.studentName,
                                    ],
                                },
                                accountId: dwop.accountId,
                            },
                            { $inc: { totalMCsMastered: 1 } }
                        );
                    }
                }

                count++;
            }
        }
        console.log(`${count} DWPs were pushed to student profiles.`);
    } catch (error) {
        console.error(`Error reading file or inserting data: ${error.message}`);
    }
}

// check if student already exists in Student collection by student name and accountId from a DWP report
async function studentExists(student_master, report) {
    const pipeline = [
        {
            $match: {
                $expr: {
                    $eq: [
                        { $concat: ["$firstName", "$lastName"] },
                        report["Student Name"],
                    ],
                },
                accountId: report["Account Id"],
            },
        },
        {
            $count: "count",
        },
        {
            $project: {
                exists: {
                    $gt: ["$count", 0],
                },
            },
        },
    ];
    const result = await student_master.aggregate(pipeline).toArray();
    // console.log(firstName + " " + lastName + " " + (result[0] ? true : false));
    return result[0] ? true : false;
}
