module.exports = function (req, res) {
    res.render('runner', {
        externalLinks: [
            '/kissy/src/css/assets/dpl/base.css',
            '/kissy/build/editor/theme/cool/editor-debug-sprite.css'
        ],
        component: 'editor'
    });
};