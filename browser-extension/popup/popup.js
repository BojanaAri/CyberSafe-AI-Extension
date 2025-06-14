import {getCurrentTab} from "../background.js";

const bodyElement = document.getElementById('body');
const dogImageElement = document.getElementById('dog-gif');
const aiSpanElement = document.getElementById('ai');
const detectionIdElement = document.getElementById("detectionElement");
const reportButtonIdElement = document.getElementById("report-button");
const sicHelplineIdElement = document.getElementById('sic-helpline');
reportButtonIdElement.onclick = () => {
    chrome.runtime.sendMessage({event: 'onStart'})
};

const response = await getCurrentTab();
fetch('http://localhost:8000/api/analyze', {
    method: 'POST',
    headers:{
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({ url: response['url'] })
})
    .then(response => response.text())
    .then(data => {
        const parsed_json = JSON.parse(data)
        if (parsed_json.is_toxic === false){
            parsed_json.label = 'No Hate Speech Detected'
            parsed_json.score = 0.0
        }

        detectionIdElement.innerText = capitalizeFirstLetter(parsed_json.label);
        changeExtensionStyleDependingOnScore(parseFloat(parsed_json.score));
    });

function capitalizeFirstLetter(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function changeExtensionStyleDependingOnScore(score){
    let background_color = "rgb(87 173 148)";
    let color = "white";

    if (score >= 0.55 && score < 0.7) {
        background_color = "#bcbc45";
    } else if (score >= 0.7 && score < 0.8) {
        background_color = "#d19425";
    } else if (score >= 0.8 && score < 0.9) {
        background_color = "#cf5151";
    } else if (score >= 0.9) {
        background_color = "#ac1414";
    }

    bodyElement.style.backgroundColor = background_color;
    bodyElement.style.color = color;
    reportButtonIdElement.className = 'btn btn-outline-dark';
    dogImageElement.src = '../images/guide-dog.gif';
    aiSpanElement.className = 'text-white fw-medium';
    sicHelplineIdElement.hidden = false;
    dogImageElement.style.transform = 'scaleX(-1)';
}