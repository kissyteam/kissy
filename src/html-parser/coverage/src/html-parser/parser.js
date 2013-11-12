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
  _$jscoverage['/html-parser/parser.js'].lineData[14] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[16] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[17] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[24] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[25] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[27] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[29] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[30] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[33] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[37] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[42] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[44] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[45] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[46] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[49] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[51] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[53] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[55] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[56] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[59] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[61] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[64] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[65] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[67] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[69] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[70] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[72] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[76] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[80] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[82] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[83] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[93] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[96] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[97] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[98] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[99] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[100] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[101] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[102] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[105] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[110] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[114] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[115] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[121] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[122] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[123] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[124] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[125] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[128] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[129] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[132] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[133] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[134] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[135] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[137] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[138] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[139] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[141] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[145] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[146] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[149] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[151] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[152] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[158] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[159] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[160] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[161] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[163] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[164] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[165] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[166] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[167] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[169] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[170] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[174] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[177] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[181] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[182] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[183] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[184] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[185] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[186] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[187] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[190] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[193] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[195] = 0;
  _$jscoverage['/html-parser/parser.js'].lineData[200] = 0;
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
  _$jscoverage['/html-parser/parser.js'].branchData['24'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['30'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['44'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['55'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['64'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['83'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['96'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['98'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['100'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['121'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['123'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['123'][2] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['123'][3] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['123'][4] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['128'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['132'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['134'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['134'][2] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['134'][3] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['134'][4] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['137'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['145'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['151'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['159'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['160'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['164'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['165'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['166'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['169'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['182'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['183'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['185'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['186'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['186'][2] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['190'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['191'] = [];
  _$jscoverage['/html-parser/parser.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/html-parser/parser.js'].branchData['191'][2] = new BranchData();
}
_$jscoverage['/html-parser/parser.js'].branchData['191'][2].init(347, 29, 'html.firstChild.nodeType == 3');
function visit276_191_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['191'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['191'][1].init(39, 87, 'html.firstChild.nodeType == 3 && !S.trim(html.firstChild.toHtml())');
function visit275_191_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['190'][1].init(305, 127, 'html.firstChild && html.firstChild.nodeType == 3 && !S.trim(html.firstChild.toHtml())');
function visit274_190_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['186'][2].init(26, 27, 'childNodes[j].nodeType == 3');
function visit273_186_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['186'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['186'][1].init(26, 62, 'childNodes[j].nodeType == 3 && !S.trim(childNodes[j].toHtml())');
function visit272_186_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['185'][1].init(77, 5, 'j < i');
function visit271_185_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['183'][1].init(18, 32, 'childNodes[i].nodeName == "html"');
function visit270_183_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['182'][1].init(290, 21, 'i < childNodes.length');
function visit269_182_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['169'][1].init(142, 50, 'r = findTagWithName(childNodes[i], tagName, level)');
function visit268_169_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['166'][1].init(22, 33, 'childNodes[i].tagName === tagName');
function visit267_166_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['165'][1].init(30, 21, 'i < childNodes.length');
function visit266_165_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['164'][1].init(169, 10, 'childNodes');
function visit265_164_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['160'][1].init(50, 23, 'typeof level === \'number\'');
function visit264_160_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['159'][1].init(14, 11, 'level === 0');
function visit263_159_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['151'][1].init(781, 22, 'i < newChildren.length');
function visit262_151_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['145'][1].init(640, 24, 'holder.childNodes.length');
function visit261_145_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['137'][1].init(26, 24, 'holder.childNodes.length');
function visit260_137_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['134'][4].init(78, 15, 'c.nodeType == 1');
function visit259_134_4(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['134'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['134'][3].init(78, 35, 'c.nodeType == 1 && pDtd[c.nodeName]');
function visit258_134_3(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['134'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['134'][2].init(58, 15, 'c.nodeType == 3');
function visit257_134_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['134'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['134'][1].init(58, 56, 'c.nodeType == 3 || (c.nodeType == 1 && pDtd[c.nodeName])');
function visit256_134_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['132'][1].init(151, 21, 'i < childNodes.length');
function visit255_132_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['128'][1].init(386, 7, 'needFix');
function visit254_128_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['123'][4].init(70, 15, 'c.nodeType == 1');
function visit253_123_4(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['123'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['123'][3].init(70, 35, 'c.nodeType == 1 && pDtd[c.nodeName]');
function visit252_123_3(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['123'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['123'][2].init(50, 15, 'c.nodeType == 3');
function visit251_123_2(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['123'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['123'][1].init(50, 56, 'c.nodeType == 3 || (c.nodeType == 1 && pDtd[c.nodeName])');
function visit250_123_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['121'][1].init(154, 21, 'i < childNodes.length');
function visit249_121_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['100'][1].init(77, 27, 'fixes[i].tagName === "body"');
function visit248_100_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['98'][1].init(109, 16, 'i < fixes.length');
function visit247_98_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['96'][1].init(374, 32, 'bodyIndex !== silbing.length - 1');
function visit246_96_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['83'][1].init(93, 4, 'body');
function visit245_83_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['64'][1].init(707, 46, '/^(<!doctype|<html|<body)/i.test(originalHTML)');
function visit244_64_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['55'][1].init(467, 29, 'body && opts[\'autoParagraph\']');
function visit243_55_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['44'][1].init(184, 27, 'root.tagName !== \'document\'');
function visit242_44_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['30'][1].init(550, 10, 'opts || {}');
function visit241_30_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].branchData['24'][1].init(313, 38, '/^(<!doctype|<html|<body)/i.test(html)');
function visit240_24_1(result) {
  _$jscoverage['/html-parser/parser.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/parser.js'].lineData[6]++;
KISSY.add("html-parser/parser", function(S, dtd, Tag, Fragment, Cursor, Lexer, Document, Scanner) {
  _$jscoverage['/html-parser/parser.js'].functionData[0]++;
  _$jscoverage['/html-parser/parser.js'].lineData[14]++;
  function Parser(html, opts) {
    _$jscoverage['/html-parser/parser.js'].functionData[1]++;
    _$jscoverage['/html-parser/parser.js'].lineData[16]++;
    html = S.trim(html);
    _$jscoverage['/html-parser/parser.js'].lineData[17]++;
    this.originalHTML = html;
    _$jscoverage['/html-parser/parser.js'].lineData[24]++;
    if (visit240_24_1(/^(<!doctype|<html|<body)/i.test(html))) {
      _$jscoverage['/html-parser/parser.js'].lineData[25]++;
      html = "<document>" + html + "</document>";
    } else {
      _$jscoverage['/html-parser/parser.js'].lineData[27]++;
      html = "<body>" + html + "</body>";
    }
    _$jscoverage['/html-parser/parser.js'].lineData[29]++;
    this.lexer = new Lexer(html);
    _$jscoverage['/html-parser/parser.js'].lineData[30]++;
    this.opts = visit241_30_1(opts || {});
  }
  _$jscoverage['/html-parser/parser.js'].lineData[33]++;
  Parser.prototype = {
  constructor: Parser, 
  elements: function() {
  _$jscoverage['/html-parser/parser.js'].functionData[2]++;
  _$jscoverage['/html-parser/parser.js'].lineData[37]++;
  var root, doc, lexer = this.lexer, opts = this.opts;
  _$jscoverage['/html-parser/parser.js'].lineData[42]++;
  doc = root = lexer.nextNode();
  _$jscoverage['/html-parser/parser.js'].lineData[44]++;
  if (visit242_44_1(root.tagName !== 'document')) {
    _$jscoverage['/html-parser/parser.js'].lineData[45]++;
    doc = new Document();
    _$jscoverage['/html-parser/parser.js'].lineData[46]++;
    doc.appendChild(root);
  }
  _$jscoverage['/html-parser/parser.js'].lineData[49]++;
  doc.nodeType = 9;
  _$jscoverage['/html-parser/parser.js'].lineData[51]++;
  Scanner.getScanner("div").scan(root, lexer, opts);
  _$jscoverage['/html-parser/parser.js'].lineData[53]++;
  var body = fixBody(doc);
  _$jscoverage['/html-parser/parser.js'].lineData[55]++;
  if (visit243_55_1(body && opts['autoParagraph'])) {
    _$jscoverage['/html-parser/parser.js'].lineData[56]++;
    autoParagraph(body);
  }
  _$jscoverage['/html-parser/parser.js'].lineData[59]++;
  post_process(doc);
  _$jscoverage['/html-parser/parser.js'].lineData[61]++;
  var originalHTML = this.originalHTML, fragment = new Fragment(), cs;
  _$jscoverage['/html-parser/parser.js'].lineData[64]++;
  if (visit244_64_1(/^(<!doctype|<html|<body)/i.test(originalHTML))) {
    _$jscoverage['/html-parser/parser.js'].lineData[65]++;
    cs = doc.childNodes;
  } else {
    _$jscoverage['/html-parser/parser.js'].lineData[67]++;
    cs = body.childNodes;
  }
  _$jscoverage['/html-parser/parser.js'].lineData[69]++;
  S.each(cs, function(c) {
  _$jscoverage['/html-parser/parser.js'].functionData[3]++;
  _$jscoverage['/html-parser/parser.js'].lineData[70]++;
  fragment.appendChild(c);
});
  _$jscoverage['/html-parser/parser.js'].lineData[72]++;
  return fragment;
}, 
  parse: function() {
  _$jscoverage['/html-parser/parser.js'].functionData[4]++;
  _$jscoverage['/html-parser/parser.js'].lineData[76]++;
  return this.elements();
}};
  _$jscoverage['/html-parser/parser.js'].lineData[80]++;
  function fixBody(doc) {
    _$jscoverage['/html-parser/parser.js'].functionData[5]++;
    _$jscoverage['/html-parser/parser.js'].lineData[82]++;
    var body = findTagWithName(doc, "body", 3);
    _$jscoverage['/html-parser/parser.js'].lineData[83]++;
    if (visit245_83_1(body)) {
      _$jscoverage['/html-parser/parser.js'].lineData[93]++;
      var parent = body.parentNode, silbing = parent.childNodes, bodyIndex = S.indexOf(body, silbing);
      _$jscoverage['/html-parser/parser.js'].lineData[96]++;
      if (visit246_96_1(bodyIndex !== silbing.length - 1)) {
        _$jscoverage['/html-parser/parser.js'].lineData[97]++;
        var fixes = silbing.slice(bodyIndex + 1, silbing.length);
        _$jscoverage['/html-parser/parser.js'].lineData[98]++;
        for (var i = 0; visit247_98_1(i < fixes.length); i++) {
          _$jscoverage['/html-parser/parser.js'].lineData[99]++;
          parent.removeChild(fixes[i]);
          _$jscoverage['/html-parser/parser.js'].lineData[100]++;
          if (visit248_100_1(fixes[i].tagName === "body")) {
            _$jscoverage['/html-parser/parser.js'].lineData[101]++;
            S.each(fixes[i].childNodes, function(c) {
  _$jscoverage['/html-parser/parser.js'].functionData[6]++;
  _$jscoverage['/html-parser/parser.js'].lineData[102]++;
  body.appendChild(c);
});
          } else {
            _$jscoverage['/html-parser/parser.js'].lineData[105]++;
            body.appendChild(fixes[i]);
          }
        }
      }
    }
    _$jscoverage['/html-parser/parser.js'].lineData[110]++;
    return body;
  }
  _$jscoverage['/html-parser/parser.js'].lineData[114]++;
  function autoParagraph(doc) {
    _$jscoverage['/html-parser/parser.js'].functionData[7]++;
    _$jscoverage['/html-parser/parser.js'].lineData[115]++;
    var childNodes = doc.childNodes, c, i, pDtd = dtd['p'], needFix = 0;
    _$jscoverage['/html-parser/parser.js'].lineData[121]++;
    for (i = 0; visit249_121_1(i < childNodes.length); i++) {
      _$jscoverage['/html-parser/parser.js'].lineData[122]++;
      c = childNodes[i];
      _$jscoverage['/html-parser/parser.js'].lineData[123]++;
      if (visit250_123_1(visit251_123_2(c.nodeType == 3) || (visit252_123_3(visit253_123_4(c.nodeType == 1) && pDtd[c.nodeName])))) {
        _$jscoverage['/html-parser/parser.js'].lineData[124]++;
        needFix = 1;
        _$jscoverage['/html-parser/parser.js'].lineData[125]++;
        break;
      }
    }
    _$jscoverage['/html-parser/parser.js'].lineData[128]++;
    if (visit254_128_1(needFix)) {
      _$jscoverage['/html-parser/parser.js'].lineData[129]++;
      var newChildren = [], holder = new Tag();
      _$jscoverage['/html-parser/parser.js'].lineData[131]++;
      holder.nodeName = holder.tagName = "p";
      _$jscoverage['/html-parser/parser.js'].lineData[132]++;
      for (i = 0; visit255_132_1(i < childNodes.length); i++) {
        _$jscoverage['/html-parser/parser.js'].lineData[133]++;
        c = childNodes[i];
        _$jscoverage['/html-parser/parser.js'].lineData[134]++;
        if (visit256_134_1(visit257_134_2(c.nodeType == 3) || (visit258_134_3(visit259_134_4(c.nodeType == 1) && pDtd[c.nodeName])))) {
          _$jscoverage['/html-parser/parser.js'].lineData[135]++;
          holder.appendChild(c);
        } else {
          _$jscoverage['/html-parser/parser.js'].lineData[137]++;
          if (visit260_137_1(holder.childNodes.length)) {
            _$jscoverage['/html-parser/parser.js'].lineData[138]++;
            newChildren.push(holder);
            _$jscoverage['/html-parser/parser.js'].lineData[139]++;
            holder = holder.clone();
          }
          _$jscoverage['/html-parser/parser.js'].lineData[141]++;
          newChildren.push(c);
        }
      }
      _$jscoverage['/html-parser/parser.js'].lineData[145]++;
      if (visit261_145_1(holder.childNodes.length)) {
        _$jscoverage['/html-parser/parser.js'].lineData[146]++;
        newChildren.push(holder);
      }
      _$jscoverage['/html-parser/parser.js'].lineData[149]++;
      doc.empty();
      _$jscoverage['/html-parser/parser.js'].lineData[151]++;
      for (i = 0; visit262_151_1(i < newChildren.length); i++) {
        _$jscoverage['/html-parser/parser.js'].lineData[152]++;
        doc.appendChild(newChildren[i]);
      }
    }
  }
  _$jscoverage['/html-parser/parser.js'].lineData[158]++;
  function findTagWithName(root, tagName, level) {
    _$jscoverage['/html-parser/parser.js'].functionData[8]++;
    _$jscoverage['/html-parser/parser.js'].lineData[159]++;
    if (visit263_159_1(level === 0)) 
      return 0;
    _$jscoverage['/html-parser/parser.js'].lineData[160]++;
    if (visit264_160_1(typeof level === 'number')) {
      _$jscoverage['/html-parser/parser.js'].lineData[161]++;
      level--;
    }
    _$jscoverage['/html-parser/parser.js'].lineData[163]++;
    var r, childNodes = root.childNodes;
    _$jscoverage['/html-parser/parser.js'].lineData[164]++;
    if (visit265_164_1(childNodes)) {
      _$jscoverage['/html-parser/parser.js'].lineData[165]++;
      for (var i = 0; visit266_165_1(i < childNodes.length); i++) {
        _$jscoverage['/html-parser/parser.js'].lineData[166]++;
        if (visit267_166_1(childNodes[i].tagName === tagName)) {
          _$jscoverage['/html-parser/parser.js'].lineData[167]++;
          return childNodes[i];
        }
        _$jscoverage['/html-parser/parser.js'].lineData[169]++;
        if (visit268_169_1(r = findTagWithName(childNodes[i], tagName, level))) {
          _$jscoverage['/html-parser/parser.js'].lineData[170]++;
          return r;
        }
      }
    }
    _$jscoverage['/html-parser/parser.js'].lineData[174]++;
    return 0;
  }
  _$jscoverage['/html-parser/parser.js'].lineData[177]++;
  function post_process(doc) {
    _$jscoverage['/html-parser/parser.js'].functionData[9]++;
    _$jscoverage['/html-parser/parser.js'].lineData[181]++;
    var childNodes = [].concat(doc.childNodes);
    _$jscoverage['/html-parser/parser.js'].lineData[182]++;
    for (var i = 0; visit269_182_1(i < childNodes.length); i++) {
      _$jscoverage['/html-parser/parser.js'].lineData[183]++;
      if (visit270_183_1(childNodes[i].nodeName == "html")) {
        _$jscoverage['/html-parser/parser.js'].lineData[184]++;
        var html = childNodes[i];
        _$jscoverage['/html-parser/parser.js'].lineData[185]++;
        for (var j = 0; visit271_185_1(j < i); j++) {
          _$jscoverage['/html-parser/parser.js'].lineData[186]++;
          if (visit272_186_1(visit273_186_2(childNodes[j].nodeType == 3) && !S.trim(childNodes[j].toHtml()))) {
            _$jscoverage['/html-parser/parser.js'].lineData[187]++;
            doc.removeChild(childNodes[j]);
          }
        }
        _$jscoverage['/html-parser/parser.js'].lineData[190]++;
        while (visit274_190_1(html.firstChild && visit275_191_1(visit276_191_2(html.firstChild.nodeType == 3) && !S.trim(html.firstChild.toHtml())))) {
          _$jscoverage['/html-parser/parser.js'].lineData[193]++;
          html.removeChild(html.firstChild);
        }
        _$jscoverage['/html-parser/parser.js'].lineData[195]++;
        break;
      }
    }
  }
  _$jscoverage['/html-parser/parser.js'].lineData[200]++;
  return Parser;
}, {
  requires: ['./dtd', './nodes/tag', './nodes/fragment', './lexer/cursor', './lexer/lexer', './nodes/document', './scanner']});
