module.exports=function(req,res){
    res.render('runner',{
        component:'node',
        externalScripts:['http://g.tbcdn.cn/kissy/third-party/0.1.0/jquery.js'],
        query: req.query
    });
};