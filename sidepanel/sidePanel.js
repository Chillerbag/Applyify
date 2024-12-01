// open the textboxes.
const showButtons = document.querySelectorAll('.showButton');
console.log(showButtons.length);

showButtons.forEach(button => {
    button.addEventListener('click', function () {
        const textbox = this.nextElementSibling; // get gemini textbox
        if (textbox.style.display === "none" || textbox.style.display === "") {
            textbox.style.display = "block"; // Show the textbox
            setTimeout(() => {
                textbox.style.maxHeight = '1000px';
                textbox.style.opacity = 1;
                button.textContent = 'Hide';
            }, 0);
        } else {
            textbox.style.maxHeight = '0';
            textbox.style.opacity = 0;
            setTimeout(() => {
                textbox.style.display = "none";
            }, 300);
            button.textContent = 'Show';
        }
    });
});