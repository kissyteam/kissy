module.exports=function(req,res){
    res.render('runner',{
        component:'overlay',
        externalLinks:['../../demo/other/d-assets/cool.css'],
        query: req.query
    });
};
