const JOB_DETAILS_CONTAINER = ".jobs-search__job-details--container";
const JOB_INFO_CONTATINER = ".job-details-jobs-unified-top-card__primary-description-container";
const JOB_INFO_CLASS = "tvm__text tvm__text--low-emphasis";
const JOB_DESCRIPTION_CONTAINER = ".jobs-description__container";
const LTR = "ltr";
const ARIA_LABEL = "aria-label";

let currentUrl = null;

let jobDetails = null;
let jobTitle = null;
let jobInfo = null;
let jobDescription = null;
let dataGrabbed = false;

const parser = new DOMParser();

// wait for the job data container to appear
const observer = new MutationObserver((mutations, obs) => {
  // only scrape if different url
  if (currentUrl !== grabURL()) {
    console.log("URL changed, resetting data...");
    console.log("Old URL: ", currentUrl);
    console.log("New URL: ", grabURL());
    resetData();
    currentUrl = grabURL();
  }

  // get outer job details container
  jobDetails = getJobDetailsContainer();
  if (jobDetails) {
    // title is in the aria-label attribute
    if (!jobTitle) {
      jobTitle = parseHTML(getJobTitleElement(jobDetails));
      console.log("Grabbed job title: ", jobTitle);
    }
    
    // grab the job info
    if (!jobInfo) {
      jobInfoElement = getJobInfoElement(jobDetails);
      if (jobInfoElement && jobInfoElement.includes(JOB_INFO_CLASS) && (jobInfo = parseHTML(jobInfoElement)) !== null) {
        console.log("Grabbed job info: ", jobInfo);
      } else {
        console.log("Waiting for job info...");
      }
    }

    // grab the job description
    if (!jobDescription) {
      jobDescriptionElement = getJobDescriptionElement(jobDetails);
      if (jobDescriptionElement &&  jobDescriptionElement.includes(LTR) && (jobDescription = parseHTML(jobDescriptionElement)) !== null) {
        console.log("Grabbed job description: ", jobDescription);
      } else {
        console.log("Waiting for job description...");
      }
    }

    // if we have all the data we need, stop observing until the page changes
    if (!dataGrabbed && jobTitle && jobInfo && jobDescription) {
      console.log('Grabbed all job details!');
      console.log("Job Title: ", jobTitle);
      console.log("Job Info: ", jobInfo);
      console.log("Job Description: ", jobDescription);
      dataGrabbed = true;
    }
  } else {
    console.log("Waiting for job details...");
  }
});

function getJobDetailsContainer() {
  return document.querySelector(JOB_DETAILS_CONTAINER);
}

function getJobTitleElement(jobDetails) {
  return jobDetails.getAttribute(ARIA_LABEL);
}

function getJobInfoElement(jobDetails) {
  return jobDetails.querySelector(JOB_INFO_CONTATINER).innerHTML;
}

function getJobDescriptionElement(jobDetails) {
  return jobDetails.querySelector(JOB_DESCRIPTION_CONTAINER).innerHTML;
}

function resetData() {
  jobDetails = null;
  jobTitle = null;
  jobInfo = null;
  jobDescription = null;
  dataGrabbed = false;
}

function observePage() {
  observer.observe(document, {
    childList: true,
    subtree: true
  });
}

function grabURL() {
  return window.location.href;
}

function parseHTML(html) {
  const doc = parser.parseFromString(html, 'text/html');
  const text = doc.body.textContent.trim();
  return text;
}

// wait for the page to fully load before observing
// note doesn't account for async loading of elements
window.addEventListener("load", function() {
  console.log("window fully loaded and parsed");
  observePage();
});
