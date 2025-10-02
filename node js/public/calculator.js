let string="";
let btn=document.querySelectorAll('.btn');
let i=document.querySelector('input');
btn.forEach((btn)=>{
    btn.addEventListener('click',(e)=>{
        if(e.target.innerHTML == '='){
            string=eval(string);
            i.value=string
        }
        else if(e.target.innerHTML == 'C'){
            string="";
            i.value=string
        }
        else{
        string=string + e.target.innerHTML;
        i.value=string
        }
    })
})