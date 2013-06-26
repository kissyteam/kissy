module.exports=function(req,res,utils){
    res.send(utils.render('runner',{
        component:'anim/transition',
        script:"KISSY.config('anim/useTransition', true);",
        tests:['queue','simple']
    }));
};