import './style.css';

const PIECES = [
  [[1, 1, 1, 1]],         // I piece
  [[1, 1, 1], [1, 0, 0]],       // L piece
  [[1, 1, 1], [0, 0, 1]],       // L piece
  [[1, 1, 1], [0, 1, 0]],    // T piece
  [[1, 1, 1], [1, 0, 0]],    // J piece
  [[1, 1], [1, 1]],       // O piece
  [[1, 1, 0], [0, 1, 1]], // Z piece
  [[0, 1, 1], [1, 1, 0]]  // S piece
];

//SCORE
let SCORE = 0;
const span = document.getElementById("score");
const contentScore = document.querySelector(".content-score");
span.textContent = SCORE;

//CANVAS
const canvas = document.querySelector("canvas");
const context = canvas.getContext('2d');

const BLOCK_SIZE = 20;
const BOARD_WIDTH = 14;
const BOARD_HEIGHT = 30;

canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

context.scale(BLOCK_SIZE, BLOCK_SIZE);

//Piezas
const piece = {
  position: {x: Math.floor(BOARD_WIDTH / 2 - 2) , y: 0},
  shape: PIECES[Math.floor(Math.random() * PIECES.length)],
};

//Mapa del juego
const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT);

function createBoard(w, h){
  return Array(h).fill().map(() => Array(w).fill(0));
}

let dropCounter = 0;
let lastTime = 0;


// Add a variable to store the initial drop interval
let initialDropInterval = 900;
let speedReductionCount = 0;

// Update the drop interval based on the score
const updateDropInterval = () => {
  // Calculate the speed reduction count based on the score
  const newSpeedReductionCount = Math.floor(SCORE / 20);
  
  // If the speed reduction count has increased, reduce the drop interval
  if (newSpeedReductionCount > speedReductionCount) {
    speedReductionCount = newSpeedReductionCount;
        
    // Reduce the drop interval by 50 for every 300 points
    initialDropInterval -= 20;
    
    // Ensure the drop interval doesn't go below a minimum value (e.g., 100)
    if (initialDropInterval < 50) {
      initialDropInterval = 100;
    }
  }
};

//Game loop, 
const upDate = (time = 0) =>{
  const deltaTime = time - lastTime;
  lastTime = time;

  updateDropInterval();

  dropCounter = deltaTime + dropCounter;

  if(dropCounter > initialDropInterval){
    piece.position.y++;
    dropCounter = 0;

    if(checkCollision()){
      piece.position.y--;
      solidifyPiece();
      removeRows();
    }
  }

  draw();
  window.requestAnimationFrame(upDate);
}

//Se encarga de dibujar cada FRAME
const draw = () =>{
  context.fillStyle = "black";
  context.fillRect(0,0, canvas.width, canvas.height);


  //Dibujo de mapa
  board.forEach((row, y) =>{
    row.forEach((value, x) =>{
      if(value === 1){
        context.fillStyle = "blue";
        context.fillRect(x, y, 1, 1);
      }
    });
  });

  //Dibujo de mapa
  piece.shape.forEach((row, y) =>{
    row.forEach((value, x) =>{
      if(value){
        context.fillStyle = "red";
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
      }
    });
  });
}

document.addEventListener("keydown", event=> {
  if(event.key == "ArrowLeft"){ 
    piece.position.x--;
    if(checkCollision()){
      piece.position.x++;
    }
  }

  if(event.key == "ArrowRight"){ 
    piece.position.x++
    
    if(checkCollision()){
      piece.position.x--;
    }  
  
  }

  if(event.key == "ArrowDown") {
    piece.position.y++
    
    if(checkCollision()){
      piece.position.y--;
      solidifyPiece();
      removeRows();
    }
  }

  //Rotacion de la Pieza
  if(event.key == "ArrowUp" || event.key == "Enter" || event.key === " ") {
    // Rotar la pieza en sentido horario al presionar "ArrowUp"
    rotatePieceClockwise(piece);
  }
})

//Rotacion de Pieza
const rotatePieceClockwise = (piece) => {
  const newShape = [];
  const size = piece.shape[0].length;
  
  //Recorro la cantidad dentro de fila
  for (let y = 0; y < size; y++) {
    const newRow = [];

    for (let x = piece.shape.length - 1; x >= 0; x--) {
      newRow.push(piece.shape[x][y]);
    }

    newShape.push(newRow);
  }

  const prevShape = piece.shape;
  piece.shape = newShape;

    // Verificar colisión después de la rotación
    if (checkCollision()) {
      piece.shape = prevShape;
    }

};


//Verifica si las piezas se inteseccionan o si pasa por los bordes de la pantallas
const checkCollision = () =>{
  return piece.shape.find((row, y) =>{
    return row.find((value, x) =>{
      return(
        value !== 0 &&
        board[y + piece.position.y]?.[x + piece.position.x] !== 0
      )
    })
  })
}

//Solificacion de las piezas
const solidifyPiece = () =>{
  piece.shape.forEach((row, y) =>{
    row.forEach((value, x) =>{
      if(value == 1){
        board[y + piece.position.y][x + piece.position.x] = 1;
      }
    })
  })

  piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)];

  piece.position.x= Math.floor(BOARD_WIDTH / 2 - 2);
  piece.position.y= 0;

  if(checkCollision()){
    alert("Game Over");
    SCORE = 0;
    initialDropInterval = 1000;
    speedReductionCount = 0;    
    board.forEach((row)=> row.fill(0));
    
  }
}

const removeRows = ()=>{
  //Ingresa una fila vacia
  const rowsToRemove = [];

  //Guarda en el array las posiciones que hay que  eliminar
  board.forEach((row, y) =>{
    if(row.every(value => value == 1)){
        rowsToRemove.push(y);
    }
  });
  
  rowsToRemove.forEach((y)=>{
    //Esto lo que hace es eliminar la fila guarda en el array
    board.splice( y , 1);

    //Crea un Array con la mismas cantidad de columnas
    const newRow = Array(BOARD_WIDTH).fill(0);
    //Incorpora un nuevo Array al principio del tablero
    board.unshift(newRow);

    SCORE += 10;

    span.textContent = SCORE;

  })
}

const start = document.getElementById("start");
const h1 = document.querySelector("h1");

start.addEventListener("click", (e) => {
  start.remove();
  h1.remove();
  
  const audio = new window.Audio("./file/Tetris.mp3");

  audio.volume = 0.4;
  audio.play();
  audio.loop = true;
  

  upDate();
  contentScore.setAttribute("style", "display: block;");
})
