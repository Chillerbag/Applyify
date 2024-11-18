const JOB_DETAILS_CONTAINER = ".jobs-search__job-details--container";
const JOB_INFO_CONTATINER = ".job-details-jobs-unified-top-card__primary-description-container";
const JOB_DESCRIPTION_CONTAINER = ".jobs-description__container";

let currentUrl = null;

let jobDetails = null;
let jobTitle = null;
let jobInfo = null;
let jobDescription = null;
let dataGrabbed = false;

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
  jobDetails = document.querySelector(JOB_DETAILS_CONTAINER);
  if (jobDetails) {
    // title is in the aria-label attribute
    if (!jobTitle) {
      jobTitle = jobDetails.getAttribute("aria-label");
      console.log("Grabbed job title: ", jobTitle);
    }
    
    // grab the job info
    if (!jobInfo) {
      jobInfoElement = jobDetails.querySelector(JOB_INFO_CONTATINER);
      if (jobInfoElement && jobInfoElement.innerHTML.includes('white-space-pre')) {
        jobInfo = jobInfoElement.innerHTML;
        console.log("Grabbed job info: ", jobInfo);
      } else {
        console.log("Waiting for job info...");
      }
    }

    // grab the job description
    if (!jobDescription) {
      jobDescriptionElement = jobDetails.querySelector(JOB_DESCRIPTION_CONTAINER);
      if (jobDescriptionElement && jobDescriptionElement.innerHTML.includes('white-space-pre')) {
        jobDescription = jobDescriptionElement.innerHTML;
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

function getPageTitle(jobDetails) {
  return jobDetails.getAttribute("aria-label");
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

observePage();
