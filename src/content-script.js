//App Insights
// !function(T,l,y){var S=T.location,k="script",D="connectionString",C="ingestionendpoint",I="disableExceptionTracking",E="ai.device.",b="toLowerCase",w="crossOrigin",N="POST",e="appInsightsSDK",t=y.name||"appInsights";(y.name||T[e])&&(T[e]=t);var n=T[t]||function(d){var g=!1,f=!1,m={initialize:!0,queue:[],sv:"5",version:2,config:d};function v(e,t){var n={},a="Browser";return n[E+"id"]=a[b](),n[E+"type"]=a,n["ai.operation.name"]=S&&S.pathname||"_unknown_",n["ai.internal.sdkVersion"]="javascript:snippet_"+(m.sv||m.version),{time:function(){var e=new Date;function t(e){var t=""+e;return 1===t.length&&(t="0"+t),t}return e.getUTCFullYear()+"-"+t(1+e.getUTCMonth())+"-"+t(e.getUTCDate())+"T"+t(e.getUTCHours())+":"+t(e.getUTCMinutes())+":"+t(e.getUTCSeconds())+"."+((e.getUTCMilliseconds()/1e3).toFixed(3)+"").slice(2,5)+"Z"}(),name:"Microsoft.ApplicationInsights."+e.replace(/-/g,"")+"."+t,sampleRate:100,tags:n,data:{baseData:{ver:2}}}}var h=d.url||y.src;if(h){function a(e){var t,n,a,i,r,o,s,c,u,p,l;g=!0,m.queue=[],f||(f=!0,t=h,s=function(){var e={},t=d.connectionString;if(t)for(var n=t.split(";"),a=0;a<n.length;a++){var i=n[a].split("=");2===i.length&&(e[i[0][b]()]=i[1])}if(!e[C]){var r=e.endpointsuffix,o=r?e.location:null;e[C]="https://"+(o?o+".":"")+"dc."+(r||"services.visualstudio.com")}return e}(),c=s[D]||d[D]||"",u=s[C],p=u?u+"/v2/track":d.endpointUrl,(l=[]).push((n="SDK LOAD Failure: Failed to load Application Insights SDK script (See stack for details)",a=t,i=p,(o=(r=v(c,"Exception")).data).baseType="ExceptionData",o.baseData.exceptions=[{typeName:"SDKLoadFailed",message:n.replace(/\./g,"-"),hasFullStack:!1,stack:n+"\nSnippet failed to load ["+a+"] -- Telemetry is disabled\nHelp Link: https://go.microsoft.com/fwlink/?linkid=2128109\nHost: "+(S&&S.pathname||"_unknown_")+"\nEndpoint: "+i,parsedStack:[]}],r)),l.push(function(e,t,n,a){var i=v(c,"Message"),r=i.data;r.baseType="MessageData";var o=r.baseData;return o.message='AI (Internal): 99 message:"'+("SDK LOAD Failure: Failed to load Application Insights SDK script (See stack for details) ("+n+")").replace(/\"/g,"")+'"',o.properties={endpoint:a},i}(0,0,t,p)),function(e,t){if(JSON){var n=T.fetch;if(n&&!y.useXhr)n(t,{method:N,body:JSON.stringify(e),mode:"cors"});else if(XMLHttpRequest){var a=new XMLHttpRequest;a.open(N,t),a.setRequestHeader("Content-type","application/json"),a.send(JSON.stringify(e))}}}(l,p))}function i(e,t){f||setTimeout(function(){!t&&m.core||a()},500)}var e=function(){var n=l.createElement(k);n.src=h;var e=y[w];return!e&&""!==e||"undefined"==n[w]||(n[w]=e),n.onload=i,n.onerror=a,n.onreadystatechange=function(e,t){"loaded"!==n.readyState&&"complete"!==n.readyState||i(0,t)},n}();y.ld<0?l.getElementsByTagName("head")[0].appendChild(e):setTimeout(function(){l.getElementsByTagName(k)[0].parentNode.appendChild(e)},y.ld||0)}try{m.cookie=l.cookie}catch(p){}function t(e){for(;e.length;)!function(t){m[t]=function(){var e=arguments;g||m.queue.push(function(){m[t].apply(m,e)})}}(e.pop())}var n="track",r="TrackPage",o="TrackEvent";t([n+"Event",n+"PageView",n+"Exception",n+"Trace",n+"DependencyData",n+"Metric",n+"PageViewPerformance","start"+r,"stop"+r,"start"+o,"stop"+o,"addTelemetryInitializer","setAuthenticatedUserContext","clearAuthenticatedUserContext","flush"]),m.SeverityLevel={Verbose:0,Information:1,Warning:2,Error:3,Critical:4};var s=(d.extensionConfig||{}).ApplicationInsightsAnalytics||{};if(!0!==d[I]&&!0!==s[I]){var c="onerror";t(["_"+c]);var u=T[c];T[c]=function(e,t,n,a,i){var r=u&&u(e,t,n,a,i);return!0!==r&&m["_"+c]({message:e,url:t,lineNumber:n,columnNumber:a,error:i}),r},d.autoExceptionInstrumented=!0}return m}(y.cfg);function a(){y.onInit&&y.onInit(n)}(T[t]=n).queue&&0===n.queue.length?(n.queue.push(a),n.trackPageView({})):a()}(window,document,{
// src: chrome.runtime.getURL("ai.2.min.js"), // The SDK URL Source
// // name: "appInsights", // Global SDK Instance name defaults to "appInsights" when not supplied
// // ld: 0, // Defines the load delay (in ms) before attempting to load the sdk. -1 = block page load and add to head. (default) = 0ms load after timeout,
// // useXhr: 1, // Use XHR instead of fetch to report failures (if available),
// crossOrigin: "anonymous", // When supplied this will add the provided value as the cross origin attribute on the script tag
// // onInit: null, // Once the application insights instance has loaded and initialized this callback function will be called with 1 argument -- the sdk instance (DO NOT ADD anything to the sdk.queue -- As they won't get called)
// cfg: { // Application Insights Configuration
//     connectionString: "InstrumentationKey=60bae25a-b485-447e-8a18-2dcd10d6ce52;IngestionEndpoint=https://southcentralus-3.in.applicationinsights.azure.com/;LiveEndpoint=https://southcentralus.livediagnostics.monitor.azure.com/"
//     /* ...Other Configuration Options... */
// }});

