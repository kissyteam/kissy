module.exports=function(req,res,utils){
    res.send(utils.render('runner',{
        component:'menu',
        externalLinks:['/kissy/src/menu/assets/picker.css']
    }));
};