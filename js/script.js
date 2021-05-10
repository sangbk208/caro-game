const DOM = {
    tiles: [],
    alert: document.querySelector(".main__alert"),
    alertPlayer: document.querySelector(".main__alert-play"),
    board: document.querySelector("tbody"),
    resetBtn: document.querySelector("#reset-button"),
    continueBtn: document.querySelector("#continue-button"),
    undoBtn: document.querySelector("#undo-button"),
    redoBtn: document.querySelector("#redo-button"),
    boardSizeInput: document.querySelector("#board-size-input"),
    toWinInput: document.querySelector("#to-win-input"),
    submitBtn: document.querySelector("#submit-button"),
    winner:{
        x: document.querySelector("#winner-player1"),
        o: document.querySelector("#winner-player2"),
    },
    player: {
        x: {
            score: document.querySelector("#player-x-score")
        },
        o: {
            score: document.querySelector("#player-o-score")
        },
    },
};

let state = {
    exactlyArrayVH: [],
    currentPlayer: "x",
    winner: false,
    img:{
        x: 'url("../assets/images/Xpng.png")',
        o: 'url("../assets/images/Opng.png")',
    },
    player: {
      x: [],
      o: [],
    },
    history: {
        x: [],
        o: [],
      },
    point: {
      x: 0,
      o: 0,
    },
    winStatus: false,
    boardSize: 10,
    toWin: 5,   
};

function main() {
    DOM.tiles.forEach((tile) => {
        tile.addEventListener("click", handleEventClick);
        tile.addEventListener("mouseenter", handleEventMouseOver);
        tile.addEventListener("mouseleave", handleEventMouseLeave);
    });
}

function setting() {
    let boardSizeNum = state.boardSize;
    if (Number(DOM.boardSizeInput.value)!==0 || Number(DOM.toWinInput.value)!==0){
        boardSizeNum = Number(DOM.boardSizeInput.value);
        state.boardSize = boardSizeNum;
        state.toWin = Number(DOM.toWinInput.value);
    }
    DOM.board.innerHTML = "";
    for (let i = 0; i < boardSizeNum; i++) {
        const boardRow = document.createElement("tr");
        boardRow.classList = "y" + (i + 1);
        for (let j = 0; j < boardSizeNum; j++) {
            const boardCell = document.createElement("td");
            const divElement = document.createElement("div");
            divElement.id =  "x" + (j + 1) + "_" + boardRow.classList;
            boardCell.insertAdjacentElement("beforeend", divElement);
            boardRow.insertAdjacentElement("beforeend", boardCell);
        }
        DOM.board.insertAdjacentElement("beforeend", boardRow);
    }
    // getTilesDOM
    DOM.tiles = Array.from(document.querySelectorAll("td"));
    DOM.continueBtn.disabled = true;
    main();
}

function setPoint(){
    DOM.player.x.score.innerText = state.point.x;
    DOM.player.o.score.innerText = state.point.o;
}

function handleEventMouseOver(event){
    const {target} = event;
    if(target.firstChild.style.backgroundImage === ""){
        target.style.backgroundImage = state.img[state.currentPlayer];
        target.style.opacity = '0.5';
    }
}

function handleEventMouseLeave(event){
    const {target} = event;
    target.style.backgroundImage = "";
    target.style.opacity = 1;
}

function handleEventClick(event) {
    if (!state.winStatus){
        DOM.alert.innerText = "";
        const tile = event.target;
        if ((tile.style.backgroundImage === '')){
            tile.offsetParent.style.opacity = 1;
            tile.style.backgroundImage = state.img[state.currentPlayer];
            if (state.currentPlayer === 'x'){
                state.player[state.currentPlayer].push(tile.id.split('_'));
                checkResult(state.currentPlayer);
                state.history = { x: [], o: [] };
                state.currentPlayer='o';
                DOM.alertPlayer.innerText =  "Player 1";
                return;
            }
           
            state.player[state.currentPlayer].push(tile.id.split('_'));
            checkResult(state.currentPlayer);
            state.history = { x: [], o: [] };
            state.currentPlayer='x';
            DOM.alertPlayer.innerText = "Player 2";
        }else{
            DOM.alert.innerText = "This tile is not available";
        }
    }
}

function checkResult(currentPlayer){
    let array = state.player[currentPlayer];
    if(array.length >= state.toWin){
        checkAxisVerticalHorizontal(array);
        checkCross(array);
    }
    setPoint();
}

function checkAxisVerticalHorizontal(array){
    let xArray = array.filter(item => item[0]===array[array.length-1][0]);
    let yArray = array.filter(item => item[1]===array[array.length-1][1]);
    if (xArray.length >= state.toWin){
        if(checkEachAxis(xArray, 'y')){
            winnerNotification(state.exactlyArrayVH);
        }
    }
    if (yArray.length >= state.toWin){
        if(checkEachAxis(yArray, 'x')){
            winnerNotification(state.exactlyArrayVH);
        }
    }
}

function checkEachAxis(array, type){
    const numberXorY = array[0][type==='x'?1:0];
    let axis = [];
    type === 'x'?array.forEach(item => axis.push(Number(item[0].match(/\d/g).join(""))))
                :array.forEach(item => axis.push(Number(item[1].match(/\d/g).join(""))));
    axis = axis.sort((a,b) => a-b);
    return checkConsecutiveArray(axis, type, numberXorY);
}

