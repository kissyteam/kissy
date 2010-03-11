/**
 * Album Widget
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy, yui-base
 */
KISSY.add('album', function(S) {

        /**
         * 默认配置，和 Switchable 相同的部分此处未列出
         */
        var defaultConfig = {
            circular: true
        };

    /**
     * Album Class
     * @constructor
     */
    function Album(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Album)) {
            return new Album(container, config);
        }

        config = S.merge(defaultConfig, config || { });
        Album.superclass.constructor.call(self, container, config);
    }

    S.extend(Album, S.Switchable);
    S.Album = Album;
});
