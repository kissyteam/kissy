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
  _$jscoverage['/fake-objects.js'].lineData[6] = 0;
  _$jscoverage['/fake-objects.js'].lineData[7] = 0;
  _$jscoverage['/fake-objects.js'].lineData[12] = 0;
  _$jscoverage['/fake-objects.js'].lineData[15] = 0;
  _$jscoverage['/fake-objects.js'].lineData[16] = 0;
  _$jscoverage['/fake-objects.js'].lineData[17] = 0;
  _$jscoverage['/fake-objects.js'].lineData[19] = 0;
  _$jscoverage['/fake-objects.js'].lineData[20] = 0;
  _$jscoverage['/fake-objects.js'].lineData[22] = 0;
  _$jscoverage['/fake-objects.js'].lineData[33] = 0;
  _$jscoverage['/fake-objects.js'].lineData[34] = 0;
  _$jscoverage['/fake-objects.js'].lineData[35] = 0;
  _$jscoverage['/fake-objects.js'].lineData[36] = 0;
  _$jscoverage['/fake-objects.js'].lineData[39] = 0;
  _$jscoverage['/fake-objects.js'].lineData[40] = 0;
  _$jscoverage['/fake-objects.js'].lineData[42] = 0;
  _$jscoverage['/fake-objects.js'].lineData[43] = 0;
  _$jscoverage['/fake-objects.js'].lineData[44] = 0;
  _$jscoverage['/fake-objects.js'].lineData[48] = 0;
  _$jscoverage['/fake-objects.js'].lineData[49] = 0;
  _$jscoverage['/fake-objects.js'].lineData[52] = 0;
  _$jscoverage['/fake-objects.js'].lineData[54] = 0;
  _$jscoverage['/fake-objects.js'].lineData[55] = 0;
  _$jscoverage['/fake-objects.js'].lineData[57] = 0;
  _$jscoverage['/fake-objects.js'].lineData[61] = 0;
  _$jscoverage['/fake-objects.js'].lineData[65] = 0;
  _$jscoverage['/fake-objects.js'].lineData[67] = 0;
  _$jscoverage['/fake-objects.js'].lineData[69] = 0;
  _$jscoverage['/fake-objects.js'].lineData[70] = 0;
  _$jscoverage['/fake-objects.js'].lineData[73] = 0;
  _$jscoverage['/fake-objects.js'].lineData[77] = 0;
  _$jscoverage['/fake-objects.js'].lineData[78] = 0;
  _$jscoverage['/fake-objects.js'].lineData[79] = 0;
  _$jscoverage['/fake-objects.js'].lineData[81] = 0;
  _$jscoverage['/fake-objects.js'].lineData[85] = 0;
  _$jscoverage['/fake-objects.js'].lineData[87] = 0;
  _$jscoverage['/fake-objects.js'].lineData[89] = 0;
  _$jscoverage['/fake-objects.js'].lineData[90] = 0;
  _$jscoverage['/fake-objects.js'].lineData[92] = 0;
  _$jscoverage['/fake-objects.js'].lineData[93] = 0;
  _$jscoverage['/fake-objects.js'].lineData[96] = 0;
  _$jscoverage['/fake-objects.js'].lineData[103] = 0;
  _$jscoverage['/fake-objects.js'].lineData[105] = 0;
  _$jscoverage['/fake-objects.js'].lineData[108] = 0;
  _$jscoverage['/fake-objects.js'].lineData[109] = 0;
  _$jscoverage['/fake-objects.js'].lineData[112] = 0;
  _$jscoverage['/fake-objects.js'].lineData[113] = 0;
  _$jscoverage['/fake-objects.js'].lineData[116] = 0;
  _$jscoverage['/fake-objects.js'].lineData[118] = 0;
  _$jscoverage['/fake-objects.js'].lineData[119] = 0;
  _$jscoverage['/fake-objects.js'].lineData[122] = 0;
  _$jscoverage['/fake-objects.js'].lineData[124] = 0;
  _$jscoverage['/fake-objects.js'].lineData[125] = 0;
  _$jscoverage['/fake-objects.js'].lineData[127] = 0;
  _$jscoverage['/fake-objects.js'].lineData[133] = 0;
  _$jscoverage['/fake-objects.js'].lineData[134] = 0;
  _$jscoverage['/fake-objects.js'].lineData[135] = 0;
  _$jscoverage['/fake-objects.js'].lineData[136] = 0;
  _$jscoverage['/fake-objects.js'].lineData[138] = 0;
  _$jscoverage['/fake-objects.js'].lineData[139] = 0;
  _$jscoverage['/fake-objects.js'].lineData[142] = 0;
  _$jscoverage['/fake-objects.js'].lineData[152] = 0;
  _$jscoverage['/fake-objects.js'].lineData[153] = 0;
  _$jscoverage['/fake-objects.js'].lineData[154] = 0;
  _$jscoverage['/fake-objects.js'].lineData[155] = 0;
  _$jscoverage['/fake-objects.js'].lineData[158] = 0;
  _$jscoverage['/fake-objects.js'].lineData[159] = 0;
  _$jscoverage['/fake-objects.js'].lineData[161] = 0;
  _$jscoverage['/fake-objects.js'].lineData[162] = 0;
  _$jscoverage['/fake-objects.js'].lineData[164] = 0;
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
  _$jscoverage['/fake-objects.js'].branchData['15'] = [];
  _$jscoverage['/fake-objects.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['16'] = [];
  _$jscoverage['/fake-objects.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['19'] = [];
  _$jscoverage['/fake-objects.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['28'] = [];
  _$jscoverage['/fake-objects.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['33'] = [];
  _$jscoverage['/fake-objects.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['39'] = [];
  _$jscoverage['/fake-objects.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['42'] = [];
  _$jscoverage['/fake-objects.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['48'] = [];
  _$jscoverage['/fake-objects.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['69'] = [];
  _$jscoverage['/fake-objects.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['73'] = [];
  _$jscoverage['/fake-objects.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['77'] = [];
  _$jscoverage['/fake-objects.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['79'] = [];
  _$jscoverage['/fake-objects.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['82'] = [];
  _$jscoverage['/fake-objects.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['87'] = [];
  _$jscoverage['/fake-objects.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['89'] = [];
  _$jscoverage['/fake-objects.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['92'] = [];
  _$jscoverage['/fake-objects.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['106'] = [];
  _$jscoverage['/fake-objects.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['108'] = [];
  _$jscoverage['/fake-objects.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['112'] = [];
  _$jscoverage['/fake-objects.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['118'] = [];
  _$jscoverage['/fake-objects.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['134'] = [];
  _$jscoverage['/fake-objects.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['135'] = [];
  _$jscoverage['/fake-objects.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['138'] = [];
  _$jscoverage['/fake-objects.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['149'] = [];
  _$jscoverage['/fake-objects.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['152'] = [];
  _$jscoverage['/fake-objects.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['158'] = [];
  _$jscoverage['/fake-objects.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['161'] = [];
  _$jscoverage['/fake-objects.js'].branchData['161'][1] = new BranchData();
}
_$jscoverage['/fake-objects.js'].branchData['161'][1].init(1472, 11, 'isResizable');
function visit27_161_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['158'][1].init(1328, 15, 'realElementType');
function visit26_158_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['152'][1].init(1120, 5, 'attrs');
function visit25_152_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['149'][1].init(342, 39, 'realElement.getAttribute("align") || \'\'');
function visit24_149_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['138'][1].init(347, 34, 'realElement.getAttribute("height")');
function visit23_138_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['135'][1].init(167, 33, 'realElement.getAttribute("width")');
function visit22_135_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['134'][1].init(101, 39, 'realElement.getAttribute("style") || \'\'');
function visit21_134_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['118'][1].init(26, 67, 'fakeElement.attr(\'_ke_real_node_type\') != Dom.NodeType.ELEMENT_NODE');
function visit20_118_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['112'][1].init(252, 10, 'htmlFilter');
function visit19_112_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['108'][1].init(152, 37, 'dataProcessor.createFakeParserElement');
function visit18_108_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['106'][1].init(75, 41, 'dataProcessor && dataProcessor.htmlFilter');
function visit17_106_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['92'][1].init(557, 6, 'height');
function visit16_92_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['89'][1].init(421, 5, 'width');
function visit15_89_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['87'][1].init(371, 17, 'match && match[1]');
function visit14_87_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['82'][1].init(90, 17, 'match && match[1]');
function visit13_82_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['79'][1].init(90, 5, 'style');
function visit12_79_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['77'][1].init(480, 11, 'realElement');
function visit11_77_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['73'][1].init(292, 44, 'realFragment && realFragment.childNodes[0]');
function visit10_73_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['69'][1].init(134, 8, 'realHTML');
function visit9_69_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['48'][1].init(18, 67, 'fakeElement.attr(\'_ke_real_node_type\') != Dom.NodeType.ELEMENT_NODE');
function visit8_48_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['42'][1].init(1125, 11, 'isResizable');
function visit7_42_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['39'][1].init(1020, 15, 'realElementType');
function visit6_39_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['33'][1].init(852, 5, 'attrs');
function visit5_33_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['28'][1].init(156, 36, 'outerHTML || realElement.outerHtml()');
function visit4_28_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['19'][1].init(216, 26, 'realElement.attr("height")');
function visit3_19_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['16'][1].init(76, 25, 'realElement.attr("width")');
function visit2_16_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['15'][1].init(26, 31, 'realElement.attr("style") || \'\'');
function visit1_15_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].lineData[6]++;
KISSY.add("editor/plugin/fake-objects", function(S, Editor, HtmlParser) {
  _$jscoverage['/fake-objects.js'].functionData[0]++;
  _$jscoverage['/fake-objects.js'].lineData[7]++;
  var Node = S.Node, Dom = S.DOM, Utils = Editor.Utils, SPACER_GIF = Utils.debugUrl('theme/spacer.gif');
  _$jscoverage['/fake-objects.js'].lineData[12]++;
  Editor.addMembers({
  createFakeElement: function(realElement, className, realElementType, isResizable, outerHTML, attrs) {
  _$jscoverage['/fake-objects.js'].functionData[1]++;
  _$jscoverage['/fake-objects.js'].lineData[15]++;
  var style = visit1_15_1(realElement.attr("style") || '');
  _$jscoverage['/fake-objects.js'].lineData[16]++;
  if (visit2_16_1(realElement.attr("width"))) {
    _$jscoverage['/fake-objects.js'].lineData[17]++;
    style = "width:" + realElement.attr("width") + "px;" + style;
  }
  _$jscoverage['/fake-objects.js'].lineData[19]++;
  if (visit3_19_1(realElement.attr("height"))) {
    _$jscoverage['/fake-objects.js'].lineData[20]++;
    style = "height:" + realElement.attr("height") + "px;" + style;
  }
  _$jscoverage['/fake-objects.js'].lineData[22]++;
  var self = this, existClass = S.trim(realElement.attr('class')), attributes = {
  'class': className + " " + existClass, 
  src: SPACER_GIF, 
  _ke_realelement: encodeURIComponent(visit4_28_1(outerHTML || realElement.outerHtml())), 
  _ke_real_node_type: realElement[0].nodeType, 
  style: style};
  _$jscoverage['/fake-objects.js'].lineData[33]++;
  if (visit5_33_1(attrs)) {
    _$jscoverage['/fake-objects.js'].lineData[34]++;
    delete attrs.width;
    _$jscoverage['/fake-objects.js'].lineData[35]++;
    delete attrs.height;
    _$jscoverage['/fake-objects.js'].lineData[36]++;
    S.mix(attributes, attrs, false);
  }
  _$jscoverage['/fake-objects.js'].lineData[39]++;
  if (visit6_39_1(realElementType)) {
    _$jscoverage['/fake-objects.js'].lineData[40]++;
    attributes._ke_real_element_type = realElementType;
  }
  _$jscoverage['/fake-objects.js'].lineData[42]++;
  if (visit7_42_1(isResizable)) {
    _$jscoverage['/fake-objects.js'].lineData[43]++;
    attributes._ke_resizable = isResizable;
  }
  _$jscoverage['/fake-objects.js'].lineData[44]++;
  return new Node("<img/>", attributes, self.get("document")[0]);
}, 
  restoreRealElement: function(fakeElement) {
  _$jscoverage['/fake-objects.js'].functionData[2]++;
  _$jscoverage['/fake-objects.js'].lineData[48]++;
  if (visit8_48_1(fakeElement.attr('_ke_real_node_type') != Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/fake-objects.js'].lineData[49]++;
    return null;
  }
  _$jscoverage['/fake-objects.js'].lineData[52]++;
  var html = (S.urlDecode(fakeElement.attr('_ke_realelement')));
  _$jscoverage['/fake-objects.js'].lineData[54]++;
  var temp = new Node('<div>', null, this.get("document")[0]);
  _$jscoverage['/fake-objects.js'].lineData[55]++;
  temp.html(html);
  _$jscoverage['/fake-objects.js'].lineData[57]++;
  return temp.first().remove();
}});
  _$jscoverage['/fake-objects.js'].lineData[61]++;
  var htmlFilterRules = {
  tags: {
  $: function(element) {
  _$jscoverage['/fake-objects.js'].functionData[3]++;
  _$jscoverage['/fake-objects.js'].lineData[65]++;
  var realHTML = element.getAttribute("_ke_realelement");
  _$jscoverage['/fake-objects.js'].lineData[67]++;
  var realFragment;
  _$jscoverage['/fake-objects.js'].lineData[69]++;
  if (visit9_69_1(realHTML)) {
    _$jscoverage['/fake-objects.js'].lineData[70]++;
    realFragment = new HtmlParser.Parser(S.urlDecode(realHTML)).parse();
  }
  _$jscoverage['/fake-objects.js'].lineData[73]++;
  var realElement = visit10_73_1(realFragment && realFragment.childNodes[0]);
  _$jscoverage['/fake-objects.js'].lineData[77]++;
  if (visit11_77_1(realElement)) {
    _$jscoverage['/fake-objects.js'].lineData[78]++;
    var style = element.getAttribute("style");
    _$jscoverage['/fake-objects.js'].lineData[79]++;
    if (visit12_79_1(style)) {
      _$jscoverage['/fake-objects.js'].lineData[81]++;
      var match = /(?:^|\s)width\s*:\s*(\d+)/i.exec(style), width = visit13_82_1(match && match[1]);
      _$jscoverage['/fake-objects.js'].lineData[85]++;
      match = /(?:^|\s)height\s*:\s*(\d+)/i.exec(style);
      _$jscoverage['/fake-objects.js'].lineData[87]++;
      var height = visit14_87_1(match && match[1]);
      _$jscoverage['/fake-objects.js'].lineData[89]++;
      if (visit15_89_1(width)) {
        _$jscoverage['/fake-objects.js'].lineData[90]++;
        realElement.setAttribute("width", width);
      }
      _$jscoverage['/fake-objects.js'].lineData[92]++;
      if (visit16_92_1(height)) {
        _$jscoverage['/fake-objects.js'].lineData[93]++;
        realElement.setAttribute("height", height);
      }
    }
    _$jscoverage['/fake-objects.js'].lineData[96]++;
    return realElement;
  }
}}};
  _$jscoverage['/fake-objects.js'].lineData[103]++;
  return {
  init: function(editor) {
  _$jscoverage['/fake-objects.js'].functionData[4]++;
  _$jscoverage['/fake-objects.js'].lineData[105]++;
  var dataProcessor = editor.htmlDataProcessor, htmlFilter = visit17_106_1(dataProcessor && dataProcessor.htmlFilter);
  _$jscoverage['/fake-objects.js'].lineData[108]++;
  if (visit18_108_1(dataProcessor.createFakeParserElement)) {
    _$jscoverage['/fake-objects.js'].lineData[109]++;
    return;
  }
  _$jscoverage['/fake-objects.js'].lineData[112]++;
  if (visit19_112_1(htmlFilter)) {
    _$jscoverage['/fake-objects.js'].lineData[113]++;
    htmlFilter.addRules(htmlFilterRules);
  }
  _$jscoverage['/fake-objects.js'].lineData[116]++;
  S.mix(dataProcessor, {
  restoreRealElement: function(fakeElement) {
  _$jscoverage['/fake-objects.js'].functionData[5]++;
  _$jscoverage['/fake-objects.js'].lineData[118]++;
  if (visit20_118_1(fakeElement.attr('_ke_real_node_type') != Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/fake-objects.js'].lineData[119]++;
    return null;
  }
  _$jscoverage['/fake-objects.js'].lineData[122]++;
  var html = (S.urlDecode(fakeElement.attr('_ke_realelement')));
  _$jscoverage['/fake-objects.js'].lineData[124]++;
  var temp = new Node('<div>', null, editor.get("document")[0]);
  _$jscoverage['/fake-objects.js'].lineData[125]++;
  temp.html(html);
  _$jscoverage['/fake-objects.js'].lineData[127]++;
  return temp.first().remove();
}, 
  createFakeParserElement: function(realElement, className, realElementType, isResizable, attrs) {
  _$jscoverage['/fake-objects.js'].functionData[6]++;
  _$jscoverage['/fake-objects.js'].lineData[133]++;
  var html = HtmlParser.serialize(realElement);
  _$jscoverage['/fake-objects.js'].lineData[134]++;
  var style = visit21_134_1(realElement.getAttribute("style") || '');
  _$jscoverage['/fake-objects.js'].lineData[135]++;
  if (visit22_135_1(realElement.getAttribute("width"))) {
    _$jscoverage['/fake-objects.js'].lineData[136]++;
    style = "width:" + realElement.getAttribute("width") + "px;" + style;
  }
  _$jscoverage['/fake-objects.js'].lineData[138]++;
  if (visit23_138_1(realElement.getAttribute("height"))) {
    _$jscoverage['/fake-objects.js'].lineData[139]++;
    style = "height:" + realElement.getAttribute("height") + "px;" + style;
  }
  _$jscoverage['/fake-objects.js'].lineData[142]++;
  var existClass = S.trim(realElement.getAttribute("class")), attributes = {
  'class': className + " " + existClass, 
  src: SPACER_GIF, 
  _ke_realelement: encodeURIComponent(html), 
  _ke_real_node_type: realElement.nodeType + "", 
  style: style, 
  align: visit24_149_1(realElement.getAttribute("align") || '')};
  _$jscoverage['/fake-objects.js'].lineData[152]++;
  if (visit25_152_1(attrs)) {
    _$jscoverage['/fake-objects.js'].lineData[153]++;
    delete attrs.width;
    _$jscoverage['/fake-objects.js'].lineData[154]++;
    delete attrs.height;
    _$jscoverage['/fake-objects.js'].lineData[155]++;
    S.mix(attributes, attrs, false);
  }
  _$jscoverage['/fake-objects.js'].lineData[158]++;
  if (visit26_158_1(realElementType)) {
    _$jscoverage['/fake-objects.js'].lineData[159]++;
    attributes._ke_real_element_type = realElementType;
  }
  _$jscoverage['/fake-objects.js'].lineData[161]++;
  if (visit27_161_1(isResizable)) {
    _$jscoverage['/fake-objects.js'].lineData[162]++;
    attributes._ke_resizable = "_ke_resizable";
  }
  _$jscoverage['/fake-objects.js'].lineData[164]++;
  return new HtmlParser.Tag('img', attributes);
}});
}};
}, {
  requires: ["editor", 'html-parser']});
