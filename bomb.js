var bombCanvas=document.getElementById("bombCanvas");
var ctx=bombCanvas.getContext("2d");
var img=document.getElementById("bombImg");

var level=document.getElementById("level");
//var	gameLevel=level.value;
var levelArray=[{
		axisX:9,
		axisY:9,
		bombCount:10,
		canvasSize:135
	},
	{
		axisX:16,
		axisY:16,
		bombCount:40,
		canvasSize:240
	},
	{
		axisX:30,
		axisY:16,
		bombCount:99,
		canvasSize:450
	}];
var levelIndex=["primary","middle","advance"];
var gameLevel=levelIndex.indexOf(level.value);
var bombNumber=levelArray[gameLevel].bombCount;
var configX=levelArray[gameLevel].axisX;
var configY=levelArray[gameLevel].axisY;
var rec=[];
var isFirstClick=1;                //1:首次单击
var isFirstUp=0;                   //用于判断是否双击  isFirstUp=1:
var clickValue=0;                  //用于判断是否双击  isFirstUp=0&&clickValue=2则为双击
var bombArray=[];                  //包含地雷方块下标的数组
var gameStatus=0;                  //0:未开局，1：进行中，2：失败，3：胜利；
var openedBlockCount=0;
var lastClickTime=new Date();        //记录上一次点击的时间
var lastKey=1;                      //记录上一次点击的键
init(gameLevel);

function startGame(){
	gameLevel=levelIndex.indexOf(level.value);
    bombNumber=levelArray[gameLevel].bombCount;
	configX=levelArray[gameLevel].axisX;
	configY=levelArray[gameLevel].axisY;
	bombCanvas.width=configX*15;
	bombCanvas.height=configY*15;
	isFirstClick=1;                //1:第一次单击
	isFirstUp=1;                   
	clickValue=0;                  
	bombArray=[];                //包含地雷方块下标的数组
	gameStatus=1;                //0:未开局，1：进行中，2：失败，3：胜利；
	openedBlockCount=0;
	init();
	deployBomb();	
//	bombCanvas.onclick=openBlock;
	bombCanvas.oncontextmenu=textmenuClick;
	bombCanvas.onmouseup=clickShow;
	bombCanvas.onmousedown=mouseDown;
    lastKey=1;
}


function init(){	
	//绘制格子

	for(var i=1;i<configX;i++){	
		ctx.moveTo(i*15,0);
		ctx.lineTo(i*15,configY*15);
		ctx.lineWidth=0.5;
		ctx.strokeStyle='grey';
		ctx.stroke();
	}	
	for(var j=1;j<configY;j++){
		ctx.moveTo(0,j*15);
		ctx.lineTo(configX*15,j*15);
		ctx.lineWidth=0.5;
		ctx.strokeStyle='grey';
		ctx.stroke();
		
	}
	
	//ctx.clearRect(0,0,15,15);
	
	//绘制初始化图形
	for(i=0;i<configX;i++){
		for(j=0;j<configY;j++){
			ctx.drawImage(img,2,2,15,15,i*15,j*15,14.5,14.5);
		}
	}
	
}


//设置数组存储每个格子的值： 雷/数字/空格/红旗
//初级9×9 中级16×16 高级16×30
function createMatrix(){
	var rec=[];
	for(i=0;i<configX;i++){
		rec[i]=[];
		for(j=0;j<configY;j++){
			rec[i][j]={
				bomb:0,            //0：无雷，1：有雷
				count:0,           //周围雷数，为0则为空格
				flag:0,           //0：未插旗， 1：插旗
				opened:0,          //0:未揭开， 1：已揭开的格子
				flagCount:0      //周围旗子数
			};	
		}
	}	
	return rec;
}



