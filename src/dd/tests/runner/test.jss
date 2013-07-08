module.exports=function(req,res,utils){
    res.send(utils.render('runner',{
        externalLinks:['/kissy/src/dd/tests/specs/base.css'],
        component:'dd'
    }));
};