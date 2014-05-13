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
if (! _$jscoverage['/util/object.js']) {
  _$jscoverage['/util/object.js'] = {};
  _$jscoverage['/util/object.js'].lineData = [];
  _$jscoverage['/util/object.js'].lineData[6] = 0;
  _$jscoverage['/util/object.js'].lineData[7] = 0;
  _$jscoverage['/util/object.js'].lineData[8] = 0;
  _$jscoverage['/util/object.js'].lineData[9] = 0;
  _$jscoverage['/util/object.js'].lineData[10] = 0;
  _$jscoverage['/util/object.js'].lineData[20] = 0;
  _$jscoverage['/util/object.js'].lineData[31] = 0;
  _$jscoverage['/util/object.js'].lineData[39] = 0;
  _$jscoverage['/util/object.js'].lineData[41] = 0;
  _$jscoverage['/util/object.js'].lineData[43] = 0;
  _$jscoverage['/util/object.js'].lineData[44] = 0;
  _$jscoverage['/util/object.js'].lineData[48] = 0;
  _$jscoverage['/util/object.js'].lineData[49] = 0;
  _$jscoverage['/util/object.js'].lineData[50] = 0;
  _$jscoverage['/util/object.js'].lineData[51] = 0;
  _$jscoverage['/util/object.js'].lineData[52] = 0;
  _$jscoverage['/util/object.js'].lineData[57] = 0;
  _$jscoverage['/util/object.js'].lineData[68] = 0;
  _$jscoverage['/util/object.js'].lineData[69] = 0;
  _$jscoverage['/util/object.js'].lineData[77] = 0;
  _$jscoverage['/util/object.js'].lineData[79] = 0;
  _$jscoverage['/util/object.js'].lineData[80] = 0;
  _$jscoverage['/util/object.js'].lineData[81] = 0;
  _$jscoverage['/util/object.js'].lineData[82] = 0;
  _$jscoverage['/util/object.js'].lineData[84] = 0;
  _$jscoverage['/util/object.js'].lineData[85] = 0;
  _$jscoverage['/util/object.js'].lineData[89] = 0;
  _$jscoverage['/util/object.js'].lineData[91] = 0;
  _$jscoverage['/util/object.js'].lineData[92] = 0;
  _$jscoverage['/util/object.js'].lineData[97] = 0;
  _$jscoverage['/util/object.js'].lineData[109] = 0;
  _$jscoverage['/util/object.js'].lineData[113] = 0;
  _$jscoverage['/util/object.js'].lineData[121] = 0;
  _$jscoverage['/util/object.js'].lineData[122] = 0;
  _$jscoverage['/util/object.js'].lineData[123] = 0;
  _$jscoverage['/util/object.js'].lineData[126] = 0;
  _$jscoverage['/util/object.js'].lineData[137] = 0;
  _$jscoverage['/util/object.js'].lineData[138] = 0;
  _$jscoverage['/util/object.js'].lineData[139] = 0;
  _$jscoverage['/util/object.js'].lineData[140] = 0;
  _$jscoverage['/util/object.js'].lineData[141] = 0;
  _$jscoverage['/util/object.js'].lineData[142] = 0;
  _$jscoverage['/util/object.js'].lineData[143] = 0;
  _$jscoverage['/util/object.js'].lineData[146] = 0;
  _$jscoverage['/util/object.js'].lineData[149] = 0;
  _$jscoverage['/util/object.js'].lineData[174] = 0;
  _$jscoverage['/util/object.js'].lineData[175] = 0;
  _$jscoverage['/util/object.js'].lineData[179] = 0;
  _$jscoverage['/util/object.js'].lineData[180] = 0;
  _$jscoverage['/util/object.js'].lineData[183] = 0;
  _$jscoverage['/util/object.js'].lineData[184] = 0;
  _$jscoverage['/util/object.js'].lineData[185] = 0;
  _$jscoverage['/util/object.js'].lineData[186] = 0;
  _$jscoverage['/util/object.js'].lineData[190] = 0;
  _$jscoverage['/util/object.js'].lineData[191] = 0;
  _$jscoverage['/util/object.js'].lineData[194] = 0;
  _$jscoverage['/util/object.js'].lineData[197] = 0;
  _$jscoverage['/util/object.js'].lineData[198] = 0;
  _$jscoverage['/util/object.js'].lineData[199] = 0;
  _$jscoverage['/util/object.js'].lineData[201] = 0;
  _$jscoverage['/util/object.js'].lineData[214] = 0;
  _$jscoverage['/util/object.js'].lineData[215] = 0;
  _$jscoverage['/util/object.js'].lineData[218] = 0;
  _$jscoverage['/util/object.js'].lineData[219] = 0;
  _$jscoverage['/util/object.js'].lineData[221] = 0;
  _$jscoverage['/util/object.js'].lineData[234] = 0;
  _$jscoverage['/util/object.js'].lineData[242] = 0;
  _$jscoverage['/util/object.js'].lineData[244] = 0;
  _$jscoverage['/util/object.js'].lineData[245] = 0;
  _$jscoverage['/util/object.js'].lineData[246] = 0;
  _$jscoverage['/util/object.js'].lineData[247] = 0;
  _$jscoverage['/util/object.js'].lineData[249] = 0;
  _$jscoverage['/util/object.js'].lineData[250] = 0;
  _$jscoverage['/util/object.js'].lineData[251] = 0;
  _$jscoverage['/util/object.js'].lineData[254] = 0;
  _$jscoverage['/util/object.js'].lineData[255] = 0;
  _$jscoverage['/util/object.js'].lineData[256] = 0;
  _$jscoverage['/util/object.js'].lineData[257] = 0;
  _$jscoverage['/util/object.js'].lineData[259] = 0;
  _$jscoverage['/util/object.js'].lineData[262] = 0;
  _$jscoverage['/util/object.js'].lineData[277] = 0;
  _$jscoverage['/util/object.js'].lineData[278] = 0;
  _$jscoverage['/util/object.js'].lineData[279] = 0;
  _$jscoverage['/util/object.js'].lineData[281] = 0;
  _$jscoverage['/util/object.js'].lineData[282] = 0;
  _$jscoverage['/util/object.js'].lineData[284] = 0;
  _$jscoverage['/util/object.js'].lineData[285] = 0;
  _$jscoverage['/util/object.js'].lineData[289] = 0;
  _$jscoverage['/util/object.js'].lineData[294] = 0;
  _$jscoverage['/util/object.js'].lineData[297] = 0;
  _$jscoverage['/util/object.js'].lineData[298] = 0;
  _$jscoverage['/util/object.js'].lineData[299] = 0;
  _$jscoverage['/util/object.js'].lineData[302] = 0;
  _$jscoverage['/util/object.js'].lineData[303] = 0;
  _$jscoverage['/util/object.js'].lineData[307] = 0;
  _$jscoverage['/util/object.js'].lineData[308] = 0;
  _$jscoverage['/util/object.js'].lineData[311] = 0;
  _$jscoverage['/util/object.js'].lineData[328] = 0;
  _$jscoverage['/util/object.js'].lineData[333] = 0;
  _$jscoverage['/util/object.js'].lineData[334] = 0;
  _$jscoverage['/util/object.js'].lineData[335] = 0;
  _$jscoverage['/util/object.js'].lineData[336] = 0;
  _$jscoverage['/util/object.js'].lineData[337] = 0;
  _$jscoverage['/util/object.js'].lineData[340] = 0;
  _$jscoverage['/util/object.js'].lineData[344] = 0;
  _$jscoverage['/util/object.js'].lineData[347] = 0;
  _$jscoverage['/util/object.js'].lineData[348] = 0;
  _$jscoverage['/util/object.js'].lineData[349] = 0;
  _$jscoverage['/util/object.js'].lineData[350] = 0;
  _$jscoverage['/util/object.js'].lineData[352] = 0;
  _$jscoverage['/util/object.js'].lineData[353] = 0;
  _$jscoverage['/util/object.js'].lineData[355] = 0;
  _$jscoverage['/util/object.js'].lineData[356] = 0;
  _$jscoverage['/util/object.js'].lineData[359] = 0;
  _$jscoverage['/util/object.js'].lineData[360] = 0;
  _$jscoverage['/util/object.js'].lineData[361] = 0;
  _$jscoverage['/util/object.js'].lineData[365] = 0;
  _$jscoverage['/util/object.js'].lineData[366] = 0;
  _$jscoverage['/util/object.js'].lineData[367] = 0;
  _$jscoverage['/util/object.js'].lineData[369] = 0;
  _$jscoverage['/util/object.js'].lineData[372] = 0;
  _$jscoverage['/util/object.js'].lineData[375] = 0;
  _$jscoverage['/util/object.js'].lineData[378] = 0;
  _$jscoverage['/util/object.js'].lineData[379] = 0;
  _$jscoverage['/util/object.js'].lineData[380] = 0;
  _$jscoverage['/util/object.js'].lineData[381] = 0;
  _$jscoverage['/util/object.js'].lineData[382] = 0;
  _$jscoverage['/util/object.js'].lineData[384] = 0;
  _$jscoverage['/util/object.js'].lineData[388] = 0;
  _$jscoverage['/util/object.js'].lineData[391] = 0;
  _$jscoverage['/util/object.js'].lineData[392] = 0;
  _$jscoverage['/util/object.js'].lineData[395] = 0;
  _$jscoverage['/util/object.js'].lineData[399] = 0;
  _$jscoverage['/util/object.js'].lineData[400] = 0;
  _$jscoverage['/util/object.js'].lineData[403] = 0;
  _$jscoverage['/util/object.js'].lineData[405] = 0;
  _$jscoverage['/util/object.js'].lineData[406] = 0;
  _$jscoverage['/util/object.js'].lineData[408] = 0;
  _$jscoverage['/util/object.js'].lineData[410] = 0;
  _$jscoverage['/util/object.js'].lineData[411] = 0;
  _$jscoverage['/util/object.js'].lineData[414] = 0;
  _$jscoverage['/util/object.js'].lineData[415] = 0;
  _$jscoverage['/util/object.js'].lineData[416] = 0;
  _$jscoverage['/util/object.js'].lineData[420] = 0;
  _$jscoverage['/util/object.js'].lineData[423] = 0;
  _$jscoverage['/util/object.js'].lineData[424] = 0;
  _$jscoverage['/util/object.js'].lineData[426] = 0;
  _$jscoverage['/util/object.js'].lineData[427] = 0;
}
if (! _$jscoverage['/util/object.js'].functionData) {
  _$jscoverage['/util/object.js'].functionData = [];
  _$jscoverage['/util/object.js'].functionData[0] = 0;
  _$jscoverage['/util/object.js'].functionData[1] = 0;
  _$jscoverage['/util/object.js'].functionData[2] = 0;
  _$jscoverage['/util/object.js'].functionData[3] = 0;
  _$jscoverage['/util/object.js'].functionData[4] = 0;
  _$jscoverage['/util/object.js'].functionData[5] = 0;
  _$jscoverage['/util/object.js'].functionData[6] = 0;
  _$jscoverage['/util/object.js'].functionData[7] = 0;
  _$jscoverage['/util/object.js'].functionData[8] = 0;
  _$jscoverage['/util/object.js'].functionData[9] = 0;
  _$jscoverage['/util/object.js'].functionData[10] = 0;
  _$jscoverage['/util/object.js'].functionData[11] = 0;
  _$jscoverage['/util/object.js'].functionData[12] = 0;
  _$jscoverage['/util/object.js'].functionData[13] = 0;
  _$jscoverage['/util/object.js'].functionData[14] = 0;
  _$jscoverage['/util/object.js'].functionData[15] = 0;
  _$jscoverage['/util/object.js'].functionData[16] = 0;
  _$jscoverage['/util/object.js'].functionData[17] = 0;
  _$jscoverage['/util/object.js'].functionData[18] = 0;
}
if (! _$jscoverage['/util/object.js'].branchData) {
  _$jscoverage['/util/object.js'].branchData = {};
  _$jscoverage['/util/object.js'].branchData['38'] = [];
  _$jscoverage['/util/object.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['43'] = [];
  _$jscoverage['/util/object.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['48'] = [];
  _$jscoverage['/util/object.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['49'] = [];
  _$jscoverage['/util/object.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['51'] = [];
  _$jscoverage['/util/object.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['68'] = [];
  _$jscoverage['/util/object.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['73'] = [];
  _$jscoverage['/util/object.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['75'] = [];
  _$jscoverage['/util/object.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['75'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['75'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['77'] = [];
  _$jscoverage['/util/object.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['79'] = [];
  _$jscoverage['/util/object.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['81'] = [];
  _$jscoverage['/util/object.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['84'] = [];
  _$jscoverage['/util/object.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['90'] = [];
  _$jscoverage['/util/object.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['91'] = [];
  _$jscoverage['/util/object.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['108'] = [];
  _$jscoverage['/util/object.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['113'] = [];
  _$jscoverage['/util/object.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['122'] = [];
  _$jscoverage['/util/object.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['137'] = [];
  _$jscoverage['/util/object.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['139'] = [];
  _$jscoverage['/util/object.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['141'] = [];
  _$jscoverage['/util/object.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['174'] = [];
  _$jscoverage['/util/object.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['183'] = [];
  _$jscoverage['/util/object.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['183'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['190'] = [];
  _$jscoverage['/util/object.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['218'] = [];
  _$jscoverage['/util/object.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['244'] = [];
  _$jscoverage['/util/object.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['249'] = [];
  _$jscoverage['/util/object.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['254'] = [];
  _$jscoverage['/util/object.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['277'] = [];
  _$jscoverage['/util/object.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['278'] = [];
  _$jscoverage['/util/object.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['281'] = [];
  _$jscoverage['/util/object.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['284'] = [];
  _$jscoverage['/util/object.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['302'] = [];
  _$jscoverage['/util/object.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['307'] = [];
  _$jscoverage['/util/object.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['331'] = [];
  _$jscoverage['/util/object.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['331'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['333'] = [];
  _$jscoverage['/util/object.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['336'] = [];
  _$jscoverage['/util/object.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['336'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['337'] = [];
  _$jscoverage['/util/object.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['349'] = [];
  _$jscoverage['/util/object.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['366'] = [];
  _$jscoverage['/util/object.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['380'] = [];
  _$jscoverage['/util/object.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['382'] = [];
  _$jscoverage['/util/object.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['392'] = [];
  _$jscoverage['/util/object.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['399'] = [];
  _$jscoverage['/util/object.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['399'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['403'] = [];
  _$jscoverage['/util/object.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['405'] = [];
  _$jscoverage['/util/object.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['410'] = [];
  _$jscoverage['/util/object.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['414'] = [];
  _$jscoverage['/util/object.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['414'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['414'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['415'] = [];
  _$jscoverage['/util/object.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['420'] = [];
  _$jscoverage['/util/object.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['420'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['426'] = [];
  _$jscoverage['/util/object.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['426'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['426'][3] = new BranchData();
}
_$jscoverage['/util/object.js'].branchData['426'][3].init(1095, 15, 'ov || !(p in r)');
function visit142_426_3(result) {
  _$jscoverage['/util/object.js'].branchData['426'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['426'][2].init(1077, 13, 'src !== undef');
function visit141_426_2(result) {
  _$jscoverage['/util/object.js'].branchData['426'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['426'][1].init(1077, 34, 'src !== undef && (ov || !(p in r))');
function visit140_426_1(result) {
  _$jscoverage['/util/object.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['420'][2].init(139, 50, 'util.isArray(target) || util.isPlainObject(target)');
function visit139_420_2(result) {
  _$jscoverage['/util/object.js'].branchData['420'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['420'][1].init(128, 62, 'target && (util.isArray(target) || util.isPlainObject(target))');
function visit138_420_1(result) {
  _$jscoverage['/util/object.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['415'][1].init(22, 27, 'src[MIX_CIRCULAR_DETECTION]');
function visit137_415_1(result) {
  _$jscoverage['/util/object.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['414'][3].init(465, 44, 'util.isArray(src) || util.isPlainObject(src)');
function visit136_414_3(result) {
  _$jscoverage['/util/object.js'].branchData['414'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['414'][2].init(457, 53, 'src && (util.isArray(src) || util.isPlainObject(src))');
function visit135_414_2(result) {
  _$jscoverage['/util/object.js'].branchData['414'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['414'][1].init(449, 61, 'deep && src && (util.isArray(src) || util.isPlainObject(src))');
function visit134_414_1(result) {
  _$jscoverage['/util/object.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['410'][1].init(332, 2, 'wl');
function visit133_410_1(result) {
  _$jscoverage['/util/object.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['405'][1].init(65, 16, 'target === undef');
function visit132_405_1(result) {
  _$jscoverage['/util/object.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['403'][1].init(118, 14, 'target === src');
function visit131_403_1(result) {
  _$jscoverage['/util/object.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['399'][2].init(77, 17, '!(p in r) || deep');
function visit130_399_2(result) {
  _$jscoverage['/util/object.js'].branchData['399'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['399'][1].init(71, 23, 'ov || !(p in r) || deep');
function visit129_399_1(result) {
  _$jscoverage['/util/object.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['392'][1].init(17, 19, 'k === \'constructor\'');
function visit128_392_1(result) {
  _$jscoverage['/util/object.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['382'][1].init(44, 28, 'p !== MIX_CIRCULAR_DETECTION');
function visit127_382_1(result) {
  _$jscoverage['/util/object.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['380'][1].init(315, 7, 'i < len');
function visit126_380_1(result) {
  _$jscoverage['/util/object.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['366'][1].init(14, 8, '!s || !r');
function visit125_366_1(result) {
  _$jscoverage['/util/object.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['349'][1].init(37, 12, 'objectCreate');
function visit124_349_1(result) {
  _$jscoverage['/util/object.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['337'][1].init(36, 13, 'o[p[j]] || {}');
function visit123_337_1(result) {
  _$jscoverage['/util/object.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['336'][2].init(149, 12, 'j < p.length');
function visit122_336_2(result) {
  _$jscoverage['/util/object.js'].branchData['336'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['336'][1].init(122, 16, 'host[p[0]] === o');
function visit121_336_1(result) {
  _$jscoverage['/util/object.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['333'][1].init(206, 5, 'i < l');
function visit120_333_1(result) {
  _$jscoverage['/util/object.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['331'][2].init(134, 20, 'args[l - 1] === TRUE');
function visit119_331_2(result) {
  _$jscoverage['/util/object.js'].branchData['331'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['331'][1].init(134, 27, 'args[l - 1] === TRUE && l--');
function visit118_331_1(result) {
  _$jscoverage['/util/object.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['307'][1].init(855, 2, 'sx');
function visit117_307_1(result) {
  _$jscoverage['/util/object.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['302'][1].init(743, 2, 'px');
function visit116_302_1(result) {
  _$jscoverage['/util/object.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['284'][1].init(224, 8, '!s || !r');
function visit115_284_1(result) {
  _$jscoverage['/util/object.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['281'][1].init(123, 2, '!s');
function visit114_281_1(result) {
  _$jscoverage['/util/object.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['278'][1].init(22, 2, '!r');
function visit113_278_1(result) {
  _$jscoverage['/util/object.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['277'][1].init(18, 9, '\'@DEBUG@\'');
function visit112_277_1(result) {
  _$jscoverage['/util/object.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['254'][1].init(534, 7, 'i < len');
function visit111_254_1(result) {
  _$jscoverage['/util/object.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['249'][1].init(417, 23, 'typeof ov !== \'boolean\'');
function visit110_249_1(result) {
  _$jscoverage['/util/object.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['244'][1].init(285, 17, '!util.isArray(wl)');
function visit109_244_1(result) {
  _$jscoverage['/util/object.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['218'][1].init(158, 5, 'i < l');
function visit108_218_1(result) {
  _$jscoverage['/util/object.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['190'][1].init(524, 12, 'ov === undef');
function visit107_190_1(result) {
  _$jscoverage['/util/object.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['183'][2].init(284, 24, 'typeof wl !== \'function\'');
function visit106_183_2(result) {
  _$jscoverage['/util/object.js'].branchData['183'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['183'][1].init(277, 32, 'wl && (typeof wl !== \'function\')');
function visit105_183_1(result) {
  _$jscoverage['/util/object.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['174'][1].init(18, 22, 'typeof ov === \'object\'');
function visit104_174_1(result) {
  _$jscoverage['/util/object.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['141'][1].init(162, 9, '!readOnly');
function visit103_141_1(result) {
  _$jscoverage['/util/object.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['139'][1].init(99, 4, 'guid');
function visit102_139_1(result) {
  _$jscoverage['/util/object.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['137'][1].init(23, 22, 'marker || STAMP_MARKER');
function visit101_137_1(result) {
  _$jscoverage['/util/object.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['122'][1].init(22, 11, 'p !== undef');
function visit100_122_1(result) {
  _$jscoverage['/util/object.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['113'][1].init(21, 39, 'toString.call(obj) === \'[object Array]\'');
function visit99_113_1(result) {
  _$jscoverage['/util/object.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['108'][1].init(2778, 69, 'Date.now || function() {\n  return +new Date();\n}');
function visit98_108_1(result) {
  _$jscoverage['/util/object.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['91'][1].init(30, 42, 'fn.call(context, val, i, object) === false');
function visit97_91_1(result) {
  _$jscoverage['/util/object.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['90'][1].init(47, 10, 'i < length');
function visit96_90_1(result) {
  _$jscoverage['/util/object.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['84'][1].init(125, 52, 'fn.call(context, object[key], key, object) === false');
function visit95_84_1(result) {
  _$jscoverage['/util/object.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['81'][1].init(76, 15, 'i < keys.length');
function visit94_81_1(result) {
  _$jscoverage['/util/object.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['79'][1].init(402, 5, 'isObj');
function visit93_79_1(result) {
  _$jscoverage['/util/object.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['77'][1].init(362, 15, 'context || null');
function visit92_77_1(result) {
  _$jscoverage['/util/object.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['75'][3].init(267, 45, 'toString.call(object) === \'[object Function]\'');
function visit91_75_3(result) {
  _$jscoverage['/util/object.js'].branchData['75'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['75'][2].init(247, 16, 'length === undef');
function visit90_75_2(result) {
  _$jscoverage['/util/object.js'].branchData['75'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['75'][1].init(247, 65, 'length === undef || toString.call(object) === \'[object Function]\'');
function visit89_75_1(result) {
  _$jscoverage['/util/object.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['73'][1].init(119, 23, 'object && object.length');
function visit88_73_1(result) {
  _$jscoverage['/util/object.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['68'][1].init(18, 6, 'object');
function visit87_68_1(result) {
  _$jscoverage['/util/object.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['51'][1].init(70, 19, 'o.hasOwnProperty(p)');
function visit86_51_1(result) {
  _$jscoverage['/util/object.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['49'][1].init(54, 6, 'i >= 0');
function visit85_49_1(result) {
  _$jscoverage['/util/object.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['48'][1].init(241, 10, 'hasEnumBug');
function visit84_48_1(result) {
  _$jscoverage['/util/object.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['43'][1].init(62, 19, 'o.hasOwnProperty(p)');
function visit83_43_1(result) {
  _$jscoverage['/util/object.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['38'][1].init(179, 582, 'Object.keys || function(o) {\n  var result = [], p, i;\n  for (p in o) {\n    if (o.hasOwnProperty(p)) {\n      result.push(p);\n    }\n  }\n  if (hasEnumBug) {\n    for (i = enumProperties.length - 1; i >= 0; i--) {\n      p = enumProperties[i];\n      if (o.hasOwnProperty(p)) {\n        result.push(p);\n      }\n    }\n  }\n  return result;\n}');
function visit82_38_1(result) {
  _$jscoverage['/util/object.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/util/object.js'].functionData[0]++;
  _$jscoverage['/util/object.js'].lineData[7]++;
  var util = require('./base');
  _$jscoverage['/util/object.js'].lineData[8]++;
  var undef;
  _$jscoverage['/util/object.js'].lineData[9]++;
  var logger = S.getLogger('s/util');
  _$jscoverage['/util/object.js'].lineData[10]++;
  var MIX_CIRCULAR_DETECTION = '__MIX_CIRCULAR', STAMP_MARKER = '__~ks_stamped', host = S.Env.host, TRUE = true, EMPTY = '', toString = ({}).toString, Obj = Object, objectCreate = Obj.create;
  _$jscoverage['/util/object.js'].lineData[20]++;
  var hasEnumBug = !({
  toString: 1}.propertyIsEnumerable('toString')), enumProperties = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toString', 'toLocaleString', 'valueOf'];
  _$jscoverage['/util/object.js'].lineData[31]++;
  mix(util, {
  keys: visit82_38_1(Object.keys || function(o) {
  _$jscoverage['/util/object.js'].functionData[1]++;
  _$jscoverage['/util/object.js'].lineData[39]++;
  var result = [], p, i;
  _$jscoverage['/util/object.js'].lineData[41]++;
  for (p in o) {
    _$jscoverage['/util/object.js'].lineData[43]++;
    if (visit83_43_1(o.hasOwnProperty(p))) {
      _$jscoverage['/util/object.js'].lineData[44]++;
      result.push(p);
    }
  }
  _$jscoverage['/util/object.js'].lineData[48]++;
  if (visit84_48_1(hasEnumBug)) {
    _$jscoverage['/util/object.js'].lineData[49]++;
    for (i = enumProperties.length - 1; visit85_49_1(i >= 0); i--) {
      _$jscoverage['/util/object.js'].lineData[50]++;
      p = enumProperties[i];
      _$jscoverage['/util/object.js'].lineData[51]++;
      if (visit86_51_1(o.hasOwnProperty(p))) {
        _$jscoverage['/util/object.js'].lineData[52]++;
        result.push(p);
      }
    }
  }
  _$jscoverage['/util/object.js'].lineData[57]++;
  return result;
}), 
  each: function(object, fn, context) {
  _$jscoverage['/util/object.js'].functionData[2]++;
  _$jscoverage['/util/object.js'].lineData[68]++;
  if (visit87_68_1(object)) {
    _$jscoverage['/util/object.js'].lineData[69]++;
    var key, val, keys, i = 0, length = visit88_73_1(object && object.length), isObj = visit89_75_1(visit90_75_2(length === undef) || visit91_75_3(toString.call(object) === '[object Function]'));
    _$jscoverage['/util/object.js'].lineData[77]++;
    context = visit92_77_1(context || null);
    _$jscoverage['/util/object.js'].lineData[79]++;
    if (visit93_79_1(isObj)) {
      _$jscoverage['/util/object.js'].lineData[80]++;
      keys = util.keys(object);
      _$jscoverage['/util/object.js'].lineData[81]++;
      for (; visit94_81_1(i < keys.length); i++) {
        _$jscoverage['/util/object.js'].lineData[82]++;
        key = keys[i];
        _$jscoverage['/util/object.js'].lineData[84]++;
        if (visit95_84_1(fn.call(context, object[key], key, object) === false)) {
          _$jscoverage['/util/object.js'].lineData[85]++;
          break;
        }
      }
    } else {
      _$jscoverage['/util/object.js'].lineData[89]++;
      for (val = object[0]; visit96_90_1(i < length); val = object[++i]) {
        _$jscoverage['/util/object.js'].lineData[91]++;
        if (visit97_91_1(fn.call(context, val, i, object) === false)) {
          _$jscoverage['/util/object.js'].lineData[92]++;
          break;
        }
      }
    }
  }
  _$jscoverage['/util/object.js'].lineData[97]++;
  return object;
}, 
  now: visit98_108_1(Date.now || function() {
  _$jscoverage['/util/object.js'].functionData[3]++;
  _$jscoverage['/util/object.js'].lineData[109]++;
  return +new Date();
}), 
  isArray: function(obj) {
  _$jscoverage['/util/object.js'].functionData[4]++;
  _$jscoverage['/util/object.js'].lineData[113]++;
  return visit99_113_1(toString.call(obj) === '[object Array]');
}, 
  isEmptyObject: function(o) {
  _$jscoverage['/util/object.js'].functionData[5]++;
  _$jscoverage['/util/object.js'].lineData[121]++;
  for (var p in o) {
    _$jscoverage['/util/object.js'].lineData[122]++;
    if (visit100_122_1(p !== undef)) {
      _$jscoverage['/util/object.js'].lineData[123]++;
      return false;
    }
  }
  _$jscoverage['/util/object.js'].lineData[126]++;
  return true;
}, 
  stamp: function(o, readOnly, marker) {
  _$jscoverage['/util/object.js'].functionData[6]++;
  _$jscoverage['/util/object.js'].lineData[137]++;
  marker = visit101_137_1(marker || STAMP_MARKER);
  _$jscoverage['/util/object.js'].lineData[138]++;
  var guid = o[marker];
  _$jscoverage['/util/object.js'].lineData[139]++;
  if (visit102_139_1(guid)) {
    _$jscoverage['/util/object.js'].lineData[140]++;
    return guid;
  } else {
    _$jscoverage['/util/object.js'].lineData[141]++;
    if (visit103_141_1(!readOnly)) {
      _$jscoverage['/util/object.js'].lineData[142]++;
      try {
        _$jscoverage['/util/object.js'].lineData[143]++;
        guid = o[marker] = util.guid(marker);
      }      catch (e) {
  _$jscoverage['/util/object.js'].lineData[146]++;
  guid = undef;
}
    }
  }
  _$jscoverage['/util/object.js'].lineData[149]++;
  return guid;
}, 
  mix: function(r, s, ov, wl, deep) {
  _$jscoverage['/util/object.js'].functionData[7]++;
  _$jscoverage['/util/object.js'].lineData[174]++;
  if (visit104_174_1(typeof ov === 'object')) {
    _$jscoverage['/util/object.js'].lineData[175]++;
    wl = ov.whitelist;
    _$jscoverage['/util/object.js'].lineData[179]++;
    deep = ov.deep;
    _$jscoverage['/util/object.js'].lineData[180]++;
    ov = ov.overwrite;
  }
  _$jscoverage['/util/object.js'].lineData[183]++;
  if (visit105_183_1(wl && (visit106_183_2(typeof wl !== 'function')))) {
    _$jscoverage['/util/object.js'].lineData[184]++;
    var originalWl = wl;
    _$jscoverage['/util/object.js'].lineData[185]++;
    wl = function(name, val) {
  _$jscoverage['/util/object.js'].functionData[8]++;
  _$jscoverage['/util/object.js'].lineData[186]++;
  return util.inArray(name, originalWl) ? val : undef;
};
  }
  _$jscoverage['/util/object.js'].lineData[190]++;
  if (visit107_190_1(ov === undef)) {
    _$jscoverage['/util/object.js'].lineData[191]++;
    ov = TRUE;
  }
  _$jscoverage['/util/object.js'].lineData[194]++;
  var cache = [], c, i = 0;
  _$jscoverage['/util/object.js'].lineData[197]++;
  mixInternal(r, s, ov, wl, deep, cache);
  _$jscoverage['/util/object.js'].lineData[198]++;
  while ((c = cache[i++])) {
    _$jscoverage['/util/object.js'].lineData[199]++;
    delete c[MIX_CIRCULAR_DETECTION];
  }
  _$jscoverage['/util/object.js'].lineData[201]++;
  return r;
}, 
  merge: function(varArgs) {
  _$jscoverage['/util/object.js'].functionData[9]++;
  _$jscoverage['/util/object.js'].lineData[214]++;
  varArgs = util.makeArray(arguments);
  _$jscoverage['/util/object.js'].lineData[215]++;
  var o = {}, i, l = varArgs.length;
  _$jscoverage['/util/object.js'].lineData[218]++;
  for (i = 0; visit108_218_1(i < l); i++) {
    _$jscoverage['/util/object.js'].lineData[219]++;
    util.mix(o, varArgs[i]);
  }
  _$jscoverage['/util/object.js'].lineData[221]++;
  return o;
}, 
  augment: function(r, varArgs) {
  _$jscoverage['/util/object.js'].functionData[10]++;
  _$jscoverage['/util/object.js'].lineData[234]++;
  var args = util.makeArray(arguments), len = args.length - 2, i = 1, proto, arg, ov = args[len], wl = args[len + 1];
  _$jscoverage['/util/object.js'].lineData[242]++;
  args[1] = varArgs;
  _$jscoverage['/util/object.js'].lineData[244]++;
  if (visit109_244_1(!util.isArray(wl))) {
    _$jscoverage['/util/object.js'].lineData[245]++;
    ov = wl;
    _$jscoverage['/util/object.js'].lineData[246]++;
    wl = undef;
    _$jscoverage['/util/object.js'].lineData[247]++;
    len++;
  }
  _$jscoverage['/util/object.js'].lineData[249]++;
  if (visit110_249_1(typeof ov !== 'boolean')) {
    _$jscoverage['/util/object.js'].lineData[250]++;
    ov = undef;
    _$jscoverage['/util/object.js'].lineData[251]++;
    len++;
  }
  _$jscoverage['/util/object.js'].lineData[254]++;
  for (; visit111_254_1(i < len); i++) {
    _$jscoverage['/util/object.js'].lineData[255]++;
    arg = args[i];
    _$jscoverage['/util/object.js'].lineData[256]++;
    if ((proto = arg.prototype)) {
      _$jscoverage['/util/object.js'].lineData[257]++;
      arg = util.mix({}, proto, true, removeConstructor);
    }
    _$jscoverage['/util/object.js'].lineData[259]++;
    util.mix(r.prototype, arg, ov, wl);
  }
  _$jscoverage['/util/object.js'].lineData[262]++;
  return r;
}, 
  extend: function(r, s, px, sx) {
  _$jscoverage['/util/object.js'].functionData[11]++;
  _$jscoverage['/util/object.js'].lineData[277]++;
  if (visit112_277_1('@DEBUG@')) {
    _$jscoverage['/util/object.js'].lineData[278]++;
    if (visit113_278_1(!r)) {
      _$jscoverage['/util/object.js'].lineData[279]++;
      logger.error('extend r is null');
    }
    _$jscoverage['/util/object.js'].lineData[281]++;
    if (visit114_281_1(!s)) {
      _$jscoverage['/util/object.js'].lineData[282]++;
      logger.error('extend s is null');
    }
    _$jscoverage['/util/object.js'].lineData[284]++;
    if (visit115_284_1(!s || !r)) {
      _$jscoverage['/util/object.js'].lineData[285]++;
      return r;
    }
  }
  _$jscoverage['/util/object.js'].lineData[289]++;
  var sp = s.prototype, rp;
  _$jscoverage['/util/object.js'].lineData[294]++;
  sp.constructor = s;
  _$jscoverage['/util/object.js'].lineData[297]++;
  rp = createObject(sp, r);
  _$jscoverage['/util/object.js'].lineData[298]++;
  r.prototype = util.mix(rp, r.prototype);
  _$jscoverage['/util/object.js'].lineData[299]++;
  r.superclass = sp;
  _$jscoverage['/util/object.js'].lineData[302]++;
  if (visit116_302_1(px)) {
    _$jscoverage['/util/object.js'].lineData[303]++;
    util.mix(rp, px);
  }
  _$jscoverage['/util/object.js'].lineData[307]++;
  if (visit117_307_1(sx)) {
    _$jscoverage['/util/object.js'].lineData[308]++;
    util.mix(r, sx);
  }
  _$jscoverage['/util/object.js'].lineData[311]++;
  return r;
}, 
  namespace: function() {
  _$jscoverage['/util/object.js'].functionData[12]++;
  _$jscoverage['/util/object.js'].lineData[328]++;
  var args = util.makeArray(arguments), l = args.length, o = null, i, j, p, global = (visit118_331_1(visit119_331_2(args[l - 1] === TRUE) && l--));
  _$jscoverage['/util/object.js'].lineData[333]++;
  for (i = 0; visit120_333_1(i < l); i++) {
    _$jscoverage['/util/object.js'].lineData[334]++;
    p = (EMPTY + args[i]).split('.');
    _$jscoverage['/util/object.js'].lineData[335]++;
    o = global ? host : this;
    _$jscoverage['/util/object.js'].lineData[336]++;
    for (j = (visit121_336_1(host[p[0]] === o)) ? 1 : 0; visit122_336_2(j < p.length); ++j) {
      _$jscoverage['/util/object.js'].lineData[337]++;
      o = o[p[j]] = visit123_337_1(o[p[j]] || {});
    }
  }
  _$jscoverage['/util/object.js'].lineData[340]++;
  return o;
}});
  _$jscoverage['/util/object.js'].lineData[344]++;
  function Empty() {
    _$jscoverage['/util/object.js'].functionData[13]++;
  }
  _$jscoverage['/util/object.js'].lineData[347]++;
  function createObject(proto, constructor) {
    _$jscoverage['/util/object.js'].functionData[14]++;
    _$jscoverage['/util/object.js'].lineData[348]++;
    var newProto;
    _$jscoverage['/util/object.js'].lineData[349]++;
    if (visit124_349_1(objectCreate)) {
      _$jscoverage['/util/object.js'].lineData[350]++;
      newProto = objectCreate(proto);
    } else {
      _$jscoverage['/util/object.js'].lineData[352]++;
      Empty.prototype = proto;
      _$jscoverage['/util/object.js'].lineData[353]++;
      newProto = new Empty();
    }
    _$jscoverage['/util/object.js'].lineData[355]++;
    newProto.constructor = constructor;
    _$jscoverage['/util/object.js'].lineData[356]++;
    return newProto;
  }
  _$jscoverage['/util/object.js'].lineData[359]++;
  function mix(r, s) {
    _$jscoverage['/util/object.js'].functionData[15]++;
    _$jscoverage['/util/object.js'].lineData[360]++;
    for (var i in s) {
      _$jscoverage['/util/object.js'].lineData[361]++;
      r[i] = s[i];
    }
  }
  _$jscoverage['/util/object.js'].lineData[365]++;
  function mixInternal(r, s, ov, wl, deep, cache) {
    _$jscoverage['/util/object.js'].functionData[16]++;
    _$jscoverage['/util/object.js'].lineData[366]++;
    if (visit125_366_1(!s || !r)) {
      _$jscoverage['/util/object.js'].lineData[367]++;
      return r;
    }
    _$jscoverage['/util/object.js'].lineData[369]++;
    var i, p, keys, len;
    _$jscoverage['/util/object.js'].lineData[372]++;
    s[MIX_CIRCULAR_DETECTION] = r;
    _$jscoverage['/util/object.js'].lineData[375]++;
    cache.push(s);
    _$jscoverage['/util/object.js'].lineData[378]++;
    keys = util.keys(s);
    _$jscoverage['/util/object.js'].lineData[379]++;
    len = keys.length;
    _$jscoverage['/util/object.js'].lineData[380]++;
    for (i = 0; visit126_380_1(i < len); i++) {
      _$jscoverage['/util/object.js'].lineData[381]++;
      p = keys[i];
      _$jscoverage['/util/object.js'].lineData[382]++;
      if (visit127_382_1(p !== MIX_CIRCULAR_DETECTION)) {
        _$jscoverage['/util/object.js'].lineData[384]++;
        _mix(p, r, s, ov, wl, deep, cache);
      }
    }
    _$jscoverage['/util/object.js'].lineData[388]++;
    return r;
  }
  _$jscoverage['/util/object.js'].lineData[391]++;
  function removeConstructor(k, v) {
    _$jscoverage['/util/object.js'].functionData[17]++;
    _$jscoverage['/util/object.js'].lineData[392]++;
    return visit128_392_1(k === 'constructor') ? undef : v;
  }
  _$jscoverage['/util/object.js'].lineData[395]++;
  function _mix(p, r, s, ov, wl, deep, cache) {
    _$jscoverage['/util/object.js'].functionData[18]++;
    _$jscoverage['/util/object.js'].lineData[399]++;
    if (visit129_399_1(ov || visit130_399_2(!(p in r) || deep))) {
      _$jscoverage['/util/object.js'].lineData[400]++;
      var target = r[p], src = s[p];
      _$jscoverage['/util/object.js'].lineData[403]++;
      if (visit131_403_1(target === src)) {
        _$jscoverage['/util/object.js'].lineData[405]++;
        if (visit132_405_1(target === undef)) {
          _$jscoverage['/util/object.js'].lineData[406]++;
          r[p] = target;
        }
        _$jscoverage['/util/object.js'].lineData[408]++;
        return;
      }
      _$jscoverage['/util/object.js'].lineData[410]++;
      if (visit133_410_1(wl)) {
        _$jscoverage['/util/object.js'].lineData[411]++;
        src = wl.call(s, p, src);
      }
      _$jscoverage['/util/object.js'].lineData[414]++;
      if (visit134_414_1(deep && visit135_414_2(src && (visit136_414_3(util.isArray(src) || util.isPlainObject(src)))))) {
        _$jscoverage['/util/object.js'].lineData[415]++;
        if (visit137_415_1(src[MIX_CIRCULAR_DETECTION])) {
          _$jscoverage['/util/object.js'].lineData[416]++;
          r[p] = src[MIX_CIRCULAR_DETECTION];
        } else {
          _$jscoverage['/util/object.js'].lineData[420]++;
          var clone = visit138_420_1(target && (visit139_420_2(util.isArray(target) || util.isPlainObject(target)))) ? target : (util.isArray(src) ? [] : {});
          _$jscoverage['/util/object.js'].lineData[423]++;
          r[p] = clone;
          _$jscoverage['/util/object.js'].lineData[424]++;
          mixInternal(clone, src, ov, wl, TRUE, cache);
        }
      } else {
        _$jscoverage['/util/object.js'].lineData[426]++;
        if (visit140_426_1(visit141_426_2(src !== undef) && (visit142_426_3(ov || !(p in r))))) {
          _$jscoverage['/util/object.js'].lineData[427]++;
          r[p] = src;
        }
      }
    }
  }
});
