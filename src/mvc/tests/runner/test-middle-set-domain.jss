module.exports=function(req,res,utils){
    res.send(utils.render('runner',{
        component:'mvc-middle-set-domain-error',
        tests:['router-domain-error']
    }));
};