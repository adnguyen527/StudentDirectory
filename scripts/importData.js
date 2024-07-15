import xlsx from 'xlsx';
import {MongoClient} from 'mongodb';

const args = process.argv;

// connection
const user = "adnguyen527";
const pass = "ku7IxM1AuiwqrV9e";
const uri = `mongodb+srv://${user}:${pass}@studentdirectory.eil6uvt.mongodb.net/`;

const dbName = "StudentDirectory";
const collName = ((args[2]) ? args[2] : "");

// read excel file
var excelFilePath = "";
try {
    excelFilePath = ((args[3]) ? args[3] : _throw("no excel file specified"));
} catch (e) {
    console.error(e);
}
const workbook = xlsx.readFile(excelFilePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

// convert to JSON
const data = xlsx.utils.sheet_to_json(sheet);

async function importData() {
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const db = client.db(dbName);
        const coll = db.collection(collName);

        // insert data into collection
        const result = await coll.insertMany(data);
        console.log(`${result.insertedCount} documents inserted.`);
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

importData();

function _throw(m) {throw m;}