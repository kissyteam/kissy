module.exports=function(req,res){
    res.render('runner',{
        component:'anim/timer',
        externalScript:'KISSY.config("modules",{' +
            '"anim":{' +
            'alias:"anim/timer"' +
            '}' +
            '})'
    });
};