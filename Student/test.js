import { MongoClient } from "mongodb";
import { uri } from "../mongo_url.js";
import DigitalWorkoutPlan from "./DigitalWorkoutPlan.js";

async function main() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const coll = client.db("StudentDirectory").collection("dwp_reports");
        const doc = await coll.findOne({"Student Name": "Teddy Nguyen"});

        const dwop = new DigitalWorkoutPlan(doc["Account Id"]);
        dwop.importDWP(doc);
        console.log(dwop);

    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }
}
main().catch(console.error);