
const fileInput = document.getElementById('resumeFile');
var reader = new FileReader();


fileInput.addEventListener("input", () => {

    const file = document.getElementById('resumeFile').files[0];
    if (file) {
        console.log("made it at least this far");
        document.getElementById("resumeUploadedStatus").innerHTML = "resume Uploaded!";
        // TODO: should this be var? 
        reader.readAsText(file, "UTF-8");
    }

});

reader.addEventListener(
    "load", () => {
        resumeRead = reader.result;
        console.log(resumeRead);
});
    


