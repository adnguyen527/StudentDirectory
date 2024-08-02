const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
import puppeter from "puppeteer";

(async () => {
    // Launch a headless browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set download behavior
    const downloadPath = path.resolve(__dirname, "downloads");
    fs.mkdirSync(downloadPath, { recursive: true });
    await page._client.send("Page.setDownloadBehavior", {
        behavior: "allow",
        downloadPath: downloadPath,
    });

    try {
        // Navigate to the page with the file
        await page.goto("https://example.com/login", {
            waitUntil: "networkidle2",
        });

        // Perform login if necessary
        await page.type("#username", "your-username");
        await page.type("#password", "your-password");
        await page.click("#login-button");
        await page.waitForNavigation({ waitUntil: "networkidle2" });

        // Navigate to the page where the download can be initiated
        await page.goto("https://example.com/export", {
            waitUntil: "networkidle2",
        });

        // Interact with the page elements to initiate the download
        await page.select("#format-select", "csv"); // Example: Select a file format
        await page.click("#export-button"); // Example: Click a button to start the download

        // Wait for the download to complete
        await page.waitForTimeout(5000); // Adjust the timeout as needed

        console.log(`File downloaded to: ${downloadPath}`);
    } catch (error) {
        console.error(`Error during download: ${error.message}`);
    } finally {
        // Close the browser
        await browser.close();
    }
})();
