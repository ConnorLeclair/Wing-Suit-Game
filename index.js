/*--Initial----------------------------------------------------------------------------------------------------------------------------------------*/
window.oncontextmenu = (e)=>{e.preventDefault()}
window.onresize = resize;
window.onload = initLoad;

let gameData
function initLoad(){
    let playerR = new Image(); playerR.src = "./images/player right.png";
    let playerL = new Image(); playerL.src = "./images/player left.png";
    let playerD = new Image(); playerD.src = "./images/player down.png";

    let cloud1 = new Image(); cloud1.src = "./images/cloud1.png";
    let cloud2 = new Image(); cloud2.src = "./images/cloud2.png";
    let cloud3 = new Image(); cloud3.src = "./images/cloud3.png";
    let cloud4 = new Image(); cloud4.src = "./images/cloud4.png";

    let coin = new Image(); coin.src = "./images/coin.png";
    let bomb = new Image(); bomb.src = "./images/bomb.png";

    gameData = {
        inGame:false,
        images:{
            clouds:[cloud1, cloud2, cloud3, cloud4],
            player:[playerL, playerD, playerR],
            coin:coin, bomb:bomb
        }
    }
    try{
        gameData.best = JSON.parse(localStorage.getItem("wing-game-best-score"));
        if(!gameData.best){
            gameData.best = 0;
            localStorage.setItem("wing-game-best-score",JSON.stringify(gameData.best));
        }
    }
    catch{
        gameData.best = 0;
        localStorage.setItem("wing-game-best-score",JSON.stringify(gameData.best));
    }

    resize();
    document.querySelector("#start-game").onclick = startGame;
    document.querySelector("#play-again").onclick = playAgain;
}
function resize(){
    let gameHolder = document.querySelector(".game-holder");
    let game = document.querySelector("#game");
    game.height = gameHolder.offsetHeight - 6;
    game.width = gameHolder.offsetWidth - 6;
    drawGame();
}

/*--Menu Logic-------------------------------------------------------------------------------------------------------------------------------------*/
function startGame(){
    initGame();
    drawGame();
    let gameBegin = document.querySelector("#game-begin");
    gameBegin.style.animation = "fadeOut ease-in-out 0.2s";
    gameBegin.onanimationend = ()=>{
        gameBegin.style.animation = "none";
        gameBegin.style.display = "none";
        gameBegin.onanimationend = null;
        startGameLoop();
    }
}
function playAgain(){
    initGame();
    drawGame();
    gameData.inGame = true;
    let gameEnd = document.querySelector("#game-end");
    gameEnd.style.animation = "fadeOut ease-in-out 0.2s";
    gameEnd.onanimationend = ()=>{
        gameEnd.style.animation = "none";
        gameEnd.style.display = "none";
        gameEnd.onanimationend = null;
        startGameLoop();
    }
}

/*--Game Logic-------------------------------------------------------------------------------------------------------------------------------------*/
let stopGameLoop = false;
function startGameLoop(){
    stopGameLoop = false;
    window.requestAnimationFrame((currTime)=>{
        gameLoop(currTime,currTime)
    });
}
function gameLoop(prevTime,currTime){
    let elapsedTime = currTime - prevTime;
    if(elapsedTime > 16){
        prevTime = currTime;
        updateGame();
        drawGame();
    }
    if(!stopGameLoop){
        window.requestAnimationFrame((currTime)=>{
            gameLoop(prevTime,currTime)
        });
    }
}

