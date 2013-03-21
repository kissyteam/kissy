/**
 * css3 selector engine for ie6-8
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie/selector/index', function (S, parser) {

    return {
        parse: function (str) {
            var selector = parser.parse(str);
            return selector;
        }
    };

}, {
    requires: ['./parser']
});
/**
 * refer
 *  - http://www.w3.org/TR/selectors/
 *  - http://www.impressivewebs.com/browser-support-css3-selectors/
 *  - http://blogs.msdn.com/ie/archive/2010/05/13/the-css-corner-css3-selectors.aspx
 */