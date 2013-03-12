config({
    "dom": {
        "alias": ['dom/base', UA.ie < 9 ? 'dom/ie' : '', Features.isClassListSupported() ? '' : 'dom/class-list']
    }
});