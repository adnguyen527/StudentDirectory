import { MongoClient } from "mongodb";
import { uri } from "../mongo_url.js";
import Student from "./Student.js";

async function main() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("StudentDirectory");
        const collections = [
            "attendance_reports",
            "dwp_reports",
            "enrollment_reports",
            "student_reports"
        ];

        // access all report collections
        for (const coll of collections) {
            const selectedColl = db.collection(coll);
            var insertCount = 0;
            var updateCount = 0;
            // pipeline for all unique account ids from selected collection
            const uniqueIdPipeline = [
                { $group: { _id: "$Account Id" } },
                { $group: { _id: null, accountIds: { $addToSet: "$_id" } } }
            ];
            const [uniqueAccountIdsArray] = await selectedColl.aggregate(uniqueIdPipeline).toArray();

            // check if collection is empty or no ids found
            if (!uniqueAccountIdsArray || !uniqueAccountIdsArray.accountIds) {
                console.log(`No account ids found in ${coll}`);
                continue;
            }
            // array of all unique account ids from selected collection
            const accountIds = uniqueAccountIdsArray.accountIds;

            // $lookup pipeline for checking if that account exist as a student
            const lookupPipeline = [
                { $match: { $expr: { $in: ["$Account Id", accountIds] } } },
                { $lookup: {
                    from: 'students',
                    localField: 'Account Id',
                    foreignField: 'Account Id',
                    as: 'existsInStudents'
                }},
                { $addFields: {
                    exists: { $gt: [{ $size: "$existsInStudents" }, 0] }
                }},
                { $project: {
                    _id: 0,
                    accountId: "$Account Id",
                    exists: 1
                }}
            ];
            const result = await selectedColl.aggregate(lookupPipeline).toArray();

            if (result.length == 0) {
                console.log(`No matching ids found in ${coll}`);
            } else {
                // if exist, update student object
                // otherwise, create new student object
                for (const doc of result) {
                    if (doc.exists) {
                        updateCount++;
                    } else {
                        insertCount++;
                    }
                }
                
                console.log(`${insertCount} documents added from ${coll}`);
                console.log(`${updateCount} documents updated from ${coll}`);
            }
        }
        
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}
main().catch(console.error);

async function addDocument(accountId) {

}

async function updateDocument(accountId) {

}
