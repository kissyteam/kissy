module.exports = function (req, res, utils) {
    res.send(utils.render('runner', {
        externalLinks: [
            '/kissy/src/css/assets/dpl/base.css',
            '/kissy/build/editor/theme/cool/editor.css'
        ],
        component: 'editor'
    }));
};