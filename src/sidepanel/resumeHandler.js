/*
File: resumeHandler.js
Description: deals with resumr upload and signalling a resume is avaliable
Last modified: 21/11/2024 by Ethan 
*/

// -------------------------------------------------------------------
//                             Declarations
// -------------------------------------------------------------------
const fileInput = document.getElementById("resumeFile");
var reader = new FileReader();

// -------------------------------------------------------------------
//                                 Listeners
// -------------------------------------------------------------------

// check on load if we have a resume stored, and if we do, change the content to acknowledge that.
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const storedData = await chrome.storage.local.get(["resume"]);

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
fileInput.addEventListener("input", () => {
  loadResume();
});

// on load, send to local storage and update upload status text.
reader.addEventListener("load", () => {
  try {
    resumeRead = reader.result;
    chrome.storage.local.set({ resume: resumeRead }).then(async () => {
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

function loadResume() {
  try {
    const file = document.getElementById("resumeFile").files[0];
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
    resumeStatusMsg.innerHTML = "Resume uploaded";
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
  const resumeAllowed = new Event("resumeAvaliable");
  document.dispatchEvent(resumeAllowed);
}
