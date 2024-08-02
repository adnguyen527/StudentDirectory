import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

(async () => {
    // Launch a headless browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set the download path
    const downloadPath = path.resolve(
        `../report-data/reports/downloaded_dwps/${getFormattedDate()}`
    );
    fs.mkdirSync(downloadPath, { recursive: true });

    // Set the download behavior
    await page._client().send("Page.setDownloadBehavior", {
        behavior: "allow",
        downloadPath: downloadPath,
    });

    try {
        // Navigate to the page with the file
        await page.goto(
            "https://radius.mathnasium.com/DigitalWorkoutPlan/Report",
            {
                waitUntil: "networkidle2",
            }
        );
        console.log("on login page");

        // login
        await page.type("#UserName", "anthony.nguyen1");
        console.log("username entered");
        await page.type("#Password", "mathnasiumsl123");
        console.log("password entered");
        await page.click("#login");
        // await page.waitForNavigation({ waitUntil: "networkidle2" });
        console.log("login complete");

        // Navigate to the page where the download can be initiated
        await page.goto(
            "https://radius.mathnasium.com/DigitalWorkoutPlan/Report",
            {
                waitUntil: "networkidle2",
            }
        );
        console.log("on dwp report page");

        // Interact with the page elements to initiate the download
        await page.click("#btnsearch"); // search button
        await delay(5000); // Adjust the timeout as needed
        console.log("searched");
        await page.click("#dwpExcelBtn"); // export to excel button
        console.log("export clicked");

        // Wait for the download to complete
        await delay(5000); // Adjust the timeout as needed

        console.log(`File downloaded to: ${downloadPath}`);
    } catch (error) {
        console.error(`Error during download: ${error.message}`);
    } finally {
        // Close the browser
        await browser.close();
    }
})();

function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function getFormattedDate() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();

    return `${month}-${day}-${year}`;
}
