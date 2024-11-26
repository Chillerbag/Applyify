/*
File: popup.js
Description: the main popup. Handles opening the chosen job site, and opens the sidepanel to that site. Also
  contains a dropdown that can be used to select a specific job site.
Last modified: 25/11/2024 by Ethan
*/


// -------------------------------------------------------------------
//                              Main EventListener
// -------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const openSidePanelButton = document.getElementById('openSidePanel');
  const dropdownButton = document.getElementById('jobDrop');
  const dropdownContent = document.getElementById('jobSiteDropdown');

  // Close dropdown when clicking outside
  window.addEventListener('click', (event) => {
    if (!event.target.matches('.dropbtn')) {
      if (dropdownContent.classList.contains('show')) {
        dropdownContent.classList.remove('show');
      }
    }
  });

  // Toggle dropdown
  dropdownButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent window click event from immediately closing dropdown
    dropdownContent.classList.toggle('show');
  });

  // Handle job site selection
  dropdownContent.addEventListener('click', async (event) => {
    const link = event.target.closest('a');
    if (!link) return;

    const site = link.dataset.site;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.sidePanel.open({ tabId: tab.id });

    let url;
    switch(site) {
      case 'indeed':
        url = 'https://indeed.com';
        break;
      case 'linkedin':
        url = 'https://linkedin.com/jobs';
        break;
      case 'seek':
        url = 'https://seek.com';
        break;
      default:
        url = 'https://linkedin.com/jobs';
    }
    chrome.tabs.create({ url });
    dropdownContent.classList.remove('show');
  });

  // default button. Not sure if we need this anymore with the dropdown
  openSidePanelButton.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.sidePanel.open({ tabId: tab.id });
    chrome.tabs.create({url: "https://linkedin.com/jobs"});
  });
});