var rawHints = [];
var wordList = [];
var hints = [];

function Hint(prefix, count) {
    this.prefix = prefix;
    this.count = count;
}

fetch('/2022/07/30/crosswords/spelling-bee-forum.html').then(r => r.text()).then(html => {
    var regex = / [a-z]{2}-[1-9]/gm
    while (match = regex.exec(html)) {
        rawHints.push(match[0].trim());
    }
    rawHints = rawHints.filter((v, i, a) => a.indexOf(v) === i);
    rawHints.sort();
    wordListUpdater();
});

var hives = document.getElementsByClassName('hive-action__submit');
for (let i = 0; i < hives.length; i++) {
    const element = hives[i];
    element.addEventListener("click", wordListUpdater);
}

function buildHints() {
    hints = [];
    rawHints.forEach((element, index) => {
        var parts = element.split('-');
        parts[0][1] -= ('a' - 'A');
        hints.push(new Hint(parts[0].charAt(0).toUpperCase() + parts[0].charAt(1), parseInt(parts[1])));
    });
}

window.addEventListener('keyup', function (e) {
    if (e.key === 'Enter') {
        wordListUpdater();
    }
});

function getWordList() {
    var words = document.getElementsByClassName('sb-wordlist-items-pag')[0].children
    for (let i = 0; i < words.length; i++) {
        const element = words[i];
        wordList.push(element.innerText.charAt(0).toUpperCase() + element.innerText.slice(1));
    }
    wordList.sort();
}

function wordListUpdater() {
    buildHints();
    setTimeout(() => {
        var cleanup = document.getElementsByClassName('beehive');
        let len = cleanup.length;
        console.log("found " + cleanup.length + " items to cleanup");
        var ul = document.getElementsByClassName('sb-wordlist-items-pag')[0];
        for (let i = 0; i < len; i++) {
            const element = cleanup[0];
            ul.removeChild(element);
            console.log("cleanup");
        }
        wordList = [];
        getWordList();

        let wi = 0;
        let hi = 0;
        while (hi < hints.length) {
            for (let i = 0; i < hints[hi].count; i++) {
                if (wi >= wordList.length || !wordList[wi].startsWith(hints[hi].prefix)) {
                    console.log("added " + hints[hi].prefix + " to hint list " + wi + " " + hi);
                } else {
                    wi++;
                    hints[hi].count--;
                }
            }
            if (hints[hi].count > 0) {
                appendHintPrefix(hints[hi].prefix + " (" + hints[hi].count + " more)");
            }
            hi++;
            while (wi < wordList.length && wordList[wi] < hints[hi].prefix)
                wi++;
        }
    }, 50)
}


function appendHintPrefix(prefix) {
    var ul = document.getElementsByClassName('sb-wordlist-items-pag')[0];
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(prefix));
    li.setAttribute("class", "beehive"); // added line
    ul.appendChild(li);
}