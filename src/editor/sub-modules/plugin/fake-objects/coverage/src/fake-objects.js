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
if (! _$jscoverage['/fake-objects.js']) {
  _$jscoverage['/fake-objects.js'] = {};
  _$jscoverage['/fake-objects.js'].lineData = [];
  _$jscoverage['/fake-objects.js'].lineData[5] = 0;
  _$jscoverage['/fake-objects.js'].lineData[6] = 0;
  _$jscoverage['/fake-objects.js'].lineData[11] = 0;
  _$jscoverage['/fake-objects.js'].lineData[14] = 0;
  _$jscoverage['/fake-objects.js'].lineData[15] = 0;
  _$jscoverage['/fake-objects.js'].lineData[16] = 0;
  _$jscoverage['/fake-objects.js'].lineData[18] = 0;
  _$jscoverage['/fake-objects.js'].lineData[19] = 0;
  _$jscoverage['/fake-objects.js'].lineData[21] = 0;
  _$jscoverage['/fake-objects.js'].lineData[32] = 0;
  _$jscoverage['/fake-objects.js'].lineData[33] = 0;
  _$jscoverage['/fake-objects.js'].lineData[34] = 0;
  _$jscoverage['/fake-objects.js'].lineData[35] = 0;
  _$jscoverage['/fake-objects.js'].lineData[38] = 0;
  _$jscoverage['/fake-objects.js'].lineData[39] = 0;
  _$jscoverage['/fake-objects.js'].lineData[41] = 0;
  _$jscoverage['/fake-objects.js'].lineData[42] = 0;
  _$jscoverage['/fake-objects.js'].lineData[43] = 0;
  _$jscoverage['/fake-objects.js'].lineData[47] = 0;
  _$jscoverage['/fake-objects.js'].lineData[48] = 0;
  _$jscoverage['/fake-objects.js'].lineData[51] = 0;
  _$jscoverage['/fake-objects.js'].lineData[53] = 0;
  _$jscoverage['/fake-objects.js'].lineData[54] = 0;
  _$jscoverage['/fake-objects.js'].lineData[56] = 0;
  _$jscoverage['/fake-objects.js'].lineData[60] = 0;
  _$jscoverage['/fake-objects.js'].lineData[67] = 0;
  _$jscoverage['/fake-objects.js'].lineData[69] = 0;
  _$jscoverage['/fake-objects.js'].lineData[71] = 0;
  _$jscoverage['/fake-objects.js'].lineData[72] = 0;
  _$jscoverage['/fake-objects.js'].lineData[75] = 0;
  _$jscoverage['/fake-objects.js'].lineData[79] = 0;
  _$jscoverage['/fake-objects.js'].lineData[80] = 0;
  _$jscoverage['/fake-objects.js'].lineData[81] = 0;
  _$jscoverage['/fake-objects.js'].lineData[83] = 0;
  _$jscoverage['/fake-objects.js'].lineData[87] = 0;
  _$jscoverage['/fake-objects.js'].lineData[89] = 0;
  _$jscoverage['/fake-objects.js'].lineData[91] = 0;
  _$jscoverage['/fake-objects.js'].lineData[92] = 0;
  _$jscoverage['/fake-objects.js'].lineData[94] = 0;
  _$jscoverage['/fake-objects.js'].lineData[95] = 0;
  _$jscoverage['/fake-objects.js'].lineData[98] = 0;
  _$jscoverage['/fake-objects.js'].lineData[105] = 0;
  _$jscoverage['/fake-objects.js'].lineData[107] = 0;
  _$jscoverage['/fake-objects.js'].lineData[110] = 0;
  _$jscoverage['/fake-objects.js'].lineData[111] = 0;
  _$jscoverage['/fake-objects.js'].lineData[114] = 0;
  _$jscoverage['/fake-objects.js'].lineData[115] = 0;
  _$jscoverage['/fake-objects.js'].lineData[118] = 0;
  _$jscoverage['/fake-objects.js'].lineData[121] = 0;
  _$jscoverage['/fake-objects.js'].lineData[122] = 0;
  _$jscoverage['/fake-objects.js'].lineData[125] = 0;
  _$jscoverage['/fake-objects.js'].lineData[127] = 0;
  _$jscoverage['/fake-objects.js'].lineData[128] = 0;
  _$jscoverage['/fake-objects.js'].lineData[130] = 0;
  _$jscoverage['/fake-objects.js'].lineData[141] = 0;
  _$jscoverage['/fake-objects.js'].lineData[142] = 0;
  _$jscoverage['/fake-objects.js'].lineData[143] = 0;
  _$jscoverage['/fake-objects.js'].lineData[144] = 0;
  _$jscoverage['/fake-objects.js'].lineData[146] = 0;
  _$jscoverage['/fake-objects.js'].lineData[147] = 0;
  _$jscoverage['/fake-objects.js'].lineData[150] = 0;
  _$jscoverage['/fake-objects.js'].lineData[160] = 0;
  _$jscoverage['/fake-objects.js'].lineData[161] = 0;
  _$jscoverage['/fake-objects.js'].lineData[162] = 0;
  _$jscoverage['/fake-objects.js'].lineData[163] = 0;
  _$jscoverage['/fake-objects.js'].lineData[166] = 0;
  _$jscoverage['/fake-objects.js'].lineData[167] = 0;
  _$jscoverage['/fake-objects.js'].lineData[169] = 0;
  _$jscoverage['/fake-objects.js'].lineData[170] = 0;
  _$jscoverage['/fake-objects.js'].lineData[172] = 0;
}
if (! _$jscoverage['/fake-objects.js'].functionData) {
  _$jscoverage['/fake-objects.js'].functionData = [];
  _$jscoverage['/fake-objects.js'].functionData[0] = 0;
  _$jscoverage['/fake-objects.js'].functionData[1] = 0;
  _$jscoverage['/fake-objects.js'].functionData[2] = 0;
  _$jscoverage['/fake-objects.js'].functionData[3] = 0;
  _$jscoverage['/fake-objects.js'].functionData[4] = 0;
  _$jscoverage['/fake-objects.js'].functionData[5] = 0;
  _$jscoverage['/fake-objects.js'].functionData[6] = 0;
}
if (! _$jscoverage['/fake-objects.js'].branchData) {
  _$jscoverage['/fake-objects.js'].branchData = {};
  _$jscoverage['/fake-objects.js'].branchData['14'] = [];
  _$jscoverage['/fake-objects.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['15'] = [];
  _$jscoverage['/fake-objects.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['18'] = [];
  _$jscoverage['/fake-objects.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['27'] = [];
  _$jscoverage['/fake-objects.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['32'] = [];
  _$jscoverage['/fake-objects.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['38'] = [];
  _$jscoverage['/fake-objects.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['41'] = [];
  _$jscoverage['/fake-objects.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['47'] = [];
  _$jscoverage['/fake-objects.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['71'] = [];
  _$jscoverage['/fake-objects.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['75'] = [];
  _$jscoverage['/fake-objects.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['79'] = [];
  _$jscoverage['/fake-objects.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['81'] = [];
  _$jscoverage['/fake-objects.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['84'] = [];
  _$jscoverage['/fake-objects.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['89'] = [];
  _$jscoverage['/fake-objects.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['91'] = [];
  _$jscoverage['/fake-objects.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['94'] = [];
  _$jscoverage['/fake-objects.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['108'] = [];
  _$jscoverage['/fake-objects.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['110'] = [];
  _$jscoverage['/fake-objects.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['114'] = [];
  _$jscoverage['/fake-objects.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['121'] = [];
  _$jscoverage['/fake-objects.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['142'] = [];
  _$jscoverage['/fake-objects.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['143'] = [];
  _$jscoverage['/fake-objects.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['146'] = [];
  _$jscoverage['/fake-objects.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['157'] = [];
  _$jscoverage['/fake-objects.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['160'] = [];
  _$jscoverage['/fake-objects.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['166'] = [];
  _$jscoverage['/fake-objects.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['169'] = [];
  _$jscoverage['/fake-objects.js'].branchData['169'][1] = new BranchData();
}
_$jscoverage['/fake-objects.js'].branchData['169'][1].init(1472, 11, 'isResizable');
function visit27_169_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['166'][1].init(1328, 15, 'realElementType');
function visit26_166_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['160'][1].init(1120, 5, 'attrs');
function visit25_160_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['157'][1].init(342, 39, 'realElement.getAttribute("align") || \'\'');
function visit24_157_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['146'][1].init(347, 34, 'realElement.getAttribute("height")');
function visit23_146_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['143'][1].init(167, 33, 'realElement.getAttribute("width")');
function visit22_143_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['142'][1].init(101, 39, 'realElement.getAttribute("style") || \'\'');
function visit21_142_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['121'][1].init(26, 67, 'fakeElement.attr(\'_ke_real_node_type\') != Dom.NodeType.ELEMENT_NODE');
function visit20_121_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['114'][1].init(252, 10, 'htmlFilter');
function visit19_114_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['110'][1].init(152, 37, 'dataProcessor.createFakeParserElement');
function visit18_110_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['108'][1].init(75, 41, 'dataProcessor && dataProcessor.htmlFilter');
function visit17_108_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['94'][1].init(557, 6, 'height');
function visit16_94_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['91'][1].init(421, 5, 'width');
function visit15_91_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['89'][1].init(371, 17, 'match && match[1]');
function visit14_89_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['84'][1].init(90, 17, 'match && match[1]');
function visit13_84_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['81'][1].init(90, 5, 'style');
function visit12_81_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['79'][1].init(480, 11, 'realElement');
function visit11_79_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['75'][1].init(292, 44, 'realFragment && realFragment.childNodes[0]');
function visit10_75_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['71'][1].init(134, 8, 'realHTML');
function visit9_71_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['47'][1].init(18, 67, 'fakeElement.attr(\'_ke_real_node_type\') != Dom.NodeType.ELEMENT_NODE');
function visit8_47_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['41'][1].init(1125, 11, 'isResizable');
function visit7_41_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['38'][1].init(1020, 15, 'realElementType');
function visit6_38_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['32'][1].init(852, 5, 'attrs');
function visit5_32_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['27'][1].init(156, 36, 'outerHTML || realElement.outerHtml()');
function visit4_27_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['18'][1].init(216, 26, 'realElement.attr("height")');
function visit3_18_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['15'][1].init(76, 25, 'realElement.attr("width")');
function visit2_15_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['14'][1].init(26, 31, 'realElement.attr("style") || \'\'');
function visit1_14_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].lineData[5]++;
KISSY.add("editor/plugin/fake-objects", function(S, Editor, HtmlParser) {
  _$jscoverage['/fake-objects.js'].functionData[0]++;
  _$jscoverage['/fake-objects.js'].lineData[6]++;
  var Node = S.Node, Dom = S.DOM, Utils = Editor.Utils, SPACER_GIF = Utils.debugUrl('theme/spacer.gif');
  _$jscoverage['/fake-objects.js'].lineData[11]++;
  Editor.addMembers({
  createFakeElement: function(realElement, className, realElementType, isResizable, outerHTML, attrs) {
  _$jscoverage['/fake-objects.js'].functionData[1]++;
  _$jscoverage['/fake-objects.js'].lineData[14]++;
  var style = visit1_14_1(realElement.attr("style") || '');
  _$jscoverage['/fake-objects.js'].lineData[15]++;
  if (visit2_15_1(realElement.attr("width"))) {
    _$jscoverage['/fake-objects.js'].lineData[16]++;
    style = "width:" + realElement.attr("width") + "px;" + style;
  }
  _$jscoverage['/fake-objects.js'].lineData[18]++;
  if (visit3_18_1(realElement.attr("height"))) {
    _$jscoverage['/fake-objects.js'].lineData[19]++;
    style = "height:" + realElement.attr("height") + "px;" + style;
  }
  _$jscoverage['/fake-objects.js'].lineData[21]++;
  var self = this, existClass = S.trim(realElement.attr('class')), attributes = {
  'class': className + " " + existClass, 
  src: SPACER_GIF, 
  _ke_realelement: encodeURIComponent(visit4_27_1(outerHTML || realElement.outerHtml())), 
  _ke_real_node_type: realElement[0].nodeType, 
  style: style};
  _$jscoverage['/fake-objects.js'].lineData[32]++;
  if (visit5_32_1(attrs)) {
    _$jscoverage['/fake-objects.js'].lineData[33]++;
    delete attrs.width;
    _$jscoverage['/fake-objects.js'].lineData[34]++;
    delete attrs.height;
    _$jscoverage['/fake-objects.js'].lineData[35]++;
    S.mix(attributes, attrs, false);
  }
  _$jscoverage['/fake-objects.js'].lineData[38]++;
  if (visit6_38_1(realElementType)) {
    _$jscoverage['/fake-objects.js'].lineData[39]++;
    attributes._ke_real_element_type = realElementType;
  }
  _$jscoverage['/fake-objects.js'].lineData[41]++;
  if (visit7_41_1(isResizable)) {
    _$jscoverage['/fake-objects.js'].lineData[42]++;
    attributes._ke_resizable = isResizable;
  }
  _$jscoverage['/fake-objects.js'].lineData[43]++;
  return new Node("<img/>", attributes, self.get("document")[0]);
}, 
  restoreRealElement: function(fakeElement) {
  _$jscoverage['/fake-objects.js'].functionData[2]++;
  _$jscoverage['/fake-objects.js'].lineData[47]++;
  if (visit8_47_1(fakeElement.attr('_ke_real_node_type') != Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/fake-objects.js'].lineData[48]++;
    return null;
  }
  _$jscoverage['/fake-objects.js'].lineData[51]++;
  var html = (S.urlDecode(fakeElement.attr('_ke_realelement')));
  _$jscoverage['/fake-objects.js'].lineData[53]++;
  var temp = new Node('<div>', null, this.get("document")[0]);
  _$jscoverage['/fake-objects.js'].lineData[54]++;
  temp.html(html);
  _$jscoverage['/fake-objects.js'].lineData[56]++;
  return temp.first().remove();
}});
  _$jscoverage['/fake-objects.js'].lineData[60]++;
  var htmlFilterRules = {
  tags: {
  $: function(element) {
  _$jscoverage['/fake-objects.js'].functionData[3]++;
  _$jscoverage['/fake-objects.js'].lineData[67]++;
  var realHTML = element.getAttribute("_ke_realelement");
  _$jscoverage['/fake-objects.js'].lineData[69]++;
  var realFragment;
  _$jscoverage['/fake-objects.js'].lineData[71]++;
  if (visit9_71_1(realHTML)) {
    _$jscoverage['/fake-objects.js'].lineData[72]++;
    realFragment = new HtmlParser.Parser(S.urlDecode(realHTML)).parse();
  }
  _$jscoverage['/fake-objects.js'].lineData[75]++;
  var realElement = visit10_75_1(realFragment && realFragment.childNodes[0]);
  _$jscoverage['/fake-objects.js'].lineData[79]++;
  if (visit11_79_1(realElement)) {
    _$jscoverage['/fake-objects.js'].lineData[80]++;
    var style = element.getAttribute("style");
    _$jscoverage['/fake-objects.js'].lineData[81]++;
    if (visit12_81_1(style)) {
      _$jscoverage['/fake-objects.js'].lineData[83]++;
      var match = /(?:^|\s)width\s*:\s*(\d+)/i.exec(style), width = visit13_84_1(match && match[1]);
      _$jscoverage['/fake-objects.js'].lineData[87]++;
      match = /(?:^|\s)height\s*:\s*(\d+)/i.exec(style);
      _$jscoverage['/fake-objects.js'].lineData[89]++;
      var height = visit14_89_1(match && match[1]);
      _$jscoverage['/fake-objects.js'].lineData[91]++;
      if (visit15_91_1(width)) {
        _$jscoverage['/fake-objects.js'].lineData[92]++;
        realElement.setAttribute("width", width);
      }
      _$jscoverage['/fake-objects.js'].lineData[94]++;
      if (visit16_94_1(height)) {
        _$jscoverage['/fake-objects.js'].lineData[95]++;
        realElement.setAttribute("height", height);
      }
    }
    _$jscoverage['/fake-objects.js'].lineData[98]++;
    return realElement;
  }
}}};
  _$jscoverage['/fake-objects.js'].lineData[105]++;
  return {
  init: function(editor) {
  _$jscoverage['/fake-objects.js'].functionData[4]++;
  _$jscoverage['/fake-objects.js'].lineData[107]++;
  var dataProcessor = editor.htmlDataProcessor, htmlFilter = visit17_108_1(dataProcessor && dataProcessor.htmlFilter);
  _$jscoverage['/fake-objects.js'].lineData[110]++;
  if (visit18_110_1(dataProcessor.createFakeParserElement)) {
    _$jscoverage['/fake-objects.js'].lineData[111]++;
    return;
  }
  _$jscoverage['/fake-objects.js'].lineData[114]++;
  if (visit19_114_1(htmlFilter)) {
    _$jscoverage['/fake-objects.js'].lineData[115]++;
    htmlFilter.addRules(htmlFilterRules);
  }
  _$jscoverage['/fake-objects.js'].lineData[118]++;
  S.mix(dataProcessor, {
  restoreRealElement: function(fakeElement) {
  _$jscoverage['/fake-objects.js'].functionData[5]++;
  _$jscoverage['/fake-objects.js'].lineData[121]++;
  if (visit20_121_1(fakeElement.attr('_ke_real_node_type') != Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/fake-objects.js'].lineData[122]++;
    return null;
  }
  _$jscoverage['/fake-objects.js'].lineData[125]++;
  var html = (S.urlDecode(fakeElement.attr('_ke_realelement')));
  _$jscoverage['/fake-objects.js'].lineData[127]++;
  var temp = new Node('<div>', null, editor.get("document")[0]);
  _$jscoverage['/fake-objects.js'].lineData[128]++;
  temp.html(html);
  _$jscoverage['/fake-objects.js'].lineData[130]++;
  return temp.first().remove();
}, 
  createFakeParserElement: function(realElement, className, realElementType, isResizable, attrs) {
  _$jscoverage['/fake-objects.js'].functionData[6]++;
  _$jscoverage['/fake-objects.js'].lineData[141]++;
  var html = HtmlParser.serialize(realElement);
  _$jscoverage['/fake-objects.js'].lineData[142]++;
  var style = visit21_142_1(realElement.getAttribute("style") || '');
  _$jscoverage['/fake-objects.js'].lineData[143]++;
  if (visit22_143_1(realElement.getAttribute("width"))) {
    _$jscoverage['/fake-objects.js'].lineData[144]++;
    style = "width:" + realElement.getAttribute("width") + "px;" + style;
  }
  _$jscoverage['/fake-objects.js'].lineData[146]++;
  if (visit23_146_1(realElement.getAttribute("height"))) {
    _$jscoverage['/fake-objects.js'].lineData[147]++;
    style = "height:" + realElement.getAttribute("height") + "px;" + style;
  }
  _$jscoverage['/fake-objects.js'].lineData[150]++;
  var existClass = S.trim(realElement.getAttribute("class")), attributes = {
  'class': className + " " + existClass, 
  src: SPACER_GIF, 
  _ke_realelement: encodeURIComponent(html), 
  _ke_real_node_type: realElement.nodeType + "", 
  style: style, 
  align: visit24_157_1(realElement.getAttribute("align") || '')};
  _$jscoverage['/fake-objects.js'].lineData[160]++;
  if (visit25_160_1(attrs)) {
    _$jscoverage['/fake-objects.js'].lineData[161]++;
    delete attrs.width;
    _$jscoverage['/fake-objects.js'].lineData[162]++;
    delete attrs.height;
    _$jscoverage['/fake-objects.js'].lineData[163]++;
    S.mix(attributes, attrs, false);
  }
  _$jscoverage['/fake-objects.js'].lineData[166]++;
  if (visit26_166_1(realElementType)) {
    _$jscoverage['/fake-objects.js'].lineData[167]++;
    attributes._ke_real_element_type = realElementType;
  }
  _$jscoverage['/fake-objects.js'].lineData[169]++;
  if (visit27_169_1(isResizable)) {
    _$jscoverage['/fake-objects.js'].lineData[170]++;
    attributes._ke_resizable = "_ke_resizable";
  }
  _$jscoverage['/fake-objects.js'].lineData[172]++;
  return new HtmlParser.Tag('img', attributes);
}});
}};
}, {
  requires: ["editor", 'html-parser']});
