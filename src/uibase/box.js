/**
 * UIBase.Box
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add('uibase/box', function(S) {


    function Box() {
    }


    Box.ATTRS = {
        html: {},
        width:{},
        height:{},
        elCls:{},
        elStyle:{},
        el:{
            getter:function() {
                return this.get("view").get("el");
            }
        }
    };


    Box.prototype = {
        _uiSetElStyle:function(c) {
            this._forwordStateToView("elStyle", c);
        },
        _uiSetHtml:function(c) {
            this._forwordStateToView("html", c);
        },
        _uiSetWidth:function(c) {
            this._forwordStateToView("width", c);
        },
        _uiSetHeight:function(c) {
            this._forwordStateToView("height", c);
        },
        _uiSetElCls:function(c) {
            this._forwordStateToView("elCls", c);
        }
    };

    return Box;
});
