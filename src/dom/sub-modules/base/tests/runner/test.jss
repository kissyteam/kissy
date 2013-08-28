module.exports=function(req,res,utils){
    res.send(utils.render('runner',{
        externalScripts:['/kissy/tools/third-party/jquery.js'],
        component:'dom/base'
    }));
};