import xlsx from "xlsx";
import path from "path";
import fs from "fs";
import { MongoClient } from "mongodb";
import { uri } from "../mongo_url.js";

const dbName = "StudentDirectory";

async function importAllReportData() {
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const db = client.db(dbName);
        await updateDocuments(db, "attendance_reports");
        await updateDocuments(db, "dwp_reports");
        await updateDocuments(db, "enrollment_reports");
        await updateDocuments(db, "student_reports");
        await importBirthdayDocuments(db);

        // insert all downloaded dwps into collections
        await addDownloadedDWPs(db);
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}
importAllReportData();

async function updateDocuments(db, collName) {
    const coll = db.collection(collName);

    const excelFilePath = await findFilePath(collName);
    console.log(`${excelFilePath} --> ${collName}`);

    const workbook = await xlsx.readFile(excelFilePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // convert to JSON
    const data = await xlsx.utils.sheet_to_json(sheet);

    // insert data into collection
    const result = await coll.insertMany(data);
    console.log(`${result.insertedCount} documents inserted.`);
}

async function importBirthdayDocuments(db) {
    const coll = db.collection("birthday_reports");
    const directory = "../report-data/reports/birthdays";
    const files = fs.readdirSync(directory);

    for (const file of files) {
        if (
            file.startsWith("Student Birthday Report") &&
            file.endsWith(".xlsx")
        ) {
            const excelFilePath = path.join(directory, file);
            console.log(`${excelFilePath} --> birthday_reports`);

            const workbook = await xlsx.readFile(excelFilePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            // convert to JSON
            const data = await xlsx.utils.sheet_to_json(sheet);

            // insert data into collection
            const result = await coll.insertMany(data);
            console.log(`${result.insertedCount} documents inserted.`);
        }
    }
}

async function addDownloadedDWPs(db) {
    // access collection
    // read directory and files
    // for each folder and read dwp file
    // convert to json and insertMany into dwp collection
    // log the count of how many inserted for each day? or total
}

async function findFilePath(collName) {
    const directory = "../report-data/reports";
    const files = fs.readdirSync(directory);

    var prefix = "";
    switch (collName) {
        case "attendance_reports":
            prefix = "Student Attendance";
            break;
        case "dwp_reports":
            prefix = "Digital Workout";
            break;
        case "enrollment_reports":
            prefix = "Enrolled Report";
            break;
        case "student_reports":
            prefix = "Student Report";
            break;
    }

    for (const file of files) {
        if (file.startsWith(prefix) && file.endsWith(".xlsx")) {
            return path.join(directory, file);
        }
    }

    throw new Error(`No file found with prefix "${prefix}"`);
}
