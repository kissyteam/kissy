/**
 * @fileOverview validation
 * @author 常胤 (lzlu.com)
 * @version 2.0
 * @date 2011.5.18
 */

KISSY.add("validation/base", function(S, DOM, Event, Util, Define, Field, Warn, Rule) {

    /**
     * KISSY.Validation构造函数
     * @param form {String} 要验证的form表单
     * @param config {Object} 配置
     */
    function Validation(form, config) {
        var self = this;

        if (S.isString(form)) {
            form = S.get(form);
        }

        if (!form) {
            Util.log("请配置正确的form ID.");
            return;
        }

        self._init(form, config || {});
    }


    /**
     * KISSY.Validation原型扩展
     */
    S.augment(Validation, S.EventTarget, {

        /**
         * @private
         * @param form {Element}
         * @param config {Object}
         */
        _init: function(form, config) {
            var self = this;

            //合并默认配置和用户配置
            self.config = S.merge(Define.Config, config);

            /**
             * 当前操作的表单
             * @name Validation.form
             * @type {Element}
             */
            self.form = form;

            //保存所有要操作的KISSY.Validation.Field实例
            self.fields = new Util.storage();

            //初始化字段
            self._initfields();

        },

        /**
         * 初始化所有通过伪属性配置了校验规则的field
         * @private
         */
        _initfields: function() {
            var self = this, cfg = self.config;
            S.each(self.form.elements, function(el) {
                var attr = DOM.attr(el, cfg.attrname);
                if (attr)self.add(el, Util.toJSON(attr.replace(/'/g, '"')));
            });
        },

        /**
         * 添加要校验的field
         * 支持两种方式：
         *     1.Validation.Field实例
         *     2.字段
         * @param {String|Element} field
         * @param {Object} config
         */
        add: function(field, config) {
            var self = this, fields = self.fields,
                cfg = S.merge(self.config, config);

            //直接增加Validation.Field实例
            if (S.isObject(field) && field instanceof Field) {
                fields.add(DOM.attr(field.el, "id"), field);
                return self;
            }

            //实例化Validation.Field后增加
            var el = DOM.get(field) || DOM.get("#" + field), id = DOM.attr(el, "id");

            if (!el || el.form != self.form) {
                Util.log("字段" + field + "不存在或不属于该form");
                return;
            }

            //给对应的field生成一个id
            if (!id) {
                id = cfg.prefix + S.guid();
                DOM.attr(el, "id", id);
            }

            fields.add(id, new Field(el, cfg));
        },

        /**
         * 将已添加的field排除
         * @param {String} field id
         */
        remove: function(field) {
            this.fields.remove(field);
        },

        /**
         * 通过field的id获取对应的field实例
         * @param id {String}
         */
        get: function(id) {
            return this.fields.get(id);
        },

        /**
         * 触发校验,指定字段则只校验指定字段，否则校验所有字段
         * @param {?String}
            * @return {Boolean} 是否验证通过
         */
        isValid: function(field) {
            var self = this, store = self.fields;

            //校验单个字段
            if (field && store.get(field)) {
                return store.get(field).isValid();
            }

            //校验所有字段
            var flag = true;
            store.each(function(id, field) {
                if (!field.isValid()) {
                    flag = false;
                    //验证截至到第一个出错的字段
                    if (field.single) {
                        return false;
                    }
                }
            });

            return flag;
        },


        /**
         * 提交表单,会先校验所有字段
         */
        submit: function() {
            var self = this, flag = self.fire("submit", self.fields);
            if (flag && self.isValid()) {
                self.form.submit();
            }
        }

    });


    S.mix(Validation, {
        Util: Util,
        Define: Define,
        Field: Field,
        Warn: Warn,
        Rule: Rule
    });


    /**
     * @class: Validation表单验证组件
     * @constructor
     */
    return Validation;

}, { requires: ["dom","event","./utils","./define","./field","./warn","./rule"] });