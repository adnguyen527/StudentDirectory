import { MongoClient } from "mongodb";
import { uri } from "../mongo_url.js";
import { Instructor } from "./Instructor.js";

async function main() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const coll = client.db("StudentDirectory").collection("dwp_reports");

        const instructor = new Instructor("Samantha Somerstein");
        const query = {"Session": {"$regex": `Instructors:[^;]*${instructor.name}`}};
        const cursor = await coll.find(query);
        // console.log(await cursor.toArray());
        for await (const doc of cursor) {
            console.log(doc["Date"]);
        }
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}
main().catch(console.error);
