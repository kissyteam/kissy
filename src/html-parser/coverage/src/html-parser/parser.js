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
  _$jscoverage['/html-parser/parser.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[9] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[10] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[11] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[12] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[13] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[21] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[23] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[24] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[31] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[32] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[34] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[36] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[37] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[40] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[44] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[49] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[51] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[52] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[53] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[56] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[58] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[60] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[62] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[63] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[66] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[68] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[71] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[72] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[74] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[76] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[77] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[79] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[83] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[87] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[89] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[90] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[100] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[103] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[104] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[105] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[106] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[107] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[109] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[110] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[113] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[118] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[121] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[122] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[128] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[129] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[130] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[132] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[135] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[136] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[138] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[139] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[140] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[141] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[142] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[144] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[145] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[146] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[148] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[152] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[153] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[156] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[158] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[159] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[164] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[165] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[166] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[168] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[169] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[171] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[172] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[173] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[174] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[175] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[177] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[178] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[182] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[185] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[189] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[190] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[191] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[192] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[193] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[194] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[195] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[198] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[200] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[202] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[207] = 0;
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
  _$jscoverage['/html-parser/parser.js'].branchData['31'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['37'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['51'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['62'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['71'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['90'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['103'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['105'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['107'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['128'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['130'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['130'][2] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['130'][3] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['130'][4] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['135'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['139'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['141'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['141'][2] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['141'][3] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['141'][4] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['144'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['152'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['158'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['165'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['168'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['172'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['173'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['174'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['190'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['191'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['193'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['194'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['194'][2] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['198'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['199'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['199'][2] = new BranchData();
}
_$jscoverage['/html-parser/parser.js'].branchData['199'][2].init(351, 30, 'html.firstChild.nodeType === 3');
function visit274_199_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['199'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['199'][1].init(39, 70, 'html.firstChild.nodeType === 3 && !util.trim(html.firstChild.toHtml())');
function visit273_199_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['198'][1].init(309, 110, 'html.firstChild && html.firstChild.nodeType === 3 && !util.trim(html.firstChild.toHtml())');
function visit272_198_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['194'][2].init(26, 28, 'childNodes[j].nodeType === 3');
function visit271_194_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['194'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['194'][1].init(26, 66, 'childNodes[j].nodeType === 3 && !util.trim(childNodes[j].toHtml())');
function visit270_194_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['193'][1].init(77, 5, 'j < i');
function visit269_193_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['191'][1].init(18, 33, 'childNodes[i].nodeName === \'html\'');
function visit268_191_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['190'][1].init(290, 21, 'i < childNodes.length');
function visit267_190_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['174'][1].init(22, 33, 'childNodes[i].tagName === tagName');
function visit266_174_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['173'][1].init(30, 21, 'i < childNodes.length');
function visit265_173_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['172'][1].init(197, 10, 'childNodes');
function visit264_172_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['168'][1].init(76, 25, 'typeof level === \'number\'');
function visit263_168_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['165'][1].init(14, 11, 'level === 0');
function visit262_165_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['158'][1].init(783, 22, 'i < newChildren.length');
function visit261_158_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['152'][1].init(642, 24, 'holder.childNodes.length');
function visit260_152_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['144'][1].init(26, 24, 'holder.childNodes.length');
function visit259_144_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['141'][4].init(79, 16, 'c.nodeType === 1');
function visit258_141_4(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['141'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['141'][3].init(79, 36, 'c.nodeType === 1 && pDtd[c.nodeName]');
function visit257_141_3(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['141'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['141'][2].init(58, 16, 'c.nodeType === 3');
function visit256_141_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['141'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['141'][1].init(58, 58, 'c.nodeType === 3 || (c.nodeType === 1 && pDtd[c.nodeName])');
function visit255_141_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['139'][1].init(151, 21, 'i < childNodes.length');
function visit254_139_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['135'][1].init(385, 7, 'needFix');
function visit253_135_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['130'][4].init(71, 16, 'c.nodeType === 1');
function visit252_130_4(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['130'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['130'][3].init(71, 36, 'c.nodeType === 1 && pDtd[c.nodeName]');
function visit251_130_3(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['130'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['130'][2].init(50, 16, 'c.nodeType === 3');
function visit250_130_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['130'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['130'][1].init(50, 58, 'c.nodeType === 3 || (c.nodeType === 1 && pDtd[c.nodeName])');
function visit249_130_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['128'][1].init(151, 21, 'i < childNodes.length');
function visit248_128_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['107'][1].init(77, 27, 'fixes[i].tagName === \'body\'');
function visit247_107_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['105'][1].init(109, 16, 'i < fixes.length');
function visit246_105_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['103'][1].init(377, 32, 'bodyIndex !== sibling.length - 1');
function visit245_103_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['90'][1].init(93, 4, 'body');
function visit244_90_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['71'][1].init(703, 46, '/^(<!doctype|<html|<body)/i.test(originalHTML)');
function visit243_71_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['62'][1].init(467, 26, 'body && opts.autoParagraph');
function visit242_62_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['51'][1].init(184, 27, 'root.tagName !== \'document\'');
function visit241_51_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['37'][1].init(553, 10, 'opts || {}');
function visit240_37_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['31'][1].init(316, 38, '/^(<!doctype|<html|<body)/i.test(html)');
function visit239_31_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/html-parser/parser.js'].functionData[0]++;
  _$jscoverage['/html-parser/parser.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/html-parser/parser.js'].lineData[8]++;
  var dtd = require('./dtd');
  _$jscoverage['/html-parser/parser.js'].lineData[9]++;
  var Tag = require('./nodes/tag');
  _$jscoverage['/html-parser/parser.js'].lineData[10]++;
  var Fragment = require('./nodes/fragment');
  _$jscoverage['/html-parser/parser.js'].lineData[11]++;
  var Lexer = require('./lexer/lexer');
  _$jscoverage['/html-parser/parser.js'].lineData[12]++;
  var Document = require('./nodes/document');
  _$jscoverage['/html-parser/parser.js'].lineData[13]++;
  var Scanner = require('./scanner');
  _$jscoverage['/html-parser/parser.js'].lineData[21]++;
  function Parser(html, opts) {
    _$jscoverage['/html-parser/parser.js'].functionData[1]++;
    _$jscoverage['/html-parser/parser.js'].lineData[23]++;
    html = util.trim(html);
    _$jscoverage['/html-parser/parser.js'].lineData[24]++;
    this.originalHTML = html;
    _$jscoverage['/html-parser/parser.js'].lineData[31]++;
    if (visit239_31_1(/^(<!doctype|<html|<body)/i.test(html))) {
      _$jscoverage['/html-parser/parser.js'].lineData[32]++;
      html = '<document>' + html + '</document>';
    } else {
      _$jscoverage['/html-parser/parser.js'].lineData[34]++;
      html = '<body>' + html + '</body>';
    }
    _$jscoverage['/html-parser/parser.js'].lineData[36]++;
    this.lexer = new Lexer(html);
    _$jscoverage['/html-parser/parser.js'].lineData[37]++;
    this.opts = visit240_37_1(opts || {});
  }
  _$jscoverage['/html-parser/parser.js'].lineData[40]++;
  Parser.prototype = {
  constructor: Parser, 
  elements: function() {
  _$jscoverage['/html-parser/parser.js'].functionData[2]++;
  _$jscoverage['/html-parser/parser.js'].lineData[44]++;
  var root, doc, lexer = this.lexer, opts = this.opts;
  _$jscoverage['/html-parser/parser.js'].lineData[49]++;
  doc = root = lexer.nextNode();
  _$jscoverage['/html-parser/parser.js'].lineData[51]++;
  if (visit241_51_1(root.tagName !== 'document')) {
    _$jscoverage['/html-parser/parser.js'].lineData[52]++;
    doc = new Document();
    _$jscoverage['/html-parser/parser.js'].lineData[53]++;
    doc.appendChild(root);
  }
  _$jscoverage['/html-parser/parser.js'].lineData[56]++;
  doc.nodeType = 9;
  _$jscoverage['/html-parser/parser.js'].lineData[58]++;
  Scanner.getScanner('div').scan(root, lexer, opts);
  _$jscoverage['/html-parser/parser.js'].lineData[60]++;
  var body = fixBody(doc);
  _$jscoverage['/html-parser/parser.js'].lineData[62]++;
  if (visit242_62_1(body && opts.autoParagraph)) {
    _$jscoverage['/html-parser/parser.js'].lineData[63]++;
    autoParagraph(body);
  }
  _$jscoverage['/html-parser/parser.js'].lineData[66]++;
  postProcess(doc);
  _$jscoverage['/html-parser/parser.js'].lineData[68]++;
  var originalHTML = this.originalHTML, fragment = new Fragment(), cs;
  _$jscoverage['/html-parser/parser.js'].lineData[71]++;
  if (visit243_71_1(/^(<!doctype|<html|<body)/i.test(originalHTML))) {
    _$jscoverage['/html-parser/parser.js'].lineData[72]++;
    cs = doc.childNodes;
  } else {
    _$jscoverage['/html-parser/parser.js'].lineData[74]++;
    cs = body.childNodes;
  }
  _$jscoverage['/html-parser/parser.js'].lineData[76]++;
  util.each(cs, function(c) {
  _$jscoverage['/html-parser/parser.js'].functionData[3]++;
  _$jscoverage['/html-parser/parser.js'].lineData[77]++;
  fragment.appendChild(c);
});
  _$jscoverage['/html-parser/parser.js'].lineData[79]++;
  return fragment;
}, 
  parse: function() {
  _$jscoverage['/html-parser/parser.js'].functionData[4]++;
  _$jscoverage['/html-parser/parser.js'].lineData[83]++;
  return this.elements();
}};
  _$jscoverage['/html-parser/parser.js'].lineData[87]++;
  function fixBody(doc) {
    _$jscoverage['/html-parser/parser.js'].functionData[5]++;
    _$jscoverage['/html-parser/parser.js'].lineData[89]++;
    var body = findTagWithName(doc, 'body', 3);
    _$jscoverage['/html-parser/parser.js'].lineData[90]++;
    if (visit244_90_1(body)) {
      _$jscoverage['/html-parser/parser.js'].lineData[100]++;
      var parent = body.parentNode, sibling = parent.childNodes, bodyIndex = util.indexOf(body, sibling);
      _$jscoverage['/html-parser/parser.js'].lineData[103]++;
      if (visit245_103_1(bodyIndex !== sibling.length - 1)) {
        _$jscoverage['/html-parser/parser.js'].lineData[104]++;
        var fixes = sibling.slice(bodyIndex + 1, sibling.length);
        _$jscoverage['/html-parser/parser.js'].lineData[105]++;
        for (var i = 0; visit246_105_1(i < fixes.length); i++) {
          _$jscoverage['/html-parser/parser.js'].lineData[106]++;
          parent.removeChild(fixes[i]);
          _$jscoverage['/html-parser/parser.js'].lineData[107]++;
          if (visit247_107_1(fixes[i].tagName === 'body')) {
            _$jscoverage['/html-parser/parser.js'].lineData[109]++;
            util.each(fixes[i].childNodes, function(c) {
  _$jscoverage['/html-parser/parser.js'].functionData[6]++;
  _$jscoverage['/html-parser/parser.js'].lineData[110]++;
  body.appendChild(c);
});
          } else {
            _$jscoverage['/html-parser/parser.js'].lineData[113]++;
            body.appendChild(fixes[i]);
          }
        }
      }
    }
    _$jscoverage['/html-parser/parser.js'].lineData[118]++;
    return body;
  }
  _$jscoverage['/html-parser/parser.js'].lineData[121]++;
  function autoParagraph(doc) {
    _$jscoverage['/html-parser/parser.js'].functionData[7]++;
    _$jscoverage['/html-parser/parser.js'].lineData[122]++;
    var childNodes = doc.childNodes, c, i, pDtd = dtd.p, needFix = 0;
    _$jscoverage['/html-parser/parser.js'].lineData[128]++;
    for (i = 0; visit248_128_1(i < childNodes.length); i++) {
      _$jscoverage['/html-parser/parser.js'].lineData[129]++;
      c = childNodes[i];
      _$jscoverage['/html-parser/parser.js'].lineData[130]++;
      if (visit249_130_1(visit250_130_2(c.nodeType === 3) || (visit251_130_3(visit252_130_4(c.nodeType === 1) && pDtd[c.nodeName])))) {
        _$jscoverage['/html-parser/parser.js'].lineData[131]++;
        needFix = 1;
        _$jscoverage['/html-parser/parser.js'].lineData[132]++;
        break;
      }
    }
    _$jscoverage['/html-parser/parser.js'].lineData[135]++;
    if (visit253_135_1(needFix)) {
      _$jscoverage['/html-parser/parser.js'].lineData[136]++;
      var newChildren = [], holder = new Tag();
      _$jscoverage['/html-parser/parser.js'].lineData[138]++;
      holder.nodeName = holder.tagName = 'p';
      _$jscoverage['/html-parser/parser.js'].lineData[139]++;
      for (i = 0; visit254_139_1(i < childNodes.length); i++) {
        _$jscoverage['/html-parser/parser.js'].lineData[140]++;
        c = childNodes[i];
        _$jscoverage['/html-parser/parser.js'].lineData[141]++;
        if (visit255_141_1(visit256_141_2(c.nodeType === 3) || (visit257_141_3(visit258_141_4(c.nodeType === 1) && pDtd[c.nodeName])))) {
          _$jscoverage['/html-parser/parser.js'].lineData[142]++;
          holder.appendChild(c);
        } else {
          _$jscoverage['/html-parser/parser.js'].lineData[144]++;
          if (visit259_144_1(holder.childNodes.length)) {
            _$jscoverage['/html-parser/parser.js'].lineData[145]++;
            newChildren.push(holder);
            _$jscoverage['/html-parser/parser.js'].lineData[146]++;
            holder = holder.clone();
          }
          _$jscoverage['/html-parser/parser.js'].lineData[148]++;
          newChildren.push(c);
        }
      }
      _$jscoverage['/html-parser/parser.js'].lineData[152]++;
      if (visit260_152_1(holder.childNodes.length)) {
        _$jscoverage['/html-parser/parser.js'].lineData[153]++;
        newChildren.push(holder);
      }
      _$jscoverage['/html-parser/parser.js'].lineData[156]++;
      doc.empty();
      _$jscoverage['/html-parser/parser.js'].lineData[158]++;
      for (i = 0; visit261_158_1(i < newChildren.length); i++) {
        _$jscoverage['/html-parser/parser.js'].lineData[159]++;
        doc.appendChild(newChildren[i]);
      }
    }
  }
  _$jscoverage['/html-parser/parser.js'].lineData[164]++;
  function findTagWithName(root, tagName, level) {
    _$jscoverage['/html-parser/parser.js'].functionData[8]++;
    _$jscoverage['/html-parser/parser.js'].lineData[165]++;
    if (visit262_165_1(level === 0)) {
      _$jscoverage['/html-parser/parser.js'].lineData[166]++;
      return 0;
    }
    _$jscoverage['/html-parser/parser.js'].lineData[168]++;
    if (visit263_168_1(typeof level === 'number')) {
      _$jscoverage['/html-parser/parser.js'].lineData[169]++;
      level--;
    }
    _$jscoverage['/html-parser/parser.js'].lineData[171]++;
    var r, childNodes = root.childNodes;
    _$jscoverage['/html-parser/parser.js'].lineData[172]++;
    if (visit264_172_1(childNodes)) {
      _$jscoverage['/html-parser/parser.js'].lineData[173]++;
      for (var i = 0; visit265_173_1(i < childNodes.length); i++) {
        _$jscoverage['/html-parser/parser.js'].lineData[174]++;
        if (visit266_174_1(childNodes[i].tagName === tagName)) {
          _$jscoverage['/html-parser/parser.js'].lineData[175]++;
          return childNodes[i];
        }
        _$jscoverage['/html-parser/parser.js'].lineData[177]++;
        if ((r = findTagWithName(childNodes[i], tagName, level))) {
          _$jscoverage['/html-parser/parser.js'].lineData[178]++;
          return r;
        }
      }
    }
    _$jscoverage['/html-parser/parser.js'].lineData[182]++;
    return 0;
  }
  _$jscoverage['/html-parser/parser.js'].lineData[185]++;
  function postProcess(doc) {
    _$jscoverage['/html-parser/parser.js'].functionData[9]++;
    _$jscoverage['/html-parser/parser.js'].lineData[189]++;
    var childNodes = [].concat(doc.childNodes);
    _$jscoverage['/html-parser/parser.js'].lineData[190]++;
    for (var i = 0; visit267_190_1(i < childNodes.length); i++) {
      _$jscoverage['/html-parser/parser.js'].lineData[191]++;
      if (visit268_191_1(childNodes[i].nodeName === 'html')) {
        _$jscoverage['/html-parser/parser.js'].lineData[192]++;
        var html = childNodes[i];
        _$jscoverage['/html-parser/parser.js'].lineData[193]++;
        for (var j = 0; visit269_193_1(j < i); j++) {
          _$jscoverage['/html-parser/parser.js'].lineData[194]++;
          if (visit270_194_1(visit271_194_2(childNodes[j].nodeType === 3) && !util.trim(childNodes[j].toHtml()))) {
            _$jscoverage['/html-parser/parser.js'].lineData[195]++;
            doc.removeChild(childNodes[j]);
          }
        }
        _$jscoverage['/html-parser/parser.js'].lineData[198]++;
        while (visit272_198_1(html.firstChild && visit273_199_1(visit274_199_2(html.firstChild.nodeType === 3) && !util.trim(html.firstChild.toHtml())))) {
          _$jscoverage['/html-parser/parser.js'].lineData[200]++;
          html.removeChild(html.firstChild);
        }
        _$jscoverage['/html-parser/parser.js'].lineData[202]++;
        break;
      }
    }
  }
  _$jscoverage['/html-parser/parser.js'].lineData[207]++;
  return Parser;
});
