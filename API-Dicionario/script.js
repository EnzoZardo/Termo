const request = async(link) => {
    const response = await fetch(link);
    const json = await response.json();
    return json;
}

const getRandomWord = async() => {
    return request(`https://api.dicionario-aberto.net/random`);
}

const getNearWords = async(word) => {
    return request(`https://api.dicionario-aberto.net/near/${word}`);
}

const getWordData = async(word) => {
    return request(`https://api.dicionario-aberto.net/word/${word}`);
}

const readXML = (xmlString) => {
    return (new DOMParser()).parseFromString(xmlString, "text/xml");
}

const generateBoard = () => {
    let tableDiv = document.getElementById('termo');
    for (let y = 0; y < 6; y++) {
        let rowDiv = document.createElement('div');
        rowDiv.className = `row-div ${y == 0? "enabled":"dis"}`;
        tableDiv.appendChild(rowDiv);
        for (let x = 0; x < 5; x++) {
            let cellDiv = document.createElement('div');
            cellDiv.className = `cell-div empty ${y == 0 && x == 0? "active":"nacti"}`;
            cellDiv.addEventListener('click', (event) => {
                if (event.target.parentNode.className.includes('enabled')) {
                    for (child of event.target.parentNode.children) {
                        if (child == event.target) {
                            setActiveStatus(event.target, true);
                        } else {
                            setActiveStatus(child, false);
                        }
                    }
                }
            });
            rowDiv.appendChild(cellDiv);
        }
    }
}

const moveActiveCell = (side) => {
    let cellDivs = document.querySelector('.enabled').children;
    for (let i = 0; i < cellDivs.length; i++) {
        if (cellDivs.item(i).className.includes("active")) {
            setActiveStatus(cellDivs.item(i), false);
            try {
                setActiveStatus(cellDivs.item(i + side), true);
            } catch (Exception) {
                setActiveStatus(cellDivs.item(side > 0 ? 0 : cellDivs.length - 1), true);
            }
            break;
        }
    }
}

const isAllFull = () => {
    let cellDivs = document.querySelector('.enabled').children;
    for (child of cellDivs) {
        if (child.className.includes('empty')) {
            return false;
        }
    }
    return true;
}

const wordExists = async(word) => {
    return ((await getWordData(word)).length != 0);
}

const moveEnabledRow = (side) => {
    let cellRows = document.querySelector('#termo').children;
    for (let i = 0; i < cellRows.length; i++) {
        if (cellRows.item(i).className.includes("enabled")) {
            setEnabledStatus(cellRows.item(i), false);
            try {
                setEnabledStatus(cellRows.item(i + side), true);
            } catch (Exception) {
                setEnabledStatus(cellRows.item(i), true);
            }
            break;
        }
    }
}

document.addEventListener('keyup', async(event) => {
    if (event.key == "ArrowRight") {
        moveActiveCell(1);
    }
    if (event.key == "ArrowLeft") {
        moveActiveCell(-1);
    }
    if (event.key == "Backspace") {
        let active = document.querySelector('.enabled .active');
        active.innerHTML = "";
        active.className = active.className.replace("full", "empty");
        moveActiveCell(-1);
    }
    if (event.key == "Enter") {
        if (isAllFull()) {
            console.log(getEnabledWord());
            console.log((await getWordData(getEnabledWord())).word);
            let exists = await wordExists(getEnabledWord().toLocaleLowerCase());
            if (exists) {
                moveEnabledRow(1);
            } else {
                alert("Palavra não existente // Trocar isso por um alerta bonito");
            }
        } else {
            alert("Falta preencher ainda // Trocar isso por um alerta bonito");
        }
    }
});

const getEnabledWord = () => {
    let enabled = document.querySelector('.enabled').children;
    let word = "";
    for (child of enabled) {
        word += child.innerHTML;
    }
    return word;
}

document.addEventListener('keypress', (event) => {
    let alphabet = "abcdefghijklmnopqrstuvwxyz";
    let activeCellDiv = document.querySelector('.enabled .active');
    if (alphabet.includes(event.key) || alphabet.toLocaleUpperCase().includes(event.key)) {
        activeCellDiv.innerHTML = event.key.toLocaleUpperCase();
        activeCellDiv.className = activeCellDiv.className.replace("empty", "full");
        moveActiveCell(1);
    }
})

const setActiveStatus = (element, status) => {
    element.className = status ? element.className.replace("nacti", "active") : element.className.replace("active", "nacti");
    element.style.borderBottom = status ? "solid #000000 5px" : "none";
}

setEnabledStatus = (element, status) => {
    let children = element.children;
    if (status) {
        for (let y = 0; y < children.length; y++) {
            if (y == 0) {
                setActiveStatus(children[y], true);
            }
            children[y].style.backgroundColor = "#3016c4";
        }
    } else {
        let word = document.getElementsByTagName('h1')[0].innerHTML.split(" ")[document.getElementsByTagName('h1')[0].innerHTML.split(" ").length - 1]
        let colors = verifyWords(word, getEnabledWord());
        for (let y = 0; y < children.length; y++) {
            setActiveStatus(children[y], false);
            // AQUI ACONTECE A VERIFICAÇÃO DA PALAVRA, APERFEIÇOAR
            // ADICIONAR REQUISIÇÃO PRA VERIFICAR SE A PALAVRA TESTADA TÁ NO DICIONÁRIO
            children[y].style.transition = `all ${1}s ${0.1 * (y + 1)}s`;
            children[y].style.backgroundColor = colors.get(y);
            children[y].style.transform = "rotateY(180deg) scale(-1, 1)";
        }
    }
    element.className = status ? element.className.replace("dis", "enabled") : element.className.replace("enabled", "dis");
}

const replaceByIndex = (str, new_char, index) => {
    splited = str.split('');
    splited[index] = new_char;
    return splited.join('');
}

const verifyWords = (mainWord, testWord) => {

    const colorMap = new Map();
    const mainChars = mainWord.split("");
    for (let i = 0; i < mainWord.length; i++) {
        colorMap.set(i, "#3016c4");
    }
    // Checa as letras que estão na posição correta
    for (let i = 0; i < mainChars.length; i++) {
        if (mainChars[i] === testWord[i]) {
            colorMap.set(i, "green");
            mainChars[i] = null;
        }
    }

    // Checa as letras que estão corretas, mas na posição errada
    for (let i = 0; i < mainChars.length; i++) {
        const testChar = testWord[i];
        if (testChar !== null && mainChars.includes(testChar)) {
            colorMap.set(i, "yellow");
            const index = mainChars.indexOf(testChar);
            mainChars[index] = null;
        }
    }

    // Retorna o Map com as cores correspondentes
    return colorMap;
}

const count = (word, char) => {
    let count = 0;
    for (letter of word) {
        if (char == letter) count++;
    }
    return count;
}

const main = async() => {
    generateBoard();
    let words = [];
    while (words.length == 0) {
        words = (await getNearWords((await getRandomWord()).word.slice(0, 5))).filter((val) => { return val.length == 5 });
    }
    let word = words[0];
    document.getElementsByTagName('h1')[0].innerHTML += " " + word.toLocaleUpperCase();
}


main();