//布雷：随机生成雷，并计算雷周围数字
//根据等级选择雷数 初级10个雷，中级40个雷，高级99个雷
function deployBomb(){
	var x=0;
	var y=0;
	var roundBlock=[];         //周围格子数组下标
	rec=createMatrix();
	bombArray=[];
	bombNumber=levelArray[gameLevel].bombCount;
	
	while(bombNumber>0){
		x=Math.round((configX-1)*(Math.random()));
		y=Math.round((configY-1)*(Math.random()));
		if(rec[x][y].bomb!=1){
			rec[x][y].bomb=1;
			bombArray.push([x,y]);
			bombNumber--;		
		}
	  //  alert(""+rec[x][y].bomb+"index:"+x+","+y);
	}
	
    //遍历数组，设置雷数
	
	for(var i=0;i<configX;i++){
		for(var j=0;j<configY;j++){
			if(rec[i][j].bomb==1){
				roundBlock=[[i-1,j-1],[i-1,j],[i-1,j+1],[i,j-1],[i,j+1],[i+1,j-1],[i+1,j],[i+1,j+1]];
				for(var m=0;m<roundBlock.length;m++){
					if((roundBlock[m][0]>=0)&&(roundBlock[m][0]<configX)&&(roundBlock[m][1]>=0)&&(roundBlock[m][1]<configY)){
					rec[roundBlock[m][0]][roundBlock[m][1]].count+=1;
					}
				}
			}
		}
	}
	
	/*
	for(var i=0;i<configX;i++){
		for(var j=0;j<configY;j++){
			//若该处有雷，则其周围的方格雷数加1
			if(rec[i][j].bomb==1){
				//同一行
				if(j-1>=0){
					rec[i][j-1].count+=1;             //左
				}
				if(j+1<=configY-1){
					rec[i][j+1].count+=1;             //右
				}
				//上一行
				if(i-1>=0){
					rec[i-1][j].count+=1;             //正上
					if(j-1>=0){
						rec[i-1][j-1].count+=1;             //左上
					}
					if(j+1<=configY-1){
						rec[i-1][j+1].count+=1;             //右上
					}
				}
				//下一行
				if(i+1<=configX-1){
					rec[i+1][j].count+=1;               //正下
					if(j-1>=0){
						rec[i+1][j-1].count+=1;             //左下
					}
					if(j+1<=configY-1){
						rec[i+1][j+1].count+=1;             //右下
					}
				}
			}
		}
	}
	*/
	/*******test*******************************
	for(var i=0;i<configX;i++){
		for(var j=0;j<configY;j++){
			if(rec[i][j].bomb==1){
				alert("index:"+i+","+j+",value:"+rec[i][j].count);
			}	
		}
	}
	*/
}
	
//初始点击判断
//若开局第一次单击为雷，则重新布雷
//单击事件
//单击揭开空格/数字/雷
//若该格子已插上旗子，则无法单击
function openBlock(i,j){
	//获取单击位置
	if(gameStatus==2){
		alert("click Start Game to start a new game");
		return false;
	}
	
	/*
	var x=event.clientX-bombCanvas.offsetLeft;
	var y=event.clientY-bombCanvas.offsetTop;
	
	//根据点击位置判断属于哪个格子 
	var i=Math.floor(x/15);
	var j=Math.floor(y/15);
	//alert("x:"+x+",y:"+y);
	//alert("i:"+i+",j:"+j);
	*/
	//若为游戏开始时第一次单击，则判断首次单击是否为雷，若是则重新布雷
	if(isFirstClick==1){                                      
		while(rec[i][j].bomb==1){ 
			/*
			for(var m=0,l=bombArray.length-1;m<=l;m++){
				rec[bombArray[m][0]][bombArray[m][1]].bomb=0;                //清除已布署的雷并重新部署
			}
			*/
			deployBomb();
		}
		isFirstClick=0;
	}
	//判断是否之前已经点击过，若没有点击过且没有插旗子，则揭开格子
	if((!(rec[i][j].opened))&&((!rec[i][j].flag))){
		//若为雷则游戏结束，揭开所有格子
		if(rec[i][j].bomb==1){
			for(var m=0,l=bombArray.length-1;m<=l;m++){
				x=bombArray[m][0];
				y=bombArray[m][1];
				ctx.clearRect(x*15,y*15,15,15);			
			ctx.drawImage(img,76.5,2,15,15,x*15,y*15,14.5,14.5);			
			}
			ctx.drawImage(img,58.5,2,15,15,i*15,j*15,14.5,14.5);
			rec[i][j].opened=1;
			gameStatus=2;
		}
		//若为数字则显示数字
		else if(rec[i][j].count!=0){
			drawNumber(i,j);
		}
		else if(rec[i][j].count==0){
			openSpace(i,j);
			rec[i][j].opened=1;	
		}
		endGame();
	}
}


