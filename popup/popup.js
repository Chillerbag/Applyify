// popup.js
// handles the buttons and stuff in the popup using a callback function
document.addEventListener('DOMContentLoaded', () => {
    // TODO: ONLY OPEN IF A RESUME IS UPLOADED!
    const openSidePanelButton = document.getElementById('openSidePanel');
    const file = document.getElementById('resumeFile').files[0];
    var reader = new FileReader();
    
    // handle the button 
    openSidePanelButton.addEventListener('click', async () => {
      try {
        console.log("ok that worked!")
        // Get the current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Open the side panel

        // CHECK HERE IF WE CAN OPEN THE SIDEPANEL OR NOT, I.E, ARE WE ON LINKEDIN.
        await chrome.sidePanel.open({ tabId: tab.id });
        
        // Optionally close the popup
        window.close();
      } catch (error) {
        console.error('Error opening side panel:', error);
      }
    });

    // if we have loaded and read the file? 
    reader.addEventListener(
      "load",
      () => {
        resumeRead = reader.result;
        console.log(resumeRead);
      }
    )

    // unsure of what this actually does. 
    if (file) {
      console.log("made it at least this far");
      document.getElementById("resumeUploadedStatus").innerHTML = "resume Uploaded!";
      // TODO: should this be var? 
      reader.readAsText(file, "UTF-8");
    }
  });