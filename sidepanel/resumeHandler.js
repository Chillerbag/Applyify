
const fileInput = document.getElementById('resumeFile');
var reader = new FileReader();


fileInput.addEventListener("input", () => {
    const file = document.getElementById('resumeFile').files[0];
    if (file) {
        reader.readAsText(file, "UTF-8");
        const resumeStatusMsg = document.getElementById("resumeUploadedStatus");
        resumeStatusMsg.innerHTML = "resume Uploaded!";
        resumeStatusMsg.className = "resumeUploaded";

    }

});

reader.addEventListener(
    "load", () => {
        resumeRead = reader.result;
        document.getElementById("resumeContent").innerHTML = resumeRead;
});
    


