import { importAllReportData } from "importAllReportData.js";
import { deleteAllReportData } from "deleteAllReportData.js";

async function main() {
    try {
        // delete current report data
        await deleteAllReportData();

        // intialize report data from collections
        await importAllReportData();
    } catch (error) {
        console.error(error);
    }
}
main().catch(console.error);
