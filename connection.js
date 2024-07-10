const {MongoClient} = require('mongodb');

// Main Function
async function main() {
    const user = "adnguyen527";
    const pass = "ku7IxM1AuiwqrV9e";
    const uri = "mongodb+srv://"+user+":"+pass+"@studentdirectory.eil6uvt.mongodb.net/";
    const client = new MongoClient(uri);
    try {
        await client.connect();
    
        await listDatabases(client);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
main().catch(console.error);

async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}