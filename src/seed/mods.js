/**
 * @module mods
 * @author lifesinger@gmail.com
 */
(function(S) {

    var map = {
        core: {
            path: 'packages/core-min.js',
            charset: 'utf-8'
        }
    };

    S.each([
        'sizzle', 'dd', 'datalazyload', // 纯工具类
        'flash', // flash 类
        'switchable', 'suggest', 'calendar', // 传统 UI 组件
        'uibase', 'overlay', 'imagezoom' // 基于 uibase 的组件
    ],
        function(modName) {
            map[modName] = {
                path: modName + '/' + modName + '-pkg-min.js',
                requires: ['core'],
                charset: 'utf-8'
            };
        });

    map['calendar'].csspath = 'calendar/default-min.css';

    S.add(map);

})(KISSY);
