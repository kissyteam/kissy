module.exports=function(req,res,utils){
    res.send(utils.render('runner',{
        component:'intl/date-time-format'
    }));
};