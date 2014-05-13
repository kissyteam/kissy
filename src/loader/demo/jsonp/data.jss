module.exports = function (req, res) {
    res.set('Content-Type: text/javascript');
    res.send('KISSY.add(function(){  return {test:"'+req.param('test')+'"}; });');
};