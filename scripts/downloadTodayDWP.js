import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

// Function to wait for the download to complete
function waitForDownloadCompletion(downloadPath, callback) {
    let files = new Set();

    const watcher = fs.watch(downloadPath, (eventType, filename) => {
        if (eventType === "rename" && filename) {
            // Check if the file has a '.crdownload' extension, indicating it's still downloading
            if (!filename.endsWith(".crdownload")) {
                if (!files.has(filename)) {
                    files.add(filename);
                    callback(filename, watcher);
                }
            }
        }
    });

    return watcher;
}

// Function to copy the downloaded file to multiple locations
async function copyFileToLocations(sourceFilePath, downloadPaths) {
    // Wait for all copy operations to complete
    await Promise.all(
        downloadPaths.slice(1).map(async (downloadPath) => {
            const destinationFilePath = path.join(
                downloadPath,
                path.basename(sourceFilePath)
            );
            await fs.promises.copyFile(sourceFilePath, destinationFilePath);
            console.log(`Copied file to: ${destinationFilePath}`);
        })
    );
}

(async () => {
    // Launch a headless browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // list of download locations
    const downloadPaths = [
        path.resolve(""),
        path.resolve(
            `../report-data/reports/downloaded_dwps/${getFormattedDate()}`
        ),
        path.resolve("downloads"),
    ];

    // Ensure all directories exist
    downloadPaths.forEach((downloadPath) =>
        fs.mkdirSync(downloadPath, { recursive: true })
    );

    // Set the download path to a temporary location
    const initialDownloadPath = downloadPaths[0];
    await page._client().send("Page.setDownloadBehavior", {
        behavior: "allow",
        downloadPath: initialDownloadPath,
    });

    // Monitor the initial download path for completed downloads
    const watcher = waitForDownloadCompletion(
        initialDownloadPath,
        async (filename, watcher) => {
            console.log(`File downloaded: ${filename}`);

            const sourceFilePath = path.join(initialDownloadPath, filename);

            // Copy the file to each of the other locations
            try {
                // Ensure the file is copied to all specified locations before proceeding
                await copyFileToLocations(sourceFilePath, downloadPaths);
            } catch (copyError) {
                console.error(`Error copying file: ${copyError.message}`);
            } finally {
                // Close the browser and stop watching once the file is processed
                watcher.close();
                await browser.close();
                console.log("Browser closed and script finished");
            }
        }
    );

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

        console.log("Completed waiting for the download to finish");
    } catch (error) {
        console.error(`Error during download: ${error.message}`);
        await browser.close();
    }
})();

function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function getFormattedDate() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();

    return `${month}-${day}-${year}`;
}
