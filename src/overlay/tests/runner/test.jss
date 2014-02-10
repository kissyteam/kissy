module.exports=function(req,res){
    res.render('runner',{
        component:'overlay',
        externalLinks:['../../demo/other/assets/cool.css']
    });
};