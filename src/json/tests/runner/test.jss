module.exports=function(req,res){
    res.render('runner',{
        component:'json',
        script:'delete KISSY.Env.mods.json;'
    });
};