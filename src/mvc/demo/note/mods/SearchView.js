KISSY.add(function(S, Node, mvc, Template) {

    var $ = Node.all,
        tmpl = new Template($("#searchTpl").html());

    function SearchView() {
        var self = this;
        SearchView.superclass.constructor.apply(this, arguments);
        this.searchInput = this.get("el").one(".searchInput");
        this.searchList = this.get("el").one(".searchList");
        this.get("notes").on("afterModelsChange", function() {
            self.searchList.html(tmpl.render({list:self.get("notes").toJSON()}));
        });
    }

    S.extend(SearchView, mvc.View, {
        search:function() {
            if (S.trim(this.searchInput.val())) {
                mvc.Router.navigate("/search/?q=" + encodeURIComponent(this.searchInput.val()));
            }
        },
        keyup:function(e) {
            if (e.keyCode == 13) {
                e.halt();
                this.searchInput[0].focus();
                this.search();
            }
        },
        back:function() {
            this.searchInput.val("");
            mvc.Router.navigate("/");
        }
    }, {
        ATTRS:{
            el:{
                value:'#search'
            },
            events:{
                value:{
                    '.searchBtn':{
                        'click':'search'
                    },
                    '.backBtn':{
                        'click':'back'
                    },
                    '.searchInput':{
                        'keyup':'keyup'
                    }
                }
            }
        }
    });

    return SearchView;

}, {
    requires:['node','mvc','xtemplate']
});