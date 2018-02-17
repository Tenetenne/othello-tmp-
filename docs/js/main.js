"use strict";

var data =[];
var BLACK = 1, WHITE = 2;
var WeightData = [
  [30, -12, 0, -1 , -1, 0, -12, 30],
  [-12, -15, -3, -3 , -3, -3, -15, -12],
  [0, -3, 0, -1 , -1, 0, -3, 0],
  [-1, -3, -1, -1 , -1, -1, -3, -1],
  [-1, -3, -1, -1 , -1, -1, -3, -1],
  [0, -3, 0, -1 , -1, 0, -3, 0],
  [-12, -15, -3, -3 , -3, -3, -15, -12],
  [30, -12, 0, -1 , -1, 0, -12, 30],
];
var myTurn = false;

// 初期化関数
(function(){
  var b = document.getElementById("board");

  for(var i = 0; i < 8; i++){
    var tr = document.createElement("tr");
    data[i] = [0, 0, 0, 0, 0, 0, 0, 0];

    for(var j = 0; j < 8; j++){
          var td = document.createElement("td");
          td.className = "cell";
          td.id = "cell" + i + j;
          td.onclick = clicked;
          tr.appendChild(td);
    }
    b.appendChild(tr);
  }

  put(3, 4, BLACK);
  put(4, 3, BLACK);
  put(3, 3, WHITE);
  put(4, 4, WHITE);

  update();

})();

// (i, j)に石を置く関数
function put(i, j, color){
  var c = document.getElementById("cell" + i + j);
  c.textContent = "●";

  c.className =  (color == BLACK ? "black" : "white");
  data[i][j] = color;
}

// 更新
function update(){
  var numBlack = 0, numWhite = 0;

  for(var i = 0; i < 8; i++){
    for(var j = 0; j < 8; j++){
      if(data[i][j] == WHITE){
        numWhite++;
      }
      if(data[i][j] == BLACK){
        numBlack++;
      }
    }
  }

  document.getElementById("numBlack").textContent = numBlack;
  document.getElementById("numWhite").textContent = numWhite;

  var blackFlip = canFlip(BLACK);
  var whiteFlip = canFlip(WHITE);

  if(numWhite + numBlack == 64 || (!blackFlip && !whiteFlip)){
    showMessage("GAME OVER");
  }
  else if (!blackFlip){
    showMessage("黒スキップ");
    myTurn = false;
  }
  else if (!whiteFlip){
    showMessage("白スキップ");
    myTurn = true;
  }
  else{
    myTurn =! myTurn;
  }
  if(!myTurn){
    setTimeout(think, 500);
  }
}

// クリックしたときの関数
function clicked(e){
  var id = e.target.id;
  var i = parseInt(id.charAt(4));
  var j = parseInt(id.charAt(5));
  var flipped = getFlipCells(i, j, BLACK);

  if(flipped.length > 0){
    for(var k = 0; k < flipped.length; k++){
      put(flipped[k][0], flipped[k][1], BLACK);
    }
    put(i, j, BLACK);
    update();
  }
}


// 挟めるコマがあるか確認
function canFlip(color){
  for(var i = 0; i < 8; i++){
    for(var j = 0; j < 8; j++){
        var flipped = getFlipCells(i, j, color);
        if(flipped.length > 0){
          return true;
        }
    }
  }
  return false;
}


function getFlipCells(i, j, color){
  if(data[i][j] == BLACK || data[i][j] == WHITE){
    return[];
  }

    var dirs = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    var result = [];

    for(var p = 0; p < dirs.length; p++){
      var flipped = getFlipCellsOneDir(i, j, dirs[p][0], dirs[p][1], color);
      result = result.concat(flipped);
    }

    return result;
}


function getFlipCellsOneDir(i, j, dx, dy, color){
  var x = i + dx;
  var y = j + dy;
  var flipped = [];


  if(x < 0 || y < 0 || x > 7 || y > 7 || data[x][y] == color || data[x][y] == 0){
       return [];
  }
  flipped.push([x, y]);

  while(1){
    x += dx;
    y += dy;

    if(x < 0 || y < 0 || x > 7 || y > 7 || data[x][y] == 0){
         return [];
    }

    if(data[x][y] == color){
      return flipped;
    } else{
      flipped.push([x, y])
    }
  }
}

// コンピュータ思考関数
function think(){
  var highScore = -1000;
  var px = -1, py = -1;
  for(var x = 0; x < 8; x++){
    for(var y = 0; y < 8; y++){
      var tmpData = copyData();
      var flipped = getFlipCells(x, y, WHITE);
      if(flipped.length > 0){
        for(var i = 0; i < flipped.length; i++){
          var p = flipped[i][0];
          var q = flipped[i][1];
          tmpData[p][q] = WHITE;
          tmpData[x][y] = WHITE;
        }

        var score = calcWeightData(tmpData);
        if(score > highScore){
          highScore = score;
          px = x, py = y;
        }
      }
    }
  }

  if(px >= 0 && py >= 0){
    var flipped = getFlipCells(px, py, WHITE);
    if(flipped.length > 0){
      for(var k = 0; k < flipped.length; k++){
        put(flipped[k][0], flipped[k][1], WHITE);
      }
    }
    put(px, py, WHITE);
  }

  update();
}

// コマデータをコピー
function copyData(){
  var tmpData = [];
  for (var x = 0; x < 8; x++){
    tmpData[x] = [];
    for (var y = 0; y < 8; y++){
      tmpData[x][y] = data[x][y];
    }
  }
  return tmpData;
}

// 重みの合計
function calcWeightData(tmpData){
  var score = 0;
  for(var x = 0; x < 8; x++){
    for(var y = 0; y < 8; y++){
        if(tmpData[x][y] == WHITE){
          score += WeightData[x][y];
        }
    }
  }
  return score;
}

function showMessage(str){
  document.getElementById("message").textContent = str;
  setTimeout(function(){
    document.getElementById("message").textContent = "";
  }, 2000);
}
