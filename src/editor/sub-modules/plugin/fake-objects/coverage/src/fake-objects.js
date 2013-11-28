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
  _$jscoverage['/fake-objects.js'].lineData[8] = 0;
  _$jscoverage['/fake-objects.js'].lineData[10] = 0;
  _$jscoverage['/fake-objects.js'].lineData[15] = 0;
  _$jscoverage['/fake-objects.js'].lineData[18] = 0;
  _$jscoverage['/fake-objects.js'].lineData[19] = 0;
  _$jscoverage['/fake-objects.js'].lineData[20] = 0;
  _$jscoverage['/fake-objects.js'].lineData[22] = 0;
  _$jscoverage['/fake-objects.js'].lineData[23] = 0;
  _$jscoverage['/fake-objects.js'].lineData[25] = 0;
  _$jscoverage['/fake-objects.js'].lineData[36] = 0;
  _$jscoverage['/fake-objects.js'].lineData[37] = 0;
  _$jscoverage['/fake-objects.js'].lineData[38] = 0;
  _$jscoverage['/fake-objects.js'].lineData[39] = 0;
  _$jscoverage['/fake-objects.js'].lineData[42] = 0;
  _$jscoverage['/fake-objects.js'].lineData[43] = 0;
  _$jscoverage['/fake-objects.js'].lineData[45] = 0;
  _$jscoverage['/fake-objects.js'].lineData[46] = 0;
  _$jscoverage['/fake-objects.js'].lineData[47] = 0;
  _$jscoverage['/fake-objects.js'].lineData[51] = 0;
  _$jscoverage['/fake-objects.js'].lineData[52] = 0;
  _$jscoverage['/fake-objects.js'].lineData[55] = 0;
  _$jscoverage['/fake-objects.js'].lineData[57] = 0;
  _$jscoverage['/fake-objects.js'].lineData[58] = 0;
  _$jscoverage['/fake-objects.js'].lineData[60] = 0;
  _$jscoverage['/fake-objects.js'].lineData[64] = 0;
  _$jscoverage['/fake-objects.js'].lineData[68] = 0;
  _$jscoverage['/fake-objects.js'].lineData[70] = 0;
  _$jscoverage['/fake-objects.js'].lineData[72] = 0;
  _$jscoverage['/fake-objects.js'].lineData[73] = 0;
  _$jscoverage['/fake-objects.js'].lineData[76] = 0;
  _$jscoverage['/fake-objects.js'].lineData[80] = 0;
  _$jscoverage['/fake-objects.js'].lineData[81] = 0;
  _$jscoverage['/fake-objects.js'].lineData[82] = 0;
  _$jscoverage['/fake-objects.js'].lineData[84] = 0;
  _$jscoverage['/fake-objects.js'].lineData[88] = 0;
  _$jscoverage['/fake-objects.js'].lineData[90] = 0;
  _$jscoverage['/fake-objects.js'].lineData[92] = 0;
  _$jscoverage['/fake-objects.js'].lineData[93] = 0;
  _$jscoverage['/fake-objects.js'].lineData[95] = 0;
  _$jscoverage['/fake-objects.js'].lineData[96] = 0;
  _$jscoverage['/fake-objects.js'].lineData[99] = 0;
  _$jscoverage['/fake-objects.js'].lineData[106] = 0;
  _$jscoverage['/fake-objects.js'].lineData[108] = 0;
  _$jscoverage['/fake-objects.js'].lineData[111] = 0;
  _$jscoverage['/fake-objects.js'].lineData[112] = 0;
  _$jscoverage['/fake-objects.js'].lineData[115] = 0;
  _$jscoverage['/fake-objects.js'].lineData[116] = 0;
  _$jscoverage['/fake-objects.js'].lineData[119] = 0;
  _$jscoverage['/fake-objects.js'].lineData[121] = 0;
  _$jscoverage['/fake-objects.js'].lineData[122] = 0;
  _$jscoverage['/fake-objects.js'].lineData[125] = 0;
  _$jscoverage['/fake-objects.js'].lineData[127] = 0;
  _$jscoverage['/fake-objects.js'].lineData[128] = 0;
  _$jscoverage['/fake-objects.js'].lineData[130] = 0;
  _$jscoverage['/fake-objects.js'].lineData[136] = 0;
  _$jscoverage['/fake-objects.js'].lineData[137] = 0;
  _$jscoverage['/fake-objects.js'].lineData[138] = 0;
  _$jscoverage['/fake-objects.js'].lineData[139] = 0;
  _$jscoverage['/fake-objects.js'].lineData[141] = 0;
  _$jscoverage['/fake-objects.js'].lineData[142] = 0;
  _$jscoverage['/fake-objects.js'].lineData[145] = 0;
  _$jscoverage['/fake-objects.js'].lineData[155] = 0;
  _$jscoverage['/fake-objects.js'].lineData[156] = 0;
  _$jscoverage['/fake-objects.js'].lineData[157] = 0;
  _$jscoverage['/fake-objects.js'].lineData[158] = 0;
  _$jscoverage['/fake-objects.js'].lineData[161] = 0;
  _$jscoverage['/fake-objects.js'].lineData[162] = 0;
  _$jscoverage['/fake-objects.js'].lineData[164] = 0;
  _$jscoverage['/fake-objects.js'].lineData[165] = 0;
  _$jscoverage['/fake-objects.js'].lineData[167] = 0;
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
  _$jscoverage['/fake-objects.js'].branchData['18'] = [];
  _$jscoverage['/fake-objects.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['19'] = [];
  _$jscoverage['/fake-objects.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['22'] = [];
  _$jscoverage['/fake-objects.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['31'] = [];
  _$jscoverage['/fake-objects.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['36'] = [];
  _$jscoverage['/fake-objects.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['42'] = [];
  _$jscoverage['/fake-objects.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['45'] = [];
  _$jscoverage['/fake-objects.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['51'] = [];
  _$jscoverage['/fake-objects.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['72'] = [];
  _$jscoverage['/fake-objects.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['76'] = [];
  _$jscoverage['/fake-objects.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['80'] = [];
  _$jscoverage['/fake-objects.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['82'] = [];
  _$jscoverage['/fake-objects.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['85'] = [];
  _$jscoverage['/fake-objects.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['90'] = [];
  _$jscoverage['/fake-objects.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['92'] = [];
  _$jscoverage['/fake-objects.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['95'] = [];
  _$jscoverage['/fake-objects.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['109'] = [];
  _$jscoverage['/fake-objects.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['111'] = [];
  _$jscoverage['/fake-objects.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['115'] = [];
  _$jscoverage['/fake-objects.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['121'] = [];
  _$jscoverage['/fake-objects.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['137'] = [];
  _$jscoverage['/fake-objects.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['138'] = [];
  _$jscoverage['/fake-objects.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['141'] = [];
  _$jscoverage['/fake-objects.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['152'] = [];
  _$jscoverage['/fake-objects.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['155'] = [];
  _$jscoverage['/fake-objects.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['161'] = [];
  _$jscoverage['/fake-objects.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['164'] = [];
  _$jscoverage['/fake-objects.js'].branchData['164'][1] = new BranchData();
}
_$jscoverage['/fake-objects.js'].branchData['164'][1].init(1443, 11, 'isResizable');
function visit27_164_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['161'][1].init(1302, 15, 'realElementType');
function visit26_161_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['155'][1].init(1100, 5, 'attrs');
function visit25_155_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['152'][1].init(336, 39, 'realElement.getAttribute("align") || \'\'');
function visit24_152_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['141'][1].init(341, 34, 'realElement.getAttribute("height")');
function visit23_141_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['138'][1].init(164, 33, 'realElement.getAttribute('width')');
function visit22_138_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['137'][1].init(99, 39, 'realElement.getAttribute("style") || \'\'');
function visit21_137_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['121'][1].init(25, 67, 'fakeElement.attr(\'_ke_real_node_type\') != Dom.NodeType.ELEMENT_NODE');
function visit20_121_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['115'][1].init(244, 10, 'htmlFilter');
function visit19_115_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['111'][1].init(148, 37, 'dataProcessor.createFakeParserElement');
function visit18_111_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['109'][1].init(74, 41, 'dataProcessor && dataProcessor.htmlFilter');
function visit17_109_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['95'][1].init(544, 6, 'height');
function visit16_95_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['92'][1].init(411, 5, 'width');
function visit15_92_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['90'][1].init(363, 17, 'match && match[1]');
function visit14_90_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['85'][1].init(89, 17, 'match && match[1]');
function visit13_85_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['82'][1].init(88, 5, 'style');
function visit12_82_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['80'][1].init(467, 11, 'realElement');
function visit11_80_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['76'][1].init(283, 44, 'realFragment && realFragment.childNodes[0]');
function visit10_76_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['72'][1].init(129, 8, 'realHTML');
function visit9_72_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['51'][1].init(17, 67, 'fakeElement.attr(\'_ke_real_node_type\') != Dom.NodeType.ELEMENT_NODE');
function visit8_51_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['45'][1].init(1097, 11, 'isResizable');
function visit7_45_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['42'][1].init(995, 15, 'realElementType');
function visit6_42_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['36'][1].init(833, 5, 'attrs');
function visit5_36_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['31'][1].init(153, 36, 'outerHTML || realElement.outerHtml()');
function visit4_31_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['22'][1].init(211, 26, 'realElement.attr("height")');
function visit3_22_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['19'][1].init(74, 25, 'realElement.attr('width')');
function visit2_19_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['18'][1].init(25, 31, 'realElement.attr("style") || \'\'');
function visit1_18_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/fake-objects.js'].functionData[0]++;
  _$jscoverage['/fake-objects.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/fake-objects.js'].lineData[8]++;
  var HtmlParser = require('html-parser');
  _$jscoverage['/fake-objects.js'].lineData[10]++;
  var Node = S.Node, Dom = S.DOM, Utils = Editor.Utils, SPACER_GIF = Utils.debugUrl('theme/spacer.gif');
  _$jscoverage['/fake-objects.js'].lineData[15]++;
  Editor.addMembers({
  createFakeElement: function(realElement, className, realElementType, isResizable, outerHTML, attrs) {
  _$jscoverage['/fake-objects.js'].functionData[1]++;
  _$jscoverage['/fake-objects.js'].lineData[18]++;
  var style = visit1_18_1(realElement.attr("style") || '');
  _$jscoverage['/fake-objects.js'].lineData[19]++;
  if (visit2_19_1(realElement.attr('width'))) {
    _$jscoverage['/fake-objects.js'].lineData[20]++;
    style = "width:" + realElement.attr('width') + "px;" + style;
  }
  _$jscoverage['/fake-objects.js'].lineData[22]++;
  if (visit3_22_1(realElement.attr("height"))) {
    _$jscoverage['/fake-objects.js'].lineData[23]++;
    style = "height:" + realElement.attr("height") + "px;" + style;
  }
  _$jscoverage['/fake-objects.js'].lineData[25]++;
  var self = this, existClass = S.trim(realElement.attr('class')), attributes = {
  'class': className + " " + existClass, 
  src: SPACER_GIF, 
  _ke_realelement: encodeURIComponent(visit4_31_1(outerHTML || realElement.outerHtml())), 
  _ke_real_node_type: realElement[0].nodeType, 
  style: style};
  _$jscoverage['/fake-objects.js'].lineData[36]++;
  if (visit5_36_1(attrs)) {
    _$jscoverage['/fake-objects.js'].lineData[37]++;
    delete attrs.width;
    _$jscoverage['/fake-objects.js'].lineData[38]++;
    delete attrs.height;
    _$jscoverage['/fake-objects.js'].lineData[39]++;
    S.mix(attributes, attrs, false);
  }
  _$jscoverage['/fake-objects.js'].lineData[42]++;
  if (visit6_42_1(realElementType)) {
    _$jscoverage['/fake-objects.js'].lineData[43]++;
    attributes._ke_real_element_type = realElementType;
  }
  _$jscoverage['/fake-objects.js'].lineData[45]++;
  if (visit7_45_1(isResizable)) {
    _$jscoverage['/fake-objects.js'].lineData[46]++;
    attributes._ke_resizable = isResizable;
  }
  _$jscoverage['/fake-objects.js'].lineData[47]++;
  return new Node("<img/>", attributes, self.get('document')[0]);
}, 
  restoreRealElement: function(fakeElement) {
  _$jscoverage['/fake-objects.js'].functionData[2]++;
  _$jscoverage['/fake-objects.js'].lineData[51]++;
  if (visit8_51_1(fakeElement.attr('_ke_real_node_type') != Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/fake-objects.js'].lineData[52]++;
    return null;
  }
  _$jscoverage['/fake-objects.js'].lineData[55]++;
  var html = (S.urlDecode(fakeElement.attr('_ke_realelement')));
  _$jscoverage['/fake-objects.js'].lineData[57]++;
  var temp = new Node('<div>', null, this.get('document')[0]);
  _$jscoverage['/fake-objects.js'].lineData[58]++;
  temp.html(html);
  _$jscoverage['/fake-objects.js'].lineData[60]++;
  return temp.first().remove();
}});
  _$jscoverage['/fake-objects.js'].lineData[64]++;
  var htmlFilterRules = {
  tags: {
  $: function(element) {
  _$jscoverage['/fake-objects.js'].functionData[3]++;
  _$jscoverage['/fake-objects.js'].lineData[68]++;
  var realHTML = element.getAttribute("_ke_realelement");
  _$jscoverage['/fake-objects.js'].lineData[70]++;
  var realFragment;
  _$jscoverage['/fake-objects.js'].lineData[72]++;
  if (visit9_72_1(realHTML)) {
    _$jscoverage['/fake-objects.js'].lineData[73]++;
    realFragment = new HtmlParser.Parser(S.urlDecode(realHTML)).parse();
  }
  _$jscoverage['/fake-objects.js'].lineData[76]++;
  var realElement = visit10_76_1(realFragment && realFragment.childNodes[0]);
  _$jscoverage['/fake-objects.js'].lineData[80]++;
  if (visit11_80_1(realElement)) {
    _$jscoverage['/fake-objects.js'].lineData[81]++;
    var style = element.getAttribute("style");
    _$jscoverage['/fake-objects.js'].lineData[82]++;
    if (visit12_82_1(style)) {
      _$jscoverage['/fake-objects.js'].lineData[84]++;
      var match = /(?:^|\s)width\s*:\s*(\d+)/i.exec(style), width = visit13_85_1(match && match[1]);
      _$jscoverage['/fake-objects.js'].lineData[88]++;
      match = /(?:^|\s)height\s*:\s*(\d+)/i.exec(style);
      _$jscoverage['/fake-objects.js'].lineData[90]++;
      var height = visit14_90_1(match && match[1]);
      _$jscoverage['/fake-objects.js'].lineData[92]++;
      if (visit15_92_1(width)) {
        _$jscoverage['/fake-objects.js'].lineData[93]++;
        realElement.setAttribute('width', width);
      }
      _$jscoverage['/fake-objects.js'].lineData[95]++;
      if (visit16_95_1(height)) {
        _$jscoverage['/fake-objects.js'].lineData[96]++;
        realElement.setAttribute("height", height);
      }
    }
    _$jscoverage['/fake-objects.js'].lineData[99]++;
    return realElement;
  }
}}};
  _$jscoverage['/fake-objects.js'].lineData[106]++;
  return {
  init: function(editor) {
  _$jscoverage['/fake-objects.js'].functionData[4]++;
  _$jscoverage['/fake-objects.js'].lineData[108]++;
  var dataProcessor = editor.htmlDataProcessor, htmlFilter = visit17_109_1(dataProcessor && dataProcessor.htmlFilter);
  _$jscoverage['/fake-objects.js'].lineData[111]++;
  if (visit18_111_1(dataProcessor.createFakeParserElement)) {
    _$jscoverage['/fake-objects.js'].lineData[112]++;
    return;
  }
  _$jscoverage['/fake-objects.js'].lineData[115]++;
  if (visit19_115_1(htmlFilter)) {
    _$jscoverage['/fake-objects.js'].lineData[116]++;
    htmlFilter.addRules(htmlFilterRules);
  }
  _$jscoverage['/fake-objects.js'].lineData[119]++;
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
  var temp = new Node('<div>', null, editor.get('document')[0]);
  _$jscoverage['/fake-objects.js'].lineData[128]++;
  temp.html(html);
  _$jscoverage['/fake-objects.js'].lineData[130]++;
  return temp.first().remove();
}, 
  createFakeParserElement: function(realElement, className, realElementType, isResizable, attrs) {
  _$jscoverage['/fake-objects.js'].functionData[6]++;
  _$jscoverage['/fake-objects.js'].lineData[136]++;
  var html = HtmlParser.serialize(realElement);
  _$jscoverage['/fake-objects.js'].lineData[137]++;
  var style = visit21_137_1(realElement.getAttribute("style") || '');
  _$jscoverage['/fake-objects.js'].lineData[138]++;
  if (visit22_138_1(realElement.getAttribute('width'))) {
    _$jscoverage['/fake-objects.js'].lineData[139]++;
    style = "width:" + realElement.getAttribute('width') + "px;" + style;
  }
  _$jscoverage['/fake-objects.js'].lineData[141]++;
  if (visit23_141_1(realElement.getAttribute("height"))) {
    _$jscoverage['/fake-objects.js'].lineData[142]++;
    style = "height:" + realElement.getAttribute("height") + "px;" + style;
  }
  _$jscoverage['/fake-objects.js'].lineData[145]++;
  var existClass = S.trim(realElement.getAttribute("class")), attributes = {
  'class': className + " " + existClass, 
  src: SPACER_GIF, 
  _ke_realelement: encodeURIComponent(html), 
  _ke_real_node_type: realElement.nodeType + "", 
  style: style, 
  align: visit24_152_1(realElement.getAttribute("align") || '')};
  _$jscoverage['/fake-objects.js'].lineData[155]++;
  if (visit25_155_1(attrs)) {
    _$jscoverage['/fake-objects.js'].lineData[156]++;
    delete attrs.width;
    _$jscoverage['/fake-objects.js'].lineData[157]++;
    delete attrs.height;
    _$jscoverage['/fake-objects.js'].lineData[158]++;
    S.mix(attributes, attrs, false);
  }
  _$jscoverage['/fake-objects.js'].lineData[161]++;
  if (visit26_161_1(realElementType)) {
    _$jscoverage['/fake-objects.js'].lineData[162]++;
    attributes._ke_real_element_type = realElementType;
  }
  _$jscoverage['/fake-objects.js'].lineData[164]++;
  if (visit27_164_1(isResizable)) {
    _$jscoverage['/fake-objects.js'].lineData[165]++;
    attributes._ke_resizable = "_ke_resizable";
  }
  _$jscoverage['/fake-objects.js'].lineData[167]++;
  return new HtmlParser.Tag('img', attributes);
}});
}};
});
