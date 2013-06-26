module.exports=function(req,res,utils){
    res.send(utils.render('runner',{
        component:'anim',
        tests:['frame','fx','pause','queue','scroll','simple']
    }));
};