document.body.style.backgroundColor = 'orange';
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
});

var hives = document.getElementsByClassName('hive-action__submit');
for (let i = 0; i < hives.length; i++) {
    const element = hives[i];
    element.addEventListener("click", wordListUpdater);
}

wordListUpdater();

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