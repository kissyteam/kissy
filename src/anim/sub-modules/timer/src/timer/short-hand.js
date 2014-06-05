/**
 * short-hand css properties
 * @author yiminghe@gmail.com
 * @ignore
 */
// shorthand css properties
module.exports = {
    // http://www.w3.org/Style/CSS/Tracker/issues/9
    // http://snook.ca/archives/html_and_css/background-position-x-y
    // backgroundPositionX  backgroundPositionY does not support
    background: ['backgroundColor'],

    border: [
        'borderBottomWidth',
        'borderLeftWidth',
        'borderRightWidth',
        // 'borderSpacing', 组合属性？
        'borderTopWidth',
        'borderBottomColor',
        'borderLeftColor',
        'borderRightColor',
        'borderTopColor'
    ],

    borderColor: [
        'borderBottomColor',
        'borderLeftColor',
        'borderRightColor',
        'borderTopColor'
    ],

    borderBottom: ['borderBottomWidth', 'borderBottomColor'],

    borderLeft: ['borderLeftWidth', 'borderLeftColor'],

    borderTop: ['borderTopWidth', 'borderTopColor'],

    borderRight: ['borderRightWidth', 'borderRightColor'],

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
