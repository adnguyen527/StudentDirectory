import {MongoClient} from "mongodb";

// Main Function
async function main() {
    const user = "adnguyen527";
    const pass = "ku7IxM1AuiwqrV9e";
    const uri = "mongodb+srv://"+user+":"+pass+"@studentdirectory.eil6uvt.mongodb.net/";
    const args = process.argv;
    const center = args[2]; // specific center or all
    const firstName = args[3]; // first name
    const lastName = args[4]; // last name
    const client = new MongoClient(uri);
    try {
        await client.connect();
    
        var name = firstName;
        if (lastName) name+=(" "+lastName);
        await totalPages(client, String(center), String(name));
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
main().catch(console.error);

async function totalPages(client, center, name) {
    // Pipeline MongoDB
    var pipeline = [];
    if (center != "all") {
        pipeline.push({ $match: { "Center": { $regex: center, $options: "i"} } });
    }
    if (name != "all") {
        pipeline.push({ $match: { "Student Name": name } });
    }
    pipeline.push.apply(pipeline, [
        { $project: { generalInfo: { $split: ["$General Information", ";"] } } },
        { $unwind: "$generalInfo" },
        { $match: { generalInfo: { $regex: "Pages Completed: .*" } } },
        { $project: { pagesCompleted: {
            $arrayElemAt: [ { $split: [ "$generalInfo", "Pages Completed: " ] }, 1 ]
            } } },
        { $match: { pagesCompleted: { $ne: "None" } } },
        { $project: { pagesCompleted: { $toInt: "$pagesCompleted" } } },
        { $group: {
            _id: null,
            totalPages: { $sum: "$pagesCompleted" } } }
    ]);

    const db = client.db("StudentDirectory");
    const coll = db.collection("dwp_reports");
    
    // Perform aggregation
    const agg = coll.aggregate(pipeline);

    // output doc output of aggregation
    for await (const doc of agg) {
        console.log(name+"- "+doc.totalPages+" pages");
    }
}