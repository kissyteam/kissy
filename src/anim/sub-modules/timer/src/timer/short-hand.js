/**
 * short-hand css properties
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add(function () {
    // shorthand css properties
    return {
        // http://www.w3.org/Style/CSS/Tracker/issues/9
        // http://snook.ca/archives/html_and_css/background-position-x-y
        // backgroundPositionX  backgroundPositionY does not support
        background: [],

        border: [
            'borderBottomWidth',
            'borderLeftWidth',
            'borderRightWidth',
            // 'borderSpacing', 组合属性？
            'borderTopWidth'
        ],

        'borderBottom': ['borderBottomWidth'],

        'borderLeft': ['borderLeftWidth'],

        borderTop: ['borderTopWidth'],

        borderRight: ['borderRightWidth'],

        font: [
            'fontSize',
            'fontWeight'
        ],

        margin: [
            'marginBottom',
            'marginLeft',
            'marginRight',
            'marginTop'
        ],

        padding: [
            'paddingBottom',
            'paddingLeft',
            'paddingRight',
            'paddingTop'
        ]
    };
});