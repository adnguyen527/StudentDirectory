import {MongoClient} from 'mongodb';
import {uri} from '../mongo_url.js';

const dbName = "StudentDirectory";

async function deleteAllReportData() {
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const db = client.db(dbName);
        await deleteAll(db, "dwp_reports");
        await deleteAll(db, "enrollment_reports");
        await deleteAll(db, "attendance_reports");
        await deleteAll(db, "student_reports");

    } catch (error) {
        console.error("Error deleting documents: ", error);
    } finally {
        await client.close();
    }

    async function deleteAll(db, collName) {
        const result = await db.collection(collName).deleteMany({});
        console.log(`${result.deletedCount} documents deleted fron ${collName}`);
    }
}

// run function
deleteAllReportData()