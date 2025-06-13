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
    .then(data => console.log(data))
    // .then(data => {
    //     const parsed_json = JSON.parse(data)
    //     if (parsed_json.is_toxic === false){
    //         parsed_json.label = 'No Hate Speech Detected'
    //         parsed_json.score = 0.0
    //     }
    //
    //     contentIdElement.innerText = capitalizeFirstLetter(parsed_json.label)
    // });

function capitalizeFirstLetter(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
};