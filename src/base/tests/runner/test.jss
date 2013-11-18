module.exports=function(req,res,utils){
    res.send(utils.render('runner',{
        component:'base',
        query:req.query
    }));
};