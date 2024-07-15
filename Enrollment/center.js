import { filterCenter } from "../scripts/filterCenter.js";
import {MongoClient} from "mongodb";
import {uri} from '../mongo_url.js';

async function main() {
    var center = ((process.argv[2]) ? process.argv[2] : "Southlake");
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const coll = client.db("StudentDirectory").collection("enrollment_reports");
        const cursor = filterCenter(coll, center);
        for await (const doc of cursor) {
            console.dir(doc);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
main().catch(console.error);