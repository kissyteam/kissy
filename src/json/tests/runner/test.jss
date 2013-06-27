module.exports=function(req,res,utils){
    res.send(utils.render('runner',{
        component:'json',
        script:'delete KISSY.Env.mods.json;'
    }));
};