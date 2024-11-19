const JOB_DETAILS_CONTAINER = ".jobs-search__job-details--container";
const JOB_INFO_CONTAINER =
  ".job-details-jobs-unified-top-card__primary-description-container";
const JOB_INFO_CLASS = "tvm__text tvm__text--low-emphasis";
const JOB_DESCRIPTION_CONTAINER = ".jobs-description__container";
const LTR = "ltr";
const ARIA_LABEL = "aria-label";
const COMPANY_CONTAINER = ".jobs-company__box";
const COMPANY_NAME = ".display-flex.align-items-center.mt5";
const COMPANY_INFO = ".t-14.mt5";
const COMPANY_DESCRIPTION =
  ".jobs-company__company-description.text-body-small-open";

let currentUrl = null;
let jobContainer = null;
let jobTitle = null;
let jobInfo = null;
let jobInfoElement = null;
let jobDescription = null;
let jobDescriptionElement = null;
let companyContainer = null;
let companyName = null;
let companyNameElement = null;
let companyInfo = null;
let companyInfoElement = null;
let companyDescription = null;
let companyDescriptionElement = null;
let dataGrabbed = false;

const parser = new DOMParser();



// wait for the job data container to appear
const observer = new MutationObserver((mutations, obs) => {
  // reset data if new url
  if (currentUrl !== grabURL()) {
    console.log("URL changed, resetting data...");
    console.log("Old URL: ", currentUrl);
    console.log("New URL: ", grabURL());
    resetData();
    currentUrl = grabURL();
  }

  // refresh job container
  jobContainer = getjobContainer();
  if (jobContainer) {
    // title is in the aria-label attribute
    if (!jobTitle) {
      jobTitle = parseHTML(getJobTitleElement(jobContainer));
      console.log("Grabbed job title: ", jobTitle);
      chrome.storage.session.set({"jobTitle": jobTitle});

    }

    // grab the job info
    if (!jobInfo) {
      jobInfoElement = getJobInfoElement(jobContainer);
      if (
        jobInfoElement &&
        jobInfoElement.innerHTML.includes(JOB_INFO_CLASS) &&
        (jobInfo = parseHTML(jobInfoElement.innerHTML)) !== null
      ) {
        console.log("Grabbed job info: ", jobInfo);
        chrome.storage.session.set({"jobInfo": jobInfo});
      } else {
        console.log("Waiting for job info...");
      }
    }

    // grab the job description
    if (!jobDescription) {
      jobDescriptionElement = getJobDescriptionElement(jobContainer);
      if (
        jobDescriptionElement &&
        jobDescriptionElement.innerHTML.includes(LTR) &&
        (jobDescription = parseHTML(jobDescriptionElement.innerHTML)) !== null
      ) {
        console.log("Grabbed job description: ", jobDescription);
        chrome.storage.session.set({"jobDescription": jobDescription});
      } else {
        console.log("Waiting for job description...");
      }
    }

    // refresh company container
    companyContainer = getCompanyDetailsContainer(jobContainer);
    if (companyContainer) {
      // grab the company name
      if (!companyName) {
        companyNameElement = getCompanyNameElement(companyContainer);
        if (
          companyNameElement &&
          (companyName = parseHTML(companyNameElement.innerHTML)) !== null
        ) {
          console.log("Grabbed company name: ", companyName);
          chrome.storage.session.set({"companyName": companyName});
        } else {
          console.log("Waiting for company name...");
        }
      }

      // grab the company info
      if (!companyInfo) {
        companyInfoElement = getCompanyInfoElement(companyContainer);
        if (
          companyInfoElement &&
          (companyInfo = parseHTML(companyInfoElement.innerHTML)) !== null
        ) {
          console.log("Grabbed company info: ", companyInfo);
          chrome.storage.session.set({"companyInfo": companyInfo});
        } else {
          console.log("Waiting for company info...");
        }
      }

      // grab the company description
      if (!companyDescription) {
        companyDescriptionElement =
          getCompanyDescriptionElement(companyContainer);
        if (
          companyDescriptionElement &&
          (companyDescription = parseHTML(
            companyDescriptionElement.innerHTML
          )) !== null
        ) {
          console.log("Grabbed company description: ", companyDescription);
          chrome.storage.session.set({"companyDescription": companyDescription});
        } else {
          console.log("Waiting for company description...");
        }
      }
    }
  }

  // if we have all the data we need, stop observing until the url changes
  if (
    !dataGrabbed &&
    jobTitle &&
    jobInfo &&
    jobDescription &&
    companyName &&
    companyInfo &&
    companyDescription
  ) {
    console.log("Grabbed all job details!");
    console.log("Job Title: ", jobTitle);
    console.log("Job Info: ", jobInfo);
    console.log("Job Description: ", jobDescription);
    console.log("Company Name: ", companyName);
    console.log("Company Info: ", companyInfo);
    console.log("Company Description: ", companyDescription);
    dataGrabbed = true;
  } else if (!dataGrabbed) {
    console.log("Waiting for site data...");
  }
});

function getjobContainer() {
  return document.querySelector(JOB_DETAILS_CONTAINER);
}

function getJobTitleElement(jobContainer) {
  return jobContainer.getAttribute(ARIA_LABEL);
}

function getJobInfoElement(jobContainer) {
  return jobContainer.querySelector(JOB_INFO_CONTAINER);
}

function getJobDescriptionElement(jobContainer) {
  return jobContainer.querySelector(JOB_DESCRIPTION_CONTAINER);
}

function getCompanyDetailsContainer(jobContainer) {
  return jobContainer.querySelector(COMPANY_CONTAINER);
}

function getCompanyNameElement(companyContainer) {
  return companyContainer.querySelector(COMPANY_NAME);
}

function getCompanyInfoElement(companyContainer) {
  return companyContainer.querySelector(COMPANY_INFO);
}

function getCompanyDescriptionElement(companyContainer) {
  return companyContainer.querySelector(COMPANY_DESCRIPTION);
}

function resetData() {
  jobContainer = null;
  jobTitle = null;
  jobInfo = null;
  jobDescription = null;
  companyContainer = null;
  companyName = null;
  companyInfo = null;
  companyDescription = null;
  dataGrabbed = false;
}

function observePage() {
  observer.observe(document, {
    childList: true,
    subtree: true,
  });
}

function grabURL() {
  return window.location.href;
}

function parseHTML(html) {
  const doc = parser.parseFromString(html, "text/html");
  const text = doc.body.textContent.trim();
  return text;
}

// wait for the page to fully load before observing
// note doesn't account for async loading of elements
window.addEventListener("load", function () {
  console.log("window fully loaded and parsed");
  observePage();
});
