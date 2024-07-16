import {MongoClient} from 'mongodb';
import {uri} from '../mongo_url.js';
import {Attendance} from '../Student/Attendance.js';

async function main() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const coll = client.db("StudentDirectory").collection("attendance_reports");
        
        var attendances = [];
        for await (const doc of coll.find()) {
            attendances.push(new Attendance(doc));
        }
        console.log(attendances.slice(0,5));
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
main().catch(console.error);