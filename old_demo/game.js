const sound = new Audio();
const boom = new Audio();
const water = new Audio();
const cursor = new Audio();

sound.src = "audio/sound.mp3";
boom.src = "audio/boom.mp3";
water.src = "audio/water.mp3";
cursor.src = "audio/cursor.m4a";

let playSound;
let onSound = () => sound.play();

let soundOn = true;
let musicOn = true;

const fieldSize = 10; // Размер игрового поля
const numShips = [1, 2, 3, 4]; // кол-во кораблей в игре
const shipsLenght = [4, 3, 2, 1]; // длинна корабля
const amountShips = 10; // Общее количество кораблей
let selectedNumShip = 0;
let selectedShipLenght = 0;
let gameMode;
let generateMod = 'playerOne';
let side;
let score = 1;
let shipCoordinate;
let itsHit = true;
let itsMiss = true;
let firsthit;
let choseShip = [];
let over = false;
let ship = { 
    location: [],
    hits: [],
    area: [],
};
let playerOne = {
    name: "Игрок 1",
    ships: [],
    area: [],
    sunk: 0
}
let playerTwo = {
    name: "Игрок 2",
    ships: [],
    area: [],
    sunk: 0
}
let computer = {
    name: "Компьютер",
    ships: [],
    sunk: 0,
    miss: [],
    hitShips: [],
    hit: -1,
    hitShipArea: [],
    attackStatus: 'miss',
    fire(){
        let player = 1;
        let shot;
        do{
            let row = Math.floor(Math.random() * 10);
            let col = Math.floor(Math.random() * 10);
            shot = player + '' + row + '' + col;
        }while(this.isMiss(shot))
        
        return shot;
    },
    isMiss: function(shot){
        if (this.miss.indexOf(shot) >= 0 || this.hitShips.indexOf(shot) >= 0 ){
            return true; 
        }
        return false;
    }
}
function begin(mode){
    if(mode == 'vsComputer'){
        document.getElementById('areaNameTwo').innerHTML = "Флот компьютера";
    }else if (mode == 'vsPlayer' ){
        document.getElementById('enterFirstName').innerHTML = "Введите имя первого игрока";
        document.getElementById('enterSecondName').hidden = false;
        document.getElementById('nameSecondPlayer').hidden = false;
    }
    gameMode = mode;
    openPage(document.getElementById('settingName'), document.getElementById('menu'));
}
function openPage(pageOpen, pageClose) { // Переход со страницы на страницу
    if(soundOn == true)cursor.play();
    if (!playSound && musicOn == true) playSound = setInterval(onSound, 1000);
    pageClose.hidden = true;
    pageOpen.hidden = false;
}
function setName(nameFirst, nameSecond){
    if(soundOn == true)cursor.play();
    let name1 = nameFirst.value;
    let name2 = nameSecond.value;
    if(gameMode == 'vsComputer'){
        if(name1 == ""){
            document.getElementById('warning').innerHTML = "Пожалуйста, введите имя.";
        }else{
            playerOne.name = name1;
            document.getElementById('areaNameOne').innerHTML = "Флот игрока " + name1;
            openPage(document.getElementById('game'), document.getElementById('settingName'));
            view.displayMessage('Пожалуйста, расставьте корабли');
        }     
    }else if(gameMode == 'vsPlayer'){
        if(name1 == "" && name2 == ""){
            document.getElementById('warning').innerHTML = "Пожалуйста, введите имена обоих игроков.";
        }else{
            playerOne.name = name1;
            playerTwo.name = name2;
            document.getElementById('areaNameOne').innerHTML = "Флот игрока " + name1;
            document.getElementById('areaNameTwo').innerHTML = "Флот игрока " + name2;
            openPage(document.getElementById('game'), document.getElementById('settingName'));
            view.displayMessage(name1 + ', пожалуйста, расставьте корабли');
        }
    }
}
function generaeShipLocation() { // Генерирует корабли в соответствии с расстановкой
    if(soundOn == true)cursor.play();
    let ships;
    if(generateMod == 'playerOne') ships= playerOne.ships;  
    if(generateMod == 'playerTwo') ships= playerTwo.ships;  
    if(generateMod == 'computer') ships= computer.ships;  
    if (ships.length > 0){
        view.updateArea();
        ships.length = 0;
        
    }
    let ship;
    for(let i = 0; i < numShips.length; i++){
        for(let j = 1; j <= numShips[i]; j++){
            do{
                ship = generateShip(shipsLenght[i]); // передали размер корабля
            }while (collision(ship.location, ships, 'all'));
            if (generateMod == 'playerOne' || generateMod == 'playerTwo') {
            for(let x =  0; x < ship.location.length; x++){ view.displayShip(ship.location[x]);}
            }
            ships.push(ship);   
        }
    }
    let id;
    if(generateMod == 'playerOne'){
        document.getElementById('btnSaveOne').hidden = false; 
        for(let i = 0; i < numShips.length; i++){
            id = String(numShips[i]);
            document.getElementById(id).innerHTML = 0;
        }  
    }
    else if(generateMod == 'playerTwo'){
        document.getElementById('btnSaveTwo').hidden = false; 
        for(let i = 0; i < numShips.length; i++){
            id = String(numShips[i] + 10);
            document.getElementById(id).innerHTML = 0;
        }  
    }
}
function generateShip(length) { // Генерация корабля
    let direction = Math.floor(Math.random() * 2);
    let player;
    if(generateMod == 'playerOne') player = 1;
    else if(generateMod == 'playerTwo' || generateMod == 'computer') player = 2;
    let row = Math.floor(Math.random() * 10);
    let col = Math.floor(Math.random() * 10);
    let newShipLocation = [];
    let newHit = [];
    let newShipArea = [];
    for (let i = 0; i < length; i++){
        let area = []
        if (direction == 1){
            // для горизонтального корабля
            if (col <= fieldSize - length) {
                newShipLocation.push(player + "" + row + "" + (col + i));
                area = generateShipArea(player, row, col + i, newShipArea);
            } else {
                newShipLocation.push(player + "" + row + "" + (col - i));
                area = generateShipArea(player, row, col - i, newShipArea);
            }   
        } else{
            // для вертикального корабля
            if (row <= fieldSize - length) {
                newShipLocation.push(player + "" + (row + i) + "" + col);
                area = generateShipArea(player, row + i, col, newShipArea);
                
            } else {
                newShipLocation.push(player + "" + (row - i) + "" + col);
                area = generateShipArea(player, row - i, col, newShipArea); 
            }
        };
        for(let j = 0; j < area.length; j++){newShipArea.push(area[j])}
        newHit.push('');
    }
    let ship1 = { 
        location: newShipLocation,
        hits: newHit,
        area: newShipArea,
    }
    return ship1;
}
function generateShipArea(player, row, col, area){
    let coordinates = [];
    let newArea = [];
    let newChoise = [];
    let choise = [];
    coordinates.push(player + "" + row + "" + col);
    if (row > 0){coordinates.push(player + '' + (row - 1) + '' + col); newChoise.push(player + '' + (row - 1) + '' + col);}
    if (row < 9){coordinates.push(player + '' + (row + 1) + '' + col); newChoise.push(player + '' + (row + 1) + '' + col);}
    if (col > 0){coordinates.push(player + '' + row + '' + (col - 1)); newChoise.push(player + '' + row + '' + (col - 1));}
    if (col < 9){coordinates.push(player + '' + row + '' + (col + 1)); newChoise.push(player + '' + row + '' + (col + 1));}
    if (row > 0 && col > 0 )coordinates.push(player + '' + (row - 1) + '' + (col - 1));
    if (row < 9 && col > 0 )coordinates.push(player + '' + (row + 1) + '' + (col - 1));
    if (row > 0 && col < 9 )coordinates.push(player + '' + (row - 1) + '' + (col + 1));
    if (row < 9 && col < 9 )coordinates.push(player + '' + (row + 1) + '' + (col + 1));
    
    for (let i = 0; i < coordinates.length; i++){
        if (area.indexOf(coordinates[i]) < 0) newArea.push(coordinates[i]);
    }
    for (let i = 0; i < newChoise.length; i++){
        if (area.indexOf(newChoise[i]) < 0) choise.push(newChoise[i]);
    }
    choseShip = choise;
    return newArea;   
}
function collision(location, ships, number, firstCoordinate) { //Проверка расстановки
    if (number == 'one' && location.indexOf(firstCoordinate) < 0){
        return true; 
    }
    for (let i = 0; i < ships.length; i++){
        if(!ships[i]) return false; 
        let ship = ships[i];
        for (let j = 0; j < location.length; j++){
            if ((number == 'all' && ship.area.indexOf(location[j]) >= 0) || (number == 'one' && ship.location.indexOf(location[j]) >= 0)){
                return true; 
            }
        }
    }
    return false;
}
function shipInitCreate(num, length){
    if(soundOn == true)cursor.play();
    if (num > 0){
        let cells = document.getElementsByTagName('td');
        selectedNumShip = num;
        selectedShipLenght = length;
        for(let i = 0; i < cells.length; i++){ cells[i].onclick = createFirstBoard;}
    }else{
        view.displayMessage(length + "- палубные корабли закончились. Пожалуйста выберите другой");
        setTimeout(() => view.displayMessage(''), 2000);
    }
}
function createFirstBoard(eventObj){ // установка первой точки и ее сохранение
    if(soundOn == true)cursor.play();
    let ships, area;
    if(generateMod == 'playerOne'){ ships= playerOne.ships;  area = playerOne.area;}
    if(generateMod == 'playerTwo') {ships= playerTwo.ships;  area = playerTwo.area;}
    if(generateMod == 'computer') ships= computer.ships; 
    if (selectedNumShip > 0){
        let cell = eventObj.target;
        
        firsthit = cell.id;
        let newShipLocation = [];
        let newHit = [];
        let newShipArea;

        let arr = cell.id.split('');
        let player = Number(arr[0]);
        let row = Number(arr[1]);
        let col = Number(arr[2]);
        newShipArea = generateShipArea(player, row, col, area);

        check = collision(newShipArea, ships, 'one', cell.id);
        if (!check){
            view.displayShip(cell.id);
            //console.log(model.ships);
            newShipLocation.push(cell.id);
            newHit.push('');

            if(selectedShipLenght == 1){
                createShip(newShipLocation, newHit, newShipArea);
            } else{
                for(let i = 0; i < choseShip.length;i++){
                    view.displayChoiseShip(choseShip[i]);
                }
                let cells = document.getElementsByTagName('td');
                for(let i = 0; i < cells.length; i++){
                    cells[i].onclick = createAllCells;   
                }
                ship.location = newShipLocation;
                ship.hits = newHit;
                ship.area = newShipArea;
            }                     
        } else{
            view.displayMessage('Некорректное положение. Пожалуйста попробуйте ещё раз.');
            setTimeout(() => view.displayMessage(''), 2000);
        }
    } else{
        view.displayMessage(selectedShipLenght + "- палубные корабли закончились. Пожалуйста выберите другой");
        selectedShipLenght = 0;// Количество палуб
        selectedNumShip = 0; // Количество кораблей
        setTimeout(() => view.displayMessage(''), 2000);
    }
}
function createAllCells(event){ // Установка второй точки и формирование корабля
    if(soundOn == true)cursor.play();
    let ships;
    if(generateMod == 'playerOne') ships= playerOne.ships;  
    if(generateMod == 'playerTwo') ships= playerTwo.ships;  
    if(generateMod == 'computer') ships= computer.ships; 
    let cell = event.target;
    let newShipArea = [];
    let player, row, col;

    if (ship.area.indexOf(cell.id) > 0){
        for(let i = 0; i < ship.area.length; i++){
            document.getElementById(ship.area[i]).setAttribute("class", "");
        }
        let arr1 = ship.location[0].split(''); //1 клетка
        let arr2 = cell.id.split('');//2 клетка
        findSide(arr1, arr2);
        player = Number(arr2[0]);
        row = Number(arr2[1]);
        col = Number(arr2[2]);
        let numbCell = selectedShipLenght - 2;
        numbCell = getCoordinate(player, row, col, numbCell, numbCell, 0);
        if( numbCell >= 0){
            changeSide(firsthit);
            player = Number(arr1[0]);
            row = Number(arr1[1]);
            col = Number(arr1[2]);
            getCoordinate(player, row, col, numbCell, numbCell, 1);
        }
        let check = collision(ship.location, ships, 'all');
        if (!check){
            for(let i = 0; i < ship.location.length; i++){ view.displayShip(ship.location[i]);}
            createShip(ship.location, ship.hits, ship.area);
        } else{
            view.displayMessage('Вы выбрали некорректное положение корабля. Пожалуйста, попробуйте снова');
            document.getElementById(ship.location[0]).setAttribute("class", "");
            ship.location.length = 0;
            ship.hits.length = 0;
            ship.area.length = 0;
            shipInitCreate(selectedNumShip, selectedShipLenght);
            setTimeout(() => view.displayMessage(''), 2000);
        }
    } else{
        view.displayMessage('Для выбора направления корабля нажмите на одну из выделенных клеток');
        setTimeout(() => view.displayMessage(''), 2000);
        
    }
    
}

