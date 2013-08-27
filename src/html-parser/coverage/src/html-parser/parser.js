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
if (! _$jscoverage['/html-parser/parser.js']) {
  _$jscoverage['/html-parser/parser.js'] = {};
  _$jscoverage['/html-parser/parser.js'].lineData = [];
  _$jscoverage['/html-parser/parser.js'].lineData[5] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[9] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[10] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[17] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[18] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[20] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[22] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[23] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[26] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[31] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[36] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[38] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[39] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[40] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[43] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[45] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[47] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[49] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[50] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[53] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[55] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[58] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[59] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[61] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[63] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[64] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[66] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[70] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[74] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[76] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[77] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[87] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[90] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[91] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[92] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[93] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[94] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[95] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[96] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[99] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[104] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[108] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[109] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[115] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[116] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[117] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[118] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[122] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[123] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[125] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[126] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[127] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[128] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[129] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[132] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[133] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[135] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[139] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[140] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[143] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[145] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[146] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[152] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[153] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[154] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[155] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[157] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[158] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[159] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[160] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[161] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[163] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[164] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[168] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[171] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[175] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[176] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[177] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[178] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[179] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[180] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[181] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[184] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[187] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[189] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[194] = 0;
}
if (! _$jscoverage['/html-parser/parser.js'].functionData) {
  _$jscoverage['/html-parser/parser.js'].functionData = [];
  _$jscoverage['/html-parser/parser.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/parser.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/parser.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/parser.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/parser.js'].functionData[4] = 0;
  _$jscoverage['/html-parser/parser.js'].functionData[5] = 0;
  _$jscoverage['/html-parser/parser.js'].functionData[6] = 0;
  _$jscoverage['/html-parser/parser.js'].functionData[7] = 0;
  _$jscoverage['/html-parser/parser.js'].functionData[8] = 0;
  _$jscoverage['/html-parser/parser.js'].functionData[9] = 0;
}
if (! _$jscoverage['/html-parser/parser.js'].branchData) {
  _$jscoverage['/html-parser/parser.js'].branchData = {};
  _$jscoverage['/html-parser/parser.js'].branchData['17'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['23'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['38'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['49'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['58'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['77'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['90'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['92'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['94'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['115'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['117'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['117'][2] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['117'][3] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['117'][4] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['122'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['126'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['128'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['128'][2] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['128'][3] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['128'][4] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['131'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['139'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['145'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['153'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['154'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['158'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['159'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['160'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['163'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['176'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['177'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['179'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['180'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['180'][2] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['184'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['185'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['185'][2] = new BranchData();
}
_$jscoverage['/html-parser/parser.js'].branchData['185'][2].init(347, 29, 'html.firstChild.nodeType == 3');
function visit264_185_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['185'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['185'][1].init(39, 87, 'html.firstChild.nodeType == 3 && !S.trim(html.firstChild.toHtml())');
function visit263_185_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['184'][1].init(305, 127, 'html.firstChild && html.firstChild.nodeType == 3 && !S.trim(html.firstChild.toHtml())');
function visit262_184_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['180'][2].init(26, 27, 'childNodes[j].nodeType == 3');
function visit261_180_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['180'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['180'][1].init(26, 62, 'childNodes[j].nodeType == 3 && !S.trim(childNodes[j].toHtml())');
function visit260_180_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['179'][1].init(77, 5, 'j < i');
function visit259_179_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['177'][1].init(18, 32, 'childNodes[i].nodeName == "html"');
function visit258_177_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['176'][1].init(290, 21, 'i < childNodes.length');
function visit257_176_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['163'][1].init(142, 50, 'r = findTagWithName(childNodes[i], tagName, level)');
function visit256_163_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['160'][1].init(22, 33, 'childNodes[i].tagName === tagName');
function visit255_160_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['159'][1].init(30, 21, 'i < childNodes.length');
function visit254_159_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['158'][1].init(169, 10, 'childNodes');
function visit253_158_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['154'][1].init(50, 23, 'typeof level === \'number\'');
function visit252_154_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['153'][1].init(14, 11, 'level === 0');
function visit251_153_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['145'][1].init(781, 22, 'i < newChildren.length');
function visit250_145_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['139'][1].init(640, 24, 'holder.childNodes.length');
function visit249_139_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['131'][1].init(26, 24, 'holder.childNodes.length');
function visit248_131_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['128'][4].init(78, 15, 'c.nodeType == 1');
function visit247_128_4(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['128'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['128'][3].init(78, 35, 'c.nodeType == 1 && pDtd[c.nodeName]');
function visit246_128_3(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['128'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['128'][2].init(58, 15, 'c.nodeType == 3');
function visit245_128_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['128'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['128'][1].init(58, 56, 'c.nodeType == 3 || (c.nodeType == 1 && pDtd[c.nodeName])');
function visit244_128_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['126'][1].init(151, 21, 'i < childNodes.length');
function visit243_126_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['122'][1].init(386, 7, 'needFix');
function visit242_122_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['117'][4].init(70, 15, 'c.nodeType == 1');
function visit241_117_4(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['117'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['117'][3].init(70, 35, 'c.nodeType == 1 && pDtd[c.nodeName]');
function visit240_117_3(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['117'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['117'][2].init(50, 15, 'c.nodeType == 3');
function visit239_117_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['117'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['117'][1].init(50, 56, 'c.nodeType == 3 || (c.nodeType == 1 && pDtd[c.nodeName])');
function visit238_117_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['115'][1].init(154, 21, 'i < childNodes.length');
function visit237_115_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['94'][1].init(77, 26, 'fixes[i].tagName == "body"');
function visit236_94_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['92'][1].init(109, 16, 'i < fixes.length');
function visit235_92_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['90'][1].init(374, 31, 'bodyIndex != silbing.length - 1');
function visit234_90_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['77'][1].init(93, 4, 'body');
function visit233_77_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['58'][1].init(706, 46, '/^(<!doctype|<html|<body)/i.test(originalHTML)');
function visit232_58_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['49'][1].init(466, 29, 'body && opts[\'autoParagraph\']');
function visit231_49_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['38'][1].init(184, 26, 'root.tagName != \'document\'');
function visit230_38_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['23'][1].init(550, 10, 'opts || {}');
function visit229_23_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['17'][1].init(313, 38, '/^(<!doctype|<html|<body)/i.test(html)');
function visit228_17_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].lineData[5]++;
KISSY.add("html-parser/parser", function(S, dtd, Tag, Fragment, Cursor, Lexer, Document, Scanner) {
  _$jscoverage['/html-parser/parser.js'].functionData[0]++;
  _$jscoverage['/html-parser/parser.js'].lineData[7]++;
  function Parser(html, opts) {
    _$jscoverage['/html-parser/parser.js'].functionData[1]++;
    _$jscoverage['/html-parser/parser.js'].lineData[9]++;
    html = S.trim(html);
    _$jscoverage['/html-parser/parser.js'].lineData[10]++;
    this.originalHTML = html;
    _$jscoverage['/html-parser/parser.js'].lineData[17]++;
    if (visit228_17_1(/^(<!doctype|<html|<body)/i.test(html))) {
      _$jscoverage['/html-parser/parser.js'].lineData[18]++;
      html = "<document>" + html + "</document>";
    } else {
      _$jscoverage['/html-parser/parser.js'].lineData[20]++;
      html = "<body>" + html + "</body>";
    }
    _$jscoverage['/html-parser/parser.js'].lineData[22]++;
    this.lexer = new Lexer(html);
    _$jscoverage['/html-parser/parser.js'].lineData[23]++;
    this.opts = visit229_23_1(opts || {});
  }
  _$jscoverage['/html-parser/parser.js'].lineData[26]++;
  Parser.prototype = {
  constructor: Parser, 
  elements: function() {
  _$jscoverage['/html-parser/parser.js'].functionData[2]++;
  _$jscoverage['/html-parser/parser.js'].lineData[31]++;
  var root, doc, lexer = this.lexer, opts = this.opts;
  _$jscoverage['/html-parser/parser.js'].lineData[36]++;
  doc = root = lexer.nextNode();
  _$jscoverage['/html-parser/parser.js'].lineData[38]++;
  if (visit230_38_1(root.tagName != 'document')) {
    _$jscoverage['/html-parser/parser.js'].lineData[39]++;
    doc = new Document();
    _$jscoverage['/html-parser/parser.js'].lineData[40]++;
    doc.appendChild(root);
  }
  _$jscoverage['/html-parser/parser.js'].lineData[43]++;
  doc.nodeType = 9;
  _$jscoverage['/html-parser/parser.js'].lineData[45]++;
  Scanner.getScanner("div").scan(root, lexer, opts);
  _$jscoverage['/html-parser/parser.js'].lineData[47]++;
  var body = fixBody(doc);
  _$jscoverage['/html-parser/parser.js'].lineData[49]++;
  if (visit231_49_1(body && opts['autoParagraph'])) {
    _$jscoverage['/html-parser/parser.js'].lineData[50]++;
    autoParagraph(body);
  }
  _$jscoverage['/html-parser/parser.js'].lineData[53]++;
  post_process(doc);
  _$jscoverage['/html-parser/parser.js'].lineData[55]++;
  var originalHTML = this.originalHTML, fragment = new Fragment(), cs;
  _$jscoverage['/html-parser/parser.js'].lineData[58]++;
  if (visit232_58_1(/^(<!doctype|<html|<body)/i.test(originalHTML))) {
    _$jscoverage['/html-parser/parser.js'].lineData[59]++;
    cs = doc.childNodes;
  } else {
    _$jscoverage['/html-parser/parser.js'].lineData[61]++;
    cs = body.childNodes;
  }
  _$jscoverage['/html-parser/parser.js'].lineData[63]++;
  S.each(cs, function(c) {
  _$jscoverage['/html-parser/parser.js'].functionData[3]++;
  _$jscoverage['/html-parser/parser.js'].lineData[64]++;
  fragment.appendChild(c);
});
  _$jscoverage['/html-parser/parser.js'].lineData[66]++;
  return fragment;
}, 
  parse: function() {
  _$jscoverage['/html-parser/parser.js'].functionData[4]++;
  _$jscoverage['/html-parser/parser.js'].lineData[70]++;
  return this.elements();
}};
  _$jscoverage['/html-parser/parser.js'].lineData[74]++;
  function fixBody(doc) {
    _$jscoverage['/html-parser/parser.js'].functionData[5]++;
    _$jscoverage['/html-parser/parser.js'].lineData[76]++;
    var body = findTagWithName(doc, "body", 3);
    _$jscoverage['/html-parser/parser.js'].lineData[77]++;
    if (visit233_77_1(body)) {
      _$jscoverage['/html-parser/parser.js'].lineData[87]++;
      var parent = body.parentNode, silbing = parent.childNodes, bodyIndex = S.indexOf(body, silbing);
      _$jscoverage['/html-parser/parser.js'].lineData[90]++;
      if (visit234_90_1(bodyIndex != silbing.length - 1)) {
        _$jscoverage['/html-parser/parser.js'].lineData[91]++;
        var fixes = silbing.slice(bodyIndex + 1, silbing.length);
        _$jscoverage['/html-parser/parser.js'].lineData[92]++;
        for (var i = 0; visit235_92_1(i < fixes.length); i++) {
          _$jscoverage['/html-parser/parser.js'].lineData[93]++;
          parent.removeChild(fixes[i]);
          _$jscoverage['/html-parser/parser.js'].lineData[94]++;
          if (visit236_94_1(fixes[i].tagName == "body")) {
            _$jscoverage['/html-parser/parser.js'].lineData[95]++;
            S.each(fixes[i].childNodes, function(c) {
  _$jscoverage['/html-parser/parser.js'].functionData[6]++;
  _$jscoverage['/html-parser/parser.js'].lineData[96]++;
  body.appendChild(c);
});
          } else {
            _$jscoverage['/html-parser/parser.js'].lineData[99]++;
            body.appendChild(fixes[i]);
          }
        }
      }
    }
    _$jscoverage['/html-parser/parser.js'].lineData[104]++;
    return body;
  }
  _$jscoverage['/html-parser/parser.js'].lineData[108]++;
  function autoParagraph(doc) {
    _$jscoverage['/html-parser/parser.js'].functionData[7]++;
    _$jscoverage['/html-parser/parser.js'].lineData[109]++;
    var childNodes = doc.childNodes, c, i, pDtd = dtd['p'], needFix = 0;
    _$jscoverage['/html-parser/parser.js'].lineData[115]++;
    for (i = 0; visit237_115_1(i < childNodes.length); i++) {
      _$jscoverage['/html-parser/parser.js'].lineData[116]++;
      c = childNodes[i];
      _$jscoverage['/html-parser/parser.js'].lineData[117]++;
      if (visit238_117_1(visit239_117_2(c.nodeType == 3) || (visit240_117_3(visit241_117_4(c.nodeType == 1) && pDtd[c.nodeName])))) {
        _$jscoverage['/html-parser/parser.js'].lineData[118]++;
        needFix = 1;
        _$jscoverage['/html-parser/parser.js'].lineData[119]++;
        break;
      }
    }
    _$jscoverage['/html-parser/parser.js'].lineData[122]++;
    if (visit242_122_1(needFix)) {
      _$jscoverage['/html-parser/parser.js'].lineData[123]++;
      var newChildren = [], holder = new Tag();
      _$jscoverage['/html-parser/parser.js'].lineData[125]++;
      holder.nodeName = holder.tagName = "p";
      _$jscoverage['/html-parser/parser.js'].lineData[126]++;
      for (i = 0; visit243_126_1(i < childNodes.length); i++) {
        _$jscoverage['/html-parser/parser.js'].lineData[127]++;
        c = childNodes[i];
        _$jscoverage['/html-parser/parser.js'].lineData[128]++;
        if (visit244_128_1(visit245_128_2(c.nodeType == 3) || (visit246_128_3(visit247_128_4(c.nodeType == 1) && pDtd[c.nodeName])))) {
          _$jscoverage['/html-parser/parser.js'].lineData[129]++;
          holder.appendChild(c);
        } else {
          _$jscoverage['/html-parser/parser.js'].lineData[131]++;
          if (visit248_131_1(holder.childNodes.length)) {
            _$jscoverage['/html-parser/parser.js'].lineData[132]++;
            newChildren.push(holder);
            _$jscoverage['/html-parser/parser.js'].lineData[133]++;
            holder = holder.clone();
          }
          _$jscoverage['/html-parser/parser.js'].lineData[135]++;
          newChildren.push(c);
        }
      }
      _$jscoverage['/html-parser/parser.js'].lineData[139]++;
      if (visit249_139_1(holder.childNodes.length)) {
        _$jscoverage['/html-parser/parser.js'].lineData[140]++;
        newChildren.push(holder);
      }
      _$jscoverage['/html-parser/parser.js'].lineData[143]++;
      doc.empty();
      _$jscoverage['/html-parser/parser.js'].lineData[145]++;
      for (i = 0; visit250_145_1(i < newChildren.length); i++) {
        _$jscoverage['/html-parser/parser.js'].lineData[146]++;
        doc.appendChild(newChildren[i]);
      }
    }
  }
  _$jscoverage['/html-parser/parser.js'].lineData[152]++;
  function findTagWithName(root, tagName, level) {
    _$jscoverage['/html-parser/parser.js'].functionData[8]++;
    _$jscoverage['/html-parser/parser.js'].lineData[153]++;
    if (visit251_153_1(level === 0)) 
      return 0;
    _$jscoverage['/html-parser/parser.js'].lineData[154]++;
    if (visit252_154_1(typeof level === 'number')) {
      _$jscoverage['/html-parser/parser.js'].lineData[155]++;
      level--;
    }
    _$jscoverage['/html-parser/parser.js'].lineData[157]++;
    var r, childNodes = root.childNodes;
    _$jscoverage['/html-parser/parser.js'].lineData[158]++;
    if (visit253_158_1(childNodes)) {
      _$jscoverage['/html-parser/parser.js'].lineData[159]++;
      for (var i = 0; visit254_159_1(i < childNodes.length); i++) {
        _$jscoverage['/html-parser/parser.js'].lineData[160]++;
        if (visit255_160_1(childNodes[i].tagName === tagName)) {
          _$jscoverage['/html-parser/parser.js'].lineData[161]++;
          return childNodes[i];
        }
        _$jscoverage['/html-parser/parser.js'].lineData[163]++;
        if (visit256_163_1(r = findTagWithName(childNodes[i], tagName, level))) {
          _$jscoverage['/html-parser/parser.js'].lineData[164]++;
          return r;
        }
      }
    }
    _$jscoverage['/html-parser/parser.js'].lineData[168]++;
    return 0;
  }
  _$jscoverage['/html-parser/parser.js'].lineData[171]++;
  function post_process(doc) {
    _$jscoverage['/html-parser/parser.js'].functionData[9]++;
    _$jscoverage['/html-parser/parser.js'].lineData[175]++;
    var childNodes = [].concat(doc.childNodes);
    _$jscoverage['/html-parser/parser.js'].lineData[176]++;
    for (var i = 0; visit257_176_1(i < childNodes.length); i++) {
      _$jscoverage['/html-parser/parser.js'].lineData[177]++;
      if (visit258_177_1(childNodes[i].nodeName == "html")) {
        _$jscoverage['/html-parser/parser.js'].lineData[178]++;
        var html = childNodes[i];
        _$jscoverage['/html-parser/parser.js'].lineData[179]++;
        for (var j = 0; visit259_179_1(j < i); j++) {
          _$jscoverage['/html-parser/parser.js'].lineData[180]++;
          if (visit260_180_1(visit261_180_2(childNodes[j].nodeType == 3) && !S.trim(childNodes[j].toHtml()))) {
            _$jscoverage['/html-parser/parser.js'].lineData[181]++;
            doc.removeChild(childNodes[j]);
          }
        }
        _$jscoverage['/html-parser/parser.js'].lineData[184]++;
        while (visit262_184_1(html.firstChild && visit263_185_1(visit264_185_2(html.firstChild.nodeType == 3) && !S.trim(html.firstChild.toHtml())))) {
          _$jscoverage['/html-parser/parser.js'].lineData[187]++;
          html.removeChild(html.firstChild);
        }
        _$jscoverage['/html-parser/parser.js'].lineData[189]++;
        break;
      }
    }
  }
  _$jscoverage['/html-parser/parser.js'].lineData[194]++;
  return Parser;
}, {
  requires: ['./dtd', './nodes/tag', './nodes/fragment', './lexer/cursor', './lexer/lexer', './nodes/document', './scanner']});
