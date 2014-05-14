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
if (! _$jscoverage['/editor/dom-iterator.js']) {
  _$jscoverage['/editor/dom-iterator.js'] = {};
  _$jscoverage['/editor/dom-iterator.js'].lineData = [];
  _$jscoverage['/editor/dom-iterator.js'].lineData[10] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[11] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[12] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[13] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[14] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[15] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[16] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[17] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[30] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[31] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[32] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[34] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[35] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[36] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[39] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[40] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[42] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[45] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[47] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[61] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[66] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[69] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[72] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[75] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[76] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[81] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[83] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[86] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[89] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[90] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[92] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[93] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[94] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[95] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[100] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[103] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[104] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[105] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[106] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[107] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[108] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[113] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[114] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[115] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[119] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[122] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[123] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[125] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[126] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[129] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[133] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[138] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[139] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[140] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[143] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[146] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[147] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[148] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[151] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[152] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[153] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[158] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[159] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[163] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[164] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[168] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[171] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[173] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[174] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[175] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[178] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[179] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[181] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[183] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[186] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[187] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[193] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[194] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[195] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[199] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[203] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[204] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[205] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[207] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[208] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[209] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[210] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[213] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[214] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[215] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[216] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[221] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[222] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[225] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[226] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[230] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[231] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[236] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[238] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[239] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[240] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[242] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[243] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[246] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[247] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[249] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[251] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[255] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[256] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[258] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[260] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[261] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[263] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[264] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[265] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[269] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[271] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[274] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[275] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[279] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[281] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[282] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[285] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[287] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[293] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[298] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[299] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[300] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[301] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[302] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[303] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[304] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[309] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[311] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[313] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[314] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[316] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[318] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[326] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[327] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[331] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[340] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[341] = 0;
  _$jscoverage['/editor/dom-iterator.js'].lineData[344] = 0;
}
if (! _$jscoverage['/editor/dom-iterator.js'].functionData) {
  _$jscoverage['/editor/dom-iterator.js'].functionData = [];
  _$jscoverage['/editor/dom-iterator.js'].functionData[0] = 0;
  _$jscoverage['/editor/dom-iterator.js'].functionData[1] = 0;
  _$jscoverage['/editor/dom-iterator.js'].functionData[2] = 0;
  _$jscoverage['/editor/dom-iterator.js'].functionData[3] = 0;
}
if (! _$jscoverage['/editor/dom-iterator.js'].branchData) {
  _$jscoverage['/editor/dom-iterator.js'].branchData = {};
  _$jscoverage['/editor/dom-iterator.js'].branchData['31'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['42'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['75'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['83'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['100'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['101'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['101'][3] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['105'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['107'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['113'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['133'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['138'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['140'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['143'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['146'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['148'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['148'][2] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['148'][3] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['158'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['163'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['171'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['173'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['183'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['186'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['193'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['199'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['199'][2] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['203'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['204'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['207'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['207'][2] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['209'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['221'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['230'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['230'][2] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['236'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['238'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['239'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['251'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['251'][2] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['251'][3] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['252'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['253'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['256'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['256'][2] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['256'][3] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['258'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['265'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['269'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['287'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['298'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['300'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['300'][2] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['301'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['303'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['303'][2] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['309'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['314'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['314'][2] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['314'][3] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['314'][4] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['316'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['316'][2] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['326'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/editor/dom-iterator.js'].branchData['327'] = [];
  _$jscoverage['/editor/dom-iterator.js'].branchData['327'][1] = new BranchData();
}
_$jscoverage['/editor/dom-iterator.js'].branchData['327'][1].init(37, 32, 'isLast || block.equals(lastNode)');
function visit123_327_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['326'][1].init(13060, 16, '!self._.nextNode');
function visit122_326_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['316'][2].init(128, 93, 'lastChild.prev(bookmarkGuard, 1) || lastChild.next(bookmarkGuard, 1)');
function visit121_316_2(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['316'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['316'][1].init(119, 102, 'UA.ie || lastChild.prev(bookmarkGuard, 1) || lastChild.next(bookmarkGuard, 1)');
function visit120_316_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['314'][4].init(275, 29, 'lastChild.nodeName() === \'br\'');
function visit119_314_4(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['314'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['314'][3].init(220, 51, 'lastChild[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit118_314_3(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['314'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['314'][2].init(220, 84, 'lastChild[0].nodeType === Dom.NodeType.ELEMENT_NODE && lastChild.nodeName() === \'br\'');
function visit117_314_2(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['314'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['314'][1].init(204, 100, 'lastChild[0] && lastChild[0].nodeType === Dom.NodeType.ELEMENT_NODE && lastChild.nodeName() === \'br\'');
function visit116_314_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['309'][1].init(12191, 12, 'removeLastBr');
function visit115_309_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['303'][2].init(184, 51, 'Dom.nodeName(previousSibling[0].lastChild) === \'br\'');
function visit114_303_2(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['303'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['303'][1].init(152, 83, 'previousSibling[0].lastChild && Dom.nodeName(previousSibling[0].lastChild) === \'br\'');
function visit113_303_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['301'][1].init(26, 35, 'previousSibling.nodeName() === \'br\'');
function visit112_301_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['300'][2].init(119, 57, 'previousSibling[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit111_300_2(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['300'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['300'][1].init(97, 79, 'previousSibling[0] && previousSibling[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit110_300_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['298'][1].init(11609, 16, 'removePreviousBr');
function visit109_298_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['287'][1].init(2628, 7, '!isLast');
function visit108_287_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['269'][1].init(222, 54, '!range.checkStartOfBlock() || !range.checkEndOfBlock()');
function visit107_269_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['265'][1].init(1468, 25, 'block.nodeName() !== \'li\'');
function visit106_265_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['258'][1].init(121, 15, 'blockTag || \'p\'');
function visit105_258_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['256'][3].init(911, 25, 'block.nodeName() === \'li\'');
function visit104_256_3(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['256'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['256'][2].init(885, 51, 'self.enforceRealBlocks && block.nodeName() === \'li\'');
function visit103_256_2(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['256'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['256'][1].init(874, 63, '!block || (self.enforceRealBlocks && block.nodeName() === \'li\')');
function visit102_256_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['253'][1].init(65, 73, 'range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit101_253_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['252'][1].init(47, 139, 'checkLimits[startBlockLimit.nodeName()] && range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit100_252_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['251'][3].init(608, 187, '!self.enforceRealBlocks && checkLimits[startBlockLimit.nodeName()] && range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit99_251_3(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['251'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['251'][2].init(584, 19, '!block || !block[0]');
function visit98_251_2(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['251'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['251'][1].init(584, 211, '(!block || !block[0]) && !self.enforceRealBlocks && checkLimits[startBlockLimit.nodeName()] && range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit97_251_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['239'][1].init(26, 19, 'self._.docEndMarker');
function visit96_239_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['238'][1].init(87, 6, '!range');
function visit95_238_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['236'][1].init(8434, 6, '!block');
function visit94_236_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['230'][2].init(5157, 19, 'closeRange && range');
function visit93_230_2(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['230'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['230'][1].init(5146, 31, 'isLast || (closeRange && range)');
function visit92_230_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['221'][1].init(4754, 11, 'includeNode');
function visit91_221_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['209'][1].init(87, 37, 'isLast || parentNode.equals(lastNode)');
function visit90_209_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['207'][2].init(126, 28, 'self.forceBrBreak && {\n  br: 1}');
function visit89_207_2(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['207'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['207'][1].init(96, 59, 'parentNode._4eIsBlockBoundary(self.forceBrBreak && {\n  br: 1})');
function visit88_207_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['204'][1].init(29, 38, '!currentNode[0].nextSibling && !isLast');
function visit87_204_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['203'][1].init(3984, 20, 'range && !closeRange');
function visit86_203_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['199'][2].init(3737, 26, '!closeRange || includeNode');
function visit85_199_2(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['199'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['199'][1].init(3737, 59, '(!closeRange || includeNode) && currentNode.equals(lastNode)');
function visit84_199_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['193'][1].init(3472, 21, 'includeNode && !range');
function visit83_193_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['186'][1].init(184, 51, 'beginWhitespaceRegex.test(currentNode[0].nodeValue)');
function visit82_186_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['183'][1].init(2927, 50, 'currentNode[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit81_183_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['173'][1].init(112, 6, '!range');
function visit80_173_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['171'][1].init(100, 25, 'currentNode[0].firstChild');
function visit79_171_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['163'][1].init(255, 17, 'nodeName !== \'br\'');
function visit78_163_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['158'][1].init(874, 5, 'range');
function visit77_158_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['148'][3].init(320, 17, 'nodeName !== \'hr\'');
function visit76_148_3(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['148'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['148'][2].init(283, 54, '!currentNode[0].childNodes.length && nodeName !== \'hr\'');
function visit75_148_2(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['148'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['148'][1].init(273, 64, '!range && !currentNode[0].childNodes.length && nodeName !== \'hr\'');
function visit74_148_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['146'][1].init(166, 17, 'nodeName === \'br\'');
function visit73_146_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['143'][1].init(204, 44, 'currentNode._4eIsBlockBoundary(forceBrBreak)');
function visit72_143_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['140'][1].init(101, 76, 'self.forceBrBreak && {\n  br: 1}');
function visit71_140_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['138'][1].init(614, 12, '!includeNode');
function visit70_138_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['133'][1].init(375, 53, 'currentNode[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit69_133_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['113'][1].init(2054, 16, '!self._.lastNode');
function visit68_113_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['107'][1].init(119, 29, 'path.block || path.blockLimit');
function visit67_107_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['105'][1].init(180, 27, 'testRange.checkEndOfBlock()');
function visit66_105_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['101'][3].init(57, 110, '!util.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4eIsBlockBoundary()');
function visit65_101_3(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['101'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['101'][2].init(1301, 54, 'self._.lastNode[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit64_101_2(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['101'][1].init(39, 168, 'self._.lastNode[0].nodeType === Dom.NodeType.TEXT_NODE && !util.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4eIsBlockBoundary()');
function visit63_101_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['100'][1].init(1259, 208, 'self._.lastNode && self._.lastNode[0].nodeType === Dom.NodeType.TEXT_NODE && !util.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4eIsBlockBoundary()');
function visit62_100_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['83'][1].init(294, 36, 'self.forceBrBreak || !self.enlargeBr');
function visit61_83_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['75'][1].init(526, 16, '!self._.lastNode');
function visit60_75_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['42'][1].init(323, 12, 'self._ || {}');
function visit59_42_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].branchData['31'][1].init(14, 20, 'arguments.length < 1');
function visit58_31_1(result) {
  _$jscoverage['/editor/dom-iterator.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom-iterator.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/dom-iterator.js'].functionData[0]++;
  _$jscoverage['/editor/dom-iterator.js'].lineData[11]++;
  var util = require('util');
  _$jscoverage['/editor/dom-iterator.js'].lineData[12]++;
  var Node = require('node');
  _$jscoverage['/editor/dom-iterator.js'].lineData[13]++;
  var Walker = require('./walker');
  _$jscoverage['/editor/dom-iterator.js'].lineData[14]++;
  var KERange = require('./range');
  _$jscoverage['/editor/dom-iterator.js'].lineData[15]++;
  var Editor = require('./base');
  _$jscoverage['/editor/dom-iterator.js'].lineData[16]++;
  var ElementPath = require('./element-path');
  _$jscoverage['/editor/dom-iterator.js'].lineData[17]++;
  var TRUE = true, FALSE = false, NULL = null, UA = require('ua'), KER = Editor.RangeType, Dom = require('dom');
  _$jscoverage['/editor/dom-iterator.js'].lineData[30]++;
  function Iterator(range) {
    _$jscoverage['/editor/dom-iterator.js'].functionData[1]++;
    _$jscoverage['/editor/dom-iterator.js'].lineData[31]++;
    if (visit58_31_1(arguments.length < 1)) {
      _$jscoverage['/editor/dom-iterator.js'].lineData[32]++;
      return;
    }
    _$jscoverage['/editor/dom-iterator.js'].lineData[34]++;
    var self = this;
    _$jscoverage['/editor/dom-iterator.js'].lineData[35]++;
    self.range = range;
    _$jscoverage['/editor/dom-iterator.js'].lineData[36]++;
    self.forceBrBreak = FALSE;
    _$jscoverage['/editor/dom-iterator.js'].lineData[39]++;
    self.enlargeBr = TRUE;
    _$jscoverage['/editor/dom-iterator.js'].lineData[40]++;
    self.enforceRealBlocks = FALSE;
    _$jscoverage['/editor/dom-iterator.js'].lineData[42]++;
    self._ = visit59_42_1(self._ || {});
  }
  _$jscoverage['/editor/dom-iterator.js'].lineData[45]++;
  var beginWhitespaceRegex = /^[\r\n\t ]*$/;
  _$jscoverage['/editor/dom-iterator.js'].lineData[47]++;
  util.augment(Iterator, {
  getNextParagraph: function(blockTag) {
  _$jscoverage['/editor/dom-iterator.js'].functionData[2]++;
  _$jscoverage['/editor/dom-iterator.js'].lineData[61]++;
  var block, lastNode, self = this;
  _$jscoverage['/editor/dom-iterator.js'].lineData[66]++;
  var range;
  _$jscoverage['/editor/dom-iterator.js'].lineData[69]++;
  var isLast;
  _$jscoverage['/editor/dom-iterator.js'].lineData[72]++;
  var removePreviousBr, removeLastBr;
  _$jscoverage['/editor/dom-iterator.js'].lineData[75]++;
  if (visit60_75_1(!self._.lastNode)) {
    _$jscoverage['/editor/dom-iterator.js'].lineData[76]++;
    range = self.range.clone();
    _$jscoverage['/editor/dom-iterator.js'].lineData[81]++;
    range.shrink(KER.SHRINK_ELEMENT, TRUE);
    _$jscoverage['/editor/dom-iterator.js'].lineData[83]++;
    range.enlarge(visit61_83_1(self.forceBrBreak || !self.enlargeBr) ? KER.ENLARGE_LIST_ITEM_CONTENTS : KER.ENLARGE_BLOCK_CONTENTS);
    _$jscoverage['/editor/dom-iterator.js'].lineData[86]++;
    var walker = new Walker(range), ignoreBookmarkTextEvaluator = Walker.bookmark(TRUE, TRUE);
    _$jscoverage['/editor/dom-iterator.js'].lineData[89]++;
    walker.evaluator = ignoreBookmarkTextEvaluator;
    _$jscoverage['/editor/dom-iterator.js'].lineData[90]++;
    self._.nextNode = walker.next();
    _$jscoverage['/editor/dom-iterator.js'].lineData[92]++;
    walker = new Walker(range);
    _$jscoverage['/editor/dom-iterator.js'].lineData[93]++;
    walker.evaluator = ignoreBookmarkTextEvaluator;
    _$jscoverage['/editor/dom-iterator.js'].lineData[94]++;
    lastNode = walker.previous();
    _$jscoverage['/editor/dom-iterator.js'].lineData[95]++;
    self._.lastNode = lastNode._4eNextSourceNode(TRUE);
    _$jscoverage['/editor/dom-iterator.js'].lineData[100]++;
    if (visit62_100_1(self._.lastNode && visit63_101_1(visit64_101_2(self._.lastNode[0].nodeType === Dom.NodeType.TEXT_NODE) && visit65_101_3(!util.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4eIsBlockBoundary())))) {
      _$jscoverage['/editor/dom-iterator.js'].lineData[103]++;
      var testRange = new KERange(range.document);
      _$jscoverage['/editor/dom-iterator.js'].lineData[104]++;
      testRange.moveToPosition(self._.lastNode, KER.POSITION_AFTER_END);
      _$jscoverage['/editor/dom-iterator.js'].lineData[105]++;
      if (visit66_105_1(testRange.checkEndOfBlock())) {
        _$jscoverage['/editor/dom-iterator.js'].lineData[106]++;
        var path = new ElementPath(testRange.endContainer);
        _$jscoverage['/editor/dom-iterator.js'].lineData[107]++;
        var lastBlock = visit67_107_1(path.block || path.blockLimit);
        _$jscoverage['/editor/dom-iterator.js'].lineData[108]++;
        self._.lastNode = lastBlock._4eNextSourceNode(TRUE);
      }
    }
    _$jscoverage['/editor/dom-iterator.js'].lineData[113]++;
    if (visit68_113_1(!self._.lastNode)) {
      _$jscoverage['/editor/dom-iterator.js'].lineData[114]++;
      self._.lastNode = self._.docEndMarker = new Node(range.document.createTextNode(''));
      _$jscoverage['/editor/dom-iterator.js'].lineData[115]++;
      Dom.insertAfter(self._.lastNode[0], lastNode[0]);
    }
    _$jscoverage['/editor/dom-iterator.js'].lineData[119]++;
    range = NULL;
  }
  _$jscoverage['/editor/dom-iterator.js'].lineData[122]++;
  var currentNode = self._.nextNode;
  _$jscoverage['/editor/dom-iterator.js'].lineData[123]++;
  lastNode = self._.lastNode;
  _$jscoverage['/editor/dom-iterator.js'].lineData[125]++;
  self._.nextNode = NULL;
  _$jscoverage['/editor/dom-iterator.js'].lineData[126]++;
  while (currentNode) {
    _$jscoverage['/editor/dom-iterator.js'].lineData[129]++;
    var closeRange = FALSE;
    _$jscoverage['/editor/dom-iterator.js'].lineData[133]++;
    var includeNode = (visit69_133_1(currentNode[0].nodeType !== Dom.NodeType.ELEMENT_NODE)), continueFromSibling = FALSE;
    _$jscoverage['/editor/dom-iterator.js'].lineData[138]++;
    if (visit70_138_1(!includeNode)) {
      _$jscoverage['/editor/dom-iterator.js'].lineData[139]++;
      var nodeName = currentNode.nodeName();
      _$jscoverage['/editor/dom-iterator.js'].lineData[140]++;
      var forceBrBreak = visit71_140_1(self.forceBrBreak && {
  br: 1});
      _$jscoverage['/editor/dom-iterator.js'].lineData[143]++;
      if (visit72_143_1(currentNode._4eIsBlockBoundary(forceBrBreak))) {
        _$jscoverage['/editor/dom-iterator.js'].lineData[146]++;
        if (visit73_146_1(nodeName === 'br')) {
          _$jscoverage['/editor/dom-iterator.js'].lineData[147]++;
          includeNode = TRUE;
        } else {
          _$jscoverage['/editor/dom-iterator.js'].lineData[148]++;
          if (visit74_148_1(!range && visit75_148_2(!currentNode[0].childNodes.length && visit76_148_3(nodeName !== 'hr')))) {
            _$jscoverage['/editor/dom-iterator.js'].lineData[151]++;
            block = currentNode;
            _$jscoverage['/editor/dom-iterator.js'].lineData[152]++;
            isLast = currentNode.equals(lastNode);
            _$jscoverage['/editor/dom-iterator.js'].lineData[153]++;
            break;
          }
        }
        _$jscoverage['/editor/dom-iterator.js'].lineData[158]++;
        if (visit77_158_1(range)) {
          _$jscoverage['/editor/dom-iterator.js'].lineData[159]++;
          range.setEndAt(currentNode, KER.POSITION_BEFORE_START);
          _$jscoverage['/editor/dom-iterator.js'].lineData[163]++;
          if (visit78_163_1(nodeName !== 'br')) {
            _$jscoverage['/editor/dom-iterator.js'].lineData[164]++;
            self._.nextNode = currentNode;
          }
        }
        _$jscoverage['/editor/dom-iterator.js'].lineData[168]++;
        closeRange = TRUE;
      } else {
        _$jscoverage['/editor/dom-iterator.js'].lineData[171]++;
        if (visit79_171_1(currentNode[0].firstChild)) {
          _$jscoverage['/editor/dom-iterator.js'].lineData[173]++;
          if (visit80_173_1(!range)) {
            _$jscoverage['/editor/dom-iterator.js'].lineData[174]++;
            range = new KERange(self.range.document);
            _$jscoverage['/editor/dom-iterator.js'].lineData[175]++;
            range.setStartAt(currentNode, KER.POSITION_BEFORE_START);
          }
          _$jscoverage['/editor/dom-iterator.js'].lineData[178]++;
          currentNode = new Node(currentNode[0].firstChild);
          _$jscoverage['/editor/dom-iterator.js'].lineData[179]++;
          continue;
        }
        _$jscoverage['/editor/dom-iterator.js'].lineData[181]++;
        includeNode = TRUE;
      }
    } else {
      _$jscoverage['/editor/dom-iterator.js'].lineData[183]++;
      if (visit81_183_1(currentNode[0].nodeType === Dom.NodeType.TEXT_NODE)) {
        _$jscoverage['/editor/dom-iterator.js'].lineData[186]++;
        if (visit82_186_1(beginWhitespaceRegex.test(currentNode[0].nodeValue))) {
          _$jscoverage['/editor/dom-iterator.js'].lineData[187]++;
          includeNode = FALSE;
        }
      }
    }
    _$jscoverage['/editor/dom-iterator.js'].lineData[193]++;
    if (visit83_193_1(includeNode && !range)) {
      _$jscoverage['/editor/dom-iterator.js'].lineData[194]++;
      range = new KERange(self.range.document);
      _$jscoverage['/editor/dom-iterator.js'].lineData[195]++;
      range.setStartAt(currentNode, KER.POSITION_BEFORE_START);
    }
    _$jscoverage['/editor/dom-iterator.js'].lineData[199]++;
    isLast = visit84_199_1((visit85_199_2(!closeRange || includeNode)) && currentNode.equals(lastNode));
    _$jscoverage['/editor/dom-iterator.js'].lineData[203]++;
    if (visit86_203_1(range && !closeRange)) {
      _$jscoverage['/editor/dom-iterator.js'].lineData[204]++;
      while (visit87_204_1(!currentNode[0].nextSibling && !isLast)) {
        _$jscoverage['/editor/dom-iterator.js'].lineData[205]++;
        var parentNode = currentNode.parent();
        _$jscoverage['/editor/dom-iterator.js'].lineData[207]++;
        if (visit88_207_1(parentNode._4eIsBlockBoundary(visit89_207_2(self.forceBrBreak && {
  br: 1})))) {
          _$jscoverage['/editor/dom-iterator.js'].lineData[208]++;
          closeRange = TRUE;
          _$jscoverage['/editor/dom-iterator.js'].lineData[209]++;
          isLast = visit90_209_1(isLast || parentNode.equals(lastNode));
          _$jscoverage['/editor/dom-iterator.js'].lineData[210]++;
          break;
        }
        _$jscoverage['/editor/dom-iterator.js'].lineData[213]++;
        currentNode = parentNode;
        _$jscoverage['/editor/dom-iterator.js'].lineData[214]++;
        includeNode = TRUE;
        _$jscoverage['/editor/dom-iterator.js'].lineData[215]++;
        isLast = currentNode.equals(lastNode);
        _$jscoverage['/editor/dom-iterator.js'].lineData[216]++;
        continueFromSibling = TRUE;
      }
    }
    _$jscoverage['/editor/dom-iterator.js'].lineData[221]++;
    if (visit91_221_1(includeNode)) {
      _$jscoverage['/editor/dom-iterator.js'].lineData[222]++;
      range.setEndAt(currentNode, KER.POSITION_AFTER_END);
    }
    _$jscoverage['/editor/dom-iterator.js'].lineData[225]++;
    currentNode = currentNode._4eNextSourceNode(continueFromSibling, NULL, lastNode);
    _$jscoverage['/editor/dom-iterator.js'].lineData[226]++;
    isLast = !currentNode;
    _$jscoverage['/editor/dom-iterator.js'].lineData[230]++;
    if (visit92_230_1(isLast || (visit93_230_2(closeRange && range)))) {
      _$jscoverage['/editor/dom-iterator.js'].lineData[231]++;
      break;
    }
  }
  _$jscoverage['/editor/dom-iterator.js'].lineData[236]++;
  if (visit94_236_1(!block)) {
    _$jscoverage['/editor/dom-iterator.js'].lineData[238]++;
    if (visit95_238_1(!range)) {
      _$jscoverage['/editor/dom-iterator.js'].lineData[239]++;
      if (visit96_239_1(self._.docEndMarker)) {
        _$jscoverage['/editor/dom-iterator.js'].lineData[240]++;
        self._.docEndMarker._4eRemove();
      }
      _$jscoverage['/editor/dom-iterator.js'].lineData[242]++;
      self._.nextNode = NULL;
      _$jscoverage['/editor/dom-iterator.js'].lineData[243]++;
      return NULL;
    }
    _$jscoverage['/editor/dom-iterator.js'].lineData[246]++;
    var startPath = new ElementPath(range.startContainer);
    _$jscoverage['/editor/dom-iterator.js'].lineData[247]++;
    var startBlockLimit = startPath.blockLimit, checkLimits = {
  div: 1, 
  th: 1, 
  td: 1};
    _$jscoverage['/editor/dom-iterator.js'].lineData[249]++;
    block = startPath.block;
    _$jscoverage['/editor/dom-iterator.js'].lineData[251]++;
    if (visit97_251_1((visit98_251_2(!block || !block[0])) && visit99_251_3(!self.enforceRealBlocks && visit100_252_1(checkLimits[startBlockLimit.nodeName()] && visit101_253_1(range.checkStartOfBlock() && range.checkEndOfBlock()))))) {
      _$jscoverage['/editor/dom-iterator.js'].lineData[255]++;
      block = startBlockLimit;
    } else {
      _$jscoverage['/editor/dom-iterator.js'].lineData[256]++;
      if (visit102_256_1(!block || (visit103_256_2(self.enforceRealBlocks && visit104_256_3(block.nodeName() === 'li'))))) {
        _$jscoverage['/editor/dom-iterator.js'].lineData[258]++;
        block = new Node(self.range.document.createElement(visit105_258_1(blockTag || 'p')));
        _$jscoverage['/editor/dom-iterator.js'].lineData[260]++;
        block[0].appendChild(range.extractContents());
        _$jscoverage['/editor/dom-iterator.js'].lineData[261]++;
        block._4eTrim();
        _$jscoverage['/editor/dom-iterator.js'].lineData[263]++;
        range.insertNode(block);
        _$jscoverage['/editor/dom-iterator.js'].lineData[264]++;
        removePreviousBr = removeLastBr = TRUE;
      } else {
        _$jscoverage['/editor/dom-iterator.js'].lineData[265]++;
        if (visit106_265_1(block.nodeName() !== 'li')) {
          _$jscoverage['/editor/dom-iterator.js'].lineData[269]++;
          if (visit107_269_1(!range.checkStartOfBlock() || !range.checkEndOfBlock())) {
            _$jscoverage['/editor/dom-iterator.js'].lineData[271]++;
            block = block.clone(FALSE);
            _$jscoverage['/editor/dom-iterator.js'].lineData[274]++;
            block[0].appendChild(range.extractContents());
            _$jscoverage['/editor/dom-iterator.js'].lineData[275]++;
            block._4eTrim();
            _$jscoverage['/editor/dom-iterator.js'].lineData[279]++;
            var splitInfo = range.splitBlock();
            _$jscoverage['/editor/dom-iterator.js'].lineData[281]++;
            removePreviousBr = !splitInfo.wasStartOfBlock;
            _$jscoverage['/editor/dom-iterator.js'].lineData[282]++;
            removeLastBr = !splitInfo.wasEndOfBlock;
            _$jscoverage['/editor/dom-iterator.js'].lineData[285]++;
            range.insertNode(block);
          }
        } else {
          _$jscoverage['/editor/dom-iterator.js'].lineData[287]++;
          if (visit108_287_1(!isLast)) {
            _$jscoverage['/editor/dom-iterator.js'].lineData[293]++;
            self._.nextNode = (block.equals(lastNode) ? NULL : range.getBoundaryNodes().endNode._4eNextSourceNode(TRUE, NULL, lastNode));
          }
        }
      }
    }
  }
  _$jscoverage['/editor/dom-iterator.js'].lineData[298]++;
  if (visit109_298_1(removePreviousBr)) {
    _$jscoverage['/editor/dom-iterator.js'].lineData[299]++;
    var previousSibling = new Node(block[0].previousSibling);
    _$jscoverage['/editor/dom-iterator.js'].lineData[300]++;
    if (visit110_300_1(previousSibling[0] && visit111_300_2(previousSibling[0].nodeType === Dom.NodeType.ELEMENT_NODE))) {
      _$jscoverage['/editor/dom-iterator.js'].lineData[301]++;
      if (visit112_301_1(previousSibling.nodeName() === 'br')) {
        _$jscoverage['/editor/dom-iterator.js'].lineData[302]++;
        previousSibling._4eRemove();
      } else {
        _$jscoverage['/editor/dom-iterator.js'].lineData[303]++;
        if (visit113_303_1(previousSibling[0].lastChild && visit114_303_2(Dom.nodeName(previousSibling[0].lastChild) === 'br'))) {
          _$jscoverage['/editor/dom-iterator.js'].lineData[304]++;
          Dom._4eRemove(previousSibling[0].lastChild);
        }
      }
    }
  }
  _$jscoverage['/editor/dom-iterator.js'].lineData[309]++;
  if (visit115_309_1(removeLastBr)) {
    _$jscoverage['/editor/dom-iterator.js'].lineData[311]++;
    var bookmarkGuard = Walker.bookmark(FALSE, TRUE);
    _$jscoverage['/editor/dom-iterator.js'].lineData[313]++;
    var lastChild = new Node(block[0].lastChild);
    _$jscoverage['/editor/dom-iterator.js'].lineData[314]++;
    if (visit116_314_1(lastChild[0] && visit117_314_2(visit118_314_3(lastChild[0].nodeType === Dom.NodeType.ELEMENT_NODE) && visit119_314_4(lastChild.nodeName() === 'br')))) {
      _$jscoverage['/editor/dom-iterator.js'].lineData[316]++;
      if (visit120_316_1(UA.ie || visit121_316_2(lastChild.prev(bookmarkGuard, 1) || lastChild.next(bookmarkGuard, 1)))) {
        _$jscoverage['/editor/dom-iterator.js'].lineData[318]++;
        lastChild.remove();
      }
    }
  }
  _$jscoverage['/editor/dom-iterator.js'].lineData[326]++;
  if (visit122_326_1(!self._.nextNode)) {
    _$jscoverage['/editor/dom-iterator.js'].lineData[327]++;
    self._.nextNode = (visit123_327_1(isLast || block.equals(lastNode))) ? NULL : block._4eNextSourceNode(TRUE, NULL, lastNode);
  }
  _$jscoverage['/editor/dom-iterator.js'].lineData[331]++;
  return block;
}});
  _$jscoverage['/editor/dom-iterator.js'].lineData[340]++;
  KERange.prototype.createIterator = function() {
  _$jscoverage['/editor/dom-iterator.js'].functionData[3]++;
  _$jscoverage['/editor/dom-iterator.js'].lineData[341]++;
  return new Iterator(this);
};
  _$jscoverage['/editor/dom-iterator.js'].lineData[344]++;
  return Iterator;
});