function getCoordinate(player, row, col, numbCell, numbShips, numb){
    for(let i = numb; i <= numbShips; i++){   
        switch(side){
            case 'up':
                ship.location.push(player + '' + (row - i) + '' + col);
                newShipArea = generateShipArea(player, row - i, col, ship.area);
                break;
            case 'down':
                ship.location.push(player + '' + (row + i) + '' + col);
                newShipArea = generateShipArea(player, row + i, col, ship.area);
                break;
            case 'left':
                ship.location.push(player + '' + row + '' + (col - i));
                newShipArea = generateShipArea(player, row, col - i, ship.area);
                break;
            case 'right':
                ship.location.push(player + '' + row + '' + (col + i));
                newShipArea = generateShipArea(player, row, col + i, ship.area );
                break;
        }
        for(let j = 0; j < newShipArea.length; j++){ ship.area.push(newShipArea[j])}
        ship.hits.push('');  
        if ((side == 'up' && (row - i) == 0 )|| 
            (side == 'down' && (row + i) == 9) ||  
            (side == 'left' && (col - i) == 0) || 
            (side == 'right' && (col + i) == 9)){
            break;
        }
        numbCell--;
    }
    return numbCell;
}

function createShip(newLocation, newHits, newArea){
    let ship1 = { 
        location:  newLocation,
        hits: newHits,
        area: newArea,
    }
    let id, ships;
    if(generateMod == 'playerOne'){
        id = String(selectedShipLenght);
        ships = playerOne.ships
        for (let i = 0; i < newArea.length; i++) playerOne.area.push(newArea[i]);
    } 
    else if(generateMod == 'playerTwo'){
        id = String(selectedShipLenght + 10);
        ships = playerTwo.ships
        for (let i = 0; i < newArea.length; i++) playerTwo.area.push(newArea[i]);
    }
    ships.push(ship1);
    selectedNumShip--;
    document.getElementById(id).innerHTML = selectedNumShip;
    if(ships.length == amountShips){
        if(generateMod == 'playerOne')document.getElementById('btnSaveOne').hidden = false; 
        else if(generateMod == 'playerTwo')document.getElementById('btnSaveTwo').hidden = false; 
    } 
    shipInitCreate(selectedNumShip, selectedShipLenght);
    console.log(ship1);
}
function saveFleetOne(){
    if(soundOn == true)cursor.play();
    document.getElementById('btnSaveOne').hidden = true; 
    if(gameMode == 'vsComputer'){
        generateMod = 'computer';
        generaeShipLocation();
        document.getElementById('btnBegin').hidden = false; 
        document.getElementById('updateArea').onclick = null;
    }else if (gameMode == 'vsPlayer' ){
        generateMod = 'playerTwo';
        document.getElementById('shipsOne').hidden = true; 
        document.getElementById('areaNameOne').hidden = true; 
        document.getElementById('areaOne').hidden = true; 
        document.getElementById('playOne').hidden = true; 
        document.getElementById('areaNameTwo').hidden = false; 
        document.getElementById('areaTwo').hidden = false; 
        document.getElementById('playTwo').hidden = false; 
        document.getElementById('shipsTwo').hidden = false;
        view.displayMessage(playerTwo.name + ', пожалуйста, расставьте корабли');
    }
}
function saveFleetTwo(){
    if(soundOn == true)cursor.play();
    document.getElementById('btnSaveTwo').hidden = true; 
    document.getElementById('btnBegin').hidden = false; 
    view.updateArea();
    document.getElementById('updateArea').onclick = null;
}
function initGame(){
    if(soundOn == true)cursor.play();
    if(gameMode == 'vsComputer'){
        for(let i = 0; i < numShips.length; i++){
           let id = String(numShips[i]);
            document.getElementById(id).innerHTML = shipsLenght[i];
        }  
        document.getElementById('areaNameTwo').hidden = false; 
        document.getElementById('areaTwo').hidden = false; 
        document.getElementById('playTwo').hidden = false; 
        document.getElementById('shipsTwo').hidden = false;
    }else if (gameMode == 'vsPlayer' ){
        document.getElementById('shipsOne').hidden = false; 
        document.getElementById('areaNameOne').hidden = false; 
        document.getElementById('areaOne').hidden = false; 
        document.getElementById('playOne').hidden = false; 
    }
    document.getElementById('random1').hidden = true;
    document.getElementById('random2').hidden = true;
    document.getElementById('updateArea').hidden = true;

    textarr = document.getElementsByClassName('textShip');
    textarr[0].innerHTML = "Кораблей осталось потопить";
    textarr[1].innerHTML = "Кораблей осталось потопить";
    let id, idShip;
    for(let i = 0; i < numShips.length; i++){
        id = String(numShips[i]);
        idShip = String('o' + numShips[i]);
        document.getElementById(id).innerHTML = shipsLenght[i];
        document.getElementById(idShip).onclick = null;
        id = String(numShips[i] + 10);
        idShip = String('t' + numShips[i]);
        document.getElementById(id).innerHTML = shipsLenght[i];
        document.getElementById(idShip).onclick = null;
    }  

    generateMod = 'playerOne'
    //view.updateArea();
    view.displayMessage(playerOne.name + ', твой ход');
    let cells = document.getElementsByTagName('td');
    for(let i = 0; i < cells.length; i++){
        cells[i].onclick = getId;
    }
    document.getElementById('btnBegin').hidden = true;
}
function getId(eventObj){//Пока не трогаем
    let cell = eventObj.target;
    if (gameMode == 'vsPlayer') playWithPlayer(cell.id);
    else if (gameMode == 'vsComputer') playWithComputer(cell.id);
}
function playWithComputer(guess){
    let enemyShips = computer.ships;
    name = playerOne.name;    
    let zone = 1;
    let id = 10;
    let attack = fire (enemyShips, name, id, guess);
    if(!attack){
        let arr = guess.split('');
        if(zone == arr[0]){
            view.displayMessage(name + ', зачем ты атакуешь свой флот?');
            return false;
        }
        view.displayMiss(guess);
        if(soundOn == true){water.currentTime = 0; water.play();}
        view.displayMessage('Упс! ' + name + ', ты промазал(а)!');
        let cells = document.getElementsByTagName('td');
        for(let i = 0; i < cells.length; i++){
            cells[i].onclick = null;
        }
        setTimeout(() => view.displayMessage('Ход компьютера'), 1000);
        setTimeout(() => stepComputer(), 2200);
    }
}
function stepComputer(){
    let guess;
    do{
        if(computer.attackStatus == 'sunk' || computer.attackStatus == 'miss') guess = computer.fire();
        else if(computer.attackStatus == 'hit') {
            guess = computer.hitShipArea[1]; 
            score++;
        }else if(computer.attackStatus == 'searchMiss') {
            guess = computer.hitShipArea[score]; 
            score++;
        }else if(computer.attackStatus == 'foundSide' || computer.attackStatus == 'missSide' ){
            let arr = shipCoordinate.split('');
            let player = 1;
            let row = Number(arr[1]);
            let col = Number(arr[2]);
            switch(side){
                case 'up':
                    guess = player + '' + (row - 1) + '' + col;
                    break;
                case 'down':
                    guess = player + '' + (row + 1) + '' + col;
                    break;
                case 'left':
                    guess = player + '' + row + '' + (col - 1);
                    break;
                case 'right':
                    guess = player + '' + row + '' + (col + 1);
                    break;
            }
        }
        for(let i = 0; i < amountShips; i++){
            let ship1 = playerOne.ships[i];
            let index = ship1.location.indexOf(guess);
            itsMiss = true;
            if(index >= 0){
                itsHit = true;
                ship1.hits[index] = 'hit';
                view.displayHit(guess);
                if(soundOn == true){boom.currentTime = 0; boom.play();}
                computer.hitShips.push(guess);
                computer.hit++;
                if (isSunk(ship1)) {
                    view.displayDead(ship1.location);
                    let id = String(ship1.location.length);
                    let num = document.getElementById(id).innerHTML;
                    num--;
                    document.getElementById(id).innerHTML = num;
                    playerOne.sunk++; 
                    for(let j = 0; j < ship1.area.length; j++){
                        computer.miss.push(ship1.area[j]);
                    }
                    if (playerOne.sunk == amountShips) {
                        view.displayMessage('Компьютер победил!');
                        over = true;
                        for (let i = 0; i < computer.ships.length; i++){
                            for (let j = 0; j < computer.ships[i].location.length; j++){
                                if(computer.ships[i].hits[j] != 'hit') view.displayShip(computer.ships[i].location[j]);
                            }
                        }
                        break;
                    }
                    computer.attackStatus = 'sunk';
                    itsMiss = false;
                    score = 1;
                    break;
                }
                
                if(computer.attackStatus == 'hit' || computer.attackStatus == 'searchMiss'){
                    let x = computer.hit - 1;
                    let arr1 = computer.hitShips[x].split(''); //1 клетка
                    let arr2 = guess.split('');//2 клетка
                    findSide(arr1, arr2);
                    computer.attackStatus = 'foundSide';
                    score = 1;
                }
                if(computer.attackStatus == 'sunk' || computer.attackStatus == 'miss'){
                    let arr = guess.split('');
                    let area = generateShipArea(Number(arr[0]), Number(arr[1]), Number(arr[2]), computer.miss);
                    computer.hitShipArea = area;
                    firsthit = guess;
                    computer.attackStatus = 'hit';
                }
                shipCoordinate = guess;
                if (computer.attackStatus == 'foundSide'|| computer.attackStatus == 'missSide'){
                    let arr = shipCoordinate.split('');
                    if ((side == 'up' && arr[1] == 0) || 
                    (side == 'down' && arr[1] == 9) ||  
                    (side == 'left' && arr[2] == 0) || 
                    (side == 'right' && arr[2] == 9)){
                        changeSide(firsthit);
                    }
                    
                }
                itsMiss = false;
                break;
            }
        }
        if(itsMiss) itsHit = false;
    }while(itsHit);
    if(!over){
        setTimeout(function(){
            if(soundOn == true)water.play(); 
            view.displayMessage('Тебе повезло ' + playerOne.name + ', компьютер промазал')
            view.displayMiss(guess)
        }, 1000)
        computer.miss.push(guess);
        setTimeout(() => view.displayMessage(playerOne.name + ', твой ход'), 2000);
        if (computer.attackStatus == 'sunk' || computer.attackStatus == 'miss') computer.attackStatus = 'miss';
        if (computer.attackStatus == 'hit' ) computer.attackStatus = 'searchMiss';
        if (computer.attackStatus == 'foundSide'){
            changeSide(firsthit);
            computer.attackStatus = 'missSide';
        }
        setTimeout(function(){
            let cells = document.getElementsByTagName('td');
            for(i = 0; i < cells.length; i++){
                cells[i].onclick = getId;
            }
        }, 2000)
    }
}
function changeSide(firsthit){
    if (side == 'down') side = 'up';
    else if (side == 'up') side = 'down';
    else if (side == 'right') side = 'left';
    else if (side == 'left') side = 'right';
    shipCoordinate = firsthit;
}
function findSide(arr1, arr2){
    if (arr1[1] > arr2[1] && arr1[2] == arr2[2]) side = 'up';
    else if (arr1[1] < arr2[1] && arr1[2] == arr2[2]) side = 'down';
    else if (arr1[1] == arr2[1] && arr1[2] > arr2[2]) side = 'left';
    else if (arr1[1] == arr2[1] && arr1[2] < arr2[2]) side = 'right';
}
function playWithPlayer(guess) {
    let enemyShips, name, id, enemyMode, enemyName, zone;
    if (generateMod == 'playerOne'){
        enemyShips = playerTwo.ships;
        name = playerOne.name;
        enemyName = playerTwo.name;
        zone = 1;
        id = 10;
        enemyMode = 'playerTwo';
    }else if(generateMod == 'playerTwo'){
        enemyShips = playerOne.ships;
        name = playerTwo.name;
        enemyName = playerOne.name;
        enemyMode = 'playerOne';
        zone = 2;
        id = 0;
    }
    let attack = fire (enemyShips, name, id, guess);
    if(!attack){
        let arr = guess.split('');
        if(zone == arr[0]){
            view.displayMessage(name + ', зачем ты атакуешь свой флот?');
            return false;
        }
        view.displayMiss(guess);
        if(soundOn == true){water.currentTime = 0; water.play();}
        view.displayMessage('Упс!' + name + ', ты промазал(а)!');
        generateMod = enemyMode;
        setTimeout(() => view.displayMessage(enemyName + ', твой ход'), 1000);
    }
}
function fire (enemyShips, name, id, guess){
    for(let i = 0; i < amountShips; i++){
        let ship1 = enemyShips[i];
        let index = ship1.location.indexOf(guess);
        if (ship1.hits[index] == 'hit'){
            if(soundOn == true)cursor.play();
            view.displayMessage(name + ', ты сюда уже тыкал(а). Попробуй ещё раз.');
            return true;
        } 
        if(index >= 0){
            ship1.hits[index] = 'hit';
            view.displayHit(guess);
            if(soundOn == true){boom.currentTime = 0; boom.play();}
            view.displayMessage(name + ', ты попал(а)!');
            if (isSunk(ship1)) {
                view.displayDead(ship1.location);
                view.displayMessage('Молодец, ' + name + '! Ты потопил(а) корабль противника!');
                id = String(id + ship1.location.length);
                let num = document.getElementById(id).innerHTML;
                num--;
                document.getElementById(id).innerHTML = num;
                if (generateMod == 'playerOne') {
                    let enemyName;
                    if (gameMode == 'vsPlayer') enemy = playerTwo;
                    else if (gameMode == 'vsComputer') enemy = computer;
                    enemy.sunk++; 
                    if (enemy.sunk == amountShips) gameOver(name, playerOne.ships);
                }
                else if(generateMod == 'playerTwo') { 
                    playerOne.sunk++;
                    if (playerOne.sunk == amountShips) gameOver(name, playerTwo.ships);
                }
            }
            return true;
        }
    }
    return false;
}
function isSunk(ship){
    for(let i = 0; i < ship.hits.length; i++){
        if (ship.hits[i] != 'hit') return false; 
    }
    return true;
}
function gameOver(name, ships){
    let cells = document.getElementsByTagName('td');
    for(let i = 0; i < cells.length; i++){
        cells[i].onclick = null;
    }
    for (let i = 0; i < ships.length; i++){
        for (let j = 0; j < ships[i].location.length; j++){
            if(ships[i].hits[j] != 'hit') view.displayShip(ships[i].location[j]);
        }
    }
    view.displayMessage('Поздравляю, ' + name + '! Ты выйграл(а)!');
}
function settingSound(icon, text){ //настройки звука
    if(musicOn == true && (icon.id == 'iconMusic' || icon.id == 'setMusic')) {
        musicOn = false;
        clearInterval(playSound);
        sound.pause();
        text.innerHTML = "Музыка отключена";
        document.getElementById('setMusic').src ="img/icon/musicOff.png";
        document.getElementById('iconMusic').src ="img/icon/musicOff.png";
    }
    else if(musicOn == false && (icon.id == 'iconMusic' || icon.id == 'setMusic')) {
        musicOn = true;
        playSound = setInterval(onSound, 1000);
        text.innerHTML = "Музыка включена";
        document.getElementById('setMusic').src ="img/icon/musicOn.png";
        document.getElementById('iconMusic').src ="img/icon/musicOn.png";
    }
    else if((icon.id == 'iconSound'|| icon.id == 'setSound') && soundOn == true) {
        soundOn = false;
        text.innerHTML = "Звуки отключены";
        document.getElementById('setSound').src ="img/icon/soundOff.png";
        document.getElementById('iconSound').src ="img/icon/soundOff.png";
    }
    else if((icon.id == 'iconSound'|| icon.id == 'setSound') && soundOn == false) {
        soundOn = true;
        text.innerHTML = "Звуки включены";
        document.getElementById('setSound').src ="img/icon/soundOn.png";
        document.getElementById('iconSound').src ="img/icon/soundOn.png";
    }
}
let view = { // Отображение данных (управление CSS и HTML)
    displayMessage(msg){ //вывод сообщение на экран
        let messageArea = document.getElementById("massageArea");
        messageArea.innerHTML = msg;
    },
    displayHit(location){ // Отображение попадания
        let cell = document.getElementById(location);
        cell.setAttribute("class", "hit");
    },
    displayMiss(location){ //Отображение промаха
        let cell = document.getElementById(location);
        cell.setAttribute("class", "miss");
    },  
    displayDead(location){ // Отображение потопления
        for (let i = 0; i < location.length; i++){
            let cell = document.getElementById(location[i]);
            cell.setAttribute("class", "hit dead");
        }
    },  
    displayShip(location){ //Отображение выбранных кораблей
        let cell = document.getElementById(location);
        cell.setAttribute("class", "ships");
    }, 
    displayChoiseShip(location){ 
        let cell = document.getElementById(location);
        cell.setAttribute("class", "choise");
    }, 
    updateArea(){
        let cells = document.getElementsByTagName('td');
         for(let i = 0; i < cells.length; i++){
            cells[i].setAttribute("class", "");
        }
        for(let i = 0; i < numShips.length; i++){
            if(generateMod == 'playerOne'){
                id = String(numShips[i]);
                document.getElementById(id).innerHTML = shipsLenght[i];
            }else if(generateMod == 'playerTwo'){
                id = String(numShips[i] + 10);
                document.getElementById(id).innerHTML = shipsLenght[i];
            }
        }  
    }
}
function update(){
    view.updateArea();
    if(generateMod == 'playerOne'){
        document.getElementById('btnSaveOne').hidden = true;
        playerOne.ships.length = 0;
        playerOne.area.length = 0;
        console.log('playerOne: ', playerOne);
    }else if(generateMod == 'playerTwo') {
        playerTwo.ships.length = 0;
        playerTwo.area.length = 0;
        document.getElementById('btnSaveTwo').hidden = true;
        console.log('playerTwo: ', playerTwo);
    }
    
}
function reload(){
    location.reload(true);
}