document.body.style.backgroundColor = 'orange';

var rawHints = ['AL-1', 'AM-2', 'AN-3', 'KO-3', 'LA-4', 'LL-2', 'LO-2', 'MA-8', 'MO-4', 'NA-2', 'WA-4', 'WO-1'];
var wordList = [];
var hints = [];
rawHints.sort();
rawHints.forEach((element, index) => {
    var parts = element.split('-');
    parts[0][1] -= ('a' - 'A');
    hints.push(new Hint(parts[0].charAt(0) + parts[0].charAt(1).toLowerCase(), parseInt(parts[1])));
});

function Hint(prefix, count) {
    this.prefix = prefix;
    this.count = count;
}

var hives = document.getElementsByClassName('hive-action__submit');
for (let i = 0; i < hives.length; i++) {
    const element = hives[i];
    element.addEventListener("click", wordListUpdater);
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
            foundMatch = false;
            for (let i = 0; i < hints[hi].count; i++) {
                if (wi >= wordList.length || !wordList[wi].startsWith(hints[hi].prefix)) {
                    console.log("added " + hints[hi].prefix + " to hint list " + wi + " " + hi);
                    appendHintPrefix(hints[hi].prefix);
                } else {
                    foundMatch = true;
                    wi++;
                }
            }
            hi++;
            while (wi < wordList.length && wordList[wi] < hints[hi].prefix)
                wi++;
        }
    }, 100)
}


function appendHintPrefix(prefix) {
    var ul = document.getElementsByClassName('sb-wordlist-items-pag')[0];
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(prefix));
    li.setAttribute("class", "beehive"); // added line
    ul.appendChild(li);
}