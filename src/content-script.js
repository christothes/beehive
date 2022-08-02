var rawHints = [];
var wordList = [];
var wordListMap = new Map();
var hiveMap = new Map();
var hints = [];
var wordLengths = new Map();
wordLengths.set('*', []);
var lengthsDiv
var span;
var spanHeader;
var hintTable;

function Hint(prefix, count) {
    this.prefix = prefix;
    this.count = count;
}

// build hint data from hints page
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

    // parse the DOM
    var parser = new DOMParser();
    // Parse the text
    var doc = parser.parseFromString(html, "text/html");
    var table = doc.querySelector('table');
    var cells = table.querySelectorAll("td");
    let rowLen = 1;
    let curLetter = ' ';
    for (var i = 0; i < cells.length; i++) {
        let cellText = cells[i].innerText;
        if (rowLen == 1) {
            if (cellText.indexOf(':') >= 0) {
                rowLen = i;
                curLetter = cellText.charAt(0).toUpperCase();
                wordLengths.set(curLetter, []);
                console.log(`wordLengths: found rowLen ${rowLen} for '${cellText}'`);
            } else if (i > 0 && cellText != 'Σ') {
                wordLengths.get('*').push(parseInt(cellText));
            }
        } else {
            let index = i % rowLen;
            if (index == 0) {
                curLetter = cellText.charAt(0).toUpperCase();
                wordLengths.set(curLetter, []);
            }
            else if (index < rowLen) {
                let parsed = parseInt(cellText);
                wordLengths.get(curLetter).push(isNaN(parsed) ? 0 : parsed);
            }
        }
        console.log(`wordLengths: ${cellText} ${i % rowLen}`);
    }
    console.log(wordLengths);
    createTooltip();
});

// attach handlers to the 'Enter' button
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

// attach handlers to hover on hives
var hives = document.getElementsByClassName('hive-cell');
for (let i = 0; i < hives.length; i++) {
    const element = hives[i];
    element.addEventListener("mouseenter", showLengthHints);
    element.addEventListener("mouseleave", hideLengthHints);
}

// Build the hints
function buildHints() {
    hints = [];
    rawHints.forEach((element, index) => {
        var parts = element.split('-');
        parts[0][1] -= ('a' - 'A');
        hints.push(new Hint(parts[0].charAt(0).toUpperCase() + parts[0].charAt(1), parseInt(parts[1])));
    });
    console.log("built hints");
}

// Get the words already submitted from the word bank
function getWordList() {
    // clone the wordLength map
    let remainingLengths = new Map();
    var keys = wordLengths.keys();
    for (const key of keys) {
        remainingLengths.set(key, [...wordLengths.get(key)]);
    }

    var words = document.getElementsByClassName('sb-wordlist-items-pag')[0].children
    for (let i = 0; i < words.length; i++) {
        const element = words[i];
        const text = element.innerText;
        let len = text.length;
        var arr = remainingLengths.get(text.charAt(0).toUpperCase());
        arr[len - remainingLengths.get('*')[0]]--;
        arr[arr.length -1]--;
        element.removeAttribute("class", "beehive-pangram");
        if ([...text.toLowerCase()].filter((v, i, a) => a.indexOf(v) === i).length == 7) {
            //this is a pangram
            element.setAttribute("class", "beehive-pangram");
        }
        wordList.push(text.charAt(0).toUpperCase() + text.slice(1));
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
        buildhintTable();
    }, 50)
}

function buildhintTable() {
    var html = [];
    addTableRow(html, '*', true);
    var keys = wordLengths.keys();
    for (const key of keys) {
        if (key == "*" || key == 'Σ')
            continue;
        addTableRow(html, key, false);
    }

    var tableHtml = html.join("");
    hintTable.innerHTML = tableHtml;
    lengthsDiv.setAttribute('class', 'hinttooltip showtooltip');
}

function showLengthHints() {
    lengthsDiv.setAttribute('class', 'hinttooltip showtooltip');
}

function addTableRow(arr, key, isHeader) {
    data = wordLengths.get(key);
    arr.push('<tr class="bhrow">');
    if (isHeader)
            arr.push('<th class="bhheadercell"> </th>');
        else
            arr.push(`<td class="bhcell">${key}</td>`);
    for (let i = 0; i < data.length; i++) {
        const cell = data[i];
        if (isHeader)
            arr.push(`<th class="bhheadercell">${cell}</th>`);
        else
            arr.push(`<td class="bhcell">${cell}</td>`);
    }
    arr.push("</tr>");
}

function hideLengthHints(evt) {
    lengthsDiv.setAttribute('class', 'hinttooltip');
}

function createTooltip() {
    //sb-controls
    var controls = document.getElementsByClassName('sb-controls')[0];
    var hives = document.getElementsByClassName('hive-cell');
    lengthsDiv = document.createElement("div");
    lengthsDiv.setAttribute("class", "hinttooltip");
    hintTable = document.createElement("table");
    hintTable.setAttribute("class", "bhtable");
    lengthsDiv.appendChild(hintTable);

    // Get the parent's first child
    let theFirstChild = controls.firstChild
    // Insert the new element before the first child
    controls.insertBefore(lengthsDiv, theFirstChild)

    for (let index = 0; index < 7; index++) {
        let hive = hives[index];
        var hiveTexts = hive.getElementsByTagName('text');
        if (hiveTexts.length == 1) {
            var hiveText = hiveTexts[0];
            hiveMap.set(hive, hiveText.textContent.toUpperCase());
        }
    }
}

function appendHintPrefix(prefix) {
    var ul = document.getElementsByClassName('sb-wordlist-items-pag')[0];
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(prefix));
    li.setAttribute("class", "beehive"); // added line
    ul.appendChild(li);
}