//点击到空格时， 把周围格子都打开
//参数:i,j为点击到的空格坐标
function openSpace(i,j){
	//揭开该格子
	if(rec[i][j].opened!=1){
		//alert(rec[i][j].count);
		ctx.clearRect(i*15,j*15,15,15);
		rec[i][j].opened=1;
		//揭开周围格子
		//若周围格子仍然是空格，则对周围格子递归揭开周围
		//若周围格子为数字，在不再递归
		
		//同一行
		if(j-1>=0){
			if((rec[i][j-1].count==0)&&(rec[i][j-1].opened!=1)){                  //周围格子仍为空格，递归执行揭开周围格子的行为
			openSpace(i,j-1);                          //打开左边格子
			}
			else if(rec[i][j-1].opened!=1){  
				drawNumber(i,j-1);			//周围格子不是空格，揭开该格子写入相应数字，但不再继续揭开该格子的周围格子
			}
		}
		if(j+1<=configY-1){
			if((rec[i][j+1].count==0)&&(rec[i][j+1].opened!=1)){              
			openSpace(i,j+1);                                                       //右
			}  
			else if(rec[i][j+1].opened!=1){    
				drawNumber(i,j+1);
			}
		}
		//上一行
		if(i-1>=0){
			if((rec[i-1][j].count==0)&&(rec[i-1][j].opened!=1)){                    //正上
			openSpace(i-1,j); 			
			}  
			else if(rec[i-1][j].opened!=1){  
				drawNumber(i-1,j);
			}                 
			if(j-1>=0){
				if((rec[i-1][j-1].count==0)&&(rec[i-1][j-1].opened!=1)){                    //左上
					openSpace(i-1,j-1);  				
				}  
				else if(rec[i-1][j-1].opened!=1){  
					drawNumber(i-1,j-1);	
				}
			}
			if(j+1<=configY-1){
				if((rec[i-1][j+1].count==0)&&(rec[i-1][j+1].opened!=1)){                    //右上
					openSpace(i-1,j+1);  				
				}  
				else if(rec[i-1][j+1].opened!=1){ 
					drawNumber(i-1,j+1);
				}
			}
		}
		//下一行
		if(i+1<=configX-1){
			if((rec[i+1][j].count==0)&&(rec[i+1][j].opened!=1)){                            //正下
				openSpace(i+1,j);			
			}  
			else if(rec[i+1][j].opened!=1){  
				drawNumber(i+1,j);
			}                 
			if(j-1>=0){
				if((rec[i+1][j-1].count==0)&&(rec[i+1][j-1].opened!=1)){                    //左下
					openSpace(i+1,j-1); 				
				}  
				else if(rec[i+1][j-1].opened!=1){  
					drawNumber(i+1,j-1);	
				}
			}
			if(j+1<=configY-1){
				if((rec[i+1][j+1].count==0)&&(rec[i+1][j+1].opened!=1)){                    //右下
					openSpace(i+1,j+1); 				
				}  
				else if(rec[i+1][j+1].opened!=1){  
					drawNumber(i+1,j+1);
				}
			}
		}
		openedBlockCount+=1;
		endGame();
	}
}

//绘制数字
//参数:i,j为坐标
function drawNumber(i,j){
	ctx.clearRect(i*15,j*15,15,15);				
	ctx.font="12px Verdana";
	ctx.textBaseline="top";
	ctx.strokeText(rec[i][j].count,i*15+3,j*15);
	rec[i][j].opened=1;
	openedBlockCount+=1;
}


