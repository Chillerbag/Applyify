const LINKEDIN_JOB_DETAILS = ".jobs-search__job-details--container";
const LINKEDIN_DYNAMIC_JOB = "ltr";
const LINKEDIN_DYNAMIC_COMPANY = "jobs-company__box";

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

async function parseWebpage(html_class, isDynamic, ...html_dynamic) {
   // refresh job details
  jobDetailsElement = document.querySelector(html_class);
  if (jobDetailsElement && isDynamic && html_dynamic.length > 0) {
    // check all dynamic sections have loaded
    let allSectionsLoaded = false;
    for (const div of html_dynamic[0]) {
      if (jobDetailsElement.innerHTML.includes(div)) {
        allSectionsLoaded = true;
      } else {
        allSectionsLoaded = false;
        break;
      }
    }
    if (allSectionsLoaded) {
      jobDetails = parseHTML(jobDetailsElement.innerHTML);
    }
  } else {
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

    chrome.runtime.sendMessage({ jobDetails: jobDetails }, function () {
      console.log("Job details sent to service worker");
    });
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

    if (currentUrl.includes("linkedin.com")) {
      console.log("linkedin job page detected!");
      html_div = LINKEDIN_JOB_DETAILS;
      use_dynamic_scraping = true;
      dynamic_divs = [LINKEDIN_DYNAMIC_JOB, LINKEDIN_DYNAMIC_COMPANY];
    }
    // TODO: add more sites
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
  // remove line breaks
  let cleanedHTML = html.replace(/(\r\n|\n|\r)/g, " ");
  cleanedHTML = cleanedHTML.replace(/\s+/g, " ");
  cleanedHTML = cleanedHTML.replace(/\t/g, " ");
  const doc = parser.parseFromString(cleanedHTML, "text/html");
  const text = doc.body.textContent.trim();
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