function initGame(){
    gameData.inGame = true;
    gameData.bombs = [];
    gameData.coins = [];
    gameData.timer = 0;

    gameData.clouds = [];
    for(let i = 0; i < 10; i++){
        gameData.clouds.push({
            speed:Math.floor(Math.random()*2)+1,
            type:Math.floor(Math.random()*4),
            x:Math.random(),
            y:Math.random(),
        });
    }

    gameData.player = {
        acc:[0,0,0,0],
        score:0,
        dir:1,
        x:0.5,
        y:0.1
    }

    document.querySelector("#best-score").innerHTML = "Best:"+gameData.best;
    document.querySelector("#curr-score").innerHTML = "Score:"+gameData.player.score;
}
function updateGame(){
    gameData.timer++;
    for(let i = 0; i < gameData.clouds.length; i++){
        gameData.clouds[i].y -= 0.002 + 0.0005*gameData.clouds[i].speed;
        if(gameData.clouds[i].y < -0.1) gameData.clouds.splice(i,1);
        if(gameData.clouds.length < 10){
            while(gameData.clouds.length < 10){
                gameData.clouds.push({
                    speed:Math.floor(Math.random()*2)+1,
                    type:Math.floor(Math.random()*4),
                    x:Math.random(),
                    y:1.1,
                });
            }
        }
    }

    gameData.player.y -= gameData.player.acc[0]/100*0.75;
    gameData.player.y += gameData.player.acc[1]/100*0.75;
    gameData.player.x -= gameData.player.acc[2]/100;
    gameData.player.x += gameData.player.acc[3]/100;

    if(gameData.player.x < 0) gameData.player.x = 0;
    if(gameData.player.x > 1) gameData.player.x = 1;
    if(gameData.player.y < 0) gameData.player.y = 0;
    if(gameData.player.y > 1) gameData.player.y = 1;

    if(gameData.player.acc[2] === 0 && gameData.player.acc[3] === 0) gameData.player.dir = 1;
    if(gameData.player.acc[2] != 0 && gameData.player.acc[3] != 0) gameData.player.dir = 1;
    if(gameData.player.acc[2] != 0 && gameData.player.acc[3] === 0) gameData.player.dir = 2;
    if(gameData.player.acc[2] === 0 && gameData.player.acc[3] != 0) gameData.player.dir = 0;

    if(gameData.timer % 200 === 0) gameData.coins.push({x:Math.random(),y:1.1,speed:Math.floor(Math.random()*2)+1});
    if(gameData.timer % 50 === 0) gameData.bombs.push({x:Math.random(),y:1.1,speed:Math.floor(Math.random()*3)+1});

    for(let i = 0; i < gameData.coins.length; i++){
        gameData.coins[i].y -= 0.002 + 0.0005*gameData.coins[i].speed;
        let distanceX = Math.pow((gameData.coins[i].x - gameData.player.x),2);
        let distanceY = Math.pow((gameData.coins[i].y - gameData.player.y),2);
        let distance = Math.sqrt(distanceX + distanceY);
        if(distance < 0.05 / 2 + 0.1 / 3){
            gameData.coins.splice(i,1);
            gameData.player.score++;
            document.querySelector("#curr-score").innerHTML = "Score:"+gameData.player.score;
        }
    }
    for(let i = 0; i < gameData.bombs.length; i++){
        gameData.bombs[i].y -= 0.002 + 0.0005*gameData.bombs[i].speed;
        let distanceX = Math.pow((gameData.bombs[i].x - gameData.player.x),2);
        let distanceY = Math.pow((gameData.bombs[i].y - gameData.player.y),2);
        let distance = Math.sqrt(distanceX + distanceY);
        if(distance < 0.05 / 2 + 0.1 / 3){
            gameData.bombs.splice(i,1);
            setTimeout(gameOver,50);
        }
    }
}
function drawGame(){
    let game = document.querySelector("#game");
    let ctx = game.getContext("2d");

    ctx.beginPath();
    ctx.fillStyle = "rgb(0,150,250)";
    ctx.fillRect(0,0,game.width,game.height);
    ctx.closePath();

    if(gameData.clouds){
        let cloudH = game.height*0.05;
        let cloudW = cloudH * 2.13;
        for(let i = 0; i < gameData.clouds.length; i++){
            let index = gameData.clouds[i].type;
           
            ctx.beginPath();
            ctx.imageSmootingEnabled = false;
            ctx.drawImage(
                gameData.images.clouds[index],
                gameData.clouds[i].x * game.width - cloudW/2,
                gameData.clouds[i].y * game.height - cloudH/2,
                cloudW, cloudH
            );
            ctx.closePath();
        }
    }

    if(gameData.coins){
        let coinSize = game.height*0.05;
        for(let i = 0; i < gameData.coins.length; i++){
            ctx.beginPath();
            ctx.imageSmootingEnabled = false;
            ctx.drawImage(
                gameData.images.coin,
                gameData.coins[i].x * game.width - coinSize/2,
                gameData.coins[i].y * game.height - coinSize/2,
                coinSize, coinSize
            );
            ctx.closePath();
        }
    }
    if(gameData.bombs){
        let bombSize = game.height*0.05;
        for(let i = 0; i < gameData.bombs.length; i++){
            ctx.beginPath();
            ctx.imageSmootingEnabled = false;
            ctx.drawImage(
                gameData.images.bomb,
                gameData.bombs[i].x * game.width - bombSize/2,
                gameData.bombs[i].y * game.height - bombSize*3/2,
                bombSize, bombSize*2
            );
            ctx.closePath();
        }
    }

    if(gameData.player){
        let playerSize = game.height*0.1;
        ctx.beginPath();
        ctx.imageSmootingEnabled = false;
        ctx.drawImage(
            gameData.images.player[gameData.player.dir],
            gameData.player.x * game.width - playerSize/2,
            gameData.player.y * game.height - playerSize/2,
            playerSize, playerSize
        );
        ctx.closePath();
    }
}

