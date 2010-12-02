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
        'sizzle', 'dd', 'datalazyload', // pure utilities
        'flash', // flash etc.
        'switchable', 'suggest', 'calendar', // UI components based on Base
        'uibase', 'overlay', 'imagezoom' // UI components based on UIBase
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
