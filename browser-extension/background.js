
export async function getAnalysis(updateCallback){
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

            updateCallback({ label: parsed_json.label, score: parseFloat(parsed_json.score) });
        })
        .catch(error => {
            updateCallback({ label: error, score: 1.0 });
        });
}

export async function submitReport({flaggedText, reason, contentType}){
    try {
        const response = await fetch('http://localhost:8000/api/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                flagged_text: flaggedText,
                content_type: contentType,
                reason: reason,
            })
        });

        const result = await response.json();
        if (response.ok) {
            alert("Report submitted. Thank you!");
            document.getElementById('flagged_text').value = '';
            document.getElementById('reason').value = '';
        } else {
            console.error(result);
            alert("Something went wrong. Try again later.");
        }
    } catch (e) {
        console.error(e);
        alert("Failed to submit report.");
    }
}


export async function getCurrentTab(){
    let queryOptions = {
        active: true, lastFocusedWindow: true
    };

    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

