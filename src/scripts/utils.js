/*
File: utils.js
Description: storing utils. Runs as a content script, so we can execute it anywhere. I think
Last modified: 21/11/2024 by Ethan 
*/

function errorBoxCreator(target, errorMsg) {
  var errorDiv = document.createElement("Div");
  errorDiv.id = "errorBox";

  errorDiv.style.textAlign = "left";
  errorDiv.style.fontWeight = "bold";
  errorDiv.style.fontSize = "smaller";
  errorDiv.style.paddingTop = "15px";
  errorDiv.style.color = "lightred";

  var paragraph = document.createElement("P");
  var text = document.createTextNode(`error encountered: ${errorMsg}`);
  paragraph.appendChild(text);
  divElement.appendChild(paragraph);

  document.getElementsByTagName(target)[0].appendChild(divElement);
}
