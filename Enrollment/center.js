import { filterCenter } from "../scripts/filterCenter.js";
const {MongoClient} = require('mongodb');

async function main() {
    const user = "adnguyen527";
    const pass = "ku7IxM1AuiwqrV9e";
    const uri = `mongodb+srv://${user}:${pass}@studentdirectory.eil6uvt.mongodb.net/`;
    const center = process.argv[2];
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const coll = client.db("StudentDirectory").collection("enrollment_reports");
        console.log(await filterCenter(coll, center));
        console.log("done");
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
main().catch(console.error);