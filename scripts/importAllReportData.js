import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import {MongoClient} from 'mongodb';
import {uri} from '../mongo_url.js';

const dbName = "StudentDirectory";

async function importData() {
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const db = client.db(dbName);
        await updateDocuments(db, "attendance_reports");
        await updateDocuments(db, "dwp_reports");
        await updateDocuments(db, "enrollment_reports");
        await updateDocuments(db, "student_reports");

    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}
importData();

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

async function findFilePath(collName) {
    var prefix = "";
    switch (collName) {
        case ("attendance_reports"):
            prefix = "Student Attendance";
            break;
        case ("dwp_reports"):
            prefix = "Digital Workout";
            break;
        case ("enrollment_reports"):
            prefix = "Enrolled Report";
            break;
        case ("student_reports"):
            prefix = "Student Report";
            break;
    }

    const directory = "../report-data/reports";
    const files = fs.readdirSync(directory);
    for (const file of files) {
        if (file.startsWith(prefix) && file.endsWith('.xlsx')) {
            return path.join(directory, file);
        }
    }

    throw new Error(`No file found with prefix "${prefix}"`);
}