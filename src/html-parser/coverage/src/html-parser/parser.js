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
  _$jscoverage['/html-parser/parser.js'].lineData[20] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[22] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[23] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[30] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[31] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[33] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[35] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[36] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[39] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[43] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[48] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[50] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[51] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[52] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[55] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[57] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[59] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[61] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[62] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[65] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[67] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[70] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[71] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[73] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[75] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[76] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[78] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[82] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[86] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[88] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[89] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[99] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[102] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[103] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[104] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[105] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[106] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[108] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[109] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[112] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[117] = 0;
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
  _$jscoverage['/html-parser/parser.js'].lineData[165] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[166] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[167] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[169] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[170] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[172] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[173] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[174] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[175] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[176] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[178] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[179] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[183] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[186] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[190] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[191] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[192] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[193] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[194] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[195] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[196] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[199] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[201] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[203] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[208] = 0;
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
  _$jscoverage['/html-parser/parser.js'].branchData['30'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['36'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['50'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['61'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['70'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['89'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['102'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['104'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['106'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['106'][1] = new BranchData();
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
  _$jscoverage['/html-parser/parser.js'].branchData['166'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['169'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['173'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['174'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['175'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['191'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['192'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['194'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['195'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['195'][2] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['199'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['200'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['200'][2] = new BranchData();
}
_$jscoverage['/html-parser/parser.js'].branchData['200'][2].init(340, 30, 'html.firstChild.nodeType === 3');
function visit275_200_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['200'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['200'][1].init(38, 67, 'html.firstChild.nodeType === 3 && !S.trim(html.firstChild.toHtml())');
function visit274_200_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['199'][1].init(299, 106, 'html.firstChild && html.firstChild.nodeType === 3 && !S.trim(html.firstChild.toHtml())');
function visit273_199_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['195'][2].init(25, 28, 'childNodes[j].nodeType === 3');
function visit272_195_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['195'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['195'][1].init(25, 63, 'childNodes[j].nodeType === 3 && !S.trim(childNodes[j].toHtml())');
function visit271_195_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['194'][1].init(75, 5, 'j < i');
function visit270_194_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['192'][1].init(17, 33, 'childNodes[i].nodeName === \'html\'');
function visit269_192_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['191'][1].init(285, 21, 'i < childNodes.length');
function visit268_191_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['175'][1].init(21, 33, 'childNodes[i].tagName === tagName');
function visit267_175_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['174'][1].init(29, 21, 'i < childNodes.length');
function visit266_174_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['173'][1].init(189, 10, 'childNodes');
function visit265_173_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['169'][1].init(72, 25, 'typeof level === \'number\'');
function visit264_169_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['166'][1].init(13, 11, 'level === 0');
function visit263_166_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['158'][1].init(760, 22, 'i < newChildren.length');
function visit262_158_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['152'][1].init(625, 24, 'holder.childNodes.length');
function visit261_152_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['144'][1].init(25, 24, 'holder.childNodes.length');
function visit260_144_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['141'][4].init(77, 16, 'c.nodeType === 1');
function visit259_141_4(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['141'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['141'][3].init(77, 36, 'c.nodeType === 1 && pDtd[c.nodeName]');
function visit258_141_3(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['141'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['141'][2].init(56, 16, 'c.nodeType === 3');
function visit257_141_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['141'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['141'][1].init(56, 58, 'c.nodeType === 3 || (c.nodeType === 1 && pDtd[c.nodeName])');
function visit256_141_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['139'][1].init(147, 21, 'i < childNodes.length');
function visit255_139_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['135'][1].init(371, 7, 'needFix');
function visit254_135_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['130'][4].init(69, 16, 'c.nodeType === 1');
function visit253_130_4(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['130'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['130'][3].init(69, 36, 'c.nodeType === 1 && pDtd[c.nodeName]');
function visit252_130_3(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['130'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['130'][2].init(48, 16, 'c.nodeType === 3');
function visit251_130_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['130'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['130'][1].init(48, 58, 'c.nodeType === 3 || (c.nodeType === 1 && pDtd[c.nodeName])');
function visit250_130_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['128'][1].init(144, 21, 'i < childNodes.length');
function visit249_128_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['106'][1].init(75, 27, 'fixes[i].tagName === \'body\'');
function visit248_106_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['104'][1].init(107, 16, 'i < fixes.length');
function visit247_104_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['102'][1].init(361, 32, 'bodyIndex !== silbing.length - 1');
function visit246_102_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['89'][1].init(90, 4, 'body');
function visit245_89_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['70'][1].init(675, 46, '/^(<!doctype|<html|<body)/i.test(originalHTML)');
function visit244_70_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['61'][1].init(448, 26, 'body && opts.autoParagraph');
function visit243_61_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['50'][1].init(176, 27, 'root.tagName !== \'document\'');
function visit242_50_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['36'][1].init(534, 10, 'opts || {}');
function visit241_36_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['30'][1].init(303, 38, '/^(<!doctype|<html|<body)/i.test(html)');
function visit240_30_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/html-parser/parser.js'].functionData[0]++;
  _$jscoverage['/html-parser/parser.js'].lineData[7]++;
  var dtd = require('./dtd');
  _$jscoverage['/html-parser/parser.js'].lineData[8]++;
  var Tag = require('./nodes/tag');
  _$jscoverage['/html-parser/parser.js'].lineData[9]++;
  var Fragment = require('./nodes/fragment');
  _$jscoverage['/html-parser/parser.js'].lineData[10]++;
  var Lexer = require('./lexer/lexer');
  _$jscoverage['/html-parser/parser.js'].lineData[11]++;
  var Document = require('./nodes/document');
  _$jscoverage['/html-parser/parser.js'].lineData[12]++;
  var Scanner = require('./scanner');
  _$jscoverage['/html-parser/parser.js'].lineData[20]++;
  function Parser(html, opts) {
    _$jscoverage['/html-parser/parser.js'].functionData[1]++;
    _$jscoverage['/html-parser/parser.js'].lineData[22]++;
    html = S.trim(html);
    _$jscoverage['/html-parser/parser.js'].lineData[23]++;
    this.originalHTML = html;
    _$jscoverage['/html-parser/parser.js'].lineData[30]++;
    if (visit240_30_1(/^(<!doctype|<html|<body)/i.test(html))) {
      _$jscoverage['/html-parser/parser.js'].lineData[31]++;
      html = '<document>' + html + '</document>';
    } else {
      _$jscoverage['/html-parser/parser.js'].lineData[33]++;
      html = '<body>' + html + '</body>';
    }
    _$jscoverage['/html-parser/parser.js'].lineData[35]++;
    this.lexer = new Lexer(html);
    _$jscoverage['/html-parser/parser.js'].lineData[36]++;
    this.opts = visit241_36_1(opts || {});
  }
  _$jscoverage['/html-parser/parser.js'].lineData[39]++;
  Parser.prototype = {
  constructor: Parser, 
  elements: function() {
  _$jscoverage['/html-parser/parser.js'].functionData[2]++;
  _$jscoverage['/html-parser/parser.js'].lineData[43]++;
  var root, doc, lexer = this.lexer, opts = this.opts;
  _$jscoverage['/html-parser/parser.js'].lineData[48]++;
  doc = root = lexer.nextNode();
  _$jscoverage['/html-parser/parser.js'].lineData[50]++;
  if (visit242_50_1(root.tagName !== 'document')) {
    _$jscoverage['/html-parser/parser.js'].lineData[51]++;
    doc = new Document();
    _$jscoverage['/html-parser/parser.js'].lineData[52]++;
    doc.appendChild(root);
  }
  _$jscoverage['/html-parser/parser.js'].lineData[55]++;
  doc.nodeType = 9;
  _$jscoverage['/html-parser/parser.js'].lineData[57]++;
  Scanner.getScanner('div').scan(root, lexer, opts);
  _$jscoverage['/html-parser/parser.js'].lineData[59]++;
  var body = fixBody(doc);
  _$jscoverage['/html-parser/parser.js'].lineData[61]++;
  if (visit243_61_1(body && opts.autoParagraph)) {
    _$jscoverage['/html-parser/parser.js'].lineData[62]++;
    autoParagraph(body);
  }
  _$jscoverage['/html-parser/parser.js'].lineData[65]++;
  postProcess(doc);
  _$jscoverage['/html-parser/parser.js'].lineData[67]++;
  var originalHTML = this.originalHTML, fragment = new Fragment(), cs;
  _$jscoverage['/html-parser/parser.js'].lineData[70]++;
  if (visit244_70_1(/^(<!doctype|<html|<body)/i.test(originalHTML))) {
    _$jscoverage['/html-parser/parser.js'].lineData[71]++;
    cs = doc.childNodes;
  } else {
    _$jscoverage['/html-parser/parser.js'].lineData[73]++;
    cs = body.childNodes;
  }
  _$jscoverage['/html-parser/parser.js'].lineData[75]++;
  S.each(cs, function(c) {
  _$jscoverage['/html-parser/parser.js'].functionData[3]++;
  _$jscoverage['/html-parser/parser.js'].lineData[76]++;
  fragment.appendChild(c);
});
  _$jscoverage['/html-parser/parser.js'].lineData[78]++;
  return fragment;
}, 
  parse: function() {
  _$jscoverage['/html-parser/parser.js'].functionData[4]++;
  _$jscoverage['/html-parser/parser.js'].lineData[82]++;
  return this.elements();
}};
  _$jscoverage['/html-parser/parser.js'].lineData[86]++;
  function fixBody(doc) {
    _$jscoverage['/html-parser/parser.js'].functionData[5]++;
    _$jscoverage['/html-parser/parser.js'].lineData[88]++;
    var body = findTagWithName(doc, 'body', 3);
    _$jscoverage['/html-parser/parser.js'].lineData[89]++;
    if (visit245_89_1(body)) {
      _$jscoverage['/html-parser/parser.js'].lineData[99]++;
      var parent = body.parentNode, silbing = parent.childNodes, bodyIndex = S.indexOf(body, silbing);
      _$jscoverage['/html-parser/parser.js'].lineData[102]++;
      if (visit246_102_1(bodyIndex !== silbing.length - 1)) {
        _$jscoverage['/html-parser/parser.js'].lineData[103]++;
        var fixes = silbing.slice(bodyIndex + 1, silbing.length);
        _$jscoverage['/html-parser/parser.js'].lineData[104]++;
        for (var i = 0; visit247_104_1(i < fixes.length); i++) {
          _$jscoverage['/html-parser/parser.js'].lineData[105]++;
          parent.removeChild(fixes[i]);
          _$jscoverage['/html-parser/parser.js'].lineData[106]++;
          if (visit248_106_1(fixes[i].tagName === 'body')) {
            _$jscoverage['/html-parser/parser.js'].lineData[108]++;
            S.each(fixes[i].childNodes, function(c) {
  _$jscoverage['/html-parser/parser.js'].functionData[6]++;
  _$jscoverage['/html-parser/parser.js'].lineData[109]++;
  body.appendChild(c);
});
          } else {
            _$jscoverage['/html-parser/parser.js'].lineData[112]++;
            body.appendChild(fixes[i]);
          }
        }
      }
    }
    _$jscoverage['/html-parser/parser.js'].lineData[117]++;
    return body;
  }
  _$jscoverage['/html-parser/parser.js'].lineData[121]++;
  function autoParagraph(doc) {
    _$jscoverage['/html-parser/parser.js'].functionData[7]++;
    _$jscoverage['/html-parser/parser.js'].lineData[122]++;
    var childNodes = doc.childNodes, c, i, pDtd = dtd.p, needFix = 0;
    _$jscoverage['/html-parser/parser.js'].lineData[128]++;
    for (i = 0; visit249_128_1(i < childNodes.length); i++) {
      _$jscoverage['/html-parser/parser.js'].lineData[129]++;
      c = childNodes[i];
      _$jscoverage['/html-parser/parser.js'].lineData[130]++;
      if (visit250_130_1(visit251_130_2(c.nodeType === 3) || (visit252_130_3(visit253_130_4(c.nodeType === 1) && pDtd[c.nodeName])))) {
        _$jscoverage['/html-parser/parser.js'].lineData[131]++;
        needFix = 1;
        _$jscoverage['/html-parser/parser.js'].lineData[132]++;
        break;
      }
    }
    _$jscoverage['/html-parser/parser.js'].lineData[135]++;
    if (visit254_135_1(needFix)) {
      _$jscoverage['/html-parser/parser.js'].lineData[136]++;
      var newChildren = [], holder = new Tag();
      _$jscoverage['/html-parser/parser.js'].lineData[138]++;
      holder.nodeName = holder.tagName = 'p';
      _$jscoverage['/html-parser/parser.js'].lineData[139]++;
      for (i = 0; visit255_139_1(i < childNodes.length); i++) {
        _$jscoverage['/html-parser/parser.js'].lineData[140]++;
        c = childNodes[i];
        _$jscoverage['/html-parser/parser.js'].lineData[141]++;
        if (visit256_141_1(visit257_141_2(c.nodeType === 3) || (visit258_141_3(visit259_141_4(c.nodeType === 1) && pDtd[c.nodeName])))) {
          _$jscoverage['/html-parser/parser.js'].lineData[142]++;
          holder.appendChild(c);
        } else {
          _$jscoverage['/html-parser/parser.js'].lineData[144]++;
          if (visit260_144_1(holder.childNodes.length)) {
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
      if (visit261_152_1(holder.childNodes.length)) {
        _$jscoverage['/html-parser/parser.js'].lineData[153]++;
        newChildren.push(holder);
      }
      _$jscoverage['/html-parser/parser.js'].lineData[156]++;
      doc.empty();
      _$jscoverage['/html-parser/parser.js'].lineData[158]++;
      for (i = 0; visit262_158_1(i < newChildren.length); i++) {
        _$jscoverage['/html-parser/parser.js'].lineData[159]++;
        doc.appendChild(newChildren[i]);
      }
    }
  }
  _$jscoverage['/html-parser/parser.js'].lineData[165]++;
  function findTagWithName(root, tagName, level) {
    _$jscoverage['/html-parser/parser.js'].functionData[8]++;
    _$jscoverage['/html-parser/parser.js'].lineData[166]++;
    if (visit263_166_1(level === 0)) {
      _$jscoverage['/html-parser/parser.js'].lineData[167]++;
      return 0;
    }
    _$jscoverage['/html-parser/parser.js'].lineData[169]++;
    if (visit264_169_1(typeof level === 'number')) {
      _$jscoverage['/html-parser/parser.js'].lineData[170]++;
      level--;
    }
    _$jscoverage['/html-parser/parser.js'].lineData[172]++;
    var r, childNodes = root.childNodes;
    _$jscoverage['/html-parser/parser.js'].lineData[173]++;
    if (visit265_173_1(childNodes)) {
      _$jscoverage['/html-parser/parser.js'].lineData[174]++;
      for (var i = 0; visit266_174_1(i < childNodes.length); i++) {
        _$jscoverage['/html-parser/parser.js'].lineData[175]++;
        if (visit267_175_1(childNodes[i].tagName === tagName)) {
          _$jscoverage['/html-parser/parser.js'].lineData[176]++;
          return childNodes[i];
        }
        _$jscoverage['/html-parser/parser.js'].lineData[178]++;
        if ((r = findTagWithName(childNodes[i], tagName, level))) {
          _$jscoverage['/html-parser/parser.js'].lineData[179]++;
          return r;
        }
      }
    }
    _$jscoverage['/html-parser/parser.js'].lineData[183]++;
    return 0;
  }
  _$jscoverage['/html-parser/parser.js'].lineData[186]++;
  function postProcess(doc) {
    _$jscoverage['/html-parser/parser.js'].functionData[9]++;
    _$jscoverage['/html-parser/parser.js'].lineData[190]++;
    var childNodes = [].concat(doc.childNodes);
    _$jscoverage['/html-parser/parser.js'].lineData[191]++;
    for (var i = 0; visit268_191_1(i < childNodes.length); i++) {
      _$jscoverage['/html-parser/parser.js'].lineData[192]++;
      if (visit269_192_1(childNodes[i].nodeName === 'html')) {
        _$jscoverage['/html-parser/parser.js'].lineData[193]++;
        var html = childNodes[i];
        _$jscoverage['/html-parser/parser.js'].lineData[194]++;
        for (var j = 0; visit270_194_1(j < i); j++) {
          _$jscoverage['/html-parser/parser.js'].lineData[195]++;
          if (visit271_195_1(visit272_195_2(childNodes[j].nodeType === 3) && !S.trim(childNodes[j].toHtml()))) {
            _$jscoverage['/html-parser/parser.js'].lineData[196]++;
            doc.removeChild(childNodes[j]);
          }
        }
        _$jscoverage['/html-parser/parser.js'].lineData[199]++;
        while (visit273_199_1(html.firstChild && visit274_200_1(visit275_200_2(html.firstChild.nodeType === 3) && !S.trim(html.firstChild.toHtml())))) {
          _$jscoverage['/html-parser/parser.js'].lineData[201]++;
          html.removeChild(html.firstChild);
        }
        _$jscoverage['/html-parser/parser.js'].lineData[203]++;
        break;
      }
    }
  }
  _$jscoverage['/html-parser/parser.js'].lineData[208]++;
  return Parser;
});
