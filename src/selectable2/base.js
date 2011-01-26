KISSY.add("selectable2/base", function(S, Node) {

    function Base() {
        var self = this,
            inputNode = self.get("inputNode");

    }


    Base.ATTRS = {
        inputNode:{
            setter:function(el) {

                return Node.one(el);
            }
        },

        inputValue:{
        },

        inputDisplay:{
            valueFn:function() {
                this.get("inputNode").val();
            }
        }
    };


    Base.prototype = {

        _uiSetInputNode:function(n) {
            n.attr("autocomplete", "off");
        },

        _uiSetInputDisplay:function(v) {
            this.get("inputNode").val(v);
        },
        _uiSetInputValue:function(v) {
            this.get("inputNode").attr("data-value", v);
        }

    };

    return Base;
}, {
    requires:["node"]
});