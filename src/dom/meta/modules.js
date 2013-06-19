// consider documentMode
var oldIE = UA.ie && (UA.ie < 9 || document.documentMode < 9);
config({
    "dom": {
        "alias": ['dom/base', oldIE ? 'dom/ie' : '']
    }
});