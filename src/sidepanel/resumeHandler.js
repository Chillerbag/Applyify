/*
File: resumeHandler.js
Description: deals with resume upload and signalling a resume is available
Last modified: 29/11/2024 by Ethan
*/

// -------------------------------------------------------------------
//                             Declarations
// -------------------------------------------------------------------
const fileInput = document.getElementById("resumeFile");
var reader = new FileReader();
let fileName = "";
let uploadedDate = "";

// -------------------------------------------------------------------
//                                 Listeners
// -------------------------------------------------------------------

// check on load if we have a resume stored, and if we do, change the content to acknowledge that.
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const storedData = await chrome.storage.local.get(["resume"]);
    fileName = (await chrome.storage.local.get(["resumeFileName"])).resumeFileName;
    uploadedDate = (await chrome.storage.local.get(["resumeUploadedDate"])).resumeUploadedDate;
    if (storedData.resume && Object.keys(storedData.resume).length > 0) {
      await updateResumeUploadStatus(true);
      permitResumeGeminiUpdating();
    } else {
      await updateResumeUploadStatus(false);
    }
  } catch {
    errorBoxCreator("body", error);
  }
});

// on input, trigger a file load.
fileInput.addEventListener("input", async () => {
  let today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  const yyyy = today.getFullYear();
  today = dd + '/' + mm + '/' + yyyy;
  await chrome.storage.local.set({resumeUploadedDate: today});
  loadResume();
});

// on load, send to local storage and update upload status text.
reader.addEventListener("load", async () => {
  try {
    resumeRead = reader.result;
    await chrome.storage.local.set({resume: resumeRead}).then(async () => {
      await updateResumeUploadStatus(true);
      permitResumeGeminiUpdating();
    });
  } catch (error) {
    errorBoxCreator("body", error);
  }
});

// -------------------------------------------------------------------
//                            Helper functions
// -------------------------------------------------------------------

async function loadResume() {
  try {
    const file = document.getElementById("resumeFile").files[0];
    fileName = file.name;
    await chrome.storage.local.set({resumeFileName: fileName});
    if (file) {
      reader.readAsText(file, "UTF-8");
    }
  } catch (error) {
    errorBoxCreator("body", error);
  }
}

async function updateResumeUploadStatus(uploaded) {
  const resumeStatusMsg = document.getElementById("resumeUploadedStatus");
  if (uploaded) {
    fileName = (await chrome.storage.local.get(["resumeFileName"])).resumeFileName;
    uploadedDate = (await chrome.storage.local.get(["resumeUploadedDate"])).resumeUploadedDate;
    resumeStatusMsg.innerHTML = `Resume uploaded: ${fileName} <br> Last uploaded on: ${uploadedDate}`;
    resumeStatusMsg.className = "resumeUploaded";
    await chrome.storage.local.set({ resumeUploaded: true });
  } else {
    resumeStatusMsg.innerHTML = "Resume not uploaded";
    resumeStatusMsg.className = "resumeNotUploaded";
    await chrome.storage.local.set({ resumeUploaded: false });
  }
}

// tell geminiResponse we can use the resume thing.
function permitResumeGeminiUpdating() {
  const resumeAllowed = new Event("resumeAvailable");
  document.dispatchEvent(resumeAllowed);
}
