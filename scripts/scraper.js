const JOB_DETAILS_CONTAINER = ".jobs-search__job-details--container";
const JOB_INFO_CONTATINER = ".job-details-jobs-unified-top-card__primary-description-container";
const JOB_DESCRIPTION_CONTAINER = ".jobs-description__container";

let jobDetails = null;
let jobTitle = null;
let jobInfo = null;
let jobDescription = null;

// wait for the job data container to appear
const observer = new MutationObserver((mutations, obs) => {
  // get outer job details container
  jobDetails = document.querySelector(JOB_DETAILS_CONTAINER);
  if (jobDetails) {
    // title is in the aria-label attribute
    if (!jobTitle) {
      jobTitle = jobDetails.getAttribute("aria-label");
    }
    
    // grab the job info
    if (!jobInfo) {
      jobInfoElement = jobDetails.querySelector(JOB_INFO_CONTATINER);
      if (jobInfoElement && jobInfoElement.innerHTML.includes('white-space-pre')) {
        jobInfo = jobInfoElement.innerHTML;
      }
    }

    // grab the job description
    if (!jobDescription) {
      jobDescriptionElement = jobDetails.querySelector(JOB_DESCRIPTION_CONTAINER);
      if (jobDescriptionElement && jobDescriptionElement.innerHTML.includes('white-space-pre')) {
        jobDescription = jobDescriptionElement.innerHTML;
      }
    }

    // if we have all the data we need, stop observing
    if (jobTitle && jobInfo && jobDescription) {
      console.log("Job Title: ", jobTitle);
      console.log("Job Info: ", jobInfo);
      console.log("Job Description: ", jobDescription);
      obs.disconnect();
    }
  }
});

// start observing the document
observer.observe(document, {
  childList: true,
  subtree: true
});