module.exports=function(req,res,utils){
    res.send(utils.render('runner',{
        component:'resizable',
        externalLinks:['../../demo/resizable.css']
    }));
};