/*--Game Events------------------------------------------------------------------------------------------------------------------------------------*/
window.onkeydown = (e)=>{
    if(gameData.inGame){
        switch(e.key){
            default:break;
            case "p":pauseGame();break;
            case "P":pauseGame();break;

            case "w":gameData.player.acc[0] = 1;break;
            case "W":gameData.player.acc[0] = 1;break;
            case "ArrowUp":gameData.player.acc[0] = 1;break;

            case "s":gameData.player.acc[1] = 1;break;
            case "S":gameData.player.acc[1] = 1;break;
            case "ArrowDown":gameData.player.acc[1] = 1;break;

            case "a":gameData.player.acc[2] = 1;break;
            case "A":gameData.player.acc[2] = 1;break;
            case "ArrowLeft":gameData.player.acc[2] = 1;break;

            case "d":gameData.player.acc[3] = 1;break;
            case "D":gameData.player.acc[3] = 1;break;
            case "ArrowRight":gameData.player.acc[3] = 1;break;
        }
    }
}
window.onkeyup = (e)=>{
    if(gameData.inGame){
        switch(e.key){
            default:break;
            case "w":gameData.player.acc[0] = 0;break;
            case "W":gameData.player.acc[0] = 0;break;
            case "ArrowUp":gameData.player.acc[0] = 0;break;

            case "s":gameData.player.acc[1] = 0;break;
            case "S":gameData.player.acc[1] = 0;break;
            case "ArrowDown":gameData.player.acc[1] = 0;break;

            case "a":gameData.player.acc[2] = 0;break;
            case "A":gameData.player.acc[2] = 0;break;
            case "ArrowLeft":gameData.player.acc[2] = 0;break;

            case "d":gameData.player.acc[3] = 0;break;
            case "D":gameData.player.acc[3] = 0;break;
            case "ArrowRight":gameData.player.acc[3] = 0;break;
        }
    }
}
function pauseGame(){
    let pauseScreen = document.querySelector(".pause-screen");
    if(stopGameLoop){
        startGameLoop();
        pauseScreen.style.animation = "fadeOut ease-in-out 0.2s";
        pauseScreen.onanimationend = ()=>{
            pauseScreen.style.animation = "none";
            pauseScreen.style.display = "none";
            pauseScreen.onanimationend = null;
        }
    }
    else{
        pauseScreen.style.animation = "fadeIn ease-in-out 0.2s";
        pauseScreen.style.display = "flex";
        stopGameLoop = true;
    }
}
function gameOver(){
    document.querySelector(".score").innerHTML = "Score:"+gameData.player.score;
    document.querySelector(".best-score").innerHTML = "Best score:"+gameData.best;
    let gameEnd = document.querySelector("#game-end");
    gameEnd.style.animation = "fadeIn ease-in-out 0.2s";
    gameEnd.style.display = "block";
    gameData.inGame = false;
    stopGameLoop = true;

    if(gameData.player.score > gameData.best){
        gameData.best = gameData.player.score;
        localStorage.setItem("wing-game-best-score",JSON.stringify(gameData.best));
    }
}
