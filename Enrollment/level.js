import {MongoClient} from "mongodb";

// Main Function
async function main() {
    const user = "adnguyen527";
    const pass = "ku7IxM1AuiwqrV9e";
    const uri = "mongodb+srv://"+user+":"+pass+"@studentdirectory.eil6uvt.mongodb.net/";
    const args = process.argv;
    const firstName = args[2];
    const lastName = args[3];
    const client = new MongoClient(uri);
    try {
        await client.connect();
        await currentLevel(client.db("StudentDirectory"), String(firstName), String(lastName));
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
main().catch(console.error);

async function currentLevel(db, firstName, lastName) {
    const coll = db.collection("enrollment_reports");

    let query = {
        "Student First Name": firstName, 
        "Student Last Name": lastName
    };
    const cursor = coll.find(query);
    for await (const doc of cursor) {
        console.log(`${firstName} ${lastName} - ${doc["Student Length of Stay"]}`);

        // calc current level
        let months = parseFloat(doc["Student Length of Stay"].split(' ')[0]);
        console.log(`Level ${(function() {
            var level = 1;
            if (months >= 4) level = 2;
            if (months >= 10) level += Math.floor((months-4)/6);
            return level;
        })(months)}`);
    }

    await cursor.close();
}