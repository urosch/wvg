let psshs=chrome.extension.getBackgroundPage().getPsshs();
let requests=chrome.extension.getBackgroundPage().getRequests();
let pageURL=chrome.extension.getBackgroundPage().getPageURL();

async function guess(){
    //Init Pyodide
    let pyodide = await loadPyodide();
    await pyodide.loadPackage(["certifi-2024.2.2-py3-none-any.whl","charset_normalizer-3.3.2-py3-none-any.whl","construct-2.8.8-py2.py3-none-any.whl","idna-3.6-py3-none-any.whl","packaging-23.2-py3-none-any.whl","protobuf-4.24.4-cp312-cp312-emscripten_3_1_52_wasm32.whl","pycryptodome-3.20.0-cp35-abi3-emscripten_3_1_52_wasm32.whl","pymp4-1.4.0-py3-none-any.whl","pyodide_http-0.2.1-py3-none-any.whl","pywidevine-1.8.0-py3-none-any.whl","requests-2.31.0-py3-none-any.whl","urllib3-2.2.1-py3-none-any.whl"].map(e=>"wheels/"+e))

    //Configure Guesser
    let vars=`pssh="${document.getElementById('pssh').value}"\n`
    vars+=`licUrl="${requests[userInputs['license']]['url']}"\n`
    vars+=`licHeaders='${requests[userInputs['license']]['headers'].replace(/\\/g, "\\\\")}'\n`
    vars+=`licBody="${requests[userInputs['license']]['body']}"\n`
    let pre=await fetch('python/pre.py').then(res=>res.text())
    let after=await fetch('python/after.py').then(res=>res.text())
    let scheme=await fetch(`python/schemes/${document.getElementById("scheme").value}.py`).then(res=>res.text())

    //Get result
    let result = await pyodide.runPythonAsync([vars, pre, scheme, after].join("\n"));
    document.getElementById('result').value=result;

    //Save history
    let historyData={
        PSSH: document.getElementById('pssh').value,
        KEYS: result.split("\n").slice(0,-1)
    }
    chrome.storage.local.set({[pageURL]: historyData}, function () {});
}

function copyResult(){
    this.select();
    navigator.clipboard.writeText(this.value);
}

window.corsFetch = (u, m, h, b) => {
    chrome.runtime.sendMessage({type:"FETCH", u:u, m:m, h:h, b:b}, function(response) {
        console.log(response)
    });
}

if(psshs.length!=0){
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('noEME').style.display='none';
        document.getElementById('home').style.display='block';
        document.getElementById('guess').addEventListener("click", guess);
        document.getElementById('result').addEventListener("click", copyResult);
        drawList(psshs,'psshSearch','psshList','pssh');
        drawList(requests.map(r => r['url']),'requestSearch','requestList','license');
        if(psshs.length==1){
            document.getElementById('pssh').value=psshs[0];
        }
    });
}
