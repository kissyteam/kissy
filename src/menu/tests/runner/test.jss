module.exports=function(req,res){
    res.render('runner',{
        component:'menu',
        externalLinks:['/kissy/src/menu/assets/picker.css']
    });
};