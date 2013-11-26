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
  _$jscoverage['/html-parser/parser.js'].lineData[107] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[108] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[111] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[116] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[120] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[121] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[127] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[128] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[129] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[130] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[134] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[135] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[137] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[138] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[139] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[140] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[141] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[143] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[144] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[145] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[147] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[151] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[152] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[155] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[157] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[158] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[164] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[165] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[166] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[167] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[169] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[170] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[171] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[172] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[173] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[175] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[176] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[180] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[183] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[187] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[188] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[189] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[190] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[191] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[192] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[193] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[196] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[198] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[200] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[205] = 0;
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
  _$jscoverage['/html-parser/parser.js'].branchData['127'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['129'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['129'][2] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['129'][3] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['129'][4] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['134'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['138'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['140'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['140'][2] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['140'][3] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['140'][4] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['143'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['151'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['157'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['165'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['166'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['170'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['171'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['172'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['175'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['188'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['189'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['191'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['192'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['192'][2] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['196'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['197'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['197'][2] = new BranchData();
}
_$jscoverage['/html-parser/parser.js'].branchData['197'][2].init(339, 29, 'html.firstChild.nodeType == 3');
function visit276_197_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['197'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['197'][1].init(38, 66, 'html.firstChild.nodeType == 3 && !S.trim(html.firstChild.toHtml())');
function visit275_197_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['196'][1].init(298, 105, 'html.firstChild && html.firstChild.nodeType == 3 && !S.trim(html.firstChild.toHtml())');
function visit274_196_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['192'][2].init(25, 27, 'childNodes[j].nodeType == 3');
function visit273_192_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['192'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['192'][1].init(25, 62, 'childNodes[j].nodeType == 3 && !S.trim(childNodes[j].toHtml())');
function visit272_192_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['191'][1].init(75, 5, 'j < i');
function visit271_191_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['189'][1].init(17, 32, 'childNodes[i].nodeName == "html"');
function visit270_189_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['188'][1].init(285, 21, 'i < childNodes.length');
function visit269_188_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['175'][1].init(138, 50, 'r = findTagWithName(childNodes[i], tagName, level)');
function visit268_175_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['172'][1].init(21, 33, 'childNodes[i].tagName === tagName');
function visit267_172_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['171'][1].init(29, 21, 'i < childNodes.length');
function visit266_171_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['170'][1].init(165, 10, 'childNodes');
function visit265_170_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['166'][1].init(48, 25, 'typeof level === \'number\'');
function visit264_166_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['165'][1].init(13, 11, 'level === 0');
function visit263_165_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['157'][1].init(758, 22, 'i < newChildren.length');
function visit262_157_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['151'][1].init(623, 24, 'holder.childNodes.length');
function visit261_151_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['143'][1].init(25, 24, 'holder.childNodes.length');
function visit260_143_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['140'][4].init(76, 15, 'c.nodeType == 1');
function visit259_140_4(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['140'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['140'][3].init(76, 35, 'c.nodeType == 1 && pDtd[c.nodeName]');
function visit258_140_3(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['140'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['140'][2].init(56, 15, 'c.nodeType == 3');
function visit257_140_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['140'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['140'][1].init(56, 56, 'c.nodeType == 3 || (c.nodeType == 1 && pDtd[c.nodeName])');
function visit256_140_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['138'][1].init(147, 21, 'i < childNodes.length');
function visit255_138_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['134'][1].init(372, 7, 'needFix');
function visit254_134_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['129'][4].init(68, 15, 'c.nodeType == 1');
function visit253_129_4(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['129'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['129'][3].init(68, 35, 'c.nodeType == 1 && pDtd[c.nodeName]');
function visit252_129_3(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['129'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['129'][2].init(48, 15, 'c.nodeType == 3');
function visit251_129_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['129'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['129'][1].init(48, 56, 'c.nodeType == 3 || (c.nodeType == 1 && pDtd[c.nodeName])');
function visit250_129_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['127'][1].init(147, 21, 'i < childNodes.length');
function visit249_127_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['106'][1].init(75, 27, 'fixes[i].tagName === "body"');
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
}_$jscoverage['/html-parser/parser.js'].branchData['70'][1].init(679, 46, '/^(<!doctype|<html|<body)/i.test(originalHTML)');
function visit244_70_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['61'][1].init(448, 29, 'body && opts[\'autoParagraph\']');
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
      html = "<document>" + html + "</document>";
    } else {
      _$jscoverage['/html-parser/parser.js'].lineData[33]++;
      html = "<body>" + html + "</body>";
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
  Scanner.getScanner("div").scan(root, lexer, opts);
  _$jscoverage['/html-parser/parser.js'].lineData[59]++;
  var body = fixBody(doc);
  _$jscoverage['/html-parser/parser.js'].lineData[61]++;
  if (visit243_61_1(body && opts['autoParagraph'])) {
    _$jscoverage['/html-parser/parser.js'].lineData[62]++;
    autoParagraph(body);
  }
  _$jscoverage['/html-parser/parser.js'].lineData[65]++;
  post_process(doc);
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
    var body = findTagWithName(doc, "body", 3);
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
          if (visit248_106_1(fixes[i].tagName === "body")) {
            _$jscoverage['/html-parser/parser.js'].lineData[107]++;
            S.each(fixes[i].childNodes, function(c) {
  _$jscoverage['/html-parser/parser.js'].functionData[6]++;
  _$jscoverage['/html-parser/parser.js'].lineData[108]++;
  body.appendChild(c);
});
          } else {
            _$jscoverage['/html-parser/parser.js'].lineData[111]++;
            body.appendChild(fixes[i]);
          }
        }
      }
    }
    _$jscoverage['/html-parser/parser.js'].lineData[116]++;
    return body;
  }
  _$jscoverage['/html-parser/parser.js'].lineData[120]++;
  function autoParagraph(doc) {
    _$jscoverage['/html-parser/parser.js'].functionData[7]++;
    _$jscoverage['/html-parser/parser.js'].lineData[121]++;
    var childNodes = doc.childNodes, c, i, pDtd = dtd['p'], needFix = 0;
    _$jscoverage['/html-parser/parser.js'].lineData[127]++;
    for (i = 0; visit249_127_1(i < childNodes.length); i++) {
      _$jscoverage['/html-parser/parser.js'].lineData[128]++;
      c = childNodes[i];
      _$jscoverage['/html-parser/parser.js'].lineData[129]++;
      if (visit250_129_1(visit251_129_2(c.nodeType == 3) || (visit252_129_3(visit253_129_4(c.nodeType == 1) && pDtd[c.nodeName])))) {
        _$jscoverage['/html-parser/parser.js'].lineData[130]++;
        needFix = 1;
        _$jscoverage['/html-parser/parser.js'].lineData[131]++;
        break;
      }
    }
    _$jscoverage['/html-parser/parser.js'].lineData[134]++;
    if (visit254_134_1(needFix)) {
      _$jscoverage['/html-parser/parser.js'].lineData[135]++;
      var newChildren = [], holder = new Tag();
      _$jscoverage['/html-parser/parser.js'].lineData[137]++;
      holder.nodeName = holder.tagName = "p";
      _$jscoverage['/html-parser/parser.js'].lineData[138]++;
      for (i = 0; visit255_138_1(i < childNodes.length); i++) {
        _$jscoverage['/html-parser/parser.js'].lineData[139]++;
        c = childNodes[i];
        _$jscoverage['/html-parser/parser.js'].lineData[140]++;
        if (visit256_140_1(visit257_140_2(c.nodeType == 3) || (visit258_140_3(visit259_140_4(c.nodeType == 1) && pDtd[c.nodeName])))) {
          _$jscoverage['/html-parser/parser.js'].lineData[141]++;
          holder.appendChild(c);
        } else {
          _$jscoverage['/html-parser/parser.js'].lineData[143]++;
          if (visit260_143_1(holder.childNodes.length)) {
            _$jscoverage['/html-parser/parser.js'].lineData[144]++;
            newChildren.push(holder);
            _$jscoverage['/html-parser/parser.js'].lineData[145]++;
            holder = holder.clone();
          }
          _$jscoverage['/html-parser/parser.js'].lineData[147]++;
          newChildren.push(c);
        }
      }
      _$jscoverage['/html-parser/parser.js'].lineData[151]++;
      if (visit261_151_1(holder.childNodes.length)) {
        _$jscoverage['/html-parser/parser.js'].lineData[152]++;
        newChildren.push(holder);
      }
      _$jscoverage['/html-parser/parser.js'].lineData[155]++;
      doc.empty();
      _$jscoverage['/html-parser/parser.js'].lineData[157]++;
      for (i = 0; visit262_157_1(i < newChildren.length); i++) {
        _$jscoverage['/html-parser/parser.js'].lineData[158]++;
        doc.appendChild(newChildren[i]);
      }
    }
  }
  _$jscoverage['/html-parser/parser.js'].lineData[164]++;
  function findTagWithName(root, tagName, level) {
    _$jscoverage['/html-parser/parser.js'].functionData[8]++;
    _$jscoverage['/html-parser/parser.js'].lineData[165]++;
    if (visit263_165_1(level === 0)) 
      return 0;
    _$jscoverage['/html-parser/parser.js'].lineData[166]++;
    if (visit264_166_1(typeof level === 'number')) {
      _$jscoverage['/html-parser/parser.js'].lineData[167]++;
      level--;
    }
    _$jscoverage['/html-parser/parser.js'].lineData[169]++;
    var r, childNodes = root.childNodes;
    _$jscoverage['/html-parser/parser.js'].lineData[170]++;
    if (visit265_170_1(childNodes)) {
      _$jscoverage['/html-parser/parser.js'].lineData[171]++;
      for (var i = 0; visit266_171_1(i < childNodes.length); i++) {
        _$jscoverage['/html-parser/parser.js'].lineData[172]++;
        if (visit267_172_1(childNodes[i].tagName === tagName)) {
          _$jscoverage['/html-parser/parser.js'].lineData[173]++;
          return childNodes[i];
        }
        _$jscoverage['/html-parser/parser.js'].lineData[175]++;
        if (visit268_175_1(r = findTagWithName(childNodes[i], tagName, level))) {
          _$jscoverage['/html-parser/parser.js'].lineData[176]++;
          return r;
        }
      }
    }
    _$jscoverage['/html-parser/parser.js'].lineData[180]++;
    return 0;
  }
  _$jscoverage['/html-parser/parser.js'].lineData[183]++;
  function post_process(doc) {
    _$jscoverage['/html-parser/parser.js'].functionData[9]++;
    _$jscoverage['/html-parser/parser.js'].lineData[187]++;
    var childNodes = [].concat(doc.childNodes);
    _$jscoverage['/html-parser/parser.js'].lineData[188]++;
    for (var i = 0; visit269_188_1(i < childNodes.length); i++) {
      _$jscoverage['/html-parser/parser.js'].lineData[189]++;
      if (visit270_189_1(childNodes[i].nodeName == "html")) {
        _$jscoverage['/html-parser/parser.js'].lineData[190]++;
        var html = childNodes[i];
        _$jscoverage['/html-parser/parser.js'].lineData[191]++;
        for (var j = 0; visit271_191_1(j < i); j++) {
          _$jscoverage['/html-parser/parser.js'].lineData[192]++;
          if (visit272_192_1(visit273_192_2(childNodes[j].nodeType == 3) && !S.trim(childNodes[j].toHtml()))) {
            _$jscoverage['/html-parser/parser.js'].lineData[193]++;
            doc.removeChild(childNodes[j]);
          }
        }
        _$jscoverage['/html-parser/parser.js'].lineData[196]++;
        while (visit274_196_1(html.firstChild && visit275_197_1(visit276_197_2(html.firstChild.nodeType == 3) && !S.trim(html.firstChild.toHtml())))) {
          _$jscoverage['/html-parser/parser.js'].lineData[198]++;
          html.removeChild(html.firstChild);
        }
        _$jscoverage['/html-parser/parser.js'].lineData[200]++;
        break;
      }
    }
  }
  _$jscoverage['/html-parser/parser.js'].lineData[205]++;
  return Parser;
});
