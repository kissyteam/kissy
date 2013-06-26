module.exports=function(req,res,utils){
    res.send(utils.render('runner',{
        component:'component',
        tests:['align','component','control','decorate','extension','plugin']
    }));
};