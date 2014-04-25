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
if (! _$jscoverage['/editor/html-data-processor.js']) {
  _$jscoverage['/editor/html-data-processor.js'] = {};
  _$jscoverage['/editor/html-data-processor.js'].lineData = [];
  _$jscoverage['/editor/html-data-processor.js'].lineData[10] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[11] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[12] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[13] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[14] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[15] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[18] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[19] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[20] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[22] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[25] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[26] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[27] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[28] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[29] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[30] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[32] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[33] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[36] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[38] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[42] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[44] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[49] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[50] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[53] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[54] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[55] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[56] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[61] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[80] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[89] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[91] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[94] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[96] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[97] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[98] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[99] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[104] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[107] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[110] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[111] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[113] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[114] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[116] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[117] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[124] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[125] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[127] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[138] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[139] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[141] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[157] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[158] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[159] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[161] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[164] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[169] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[170] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[171] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[176] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[177] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[185] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[190] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[193] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[194] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[197] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[200] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[202] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[205] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[206] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[207] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[208] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[209] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[210] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[211] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[216] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[217] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[219] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[227] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[228] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[229] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[232] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[233] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[239] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[240] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[241] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[244] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[249] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[253] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[254] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[255] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[261] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[262] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[263] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[265] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[266] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[267] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[270] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[271] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[277] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[279] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[285] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[290] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[291] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[292] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[295] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[296] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[298] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[303] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[305] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[308] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[311] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[313] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[314] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[317] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[318] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[319] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[323] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[324] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[325] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[329] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[330] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[333] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[334] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[337] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[343] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[345] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[351] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[353] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[354] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[355] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[360] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[367] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[369] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[373] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[377] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[382] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[384] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[385] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[388] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[390] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[395] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[398] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[400] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[402] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[408] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[410] = 0;
  _$jscoverage['/editor/html-data-processor.js'].lineData[411] = 0;
}
if (! _$jscoverage['/editor/html-data-processor.js'].functionData) {
  _$jscoverage['/editor/html-data-processor.js'].functionData = [];
  _$jscoverage['/editor/html-data-processor.js'].functionData[0] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[1] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[2] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[3] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[4] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[5] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[6] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[7] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[8] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[9] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[10] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[11] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[12] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[13] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[14] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[15] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[16] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[17] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[18] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[19] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[20] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[21] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[22] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[23] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[24] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[25] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[26] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[27] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[28] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[29] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[30] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[31] = 0;
  _$jscoverage['/editor/html-data-processor.js'].functionData[32] = 0;
}
if (! _$jscoverage['/editor/html-data-processor.js'].branchData) {
  _$jscoverage['/editor/html-data-processor.js'].branchData = {};
  _$jscoverage['/editor/html-data-processor.js'].branchData['12'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['19'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['25'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['26'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['29'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['29'][2] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['29'][3] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['32'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['91'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['96'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['98'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['110'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['110'][2] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['113'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['116'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['124'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['138'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['157'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['164'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['197'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['198'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['198'][2] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['198'][3] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['199'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['199'][2] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['207'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['208'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['208'][2] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['208'][3] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['210'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['210'][2] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['219'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['222'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['222'][2] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['223'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['229'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['232'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['241'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['254'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['295'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['343'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/editor/html-data-processor.js'].branchData['360'] = [];
  _$jscoverage['/editor/html-data-processor.js'].branchData['360'][1] = new BranchData();
}
_$jscoverage['/editor/html-data-processor.js'].branchData['360'][1].init(87, 25, '_dataFilter || dataFilter');
function visit385_360_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['343'][1].init(26, 9, 'UA.webkit');
function visit384_343_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['295'][1].init(186, 49, 'attributes.indexOf(\'_keSaved_\' + attrName) === -1');
function visit383_295_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['254'][1].init(26, 17, '!(\'br\' in dtd[i])');
function visit382_254_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['241'][1].init(67, 26, 'blockNeedsExtension(block)');
function visit381_241_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['232'][1].init(141, 7, '!OLD_IE');
function visit380_232_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['229'][1].init(67, 26, 'blockNeedsExtension(block)');
function visit379_229_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['223'][1].init(53, 30, 'lastChild.nodeName === \'input\'');
function visit378_223_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['222'][2].init(341, 25, 'block.nodeName === \'form\'');
function visit377_222_2(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['222'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['222'][1].init(191, 84, 'block.nodeName === \'form\' && lastChild.nodeName === \'input\'');
function visit376_222_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['219'][1].init(147, 276, '!lastChild || block.nodeName === \'form\' && lastChild.nodeName === \'input\'');
function visit375_219_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['210'][2].init(185, 24, 'lastChild.nodeType === 3');
function visit374_210_2(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['210'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['210'][1].init(185, 67, 'lastChild.nodeType === 3 && tailNbspRegex.test(lastChild.nodeValue)');
function visit373_210_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['208'][3].init(58, 27, 'lastChild.nodeName === \'br\'');
function visit372_208_3(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['208'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['208'][2].init(30, 24, 'lastChild.nodeType === 1');
function visit371_208_2(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['208'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['208'][1].init(30, 55, 'lastChild.nodeType === 1 && lastChild.nodeName === \'br\'');
function visit370_208_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['207'][1].init(90, 9, 'lastChild');
function visit369_207_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['199'][2].init(114, 19, 'last.nodeType === 1');
function visit368_199_2(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['199'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['199'][1].init(78, 43, 'last.nodeType === 1 && isEmptyElement(last)');
function visit367_199_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['198'][3].init(33, 19, 'last.nodeType === 3');
function visit366_198_3(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['198'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['198'][2].init(33, 46, 'last.nodeType === 3 && !S.trim(last.nodeValue)');
function visit365_198_2(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['198'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['198'][1].init(33, 122, 'last.nodeType === 3 && !S.trim(last.nodeValue) || last.nodeType === 1 && isEmptyElement(last)');
function visit364_198_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['197'][1].init(200, 157, 'last && (last.nodeType === 3 && !S.trim(last.nodeValue) || last.nodeType === 1 && isEmptyElement(last))');
function visit363_197_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['164'][1].init(5284, 6, 'OLD_IE');
function visit362_164_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['157'][1].init(101, 74, 'contents.substr(0, protectedSourceMarker.length) === protectedSourceMarker');
function visit361_157_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['138'][1].init(34, 10, '!S.trim(v)');
function visit360_138_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['124'][1].init(34, 60, '!(element.childNodes.length) && !(element.attributes.length)');
function visit359_124_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['116'][1].init(370, 12, 'parentHeight');
function visit358_116_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['113'][1].init(202, 11, 'parentWidth');
function visit357_113_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['110'][2].init(255, 28, 'parent.nodeName === \'object\'');
function visit356_110_2(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['110'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['110'][1].init(245, 38, 'parent && parent.nodeName === \'object\'');
function visit355_110_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['98'][1].init(133, 40, 'element.getAttribute(savedAttributeName)');
function visit354_98_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['96'][1].init(327, 25, 'i < attributeNames.length');
function visit353_96_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['91'][1].init(102, 17, 'attributes.length');
function visit352_91_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['32'][1].init(243, 22, '!isEmptyElement(child)');
function visit351_32_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['29'][3].init(112, 31, 'nodeType === NodeType.TEXT_NODE');
function visit350_29_3(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['29'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['29'][2].init(112, 51, 'nodeType === NodeType.TEXT_NODE && !child.nodeValue');
function visit349_29_2(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['29'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['29'][1].init(110, 54, '!(nodeType === NodeType.TEXT_NODE && !child.nodeValue)');
function visit348_29_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['26'][1].init(26, 5, 'i < l');
function visit347_26_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['25'][1].init(199, 1, 'l');
function visit346_25_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['19'][1].init(14, 30, '!dtd.$removeEmpty[el.nodeName]');
function visit345_19_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].branchData['12'][1].init(65, 16, 'S.UA.ieMode < 11');
function visit344_12_1(result) {
  _$jscoverage['/editor/html-data-processor.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/html-data-processor.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/html-data-processor.js'].functionData[0]++;
  _$jscoverage['/editor/html-data-processor.js'].lineData[11]++;
  var HtmlParser = require('html-parser');
  _$jscoverage['/editor/html-data-processor.js'].lineData[12]++;
  var OLD_IE = visit344_12_1(S.UA.ieMode < 11);
  _$jscoverage['/editor/html-data-processor.js'].lineData[13]++;
  var Node = require('node');
  _$jscoverage['/editor/html-data-processor.js'].lineData[14]++;
  var dtd = HtmlParser.DTD;
  _$jscoverage['/editor/html-data-processor.js'].lineData[15]++;
  var NodeType = Node.NodeType;
  _$jscoverage['/editor/html-data-processor.js'].lineData[18]++;
  function isEmptyElement(el) {
    _$jscoverage['/editor/html-data-processor.js'].functionData[1]++;
    _$jscoverage['/editor/html-data-processor.js'].lineData[19]++;
    if (visit345_19_1(!dtd.$removeEmpty[el.nodeName])) {
      _$jscoverage['/editor/html-data-processor.js'].lineData[20]++;
      return false;
    }
    _$jscoverage['/editor/html-data-processor.js'].lineData[22]++;
    var childNodes = el.childNodes, i, child, l = childNodes.length;
    _$jscoverage['/editor/html-data-processor.js'].lineData[25]++;
    if (visit346_25_1(l)) {
      _$jscoverage['/editor/html-data-processor.js'].lineData[26]++;
      for (i = 0; visit347_26_1(i < l); i++) {
        _$jscoverage['/editor/html-data-processor.js'].lineData[27]++;
        child = childNodes[i];
        _$jscoverage['/editor/html-data-processor.js'].lineData[28]++;
        var nodeType = child.nodeType;
        _$jscoverage['/editor/html-data-processor.js'].lineData[29]++;
        if (visit348_29_1(!(visit349_29_2(visit350_29_3(nodeType === NodeType.TEXT_NODE) && !child.nodeValue)))) {
          _$jscoverage['/editor/html-data-processor.js'].lineData[30]++;
          return false;
        }
        _$jscoverage['/editor/html-data-processor.js'].lineData[32]++;
        if (visit351_32_1(!isEmptyElement(child))) {
          _$jscoverage['/editor/html-data-processor.js'].lineData[33]++;
          return false;
        }
      }
      _$jscoverage['/editor/html-data-processor.js'].lineData[36]++;
      return true;
    } else {
      _$jscoverage['/editor/html-data-processor.js'].lineData[38]++;
      return true;
    }
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[42]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/html-data-processor.js'].functionData[2]++;
  _$jscoverage['/editor/html-data-processor.js'].lineData[44]++;
  var UA = S.UA, htmlFilter = new HtmlParser.Filter(), dataFilter = new HtmlParser.Filter();
  _$jscoverage['/editor/html-data-processor.js'].lineData[49]++;
  function filterInline(element) {
    _$jscoverage['/editor/html-data-processor.js'].functionData[3]++;
    _$jscoverage['/editor/html-data-processor.js'].lineData[50]++;
    return !isEmptyElement(element);
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[53]++;
  (function() {
  _$jscoverage['/editor/html-data-processor.js'].functionData[4]++;
  _$jscoverage['/editor/html-data-processor.js'].lineData[54]++;
  function wrapAsComment(element) {
    _$jscoverage['/editor/html-data-processor.js'].functionData[5]++;
    _$jscoverage['/editor/html-data-processor.js'].lineData[55]++;
    var html = HtmlParser.serialize(element);
    _$jscoverage['/editor/html-data-processor.js'].lineData[56]++;
    return new HtmlParser.Comment(protectedSourceMarker + encodeURIComponent(html).replace(/--/g, '%2D%2D'));
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[61]++;
  var defaultDataFilterRules = {
  tagNames: [[/^\?xml.*$/i, ''], [/^.*namespace.*$/i, '']], 
  attributeNames: [[/^on/, 'ke_on'], [/^lang$/, '']], 
  tags: {
  script: wrapAsComment, 
  noscript: wrapAsComment, 
  span: filterInline}};
  _$jscoverage['/editor/html-data-processor.js'].lineData[80]++;
  var defaultHTMLFilterRules = {
  tagNames: [[(/^ke:/), ''], [(/^\?xml:namespace$/), '']], 
  tags: {
  $: function(element) {
  _$jscoverage['/editor/html-data-processor.js'].functionData[6]++;
  _$jscoverage['/editor/html-data-processor.js'].lineData[89]++;
  var attributes = element.attributes;
  _$jscoverage['/editor/html-data-processor.js'].lineData[91]++;
  if (visit352_91_1(attributes.length)) {
    _$jscoverage['/editor/html-data-processor.js'].lineData[94]++;
    var attributeNames = ['name', 'href', 'src'], savedAttributeName;
    _$jscoverage['/editor/html-data-processor.js'].lineData[96]++;
    for (var i = 0; visit353_96_1(i < attributeNames.length); i++) {
      _$jscoverage['/editor/html-data-processor.js'].lineData[97]++;
      savedAttributeName = '_keSaved_' + attributeNames[i];
      _$jscoverage['/editor/html-data-processor.js'].lineData[98]++;
      if (visit354_98_1(element.getAttribute(savedAttributeName))) {
        _$jscoverage['/editor/html-data-processor.js'].lineData[99]++;
        element.removeAttribute(attributeNames[i]);
      }
    }
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[104]++;
  return element;
}, 
  embed: function(element) {
  _$jscoverage['/editor/html-data-processor.js'].functionData[7]++;
  _$jscoverage['/editor/html-data-processor.js'].lineData[107]++;
  var parent = element.parentNode;
  _$jscoverage['/editor/html-data-processor.js'].lineData[110]++;
  if (visit355_110_1(parent && visit356_110_2(parent.nodeName === 'object'))) {
    _$jscoverage['/editor/html-data-processor.js'].lineData[111]++;
    var parentWidth = parent.getAttribute('width'), parentHeight = parent.getAttribute('height');
    _$jscoverage['/editor/html-data-processor.js'].lineData[113]++;
    if (visit357_113_1(parentWidth)) {
      _$jscoverage['/editor/html-data-processor.js'].lineData[114]++;
      element.setAttribute('width', parentWidth);
    }
    _$jscoverage['/editor/html-data-processor.js'].lineData[116]++;
    if (visit358_116_1(parentHeight)) {
      _$jscoverage['/editor/html-data-processor.js'].lineData[117]++;
      element.setAttribute('width', parentHeight);
    }
  }
}, 
  a: function(element) {
  _$jscoverage['/editor/html-data-processor.js'].functionData[8]++;
  _$jscoverage['/editor/html-data-processor.js'].lineData[124]++;
  if (visit359_124_1(!(element.childNodes.length) && !(element.attributes.length))) {
    _$jscoverage['/editor/html-data-processor.js'].lineData[125]++;
    return false;
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[127]++;
  return undefined;
}, 
  span: filterInline, 
  strong: filterInline, 
  em: filterInline, 
  del: filterInline, 
  u: filterInline}, 
  attributes: {
  style: function(v) {
  _$jscoverage['/editor/html-data-processor.js'].functionData[9]++;
  _$jscoverage['/editor/html-data-processor.js'].lineData[138]++;
  if (visit360_138_1(!S.trim(v))) {
    _$jscoverage['/editor/html-data-processor.js'].lineData[139]++;
    return false;
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[141]++;
  return undefined;
}}, 
  attributeNames: [[(/^_keSaved_/), ''], [(/^ke_on/), 'on'], [(/^_ke.*/), ''], [(/^ke:.*$/), ''], [(/^_ks.*/), '']], 
  comment: function(contents) {
  _$jscoverage['/editor/html-data-processor.js'].functionData[10]++;
  _$jscoverage['/editor/html-data-processor.js'].lineData[157]++;
  if (visit361_157_1(contents.substr(0, protectedSourceMarker.length) === protectedSourceMarker)) {
    _$jscoverage['/editor/html-data-processor.js'].lineData[158]++;
    contents = S.trim(S.urlDecode(contents.substr(protectedSourceMarker.length)));
    _$jscoverage['/editor/html-data-processor.js'].lineData[159]++;
    return HtmlParser.parse(contents).childNodes[0];
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[161]++;
  return undefined;
}};
  _$jscoverage['/editor/html-data-processor.js'].lineData[164]++;
  if (visit362_164_1(OLD_IE)) {
    _$jscoverage['/editor/html-data-processor.js'].lineData[169]++;
    defaultHTMLFilterRules.attributes.style = function(value) {
  _$jscoverage['/editor/html-data-processor.js'].functionData[11]++;
  _$jscoverage['/editor/html-data-processor.js'].lineData[170]++;
  return value.replace(/(^|;)([^:]+)/g, function(match) {
  _$jscoverage['/editor/html-data-processor.js'].functionData[12]++;
  _$jscoverage['/editor/html-data-processor.js'].lineData[171]++;
  return match.toLowerCase();
});
};
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[176]++;
  htmlFilter.addRules(defaultHTMLFilterRules);
  _$jscoverage['/editor/html-data-processor.js'].lineData[177]++;
  dataFilter.addRules(defaultDataFilterRules);
})();
  _$jscoverage['/editor/html-data-processor.js'].lineData[185]++;
  (function() {
  _$jscoverage['/editor/html-data-processor.js'].functionData[13]++;
  _$jscoverage['/editor/html-data-processor.js'].lineData[190]++;
  var tailNbspRegex = /^[\t\r\n ]*(?:&nbsp;|\xa0)[\t\r\n ]*$/;
  _$jscoverage['/editor/html-data-processor.js'].lineData[193]++;
  function lastNoneSpaceChild(block) {
    _$jscoverage['/editor/html-data-processor.js'].functionData[14]++;
    _$jscoverage['/editor/html-data-processor.js'].lineData[194]++;
    var childNodes = block.childNodes, lastIndex = childNodes.length, last = childNodes[lastIndex - 1];
    _$jscoverage['/editor/html-data-processor.js'].lineData[197]++;
    while (visit363_197_1(last && (visit364_198_1(visit365_198_2(visit366_198_3(last.nodeType === 3) && !S.trim(last.nodeValue)) || visit367_199_1(visit368_199_2(last.nodeType === 1) && isEmptyElement(last)))))) {
      _$jscoverage['/editor/html-data-processor.js'].lineData[200]++;
      last = childNodes[--lastIndex];
    }
    _$jscoverage['/editor/html-data-processor.js'].lineData[202]++;
    return last;
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[205]++;
  function trimFillers(block) {
    _$jscoverage['/editor/html-data-processor.js'].functionData[15]++;
    _$jscoverage['/editor/html-data-processor.js'].lineData[206]++;
    var lastChild = lastNoneSpaceChild(block);
    _$jscoverage['/editor/html-data-processor.js'].lineData[207]++;
    if (visit369_207_1(lastChild)) {
      _$jscoverage['/editor/html-data-processor.js'].lineData[208]++;
      if (visit370_208_1(visit371_208_2(lastChild.nodeType === 1) && visit372_208_3(lastChild.nodeName === 'br'))) {
        _$jscoverage['/editor/html-data-processor.js'].lineData[209]++;
        block.removeChild(lastChild);
      } else {
        _$jscoverage['/editor/html-data-processor.js'].lineData[210]++;
        if (visit373_210_1(visit374_210_2(lastChild.nodeType === 3) && tailNbspRegex.test(lastChild.nodeValue))) {
          _$jscoverage['/editor/html-data-processor.js'].lineData[211]++;
          block.removeChild(lastChild);
        }
      }
    }
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[216]++;
  function blockNeedsExtension(block) {
    _$jscoverage['/editor/html-data-processor.js'].functionData[16]++;
    _$jscoverage['/editor/html-data-processor.js'].lineData[217]++;
    var lastChild = lastNoneSpaceChild(block);
    _$jscoverage['/editor/html-data-processor.js'].lineData[219]++;
    return visit375_219_1(!lastChild || visit376_222_1(visit377_222_2(block.nodeName === 'form') && visit378_223_1(lastChild.nodeName === 'input')));
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[227]++;
  function extendBlockForDisplay(block) {
    _$jscoverage['/editor/html-data-processor.js'].functionData[17]++;
    _$jscoverage['/editor/html-data-processor.js'].lineData[228]++;
    trimFillers(block);
    _$jscoverage['/editor/html-data-processor.js'].lineData[229]++;
    if (visit379_229_1(blockNeedsExtension(block))) {
      _$jscoverage['/editor/html-data-processor.js'].lineData[232]++;
      if (visit380_232_1(!OLD_IE)) {
        _$jscoverage['/editor/html-data-processor.js'].lineData[233]++;
        block.appendChild(new HtmlParser.Tag('br'));
      }
    }
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[239]++;
  function extendBlockForOutput(block) {
    _$jscoverage['/editor/html-data-processor.js'].functionData[18]++;
    _$jscoverage['/editor/html-data-processor.js'].lineData[240]++;
    trimFillers(block);
    _$jscoverage['/editor/html-data-processor.js'].lineData[241]++;
    if (visit381_241_1(blockNeedsExtension(block))) {
      _$jscoverage['/editor/html-data-processor.js'].lineData[244]++;
      block.appendChild(new HtmlParser.Text('\xa0'));
    }
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[249]++;
  var blockLikeTags = S.merge(dtd.$block, dtd.$listItem, dtd.$tableContent), i;
  _$jscoverage['/editor/html-data-processor.js'].lineData[253]++;
  for (i in blockLikeTags) {
    _$jscoverage['/editor/html-data-processor.js'].lineData[254]++;
    if (visit382_254_1(!('br' in dtd[i]))) {
      _$jscoverage['/editor/html-data-processor.js'].lineData[255]++;
      delete blockLikeTags[i];
    }
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[261]++;
  delete blockLikeTags.pre;
  _$jscoverage['/editor/html-data-processor.js'].lineData[262]++;
  var defaultDataBlockFilterRules = {
  tags: {}};
  _$jscoverage['/editor/html-data-processor.js'].lineData[263]++;
  var defaultHTMLBlockFilterRules = {
  tags: {}};
  _$jscoverage['/editor/html-data-processor.js'].lineData[265]++;
  for (i in blockLikeTags) {
    _$jscoverage['/editor/html-data-processor.js'].lineData[266]++;
    defaultDataBlockFilterRules.tags[i] = extendBlockForDisplay;
    _$jscoverage['/editor/html-data-processor.js'].lineData[267]++;
    defaultHTMLBlockFilterRules.tags[i] = extendBlockForOutput;
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[270]++;
  dataFilter.addRules(defaultDataBlockFilterRules);
  _$jscoverage['/editor/html-data-processor.js'].lineData[271]++;
  htmlFilter.addRules(defaultHTMLBlockFilterRules);
})();
  _$jscoverage['/editor/html-data-processor.js'].lineData[277]++;
  htmlFilter.addRules({
  text: function(text) {
  _$jscoverage['/editor/html-data-processor.js'].functionData[19]++;
  _$jscoverage['/editor/html-data-processor.js'].lineData[279]++;
  return text.replace(/\xa0/g, '&nbsp;');
}});
  _$jscoverage['/editor/html-data-processor.js'].lineData[285]++;
  var protectElementRegex = /<(a|area|img|input)\b([^>]*)>/gi, protectAttributeRegex = /\b(href|src|name)\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|(?:[^ "'>]+))/gi;
  _$jscoverage['/editor/html-data-processor.js'].lineData[290]++;
  function protectAttributes(html) {
    _$jscoverage['/editor/html-data-processor.js'].functionData[20]++;
    _$jscoverage['/editor/html-data-processor.js'].lineData[291]++;
    return html.replace(protectElementRegex, function(element, tag, attributes) {
  _$jscoverage['/editor/html-data-processor.js'].functionData[21]++;
  _$jscoverage['/editor/html-data-processor.js'].lineData[292]++;
  return '<' + tag + attributes.replace(protectAttributeRegex, function(fullAttr, attrName) {
  _$jscoverage['/editor/html-data-processor.js'].functionData[22]++;
  _$jscoverage['/editor/html-data-processor.js'].lineData[295]++;
  if (visit383_295_1(attributes.indexOf('_keSaved_' + attrName) === -1)) {
    _$jscoverage['/editor/html-data-processor.js'].lineData[296]++;
    return ' _keSaved_' + fullAttr + ' ' + fullAttr;
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[298]++;
  return fullAttr;
}) + '>';
});
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[303]++;
  var protectedSourceMarker = '{ke_protected}';
  _$jscoverage['/editor/html-data-processor.js'].lineData[305]++;
  var protectElementsRegex = /(?:<textarea[^>]*>[\s\S]*<\/textarea>)|(?:<style[^>]*>[\s\S]*<\/style>)|(?:<script[^>]*>[\s\S]*<\/script>)|(?:<(:?link|meta|base)[^>]*>)/gi, encodedElementsRegex = /<ke:encoded>([^<]*)<\/ke:encoded>/gi;
  _$jscoverage['/editor/html-data-processor.js'].lineData[308]++;
  var protectElementNamesRegex = /(<\/?)((?:object|embed|param|html|body|head|title|noscript)[^>]*>)/gi, unprotectElementNamesRegex = /(<\/?)ke:((?:object|embed|param|html|body|head|title|noscript)[^>]*>)/gi;
  _$jscoverage['/editor/html-data-processor.js'].lineData[311]++;
  var protectSelfClosingRegex = /<ke:(param|embed)([^>]*?)\/?>(?!\s*<\/ke:\1)/gi;
  _$jscoverage['/editor/html-data-processor.js'].lineData[313]++;
  function protectSelfClosingElements(html) {
    _$jscoverage['/editor/html-data-processor.js'].functionData[23]++;
    _$jscoverage['/editor/html-data-processor.js'].lineData[314]++;
    return html.replace(protectSelfClosingRegex, '<ke:$1$2></ke:$1>');
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[317]++;
  function protectElements(html) {
    _$jscoverage['/editor/html-data-processor.js'].functionData[24]++;
    _$jscoverage['/editor/html-data-processor.js'].lineData[318]++;
    return html.replace(protectElementsRegex, function(match) {
  _$jscoverage['/editor/html-data-processor.js'].functionData[25]++;
  _$jscoverage['/editor/html-data-processor.js'].lineData[319]++;
  return '<ke:encoded>' + encodeURIComponent(match) + '</ke:encoded>';
});
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[323]++;
  function unprotectElements(html) {
    _$jscoverage['/editor/html-data-processor.js'].functionData[26]++;
    _$jscoverage['/editor/html-data-processor.js'].lineData[324]++;
    return html.replace(encodedElementsRegex, function(match, encoded) {
  _$jscoverage['/editor/html-data-processor.js'].functionData[27]++;
  _$jscoverage['/editor/html-data-processor.js'].lineData[325]++;
  return S.urlDecode(encoded);
});
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[329]++;
  function protectElementsNames(html) {
    _$jscoverage['/editor/html-data-processor.js'].functionData[28]++;
    _$jscoverage['/editor/html-data-processor.js'].lineData[330]++;
    return html.replace(protectElementNamesRegex, '$1ke:$2');
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[333]++;
  function unprotectElementNames(html) {
    _$jscoverage['/editor/html-data-processor.js'].functionData[29]++;
    _$jscoverage['/editor/html-data-processor.js'].lineData[334]++;
    return html.replace(unprotectElementNamesRegex, '$1$2');
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[337]++;
  editor.htmlDataProcessor = {
  dataFilter: dataFilter, 
  htmlFilter: htmlFilter, 
  toHtml: function(html) {
  _$jscoverage['/editor/html-data-processor.js'].functionData[30]++;
  _$jscoverage['/editor/html-data-processor.js'].lineData[343]++;
  if (visit384_343_1(UA.webkit)) {
    _$jscoverage['/editor/html-data-processor.js'].lineData[345]++;
    html = html.replace(/\u200b/g, '');
  }
  _$jscoverage['/editor/html-data-processor.js'].lineData[351]++;
  var writer = new HtmlParser.BeautifyWriter(), n = new HtmlParser.Parser(html).parse();
  _$jscoverage['/editor/html-data-processor.js'].lineData[353]++;
  n.writeHtml(writer, htmlFilter);
  _$jscoverage['/editor/html-data-processor.js'].lineData[354]++;
  html = writer.getHtml();
  _$jscoverage['/editor/html-data-processor.js'].lineData[355]++;
  return html;
}, 
  toDataFormat: function(html, _dataFilter) {
  _$jscoverage['/editor/html-data-processor.js'].functionData[31]++;
  _$jscoverage['/editor/html-data-processor.js'].lineData[360]++;
  _dataFilter = visit385_360_1(_dataFilter || dataFilter);
  _$jscoverage['/editor/html-data-processor.js'].lineData[367]++;
  html = protectElements(html);
  _$jscoverage['/editor/html-data-processor.js'].lineData[369]++;
  html = protectAttributes(html);
  _$jscoverage['/editor/html-data-processor.js'].lineData[373]++;
  html = protectElementsNames(html);
  _$jscoverage['/editor/html-data-processor.js'].lineData[377]++;
  html = protectSelfClosingElements(html);
  _$jscoverage['/editor/html-data-processor.js'].lineData[382]++;
  var div = new Node('<div>');
  _$jscoverage['/editor/html-data-processor.js'].lineData[384]++;
  div.html('a' + html);
  _$jscoverage['/editor/html-data-processor.js'].lineData[385]++;
  html = div.html().substr(1);
  _$jscoverage['/editor/html-data-processor.js'].lineData[388]++;
  html = unprotectElementNames(html);
  _$jscoverage['/editor/html-data-processor.js'].lineData[390]++;
  html = unprotectElements(html);
  _$jscoverage['/editor/html-data-processor.js'].lineData[395]++;
  var writer = new HtmlParser.BasicWriter(), n = new HtmlParser.Parser(html).parse();
  _$jscoverage['/editor/html-data-processor.js'].lineData[398]++;
  n.writeHtml(writer, _dataFilter);
  _$jscoverage['/editor/html-data-processor.js'].lineData[400]++;
  html = writer.getHtml();
  _$jscoverage['/editor/html-data-processor.js'].lineData[402]++;
  return html;
}, 
  toServer: function(html) {
  _$jscoverage['/editor/html-data-processor.js'].functionData[32]++;
  _$jscoverage['/editor/html-data-processor.js'].lineData[408]++;
  var writer = new HtmlParser.MinifyWriter(), n = new HtmlParser.Parser(html).parse();
  _$jscoverage['/editor/html-data-processor.js'].lineData[410]++;
  n.writeHtml(writer, htmlFilter);
  _$jscoverage['/editor/html-data-processor.js'].lineData[411]++;
  return writer.getHtml();
}};
}};
});
