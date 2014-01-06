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
  _$jscoverage['/fake-objects.js'].lineData[8] = 0;
  _$jscoverage['/fake-objects.js'].lineData[9] = 0;
  _$jscoverage['/fake-objects.js'].lineData[11] = 0;
  _$jscoverage['/fake-objects.js'].lineData[16] = 0;
  _$jscoverage['/fake-objects.js'].lineData[19] = 0;
  _$jscoverage['/fake-objects.js'].lineData[20] = 0;
  _$jscoverage['/fake-objects.js'].lineData[21] = 0;
  _$jscoverage['/fake-objects.js'].lineData[23] = 0;
  _$jscoverage['/fake-objects.js'].lineData[24] = 0;
  _$jscoverage['/fake-objects.js'].lineData[26] = 0;
  _$jscoverage['/fake-objects.js'].lineData[37] = 0;
  _$jscoverage['/fake-objects.js'].lineData[38] = 0;
  _$jscoverage['/fake-objects.js'].lineData[39] = 0;
  _$jscoverage['/fake-objects.js'].lineData[40] = 0;
  _$jscoverage['/fake-objects.js'].lineData[43] = 0;
  _$jscoverage['/fake-objects.js'].lineData[44] = 0;
  _$jscoverage['/fake-objects.js'].lineData[47] = 0;
  _$jscoverage['/fake-objects.js'].lineData[48] = 0;
  _$jscoverage['/fake-objects.js'].lineData[50] = 0;
  _$jscoverage['/fake-objects.js'].lineData[54] = 0;
  _$jscoverage['/fake-objects.js'].lineData[55] = 0;
  _$jscoverage['/fake-objects.js'].lineData[58] = 0;
  _$jscoverage['/fake-objects.js'].lineData[60] = 0;
  _$jscoverage['/fake-objects.js'].lineData[61] = 0;
  _$jscoverage['/fake-objects.js'].lineData[63] = 0;
  _$jscoverage['/fake-objects.js'].lineData[67] = 0;
  _$jscoverage['/fake-objects.js'].lineData[71] = 0;
  _$jscoverage['/fake-objects.js'].lineData[73] = 0;
  _$jscoverage['/fake-objects.js'].lineData[75] = 0;
  _$jscoverage['/fake-objects.js'].lineData[76] = 0;
  _$jscoverage['/fake-objects.js'].lineData[79] = 0;
  _$jscoverage['/fake-objects.js'].lineData[83] = 0;
  _$jscoverage['/fake-objects.js'].lineData[84] = 0;
  _$jscoverage['/fake-objects.js'].lineData[85] = 0;
  _$jscoverage['/fake-objects.js'].lineData[87] = 0;
  _$jscoverage['/fake-objects.js'].lineData[91] = 0;
  _$jscoverage['/fake-objects.js'].lineData[93] = 0;
  _$jscoverage['/fake-objects.js'].lineData[95] = 0;
  _$jscoverage['/fake-objects.js'].lineData[96] = 0;
  _$jscoverage['/fake-objects.js'].lineData[98] = 0;
  _$jscoverage['/fake-objects.js'].lineData[99] = 0;
  _$jscoverage['/fake-objects.js'].lineData[102] = 0;
  _$jscoverage['/fake-objects.js'].lineData[109] = 0;
  _$jscoverage['/fake-objects.js'].lineData[111] = 0;
  _$jscoverage['/fake-objects.js'].lineData[114] = 0;
  _$jscoverage['/fake-objects.js'].lineData[115] = 0;
  _$jscoverage['/fake-objects.js'].lineData[118] = 0;
  _$jscoverage['/fake-objects.js'].lineData[119] = 0;
  _$jscoverage['/fake-objects.js'].lineData[122] = 0;
  _$jscoverage['/fake-objects.js'].lineData[124] = 0;
  _$jscoverage['/fake-objects.js'].lineData[125] = 0;
  _$jscoverage['/fake-objects.js'].lineData[128] = 0;
  _$jscoverage['/fake-objects.js'].lineData[130] = 0;
  _$jscoverage['/fake-objects.js'].lineData[131] = 0;
  _$jscoverage['/fake-objects.js'].lineData[133] = 0;
  _$jscoverage['/fake-objects.js'].lineData[139] = 0;
  _$jscoverage['/fake-objects.js'].lineData[140] = 0;
  _$jscoverage['/fake-objects.js'].lineData[141] = 0;
  _$jscoverage['/fake-objects.js'].lineData[142] = 0;
  _$jscoverage['/fake-objects.js'].lineData[144] = 0;
  _$jscoverage['/fake-objects.js'].lineData[145] = 0;
  _$jscoverage['/fake-objects.js'].lineData[148] = 0;
  _$jscoverage['/fake-objects.js'].lineData[158] = 0;
  _$jscoverage['/fake-objects.js'].lineData[159] = 0;
  _$jscoverage['/fake-objects.js'].lineData[160] = 0;
  _$jscoverage['/fake-objects.js'].lineData[161] = 0;
  _$jscoverage['/fake-objects.js'].lineData[164] = 0;
  _$jscoverage['/fake-objects.js'].lineData[165] = 0;
  _$jscoverage['/fake-objects.js'].lineData[167] = 0;
  _$jscoverage['/fake-objects.js'].lineData[168] = 0;
  _$jscoverage['/fake-objects.js'].lineData[170] = 0;
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
  _$jscoverage['/fake-objects.js'].branchData['19'] = [];
  _$jscoverage['/fake-objects.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['20'] = [];
  _$jscoverage['/fake-objects.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['23'] = [];
  _$jscoverage['/fake-objects.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['32'] = [];
  _$jscoverage['/fake-objects.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['37'] = [];
  _$jscoverage['/fake-objects.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['43'] = [];
  _$jscoverage['/fake-objects.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['47'] = [];
  _$jscoverage['/fake-objects.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['54'] = [];
  _$jscoverage['/fake-objects.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['75'] = [];
  _$jscoverage['/fake-objects.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['79'] = [];
  _$jscoverage['/fake-objects.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['83'] = [];
  _$jscoverage['/fake-objects.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['85'] = [];
  _$jscoverage['/fake-objects.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['88'] = [];
  _$jscoverage['/fake-objects.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['93'] = [];
  _$jscoverage['/fake-objects.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['95'] = [];
  _$jscoverage['/fake-objects.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['98'] = [];
  _$jscoverage['/fake-objects.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['112'] = [];
  _$jscoverage['/fake-objects.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['114'] = [];
  _$jscoverage['/fake-objects.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['118'] = [];
  _$jscoverage['/fake-objects.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['124'] = [];
  _$jscoverage['/fake-objects.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['140'] = [];
  _$jscoverage['/fake-objects.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['141'] = [];
  _$jscoverage['/fake-objects.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['144'] = [];
  _$jscoverage['/fake-objects.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['155'] = [];
  _$jscoverage['/fake-objects.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['158'] = [];
  _$jscoverage['/fake-objects.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['164'] = [];
  _$jscoverage['/fake-objects.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/fake-objects.js'].branchData['167'] = [];
  _$jscoverage['/fake-objects.js'].branchData['167'][1] = new BranchData();
}
_$jscoverage['/fake-objects.js'].branchData['167'][1].init(1444, 11, 'isResizable');
function visit27_167_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['164'][1].init(1303, 15, 'realElementType');
function visit26_164_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['158'][1].init(1101, 5, 'attrs');
function visit25_158_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['155'][1].init(337, 39, 'realElement.getAttribute(\'align\') || \'\'');
function visit24_155_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['144'][1].init(341, 34, 'realElement.getAttribute(\'height\')');
function visit23_144_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['141'][1].init(164, 33, 'realElement.getAttribute(\'width\')');
function visit22_141_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['140'][1].init(99, 39, 'realElement.getAttribute(\'style\') || \'\'');
function visit21_140_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['124'][1].init(25, 82, 'parseInt(fakeElement.attr(\'_ke_real_node_type\'), 10) !== Dom.NodeType.ELEMENT_NODE');
function visit20_124_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['118'][1].init(244, 10, 'htmlFilter');
function visit19_118_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['114'][1].init(148, 37, 'dataProcessor.createFakeParserElement');
function visit18_114_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['112'][1].init(74, 41, 'dataProcessor && dataProcessor.htmlFilter');
function visit17_112_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['98'][1].init(544, 6, 'height');
function visit16_98_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['95'][1].init(411, 5, 'width');
function visit15_95_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['93'][1].init(363, 17, 'match && match[1]');
function visit14_93_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['88'][1].init(89, 17, 'match && match[1]');
function visit13_88_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['85'][1].init(88, 5, 'style');
function visit12_85_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['83'][1].init(468, 11, 'realElement');
function visit11_83_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['79'][1].init(284, 44, 'realFragment && realFragment.childNodes[0]');
function visit10_79_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['75'][1].init(130, 8, 'realHTML');
function visit9_75_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['54'][1].init(17, 82, 'parseInt(fakeElement.attr(\'_ke_real_node_type\'), 10) !== Dom.NodeType.ELEMENT_NODE');
function visit8_54_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['47'][1].init(1114, 11, 'isResizable');
function visit7_47_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['43'][1].init(996, 15, 'realElementType');
function visit6_43_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['37'][1].init(834, 5, 'attrs');
function visit5_37_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['32'][1].init(154, 36, 'outerHTML || realElement.outerHtml()');
function visit4_32_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['23'][1].init(211, 26, 'realElement.attr(\'height\')');
function visit3_23_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['20'][1].init(74, 25, 'realElement.attr(\'width\')');
function visit2_20_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].branchData['19'][1].init(25, 31, 'realElement.attr(\'style\') || \'\'');
function visit1_19_1(result) {
  _$jscoverage['/fake-objects.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/fake-objects.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/fake-objects.js'].functionData[0]++;
  _$jscoverage['/fake-objects.js'].lineData[8]++;
  var Editor = require('editor');
  _$jscoverage['/fake-objects.js'].lineData[9]++;
  var HtmlParser = require('html-parser');
  _$jscoverage['/fake-objects.js'].lineData[11]++;
  var Node = S.Node, Dom = S.DOM, Utils = Editor.Utils, SPACER_GIF = Utils.debugUrl('theme/spacer.gif');
  _$jscoverage['/fake-objects.js'].lineData[16]++;
  Editor.addMembers({
  createFakeElement: function(realElement, className, realElementType, isResizable, outerHTML, attrs) {
  _$jscoverage['/fake-objects.js'].functionData[1]++;
  _$jscoverage['/fake-objects.js'].lineData[19]++;
  var style = visit1_19_1(realElement.attr('style') || '');
  _$jscoverage['/fake-objects.js'].lineData[20]++;
  if (visit2_20_1(realElement.attr('width'))) {
    _$jscoverage['/fake-objects.js'].lineData[21]++;
    style = 'width:' + realElement.attr('width') + 'px;' + style;
  }
  _$jscoverage['/fake-objects.js'].lineData[23]++;
  if (visit3_23_1(realElement.attr('height'))) {
    _$jscoverage['/fake-objects.js'].lineData[24]++;
    style = 'height:' + realElement.attr('height') + 'px;' + style;
  }
  _$jscoverage['/fake-objects.js'].lineData[26]++;
  var self = this, existClass = S.trim(realElement.attr('class')), attributes = {
  'class': className + ' ' + existClass, 
  src: SPACER_GIF, 
  _ke_real_element: encodeURIComponent(visit4_32_1(outerHTML || realElement.outerHtml())), 
  _ke_real_node_type: realElement[0].nodeType, 
  style: style};
  _$jscoverage['/fake-objects.js'].lineData[37]++;
  if (visit5_37_1(attrs)) {
    _$jscoverage['/fake-objects.js'].lineData[38]++;
    delete attrs.width;
    _$jscoverage['/fake-objects.js'].lineData[39]++;
    delete attrs.height;
    _$jscoverage['/fake-objects.js'].lineData[40]++;
    S.mix(attributes, attrs, false);
  }
  _$jscoverage['/fake-objects.js'].lineData[43]++;
  if (visit6_43_1(realElementType)) {
    _$jscoverage['/fake-objects.js'].lineData[44]++;
    attributes._ke_real_element_type = realElementType;
  }
  _$jscoverage['/fake-objects.js'].lineData[47]++;
  if (visit7_47_1(isResizable)) {
    _$jscoverage['/fake-objects.js'].lineData[48]++;
    attributes._ke_resizable = isResizable;
  }
  _$jscoverage['/fake-objects.js'].lineData[50]++;
  return new Node('<img/>', attributes, self.get('document')[0]);
}, 
  restoreRealElement: function(fakeElement) {
  _$jscoverage['/fake-objects.js'].functionData[2]++;
  _$jscoverage['/fake-objects.js'].lineData[54]++;
  if (visit8_54_1(parseInt(fakeElement.attr('_ke_real_node_type'), 10) !== Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/fake-objects.js'].lineData[55]++;
    return null;
  }
  _$jscoverage['/fake-objects.js'].lineData[58]++;
  var html = (S.urlDecode(fakeElement.attr('_ke_real_element')));
  _$jscoverage['/fake-objects.js'].lineData[60]++;
  var temp = new Node('<div>', null, this.get('document')[0]);
  _$jscoverage['/fake-objects.js'].lineData[61]++;
  temp.html(html);
  _$jscoverage['/fake-objects.js'].lineData[63]++;
  return temp.first().remove();
}});
  _$jscoverage['/fake-objects.js'].lineData[67]++;
  var htmlFilterRules = {
  tags: {
  $: function(element) {
  _$jscoverage['/fake-objects.js'].functionData[3]++;
  _$jscoverage['/fake-objects.js'].lineData[71]++;
  var realHTML = element.getAttribute('_ke_real_element');
  _$jscoverage['/fake-objects.js'].lineData[73]++;
  var realFragment;
  _$jscoverage['/fake-objects.js'].lineData[75]++;
  if (visit9_75_1(realHTML)) {
    _$jscoverage['/fake-objects.js'].lineData[76]++;
    realFragment = new HtmlParser.Parser(S.urlDecode(realHTML)).parse();
  }
  _$jscoverage['/fake-objects.js'].lineData[79]++;
  var realElement = visit10_79_1(realFragment && realFragment.childNodes[0]);
  _$jscoverage['/fake-objects.js'].lineData[83]++;
  if (visit11_83_1(realElement)) {
    _$jscoverage['/fake-objects.js'].lineData[84]++;
    var style = element.getAttribute('style');
    _$jscoverage['/fake-objects.js'].lineData[85]++;
    if (visit12_85_1(style)) {
      _$jscoverage['/fake-objects.js'].lineData[87]++;
      var match = /(?:^|\s)width\s*:\s*(\d+)/i.exec(style), width = visit13_88_1(match && match[1]);
      _$jscoverage['/fake-objects.js'].lineData[91]++;
      match = /(?:^|\s)height\s*:\s*(\d+)/i.exec(style);
      _$jscoverage['/fake-objects.js'].lineData[93]++;
      var height = visit14_93_1(match && match[1]);
      _$jscoverage['/fake-objects.js'].lineData[95]++;
      if (visit15_95_1(width)) {
        _$jscoverage['/fake-objects.js'].lineData[96]++;
        realElement.setAttribute('width', width);
      }
      _$jscoverage['/fake-objects.js'].lineData[98]++;
      if (visit16_98_1(height)) {
        _$jscoverage['/fake-objects.js'].lineData[99]++;
        realElement.setAttribute('height', height);
      }
    }
    _$jscoverage['/fake-objects.js'].lineData[102]++;
    return realElement;
  }
}}};
  _$jscoverage['/fake-objects.js'].lineData[109]++;
  return {
  init: function(editor) {
  _$jscoverage['/fake-objects.js'].functionData[4]++;
  _$jscoverage['/fake-objects.js'].lineData[111]++;
  var dataProcessor = editor.htmlDataProcessor, htmlFilter = visit17_112_1(dataProcessor && dataProcessor.htmlFilter);
  _$jscoverage['/fake-objects.js'].lineData[114]++;
  if (visit18_114_1(dataProcessor.createFakeParserElement)) {
    _$jscoverage['/fake-objects.js'].lineData[115]++;
    return;
  }
  _$jscoverage['/fake-objects.js'].lineData[118]++;
  if (visit19_118_1(htmlFilter)) {
    _$jscoverage['/fake-objects.js'].lineData[119]++;
    htmlFilter.addRules(htmlFilterRules);
  }
  _$jscoverage['/fake-objects.js'].lineData[122]++;
  S.mix(dataProcessor, {
  restoreRealElement: function(fakeElement) {
  _$jscoverage['/fake-objects.js'].functionData[5]++;
  _$jscoverage['/fake-objects.js'].lineData[124]++;
  if (visit20_124_1(parseInt(fakeElement.attr('_ke_real_node_type'), 10) !== Dom.NodeType.ELEMENT_NODE)) {
    _$jscoverage['/fake-objects.js'].lineData[125]++;
    return null;
  }
  _$jscoverage['/fake-objects.js'].lineData[128]++;
  var html = (S.urlDecode(fakeElement.attr('_ke_real_element')));
  _$jscoverage['/fake-objects.js'].lineData[130]++;
  var temp = new Node('<div>', null, editor.get('document')[0]);
  _$jscoverage['/fake-objects.js'].lineData[131]++;
  temp.html(html);
  _$jscoverage['/fake-objects.js'].lineData[133]++;
  return temp.first().remove();
}, 
  createFakeParserElement: function(realElement, className, realElementType, isResizable, attrs) {
  _$jscoverage['/fake-objects.js'].functionData[6]++;
  _$jscoverage['/fake-objects.js'].lineData[139]++;
  var html = HtmlParser.serialize(realElement);
  _$jscoverage['/fake-objects.js'].lineData[140]++;
  var style = visit21_140_1(realElement.getAttribute('style') || '');
  _$jscoverage['/fake-objects.js'].lineData[141]++;
  if (visit22_141_1(realElement.getAttribute('width'))) {
    _$jscoverage['/fake-objects.js'].lineData[142]++;
    style = 'width:' + realElement.getAttribute('width') + 'px;' + style;
  }
  _$jscoverage['/fake-objects.js'].lineData[144]++;
  if (visit23_144_1(realElement.getAttribute('height'))) {
    _$jscoverage['/fake-objects.js'].lineData[145]++;
    style = 'height:' + realElement.getAttribute('height') + 'px;' + style;
  }
  _$jscoverage['/fake-objects.js'].lineData[148]++;
  var existClass = S.trim(realElement.getAttribute('class')), attributes = {
  'class': className + ' ' + existClass, 
  src: SPACER_GIF, 
  _ke_real_element: encodeURIComponent(html), 
  _ke_real_node_type: realElement.nodeType + '', 
  style: style, 
  align: visit24_155_1(realElement.getAttribute('align') || '')};
  _$jscoverage['/fake-objects.js'].lineData[158]++;
  if (visit25_158_1(attrs)) {
    _$jscoverage['/fake-objects.js'].lineData[159]++;
    delete attrs.width;
    _$jscoverage['/fake-objects.js'].lineData[160]++;
    delete attrs.height;
    _$jscoverage['/fake-objects.js'].lineData[161]++;
    S.mix(attributes, attrs, false);
  }
  _$jscoverage['/fake-objects.js'].lineData[164]++;
  if (visit26_164_1(realElementType)) {
    _$jscoverage['/fake-objects.js'].lineData[165]++;
    attributes._ke_real_element_type = realElementType;
  }
  _$jscoverage['/fake-objects.js'].lineData[167]++;
  if (visit27_167_1(isResizable)) {
    _$jscoverage['/fake-objects.js'].lineData[168]++;
    attributes._ke_resizable = '_ke_resizable';
  }
  _$jscoverage['/fake-objects.js'].lineData[170]++;
  return new HtmlParser.Tag('img', attributes);
}});
}};
});
