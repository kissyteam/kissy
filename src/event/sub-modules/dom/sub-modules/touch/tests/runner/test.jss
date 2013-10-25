module.exports=function(req,res,utils){
    res.send(utils.render('runner',{
        component:'event/dom/touch',
        script:'var phantomjs = KISSY.UA.phantomjs;' +
            'var canTestTouch = !phantomjs && (KISSY.Features.isTouchEventSupported());'
    }));
};