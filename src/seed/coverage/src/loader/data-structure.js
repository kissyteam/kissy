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
if (! _$jscoverage['/loader/data-structure.js']) {
  _$jscoverage['/loader/data-structure.js'] = {};
  _$jscoverage['/loader/data-structure.js'].lineData = [];
  _$jscoverage['/loader/data-structure.js'].lineData[6] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[7] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[12] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[13] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[23] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[24] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[27] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[31] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[40] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[48] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[56] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[60] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[62] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[73] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[74] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[75] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[77] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[85] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[93] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[101] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[109] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[117] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[125] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[129] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[136] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[137] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[141] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[146] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[151] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[155] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[157] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[158] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[159] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[162] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[174] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[175] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[184] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[189] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[198] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[202] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[206] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[207] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[209] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[210] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[211] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[212] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[214] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[216] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[217] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[221] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[229] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[231] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[232] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[233] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[235] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[237] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[239] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[247] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[254] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[256] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[257] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[259] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[260] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[261] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[263] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[266] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[268] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[269] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[270] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[271] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[274] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[276] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[284] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[286] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[287] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[288] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[290] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[298] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[299] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[307] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[315] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[316] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[326] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[327] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[335] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[336] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[344] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[347] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[348] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[349] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[350] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[353] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[361] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[363] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[364] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[373] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[378] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[379] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[380] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[383] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[385] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[386] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[387] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[392] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[394] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[395] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[399] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[401] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[402] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[405] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[408] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[413] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[414] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[418] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[419] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[420] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[423] = 0;
}
if (! _$jscoverage['/loader/data-structure.js'].functionData) {
  _$jscoverage['/loader/data-structure.js'].functionData = [];
  _$jscoverage['/loader/data-structure.js'].functionData[0] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[1] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[2] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[3] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[4] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[5] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[6] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[7] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[8] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[9] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[10] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[11] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[12] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[13] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[14] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[15] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[16] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[17] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[18] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[19] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[20] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[21] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[22] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[23] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[24] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[25] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[26] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[27] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[28] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[29] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[30] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[31] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[32] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[33] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[34] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[35] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[36] = 0;
}
if (! _$jscoverage['/loader/data-structure.js'].branchData) {
  _$jscoverage['/loader/data-structure.js'].branchData = {};
  _$jscoverage['/loader/data-structure.js'].branchData['63'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['74'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['209'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['214'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['231'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['232'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['254'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['256'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['263'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['286'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['299'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['316'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['327'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['336'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['347'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['347'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['348'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['349'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['378'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['378'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['379'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['380'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['382'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['401'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['419'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['419'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['423'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['423'][1] = new BranchData();
}
_$jscoverage['/loader/data-structure.js'].branchData['423'][1].init(308, 32, 'packages[pName] || systemPackage');
function visit420_423_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['419'][2].init(56, 23, 'p.length > pName.length');
function visit419_419_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['419'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['419'][1].init(17, 62, 'S.startsWith(modNameSlash, p + \'/\') && p.length > pName.length');
function visit418_419_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['401'][1].init(185, 24, 'm.getPackage().isDebug()');
function visit417_401_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['382'][1].init(112, 35, 'normalizedRequiresStatus === status');
function visit416_382_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['380'][1].init(338, 149, '(normalizedRequires = self.normalizedRequires) && (normalizedRequiresStatus === status)');
function visit415_380_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['379'][1].init(24, 14, 'requires || []');
function visit414_379_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['378'][2].init(249, 21, 'requires.length === 0');
function visit413_378_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['378'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['378'][1].init(236, 34, '!requires || requires.length === 0');
function visit412_378_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['349'][1].init(249, 18, '!requiresWithAlias');
function visit411_349_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['348'][1].init(24, 14, 'requires || []');
function visit410_348_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['347'][2].init(161, 21, 'requires.length === 0');
function visit409_347_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['347'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['347'][1].init(148, 34, '!requires || requires.length === 0');
function visit408_347_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['336'][1].init(49, 46, 'self.charset || self.getPackage().getCharset()');
function visit407_336_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['327'][1].init(49, 38, 'self.tag || self.getPackage().getTag()');
function visit406_327_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['316'][1].init(49, 92, 'self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name))');
function visit405_316_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['299'][1].init(49, 55, 'self.path || (self.path = defaultComponentJsName(self))');
function visit404_299_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['286'][1].init(75, 14, '!self.fullpath');
function visit403_286_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['263'][1].init(212, 171, 'packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.name)');
function visit402_263_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['256'][1].init(66, 13, 'self.fullpath');
function visit401_256_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['254'][1].init(206, 17, '!self.fullPathUri');
function visit400_254_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['232'][1].init(21, 48, 'Path.extname(self.name).toLowerCase() === \'.css\'');
function visit399_232_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['231'][1].init(77, 2, '!v');
function visit398_231_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['214'][1].init(27, 12, 'e.stack || e');
function visit397_214_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['209'][1].init(120, 7, 'i < len');
function visit396_209_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['74'][1].init(46, 16, '!self.packageUri');
function visit395_74_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['63'][1].init(-1, 47, 'packageName && !self.isIgnorePackageNameInUri()');
function visit394_63_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/data-structure.js'].functionData[0]++;
  _$jscoverage['/loader/data-structure.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, IGNORE_PACKAGE_NAME_IN_URI = 'ignorePackageNameInUri', Utils = Loader.Utils;
  _$jscoverage['/loader/data-structure.js'].lineData[12]++;
  function forwardSystemPackage(self, property) {
    _$jscoverage['/loader/data-structure.js'].functionData[1]++;
    _$jscoverage['/loader/data-structure.js'].lineData[13]++;
    return property in self ? self[property] : self.runtime.Config[property];
  }
  _$jscoverage['/loader/data-structure.js'].lineData[23]++;
  function Package(cfg) {
    _$jscoverage['/loader/data-structure.js'].functionData[2]++;
    _$jscoverage['/loader/data-structure.js'].lineData[24]++;
    S.mix(this, cfg);
  }
  _$jscoverage['/loader/data-structure.js'].lineData[27]++;
  Package.prototype = {
  constructor: Package, 
  reset: function(cfg) {
  _$jscoverage['/loader/data-structure.js'].functionData[3]++;
  _$jscoverage['/loader/data-structure.js'].lineData[31]++;
  S.mix(this, cfg);
}, 
  getTag: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[4]++;
  _$jscoverage['/loader/data-structure.js'].lineData[40]++;
  return forwardSystemPackage(this, 'tag');
}, 
  getName: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[5]++;
  _$jscoverage['/loader/data-structure.js'].lineData[48]++;
  return this.name;
}, 
  'getBase': function() {
  _$jscoverage['/loader/data-structure.js'].functionData[6]++;
  _$jscoverage['/loader/data-structure.js'].lineData[56]++;
  return forwardSystemPackage(this, 'base');
}, 
  getPrefixUriForCombo: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[7]++;
  _$jscoverage['/loader/data-structure.js'].lineData[60]++;
  var self = this, packageName = self.name;
  _$jscoverage['/loader/data-structure.js'].lineData[62]++;
  return self.getBase() + (visit394_63_1(packageName && !self.isIgnorePackageNameInUri()) ? (packageName + '/') : '');
}, 
  getPackageUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[8]++;
  _$jscoverage['/loader/data-structure.js'].lineData[73]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[74]++;
  if (visit395_74_1(!self.packageUri)) {
    _$jscoverage['/loader/data-structure.js'].lineData[75]++;
    self.packageUri = new S.Uri(this.getPrefixUriForCombo());
  }
  _$jscoverage['/loader/data-structure.js'].lineData[77]++;
  return self.packageUri;
}, 
  getBaseUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[9]++;
  _$jscoverage['/loader/data-structure.js'].lineData[85]++;
  return forwardSystemPackage(this, 'baseUri');
}, 
  isDebug: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[10]++;
  _$jscoverage['/loader/data-structure.js'].lineData[93]++;
  return forwardSystemPackage(this, 'debug');
}, 
  isIgnorePackageNameInUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[11]++;
  _$jscoverage['/loader/data-structure.js'].lineData[101]++;
  return forwardSystemPackage(this, IGNORE_PACKAGE_NAME_IN_URI);
}, 
  getCharset: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[12]++;
  _$jscoverage['/loader/data-structure.js'].lineData[109]++;
  return forwardSystemPackage(this, 'charset');
}, 
  isCombine: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[13]++;
  _$jscoverage['/loader/data-structure.js'].lineData[117]++;
  return forwardSystemPackage(this, 'combine');
}, 
  getGroup: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[14]++;
  _$jscoverage['/loader/data-structure.js'].lineData[125]++;
  return forwardSystemPackage(this, 'group');
}};
  _$jscoverage['/loader/data-structure.js'].lineData[129]++;
  Loader.Package = Package;
  _$jscoverage['/loader/data-structure.js'].lineData[136]++;
  function Module(cfg) {
    _$jscoverage['/loader/data-structure.js'].functionData[15]++;
    _$jscoverage['/loader/data-structure.js'].lineData[137]++;
    var module = this;
    _$jscoverage['/loader/data-structure.js'].lineData[141]++;
    module.exports = {};
    _$jscoverage['/loader/data-structure.js'].lineData[146]++;
    module.status = Loader.Status.INIT;
    _$jscoverage['/loader/data-structure.js'].lineData[151]++;
    module.name = undefined;
    _$jscoverage['/loader/data-structure.js'].lineData[155]++;
    module.factory = undefined;
    _$jscoverage['/loader/data-structure.js'].lineData[157]++;
    module.cjs = 1;
    _$jscoverage['/loader/data-structure.js'].lineData[158]++;
    S.mix(module, cfg);
    _$jscoverage['/loader/data-structure.js'].lineData[159]++;
    module.waitedCallbacks = [];
  }
  _$jscoverage['/loader/data-structure.js'].lineData[162]++;
  Module.prototype = {
  kissy: 1, 
  constructor: Module, 
  'use': function(relativeName, fn) {
  _$jscoverage['/loader/data-structure.js'].functionData[16]++;
  _$jscoverage['/loader/data-structure.js'].lineData[174]++;
  relativeName = Utils.getModNamesAsArray(relativeName);
  _$jscoverage['/loader/data-structure.js'].lineData[175]++;
  return KISSY.use(Utils.normalDepModuleName(this.name, relativeName), fn);
}, 
  'resolve': function(relativePath) {
  _$jscoverage['/loader/data-structure.js'].functionData[17]++;
  _$jscoverage['/loader/data-structure.js'].lineData[184]++;
  return this.getFullPathUri().resolve(relativePath);
}, 
  'resolveByName': function(relativeName) {
  _$jscoverage['/loader/data-structure.js'].functionData[18]++;
  _$jscoverage['/loader/data-structure.js'].lineData[189]++;
  return Utils.normalDepModuleName(this.name, relativeName);
}, 
  require: function(moduleName) {
  _$jscoverage['/loader/data-structure.js'].functionData[19]++;
  _$jscoverage['/loader/data-structure.js'].lineData[198]++;
  return S.require(moduleName, this.name);
}, 
  wait: function(callback) {
  _$jscoverage['/loader/data-structure.js'].functionData[20]++;
  _$jscoverage['/loader/data-structure.js'].lineData[202]++;
  this.waitedCallbacks.push(callback);
}, 
  notifyAll: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[21]++;
  _$jscoverage['/loader/data-structure.js'].lineData[206]++;
  var callback;
  _$jscoverage['/loader/data-structure.js'].lineData[207]++;
  var len = this.waitedCallbacks.length, i = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[209]++;
  for (; visit396_209_1(i < len); i++) {
    _$jscoverage['/loader/data-structure.js'].lineData[210]++;
    callback = this.waitedCallbacks[i];
    _$jscoverage['/loader/data-structure.js'].lineData[211]++;
    try {
      _$jscoverage['/loader/data-structure.js'].lineData[212]++;
      callback(this);
    }    catch (e) {
  _$jscoverage['/loader/data-structure.js'].lineData[214]++;
  S.log(visit397_214_1(e.stack || e), 'error');
  _$jscoverage['/loader/data-structure.js'].lineData[216]++;
  setTimeout(function() {
  _$jscoverage['/loader/data-structure.js'].functionData[22]++;
  _$jscoverage['/loader/data-structure.js'].lineData[217]++;
  throw e;
}, 0);
}
  }
  _$jscoverage['/loader/data-structure.js'].lineData[221]++;
  this.waitedCallbacks = [];
}, 
  getType: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[23]++;
  _$jscoverage['/loader/data-structure.js'].lineData[229]++;
  var self = this, v = self.type;
  _$jscoverage['/loader/data-structure.js'].lineData[231]++;
  if (visit398_231_1(!v)) {
    _$jscoverage['/loader/data-structure.js'].lineData[232]++;
    if (visit399_232_1(Path.extname(self.name).toLowerCase() === '.css')) {
      _$jscoverage['/loader/data-structure.js'].lineData[233]++;
      v = 'css';
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[235]++;
      v = 'js';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[237]++;
    self.type = v;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[239]++;
  return v;
}, 
  getFullPathUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[24]++;
  _$jscoverage['/loader/data-structure.js'].lineData[247]++;
  var self = this, t, fullPathUri, packageBaseUri, packageInfo, packageName, path;
  _$jscoverage['/loader/data-structure.js'].lineData[254]++;
  if (visit400_254_1(!self.fullPathUri)) {
    _$jscoverage['/loader/data-structure.js'].lineData[256]++;
    if (visit401_256_1(self.fullpath)) {
      _$jscoverage['/loader/data-structure.js'].lineData[257]++;
      fullPathUri = new S.Uri(self.fullpath);
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[259]++;
      packageInfo = self.getPackage();
      _$jscoverage['/loader/data-structure.js'].lineData[260]++;
      packageBaseUri = packageInfo.getBaseUri();
      _$jscoverage['/loader/data-structure.js'].lineData[261]++;
      path = self.getPath();
      _$jscoverage['/loader/data-structure.js'].lineData[263]++;
      if (visit402_263_1(packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.name))) {
        _$jscoverage['/loader/data-structure.js'].lineData[266]++;
        path = Path.relative(packageName, path);
      }
      _$jscoverage['/loader/data-structure.js'].lineData[268]++;
      fullPathUri = packageBaseUri.resolve(path);
      _$jscoverage['/loader/data-structure.js'].lineData[269]++;
      if ((t = self.getTag())) {
        _$jscoverage['/loader/data-structure.js'].lineData[270]++;
        t += '.' + self.getType();
        _$jscoverage['/loader/data-structure.js'].lineData[271]++;
        fullPathUri.query.set('t', t);
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[274]++;
    self.fullPathUri = fullPathUri;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[276]++;
  return self.fullPathUri;
}, 
  getFullPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[25]++;
  _$jscoverage['/loader/data-structure.js'].lineData[284]++;
  var self = this, fullPathUri;
  _$jscoverage['/loader/data-structure.js'].lineData[286]++;
  if (visit403_286_1(!self.fullpath)) {
    _$jscoverage['/loader/data-structure.js'].lineData[287]++;
    fullPathUri = self.getFullPathUri();
    _$jscoverage['/loader/data-structure.js'].lineData[288]++;
    self.fullpath = fullPathUri.toString();
  }
  _$jscoverage['/loader/data-structure.js'].lineData[290]++;
  return self.fullpath;
}, 
  getPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[26]++;
  _$jscoverage['/loader/data-structure.js'].lineData[298]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[299]++;
  return visit404_299_1(self.path || (self.path = defaultComponentJsName(self)));
}, 
  getName: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[27]++;
  _$jscoverage['/loader/data-structure.js'].lineData[307]++;
  return this.name;
}, 
  getPackage: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[28]++;
  _$jscoverage['/loader/data-structure.js'].lineData[315]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[316]++;
  return visit405_316_1(self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name)));
}, 
  getTag: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[29]++;
  _$jscoverage['/loader/data-structure.js'].lineData[326]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[327]++;
  return visit406_327_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[30]++;
  _$jscoverage['/loader/data-structure.js'].lineData[335]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[336]++;
  return visit407_336_1(self.charset || self.getPackage().getCharset());
}, 
  getRequiresWithAlias: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[31]++;
  _$jscoverage['/loader/data-structure.js'].lineData[344]++;
  var self = this, requiresWithAlias = self.requiresWithAlias, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[347]++;
  if (visit408_347_1(!requires || visit409_347_2(requires.length === 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[348]++;
    return visit410_348_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[349]++;
    if (visit411_349_1(!requiresWithAlias)) {
      _$jscoverage['/loader/data-structure.js'].lineData[350]++;
      self.requiresWithAlias = requiresWithAlias = Utils.normalizeModNamesWithAlias(self.runtime, requires, self.name);
    }
  }
  _$jscoverage['/loader/data-structure.js'].lineData[353]++;
  return requiresWithAlias;
}, 
  getRequiredMods: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[32]++;
  _$jscoverage['/loader/data-structure.js'].lineData[361]++;
  var self = this, runtime = self.runtime;
  _$jscoverage['/loader/data-structure.js'].lineData[363]++;
  return S.map(self.getNormalizedRequires(), function(r) {
  _$jscoverage['/loader/data-structure.js'].functionData[33]++;
  _$jscoverage['/loader/data-structure.js'].lineData[364]++;
  return Utils.createModuleInfo(runtime, r);
});
}, 
  getNormalizedRequires: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[34]++;
  _$jscoverage['/loader/data-structure.js'].lineData[373]++;
  var self = this, normalizedRequires, normalizedRequiresStatus = self.normalizedRequiresStatus, status = self.status, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[378]++;
  if (visit412_378_1(!requires || visit413_378_2(requires.length === 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[379]++;
    return visit414_379_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[380]++;
    if (visit415_380_1((normalizedRequires = self.normalizedRequires) && (visit416_382_1(normalizedRequiresStatus === status)))) {
      _$jscoverage['/loader/data-structure.js'].lineData[383]++;
      return normalizedRequires;
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[385]++;
      self.normalizedRequiresStatus = status;
      _$jscoverage['/loader/data-structure.js'].lineData[386]++;
      self.normalizedRequires = Utils.normalizeModNames(self.runtime, requires, self.name);
      _$jscoverage['/loader/data-structure.js'].lineData[387]++;
      return self.normalizedRequires;
    }
  }
}};
  _$jscoverage['/loader/data-structure.js'].lineData[392]++;
  Loader.Module = Module;
  _$jscoverage['/loader/data-structure.js'].lineData[394]++;
  function defaultComponentJsName(m) {
    _$jscoverage['/loader/data-structure.js'].functionData[35]++;
    _$jscoverage['/loader/data-structure.js'].lineData[395]++;
    var name = m.name, extname = '.' + m.getType(), min = '-min';
    _$jscoverage['/loader/data-structure.js'].lineData[399]++;
    name = Path.join(Path.dirname(name), Path.basename(name, extname));
    _$jscoverage['/loader/data-structure.js'].lineData[401]++;
    if (visit417_401_1(m.getPackage().isDebug())) {
      _$jscoverage['/loader/data-structure.js'].lineData[402]++;
      min = '';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[405]++;
    return name + min + extname;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[408]++;
  var systemPackage = new Package({
  name: '', 
  runtime: S});
  _$jscoverage['/loader/data-structure.js'].lineData[413]++;
  function getPackage(self, modName) {
    _$jscoverage['/loader/data-structure.js'].functionData[36]++;
    _$jscoverage['/loader/data-structure.js'].lineData[414]++;
    var packages = self.config('packages'), modNameSlash = modName + '/', pName = '', p;
    _$jscoverage['/loader/data-structure.js'].lineData[418]++;
    for (p in packages) {
      _$jscoverage['/loader/data-structure.js'].lineData[419]++;
      if (visit418_419_1(S.startsWith(modNameSlash, p + '/') && visit419_419_2(p.length > pName.length))) {
        _$jscoverage['/loader/data-structure.js'].lineData[420]++;
        pName = p;
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[423]++;
    return visit420_423_1(packages[pName] || systemPackage);
  }
})(KISSY);
