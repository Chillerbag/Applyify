export function errorBoxCreator(target, errorMsg) { 
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