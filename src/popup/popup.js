/*
File: popup.js
Description: Handles opening the chosen job site and sidepanel. Contains dropdowns for selecting and saving
  default job sites using Chrome's storage API.
Last modified: 1/12/2024 by Ethan
*/

// -------------------------------------------------------------------
//                              Main EventListener
// -------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  const openSidePanelButton = document.getElementById("openSidePanel");
  const dropdownButton = document.getElementById("jobDrop");
  const dropdownContent = document.getElementById("jobSiteDropdown");
  const settingsButton = document.getElementById("settingsBtn");
  const settingsDropdown = document.getElementById("settingsDropdown");

  // Close dropdowns when clicking outside
  window.addEventListener("click", (event) => {
    if (
      !event.target.matches(".dropbtn") &&
      !event.target.matches(".settings-btn") &&
      !event.target.matches(".settings-btn img")
    ) {
      dropdownContent.classList.remove("show");
      settingsDropdown.classList.remove("show");
    }
  });

  // Toggle main dropdown
  dropdownButton.addEventListener("click", (event) => {
    event.stopPropagation();
    settingsDropdown.classList.remove("show");
    dropdownContent.classList.toggle("show");
  });

  // Toggle settings dropdown
  settingsButton.addEventListener("click", (event) => {
    event.stopPropagation();
    dropdownContent.classList.remove("show");
    settingsDropdown.classList.toggle("show");
  });

  // Handle job site selection from main dropdown
  dropdownContent.addEventListener("click", async (event) => {
    const link = event.target.closest("a");
    if (!link) return;

    const site = link.dataset.site;
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    await chrome.sidePanel.open({ tabId: tab.id });

    chrome.tabs.create({ url: getJobSiteUrl(site) });
    dropdownContent.classList.remove("show");
  });

  // Handle default job site selection from settings dropdown
  settingsDropdown.addEventListener("click", async (event) => {
    const link = event.target.closest("a");
    if (!link) return;

    const site = link.dataset.site;
    await chrome.storage.local.set({ defaultJobSite: site });
    settingsDropdown.classList.remove("show");
  });

  // Open default jobsite
  openSidePanelButton.addEventListener("click", async () => {
    const { defaultJobSite } = await chrome.storage.local.get("defaultJobSite");
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    await chrome.sidePanel.open({ tabId: tab.id });

    const url = getJobSiteUrl(defaultJobSite);
    chrome.tabs.create({ url });
  });
});

// -------------------------------------------------------------------
//                              Helper Functions
// -------------------------------------------------------------------
const getJobSiteUrl = (site) => {
  const urls = {
    indeed: "https://indeed.com",
    linkedin: "https://linkedin.com/jobs",
    seek: "https://seek.com",
  };
  return urls[site] || urls["linkedin"];
};
