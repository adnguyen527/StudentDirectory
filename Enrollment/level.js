const {MongoClient} = require('mongodb');

// Main Function
async function main() {
    const user = "adnguyen527";
    const pass = "ku7IxM1AuiwqrV9e";
    const uri = "mongodb+srv://"+user+":"+pass+"@studentdirectory.eil6uvt.mongodb.net/";
    const args = process.argv;
    const firstName = args[2]; // first name
    const lastName = args[3]; // last name
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("StudentDirectory");
        const coll = db.collection("dwp_reports");
    
        await currentLevel(coll, String(firstName), String(lastName));
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
main().catch(console.error);

async function currentLevel(coll, firstName, lastName) {
    var pipeline = [
        { $match:{
            "Student First Name": firstName, 
            "Student Last Name": lastName
        }}
    ];

    const agg = coll.aggregate(pipeline);
    console.log(JSON.stringify(agg));
}