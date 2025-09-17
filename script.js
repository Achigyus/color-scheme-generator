const colorInput = document.getElementById("color_input");
const schemeSelect = document.getElementById("mode_select");
const generateButton = document.getElementById("get_colors_btn");
const form = document.getElementById("input_color_form");
const colorContainer = document.getElementById("display_color");

let colorScheme = "monochrome";
let colorHex = "000000";

const getColorScheme = async () => {
    const formData = new FormData(form);
    colorHex = formData.get("color").slice(1);
    colorScheme = formData.get("mode");
    const colors = await fetchColors(colorHex, colorScheme);
    console.log(colorHex, colorScheme);
    console.log(colors);
    displayColors(colors);
}

async function fetchColors(colorHex, colorScheme) {
    const response = await fetch(`https://www.thecolorapi.com/scheme?hex=${colorHex}&mode=${colorScheme}&count=4`, {
        method: "GET"
    });
    const data = await response.json();
    return data.colors;
}

function createColorBox(bgColor, label) {
    const colorWrap = document.createElement("div");
    colorWrap.classList.add("color_wrap");
    const colorDiv = document.createElement("div");
    colorDiv.classList.add("color_box");
    colorDiv.style.backgroundColor = bgColor;
    const colorInfo = document.createElement("p");
    colorInfo.innerText = label;
    colorWrap.append(colorDiv, colorInfo);

    // Add click event to copy hex code to clipboard
    colorWrap.addEventListener("click", () => {
        navigator.clipboard.writeText(label)
            .then(() => {
                // Optionally, provide feedback to the user
                colorInfo.innerText = "Copied!";
                setTimeout(() => {
                    colorInfo.innerText = label;
                }, 1000);
            });
    });

    return colorWrap;
}

function displayColors(colors) {
    colorContainer.innerHTML = "";

    colorContainer.appendChild(createColorBox(`#${colorHex}`, `#${colorHex}`));
    colors.forEach(color => {
        colorContainer.appendChild(createColorBox(color.hex.value, color.hex.value));
    });
}

// Event Listeners
form.addEventListener("submit", (e) => {
    e.preventDefault();
    getColorScheme();
});
colorInput.addEventListener("input", () => {
    getColorScheme();
});
schemeSelect.addEventListener("change", () => {
    getColorScheme();
});

document.addEventListener("DOMContentLoaded", () => {
    getColorScheme();
});