chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type = 'jobDetailsToBackground') {
    console.log("Received message from scraper: ", message);
    if (message.jobDetails) {
      console.log("Job details: ", message.jobDetails);
      
      // Send the jobDetails to the gemini sidepanel
      chrome.runtime.sendMessage({ 
        type: 'processJobDetails', 
        jobDetails: message.jobDetails 
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message to gemini side panel:", chrome.runtime.lastError);
        } else {
          console.log("Message sent to gemini side panel: ", response);
        }
      });
    }
  }
});
