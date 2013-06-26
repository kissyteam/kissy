module.exports=function(req,res,utils){
    res.send(utils.render('runner',{
        component:'overlay',
        externalLinks:['../../demo/other/assets/cool.css']
    }));
};