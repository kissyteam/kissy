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

    S.each(['sizzle', 'datalazyload', 'flash', 'switchable',
        'suggest', 'overlay', 'imagezoom', 'calendar'], function(modName) {
        map[modName] = {
            path: modName + '/' + modName + '-pkg-min.js',
            requires: ['core'],
            charset: 'utf-8'
        };
    });

    map['calendar'].csspath = 'calendar/default-min.css';

    S.add(map);

})(KISSY);

/**
 * NOTES:
 *
 *  2010/08/16 玉伯：
 *   - 采用实用性粒度，防止颗粒过小给用户带来的不方便。
 *
 */
