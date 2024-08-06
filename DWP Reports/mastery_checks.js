import {MongoClient} from "mongodb";
import {uri} from '../mongo_url.js';

// Main Function
async function main() {
    const args = process.argv;
    const center = args[2]; // specific center or all
    const firstName = args[3]; // first name
    const lastName = args[4]; // last name
    const client = new MongoClient(uri);
    try {
        await client.connect();
    
        var name = firstName;
        if (lastName) name+=(" "+lastName);
        await totalMastery(client, center, String(name))
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
main().catch(console.error);

async function totalMastery(client, center, name) {
    var pipeline = [];
    if (center != "all") {
        pipeline.push({ $match: { "Center": { $regex: center, $options: "i"} } });
    }
    if (name != 'all') {
        pipeline.push({ $match: {"Student Name": name}});
    }
    pipeline.push.apply(pipeline, [
        { $group: {
            _id: null,
            MasteredCount: { $sum: { $cond: [ {
                $regexMatch: { input: "$LP Assignment", regex: "Mastered", options: "i" }
            }, 1, 0 ] } }
        }}
    ]);

    const db = client.db("StudentDirectory");
    const coll = db.collection("dwp_reports");

    const agg = coll.aggregate(pipeline);

    for await (const doc of agg) {
        console.log(name+"- "+doc.MasteredCount+" mastery checks");
    }
}