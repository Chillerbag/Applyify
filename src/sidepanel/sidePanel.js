/*
File: sidePanel.js
Description: the code for the sidePanel. Just deals with the show buttons for now. most of the work is in
  geminiResponse
Last modified: 3/12/2024 by Ethan
*/


// -------------------------------------------------------------------
//                                 Constants
// -------------------------------------------------------------------
const showButtons = document.querySelectorAll(".showButton");

// -------------------------------------------------------------------
//                                 Listeners
// -------------------------------------------------------------------
showButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const textbox = this.nextElementSibling; // get gemini textbox
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
