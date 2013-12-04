function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/dialog/dialog-tpl.js']) {
  _$jscoverage['/dialog/dialog-tpl.js'] = {};
  _$jscoverage['/dialog/dialog-tpl.js'].lineData = [];
  _$jscoverage['/dialog/dialog-tpl.js'].lineData[3] = 0;
}
if (! _$jscoverage['/dialog/dialog-tpl.js'].functionData) {
  _$jscoverage['/dialog/dialog-tpl.js'].functionData = [];
}
if (! _$jscoverage['/dialog/dialog-tpl.js'].branchData) {
  _$jscoverage['/dialog/dialog-tpl.js'].branchData = {};
}
_$jscoverage['/dialog/dialog-tpl.js'].lineData[3]++;
KISSY.add('<div class=\'{prefixCls}img-tabs\'>\n    <div class=\'{prefixCls}img-tabs-bar ks-clear\'>\n        <div\n                class=\'{prefixCls}img-tabs-tab-selected {prefixCls}img-tabs-tab\'\n\n                hidefocus=\'hidefocus\'>\n            \u7f51\u7edc\u56fe\u7247\n        </div>\n        <div\n                class=\'{prefixCls}img-tabs-tab\'\n                hidefocus=\'hide\n    focus\'>\n            \u672c\u5730\u4e0a\u4f20\n        </div>\n    </div>\n    <div class=\'{prefixCls}img-tabs-body\'>\n        <div class=\'{prefixCls}img-tabs-panel {prefixCls}img-tabs-panel-selected\'>\n            <label>\n        <span class=\'{prefixCls}image-title\'>\n        \u56fe\u7247\u5730\u5740\uff1a\n        </span>\n                <input\n                        data-verify=\'^(https?:/)?/[^\\s]\'\n                        data-warning=\'\u7f51\u5740\u683c\u5f0f\u4e3a\uff1ahttp:// \u6216 /\'\n                        class=\'{prefixCls}img-url {prefixCls}input\'\n                        style=\'width:390px;vertical-align:middle;\'\n                        />\n            </label>\n        </div>\n        <div class=\'{prefixCls}img-tabs-panel\'>\n            <form class=\'{prefixCls}img-upload-form\' enctype=\'multipart/form-data\'>\n                <p style=\'zoom:1;\'>\n                    <input class=\'{prefixCls}input {prefixCls}img-local-url\'\n                           readonly=\'readonly\'\n                           style=\'margin-right: 15px;\n            vertical-align: middle;\n            width: 368px;\n            color:#969696;\'/>\n                    <a\n                            style=\'padding:3px 11px;\n            position:absolute;\n            left:390px;\n            top:0;\n            z-index:1;\'\n                            class=\'{prefixCls}image-up {prefixCls}button ks-inline-block\'>\u6d4f\u89c8...</a>\n                </p>\n\n                <div class=\'{prefixCls}img-up-extraHTML\'>\n                </div>\n            </form>\n        </div>\n    </div>\n</div>\n<div style=\'\n            padding:0 20px 5px 20px;\'>\n    <table\n            style=\'width:100%;margin-top:8px;\'\n            class=\'{prefixCls}img-setting\'>\n        <tr>\n            <td>\n                <label>\n                    \u5bbd\u5ea6\uff1a\n                </label>\n                <input\n                        data-verify=\'^(\u81ea\u52a8|((?!0$)\\d+))?$\'\n                        data-warning=\'\u5bbd\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570\'\n                        class=\'{prefixCls}img-width {prefixCls}input\'\n                        style=\'vertical-align:middle;width:60px\'\n                        /> \u50cf\u7d20\n\n            </td>\n            <td>\n                <label>\n                    \u9ad8\u5ea6\uff1a\n                    <label>\n                        <input\n                                data-verify=\'^(\u81ea\u52a8|((?!0$)\\d+))?$\'\n                                data-warning=\'\u9ad8\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570\'\n                                class=\'{prefixCls}img-height {prefixCls}input\'\n                                style=\'vertical-align:middle;width:60px\'\n                                /> \u50cf\u7d20 </label>\n\n                    <input\n                            type=\'checkbox\'\n                            class=\'{prefixCls}img-ratio\'\n                            style=\'vertical-align:middle;margin-left:5px;\'\n                            checked=\'checked\'/>\n                    \u9501\u5b9a\u9ad8\u5bbd\u6bd4\n                </label>\n            </td>\n        </tr>\n        <tr>\n            <td>\n                <label>\n                    \u5bf9\u9f50\uff1a\n                </label>\n                <select class=\'{prefixCls}img-align\' title=\'\u5bf9\u9f50\'>\n                    <option value=\'none\'>\u65e0</option>\n                    <option value=\'left\'>\u5de6\u5bf9\u9f50</option>\n                    <option value=\'right\'>\u53f3\u5bf9\u9f50</option>\n                </select>\n\n            </td>\n            <td><label>\n                \u95f4\u8ddd\uff1a\n            </label>\n                <input\n                        data-verify=\'^\\d+$\'\n                        data-warning=\'\u95f4\u8ddd\u8bf7\u8f93\u5165\u975e\u8d1f\u6574\u6570\'\n                        class=\'{prefixCls}img-margin {prefixCls}input\'\n                        style=\'width:60px\'/> \u50cf\u7d20\n\n            </td>\n        </tr>\n        <tr>\n            <td colspan=\'2\' style=\'padding-top: 6px\'>\n                <label>\n                    \u94fe\u63a5\u7f51\u5740\uff1a\n                </label>\n                <input\n                        class=\'{prefixCls}img-link {prefixCls}input\'\n                        style=\'width:235px;vertical-align:middle;\'\n                        data-verify=\'^(?:(?:\\s*)|(?:https?://[^\\s]+)|(?:#.+))$\'\n                        data-warning=\'\u8bf7\u8f93\u5165\u5408\u9002\u7684\u7f51\u5740\u683c\u5f0f\'\n                        />\n\n                <label>\n                    <input\n                            class=\'{prefixCls}img-link-blank\'\n                            style=\'vertical-align:middle;\n                margin-left:5px;\'\n                            type=\'checkbox\'/>\n                    &nbsp; \u5728\u65b0\u7a97\u53e3\u6253\u5f00\u94fe\u63a5\n                </label>\n            </td>\n        </tr>\n    </table>\n</div>\n');
