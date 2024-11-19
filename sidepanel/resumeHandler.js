
const fileInput = document.getElementById('resumeFile');
var reader = new FileReader();

// check on load if we have a resume stored, and if we do, change the content to acknowledge that.
document.addEventListener("DOMContentLoaded", async () => {
    if (await chrome.storage.local.get(["resume"])) {
        resumeUploadedChange(); 
    }

});

// on input, trigger a file load. 
fileInput.addEventListener("input", () => {
    const file = document.getElementById('resumeFile').files[0];
    if (file) {
        reader.readAsText(file, "UTF-8");
    }

});

// on load, send to local storage and update upload status text. 
reader.addEventListener(
    "load", () => {
        resumeRead = reader.result;
        chrome.storage.local.set({"resume": resumeRead}).then(() => {  
            resumeUploadedChange();    
        });
});

function resumeUploadedChange() {
    const resumeStatusMsg = document.getElementById("resumeUploadedStatus");
    resumeStatusMsg.innerHTML = "resume Uploaded!";
    resumeStatusMsg.className = "resumeUploaded";
}

    


