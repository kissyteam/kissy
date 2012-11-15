module.exports=function(req,res){
    res.set('Content-Type','text/javascript');
    res.send(req.query.callback+'(1,2);');
};