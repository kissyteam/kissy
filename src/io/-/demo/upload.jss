module.exports=function(req,res){
    setTimeout(function(){
        res.send('{'x':1}');
    },1000);
};