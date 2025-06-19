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
        if (typeof data === 'string' && data.trim().startsWith("<")){
            throw new Error("Processing failed. Try again later");
        }

        const parsed_json = JSON.parse(data)

        if (parsed_json['error']){
            throw new Error("Processing failed. Try again later");
        }
        if (parsed_json.is_toxic === false){
            parsed_json.label = 'No Harmful '
            parsed_json.score = 0.0
        }

        detectionIdElement.innerText = capitalizeFirstLetter(parsed_json.label);
        changeExtensionStyleDependingOnScore(parseFloat(parsed_json.score));
    })
    .catch(error => {
        console.log(error)
        detectionIdElement.innerText = error;
        changeExtensionStyleDependingOnScore(1.0);
    });

function capitalizeFirstLetter(str){
    return str.charAt(0).toUpperCase() + str.slice(1) + " Content Detected";
}

function changeExtensionStyleDependingOnScore(score){
    let background_color = "rgb(87 173 148)";
    let color = "white";

    if (score >= 0.5){
        sicHelplineIdElement.hidden = false;
        // sicHelplineIdElement.getElementById('kriz-link').style.color = "#282d30";
    }
    if (score >= 0.55 && score < 0.7) {
        background_color = "rgb(175 172 62)";
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
    dogImageElement.style.transform = 'scaleX(-1)';
}