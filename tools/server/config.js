var SERVER_CONFIG = {
    'ports': [8888, 9999],
    'codeDir': '/alidata/www/dev.kissyui.com/kissy',
    'newDocsDir': '/alidata/www/docs.kissyui.com/docs.kissyui.com/',
    'docsDir': '/alidata/www/docs.kissyui.com/kissyteam.github.com'
};

if (typeof module !== 'undefined') {
    module.exports = SERVER_CONFIG;
}
