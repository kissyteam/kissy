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
  _$jscoverage['/kison/lexer.js'].lineData[9] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[10] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[13] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[20] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[36] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[38] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[45] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[48] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[54] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[58] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[73] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[76] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[77] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[78] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[79] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[81] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[82] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[83] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[84] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[86] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[88] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[92] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[99] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[100] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[101] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[103] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[106] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[107] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[108] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[109] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[112] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[113] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[116] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[118] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[120] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[122] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[124] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[125] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[126] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[129] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[130] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[132] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[137] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[138] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[139] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[142] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[143] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[146] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[149] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[151] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[154] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[155] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[156] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[160] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[164] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[168] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[169] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[171] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[172] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[173] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[174] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[175] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[177] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[178] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[181] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[185] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[189] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[193] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[198] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[200] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[204] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[206] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[210] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[212] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[213] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[216] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[220] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[224] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[225] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[226] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[227] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[231] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[232] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[234] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[239] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[241] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[242] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[244] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[248] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[257] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[259] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[260] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[263] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[264] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[266] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[270] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[271] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[272] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[273] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[275] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[283] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[285] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[288] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[290] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[292] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[293] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[294] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[295] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[297] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[299] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[300] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[302] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[303] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[306] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[313] = 0;
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
  _$jscoverage['/kison/lexer.js'].functionData[17] = 0;
}
if (! _$jscoverage['/kison/lexer.js'].branchData) {
  _$jscoverage['/kison/lexer.js'].branchData = {};
  _$jscoverage['/kison/lexer.js'].branchData['78'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['87'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['100'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['106'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['112'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['123'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['125'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['128'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['129'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['135'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['137'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['142'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['151'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['155'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['168'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['172'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['173'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['174'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['177'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['200'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['205'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['212'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['216'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['224'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['231'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['241'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['244'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['259'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['263'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['266'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['267'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['268'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['268'][2] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['272'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['293'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['294'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['302'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['302'][1] = new BranchData();
}
_$jscoverage['/kison/lexer.js'].branchData['302'][1].init(1302, 3, 'ret');
function visit126_302_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['294'][1].init(1014, 17, 'ret === undefined');
function visit125_294_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['293'][1].init(960, 27, 'action && action.call(self)');
function visit124_293_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['272'][1].init(76, 5, 'lines');
function visit123_272_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['268'][2].init(133, 20, 'rule[2] || undefined');
function visit122_268_2(result) {
  _$jscoverage['/kison/lexer.js'].branchData['268'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['268'][1].init(118, 35, 'rule.action || rule[2] || undefined');
function visit121_268_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['267'][1].init(65, 21, 'rule.token || rule[0]');
function visit120_267_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['266'][1].init(101, 22, 'rule.regexp || rule[1]');
function visit119_266_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['263'][1].init(403, 16, 'i < rules.length');
function visit118_263_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['259'][1].init(289, 6, '!input');
function visit117_259_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['244'][1].init(166, 55, 'stateMap[s] || (stateMap[s] = self.genShortId(\'state\'))');
function visit116_244_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['241'][1].init(91, 9, '!stateMap');
function visit115_241_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['231'][1].init(448, 16, 'reverseSymbolMap');
function visit114_231_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['224'][1].init(172, 30, '!reverseSymbolMap && symbolMap');
function visit113_224_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['216'][1].init(229, 58, 'symbolMap[t] || (symbolMap[t] = self.genShortId(\'symbol\'))');
function visit112_216_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['212'][1].init(93, 10, '!symbolMap');
function visit111_212_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['205'][1].init(54, 33, 'next.length > DEBUG_CONTEXT_LIMIT');
function visit110_205_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['200'][1].init(348, 36, 'matched.length > DEBUG_CONTEXT_LIMIT');
function visit109_200_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['177'][1].init(236, 30, 'S.inArray(currentState, state)');
function visit108_177_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['174'][1].init(26, 37, 'currentState === Lexer.STATIC.INITIAL');
function visit107_174_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['173'][1].init(68, 6, '!state');
function visit106_173_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['172'][1].init(30, 15, 'r.state || r[3]');
function visit105_172_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['168'][1].init(184, 13, 'self.mapState');
function visit104_168_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['155'][1].init(155, 13, 'compressState');
function visit103_155_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['151'][1].init(2241, 31, 'compressState || compressSymbol');
function visit102_151_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['142'][1].init(715, 5, 'state');
function visit101_142_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['137'][1].init(477, 22, 'compressState && state');
function visit100_137_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['135'][1].init(105, 11, 'action || 0');
function visit99_135_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['129'][1].init(175, 5, 'token');
function visit98_129_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['128'][1].init(105, 12, 'v.token || 0');
function visit97_128_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['125'][1].init(56, 13, 'v && v.regexp');
function visit96_125_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['123'][1].init(54, 31, 'compressState || compressSymbol');
function visit95_123_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['112'][1].init(764, 13, 'compressState');
function visit94_112_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['106'][1].init(562, 14, 'compressSymbol');
function visit93_106_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['100'][1].init(22, 59, 'name.match(/^(?:genCode|constructor|mapState|genShortId)$/)');
function visit92_100_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['87'][1].init(192, 10, 'index >= 0');
function visit91_87_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['78'][1].init(191, 16, '!(field in self)');
function visit90_78_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/kison/lexer.js'].functionData[0]++;
  _$jscoverage['/kison/lexer.js'].lineData[7]++;
  var Utils = require('./utils');
  _$jscoverage['/kison/lexer.js'].lineData[9]++;
  function mapSymbolForCodeGen(t) {
    _$jscoverage['/kison/lexer.js'].functionData[1]++;
    _$jscoverage['/kison/lexer.js'].lineData[10]++;
    return this.symbolMap[t];
  }
  _$jscoverage['/kison/lexer.js'].lineData[13]++;
  var serializeObject = Utils.serializeObject, Lexer = function(cfg) {
  _$jscoverage['/kison/lexer.js'].functionData[2]++;
  _$jscoverage['/kison/lexer.js'].lineData[20]++;
  var self = this;
  _$jscoverage['/kison/lexer.js'].lineData[36]++;
  self.rules = [];
  _$jscoverage['/kison/lexer.js'].lineData[38]++;
  S.mix(self, cfg);
  _$jscoverage['/kison/lexer.js'].lineData[45]++;
  self.resetInput(self.input);
};
  _$jscoverage['/kison/lexer.js'].lineData[48]++;
  Lexer.STATIC = {
  INITIAL: 'I', 
  DEBUG_CONTEXT_LIMIT: 20, 
  END_TAG: '$EOF'};
  _$jscoverage['/kison/lexer.js'].lineData[54]++;
  Lexer.prototype = {
  constructor: Lexer, 
  resetInput: function(input) {
  _$jscoverage['/kison/lexer.js'].functionData[3]++;
  _$jscoverage['/kison/lexer.js'].lineData[58]++;
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
  _$jscoverage['/kison/lexer.js'].functionData[4]++;
  _$jscoverage['/kison/lexer.js'].lineData[73]++;
  var base = 97, max = 122, interval = max - base + 1;
  _$jscoverage['/kison/lexer.js'].lineData[76]++;
  field += '__gen';
  _$jscoverage['/kison/lexer.js'].lineData[77]++;
  var self = this;
  _$jscoverage['/kison/lexer.js'].lineData[78]++;
  if (visit90_78_1(!(field in self))) {
    _$jscoverage['/kison/lexer.js'].lineData[79]++;
    self[field] = -1;
  }
  _$jscoverage['/kison/lexer.js'].lineData[81]++;
  var index = self[field] = self[field] + 1;
  _$jscoverage['/kison/lexer.js'].lineData[82]++;
  var ret = '';
  _$jscoverage['/kison/lexer.js'].lineData[83]++;
  do {
    _$jscoverage['/kison/lexer.js'].lineData[84]++;
    ret = String.fromCharCode(base + index % interval) + ret;
    _$jscoverage['/kison/lexer.js'].lineData[86]++;
    index = Math.floor(index / interval) - 1;
  } while (visit91_87_1(index >= 0));
  _$jscoverage['/kison/lexer.js'].lineData[88]++;
  return ret;
}, 
  genCode: function(cfg) {
  _$jscoverage['/kison/lexer.js'].functionData[5]++;
  _$jscoverage['/kison/lexer.js'].lineData[92]++;
  var STATIC = Lexer.STATIC, self = this, compressSymbol = cfg.compressSymbol, compressState = cfg.compressLexerState, code = ['/*jslint quotmark: false*/'], stateMap;
  _$jscoverage['/kison/lexer.js'].lineData[99]++;
  var genPrototype = S.mix({}, Lexer.prototype, true, function(name, val) {
  _$jscoverage['/kison/lexer.js'].functionData[6]++;
  _$jscoverage['/kison/lexer.js'].lineData[100]++;
  if (visit92_100_1(name.match(/^(?:genCode|constructor|mapState|genShortId)$/))) {
    _$jscoverage['/kison/lexer.js'].lineData[101]++;
    return undefined;
  }
  _$jscoverage['/kison/lexer.js'].lineData[103]++;
  return val;
});
  _$jscoverage['/kison/lexer.js'].lineData[106]++;
  if (visit93_106_1(compressSymbol)) {
    _$jscoverage['/kison/lexer.js'].lineData[107]++;
    self.symbolMap = {};
    _$jscoverage['/kison/lexer.js'].lineData[108]++;
    self.mapSymbol(STATIC.END_TAG);
    _$jscoverage['/kison/lexer.js'].lineData[109]++;
    genPrototype.mapSymbol = mapSymbolForCodeGen;
  }
  _$jscoverage['/kison/lexer.js'].lineData[112]++;
  if (visit94_112_1(compressState)) {
    _$jscoverage['/kison/lexer.js'].lineData[113]++;
    stateMap = self.stateMap = {};
  }
  _$jscoverage['/kison/lexer.js'].lineData[116]++;
  code.push('var Lexer = ' + Lexer.toString() + ';');
  _$jscoverage['/kison/lexer.js'].lineData[118]++;
  code.push('Lexer.prototype= ' + serializeObject(genPrototype) + ';');
  _$jscoverage['/kison/lexer.js'].lineData[120]++;
  code.push('Lexer.STATIC= ' + serializeObject(STATIC) + ';');
  _$jscoverage['/kison/lexer.js'].lineData[122]++;
  var newCfg = serializeObject({
  rules: self.rules}, (visit95_123_1(compressState || compressSymbol)) ? function(v) {
  _$jscoverage['/kison/lexer.js'].functionData[7]++;
  _$jscoverage['/kison/lexer.js'].lineData[124]++;
  var ret;
  _$jscoverage['/kison/lexer.js'].lineData[125]++;
  if (visit96_125_1(v && v.regexp)) {
    _$jscoverage['/kison/lexer.js'].lineData[126]++;
    var state = v.state, action = v.action, token = visit97_128_1(v.token || 0);
    _$jscoverage['/kison/lexer.js'].lineData[129]++;
    if (visit98_129_1(token)) {
      _$jscoverage['/kison/lexer.js'].lineData[130]++;
      token = self.mapSymbol(token);
    }
    _$jscoverage['/kison/lexer.js'].lineData[132]++;
    ret = [token, v.regexp, visit99_135_1(action || 0)];
    _$jscoverage['/kison/lexer.js'].lineData[137]++;
    if (visit100_137_1(compressState && state)) {
      _$jscoverage['/kison/lexer.js'].lineData[138]++;
      state = S.map(state, function(s) {
  _$jscoverage['/kison/lexer.js'].functionData[8]++;
  _$jscoverage['/kison/lexer.js'].lineData[139]++;
  return self.mapState(s);
});
    }
    _$jscoverage['/kison/lexer.js'].lineData[142]++;
    if (visit101_142_1(state)) {
      _$jscoverage['/kison/lexer.js'].lineData[143]++;
      ret.push(state);
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[146]++;
  return ret;
} : 0);
  _$jscoverage['/kison/lexer.js'].lineData[149]++;
  code.push('var lexer = new Lexer(' + newCfg + ');');
  _$jscoverage['/kison/lexer.js'].lineData[151]++;
  if (visit102_151_1(compressState || compressSymbol)) {
    _$jscoverage['/kison/lexer.js'].lineData[154]++;
    self.rules = eval('(' + newCfg + ')').rules;
    _$jscoverage['/kison/lexer.js'].lineData[155]++;
    if (visit103_155_1(compressState)) {
      _$jscoverage['/kison/lexer.js'].lineData[156]++;
      code.push('lexer.stateMap = ' + serializeObject(stateMap) + ';');
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[160]++;
  return code.join('\n');
}, 
  getCurrentRules: function() {
  _$jscoverage['/kison/lexer.js'].functionData[9]++;
  _$jscoverage['/kison/lexer.js'].lineData[164]++;
  var self = this, currentState = self.stateStack[self.stateStack.length - 1], rules = [];
  _$jscoverage['/kison/lexer.js'].lineData[168]++;
  if (visit104_168_1(self.mapState)) {
    _$jscoverage['/kison/lexer.js'].lineData[169]++;
    currentState = self.mapState(currentState);
  }
  _$jscoverage['/kison/lexer.js'].lineData[171]++;
  S.each(self.rules, function(r) {
  _$jscoverage['/kison/lexer.js'].functionData[10]++;
  _$jscoverage['/kison/lexer.js'].lineData[172]++;
  var state = visit105_172_1(r.state || r[3]);
  _$jscoverage['/kison/lexer.js'].lineData[173]++;
  if (visit106_173_1(!state)) {
    _$jscoverage['/kison/lexer.js'].lineData[174]++;
    if (visit107_174_1(currentState === Lexer.STATIC.INITIAL)) {
      _$jscoverage['/kison/lexer.js'].lineData[175]++;
      rules.push(r);
    }
  } else {
    _$jscoverage['/kison/lexer.js'].lineData[177]++;
    if (visit108_177_1(S.inArray(currentState, state))) {
      _$jscoverage['/kison/lexer.js'].lineData[178]++;
      rules.push(r);
    }
  }
});
  _$jscoverage['/kison/lexer.js'].lineData[181]++;
  return rules;
}, 
  pushState: function(state) {
  _$jscoverage['/kison/lexer.js'].functionData[11]++;
  _$jscoverage['/kison/lexer.js'].lineData[185]++;
  this.stateStack.push(state);
}, 
  popState: function() {
  _$jscoverage['/kison/lexer.js'].functionData[12]++;
  _$jscoverage['/kison/lexer.js'].lineData[189]++;
  return this.stateStack.pop();
}, 
  showDebugInfo: function() {
  _$jscoverage['/kison/lexer.js'].functionData[13]++;
  _$jscoverage['/kison/lexer.js'].lineData[193]++;
  var self = this, DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT, matched = self.matched, match = self.match, input = self.input;
  _$jscoverage['/kison/lexer.js'].lineData[198]++;
  matched = matched.slice(0, matched.length - match.length);
  _$jscoverage['/kison/lexer.js'].lineData[200]++;
  var past = (visit109_200_1(matched.length > DEBUG_CONTEXT_LIMIT) ? '...' : '') + matched.slice(0 - DEBUG_CONTEXT_LIMIT).replace(/\n/, ' '), next = match + input;
  _$jscoverage['/kison/lexer.js'].lineData[204]++;
  next = next.slice(0, DEBUG_CONTEXT_LIMIT) + (visit110_205_1(next.length > DEBUG_CONTEXT_LIMIT) ? '...' : '');
  _$jscoverage['/kison/lexer.js'].lineData[206]++;
  return past + next + '\n' + new Array(past.length + 1).join('-') + '^';
}, 
  mapSymbol: function(t) {
  _$jscoverage['/kison/lexer.js'].functionData[14]++;
  _$jscoverage['/kison/lexer.js'].lineData[210]++;
  var self = this, symbolMap = self.symbolMap;
  _$jscoverage['/kison/lexer.js'].lineData[212]++;
  if (visit111_212_1(!symbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[213]++;
    return t;
  }
  _$jscoverage['/kison/lexer.js'].lineData[216]++;
  return visit112_216_1(symbolMap[t] || (symbolMap[t] = self.genShortId('symbol')));
}, 
  mapReverseSymbol: function(rs) {
  _$jscoverage['/kison/lexer.js'].functionData[15]++;
  _$jscoverage['/kison/lexer.js'].lineData[220]++;
  var self = this, symbolMap = self.symbolMap, i, reverseSymbolMap = self.reverseSymbolMap;
  _$jscoverage['/kison/lexer.js'].lineData[224]++;
  if (visit113_224_1(!reverseSymbolMap && symbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[225]++;
    reverseSymbolMap = self.reverseSymbolMap = {};
    _$jscoverage['/kison/lexer.js'].lineData[226]++;
    for (i in symbolMap) {
      _$jscoverage['/kison/lexer.js'].lineData[227]++;
      reverseSymbolMap[symbolMap[i]] = i;
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[231]++;
  if (visit114_231_1(reverseSymbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[232]++;
    return reverseSymbolMap[rs];
  } else {
    _$jscoverage['/kison/lexer.js'].lineData[234]++;
    return rs;
  }
}, 
  mapState: function(s) {
  _$jscoverage['/kison/lexer.js'].functionData[16]++;
  _$jscoverage['/kison/lexer.js'].lineData[239]++;
  var self = this, stateMap = self.stateMap;
  _$jscoverage['/kison/lexer.js'].lineData[241]++;
  if (visit115_241_1(!stateMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[242]++;
    return s;
  }
  _$jscoverage['/kison/lexer.js'].lineData[244]++;
  return visit116_244_1(stateMap[s] || (stateMap[s] = self.genShortId('state')));
}, 
  lex: function() {
  _$jscoverage['/kison/lexer.js'].functionData[17]++;
  _$jscoverage['/kison/lexer.js'].lineData[248]++;
  var self = this, input = self.input, i, rule, m, ret, lines, rules = self.getCurrentRules();
  _$jscoverage['/kison/lexer.js'].lineData[257]++;
  self.match = self.text = '';
  _$jscoverage['/kison/lexer.js'].lineData[259]++;
  if (visit117_259_1(!input)) {
    _$jscoverage['/kison/lexer.js'].lineData[260]++;
    return self.mapSymbol(Lexer.STATIC.END_TAG);
  }
  _$jscoverage['/kison/lexer.js'].lineData[263]++;
  for (i = 0; visit118_263_1(i < rules.length); i++) {
    _$jscoverage['/kison/lexer.js'].lineData[264]++;
    rule = rules[i];
    _$jscoverage['/kison/lexer.js'].lineData[266]++;
    var regexp = visit119_266_1(rule.regexp || rule[1]), token = visit120_267_1(rule.token || rule[0]), action = visit121_268_1(rule.action || visit122_268_2(rule[2] || undefined));
    _$jscoverage['/kison/lexer.js'].lineData[270]++;
    if ((m = input.match(regexp))) {
      _$jscoverage['/kison/lexer.js'].lineData[271]++;
      lines = m[0].match(/\n.*/g);
      _$jscoverage['/kison/lexer.js'].lineData[272]++;
      if (visit123_272_1(lines)) {
        _$jscoverage['/kison/lexer.js'].lineData[273]++;
        self.lineNumber += lines.length;
      }
      _$jscoverage['/kison/lexer.js'].lineData[275]++;
      S.mix(self, {
  firstLine: self.lastLine, 
  lastLine: self.lineNumber + 1, 
  firstColumn: self.lastColumn, 
  lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length});
      _$jscoverage['/kison/lexer.js'].lineData[283]++;
      var match;
      _$jscoverage['/kison/lexer.js'].lineData[285]++;
      match = self.match = m[0];
      _$jscoverage['/kison/lexer.js'].lineData[288]++;
      self.matches = m;
      _$jscoverage['/kison/lexer.js'].lineData[290]++;
      self.text = match;
      _$jscoverage['/kison/lexer.js'].lineData[292]++;
      self.matched += match;
      _$jscoverage['/kison/lexer.js'].lineData[293]++;
      ret = visit124_293_1(action && action.call(self));
      _$jscoverage['/kison/lexer.js'].lineData[294]++;
      if (visit125_294_1(ret === undefined)) {
        _$jscoverage['/kison/lexer.js'].lineData[295]++;
        ret = token;
      } else {
        _$jscoverage['/kison/lexer.js'].lineData[297]++;
        ret = self.mapSymbol(ret);
      }
      _$jscoverage['/kison/lexer.js'].lineData[299]++;
      input = input.slice(match.length);
      _$jscoverage['/kison/lexer.js'].lineData[300]++;
      self.input = input;
      _$jscoverage['/kison/lexer.js'].lineData[302]++;
      if (visit126_302_1(ret)) {
        _$jscoverage['/kison/lexer.js'].lineData[303]++;
        return ret;
      } else {
        _$jscoverage['/kison/lexer.js'].lineData[306]++;
        return self.lex();
      }
    }
  }
}};
  _$jscoverage['/kison/lexer.js'].lineData[313]++;
  return Lexer;
});
