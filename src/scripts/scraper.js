/*
File: scraper.js
Description: the scraper for all job sites. works generically!
Last modified: 3/12/2024 by Will
*/

const LINKEDIN_JOB_DETAILS = ".jobs-search__job-details--container";
const LINKEDIN_DYNAMIC_JOB = "ltr";
const LINKEDIN_DYNAMIC_COMPANY = "jobs-company__box";

const INDEED_JOB_DETAILS = "#job-full-details";
const INDEED_DYNAMIC_JOB = "jobDescriptionText";

const SEEK_JOB_DETAILS = "#braid-modal-container";

let currentUrl = null;
let jobDetails = null;
let dataGrabbed = false;

let html_div = null;
let use_dynamic_scraping = false;
let dynamic_divs = [];

const parser = new DOMParser();

// only want one observer to ever run
const observer = new MutationObserver(async (mutations, obs) => {
  // check if the url has changed
  await checkUrl();
  // on page change, parse the new page
  parseWebpage(html_div, use_dynamic_scraping, dynamic_divs);
});

async function parseWebpage(html_class, isDynamic, html_dynamic) {
  // refresh job details
  jobDetailsElement = document.querySelector(html_class);

  // check all dynamic sections have loaded
  if (jobDetailsElement && isDynamic && html_dynamic.length > 0) {
    let allSectionsLoaded = false;
    for (const div of html_dynamic) {
      if (jobDetailsElement.innerHTML.includes(div)) {
        allSectionsLoaded = true;
      } else {
        allSectionsLoaded = false;
        break;
      }
    }
    // everything loaded yay, parsing time
    if (allSectionsLoaded) {
      jobDetails = parseHTML(jobDetailsElement.innerHTML);
    }
  } else {
    // no dynamic sections, just parse the job details yay
    if (jobDetailsElement) {
      jobDetails = parseHTML(jobDetailsElement.innerHTML);
    }
  }

  // if we have all the data we need, stop observing until the url changes
  if (!dataGrabbed && jobDetails) {
    // log data (for devs)
    console.log("Grabbed job details!");
    console.log("Job Details: ", jobDetails);

    // grabbed data yay!
    dataGrabbed = true;

    chrome.runtime.sendMessage(
      {
        type: "broadcastJobDetails",
        jobDetails: jobDetails,
      },
      function () {
        console.log("Job details sent to service worker");
      }
    );
  } else if (!dataGrabbed) {
    console.log("Waiting for site data...");
  }
}

async function checkUrl() {
  if (currentUrl !== grabURL()) {
    console.log("URL changed, resetting data...");
    console.log("Old URL: ", currentUrl);
    console.log("New URL: ", grabURL());
    await resetData();
    currentUrl = grabURL();

    if (
      currentUrl.includes("linkedin.com") &&
      currentUrl.includes("?currentJobId=")
    ) {
      console.log("linkedin job page detected!");
      html_div = LINKEDIN_JOB_DETAILS;
      use_dynamic_scraping = true;
      dynamic_divs = [LINKEDIN_DYNAMIC_JOB, LINKEDIN_DYNAMIC_COMPANY];
    } else if (currentUrl.includes("indeed.com")) {
      console.log("indeed job page detected!");
      html_div = INDEED_JOB_DETAILS;
      use_dynamic_scraping = true;
      dynamic_divs = [INDEED_DYNAMIC_JOB];
    } else if (currentUrl.includes("seek.com")) {
      console.log("seek job page detected!");
      html_div = SEEK_JOB_DETAILS;
      use_dynamic_scraping = false;
    }
  }
}

async function resetData() {
  jobDetails = null;
  dataGrabbed = false;
  html_div = null;
  use_dynamic_scraping = false;
  dynamic_divs = [];
}

async function observePage() {
  await checkUrl();

  // start observing document
  observer.observe(document, {
    childList: true,
    subtree: true,
  });
}

function grabURL() {
  return window.location.href;
}

function parseHTML(html) {
  // remove line breaks + extra spaces + tabs
  let cleanedHTML = html.replace(/(\r\n|\n|\r)/g, " ");
  cleanedHTML = cleanedHTML.replace(/\s+/g, " ");
  cleanedHTML = cleanedHTML.replace(/\t/g, " ");

  // remove inner css
  cleanedHTML = cleanedHTML.replace(/<style([\s\S]*?)<\/style>/gi, "");

  // parse HTML
  const doc = parser.parseFromString(cleanedHTML, "text/html");
  let text = doc.body.textContent.trim();

  // ensure everything is ASCII
  const asciiText = text.replace(/[^\x00-\x7F]/g, "");
  return asciiText;
}

// wait for the page to fully load before observing
// note doesn't account for async loading of elements
window.addEventListener("load", async function () {
  console.log("window fully loaded!");
  await observePage();
});
