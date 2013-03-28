config({
    "dom": {
        "alias": ['dom/base',
            UA.ie < 9 ? 'dom/ie' : '',
            UA.ie < 9 ? 'dom/selector' : '',
            Features.isClassListSupported() ? '' : 'dom/class-list'
        ]
    }
});