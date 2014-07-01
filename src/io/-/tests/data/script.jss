module.exports=function(req,res){
    res.set('Content-Type','text/javascript');
    res.send('alert("script loaded");');
};