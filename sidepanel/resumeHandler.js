const fileInput = document.getElementById("resumeFile");
var reader = new FileReader();

// check on load if we have a resume stored, and if we do, change the content to acknowledge that.
document.addEventListener("DOMContentLoaded", async () => {
  const storedData = await chrome.storage.local.get(["resume"]);
  if (storedData.resume && Object.keys(storedData.resume).length > 0) {
    console.log("resume uploaded!");
    console.log("resume: ", storedData.resume);
    await resumeUploadedChange();
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
        errorBoxCreator("body", error)
    }
});

// on load, send to local storage and update upload status text.
reader.addEventListener("load", () => {
  resumeRead = reader.result;
  chrome.storage.local.set({ resume: resumeRead }).then(() => {
    resumeUploadedChange();
  });
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



// TODO: THIS IS DUPLICATE CODE, FIGURE OUT HOW WE CAN ACCESS IT WITHOUT CHROME CRYING OVER SECURITY!
function errorBoxCreator(target, errorMsg) { 
    // Creating a div element
    var errorDiv = document.createElement("Div");
    errorDiv.id = "errorBox";
  
    // Styling it
    errorDiv.style.textAlign = "left";
    errorDiv.style.fontWeight = "bold";
    errorDiv.style.fontSize = "smaller";
    errorDiv.style.paddingTop = "15px";
    errorDiv.style.color = "lightred";
  
    // Adding a paragraph to it
    var paragraph = document.createElement("P");
    var text = document.createTextNode(`error encountered: ${errorMsg}`);
    paragraph.appendChild(text);
    divElement.appendChild(paragraph);
  
    // Appending the div element to the target
    document.getElementsByTagName(target)[0].appendChild(divElement);
  
  
  }