function checkConsecutiveArray(array, type, numberXorY){
    let check = 1;
    let toWin = state.toWin;
    let exactlyArray = [];
    for(let i=0; i<array.length; i++){
        if(array.length - i >= toWin){
            let len = toWin+i-1;
            for(let j=i; j<len; j++){
                if (array[j] + 1 === array[j+1]){
                    check+=1;
                    let a1;
                    if (type === 'x') {
                        a1 = `x${array[toWin-1]}_`+numberXorY;
                        exactlyArray.push(`x${array[j]}_`+numberXorY)
                    } else {
                        a1 = numberXorY+`_y${array[toWin-1]}`;
                        exactlyArray.push(numberXorY+`_y${array[j]}`)
                    }
                    if (check === state.toWin){
                        exactlyArray.push(a1)
                    }
                }
                else{
                    check = 0;
                    exactlyArray = [];
                    break; 
                }
            }
        } else { break; }
        if (check === toWin){
            state.exactlyArrayVH = exactlyArray;
            break;
        }
    }
    return check===toWin; 
}

function checkCross(array){
    let currentPoint= {
        x: Number(array[array.length-1][0].match(/\d/g).join("")),
        y: Number(array[array.length-1][1].match(/\d/g).join(""))
    }
    checkCrossTopRight(array.map(item=> item.join('_')), currentPoint);
    checkCrossTopLeft(array.map(item=> item.join('_')), currentPoint);
}



function checkCrossTopLeft(array, currentPoint){
    let checkpoint = {...currentPoint};
    let exactlyArray = [array[array.length-1]];
    let total = 1;
    for (let i=1; i<=state.boardSize; i++){
        if(array.indexOf(`x${checkpoint.x-i}_y${checkpoint.y+i}`)!==-1){
            total+=1;
            exactlyArray.push(`x${checkpoint.x-i}_y${checkpoint.y+i}`);
        }else{
            break;
        }
    }
    if (total === state.toWin){
        winnerNotification(exactlyArray);
        return;
    } 
    for (let i=1; i<=state.boardSize; i++){
        if(array.indexOf(`x${checkpoint.x+i}_y${checkpoint.y-i}`)!==-1){
            total+=1;
            exactlyArray.push(`x${checkpoint.x+i}_y${checkpoint.y-i}`);
        }else{
            break;
        }
    }
    if (total === state.toWin){
        winnerNotification(exactlyArray);
    }
}

function checkCrossTopRight(array, currentPoint){
    let checkpoint = {...currentPoint};
    let exactlyArray = [array[array.length-1]];
    let total = 1;
    for (let i=1; i<=state.boardSize; i++){
        if(array.indexOf(`x${checkpoint.x+i}_y${checkpoint.y+i}`)!==-1){
            total+=1;
            exactlyArray.push(`x${checkpoint.x+i}_y${checkpoint.y+i}`);
        }else{
            break;
        }
    }
    if (total === state.toWin){
        winnerNotification(exactlyArray);
        return;
    }
    for (let i=1; i<=state.boardSize; i++){
        if(array.indexOf(`x${checkpoint.x-i}_y${checkpoint.y-i}`)!==-1){
            total+=1;
            exactlyArray.push(`x${checkpoint.x-i}_y${checkpoint.y-i}`);
        }else{
            break;
        }
    }
    if (total === state.toWin){
        winnerNotification(exactlyArray);
    }
}

function winnerNotification(array){
    array.forEach(item =>{
        document.getElementById(item).style.backgroundColor = 'black';
    });
    state.point[state.currentPlayer] +=1;
    DOM.winner[state.currentPlayer].innerText = "Winner";
    gamePlayOff();
}

function gamePlayOff() {
    state.winStatus = true;
    DOM.undoBtn.disabled = true;
    DOM.redoBtn.disabled = true;
    DOM.submitBtn.disabled = true;
    DOM.continueBtn.disabled = false;
}

// reset game
function gameReset() {
    state.player['x'] = [];
    state.player['o'] = [];
    state.exactlyArrayVH = [];
    DOM.winner.x.innerText = "";
    DOM.winner.o.innerText = "";
    DOM.alert.innerText = "";
    DOM.undoBtn.disabled = false;
    DOM.redoBtn.disabled = false;
    DOM.submitBtn.disabled = false;
    state.winStatus = false;
    state.currentPlayer = 'x';
    setting();
    main();
}

function gameAllReset(){
    state.point.x = 0;
    state.point.o = 0;
    gameReset();
    setPoint();
    DOM.continueBtn.disabled = true;
}

DOM.resetBtn.addEventListener("click", (e) => {
    gameAllReset();
});

DOM.continueBtn.addEventListener("click", (e) => {
    gameReset();
});

DOM.undoBtn.addEventListener("click", (e) => {
    state.currentPlayer === 'x'? state.currentPlayer = 'o': state.currentPlayer ='x';
    if (state.player[state.currentPlayer].length > 0){
        DOM.alertPlayer.innerText = state.currentPlayer === 'x'? "Player 1": "Player 2";
        let removeItem = state.player[state.currentPlayer][state.player[state.currentPlayer].length-1];
        state.history[state.currentPlayer].push(removeItem);
        state.player[state.currentPlayer].pop();
        document.getElementById(`${removeItem[0]}_${removeItem[1]}`).style.backgroundImage = '';
    }
});

DOM.redoBtn.addEventListener("click", (e) => {
    if (state.history[state.currentPlayer].length > 0){
        let unRemoveItem = state.history[state.currentPlayer][state.history[state.currentPlayer].length-1];
        state.player[state.currentPlayer].push(unRemoveItem);
        state.history[state.currentPlayer].pop();
        document.getElementById(`${unRemoveItem[0]}_${unRemoveItem[1]}`).style.backgroundImage = state.img[state.currentPlayer];
        state.currentPlayer === 'x'? state.currentPlayer = 'o': state.currentPlayer ='x';
        DOM.alertPlayer.innerText = state.currentPlayer === 'x'? "Player 1": "Player 2";
    }
});

DOM.submitBtn.addEventListener("click", (e) => {
    setting();
});

setting();

