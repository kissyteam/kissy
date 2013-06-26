module.exports=function(req,res,utils){
    res.send(utils.render('runner',{
        component:'node',
        externalScripts:['/kissy/tools/third-party/jquery.js']
    }));
};