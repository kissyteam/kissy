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
if (! _$jscoverage['/kison/lexer.js']) {
  _$jscoverage['/kison/lexer.js'] = {};
  _$jscoverage['/kison/lexer.js'].lineData = [];
  _$jscoverage['/kison/lexer.js'].lineData[6] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[7] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[10] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[17] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[33] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[35] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[42] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[46] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[52] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[56] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[72] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[75] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[76] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[77] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[78] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[80] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[81] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[82] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[83] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[85] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[87] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[91] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[98] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[99] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[100] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[103] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[104] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[107] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[109] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[111] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[113] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[115] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[116] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[120] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[121] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[123] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[128] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[129] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[130] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[133] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[134] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[136] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[138] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[141] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[143] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[146] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[147] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[148] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[152] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[156] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[159] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[160] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[161] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[162] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[163] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[164] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[166] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[167] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[170] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[174] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[178] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[182] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[186] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[191] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[192] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[195] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[197] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[201] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[203] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[204] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[207] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[211] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[215] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[216] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[217] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[218] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[221] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[222] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[224] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[229] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[231] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[232] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[234] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[238] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[247] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[249] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[250] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[253] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[254] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[255] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[258] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[259] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[260] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[261] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[263] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[271] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[273] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[276] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[278] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[280] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[281] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[282] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[283] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[285] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[287] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[288] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[290] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[291] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[294] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[299] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[300] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[304] = 0;
}
if (! _$jscoverage['/kison/lexer.js'].functionData) {
  _$jscoverage['/kison/lexer.js'].functionData = [];
  _$jscoverage['/kison/lexer.js'].functionData[0] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[1] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[2] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[3] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[4] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[5] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[6] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[7] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[8] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[9] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[10] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[11] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[12] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[13] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[14] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[15] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[16] = 0;
}
if (! _$jscoverage['/kison/lexer.js'].branchData) {
  _$jscoverage['/kison/lexer.js'].branchData = {};
  _$jscoverage['/kison/lexer.js'].branchData['77'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['86'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['98'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['103'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['114'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['115'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['119'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['120'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['126'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['128'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['133'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['143'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['147'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['161'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['162'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['163'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['166'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['192'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['196'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['203'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['207'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['215'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['221'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['231'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['234'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['249'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['253'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['255'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['256'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['257'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['257'][2] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['260'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['281'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['282'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['290'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['290'][1] = new BranchData();
}
_$jscoverage['/kison/lexer.js'].branchData['290'][1].init(1302, 3, 'ret');
function visit123_290_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['282'][1].init(1014, 17, 'ret === undefined');
function visit122_282_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['281'][1].init(960, 27, 'action && action.call(self)');
function visit121_281_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['260'][1].init(76, 5, 'lines');
function visit120_260_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['257'][2].init(133, 20, 'rule[2] || undefined');
function visit119_257_2(result) {
  _$jscoverage['/kison/lexer.js'].branchData['257'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['257'][1].init(118, 35, 'rule.action || rule[2] || undefined');
function visit118_257_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['256'][1].init(65, 21, 'rule.token || rule[0]');
function visit117_256_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['255'][1].init(65, 22, 'rule.regexp || rule[1]');
function visit116_255_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['253'][1].init(403, 16, 'i < rules.length');
function visit115_253_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['249'][1].init(289, 6, '!input');
function visit114_249_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['234'][1].init(166, 55, 'stateMap[s] || (stateMap[s] = self.genShortId(\'state\'))');
function visit113_234_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['231'][1].init(91, 9, '!stateMap');
function visit112_231_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['221'][1].init(418, 16, 'reverseSymbolMap');
function visit111_221_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['215'][1].init(172, 30, '!reverseSymbolMap && symbolMap');
function visit110_215_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['207'][1].init(229, 58, 'symbolMap[t] || (symbolMap[t] = self.genShortId(\'symbol\'))');
function visit109_207_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['203'][1].init(93, 10, '!symbolMap');
function visit108_203_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['196'][1].init(54, 33, 'next.length > DEBUG_CONTEXT_LIMIT');
function visit107_196_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['192'][1].init(316, 36, 'matched.length > DEBUG_CONTEXT_LIMIT');
function visit106_192_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['166'][1].init(236, 30, 'S.inArray(currentState, state)');
function visit105_166_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['163'][1].init(26, 37, 'currentState === Lexer.STATIC.INITIAL');
function visit104_163_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['162'][1].init(68, 6, '!state');
function visit103_162_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['161'][1].init(30, 15, 'r.state || r[3]');
function visit102_161_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['147'][1].init(155, 13, 'compressState');
function visit101_147_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['143'][1].init(1961, 31, 'compressState || compressSymbol');
function visit100_143_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['133'][1].init(749, 5, 'state');
function visit99_133_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['128'][1].init(511, 22, 'compressState && state');
function visit98_128_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['126'][1].init(105, 11, 'action || 0');
function visit97_126_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['120'][1].init(209, 5, 'token');
function visit96_120_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['119'][1].init(139, 12, 'v.token || 0');
function visit95_119_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['115'][1].init(26, 13, 'v && v.regexp');
function visit94_115_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['114'][1].init(54, 31, 'compressState || compressSymbol');
function visit93_114_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['103'][1].init(423, 13, 'compressState');
function visit92_103_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['98'][1].init(284, 14, 'compressSymbol');
function visit91_98_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['86'][1].init(192, 10, 'index >= 0');
function visit90_86_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['77'][1].init(191, 16, '!(field in self)');
function visit89_77_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/kison/lexer.js'].functionData[0]++;
  _$jscoverage['/kison/lexer.js'].lineData[7]++;
  var Utils = require('./utils');
  _$jscoverage['/kison/lexer.js'].lineData[10]++;
  var serializeObject = Utils.serializeObject, Lexer = function(cfg) {
  _$jscoverage['/kison/lexer.js'].functionData[1]++;
  _$jscoverage['/kison/lexer.js'].lineData[17]++;
  var self = this;
  _$jscoverage['/kison/lexer.js'].lineData[33]++;
  self.rules = [];
  _$jscoverage['/kison/lexer.js'].lineData[35]++;
  S.mix(self, cfg);
  _$jscoverage['/kison/lexer.js'].lineData[42]++;
  self.resetInput(self.input);
};
  _$jscoverage['/kison/lexer.js'].lineData[46]++;
  Lexer.STATIC = {
  INITIAL: 'I', 
  DEBUG_CONTEXT_LIMIT: 20, 
  END_TAG: '$EOF'};
  _$jscoverage['/kison/lexer.js'].lineData[52]++;
  Lexer.prototype = {
  constructor: Lexer, 
  resetInput: function(input) {
  _$jscoverage['/kison/lexer.js'].functionData[2]++;
  _$jscoverage['/kison/lexer.js'].lineData[56]++;
  S.mix(this, {
  input: input, 
  matched: '', 
  stateStack: [Lexer.STATIC.INITIAL], 
  match: '', 
  text: '', 
  firstLine: 1, 
  lineNumber: 1, 
  lastLine: 1, 
  firstColumn: 1, 
  lastColumn: 1});
}, 
  genShortId: function(field) {
  _$jscoverage['/kison/lexer.js'].functionData[3]++;
  _$jscoverage['/kison/lexer.js'].lineData[72]++;
  var base = 97, max = 122, interval = max - base + 1;
  _$jscoverage['/kison/lexer.js'].lineData[75]++;
  field += '__gen';
  _$jscoverage['/kison/lexer.js'].lineData[76]++;
  var self = this;
  _$jscoverage['/kison/lexer.js'].lineData[77]++;
  if (visit89_77_1(!(field in self))) {
    _$jscoverage['/kison/lexer.js'].lineData[78]++;
    self[field] = -1;
  }
  _$jscoverage['/kison/lexer.js'].lineData[80]++;
  var index = self[field] = self[field] + 1;
  _$jscoverage['/kison/lexer.js'].lineData[81]++;
  var ret = '';
  _$jscoverage['/kison/lexer.js'].lineData[82]++;
  do {
    _$jscoverage['/kison/lexer.js'].lineData[83]++;
    ret = String.fromCharCode(base + index % interval) + ret;
    _$jscoverage['/kison/lexer.js'].lineData[85]++;
    index = Math.floor(index / interval) - 1;
  } while (visit90_86_1(index >= 0));
  _$jscoverage['/kison/lexer.js'].lineData[87]++;
  return ret;
}, 
  genCode: function(cfg) {
  _$jscoverage['/kison/lexer.js'].functionData[4]++;
  _$jscoverage['/kison/lexer.js'].lineData[91]++;
  var STATIC = Lexer.STATIC, self = this, compressSymbol = cfg.compressSymbol, compressState = cfg.compressLexerState, code = ['/*jslint quotmark: false*/'], stateMap;
  _$jscoverage['/kison/lexer.js'].lineData[98]++;
  if (visit91_98_1(compressSymbol)) {
    _$jscoverage['/kison/lexer.js'].lineData[99]++;
    self.symbolMap = {};
    _$jscoverage['/kison/lexer.js'].lineData[100]++;
    self.mapSymbol(STATIC.END_TAG);
  }
  _$jscoverage['/kison/lexer.js'].lineData[103]++;
  if (visit92_103_1(compressState)) {
    _$jscoverage['/kison/lexer.js'].lineData[104]++;
    stateMap = self.stateMap = {};
  }
  _$jscoverage['/kison/lexer.js'].lineData[107]++;
  code.push('var Lexer = ' + Lexer.toString() + ';');
  _$jscoverage['/kison/lexer.js'].lineData[109]++;
  code.push('Lexer.prototype= ' + serializeObject(Lexer.prototype, /genCode/) + ';');
  _$jscoverage['/kison/lexer.js'].lineData[111]++;
  code.push('Lexer.STATIC= ' + serializeObject(STATIC) + ';');
  _$jscoverage['/kison/lexer.js'].lineData[113]++;
  var newCfg = serializeObject({
  rules: self.rules}, (visit93_114_1(compressState || compressSymbol)) ? function(v) {
  _$jscoverage['/kison/lexer.js'].functionData[5]++;
  _$jscoverage['/kison/lexer.js'].lineData[115]++;
  if (visit94_115_1(v && v.regexp)) {
    _$jscoverage['/kison/lexer.js'].lineData[116]++;
    var state = v.state, ret, action = v.action, token = visit95_119_1(v.token || 0);
    _$jscoverage['/kison/lexer.js'].lineData[120]++;
    if (visit96_120_1(token)) {
      _$jscoverage['/kison/lexer.js'].lineData[121]++;
      token = self.mapSymbol(token);
    }
    _$jscoverage['/kison/lexer.js'].lineData[123]++;
    ret = [token, v.regexp, visit97_126_1(action || 0)];
    _$jscoverage['/kison/lexer.js'].lineData[128]++;
    if (visit98_128_1(compressState && state)) {
      _$jscoverage['/kison/lexer.js'].lineData[129]++;
      state = S.map(state, function(s) {
  _$jscoverage['/kison/lexer.js'].functionData[6]++;
  _$jscoverage['/kison/lexer.js'].lineData[130]++;
  return self.mapState(s);
});
    }
    _$jscoverage['/kison/lexer.js'].lineData[133]++;
    if (visit99_133_1(state)) {
      _$jscoverage['/kison/lexer.js'].lineData[134]++;
      ret.push(state);
    }
    _$jscoverage['/kison/lexer.js'].lineData[136]++;
    return ret;
  }
  _$jscoverage['/kison/lexer.js'].lineData[138]++;
  return undefined;
} : 0);
  _$jscoverage['/kison/lexer.js'].lineData[141]++;
  code.push('var lexer = new Lexer(' + newCfg + ');');
  _$jscoverage['/kison/lexer.js'].lineData[143]++;
  if (visit100_143_1(compressState || compressSymbol)) {
    _$jscoverage['/kison/lexer.js'].lineData[146]++;
    self.rules = eval('(' + newCfg + ')').rules;
    _$jscoverage['/kison/lexer.js'].lineData[147]++;
    if (visit101_147_1(compressState)) {
      _$jscoverage['/kison/lexer.js'].lineData[148]++;
      code.push('lexer.stateMap = ' + serializeObject(stateMap) + ';');
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[152]++;
  return code.join('\n');
}, 
  getCurrentRules: function() {
  _$jscoverage['/kison/lexer.js'].functionData[7]++;
  _$jscoverage['/kison/lexer.js'].lineData[156]++;
  var self = this, currentState = self.stateStack[self.stateStack.length - 1], rules = [];
  _$jscoverage['/kison/lexer.js'].lineData[159]++;
  currentState = self.mapState(currentState);
  _$jscoverage['/kison/lexer.js'].lineData[160]++;
  S.each(self.rules, function(r) {
  _$jscoverage['/kison/lexer.js'].functionData[8]++;
  _$jscoverage['/kison/lexer.js'].lineData[161]++;
  var state = visit102_161_1(r.state || r[3]);
  _$jscoverage['/kison/lexer.js'].lineData[162]++;
  if (visit103_162_1(!state)) {
    _$jscoverage['/kison/lexer.js'].lineData[163]++;
    if (visit104_163_1(currentState === Lexer.STATIC.INITIAL)) {
      _$jscoverage['/kison/lexer.js'].lineData[164]++;
      rules.push(r);
    }
  } else {
    _$jscoverage['/kison/lexer.js'].lineData[166]++;
    if (visit105_166_1(S.inArray(currentState, state))) {
      _$jscoverage['/kison/lexer.js'].lineData[167]++;
      rules.push(r);
    }
  }
});
  _$jscoverage['/kison/lexer.js'].lineData[170]++;
  return rules;
}, 
  pushState: function(state) {
  _$jscoverage['/kison/lexer.js'].functionData[9]++;
  _$jscoverage['/kison/lexer.js'].lineData[174]++;
  this.stateStack.push(state);
}, 
  popState: function() {
  _$jscoverage['/kison/lexer.js'].functionData[10]++;
  _$jscoverage['/kison/lexer.js'].lineData[178]++;
  return this.stateStack.pop();
}, 
  getStateStack: function() {
  _$jscoverage['/kison/lexer.js'].functionData[11]++;
  _$jscoverage['/kison/lexer.js'].lineData[182]++;
  return this.stateStack;
}, 
  showDebugInfo: function() {
  _$jscoverage['/kison/lexer.js'].functionData[12]++;
  _$jscoverage['/kison/lexer.js'].lineData[186]++;
  var self = this, DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT, matched = self.matched, match = self.match, input = self.input;
  _$jscoverage['/kison/lexer.js'].lineData[191]++;
  matched = matched.slice(0, matched.length - match.length);
  _$jscoverage['/kison/lexer.js'].lineData[192]++;
  var past = (visit106_192_1(matched.length > DEBUG_CONTEXT_LIMIT) ? '...' : '') + matched.slice(-DEBUG_CONTEXT_LIMIT).replace(/\n/, ' '), next = match + input;
  _$jscoverage['/kison/lexer.js'].lineData[195]++;
  next = next.slice(0, DEBUG_CONTEXT_LIMIT) + (visit107_196_1(next.length > DEBUG_CONTEXT_LIMIT) ? '...' : '');
  _$jscoverage['/kison/lexer.js'].lineData[197]++;
  return past + next + '\n' + new Array(past.length + 1).join('-') + '^';
}, 
  mapSymbol: function(t) {
  _$jscoverage['/kison/lexer.js'].functionData[13]++;
  _$jscoverage['/kison/lexer.js'].lineData[201]++;
  var self = this, symbolMap = self.symbolMap;
  _$jscoverage['/kison/lexer.js'].lineData[203]++;
  if (visit108_203_1(!symbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[204]++;
    return t;
  }
  _$jscoverage['/kison/lexer.js'].lineData[207]++;
  return visit109_207_1(symbolMap[t] || (symbolMap[t] = self.genShortId('symbol')));
}, 
  mapReverseSymbol: function(rs) {
  _$jscoverage['/kison/lexer.js'].functionData[14]++;
  _$jscoverage['/kison/lexer.js'].lineData[211]++;
  var self = this, symbolMap = self.symbolMap, i, reverseSymbolMap = self.reverseSymbolMap;
  _$jscoverage['/kison/lexer.js'].lineData[215]++;
  if (visit110_215_1(!reverseSymbolMap && symbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[216]++;
    reverseSymbolMap = self.reverseSymbolMap = {};
    _$jscoverage['/kison/lexer.js'].lineData[217]++;
    for (i in symbolMap) {
      _$jscoverage['/kison/lexer.js'].lineData[218]++;
      reverseSymbolMap[symbolMap[i]] = i;
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[221]++;
  if (visit111_221_1(reverseSymbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[222]++;
    return reverseSymbolMap[rs];
  } else {
    _$jscoverage['/kison/lexer.js'].lineData[224]++;
    return rs;
  }
}, 
  mapState: function(s) {
  _$jscoverage['/kison/lexer.js'].functionData[15]++;
  _$jscoverage['/kison/lexer.js'].lineData[229]++;
  var self = this, stateMap = self.stateMap;
  _$jscoverage['/kison/lexer.js'].lineData[231]++;
  if (visit112_231_1(!stateMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[232]++;
    return s;
  }
  _$jscoverage['/kison/lexer.js'].lineData[234]++;
  return visit113_234_1(stateMap[s] || (stateMap[s] = self.genShortId('state')));
}, 
  lex: function() {
  _$jscoverage['/kison/lexer.js'].functionData[16]++;
  _$jscoverage['/kison/lexer.js'].lineData[238]++;
  var self = this, input = self.input, i, rule, m, ret, lines, rules = self.getCurrentRules();
  _$jscoverage['/kison/lexer.js'].lineData[247]++;
  self.match = self.text = '';
  _$jscoverage['/kison/lexer.js'].lineData[249]++;
  if (visit114_249_1(!input)) {
    _$jscoverage['/kison/lexer.js'].lineData[250]++;
    return self.mapSymbol(Lexer.STATIC.END_TAG);
  }
  _$jscoverage['/kison/lexer.js'].lineData[253]++;
  for (i = 0; visit115_253_1(i < rules.length); i++) {
    _$jscoverage['/kison/lexer.js'].lineData[254]++;
    rule = rules[i];
    _$jscoverage['/kison/lexer.js'].lineData[255]++;
    var regexp = visit116_255_1(rule.regexp || rule[1]), token = visit117_256_1(rule.token || rule[0]), action = visit118_257_1(rule.action || visit119_257_2(rule[2] || undefined));
    _$jscoverage['/kison/lexer.js'].lineData[258]++;
    if ((m = input.match(regexp))) {
      _$jscoverage['/kison/lexer.js'].lineData[259]++;
      lines = m[0].match(/\n.*/g);
      _$jscoverage['/kison/lexer.js'].lineData[260]++;
      if (visit120_260_1(lines)) {
        _$jscoverage['/kison/lexer.js'].lineData[261]++;
        self.lineNumber += lines.length;
      }
      _$jscoverage['/kison/lexer.js'].lineData[263]++;
      S.mix(self, {
  firstLine: self.lastLine, 
  lastLine: self.lineNumber + 1, 
  firstColumn: self.lastColumn, 
  lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length});
      _$jscoverage['/kison/lexer.js'].lineData[271]++;
      var match;
      _$jscoverage['/kison/lexer.js'].lineData[273]++;
      match = self.match = m[0];
      _$jscoverage['/kison/lexer.js'].lineData[276]++;
      self.matches = m;
      _$jscoverage['/kison/lexer.js'].lineData[278]++;
      self.text = match;
      _$jscoverage['/kison/lexer.js'].lineData[280]++;
      self.matched += match;
      _$jscoverage['/kison/lexer.js'].lineData[281]++;
      ret = visit121_281_1(action && action.call(self));
      _$jscoverage['/kison/lexer.js'].lineData[282]++;
      if (visit122_282_1(ret === undefined)) {
        _$jscoverage['/kison/lexer.js'].lineData[283]++;
        ret = token;
      } else {
        _$jscoverage['/kison/lexer.js'].lineData[285]++;
        ret = self.mapSymbol(ret);
      }
      _$jscoverage['/kison/lexer.js'].lineData[287]++;
      input = input.slice(match.length);
      _$jscoverage['/kison/lexer.js'].lineData[288]++;
      self.input = input;
      _$jscoverage['/kison/lexer.js'].lineData[290]++;
      if (visit123_290_1(ret)) {
        _$jscoverage['/kison/lexer.js'].lineData[291]++;
        return ret;
      } else {
        _$jscoverage['/kison/lexer.js'].lineData[294]++;
        return self.lex();
      }
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[299]++;
  S.error('lex error at line ' + self.lineNumber + ':\n' + self.showDebugInfo());
  _$jscoverage['/kison/lexer.js'].lineData[300]++;
  return undefined;
}};
  _$jscoverage['/kison/lexer.js'].lineData[304]++;
  return Lexer;
});
