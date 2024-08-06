//script that takes the dwp report file and adds the new dwps to collection
// last ran: 8/1/24 8:05pm

import { MongoClient } from "mongodb";
import { uri } from "../mongo_url.js";
import xlsx from "xlsx";
import path from "path";
import fs from "fs";
import DigitalWorkoutPlan from "./DigitalWorkoutPlan.js";

async function main() {
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const db = client.db("StudentDirectory");
        await addNewDWPs(db);
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}
main().catch(console.error);

async function addNewDWPs(db) {
    const directory = "../report-data/reports";
    const filePath = getRecentDWPReportFile(directory);
    console.log(`${filePath} --> dwp_reports`);

    const workbook = await xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // convert to JSON
    const data = await xlsx.utils.sheet_to_json(sheet);

    const studentMaster = db.collection("students");
    // iterate through data
    for (const dwp of data) {
        const dwop = new DigitalWorkoutPlan();
        dwop.importReport(dwp);
        console.log(dwop);

        // push DWP to the correct student - accountid, first, last
        // find student

        // get dwpReports from student
    }
    // const result = await dwp_coll.insertMany(data);
    // console.log(`${result.insertedCount} DWPs added to students.`);
}

function getRecentDWPReportFile(directory) {
    // Read the directory contents
    const files = fs.readdirSync(directory);

    // Filter for .xlsx files
    const xlsxFiles = files.filter(
        (file) => file.startsWith("Digital Workout") && file.endsWith(".xlsx")
    );

    // Get the most recent file by comparing the stats
    let mostRecentFile = null;
    let mostRecentTime = 0;

    xlsxFiles.forEach((file) => {
        const filePath = path.join(directory, file);
        const fileStats = fs.statSync(filePath);

        // Compare the file modification time
        if (fileStats.mtimeMs > mostRecentTime) {
            mostRecentTime = fileStats.mtimeMs;
            mostRecentFile = file;
        }
    });

    return path.join(directory, mostRecentFile);
}
