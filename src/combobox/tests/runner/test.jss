module.exports=function(req,res,utils){
    res.send(utils.render('runner',{
        component:'combobox',
        tests:['simple','validator']
    }));
};