//右击插旗/取消插旗
function markFlag(i,j){
	/*
	//alert(event.button);
	var x=event.clientX-bombCanvas.offsetLeft;
	var y=event.clientY-bombCanvas.offsetTop;
	//根据点击位置判断属于哪个格子 
	var i=Math.floor(x/15);
	var j=Math.floor(y/15);
	*/
	//仅在格子未揭开时可以进行插旗操作
	if(gameStatus==1){
		if(rec[i][j].opened==0){
			if(rec[i][j].flag!=0){               //已插旗，则取消插旗
				ctx.clearRect(i*15,j*15,15,15);
				ctx.drawImage(img,2,2,15,15,i*15,j*15,14.5,14.5);
				rec[i][j].flag=!rec[i][j].flag;
			}
			else{
				ctx.drawImage(img,21.5,2,15,15,i*15,j*15,14.5,14.5);
				rec[i][j].flag=!rec[i][j].flag;
			}
		}	
	
	
		//统计格子周围的旗子数
		roundBlock=[[i-1,j-1],[i-1,j],[i-1,j+1],[i,j-1],[i,j+1],[i+1,j-1],[i+1,j],[i+1,j+1]];
		for(var m=0;m<roundBlock.length;m++){
			if((roundBlock[m][0]>=0)&&(roundBlock[m][0]<configX)&&(roundBlock[m][1]>=0)&&(roundBlock[m][1]<configY)){
				rec[roundBlock[m][0]][roundBlock[m][1]].flagCount+=(rec[i][j].flag?1:-1);
			}
		}
	}
	
	//return false;                                   //取消默认右击事件
}

function textmenuClick(event){
	event.returnValue=false;
	//event.cancelBubble=true;
}

//按键按下
function mouseDown(event){
	var clickTime=new Date();
	var diff=clickTime.getTime()-lastClickTime.getTime();     //获得这次点击与上次点击的时间差
	var currentKey=event.button;
	isFirstUp=!isFirstUp;
	if((diff<500)&&(isFirstUp==0)&&(!(lastKey==2&&currentKey==2))){                //与上一次点击时差小于门限值&&不是第一次单击&&不是两次右击，则判断为双击
		clickValue=2;
		isFisrtUp=0;
	}
	else{
		clickValue=1;
		isFirstUp=1;
	}
	
	lastClickTime=clickTime;
	
}


function clickShow(event){
	var x=event.clientX-bombCanvas.offsetLeft;
	var y=event.clientY-bombCanvas.offsetTop;
	//根据点击位置判断属于哪个格子 
	var i=Math.floor(x/15);
	var j=Math.floor(y/15);
	if(isFirstUp&&clickValue==1){
		if(event.button==0){                    //左击
			leftClick=setTimeout(function(){openBlock(i,j)},500);
		}
		else if(event.button==2){                //右击
			rightClick=setTimeout(function(){markFlag(i,j)},500);
		}
	}
	
	else if(clickValue==2){
		if((rec[i][j].opened==1)&&(rec[i][j].count!=0)){            //若双击的格子为数字且已打开，并且其周围插旗数等于雷数，则将周围未插旗的格子全都打开
			if(rec[i][j].flagCount==rec[i][j].count){
				if(lastKey==0){                                     //取消左击时间
					clearTimeout(leftClick);
				}
				if(lastKey==2){
					clearTimeout(rightClick);
				}
				roundBlock=[[i-1,j-1],[i-1,j],[i-1,j+1],[i,j-1],[i,j+1],[i+1,j-1],[i+1,j],[i+1,j+1]];
				for(var m=0;m<roundBlock.length;m++){
					if((roundBlock[m][0]>=0)&&(roundBlock[m][0]<configX)&&(roundBlock[m][1]>=0)&&(roundBlock[m][1]<configY)){
						if(rec[roundBlock[m][0]][roundBlock[m][1]].opened==0){
							openBlock(roundBlock[m][0],roundBlock[m][1]);
						}
					}
				}
			}
		}
		/*
		else if(rec[i][j].opened==0){                               //若双击的格子未打开，则视为单击处理
			openBlock(i,j);
		}   
		*/
		//isFirstUp=1;
	}
	lastKey=event.button;
	clickValue=0;
	
}


//结束游戏
//显示所有未揭开的雷
//提示游戏结束信息
function endGame(){
	//胜利
//	alert(configX+","+configY+","+levelArray[gameLevel].bombCount);
	if(openedBlockCount==(configX*configY-levelArray[gameLevel].bombCount)){
		gameStatus=3;
		alert("You Win\nClick Start Game to start a new game");
	}
	//失败
	if(gameStatus==2){
		//Openwindow=window.open("","newwin","height=200,width=200,toolbar=no,scrollbars=no,menubar=no");
		//Openwindow.document.write("You Lose\nClick Start Game to start a new game");
		//显示所有未揭开的雷
		
		alert("You Lose");
	}
}