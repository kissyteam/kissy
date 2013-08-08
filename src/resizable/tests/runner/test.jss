module.exports = function (req, res, utils) {
    res.send(utils.render('runner', {
        component: 'resizable',
        externalStyle: '.ks-resizable-proxy {' +
            'border: 1px dashed #426FD9;' +
            'position: absolute;' +
            '}',
        externalLinks: ['../../demo/resizable.css']
    }));
};