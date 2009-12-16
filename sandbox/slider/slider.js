// vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=gbk nobomb:
/**
 * KISSKY - Slider module
 *
 * @author mingcheng<i.feelinglucky#gmail.com>
 * @since  2009-12-16
 * @link   http://www.gracecode.com/
 */

KISSY.add("carousel", function(S) {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang;

	var defConfig = {
		slidesClass: 'slider',
		triggersClass: 'slider-triggers',
        //triggers: null,
		currentClass: 'current',
		eventType: 'click',
        effect: 'none', // opacity, scroll
		autoPlayDelay: 3000,
		autoPlay: true,
        direction: 'vertical' // 'horizontal(h)' or 'vertical(v)'
	};

    var Slider = function(container, config) {

    };

    Lang.augmentObject(Slider.prototype, {
        _init: function() {
        
        
        },

        switchTo: function() {
        
        
        }

    });

    S.Slider = Slider;
});
