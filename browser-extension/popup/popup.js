import {getCurrentTab} from "../background.js";

const contentIdElement = document.getElementById("content");
const reportButtonIdElement = document.getElementById("report-button");
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
    .then(data => console.log(data));

