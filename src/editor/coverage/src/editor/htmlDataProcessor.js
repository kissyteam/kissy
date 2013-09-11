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
if (! _$jscoverage['/editor/htmlDataProcessor.js']) {
  _$jscoverage['/editor/htmlDataProcessor.js'] = {};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[10] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[11] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[13] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[19] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[20] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[25] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[26] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[27] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[28] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[29] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[31] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[32] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[35] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[37] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[41] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[43] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[44] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[45] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[51] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[70] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[79] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[81] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[84] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[86] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[87] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[88] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[89] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[94] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[97] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[100] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[101] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[103] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[104] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[106] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[107] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[114] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[115] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[117] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[128] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[129] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[131] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[147] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[148] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[149] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[151] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[154] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[159] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[161] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[162] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[167] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[168] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[176] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[181] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[184] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[185] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[188] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[189] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[191] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[194] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[195] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[196] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[197] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[198] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[200] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[201] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[206] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[207] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[209] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[217] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[218] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[219] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[222] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[223] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[229] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[230] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[231] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[234] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[239] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[240] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[244] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[245] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[246] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[252] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[253] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[254] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[256] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[257] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[258] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[261] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[262] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[269] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[271] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[278] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[283] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[284] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[285] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[288] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[289] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[291] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[296] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[298] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[301] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[304] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[306] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[307] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[310] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[311] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[312] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[316] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[317] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[318] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[322] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[323] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[326] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[327] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[330] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[336] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[338] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[344] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[346] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[347] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[348] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[353] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[360] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[362] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[366] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[370] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[375] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[377] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[378] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[381] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[383] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[388] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[391] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[393] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[395] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[401] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[403] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[404] = 0;
}
if (! _$jscoverage['/editor/htmlDataProcessor.js'].functionData) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[0] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[1] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[2] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[3] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[4] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[5] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[6] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[7] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[8] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[9] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[10] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[11] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[12] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[13] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[14] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[15] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[16] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[17] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[18] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[19] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[20] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[21] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[22] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[23] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[24] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[25] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[26] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[27] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[28] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[29] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[30] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[31] = 0;
}
if (! _$jscoverage['/editor/htmlDataProcessor.js'].branchData) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData = {};
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['25'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['27'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['29'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['29'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['81'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['86'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['88'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['100'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['103'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['106'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['114'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['128'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['147'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['154'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['188'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['188'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['188'][3] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['196'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['197'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['197'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['197'][3] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['209'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['212'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['212'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['213'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['219'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['222'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['231'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['245'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['288'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['336'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['353'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['353'][1] = new BranchData();
}
_$jscoverage['/editor/htmlDataProcessor.js'].branchData['353'][1].init(87, 25, '_dataFilter || dataFilter');
function visit369_353_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['336'][1].init(26, 9, 'UA.webkit');
function visit368_336_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['288'][1].init(186, 49, 'attributes.indexOf(\'_ke_saved_\' + attrName) == -1');
function visit367_288_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['245'][1].init(26, 19, '!(\'br\' in dtd[i])');
function visit366_245_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['231'][1].init(67, 26, 'blockNeedsExtension(block)');
function visit365_231_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['222'][1].init(141, 9, '!UA[\'ie\']');
function visit364_222_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['219'][1].init(67, 26, 'blockNeedsExtension(block)');
function visit363_219_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['213'][1].init(52, 29, 'lastChild.nodeName == \'input\'');
function visit362_213_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['212'][2].init(341, 24, 'block.nodeName == \'form\'');
function visit361_212_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['212'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['212'][1].init(191, 82, 'block.nodeName == \'form\' && lastChild.nodeName == \'input\'');
function visit360_212_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['209'][1].init(147, 274, '!lastChild || block.nodeName == \'form\' && lastChild.nodeName == \'input\'');
function visit359_209_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][2].init(208, 23, 'lastChild.nodeType == 3');
function visit358_200_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][1].init(208, 66, 'lastChild.nodeType == 3 && tailNbspRegex.test(lastChild.nodeValue)');
function visit357_200_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['197'][3].init(57, 26, 'lastChild.nodeName == \'br\'');
function visit356_197_3(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['197'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['197'][2].init(30, 23, 'lastChild.nodeType == 1');
function visit355_197_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['197'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['197'][1].init(30, 53, 'lastChild.nodeType == 1 && lastChild.nodeName == \'br\'');
function visit354_197_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['196'][1].init(90, 9, 'lastChild');
function visit353_196_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['188'][3].init(210, 18, 'last.nodeType == 3');
function visit352_188_3(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['188'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['188'][2].init(210, 45, 'last.nodeType == 3 && !S.trim(last.nodeValue)');
function visit351_188_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['188'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['188'][1].init(202, 53, 'last && last.nodeType == 3 && !S.trim(last.nodeValue)');
function visit350_188_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['154'][1].init(5350, 8, 'UA[\'ie\']');
function visit349_154_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['147'][1].init(101, 73, 'contents.substr(0, protectedSourceMarker.length) == protectedSourceMarker');
function visit348_147_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['128'][1].init(34, 10, '!S.trim(v)');
function visit347_128_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['114'][1].init(34, 60, '!(element.childNodes.length) && !(element.attributes.length)');
function visit346_114_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['106'][1].init(370, 12, 'parentHeight');
function visit345_106_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['103'][1].init(202, 11, 'parentWidth');
function visit344_103_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['100'][2].init(255, 27, 'parent.nodeName == \'object\'');
function visit343_100_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['100'][1].init(245, 37, 'parent && parent.nodeName == \'object\'');
function visit342_100_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['88'][1].init(136, 40, 'element.getAttribute(savedAttributeName)');
function visit341_88_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['86'][1].init(329, 25, 'i < attributeNames.length');
function visit340_86_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['81'][1].init(102, 17, 'attributes.length');
function visit339_81_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['29'][2].init(78, 42, 'child.nodeType == S.DOM.NodeType.TEXT_NODE');
function visit338_29_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['29'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['29'][1].init(78, 62, 'child.nodeType == S.DOM.NodeType.TEXT_NODE && !child.nodeValue');
function visit337_29_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['27'][1].init(69, 5, 'i < l');
function visit336_27_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['25'][1].init(203, 1, 'l');
function visit335_25_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].lineData[10]++;
KISSY.add("editor/htmlDataProcessor", function(S, Editor, HtmlParser) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[0]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[11]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[1]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[13]++;
  var Node = S.Node, UA = S.UA, htmlFilter = new HtmlParser.Filter(), dataFilter = new HtmlParser.Filter();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[19]++;
  function filterInline(element) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[2]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[20]++;
    var childNodes = element.childNodes, i, child, allEmpty, l = childNodes.length;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[25]++;
    if (visit335_25_1(l)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[26]++;
      allEmpty = 1;
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[27]++;
      for (i = 0; visit336_27_1(i < l); i++) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[28]++;
        child = childNodes[i];
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[29]++;
        if (visit337_29_1(visit338_29_2(child.nodeType == S.DOM.NodeType.TEXT_NODE) && !child.nodeValue)) {
        } else {
          _$jscoverage['/editor/htmlDataProcessor.js'].lineData[31]++;
          allEmpty = 0;
          _$jscoverage['/editor/htmlDataProcessor.js'].lineData[32]++;
          break;
        }
      }
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[35]++;
      return allEmpty ? false : undefined;
    } else {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[37]++;
      return false;
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[41]++;
  (function() {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[3]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[43]++;
  function wrapAsComment(element) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[4]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[44]++;
    var html = HtmlParser.serialize(element);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[45]++;
    return new HtmlParser.Comment(protectedSourceMarker + encodeURIComponent(html).replace(/--/g, "%2D%2D"));
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[51]++;
  var defaultDataFilterRules = {
  tagNames: [[/^\?xml.*$/i, ''], [/^.*namespace.*$/i, '']], 
  attributeNames: [[/^on/, 'ke_on'], [/^lang$/, '']], 
  tags: {
  script: wrapAsComment, 
  noscript: wrapAsComment, 
  span: filterInline}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[70]++;
  var defaultHTMLFilterRules = {
  tagNames: [[(/^ke:/), ''], [(/^\?xml:namespace$/), '']], 
  tags: {
  $: function(element) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[5]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[79]++;
  var attributes = element.attributes;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[81]++;
  if (visit339_81_1(attributes.length)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[84]++;
    var attributeNames = ['name', 'href', 'src'], savedAttributeName;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[86]++;
    for (var i = 0; visit340_86_1(i < attributeNames.length); i++) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[87]++;
      savedAttributeName = '_ke_saved_' + attributeNames[i];
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[88]++;
      if (visit341_88_1(element.getAttribute(savedAttributeName))) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[89]++;
        element.removeAttribute(attributeNames[i]);
      }
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[94]++;
  return element;
}, 
  embed: function(element) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[6]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[97]++;
  var parent = element.parentNode;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[100]++;
  if (visit342_100_1(parent && visit343_100_2(parent.nodeName == 'object'))) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[101]++;
    var parentWidth = parent.getAttribute("width"), parentHeight = parent.getAttribute("height");
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[103]++;
    if (visit344_103_1(parentWidth)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[104]++;
      element.setAttribute("width", parentWidth);
    }
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[106]++;
    if (visit345_106_1(parentHeight)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[107]++;
      element.setAttribute("width", parentHeight);
    }
  }
}, 
  a: function(element) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[7]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[114]++;
  if (visit346_114_1(!(element.childNodes.length) && !(element.attributes.length))) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[115]++;
    return false;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[117]++;
  return undefined;
}, 
  span: filterInline, 
  strong: filterInline, 
  em: filterInline, 
  del: filterInline, 
  u: filterInline}, 
  attributes: {
  style: function(v) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[8]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[128]++;
  if (visit347_128_1(!S.trim(v))) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[129]++;
    return false;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[131]++;
  return undefined;
}}, 
  attributeNames: [[(/^_ke_saved_/), ''], [(/^ke_on/), 'on'], [(/^_ke.*/), ''], [(/^ke:.*$/), ''], [(/^_ks.*/), '']], 
  comment: function(contents) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[9]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[147]++;
  if (visit348_147_1(contents.substr(0, protectedSourceMarker.length) == protectedSourceMarker)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[148]++;
    contents = S.trim(S.urlDecode(contents.substr(protectedSourceMarker.length)));
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[149]++;
    return HtmlParser.parse(contents).childNodes[0];
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[151]++;
  return undefined;
}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[154]++;
  if (visit349_154_1(UA['ie'])) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[159]++;
    defaultHTMLFilterRules.attributes.style = function(value) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[10]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[161]++;
  return value.replace(/(^|;)([^:]+)/g, function(match) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[11]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[162]++;
  return match.toLowerCase();
});
};
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[167]++;
  htmlFilter.addRules(defaultHTMLFilterRules);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[168]++;
  dataFilter.addRules(defaultDataFilterRules);
})();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[176]++;
  (function() {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[12]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[181]++;
  var tailNbspRegex = /^[\t\r\n ]*(?:&nbsp;|\xa0)[\t\r\n ]*$/;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[184]++;
  function lastNoneSpaceChild(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[13]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[185]++;
    var childNodes = block.childNodes, lastIndex = childNodes.length, last = childNodes[lastIndex - 1];
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[188]++;
    while (visit350_188_1(last && visit351_188_2(visit352_188_3(last.nodeType == 3) && !S.trim(last.nodeValue)))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[189]++;
      last = childNodes[--lastIndex];
    }
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[191]++;
    return last;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[194]++;
  function trimFillers(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[14]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[195]++;
    var lastChild = lastNoneSpaceChild(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[196]++;
    if (visit353_196_1(lastChild)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[197]++;
      if (visit354_197_1(visit355_197_2(lastChild.nodeType == 1) && visit356_197_3(lastChild.nodeName == 'br'))) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[198]++;
        block.removeChild(lastChild);
      } else {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[200]++;
        if (visit357_200_1(visit358_200_2(lastChild.nodeType == 3) && tailNbspRegex.test(lastChild.nodeValue))) {
          _$jscoverage['/editor/htmlDataProcessor.js'].lineData[201]++;
          block.removeChild(lastChild);
        }
      }
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[206]++;
  function blockNeedsExtension(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[15]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[207]++;
    var lastChild = lastNoneSpaceChild(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[209]++;
    return visit359_209_1(!lastChild || visit360_212_1(visit361_212_2(block.nodeName == 'form') && visit362_213_1(lastChild.nodeName == 'input')));
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[217]++;
  function extendBlockForDisplay(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[16]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[218]++;
    trimFillers(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[219]++;
    if (visit363_219_1(blockNeedsExtension(block))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[222]++;
      if (visit364_222_1(!UA['ie'])) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[223]++;
        block.appendChild(new HtmlParser.Tag('br'));
      }
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[229]++;
  function extendBlockForOutput(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[17]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[230]++;
    trimFillers(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[231]++;
    if (visit365_231_1(blockNeedsExtension(block))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[234]++;
      block.appendChild(new HtmlParser.Text('\xa0'));
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[239]++;
  var dtd = Editor.XHTML_DTD;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[240]++;
  var blockLikeTags = S.merge(dtd.$block, dtd.$listItem, dtd.$tableContent), i;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[244]++;
  for (i in blockLikeTags) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[245]++;
    if (visit366_245_1(!('br' in dtd[i]))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[246]++;
      delete blockLikeTags[i];
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[252]++;
  delete blockLikeTags.pre;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[253]++;
  var defaultDataBlockFilterRules = {
  tags: {}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[254]++;
  var defaultHTMLBlockFilterRules = {
  tags: {}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[256]++;
  for (i in blockLikeTags) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[257]++;
    defaultDataBlockFilterRules.tags[i] = extendBlockForDisplay;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[258]++;
    defaultHTMLBlockFilterRules.tags[i] = extendBlockForOutput;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[261]++;
  dataFilter.addRules(defaultDataBlockFilterRules);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[262]++;
  htmlFilter.addRules(defaultHTMLBlockFilterRules);
})();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[269]++;
  htmlFilter.addRules({
  text: function(text) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[18]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[271]++;
  return text.replace(/\xa0/g, "&nbsp;");
}});
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[278]++;
  var protectElementRegex = /<(a|area|img|input)\b([^>]*)>/gi, protectAttributeRegex = /\b(href|src|name)\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|(?:[^ "'>]+))/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[283]++;
  function protectAttributes(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[19]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[284]++;
    return html.replace(protectElementRegex, function(element, tag, attributes) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[20]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[285]++;
  return '<' + tag + attributes.replace(protectAttributeRegex, function(fullAttr, attrName) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[21]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[288]++;
  if (visit367_288_1(attributes.indexOf('_ke_saved_' + attrName) == -1)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[289]++;
    return ' _ke_saved_' + fullAttr + ' ' + fullAttr;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[291]++;
  return fullAttr;
}) + '>';
});
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[296]++;
  var protectedSourceMarker = '{ke_protected}';
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[298]++;
  var protectElementsRegex = /(?:<textarea[^>]*>[\s\S]*<\/textarea>)|(?:<style[^>]*>[\s\S]*<\/style>)|(?:<script[^>]*>[\s\S]*<\/script>)|(?:<(:?link|meta|base)[^>]*>)/gi, encodedElementsRegex = /<ke:encoded>([^<]*)<\/ke:encoded>/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[301]++;
  var protectElementNamesRegex = /(<\/?)((?:object|embed|param|html|body|head|title|noscript)[^>]*>)/gi, unprotectElementNamesRegex = /(<\/?)ke:((?:object|embed|param|html|body|head|title|noscript)[^>]*>)/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[304]++;
  var protectSelfClosingRegex = /<ke:(param|embed)([^>]*?)\/?>(?!\s*<\/ke:\1)/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[306]++;
  function protectSelfClosingElements(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[22]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[307]++;
    return html.replace(protectSelfClosingRegex, '<ke:$1$2></ke:$1>');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[310]++;
  function protectElements(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[23]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[311]++;
    return html.replace(protectElementsRegex, function(match) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[24]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[312]++;
  return '<ke:encoded>' + encodeURIComponent(match) + '</ke:encoded>';
});
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[316]++;
  function unprotectElements(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[25]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[317]++;
    return html.replace(encodedElementsRegex, function(match, encoded) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[26]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[318]++;
  return S.urlDecode(encoded);
});
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[322]++;
  function protectElementsNames(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[27]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[323]++;
    return html.replace(protectElementNamesRegex, '$1ke:$2');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[326]++;
  function unprotectElementNames(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[28]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[327]++;
    return html.replace(unprotectElementNamesRegex, '$1$2');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[330]++;
  editor.htmlDataProcessor = {
  dataFilter: dataFilter, 
  htmlFilter: htmlFilter, 
  toHtml: function(html) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[29]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[336]++;
  if (visit368_336_1(UA.webkit)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[338]++;
    html = html.replace(/\u200b/g, '');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[344]++;
  var writer = new HtmlParser.BeautifyWriter(), n = new HtmlParser.Parser(html).parse();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[346]++;
  n.writeHtml(writer, htmlFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[347]++;
  html = writer.getHtml();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[348]++;
  return html;
}, 
  toDataFormat: function(html, _dataFilter) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[30]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[353]++;
  _dataFilter = visit369_353_1(_dataFilter || dataFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[360]++;
  html = protectElements(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[362]++;
  html = protectAttributes(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[366]++;
  html = protectElementsNames(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[370]++;
  html = protectSelfClosingElements(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[375]++;
  var div = new Node("<div>");
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[377]++;
  div.html('a' + html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[378]++;
  html = div.html().substr(1);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[381]++;
  html = unprotectElementNames(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[383]++;
  html = unprotectElements(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[388]++;
  var writer = new HtmlParser.BasicWriter(), n = new HtmlParser.Parser(html).parse();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[391]++;
  n.writeHtml(writer, _dataFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[393]++;
  html = writer.getHtml();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[395]++;
  return html;
}, 
  toServer: function(html) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[31]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[401]++;
  var writer = new HtmlParser.MinifyWriter(), n = new HtmlParser.Parser(html).parse();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[403]++;
  n.writeHtml(writer, htmlFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[404]++;
  return writer.getHtml();
}};
}};
}, {
  requires: ['./base', 'html-parser']});
