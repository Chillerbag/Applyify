/*
File: popup.js
Description: the main popup. Handles opening the chosen jobsite, and opens the sidepanel to that site. 
Last modified: 21/11/2024 by Ethan 
*/

// -------------------------------------------------------------------
//                              Main EventListener
// -------------------------------------------------------------------               
document.addEventListener('DOMContentLoaded', () => {
  // content refs
  const openSidePanelButton = document.getElementById('openSidePanel');
  const openDropDownButton = document.getElementById('jobDrop');

  // when the dropdown is clicked
  openDropDownButton.addEventListener('click', async () => {
    var dropdownContent = document.getElementById("jobSiteDropdown");
    dropdownContent.classList.toggle("show");
  });

  // when the button is clicked
  openSidePanelButton.addEventListener('click', async () => {
    // open linkedin and sidepanel
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.sidePanel.open({ tabId: tab.id });
    chrome.tabs.create({url: "https://linkedin.com/jobs"});
  });
});

