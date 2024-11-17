const JOB_DATA_CONTAINER = '.jobs-description__container'

// loop until find the job data container
function grabJobData() {
  const jobData = document.querySelector(JOB_DATA_CONTAINER)

  if (jobData) {
    console.log(jobData.innerHTML)
  } else {
    grabJobData()
  }
}

grabJobData()