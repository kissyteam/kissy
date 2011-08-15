var MenuButton2 = (function(S) {
    var $ = S.all;
    var re = {
        _init:function() {

        }
    };

    re.Select = {
        decorate:function(el, cfg) {
            el = $(el)[0];
            var r = {
                set:function(key, value) {
                    if (r["_set_" + key]) {
                        r["_set_" + key](value);
                    } else {
                        S.error("不支持该调用！");
                    }
                },

                _set_selectedIndex:function(value) {
                    if (el.options.length <= value) {
                        value = el.options.length - 1;
                    }
                    el.options[value].selected = true;
                },

                _get_selectedItem:function() {
                    if (el.selectedIndex == -1) {
                        return null;
                    }
                    var options = el.options;
                    for (var i = 0; i < options.length; i++) {
                        if (options[i].selected) {
                            return new re.Option({o:options[i]});
                        }
                    }
                },

                _set_selectedItem:function(item) {
                    var options = el.options;
                    for (var i = 0; i < options.length; i++) {
                        options[i].selected = item.o == options[i];
                    }
                },

                _get_value:function() {
                    return $(el).val();
                },

                _get_selectedIndex:function() {
                    return   el.selectedIndex;
                },

                get:function(key) {
                    if (r["_get_" + key]) {
                        return r["_get_" + key](key);
                    } else {
                        S.error("不支持该调用！");
                    }
                },
                removeItems:function() {
                    el.options.length = 0;
                },
                addItem:function(option) {
                    el.options.add(option.o);
                },
                removeItem:function(option) {
                    var os = el.options,re = [];
                    for (var i = 0; i < os.length; i++) {
                        if (os[i] == option.o) {
                        } else {
                            re.push(os[i]);
                        }
                    }
                    el.options.length = 0;
                    S.each(re, function(r) {
                        el.options.add(r)
                    });
                },
                hide:function() {
                    $(el).hide();
                },
                show:function() {
                    $(el).show();
                },

                on:function(event, handle) {
                    if (event === 'click') {
                        $(el).on('change', handle, r);
                    } else {
                        S.error("不支持该调用！");
                    }
                },
                detach:function(event, handle) {
                    if (event === 'click') {
                        $(el).detach('change', handle, r);
                    } else {
                        S.error("不支持该调用！");
                    }
                },
                destroy:function() {
                    $(el).detach();
                    $(el).remove();
                }
            };
            return r;
        }
    };

    re.Option = function(cfg) {
        if (cfg.o) {
            this.o = cfg.o;
        } else {
            this.o = new Option(cfg.content, cfg.value);
        }
    };

    S.augment(re.Option, {

        get:function(key) {
            var r = this;
            if (r["_get_" + key]) {
                return r["_get_" + key](key);
            } else {
                S.error("不支持该调用！");
            }
        },
        _get_content:function() {
            return this.o.text;
        },
        _get_value:function() {
            return this.o.value;
        },

        set:function(key, value) {
            var r = this;
            if (r["_set_" + key]) {
                r["_set_" + key](value);
            } else {
                S.error("不支持该调用！");
            }
        },
        _set_content:function(value) {
            this.o.text = value;
        },
        _set_value:function() {
            this.o.value = value;
        }

    });

    return re;
})(KISSY);