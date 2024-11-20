
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message from scraper: ", message);
  if (message.jobDetails) {
    console.log("Job details: ", message.jobDetails);
    promptGemini(jobDetails);
  }
});
