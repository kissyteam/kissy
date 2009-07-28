
KISSY.Editor.add("core~dom", function(E) {

    E.Dom = {
        getText: (document.documentElement.textContent !== undefined) ?
            function(el) {
                return el ? (el.textContent || '') : '';
             } : function(el) {
                 return el ? (el.innerText || '') : '';
             }
    };

});
