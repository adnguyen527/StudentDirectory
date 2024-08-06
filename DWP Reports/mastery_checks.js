import { MongoClient } from "mongodb";
import { uri } from "../mongo_url.js";

// Main Function
async function main() {
    const center = "Southlake";
    const firstName = "Faith";
    const lastName = "Thomas";
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("StudentDirectory");

        console.log(`${await totalCenterMCs(db, center)} mastered - ${center}`);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
main().catch(console.error);

// all mastery for center
async function totalCenterMCs(db, center) {
    const studentMaster = db.collection("students");
    const cursor = await studentMaster.find({ center: center });
    var sum = 0;
    // iterate through all students from that center
    for await (const student_doc of cursor) {
        //
    }

    return sum;
}
