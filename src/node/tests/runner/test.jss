module.exports=function(req,res){
    res.render('runner',{
        component:'node',
        externalScripts:['/kissy/tools/third-party/jquery.js']
    });
};