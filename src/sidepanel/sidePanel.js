// open the textboxes.
const showButtons = document.querySelectorAll(".showButton");
showButtons.forEach((button) => {
  button.addEventListener("click", function () {
    // get textbox
    const textbox = this.closest(".container").querySelector(".textbox");
    if (textbox.style.display === "none" || textbox.style.display === "") {
      textbox.style.display = "block"; // Show the textbox
      setTimeout(() => {
        textbox.style.maxHeight = "1000px";
        textbox.style.opacity = 1;
        button.textContent = "Hide";
      }, 0);
    } else {
      textbox.style.maxHeight = "0";
      textbox.style.opacity = 0;
      setTimeout(() => {
        textbox.style.display = "none";
      }, 300);
      button.textContent = "Show";
    }
  });
});

// copy textbox info
const copyButtons = document.querySelectorAll(".copyButton");
copyButtons.forEach((button) => {
  button.addEventListener("click", function () {
    // get textbox
    const textbox = this.closest(".container").querySelector(".textbox");
    
    // copy text to clipboard
    const textToCopy = textbox.innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
      // say copied!
      button.textContent = "Copied!";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  });
});
