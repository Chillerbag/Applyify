// popup.js
// handles the buttons and stuff in the popup using a callback function

// this is so the scraper can use the storage
//chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

document.addEventListener('DOMContentLoaded', () => {
    // TODO: ONLY OPEN IF A RESUME IS UPLOADED!
    const openSidePanelButton = document.getElementById('openSidePanel');
    const openDropDownButton = document.getElementById('jobDrop');

    openDropDownButton.addEventListener('click', async () => {
        var dropdownContent = document.getElementById("jobSiteDropdown");
        dropdownContent.classList.toggle("show");
    });

    // handle the button 
    openSidePanelButton.addEventListener('click', async () => {
      try {

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        await chrome.sidePanel.open({ tabId: tab.id });

        chrome.tabs.create({url: "https://linkedin.com/jobs"});
        
      } catch (error) {
          // dont put an error box here, it should be reliable.
          console.log(error);
      }
    });
  });



  // inserting an error textbox into the div for try catches

