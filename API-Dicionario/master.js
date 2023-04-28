const KEYS = {
    Right: "ArrowRight",
    Left: "ArrowLeft",
    Backspace: "Backspace",
    Enter: "Enter"
};

const CLASSNAMES = {
    Root: "termo",
    DisabledRow: "r0",
    EnabledRow: "r1",
    DisabledCell: "c0",
    EnabledCell: "c1",
    EmptyCell: "empty",
    FullCell: "full"
};

const DIRECTIONS = {
    Forward: 1,
    Backward: -1
}

const WORD = {
    Word: "",
    Data: ""
};

/*
 Função de requisição genérica
*/
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

/*
 Faz uma requisição pela palavra e verifica seu array
 de dados, e caso esteja vazio, retorna falso.
*/
const wordExists = async(word) => {
    return ((await getWordData(word)).length != 0);
}

const generateBoard = (width, height) => {
    let tableDiv = document.querySelector(`.${CLASSNAMES.Root}`);
    for (let y = 0; y < height; y++) {
        let rowDiv = document.createElement('div');
        rowDiv.className = `row-div ${y == 0? CLASSNAMES.EnabledRow : CLASSNAMES.DisabledRow}`;
        tableDiv.appendChild(rowDiv);
        for (let x = 0; x < width; x++) {
            let cellDiv = document.createElement('div');
            cellDiv.className = `cell-div ${CLASSNAMES.EmptyCell} ${y == 0 && x == 0? CLASSNAMES.EnabledCell : CLASSNAMES.DisabledCell}`;
            cellDiv.addEventListener('click', (event) => {
                if (event.target.parentNode.className.includes(CLASSNAMES.EnabledRow)) {
                    for (child of event.target.parentNode.children) {
                        if (child == event.target) {
                            setCellStatus(event.target, true);
                        } else {
                            setCellStatus(child, false);
                        }
                    }
                }
            });
            rowDiv.appendChild(cellDiv);
        }
    }
}

/*
 Pega a linha ativa (r1) e percorre suas células filhas
 Quando passar pela célula atualmente ativa, irá desati-
 var o status dela e ativar a célula seguinte.
 Obs.: Caso ocorra alguma exceção, ele irá verificar o 
 parametro side: se o parametro for maior que 0, signi-
 fica que estamos indo para a direita e chegamos no li-
 mite, neste caso vamos para a posição zero da linha e, 
 caso seja menor que zero, vamos para a última da linha.
*/
const moveActiveInList = (side, who, included, setStatus, canBack) => {
    let cells = document.querySelector(who).children;
    for (let i = 0; i < cells.length; i++) {
        if (cells.item(i).className.includes(included)) {
            setStatus(cells.item(i), false);
            try {
                setStatus(cells.item(i + side), true);
            } catch (Exception) {
                if (canBack) {
                    setStatus(cells.item(side > 0 ? 0 : cells.length - 1), true);
                } else {
                    setStatus(cells.item(i), true);
                }
            }
            break;
        }
    }
}

/*
 Pega a linha ativa (r1) e percorre suas células filhas e, 
 se alguma estiver vazia, ele retorna falso pois não está 
 cheia.
*/
const isAllFull = () => {
    let cells = document.querySelector(`.${CLASSNAMES.EnabledRow}`).children;
    for (child of cells) {
        if (child.className.includes(CLASSNAMES.EmptyCell)) {
            return false;
        }
    }
    return true;
}

/*
 Detecta quando os clicks terminaram:
 * Quando for para a direita ou esquerda, move a celula
 * Quando for um backspace, apaga a última
 * Quando enter, verifica se a palavra está totalmente preenchida e se ela existe
*/
document.addEventListener('keyup', async(event) => {
    switch (event.key) {
        case (KEYS.Right):
            moveActiveInList(DIRECTIONS.Forward, `.${CLASSNAMES.EnabledRow}`, CLASSNAMES.EnabledCell, setCellStatus, true);
            break;
        case (KEYS.Left):
            moveActiveInList(DIRECTIONS.Backward, `.${CLASSNAMES.EnabledRow}`, CLASSNAMES.EnabledCell, setCellStatus, true);
            break;
        case (KEYS.Backspace):
            moveActiveInList(DIRECTIONS.Backward, `.${CLASSNAMES.EnabledRow}`, CLASSNAMES.EnabledCell, setCellStatus, true);
            let c1 = document.querySelector(`.${CLASSNAMES.EnabledRow} .${CLASSNAMES.EnabledCell}`);
            c1.innerHTML = "";
            c1.className = c1.className.replace(CLASSNAMES.FullCell, CLASSNAMES.EmptyCell);
            break;
        case (KEYS.Enter):
            if (isAllFull()) {
                let exists = await wordExists(getEnabledWord().toLocaleLowerCase());
                if (exists) {
                    moveActiveInList(DIRECTIONS.Forward, `.${CLASSNAMES.Root}`, CLASSNAMES.EnabledRow, setRowStatus, false);
                } else {
                    alert("Palavra não existente // Trocar isso por um alerta bonito");
                }
            } else {
                alert("Falta preencher ainda // Trocar isso por um alerta bonito");
            }
            break;
        default:
            break;
    }
});

