
    var $ = require('node');
    var mvc = require('../mvc/');
    var Template = require('xtemplate');
    var router=require('router');
    var util = require('util');
    var tmpl = new Template($('#searchTpl').html());

    module.exports = mvc.View.extend({
        constructor: function () {
            this.callSuper.apply(this,arguments);
            var self = this;
            this.searchInput = this.get('el').one('.searchInput');
            this.searchList = this.get('el').one('.searchList');
            this.get('notes').on('afterModelsChange', function () {
                self.searchList.html(tmpl.render({list: self.get('notes').toJSON()}));
            });
        },
        search: function () {
            if (util.trim(this.searchInput.val())) {
                router.navigate('/search/?q=' + encodeURIComponent(this.searchInput.val()));
            }
        },
        keyup: function (e) {
            if (e.keyCode === 13) {
                e.halt();
                this.searchInput[0].focus();
                this.search();
            }
        },
        back: function () {
            this.searchInput.val('');
            router.navigate('/');
        }
    }, {
        ATTRS: {
            el: {
                value: '#search'
            },
            events: {
                value: {
                    '.searchBtn': {
                        'click': 'search'
                    },
                    '.backBtn': {
                        'click': 'back'
                    },
                    '.searchInput': {
                        'keyup': 'keyup'
                    }
                }
            }
        }
    });