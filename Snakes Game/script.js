function init(){
    console.log("hello");
    canvas=document.getElementById('mycanvas');
    pen=canvas.getContext("2d");
    W=canvas.width;
    H=canvas.height;
    score=0;
    food=getRandomFood();
    gameover=false;
    snake = {
        init_l:5,
        color:"aqua",
        cell:[],
        direction:"right",

        createSnake:function(){
            for(var i=this.init_l-1;i>=0;i--){
                this.cell.push({x:i,y:0});
            }
        },

        drawSnake:function(){
            
            for(var i=0;i<this.cell.length;i++){
                pen.fillStyle=this.color;
                pen.strokeStyle="white";
                pen.lineWidth=2;
                //pen.fillRect(x-coordinate,y-coordinate,width,height)
                pen.fillRect(this.cell[i].x*10,this.cell[i].y*10,10,10);
                pen.strokeRect(this.cell[i].x*10,this.cell[i].y*10,10,10);
            }
        },

        updateSnake:function(){
           var headX=this.cell[0].x;//5
           var headY=this.cell[0].y;//0

           if(headX==food.x && headY==food.y){
            food=getRandomFood();
            score++;
           }
           else{
            this.cell.pop();
           //This will pop last cell i.e 0,0
           }
           

           if(this.direction =="right"){
            nextX=headX+1;//6
            nextY=headY;//0
           }
           else if(this.direction=="left"){
            nextX=headX-1;
            nextY=headY;
            }
           else if(this.direction=="down"){
            nextX=headX;//5
            nextY=headY+1;//1
            }
           else {
            nextX=headX;
            nextY=headY-1;
            }
            //Insert cell at front
            this.cell.unshift({x:nextX,y:nextY});
            // cell=
            //[6,0;//newx,newy
            // 5,0;
            // 4,0;
            // 3,0;
            // 2,0;
            // 1,0;]

            //coordinate Boundary
            var last_x=Math.round(W/10);
            var last_y=Math.round(H/10);
            if(this.cell[0].y<-1 || this.cell[0].x <-1|| this.cell[0].x>last_x || this.cell[0].y>last_y){
                alert("GameOver");
                gameover = true;
        }
        }
    }
    snake.createSnake();

    function keypressed(e){
            console.log(e);
            if(e.key=="ArrowRight"){
                snake.direction = "right";
            }
            else if(e.key=="ArrowLeft"){
                snake.direction = "left";
            }
            else if(e.key=="ArrowDown"){
                snake.direction = "down"; 
            }
            else{
                snake.direction = "up";
            }
    }

    document.addEventListener('keydown',keypressed);
}
    



function draw(){
    pen.clearRect(0,0,W,H);
    snake.drawSnake();
    //Draw food
    console.log(food.color)

    pen.fillStyle=food.color;
    pen.fillRect(food.x*10,food.y*10,10,10);

    pen.fillStyle = "white";
    pen.font = "14px Roboto";
    pen.fillText("Level : "+score,0,10);
    

}
function update(){
    snake.updateSnake();
}   
function gameloop(){
    draw();
    update();
    if(gameover==true){
        clearInterval(f);
    }
}

function getRandomFood(){
    var foodx=Math.round(Math.random()*(W-10)/10);
    var foody=Math.round(Math.random()*(H-10)/10);

    var foodColors = ["red","green","orchid"];
    var i = Math.round(Math.random()*foodColors.length);
    console.log("Food x:"+foodx+"y:"+foody);
    

    var food={
        x:foodx,
        y:foody,
        color:foodColors[i]
    }

    return food;
}
init();
var f=setInterval(gameloop,100);