/*
 Verifica se pode digitar
*/
document.addEventListener('keypress', (event) => {
    let alphabet = "abcdefghijklmnopqrstuvwxyzç";
    let c1CellDiv = document.querySelector(`.${CLASSNAMES.EnabledRow} .${CLASSNAMES.EnabledCell}`);
    if (alphabet.includes(event.key) || alphabet.toLocaleUpperCase().includes(event.key)) {
        c1CellDiv.innerHTML = event.key.toLocaleUpperCase();
        c1CellDiv.className = c1CellDiv.className.replace(CLASSNAMES.EmptyCell, CLASSNAMES.FullCell);
        moveActiveInList(DIRECTIONS.Forward, `.${CLASSNAMES.EnabledRow}`, CLASSNAMES.EnabledCell, setCellStatus, true);
    }
});

/*
 Pega palavra sendo escrita
*/
const getEnabledWord = () => {
    let r1 = document.querySelector(`.${CLASSNAMES.EnabledRow}`).children;
    let word = "";
    for (child of r1) {
        word += child.innerHTML;
    }
    return word;
}

/*
 Ajusta célula
*/
const setCellStatus = (element, status) => {
    element.className = status ? element.className.replace(CLASSNAMES.DisabledCell, CLASSNAMES.EnabledCell) : element.className.replace(CLASSNAMES.EnabledCell, CLASSNAMES.DisabledCell);
    element.style.borderBottom = status ? "solid #000000 6px" : "none";
}

/* 
 Ajusta status da linha 
 Se o status for true (ativa), desativa as células da linha 
 corrente e passa para a próxima, verificando a congruência
 das letras e se o jogador venceu.
*/
setRowStatus = (element, status) => {
    let children = element.children;
    if (status) {
        for (let y = 0; y < children.length; y++) {
            if (y == 0) {
                setCellStatus(children[y], true);
            }
            children[y].style.backgroundColor = "#3016c4";
        }
    } else {
        console.log(WORD.Word, getEnabledWord())
        let colors = verifyWords(WORD.Word, getEnabledWord());
        for (let y = 0; y < children.length; y++) {
            setCellStatus(children[y], false);
            let estilo = children[y].style;
            estilo.transition = `all ${1}s ${0.1 * (y + 1)}s`;
            estilo.backgroundColor = colors.get(y);
            estilo.transform = "rotateY(180deg) scale(-1, 1)";
        }
    }
    element.className = status ? element.className.replace(CLASSNAMES.DisabledRow, CLASSNAMES.EnabledRow) : element.className.replace(CLASSNAMES.EnabledRow, CLASSNAMES.DisabledRow);
}

/*
 Função que retorna uma string com um novo char em um
 index previsto para alteração em uma string.
*/
const replaceByIndex = (str, new_char, index) => {
    splited = str.split('');
    splited[index] = new_char;
    return splited.join('');
}

/*
 Verifica a congruência das palavras e retorna 
 as devidas cores de cada letra da palavra de
 teste.
*/
const verifyWords = (mainWord, testWord) => {
    const colorMap = new Map();
    const mainChars = mainWord.split("");
    for (let i = 0; i < mainWord.length; i++) {
        colorMap.set(i, "#3016c4");
    }
    // Checa as letras que estão na posição correta
    for (let i = 0; i < mainChars.length; i++) {
        if (mainChars[i] === testWord[i]) {
            colorMap.set(i, "#00aa00");
            mainChars[i] = null;
        }
    }
    // Checa as letras que estão corretas, mas na posição errada
    for (let i = 0; i < mainChars.length; i++) {
        const testChar = testWord[i];
        if (testChar !== null && mainChars.includes(testChar)) {
            colorMap.set(i, "#aaaa00");
            const index = mainChars.indexOf(testChar);
            mainChars[index] = null;
        }
    }
    // Retorna o Map com as cores correspondentes
    return colorMap;
}

/*
 Conta quantas vezes um char aparece
 em uma string.
*/
const count = (word, char) => {
    let count = 0;
    for (letter of word) {
        if (char == letter) count++;
    }
    return count;
}

const main = async() => {
    generateBoard(5, 6);
    let words = [];
    while (words.length == 0) {
        words = (await getNearWords((await getRandomWord()).word.slice(0, 5))).filter((val) => { return val.length == 5 });
    }
    WORD.Word = words[0].normalize('NFD').replace(/\p{Mn}/gu, "").toLocaleUpperCase();
    WORD.Data = await getWordData(WORD.Word);
    document.getElementsByTagName('h1')[0].innerHTML += " " + WORD.Word.toLocaleUpperCase();
}


main();