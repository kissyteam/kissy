/**
 * adapt json2 to kissy
 * @author lifesinger@gmail.com
 */
KISSY.add('json', function (S) {

    var JSON = window.JSON;

    S.JSON = {

        parse: function(text) {
            // 当输入为 undefined / null / '' 时，返回 null
            if(text == null || text === '') return null;
            return JSON.parse(text);
        },

        stringify: JSON.stringify
    };
});
