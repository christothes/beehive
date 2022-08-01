var rawHints = [];
var wordList = [];
var hints = [];

function Hint(prefix, count) {
    this.prefix = prefix;
    this.count = count;
}

let d = new Date();
let yr = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
let mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
fetch(`/${yr}/${mo}/${da}/crosswords/spelling-bee-forum.html`).then(r => r.text()).then(html => {
    var regex = / [a-z]{2}-[1-9]+/gm
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
    console.log("built hints");
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
        element.removeAttribute("class", "beehive-pangram");
        if([...element.innerText.toLowerCase()].filter((v, i, a) => a.indexOf(v) === i).length == 7)
        {
            //pangram
            element.setAttribute("class", "beehive-pangram");
        }
        wordList.push(element.innerText.charAt(0).toUpperCase() + element.innerText.slice(1));
    }
    wordList.sort();
}

function wordListUpdater() {
    buildHints();
    setTimeout(() => {
        var cleanup = document.getElementsByClassName('beehive');
        let len = cleanup.length;
        var ul = document.getElementsByClassName('sb-wordlist-items-pag')[0];
        for (let i = 0; i < len; i++) {
            const element = cleanup[0];
            ul.removeChild(element);
        }
        wordList = [];
        getWordList();

        let wi = 0;
        let hi = 0;
        while (hi < hints.length) {
            let pfCount = hints[hi].count;
            for (let i = 0; i < pfCount; i++) {
                if (wi >= wordList.length || !wordList[wi].startsWith(hints[hi].prefix)) {
                    continue;
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