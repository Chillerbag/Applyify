const fileInput = document.getElementById("resumeFile");
var reader = new FileReader();

// check on load if we have a resume stored, and if we do, change the content to acknowledge that.
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const storedData = await chrome.storage.local.get(["resume"]);
    if (storedData.resume && Object.keys(storedData.resume).length > 0) {
        console.log("resume uploaded!");
        console.log("resume: ", storedData.resume);
        await resumeUploadedChange();
        permitResumeGeminiUpdating();
    }
  } catch {
    errorBoxCreator("body", error);
  }
});

// on input, trigger a file load.
fileInput.addEventListener("input", () => {
    try {
        const file = document.getElementById("resumeFile").files[0];
        if (file) {
            reader.readAsText(file, "UTF-8");
        }
    } catch (error) {
        errorBoxCreator("body", error);
    }
});

// on load, send to local storage and update upload status text.
reader.addEventListener("load", () => {
    try {
        resumeRead = reader.result;
        chrome.storage.local.set({ resume: resumeRead }).then(() => {
            resumeUploadedChange();
            permitResumeGeminiUpdating();
        });
    } catch {
        errorBoxCreator("body", error);
    }
});

async function resumeUploadedChange() {
  const resumeStatusMsg = document.getElementById("resumeUploadedStatus");
  resumeStatusMsg.innerHTML = "resume Uploaded!";
  resumeStatusMsg.className = "resumeUploaded";
  await chrome.storage.local.set({ resumeUploaded: true });
}


async function permitResumeGeminiUpdating() { 
    const resumeAllowed = new Event("resumeAvaliable");
    document.dispatchEvent(resumeAllowed);
}
