import {getAnalysis, submitReport} from "../background.js";

const bodyElement = document.getElementById('body');
const dogImageElement = document.getElementById('dog-gif');
const aiSpanElement = document.getElementById('ai');
const detectionIdElement = document.getElementById("detectionElement");
const reportButtonIdElement = document.getElementById("report-button");
const sicHelplineIdElement = document.getElementById('sic-helpline');
const reportSubmitIdElement = document.getElementById("submit-report");

reportButtonIdElement.addEventListener('click', () => {
    const reportForm = document.getElementById('report-form');
    reportForm.hidden = !reportForm.hidden;
});

reportSubmitIdElement.addEventListener('click', async () => {
    const flaggedText = document.getElementById('flagged_text').value;
    const reason = document.getElementById('reason').value;
    const contentType = document.getElementById('content_type').value;

    if (!flaggedText) {
        alert("Please provide the harmful content.");
        return;
    }

    await submitReport({ flaggedText, reason, contentType })
})

await getAnalysis(updateUI);

function updateUI({ label, score }) {
    detectionIdElement.innerText = capitalizeFirstLetter(label);
    changeExtensionStyleDependingOnScore(score);
}

function capitalizeFirstLetter(str){
    return str.charAt(0).toUpperCase() + str.slice(1) + " Content Detected";
}

function changeExtensionStyleDependingOnScore(score){
    let background_color = "rgb(87 173 148)";
    let color = "white";

    if (score >= 0.5){
        sicHelplineIdElement.hidden = false;
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