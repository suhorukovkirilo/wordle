const randint = (min, max) => Math.floor(Math.random() * (max - min) + min);
const getEmpty = (v) => {for (let i of v) {if (i.innerHTML == '') {return i}}; return null};
const isSymbol = (symbol) => ('abcdefghijklmnopqrstuvwxyz'.includes(symbol));
const backspace = (div) => {if (!div.classList.contains('checked')) {div.innerHTML = ''}; block = false};

function invalidEnter(line) {
    line.classList.add('shake');
    setTimeout(() => {block = false; line.classList.remove('shake')}, 600);
};
function validEnter(line) {
    let letters = [...line.querySelectorAll('div')]; 
    check(line);
    for (let div of letters) {
        div.style.animationDelay = `${100 * letters.indexOf(div)}ms`; div.classList.add('flip-in')
    };
};

function setKeyValue (div, key) {
    div.innerHTML = key; div.classList.add('pop');
    setTimeout(() => {block = false; div.classList.remove('pop')}, 100);
};

let words = []; 
let word = null; 
let todaysWord = null; 
let block = false;
let currentLine = 1;
let length = 5;

fetch('https://cdn.jsdelivr.net/gh/words/an-array-of-english-words@2.0.0/index.json')
.then(response => response.json())
.then(data=> {words = data.filter(word => word.length == length)});

let waitForWords = setInterval(() => {
    if (words.length > 0) {
        clearInterval(waitForWords);
        word = randint(0, words.length - 1);
        todaysWord = (Math.floor(Date.now() / 86400000) ** 2 * words.length ** 2) % words.length;
    };
}, 100);

window.onkeydown = function(e) {
    let divs = [...document.querySelectorAll('.wordle .line div')];
    if (block || divs[divs.length - 1].classList.contains('checked')) return false;
    let key = e.key, div = getEmpty(divs);
    let index = divs.indexOf(div);
    let line = document.querySelector(`.wordle .line.line-${currentLine}`);
    block = true;

    if (key == 'Backspace' && index != 0) {backspace(divs[index - 1] || divs[divs.length - 1])}
    else if (key == 'Enter' && (index / length >= currentLine || index == -1)) {validEnter(line)
    }
    else if (key == 'Enter' && !(index / length >= currentLine)) {invalidEnter(line)}
    else if (div != null && isSymbol(key) && !(index / length >= currentLine)) {setKeyValue(div, key)}
    else {block = false}
};
window.onload = function() {
    createWordle(length);
    createKeyboard();
};

function check(line) {
    let letters = [...line.querySelectorAll('div')];
    let written = line.textContent.replaceAll(' ', '').replaceAll('\n', '');
    let classes = {}, count = {};

    function process(class_, checker) {
        for (let i = 0; i < words[word].length; i++) {
            if (checker(i)) {
                classes[i] = class_;
                count[written[i]] = (count[written[i]] || 0) + 1;
            };
        };
    };

    process('green', (i) => written[i] == words[word][i]);
    process('yellow', (i) => !(classes[i] && classes[i].includes('green')) && words[word].includes(written[i]) && (count[written[i]] || 0) < words[word].split(written[i]).length - 1)

    for (let i = 0; i < words[word].length; i++) {
        setTimeout(() => {
            letters[i].classList.add(classes[i], 'checked', 'flip-out'); 
            letters[i].style.animationDelay = '0ms';
        }, 100 * i + 250)
    };
    setTimeout(function() {
        if ([...line.querySelectorAll('div.green')].length >= 5) {
            document.getElementById('message').innerHTML = `You're right!`;
            block = true;
        } else if (currentLine == length + 1) {
            document.getElementById('message').innerHTML = `Correct word was '${words[word]}'`;
            block = true;
            console.log([...line.querySelectorAll('.green')].length)
        } else {
                block = false; for (let div of letters) {div.classList.remove('flip-in', 'flip-out')};
        }
        currentLine += 1;
    }, 500 + 100 * (letters.length - 1));
};

function createWordle(length) {
    const wordle = document.createElement('div');
    wordle.classList.add('wordle');
    document.body.appendChild(wordle);
    for (let i = 0; i <= length; i++) {
        let line = document.createElement('div');
        line.classList.add('line', `line-${i+1}`)
        line.innerHTML = '<div></div>'.repeat(length);
        wordle.appendChild(line);
    };
};

function createKeyboard() {
    const keyboard = document.createElement('div');
    keyboard.classList.add('keyboard');
    document.body.appendChild(keyboard);

    let row1 = 'qwertyuiop'.split('');
    let row2 = 'asdfghjkl'.split('');
    let row3 = ['Enter'].concat('zxcvbnm'.split('')).concat(['<div>Backspace</div><img src="backspace.svg">']);
    for (let symbols of [row1, row2, row3]) {
        let row = document.createElement('div');
        row.classList.add('row');
        for (let symbol of symbols) {
            row.innerHTML += `<div>${symbol}</div>`
        };
        keyboard.append(row);
    };

    for (let btn of keyboard.querySelectorAll('div div')) {
        btn.onclick = function() {window.onkeydown({key: this.textContent})};
    };
};