const JOB_DETAILS_CONTATINER = "job-details-jobs-unified-top-card__primary-description-container";
const JOB_DESCRIPTION_CONTAINER = ".jobs-description__container";

let jobDetails = null;
let jobDescription = null;

// wait for the job data container to appear
const observer = new MutationObserver((mutations, obs) => {
  jobDetails = document.querySelector(JOB_DETAILS_CONTATINER);
  if (jobDetails && jobDetails.innerHTML.includes('white-space-pre')) {
    console.log("Job Details: ", jobDetails.innerHTML);
    obs.disconnect();
  }

  jobDescription = document.querySelector(JOB_DESCRIPTION_CONTAINER);
  if (jobDescription && jobDescription.innerHTML.includes('white-space-pre')) {
    console.log("Job Description: ", jobDescription.innerHTML);
    obs.disconnect();
  }
});

// start observing the document
observer.observe(document, {
  childList: true,
  subtree: true
});