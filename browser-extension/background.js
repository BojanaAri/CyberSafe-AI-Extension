chrome.runtime.onMessage.addListener(data => {
    switch(data.event){
        case 'onStop':
            console.log("onstop")
            break;
        case 'onStart':
            console.log("onstart")
            break;
        default:
            break;
    }
})

export async function getCurrentTab(){
    let queryOptions = {
        active: true, lastFocusedWindow: true
    };

    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

