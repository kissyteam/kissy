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
  _$jscoverage['/kison/lexer.js'].lineData[14] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[30] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[32] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[39] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[43] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[49] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[53] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[69] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[76] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[78] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[79] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[80] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[83] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[84] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[87] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[89] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[91] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[93] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[95] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[96] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[100] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[101] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[103] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[108] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[109] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[110] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[113] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[114] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[116] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[118] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[121] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[123] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[125] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[126] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[127] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[131] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[135] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[138] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[139] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[140] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[141] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[142] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[143] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[145] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[146] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[149] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[153] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[157] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[161] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[165] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[170] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[171] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[174] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[176] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[180] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[182] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[183] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[185] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[189] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[193] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[194] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[195] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[196] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[199] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[200] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[202] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[207] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[209] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[210] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[212] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[216] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[225] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[227] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[228] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[231] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[232] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[233] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[236] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[237] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[238] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[239] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[241] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[249] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[251] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[254] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[256] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[258] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[259] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[260] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[261] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[263] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[265] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[266] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[268] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[269] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[272] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[277] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[278] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[282] = 0;
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
}
if (! _$jscoverage['/kison/lexer.js'].branchData) {
  _$jscoverage['/kison/lexer.js'].branchData = {};
  _$jscoverage['/kison/lexer.js'].branchData['78'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['83'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['94'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['95'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['99'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['100'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['106'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['108'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['113'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['123'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['126'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['140'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['141'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['142'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['145'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['171'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['175'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['182'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['185'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['193'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['199'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['209'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['212'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['227'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['231'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['233'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['234'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['235'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['235'][2] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['236'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['238'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['259'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['260'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['268'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['268'][1] = new BranchData();
}
_$jscoverage['/kison/lexer.js'].branchData['268'][1].init(1301, 3, 'ret');
function visit122_268_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['260'][1].init(1014, 16, 'ret == undefined');
function visit121_260_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['259'][1].init(960, 27, 'action && action.call(self)');
function visit120_259_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['238'][1].init(76, 5, 'lines');
function visit119_238_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['236'][1].init(229, 23, 'm = input.match(regexp)');
function visit118_236_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['235'][2].init(133, 20, 'rule[2] || undefined');
function visit117_235_2(result) {
  _$jscoverage['/kison/lexer.js'].branchData['235'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['235'][1].init(118, 35, 'rule.action || rule[2] || undefined');
function visit116_235_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['234'][1].init(65, 21, 'rule.token || rule[0]');
function visit115_234_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['233'][1].init(65, 22, 'rule.regexp || rule[1]');
function visit114_233_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['231'][1].init(403, 16, 'i < rules.length');
function visit113_231_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['227'][1].init(289, 6, '!input');
function visit112_227_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['212'][1].init(166, 47, 'stateMap[s] || (stateMap[s] = (++self.stateId))');
function visit111_212_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['209'][1].init(91, 9, '!stateMap');
function visit110_209_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['199'][1].init(418, 16, 'reverseSymbolMap');
function visit109_199_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['193'][1].init(172, 30, '!reverseSymbolMap && symbolMap');
function visit108_193_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['185'][1].init(169, 50, 'symbolMap[t] || (symbolMap[t] = (++self.symbolId))');
function visit107_185_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['182'][1].init(93, 10, '!symbolMap');
function visit106_182_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['175'][1].init(54, 33, 'next.length > DEBUG_CONTEXT_LIMIT');
function visit105_175_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['171'][1].init(316, 36, 'matched.length > DEBUG_CONTEXT_LIMIT');
function visit104_171_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['145'][1].init(235, 30, 'S.inArray(currentState, state)');
function visit103_145_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['142'][1].init(26, 36, 'currentState == Lexer.STATIC.INITIAL');
function visit102_142_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['141'][1].init(68, 6, '!state');
function visit101_141_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['140'][1].init(30, 15, 'r.state || r[3]');
function visit100_140_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['126'][1].init(116, 13, 'compressState');
function visit99_126_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['123'][1].init(1984, 31, 'compressState || compressSymbol');
function visit98_123_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['113'][1].init(749, 5, 'state');
function visit97_113_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['108'][1].init(511, 22, 'compressState && state');
function visit96_108_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['106'][1].init(105, 11, 'action || 0');
function visit95_106_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['100'][1].init(209, 5, 'token');
function visit94_100_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['99'][1].init(139, 12, 'v.token || 0');
function visit93_99_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['95'][1].init(26, 13, 'v && v.regexp');
function visit92_95_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['94'][1].init(54, 31, 'compressState || compressSymbol');
function visit91_94_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['83'][1].init(446, 13, 'compressState');
function visit90_83_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['78'][1].init(307, 14, 'compressSymbol');
function visit89_78_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].lineData[6]++;
KISSY.add("kison/lexer", function(S, Utils) {
  _$jscoverage['/kison/lexer.js'].functionData[0]++;
  _$jscoverage['/kison/lexer.js'].lineData[7]++;
  var serializeObject = Utils.serializeObject, Lexer = function(cfg) {
  _$jscoverage['/kison/lexer.js'].functionData[1]++;
  _$jscoverage['/kison/lexer.js'].lineData[14]++;
  var self = this;
  _$jscoverage['/kison/lexer.js'].lineData[30]++;
  self.rules = [];
  _$jscoverage['/kison/lexer.js'].lineData[32]++;
  S.mix(self, cfg);
  _$jscoverage['/kison/lexer.js'].lineData[39]++;
  self.resetInput(self.input);
};
  _$jscoverage['/kison/lexer.js'].lineData[43]++;
  Lexer.STATIC = {
  INITIAL: 'I', 
  DEBUG_CONTEXT_LIMIT: 20, 
  END_TAG: '$EOF'};
  _$jscoverage['/kison/lexer.js'].lineData[49]++;
  Lexer.prototype = {
  constructor: Lexer, 
  resetInput: function(input) {
  _$jscoverage['/kison/lexer.js'].functionData[2]++;
  _$jscoverage['/kison/lexer.js'].lineData[53]++;
  S.mix(this, {
  input: input, 
  matched: "", 
  stateStack: [Lexer.STATIC.INITIAL], 
  match: "", 
  text: "", 
  firstLine: 1, 
  lineNumber: 1, 
  lastLine: 1, 
  firstColumn: 1, 
  lastColumn: 1});
}, 
  genCode: function(cfg) {
  _$jscoverage['/kison/lexer.js'].functionData[3]++;
  _$jscoverage['/kison/lexer.js'].lineData[69]++;
  var STATIC = Lexer.STATIC, self = this, compressSymbol = cfg.compressSymbol, compressState = cfg.compressLexerState, code = [], stateMap;
  _$jscoverage['/kison/lexer.js'].lineData[76]++;
  self.symbolId = self.stateId = 0;
  _$jscoverage['/kison/lexer.js'].lineData[78]++;
  if (visit89_78_1(compressSymbol)) {
    _$jscoverage['/kison/lexer.js'].lineData[79]++;
    self.symbolMap = {};
    _$jscoverage['/kison/lexer.js'].lineData[80]++;
    self.mapSymbol(STATIC.END_TAG);
  }
  _$jscoverage['/kison/lexer.js'].lineData[83]++;
  if (visit90_83_1(compressState)) {
    _$jscoverage['/kison/lexer.js'].lineData[84]++;
    stateMap = self.stateMap = {};
  }
  _$jscoverage['/kison/lexer.js'].lineData[87]++;
  code.push("var Lexer = " + Lexer.toString() + ';');
  _$jscoverage['/kison/lexer.js'].lineData[89]++;
  code.push("Lexer.prototype= " + serializeObject(Lexer.prototype, /genCode/) + ";");
  _$jscoverage['/kison/lexer.js'].lineData[91]++;
  code.push("Lexer.STATIC= " + serializeObject(STATIC) + ";");
  _$jscoverage['/kison/lexer.js'].lineData[93]++;
  var newCfg = serializeObject({
  rules: self.rules}, (visit91_94_1(compressState || compressSymbol)) ? function(v) {
  _$jscoverage['/kison/lexer.js'].functionData[4]++;
  _$jscoverage['/kison/lexer.js'].lineData[95]++;
  if (visit92_95_1(v && v.regexp)) {
    _$jscoverage['/kison/lexer.js'].lineData[96]++;
    var state = v.state, ret, action = v.action, token = visit93_99_1(v.token || 0);
    _$jscoverage['/kison/lexer.js'].lineData[100]++;
    if (visit94_100_1(token)) {
      _$jscoverage['/kison/lexer.js'].lineData[101]++;
      token = self.mapSymbol(token);
    }
    _$jscoverage['/kison/lexer.js'].lineData[103]++;
    ret = [token, v.regexp, visit95_106_1(action || 0)];
    _$jscoverage['/kison/lexer.js'].lineData[108]++;
    if (visit96_108_1(compressState && state)) {
      _$jscoverage['/kison/lexer.js'].lineData[109]++;
      state = S.map(state, function(s) {
  _$jscoverage['/kison/lexer.js'].functionData[5]++;
  _$jscoverage['/kison/lexer.js'].lineData[110]++;
  return self.mapState(s);
});
    }
    _$jscoverage['/kison/lexer.js'].lineData[113]++;
    if (visit97_113_1(state)) {
      _$jscoverage['/kison/lexer.js'].lineData[114]++;
      ret.push(state);
    }
    _$jscoverage['/kison/lexer.js'].lineData[116]++;
    return ret;
  }
  _$jscoverage['/kison/lexer.js'].lineData[118]++;
  return undefined;
} : 0);
  _$jscoverage['/kison/lexer.js'].lineData[121]++;
  code.push("var lexer = new Lexer(" + newCfg + ");");
  _$jscoverage['/kison/lexer.js'].lineData[123]++;
  if (visit98_123_1(compressState || compressSymbol)) {
    _$jscoverage['/kison/lexer.js'].lineData[125]++;
    self.rules = eval('(' + newCfg + ')').rules;
    _$jscoverage['/kison/lexer.js'].lineData[126]++;
    if (visit99_126_1(compressState)) {
      _$jscoverage['/kison/lexer.js'].lineData[127]++;
      code.push('lexer.stateMap = ' + serializeObject(stateMap) + ';');
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[131]++;
  return code.join("\n");
}, 
  getCurrentRules: function() {
  _$jscoverage['/kison/lexer.js'].functionData[6]++;
  _$jscoverage['/kison/lexer.js'].lineData[135]++;
  var self = this, currentState = self.stateStack[self.stateStack.length - 1], rules = [];
  _$jscoverage['/kison/lexer.js'].lineData[138]++;
  currentState = self.mapState(currentState);
  _$jscoverage['/kison/lexer.js'].lineData[139]++;
  S.each(self.rules, function(r) {
  _$jscoverage['/kison/lexer.js'].functionData[7]++;
  _$jscoverage['/kison/lexer.js'].lineData[140]++;
  var state = visit100_140_1(r.state || r[3]);
  _$jscoverage['/kison/lexer.js'].lineData[141]++;
  if (visit101_141_1(!state)) {
    _$jscoverage['/kison/lexer.js'].lineData[142]++;
    if (visit102_142_1(currentState == Lexer.STATIC.INITIAL)) {
      _$jscoverage['/kison/lexer.js'].lineData[143]++;
      rules.push(r);
    }
  } else {
    _$jscoverage['/kison/lexer.js'].lineData[145]++;
    if (visit103_145_1(S.inArray(currentState, state))) {
      _$jscoverage['/kison/lexer.js'].lineData[146]++;
      rules.push(r);
    }
  }
});
  _$jscoverage['/kison/lexer.js'].lineData[149]++;
  return rules;
}, 
  pushState: function(state) {
  _$jscoverage['/kison/lexer.js'].functionData[8]++;
  _$jscoverage['/kison/lexer.js'].lineData[153]++;
  this.stateStack.push(state);
}, 
  popState: function() {
  _$jscoverage['/kison/lexer.js'].functionData[9]++;
  _$jscoverage['/kison/lexer.js'].lineData[157]++;
  return this.stateStack.pop();
}, 
  getStateStack: function() {
  _$jscoverage['/kison/lexer.js'].functionData[10]++;
  _$jscoverage['/kison/lexer.js'].lineData[161]++;
  return this.stateStack;
}, 
  showDebugInfo: function() {
  _$jscoverage['/kison/lexer.js'].functionData[11]++;
  _$jscoverage['/kison/lexer.js'].lineData[165]++;
  var self = this, DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT, matched = self.matched, match = self.match, input = self.input;
  _$jscoverage['/kison/lexer.js'].lineData[170]++;
  matched = matched.slice(0, matched.length - match.length);
  _$jscoverage['/kison/lexer.js'].lineData[171]++;
  var past = (visit104_171_1(matched.length > DEBUG_CONTEXT_LIMIT) ? "..." : "") + matched.slice(-DEBUG_CONTEXT_LIMIT).replace(/\n/, " "), next = match + input;
  _$jscoverage['/kison/lexer.js'].lineData[174]++;
  next = next.slice(0, DEBUG_CONTEXT_LIMIT) + (visit105_175_1(next.length > DEBUG_CONTEXT_LIMIT) ? "..." : "");
  _$jscoverage['/kison/lexer.js'].lineData[176]++;
  return past + next + "\n" + new Array(past.length + 1).join("-") + "^";
}, 
  mapSymbol: function(t) {
  _$jscoverage['/kison/lexer.js'].functionData[12]++;
  _$jscoverage['/kison/lexer.js'].lineData[180]++;
  var self = this, symbolMap = self.symbolMap;
  _$jscoverage['/kison/lexer.js'].lineData[182]++;
  if (visit106_182_1(!symbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[183]++;
    return t;
  }
  _$jscoverage['/kison/lexer.js'].lineData[185]++;
  return visit107_185_1(symbolMap[t] || (symbolMap[t] = (++self.symbolId)));
}, 
  mapReverseSymbol: function(rs) {
  _$jscoverage['/kison/lexer.js'].functionData[13]++;
  _$jscoverage['/kison/lexer.js'].lineData[189]++;
  var self = this, symbolMap = self.symbolMap, i, reverseSymbolMap = self.reverseSymbolMap;
  _$jscoverage['/kison/lexer.js'].lineData[193]++;
  if (visit108_193_1(!reverseSymbolMap && symbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[194]++;
    reverseSymbolMap = self.reverseSymbolMap = {};
    _$jscoverage['/kison/lexer.js'].lineData[195]++;
    for (i in symbolMap) {
      _$jscoverage['/kison/lexer.js'].lineData[196]++;
      reverseSymbolMap[symbolMap[i]] = i;
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[199]++;
  if (visit109_199_1(reverseSymbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[200]++;
    return reverseSymbolMap[rs];
  } else {
    _$jscoverage['/kison/lexer.js'].lineData[202]++;
    return rs;
  }
}, 
  mapState: function(s) {
  _$jscoverage['/kison/lexer.js'].functionData[14]++;
  _$jscoverage['/kison/lexer.js'].lineData[207]++;
  var self = this, stateMap = self.stateMap;
  _$jscoverage['/kison/lexer.js'].lineData[209]++;
  if (visit110_209_1(!stateMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[210]++;
    return s;
  }
  _$jscoverage['/kison/lexer.js'].lineData[212]++;
  return visit111_212_1(stateMap[s] || (stateMap[s] = (++self.stateId)));
}, 
  lex: function() {
  _$jscoverage['/kison/lexer.js'].functionData[15]++;
  _$jscoverage['/kison/lexer.js'].lineData[216]++;
  var self = this, input = self.input, i, rule, m, ret, lines, rules = self.getCurrentRules();
  _$jscoverage['/kison/lexer.js'].lineData[225]++;
  self.match = self.text = "";
  _$jscoverage['/kison/lexer.js'].lineData[227]++;
  if (visit112_227_1(!input)) {
    _$jscoverage['/kison/lexer.js'].lineData[228]++;
    return self.mapSymbol(Lexer.STATIC.END_TAG);
  }
  _$jscoverage['/kison/lexer.js'].lineData[231]++;
  for (i = 0; visit113_231_1(i < rules.length); i++) {
    _$jscoverage['/kison/lexer.js'].lineData[232]++;
    rule = rules[i];
    _$jscoverage['/kison/lexer.js'].lineData[233]++;
    var regexp = visit114_233_1(rule.regexp || rule[1]), token = visit115_234_1(rule.token || rule[0]), action = visit116_235_1(rule.action || visit117_235_2(rule[2] || undefined));
    _$jscoverage['/kison/lexer.js'].lineData[236]++;
    if (visit118_236_1(m = input.match(regexp))) {
      _$jscoverage['/kison/lexer.js'].lineData[237]++;
      lines = m[0].match(/\n.*/g);
      _$jscoverage['/kison/lexer.js'].lineData[238]++;
      if (visit119_238_1(lines)) {
        _$jscoverage['/kison/lexer.js'].lineData[239]++;
        self.lineNumber += lines.length;
      }
      _$jscoverage['/kison/lexer.js'].lineData[241]++;
      S.mix(self, {
  firstLine: self.lastLine, 
  lastLine: self.lineNumber + 1, 
  firstColumn: self.lastColumn, 
  lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length});
      _$jscoverage['/kison/lexer.js'].lineData[249]++;
      var match;
      _$jscoverage['/kison/lexer.js'].lineData[251]++;
      match = self.match = m[0];
      _$jscoverage['/kison/lexer.js'].lineData[254]++;
      self.matches = m;
      _$jscoverage['/kison/lexer.js'].lineData[256]++;
      self.text = match;
      _$jscoverage['/kison/lexer.js'].lineData[258]++;
      self.matched += match;
      _$jscoverage['/kison/lexer.js'].lineData[259]++;
      ret = visit120_259_1(action && action.call(self));
      _$jscoverage['/kison/lexer.js'].lineData[260]++;
      if (visit121_260_1(ret == undefined)) {
        _$jscoverage['/kison/lexer.js'].lineData[261]++;
        ret = token;
      } else {
        _$jscoverage['/kison/lexer.js'].lineData[263]++;
        ret = self.mapSymbol(ret);
      }
      _$jscoverage['/kison/lexer.js'].lineData[265]++;
      input = input.slice(match.length);
      _$jscoverage['/kison/lexer.js'].lineData[266]++;
      self.input = input;
      _$jscoverage['/kison/lexer.js'].lineData[268]++;
      if (visit122_268_1(ret)) {
        _$jscoverage['/kison/lexer.js'].lineData[269]++;
        return ret;
      } else {
        _$jscoverage['/kison/lexer.js'].lineData[272]++;
        return self.lex();
      }
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[277]++;
  S.error("lex error at line " + self.lineNumber + ":\n" + self.showDebugInfo());
  _$jscoverage['/kison/lexer.js'].lineData[278]++;
  return undefined;
}};
  _$jscoverage['/kison/lexer.js'].lineData[282]++;
  return Lexer;
}, {
  requires: ['./utils']});
