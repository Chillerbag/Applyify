const JOB_DATA_CONTAINER = ".jobs-description__container";
let jobData = null;

// wait for the page to load
window.addEventListener("DOMContentLoaded", function () {
  grabJobData();
});

// loop until find the job data container
function grabJobData() {
  jobData = document.querySelector(JOB_DATA_CONTAINER);
  if (jobData) {
    console.log(jobData.innerHTML);
  } else {
    console.log("Job data not found");
  }
}
