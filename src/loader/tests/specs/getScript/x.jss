module.exports = function (req, res) {
    res.set('Content-Type', 'Content-Type:text/javascript;charset=utf-8');
    res.set('Expires', 'Thu, 04 May 2023 01:35:29 GMT');
    res.send('KISSY.log("我");window.x++;');
};
