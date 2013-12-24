module.exports=function(req,res,utils){
    res.send(utils.render('runner',{
        component:'router-domain-error',
        tests:['router-domain-error']
    }));
};