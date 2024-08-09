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

export async function downloadTodayDWP() {
    console.log(`Starting daily download: ${getFormattedDate()}`);
    // Launch a headless browser
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--lang=en-US", // Set language to US English
            "--timezone=America/Chicago", // Set timezone to CST/CDT
        ],
    });
    const page = await browser.newPage();
    await page.emulateTimezone("America/Chicago");

    const browserTime = await page.evaluate(() => {
        return new Date().toLocaleString("en-US", {
            timeZone: "America/Chicago",
        });
    });
    console.log("Date and Time:", browserTime);

    // list of download locations
    const downloadPaths = [
        path.resolve(""),
        path.resolve(
            process.cwd(),
            `report-data/reports/downloaded_dwps/${getFormattedDate()}`
        ),
        path.resolve(process.cwd(), `archive/${getFormattedDate()}`),
        path.resolve(process.cwd(), "DWP Reports/downloads"),
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

        // login
        await page.type("#UserName", "anthony.nguyen1");
        await page.type("#Password", "mathnasiumsl123");
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

        // Interact with the page elements to initiate the download
        await page.click("#btnsearch"); // search button
        await delay(5000); // Adjust the timeout as needed
        await page.click("#dwpExcelBtn"); // export to excel button

        // Wait for the download to complete
        await delay(5000); // Adjust the timeout as needed

        console.log("Completed waiting for the download to finish");
    } catch (error) {
        console.error(`Error during download: ${error.message}`);
        await browser.close();
    }
}

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
