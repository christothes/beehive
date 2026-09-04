var wordListMap = new Map();
var hiveMap = new Map();
var wordLengths = new Map();
var wordPrefixes = new Map();
wordLengths.set('*', []);
var lengthsDiv
var hintTable;
var twoLetterList;
var wordListUpdateTimer;
var lastWordListSignature = '';

// Build hint data from the puzzle data embedded in the Spelling Bee page.
fetch('/puzzles/spelling-bee')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Spelling Bee request failed with status ${response.status}`);
        }
        return response.text();
    })
    .then(html => {
        var gameData = parseGameData(html);
        populateHintData(gameData.today.answers);
        return waitForGameUi();
    })
    .then(() => {
        createTooltip();
        attachHandlers();
        wordListUpdater();
    })
    .catch(error => {
        console.error('BeeHive could not initialize the Spelling Bee hints.', error);
    });

function waitForGameUi() {
    if (isGameUiReady()) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        var observer = new MutationObserver(() => {
            if (isGameUiReady()) {
                clearTimeout(timeout);
                observer.disconnect();
                resolve();
            }
        });
        var timeout = setTimeout(() => {
            observer.disconnect();
            reject(new Error('The Spelling Bee game UI did not become ready'));
        }, 15000);

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    });
}

function isGameUiReady() {
    return document.getElementsByClassName('sb-controls').length > 0
        && document.getElementsByClassName('sb-wordlist-items-pag').length > 0
        && document.getElementsByClassName('hive-cell').length >= 7;
}

function parseGameData(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, "text/html");
    var marker = 'window.gameData =';
    var script = Array.from(doc.scripts).find(element => element.textContent.includes(marker));

    if (!script) {
        throw new Error('The Spelling Bee page did not include game data');
    }

    var json = script.textContent.slice(script.textContent.indexOf(marker) + marker.length).trim();
    if (json.endsWith(';')) {
        json = json.slice(0, -1);
    }

    var gameData = JSON.parse(json);
    if (!gameData.today || !Array.isArray(gameData.today.answers)) {
        throw new Error('The Spelling Bee page included invalid game data');
    }

    return gameData;
}

function populateHintData(answers) {
    var lengthCounts = new Map();
    var lengths = new Set();

    wordListMap.clear();
    wordPrefixes.clear();
    answers.forEach(answer => {
        var normalizedAnswer = answer.toLowerCase();
        if (wordListMap.has(normalizedAnswer)) {
            return;
        }

        var firstLetter = normalizedAnswer.charAt(0).toUpperCase();
        var prefix = normalizedAnswer.slice(0, 2).toUpperCase();
        var length = normalizedAnswer.length;

        wordListMap.set(normalizedAnswer, prefix);
        wordPrefixes.set(prefix, (wordPrefixes.get(prefix) || 0) + 1);
        lengths.add(length);

        if (!lengthCounts.has(firstLetter)) {
            lengthCounts.set(firstLetter, new Map());
        }
        var countsForLetter = lengthCounts.get(firstLetter);
        countsForLetter.set(length, (countsForLetter.get(length) || 0) + 1);
    });

    var sortedLengths = Array.from(lengths).sort((a, b) => a - b);
    wordLengths.clear();
    wordLengths.set('*', [...sortedLengths, 'Σ']);

    Array.from(lengthCounts.keys()).sort().forEach(letter => {
        var countsForLetter = lengthCounts.get(letter);
        var counts = sortedLengths.map(length => countsForLetter.get(length) || 0);
        wordLengths.set(letter, [...counts, counts.reduce((sum, count) => sum + count, 0)]);
    });

    var totals = sortedLengths.map(length =>
        Array.from(lengthCounts.values())
            .reduce((sum, countsForLetter) => sum + (countsForLetter.get(length) || 0), 0)
    );
    wordLengths.set('Σ', [...totals, answers.length]);
}

function attachHandlers() {
    var submitButtons = document.getElementsByClassName('hive-action__submit');
    for (let i = 0; i < submitButtons.length; i++) {
        submitButtons[i].addEventListener("click", wordListUpdater);
    }

    window.addEventListener('keyup', function (e) {
        if (e.key === 'Enter') {
            wordListUpdater();
        }
    });

    setInterval(updateWordListIfChanged, 250);

    var hives = document.getElementsByClassName('hive-cell');
    for (let i = 0; i < hives.length; i++) {
        hives[i].addEventListener("mouseenter", showLengthHints);
        hives[i].addEventListener("mouseleave", hideLengthHints);
    }
}

// Get the words already submitted from the word bank
function getWordList() {
    // clone the wordLength map
    let remainingLengths = new Map();
    var keys = wordLengths.keys();
    for (const key of keys) {
        remainingLengths.set(key, [...wordLengths.get(key)]);
    }
    var remainingPrefixes = new Map(wordPrefixes);

    var submittedWords = new Set();
    var foundWordEntries = getFoundWordEntries();
    for (let i = 0; i < foundWordEntries.length; i++) {
        const element = foundWordEntries[i].element;
        const text = foundWordEntries[i].text;
        let len = text.length;
        var wordLenArr = remainingLengths.get(text.charAt(0).toUpperCase());
        var wordLenIndex = remainingLengths.get('*').indexOf(len);
        var totalsArr = remainingLengths.get('Σ');
        var prefix = wordListMap.get(text);
        if (prefix
            && !submittedWords.has(text)
            && wordLenArr
            && wordLenIndex >= 0) {
            submittedWords.add(text);
            wordLenArr[wordLenIndex]--;
            wordLenArr[wordLenArr.length - 1]--;
            totalsArr[wordLenIndex]--;
            totalsArr[totalsArr.length - 1]--;
            remainingPrefixes.set(prefix, remainingPrefixes.get(prefix) - 1);
        }

        element.classList.remove("beehive-pangram");
        if ([...text.toLowerCase()].filter((v, i, a) => a.indexOf(v) === i).length == 7) {
            //this is a pangram
            element.classList.add("beehive-pangram");
        }
    }

    lastWordListSignature = Array.from(submittedWords).sort().join('|');
    buildhintTable(remainingLengths);
    buildTwoLetterList(remainingPrefixes);
}

function getFoundWordEntries() {
    var entries = [];
    var wordLists = document.getElementsByClassName('sb-wordlist-items-pag');

    for (let i = 0; i < wordLists.length; i++) {
        var candidates = wordLists[i].querySelectorAll('*');
        for (let j = 0; j < candidates.length; j++) {
            var text = candidates[j].textContent.trim().toLowerCase();
            if (wordListMap.has(text)) {
                entries.push({ element: candidates[j], text });
            }
        }
    }

    return entries;
}

function updateWordListIfChanged() {
    var foundWords = new Set(getFoundWordEntries().map(entry => entry.text));
    var signature = Array.from(foundWords).sort().join('|');
    if (signature != lastWordListSignature) {
        wordListUpdater();
    }
}

function wordListUpdater() {
    clearTimeout(wordListUpdateTimer);
    wordListUpdateTimer = setTimeout(() => {
        getWordList();
    }, 50);
}

function buildhintTable(wordData) {
    var html = ['<tbody>'];
    addTableRow(html, '*', wordData, true);
    var keys = wordData.keys();
    for (const key of keys) {
        if (key == "*" || key == 'Σ')
            continue;
        addTableRow(html, key, wordData, false);
    }
    addTableRow(html, 'Σ', wordData, true);
    html.push('</tbody>');
    var tableHtml = html.join("");
    hintTable.innerHTML = tableHtml;
}

function buildTwoLetterList(prefixData) {
    var html = [];
    var currentFirstLetter = '';

    Array.from(prefixData.keys()).sort().forEach(prefix => {
        var firstLetter = prefix.charAt(0);
        if (firstLetter != currentFirstLetter) {
            if (currentFirstLetter) {
                html.push('</div>');
            }
            currentFirstLetter = firstLetter;
            html.push('<div class="bhtwoletterrow">');
        }
        html.push(`<span class="bhtwoletteritem">${prefix}-${prefixData.get(prefix)}</span>`);
    });

    if (currentFirstLetter) {
        html.push('</div>');
    }
    twoLetterList.innerHTML = html.join('');
}

function showLengthHints() {
    lengthsDiv.setAttribute('class', 'hinttooltip showtooltip');
}

function addTableRow(arr, key, map, isHeader) {
    var data = map.get(key);
    var isTotalRow = key == 'Σ';
    arr.push('<tr class="bhrow">');

    if (key == '*') {
        arr.push('<th class="bhheadercell" scope="col"></th>');
    } else {
        var label = isTotalRow ? 'Σ:' : `<span>${key}</span>:`;
        var labelClass = isTotalRow ? 'bhlabelcell bhheadercell' : 'bhlabelcell';
        arr.push(`<th class="${labelClass}" scope="row">${label}</th>`);
    }

    for (let i = 0; i < data.length; i++) {
        const cell = data[i];
        var isTotalColumn = i == data.length - 1;
        var cellClass = isHeader || isTotalRow || isTotalColumn ? 'bhheadercell' : 'bhcell';
        if (isTotalRow && isTotalColumn) {
            cellClass += ' bhgrandtotal';
        }
        var cellValue = cell == 0 && !isHeader && !isTotalColumn ? '-' : cell;
        var tag = key == '*' ? 'th' : 'td';
        var scope = key == '*' ? ' scope="col"' : '';
        arr.push(`<${tag} class="${cellClass}"${scope}>${cellValue}</${tag}>`);
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
    var twoLetterSection = document.createElement("section");
    twoLetterSection.setAttribute("class", "bhtwoletter");
    twoLetterSection.setAttribute("aria-labelledby", "beehive-two-letter-title");
    var twoLetterTitle = document.createElement("h2");
    twoLetterTitle.setAttribute("class", "bhtwolettertitle");
    twoLetterTitle.setAttribute("id", "beehive-two-letter-title");
    twoLetterTitle.textContent = "Two letter list:";
    twoLetterList = document.createElement("div");
    twoLetterList.setAttribute("class", "bhtwoletterlist");
    twoLetterSection.appendChild(twoLetterTitle);
    twoLetterSection.appendChild(twoLetterList);
    lengthsDiv.appendChild(twoLetterSection);

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
