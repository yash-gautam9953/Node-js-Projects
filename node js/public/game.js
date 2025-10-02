let userScore=0;
let compScore=0;
let choice=document.querySelectorAll(".choice");
let msg=document.querySelector("#message");
let uscore=document.querySelector("#userScore");
let cscore=document.querySelector("#compScore");

const compChoice = () =>{
     let options =["rock","paper","scissor"];
     const cC=Math.floor(Math.random()*3);
  return options[cC];
}
const draw = () =>{
    console.log("match is draw");
    msg.innerText="Match is draw ! play Again";
}

const result =(userWin,yash,harsh) =>{
    if(userWin){
        userScore++;
uscore.innerText=userScore;
        console.log("You win");
        msg.innerText=`You Win! your ${yash} beats ${harsh}`;
   msg.style.backgroundColor="greenyellow";
    }else{
        compScore++;
        cscore.innerText=compScore;
console.log("You lose");
msg.innerText=`You Lose!${harsh} beats your ${yash}`;
msg.style.backgroundColor="red";
    }

}

const playGame = (yash) =>{
    console.log("User choice is =",yash);
    let harsh=compChoice();
    console.log("computer choice =",harsh);
    let userWin =true;
    if(yash===harsh){
        draw();
    }else{
        if(yash==="rock"){
      userWin = harsh==="paper" ? false :true;
        }else if(yash==="paper"){
           userWin=harsh==="rock" ? true :false;
        }else if(yash==="scissor"){
userWin=harsh==="rock"?false :true;
        }
        console.log(userWin );
        result(userWin,yash,harsh);
    }

} 
choice.forEach((val) =>{
val.addEventListener("click", () => {
    const yash=val.getAttribute("id");
playGame(yash);

}) ;
});


