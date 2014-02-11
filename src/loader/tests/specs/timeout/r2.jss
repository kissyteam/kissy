module.exports=function(req,res){
      setTimeout(function(){
          res.set('Content-Type','text/javascript');
          res.send('KISSY.add(function(){});');
      },5000);
};