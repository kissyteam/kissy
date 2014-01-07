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
if (! _$jscoverage['/router.js']) {
  _$jscoverage['/router.js'] = {};
  _$jscoverage['/router.js'].lineData = [];
  _$jscoverage['/router.js'].lineData[5] = 0;
  _$jscoverage['/router.js'].lineData[6] = 0;
  _$jscoverage['/router.js'].lineData[7] = 0;
  _$jscoverage['/router.js'].lineData[8] = 0;
  _$jscoverage['/router.js'].lineData[9] = 0;
  _$jscoverage['/router.js'].lineData[10] = 0;
  _$jscoverage['/router.js'].lineData[11] = 0;
  _$jscoverage['/router.js'].lineData[12] = 0;
  _$jscoverage['/router.js'].lineData[13] = 0;
  _$jscoverage['/router.js'].lineData[14] = 0;
  _$jscoverage['/router.js'].lineData[15] = 0;
  _$jscoverage['/router.js'].lineData[16] = 0;
  _$jscoverage['/router.js'].lineData[17] = 0;
  _$jscoverage['/router.js'].lineData[18] = 0;
  _$jscoverage['/router.js'].lineData[19] = 0;
  _$jscoverage['/router.js'].lineData[21] = 0;
  _$jscoverage['/router.js'].lineData[24] = 0;
  _$jscoverage['/router.js'].lineData[25] = 0;
  _$jscoverage['/router.js'].lineData[28] = 0;
  _$jscoverage['/router.js'].lineData[29] = 0;
  _$jscoverage['/router.js'].lineData[30] = 0;
  _$jscoverage['/router.js'].lineData[31] = 0;
  _$jscoverage['/router.js'].lineData[32] = 0;
  _$jscoverage['/router.js'].lineData[33] = 0;
  _$jscoverage['/router.js'].lineData[35] = 0;
  _$jscoverage['/router.js'].lineData[39] = 0;
  _$jscoverage['/router.js'].lineData[40] = 0;
  _$jscoverage['/router.js'].lineData[41] = 0;
  _$jscoverage['/router.js'].lineData[43] = 0;
  _$jscoverage['/router.js'].lineData[44] = 0;
  _$jscoverage['/router.js'].lineData[45] = 0;
  _$jscoverage['/router.js'].lineData[46] = 0;
  _$jscoverage['/router.js'].lineData[48] = 0;
  _$jscoverage['/router.js'].lineData[49] = 0;
  _$jscoverage['/router.js'].lineData[50] = 0;
  _$jscoverage['/router.js'].lineData[51] = 0;
  _$jscoverage['/router.js'].lineData[52] = 0;
  _$jscoverage['/router.js'].lineData[53] = 0;
  _$jscoverage['/router.js'].lineData[54] = 0;
  _$jscoverage['/router.js'].lineData[55] = 0;
  _$jscoverage['/router.js'].lineData[56] = 0;
  _$jscoverage['/router.js'].lineData[58] = 0;
  _$jscoverage['/router.js'].lineData[63] = 0;
  _$jscoverage['/router.js'].lineData[66] = 0;
  _$jscoverage['/router.js'].lineData[67] = 0;
  _$jscoverage['/router.js'].lineData[68] = 0;
  _$jscoverage['/router.js'].lineData[70] = 0;
  _$jscoverage['/router.js'].lineData[71] = 0;
  _$jscoverage['/router.js'].lineData[72] = 0;
  _$jscoverage['/router.js'].lineData[73] = 0;
  _$jscoverage['/router.js'].lineData[74] = 0;
  _$jscoverage['/router.js'].lineData[75] = 0;
  _$jscoverage['/router.js'].lineData[76] = 0;
  _$jscoverage['/router.js'].lineData[77] = 0;
  _$jscoverage['/router.js'].lineData[78] = 0;
  _$jscoverage['/router.js'].lineData[79] = 0;
  _$jscoverage['/router.js'].lineData[80] = 0;
  _$jscoverage['/router.js'].lineData[81] = 0;
  _$jscoverage['/router.js'].lineData[83] = 0;
  _$jscoverage['/router.js'].lineData[84] = 0;
  _$jscoverage['/router.js'].lineData[85] = 0;
  _$jscoverage['/router.js'].lineData[86] = 0;
  _$jscoverage['/router.js'].lineData[90] = 0;
  _$jscoverage['/router.js'].lineData[92] = 0;
  _$jscoverage['/router.js'].lineData[97] = 0;
  _$jscoverage['/router.js'].lineData[100] = 0;
  _$jscoverage['/router.js'].lineData[101] = 0;
  _$jscoverage['/router.js'].lineData[102] = 0;
  _$jscoverage['/router.js'].lineData[103] = 0;
  _$jscoverage['/router.js'].lineData[104] = 0;
  _$jscoverage['/router.js'].lineData[106] = 0;
  _$jscoverage['/router.js'].lineData[107] = 0;
  _$jscoverage['/router.js'].lineData[114] = 0;
  _$jscoverage['/router.js'].lineData[117] = 0;
  _$jscoverage['/router.js'].lineData[132] = 0;
  _$jscoverage['/router.js'].lineData[133] = 0;
  _$jscoverage['/router.js'].lineData[134] = 0;
  _$jscoverage['/router.js'].lineData[135] = 0;
  _$jscoverage['/router.js'].lineData[137] = 0;
  _$jscoverage['/router.js'].lineData[149] = 0;
  _$jscoverage['/router.js'].lineData[150] = 0;
  _$jscoverage['/router.js'].lineData[151] = 0;
  _$jscoverage['/router.js'].lineData[153] = 0;
  _$jscoverage['/router.js'].lineData[154] = 0;
  _$jscoverage['/router.js'].lineData[155] = 0;
  _$jscoverage['/router.js'].lineData[156] = 0;
  _$jscoverage['/router.js'].lineData[159] = 0;
  _$jscoverage['/router.js'].lineData[160] = 0;
  _$jscoverage['/router.js'].lineData[166] = 0;
  _$jscoverage['/router.js'].lineData[168] = 0;
  _$jscoverage['/router.js'].lineData[169] = 0;
  _$jscoverage['/router.js'].lineData[170] = 0;
  _$jscoverage['/router.js'].lineData[171] = 0;
  _$jscoverage['/router.js'].lineData[174] = 0;
  _$jscoverage['/router.js'].lineData[177] = 0;
  _$jscoverage['/router.js'].lineData[180] = 0;
  _$jscoverage['/router.js'].lineData[181] = 0;
  _$jscoverage['/router.js'].lineData[184] = 0;
  _$jscoverage['/router.js'].lineData[186] = 0;
  _$jscoverage['/router.js'].lineData[190] = 0;
  _$jscoverage['/router.js'].lineData[191] = 0;
  _$jscoverage['/router.js'].lineData[199] = 0;
  _$jscoverage['/router.js'].lineData[200] = 0;
  _$jscoverage['/router.js'].lineData[201] = 0;
  _$jscoverage['/router.js'].lineData[209] = 0;
  _$jscoverage['/router.js'].lineData[210] = 0;
  _$jscoverage['/router.js'].lineData[211] = 0;
  _$jscoverage['/router.js'].lineData[212] = 0;
  _$jscoverage['/router.js'].lineData[215] = 0;
  _$jscoverage['/router.js'].lineData[223] = 0;
  _$jscoverage['/router.js'].lineData[224] = 0;
  _$jscoverage['/router.js'].lineData[225] = 0;
  _$jscoverage['/router.js'].lineData[226] = 0;
  _$jscoverage['/router.js'].lineData[227] = 0;
  _$jscoverage['/router.js'].lineData[228] = 0;
  _$jscoverage['/router.js'].lineData[229] = 0;
  _$jscoverage['/router.js'].lineData[230] = 0;
  _$jscoverage['/router.js'].lineData[233] = 0;
  _$jscoverage['/router.js'].lineData[240] = 0;
  _$jscoverage['/router.js'].lineData[241] = 0;
  _$jscoverage['/router.js'].lineData[242] = 0;
  _$jscoverage['/router.js'].lineData[250] = 0;
  _$jscoverage['/router.js'].lineData[251] = 0;
  _$jscoverage['/router.js'].lineData[252] = 0;
  _$jscoverage['/router.js'].lineData[253] = 0;
  _$jscoverage['/router.js'].lineData[256] = 0;
  _$jscoverage['/router.js'].lineData[268] = 0;
  _$jscoverage['/router.js'].lineData[269] = 0;
  _$jscoverage['/router.js'].lineData[271] = 0;
  _$jscoverage['/router.js'].lineData[272] = 0;
  _$jscoverage['/router.js'].lineData[276] = 0;
  _$jscoverage['/router.js'].lineData[277] = 0;
  _$jscoverage['/router.js'].lineData[278] = 0;
  _$jscoverage['/router.js'].lineData[280] = 0;
  _$jscoverage['/router.js'].lineData[284] = 0;
  _$jscoverage['/router.js'].lineData[285] = 0;
  _$jscoverage['/router.js'].lineData[291] = 0;
  _$jscoverage['/router.js'].lineData[292] = 0;
  _$jscoverage['/router.js'].lineData[294] = 0;
  _$jscoverage['/router.js'].lineData[295] = 0;
  _$jscoverage['/router.js'].lineData[297] = 0;
  _$jscoverage['/router.js'].lineData[306] = 0;
  _$jscoverage['/router.js'].lineData[307] = 0;
  _$jscoverage['/router.js'].lineData[308] = 0;
  _$jscoverage['/router.js'].lineData[313] = 0;
  _$jscoverage['/router.js'].lineData[314] = 0;
  _$jscoverage['/router.js'].lineData[315] = 0;
  _$jscoverage['/router.js'].lineData[316] = 0;
  _$jscoverage['/router.js'].lineData[317] = 0;
  _$jscoverage['/router.js'].lineData[318] = 0;
  _$jscoverage['/router.js'].lineData[319] = 0;
  _$jscoverage['/router.js'].lineData[320] = 0;
  _$jscoverage['/router.js'].lineData[323] = 0;
  _$jscoverage['/router.js'].lineData[327] = 0;
  _$jscoverage['/router.js'].lineData[332] = 0;
  _$jscoverage['/router.js'].lineData[334] = 0;
  _$jscoverage['/router.js'].lineData[336] = 0;
  _$jscoverage['/router.js'].lineData[337] = 0;
  _$jscoverage['/router.js'].lineData[338] = 0;
  _$jscoverage['/router.js'].lineData[341] = 0;
  _$jscoverage['/router.js'].lineData[347] = 0;
  _$jscoverage['/router.js'].lineData[348] = 0;
  _$jscoverage['/router.js'].lineData[350] = 0;
  _$jscoverage['/router.js'].lineData[351] = 0;
  _$jscoverage['/router.js'].lineData[355] = 0;
  _$jscoverage['/router.js'].lineData[356] = 0;
  _$jscoverage['/router.js'].lineData[360] = 0;
  _$jscoverage['/router.js'].lineData[361] = 0;
  _$jscoverage['/router.js'].lineData[362] = 0;
}
if (! _$jscoverage['/router.js'].functionData) {
  _$jscoverage['/router.js'].functionData = [];
  _$jscoverage['/router.js'].functionData[0] = 0;
  _$jscoverage['/router.js'].functionData[1] = 0;
  _$jscoverage['/router.js'].functionData[2] = 0;
  _$jscoverage['/router.js'].functionData[3] = 0;
  _$jscoverage['/router.js'].functionData[4] = 0;
  _$jscoverage['/router.js'].functionData[5] = 0;
  _$jscoverage['/router.js'].functionData[6] = 0;
  _$jscoverage['/router.js'].functionData[7] = 0;
  _$jscoverage['/router.js'].functionData[8] = 0;
  _$jscoverage['/router.js'].functionData[9] = 0;
  _$jscoverage['/router.js'].functionData[10] = 0;
  _$jscoverage['/router.js'].functionData[11] = 0;
  _$jscoverage['/router.js'].functionData[12] = 0;
  _$jscoverage['/router.js'].functionData[13] = 0;
  _$jscoverage['/router.js'].functionData[14] = 0;
  _$jscoverage['/router.js'].functionData[15] = 0;
  _$jscoverage['/router.js'].functionData[16] = 0;
  _$jscoverage['/router.js'].functionData[17] = 0;
  _$jscoverage['/router.js'].functionData[18] = 0;
}
if (! _$jscoverage['/router.js'].branchData) {
  _$jscoverage['/router.js'].branchData = {};
  _$jscoverage['/router.js'].branchData['19'] = [];
  _$jscoverage['/router.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['29'] = [];
  _$jscoverage['/router.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['31'] = [];
  _$jscoverage['/router.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['45'] = [];
  _$jscoverage['/router.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['49'] = [];
  _$jscoverage['/router.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['72'] = [];
  _$jscoverage['/router.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['79'] = [];
  _$jscoverage['/router.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['84'] = [];
  _$jscoverage['/router.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['106'] = [];
  _$jscoverage['/router.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['133'] = [];
  _$jscoverage['/router.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['150'] = [];
  _$jscoverage['/router.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['153'] = [];
  _$jscoverage['/router.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['154'] = [];
  _$jscoverage['/router.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['159'] = [];
  _$jscoverage['/router.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['169'] = [];
  _$jscoverage['/router.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['170'] = [];
  _$jscoverage['/router.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['180'] = [];
  _$jscoverage['/router.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['190'] = [];
  _$jscoverage['/router.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['210'] = [];
  _$jscoverage['/router.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['211'] = [];
  _$jscoverage['/router.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['224'] = [];
  _$jscoverage['/router.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['226'] = [];
  _$jscoverage['/router.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['227'] = [];
  _$jscoverage['/router.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['229'] = [];
  _$jscoverage['/router.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['251'] = [];
  _$jscoverage['/router.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['252'] = [];
  _$jscoverage['/router.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['269'] = [];
  _$jscoverage['/router.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['271'] = [];
  _$jscoverage['/router.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['272'] = [];
  _$jscoverage['/router.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['276'] = [];
  _$jscoverage['/router.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['284'] = [];
  _$jscoverage['/router.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['285'] = [];
  _$jscoverage['/router.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['291'] = [];
  _$jscoverage['/router.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['292'] = [];
  _$jscoverage['/router.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['306'] = [];
  _$jscoverage['/router.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['314'] = [];
  _$jscoverage['/router.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['318'] = [];
  _$jscoverage['/router.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['336'] = [];
  _$jscoverage['/router.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['337'] = [];
  _$jscoverage['/router.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['347'] = [];
  _$jscoverage['/router.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['350'] = [];
  _$jscoverage['/router.js'].branchData['350'][1] = new BranchData();
}
_$jscoverage['/router.js'].branchData['350'][1].init(1541, 12, 'opts.success');
function visit59_350_1(result) {
  _$jscoverage['/router.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['347'][1].init(1459, 17, 'opts.triggerRoute');
function visit58_347_1(result) {
  _$jscoverage['/router.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['337'][1].init(22, 18, '!getUrlForRouter()');
function visit57_337_1(result) {
  _$jscoverage['/router.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['336'][1].init(983, 7, 'useHash');
function visit56_336_1(result) {
  _$jscoverage['/router.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['318'][1].init(125, 58, 'state.pageDepth <= pageIdHistory[pageIdHistory.length - 1]');
function visit55_318_1(result) {
  _$jscoverage['/router.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['314'][1].init(18, 20, 'supportNativeHistory');
function visit54_314_1(result) {
  _$jscoverage['/router.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['306'][1].init(882, 42, '!utils.equalsIgnoreSlash(locPath, urlRoot)');
function visit53_306_1(result) {
  _$jscoverage['/router.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['292'][1].init(26, 41, 'utils.equalsIgnoreSlash(locPath, urlRoot)');
function visit52_292_1(result) {
  _$jscoverage['/router.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['291'][1].init(216, 11, 'hashIsValid');
function visit51_291_1(result) {
  _$jscoverage['/router.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['285'][1].init(18, 20, 'supportNativeHistory');
function visit50_285_1(result) {
  _$jscoverage['/router.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['284'][1].init(446, 8, '!useHash');
function visit49_284_1(result) {
  _$jscoverage['/router.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['276'][1].init(186, 18, 'opts.urlRoot || \'\'');
function visit48_276_1(result) {
  _$jscoverage['/router.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['272'][1].init(21, 42, 'opts.success && opts.success.call(exports)');
function visit47_272_1(result) {
  _$jscoverage['/router.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['271'][1].init(44, 7, 'started');
function visit46_271_1(result) {
  _$jscoverage['/router.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['269'][1].init(17, 10, 'opts || {}');
function visit45_269_1(result) {
  _$jscoverage['/router.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['252'][1].init(18, 28, 'routes[i].path === routePath');
function visit44_252_1(result) {
  _$jscoverage['/router.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['251'][1].init(45, 5, 'i < l');
function visit43_251_1(result) {
  _$jscoverage['/router.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['229'][1].init(75, 19, '!r.callbacks.length');
function visit42_229_1(result) {
  _$jscoverage['/router.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['227'][1].init(22, 8, 'callback');
function visit41_227_1(result) {
  _$jscoverage['/router.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['226'][1].init(50, 20, 'r.path === routePath');
function visit40_226_1(result) {
  _$jscoverage['/router.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['224'][1].init(42, 6, 'i >= 0');
function visit39_224_1(result) {
  _$jscoverage['/router.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['211'][1].init(18, 21, 'routes[i].match(path)');
function visit38_211_1(result) {
  _$jscoverage['/router.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['210'][1].init(45, 5, 'i < l');
function visit37_210_1(result) {
  _$jscoverage['/router.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['190'][1].init(1716, 25, 'opts && opts.triggerRoute');
function visit36_190_1(result) {
  _$jscoverage['/router.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['180'][1].init(26, 20, 'supportNativeHistory');
function visit35_180_1(result) {
  _$jscoverage['/router.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['170'][1].init(26, 20, 'supportNativeHistory');
function visit34_170_1(result) {
  _$jscoverage['/router.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['169'][1].init(69, 14, 'replaceHistory');
function visit33_169_1(result) {
  _$jscoverage['/router.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['159'][1].init(188, 32, '!useHash && supportNativeHistory');
function visit32_159_1(result) {
  _$jscoverage['/router.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['154'][1].init(18, 15, '!replaceHistory');
function visit31_154_1(result) {
  _$jscoverage['/router.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['153'][1].init(122, 26, 'getUrlForRouter() !== path');
function visit30_153_1(result) {
  _$jscoverage['/router.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['150'][1].init(17, 10, 'opts || {}');
function visit29_150_1(result) {
  _$jscoverage['/router.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['133'][1].init(14, 26, 'typeof prefix !== \'string\'');
function visit28_133_1(result) {
  _$jscoverage['/router.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['106'][1].init(189, 21, 'uri.toString() || \'/\'');
function visit27_106_1(result) {
  _$jscoverage['/router.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['84'][1].init(80, 30, 'callbackIndex !== callbacksLen');
function visit26_84_1(result) {
  _$jscoverage['/router.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['79'][1].init(30, 17, 'cause === \'route\'');
function visit25_79_1(result) {
  _$jscoverage['/router.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['72'][1].init(40, 13, 'index !== len');
function visit24_72_1(result) {
  _$jscoverage['/router.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['49'][1].init(76, 53, 'S.startsWith(request.path + \'/\', middleware[0] + \'/\')');
function visit23_49_1(result) {
  _$jscoverage['/router.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['45'][1].init(40, 13, 'index === len');
function visit22_45_1(result) {
  _$jscoverage['/router.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['31'][1].init(84, 32, '!useHash && supportNativeHistory');
function visit21_31_1(result) {
  _$jscoverage['/router.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['29'][1].init(16, 20, 'url || location.href');
function visit20_29_1(result) {
  _$jscoverage['/router.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['19'][1].init(486, 28, 'history && history.pushState');
function visit19_19_1(result) {
  _$jscoverage['/router.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].lineData[5]++;
KISSY.add(function(S, require, exports) {
  _$jscoverage['/router.js'].functionData[0]++;
  _$jscoverage['/router.js'].lineData[6]++;
  var middlewares = [];
  _$jscoverage['/router.js'].lineData[7]++;
  var routes = [];
  _$jscoverage['/router.js'].lineData[8]++;
  var utils = require('./router/utils');
  _$jscoverage['/router.js'].lineData[9]++;
  var Route = require('./router/route');
  _$jscoverage['/router.js'].lineData[10]++;
  var Uri = require('uri');
  _$jscoverage['/router.js'].lineData[11]++;
  var Request = require('./router/request');
  _$jscoverage['/router.js'].lineData[12]++;
  var DomEvent = require('event/dom');
  _$jscoverage['/router.js'].lineData[13]++;
  var started = false;
  _$jscoverage['/router.js'].lineData[14]++;
  var useHash;
  _$jscoverage['/router.js'].lineData[15]++;
  var urlRoot;
  _$jscoverage['/router.js'].lineData[16]++;
  var win = S.Env.host;
  _$jscoverage['/router.js'].lineData[17]++;
  var history = win.history;
  _$jscoverage['/router.js'].lineData[18]++;
  var supportNativeHashChange = S.Features.isHashChangeSupported();
  _$jscoverage['/router.js'].lineData[19]++;
  var supportNativeHistory = !!(visit19_19_1(history && history.pushState));
  _$jscoverage['/router.js'].lineData[21]++;
  var BREATH_INTERVAL = 100;
  _$jscoverage['/router.js'].lineData[24]++;
  var uuid = 0;
  _$jscoverage['/router.js'].lineData[25]++;
  var pageIdHistory = [uuid];
  _$jscoverage['/router.js'].lineData[28]++;
  function getUrlForRouter(url) {
    _$jscoverage['/router.js'].functionData[1]++;
    _$jscoverage['/router.js'].lineData[29]++;
    url = visit20_29_1(url || location.href);
    _$jscoverage['/router.js'].lineData[30]++;
    var uri = new Uri(url);
    _$jscoverage['/router.js'].lineData[31]++;
    if (visit21_31_1(!useHash && supportNativeHistory)) {
      _$jscoverage['/router.js'].lineData[32]++;
      var query = uri.query;
      _$jscoverage['/router.js'].lineData[33]++;
      return uri.getPath().substr(urlRoot.length) + (query.has() ? ('?' + query.toString()) : '');
    } else {
      _$jscoverage['/router.js'].lineData[35]++;
      return utils.getHash(uri);
    }
  }
  _$jscoverage['/router.js'].lineData[39]++;
  function fireMiddleWare(request, response, cb) {
    _$jscoverage['/router.js'].functionData[2]++;
    _$jscoverage['/router.js'].lineData[40]++;
    var index = -1;
    _$jscoverage['/router.js'].lineData[41]++;
    var len = middlewares.length;
    _$jscoverage['/router.js'].lineData[43]++;
    function next() {
      _$jscoverage['/router.js'].functionData[3]++;
      _$jscoverage['/router.js'].lineData[44]++;
      index++;
      _$jscoverage['/router.js'].lineData[45]++;
      if (visit22_45_1(index === len)) {
        _$jscoverage['/router.js'].lineData[46]++;
        cb(request, response);
      } else {
        _$jscoverage['/router.js'].lineData[48]++;
        var middleware = middlewares[index];
        _$jscoverage['/router.js'].lineData[49]++;
        if (visit23_49_1(S.startsWith(request.path + '/', middleware[0] + '/'))) {
          _$jscoverage['/router.js'].lineData[50]++;
          var prefixLen = middleware[0].length;
          _$jscoverage['/router.js'].lineData[51]++;
          request.url = request.url.slice(prefixLen);
          _$jscoverage['/router.js'].lineData[52]++;
          var path = request.path;
          _$jscoverage['/router.js'].lineData[53]++;
          request.path = request.path.slice(prefixLen);
          _$jscoverage['/router.js'].lineData[54]++;
          middleware[1](request, next);
          _$jscoverage['/router.js'].lineData[55]++;
          request.url = request.originalUrl;
          _$jscoverage['/router.js'].lineData[56]++;
          request.path = path;
        } else {
          _$jscoverage['/router.js'].lineData[58]++;
          next();
        }
      }
    }
    _$jscoverage['/router.js'].lineData[63]++;
    next();
  }
  _$jscoverage['/router.js'].lineData[66]++;
  function fireRoutes(request, response) {
    _$jscoverage['/router.js'].functionData[4]++;
    _$jscoverage['/router.js'].lineData[67]++;
    var index = -1;
    _$jscoverage['/router.js'].lineData[68]++;
    var len = routes.length;
    _$jscoverage['/router.js'].lineData[70]++;
    function next() {
      _$jscoverage['/router.js'].functionData[5]++;
      _$jscoverage['/router.js'].lineData[71]++;
      index++;
      _$jscoverage['/router.js'].lineData[72]++;
      if (visit24_72_1(index !== len)) {
        _$jscoverage['/router.js'].lineData[73]++;
        var route = routes[index];
        _$jscoverage['/router.js'].lineData[74]++;
        if ((request.params = route.match(request.path))) {
          _$jscoverage['/router.js'].lineData[75]++;
          var callbackIndex = -1;
          _$jscoverage['/router.js'].lineData[76]++;
          var callbacks = route.callbacks;
          _$jscoverage['/router.js'].lineData[77]++;
          var callbacksLen = callbacks.length;
          _$jscoverage['/router.js'].lineData[78]++;
          var nextCallback = function(cause) {
  _$jscoverage['/router.js'].functionData[6]++;
  _$jscoverage['/router.js'].lineData[79]++;
  if (visit25_79_1(cause === 'route')) {
    _$jscoverage['/router.js'].lineData[80]++;
    nextCallback = null;
    _$jscoverage['/router.js'].lineData[81]++;
    next();
  } else {
    _$jscoverage['/router.js'].lineData[83]++;
    callbackIndex++;
    _$jscoverage['/router.js'].lineData[84]++;
    if (visit26_84_1(callbackIndex !== callbacksLen)) {
      _$jscoverage['/router.js'].lineData[85]++;
      request.route = route;
      _$jscoverage['/router.js'].lineData[86]++;
      callbacks[callbackIndex](request, response, nextCallback);
    }
  }
};
          _$jscoverage['/router.js'].lineData[90]++;
          nextCallback('');
        } else {
          _$jscoverage['/router.js'].lineData[92]++;
          next();
        }
      }
    }
    _$jscoverage['/router.js'].lineData[97]++;
    next();
  }
  _$jscoverage['/router.js'].lineData[100]++;
  function dispatch(backward) {
    _$jscoverage['/router.js'].functionData[7]++;
    _$jscoverage['/router.js'].lineData[101]++;
    var url = getUrlForRouter();
    _$jscoverage['/router.js'].lineData[102]++;
    var uri = new S.Uri(url);
    _$jscoverage['/router.js'].lineData[103]++;
    var query = uri.query.get();
    _$jscoverage['/router.js'].lineData[104]++;
    uri.query.reset();
    _$jscoverage['/router.js'].lineData[106]++;
    var path = visit27_106_1(uri.toString() || '/');
    _$jscoverage['/router.js'].lineData[107]++;
    var request = new Request({
  query: query, 
  backward: backward, 
  path: path, 
  url: url, 
  originalUrl: url});
    _$jscoverage['/router.js'].lineData[114]++;
    var response = {
  redirect: exports.navigate};
    _$jscoverage['/router.js'].lineData[117]++;
    fireMiddleWare(request, response, fireRoutes);
  }
  _$jscoverage['/router.js'].lineData[132]++;
  exports.use = function(prefix, callback) {
  _$jscoverage['/router.js'].functionData[8]++;
  _$jscoverage['/router.js'].lineData[133]++;
  if (visit28_133_1(typeof prefix !== 'string')) {
    _$jscoverage['/router.js'].lineData[134]++;
    callback = prefix;
    _$jscoverage['/router.js'].lineData[135]++;
    prefix = '';
  }
  _$jscoverage['/router.js'].lineData[137]++;
  middlewares.push([prefix, callback]);
};
  _$jscoverage['/router.js'].lineData[149]++;
  exports.navigate = function(path, opts) {
  _$jscoverage['/router.js'].functionData[9]++;
  _$jscoverage['/router.js'].lineData[150]++;
  opts = visit29_150_1(opts || {});
  _$jscoverage['/router.js'].lineData[151]++;
  var replaceHistory = opts.replaceHistory, normalizedPath;
  _$jscoverage['/router.js'].lineData[153]++;
  if (visit30_153_1(getUrlForRouter() !== path)) {
    _$jscoverage['/router.js'].lineData[154]++;
    if (visit31_154_1(!replaceHistory)) {
      _$jscoverage['/router.js'].lineData[155]++;
      uuid++;
      _$jscoverage['/router.js'].lineData[156]++;
      pageIdHistory.push(uuid);
    }
    _$jscoverage['/router.js'].lineData[159]++;
    if (visit32_159_1(!useHash && supportNativeHistory)) {
      _$jscoverage['/router.js'].lineData[160]++;
      history[replaceHistory ? 'replaceState' : 'pushState']({
  pageDepth: uuid}, '', utils.getFullPath(path, urlRoot));
      _$jscoverage['/router.js'].lineData[166]++;
      dispatch();
    } else {
      _$jscoverage['/router.js'].lineData[168]++;
      normalizedPath = '#!' + path;
      _$jscoverage['/router.js'].lineData[169]++;
      if (visit33_169_1(replaceHistory)) {
        _$jscoverage['/router.js'].lineData[170]++;
        if (visit34_170_1(supportNativeHistory)) {
          _$jscoverage['/router.js'].lineData[171]++;
          history.replaceState({
  pageDepth: uuid}, '', normalizedPath);
          _$jscoverage['/router.js'].lineData[174]++;
          dispatch();
        } else {
          _$jscoverage['/router.js'].lineData[177]++;
          location.replace(normalizedPath + (supportNativeHashChange ? '' : DomEvent.REPLACE_HISTORY));
        }
      } else {
        _$jscoverage['/router.js'].lineData[180]++;
        if (visit35_180_1(supportNativeHistory)) {
          _$jscoverage['/router.js'].lineData[181]++;
          history.pushState({
  pageDepth: uuid}, '', normalizedPath);
          _$jscoverage['/router.js'].lineData[184]++;
          dispatch();
        } else {
          _$jscoverage['/router.js'].lineData[186]++;
          location.hash = normalizedPath;
        }
      }
    }
  } else {
    _$jscoverage['/router.js'].lineData[190]++;
    if (visit36_190_1(opts && opts.triggerRoute)) {
      _$jscoverage['/router.js'].lineData[191]++;
      dispatch();
    }
  }
};
  _$jscoverage['/router.js'].lineData[199]++;
  exports.get = function(routePath) {
  _$jscoverage['/router.js'].functionData[10]++;
  _$jscoverage['/router.js'].lineData[200]++;
  var callbacks = S.makeArray(arguments).slice(1);
  _$jscoverage['/router.js'].lineData[201]++;
  routes.push(new Route(routePath, callbacks));
};
  _$jscoverage['/router.js'].lineData[209]++;
  exports.matchRoute = function(path) {
  _$jscoverage['/router.js'].functionData[11]++;
  _$jscoverage['/router.js'].lineData[210]++;
  for (var i = 0, l = routes.length; visit37_210_1(i < l); i++) {
    _$jscoverage['/router.js'].lineData[211]++;
    if (visit38_211_1(routes[i].match(path))) {
      _$jscoverage['/router.js'].lineData[212]++;
      return routes[i];
    }
  }
  _$jscoverage['/router.js'].lineData[215]++;
  return false;
};
  _$jscoverage['/router.js'].lineData[223]++;
  exports.removeRoute = function(routePath, callback) {
  _$jscoverage['/router.js'].functionData[12]++;
  _$jscoverage['/router.js'].lineData[224]++;
  for (var i = routes.length - 1; visit39_224_1(i >= 0); i--) {
    _$jscoverage['/router.js'].lineData[225]++;
    var r = routes[i];
    _$jscoverage['/router.js'].lineData[226]++;
    if (visit40_226_1(r.path === routePath)) {
      _$jscoverage['/router.js'].lineData[227]++;
      if (visit41_227_1(callback)) {
        _$jscoverage['/router.js'].lineData[228]++;
        r.removeCallback(callback);
        _$jscoverage['/router.js'].lineData[229]++;
        if (visit42_229_1(!r.callbacks.length)) {
          _$jscoverage['/router.js'].lineData[230]++;
          routes.splice(i, 1);
        }
      } else {
        _$jscoverage['/router.js'].lineData[233]++;
        routes.splice(i, 1);
      }
    }
  }
};
  _$jscoverage['/router.js'].lineData[240]++;
  exports.clearRoutes = function() {
  _$jscoverage['/router.js'].functionData[13]++;
  _$jscoverage['/router.js'].lineData[241]++;
  middlewares = [];
  _$jscoverage['/router.js'].lineData[242]++;
  routes = [];
};
  _$jscoverage['/router.js'].lineData[250]++;
  exports.hasRoute = function(routePath) {
  _$jscoverage['/router.js'].functionData[14]++;
  _$jscoverage['/router.js'].lineData[251]++;
  for (var i = 0, l = routes.length; visit43_251_1(i < l); i++) {
    _$jscoverage['/router.js'].lineData[252]++;
    if (visit44_252_1(routes[i].path === routePath)) {
      _$jscoverage['/router.js'].lineData[253]++;
      return routes[i];
    }
  }
  _$jscoverage['/router.js'].lineData[256]++;
  return false;
};
  _$jscoverage['/router.js'].lineData[268]++;
  exports.start = function(opts) {
  _$jscoverage['/router.js'].functionData[15]++;
  _$jscoverage['/router.js'].lineData[269]++;
  opts = visit45_269_1(opts || {});
  _$jscoverage['/router.js'].lineData[271]++;
  if (visit46_271_1(started)) {
    _$jscoverage['/router.js'].lineData[272]++;
    return visit47_272_1(opts.success && opts.success.call(exports));
  }
  _$jscoverage['/router.js'].lineData[276]++;
  opts.urlRoot = (visit48_276_1(opts.urlRoot || '')).replace(/\/$/, '');
  _$jscoverage['/router.js'].lineData[277]++;
  useHash = opts.useHash;
  _$jscoverage['/router.js'].lineData[278]++;
  urlRoot = opts.urlRoot;
  _$jscoverage['/router.js'].lineData[280]++;
  var locPath = location.pathname, hash = getUrlForRouter(), hashIsValid = location.hash.match(/#!.+/);
  _$jscoverage['/router.js'].lineData[284]++;
  if (visit49_284_1(!useHash)) {
    _$jscoverage['/router.js'].lineData[285]++;
    if (visit50_285_1(supportNativeHistory)) {
      _$jscoverage['/router.js'].lineData[291]++;
      if (visit51_291_1(hashIsValid)) {
        _$jscoverage['/router.js'].lineData[292]++;
        if (visit52_292_1(utils.equalsIgnoreSlash(locPath, urlRoot))) {
          _$jscoverage['/router.js'].lineData[294]++;
          history.replaceState({}, '', utils.getFullPath(hash, urlRoot));
          _$jscoverage['/router.js'].lineData[295]++;
          opts.triggerRoute = 1;
        } else {
          _$jscoverage['/router.js'].lineData[297]++;
          S.error('router: location path must be same with urlRoot!');
        }
      }
    } else {
      _$jscoverage['/router.js'].lineData[306]++;
      if (visit53_306_1(!utils.equalsIgnoreSlash(locPath, urlRoot))) {
        _$jscoverage['/router.js'].lineData[307]++;
        location.replace(utils.addEndSlash(urlRoot) + '#!' + hash);
        _$jscoverage['/router.js'].lineData[308]++;
        return undefined;
      }
    }
  }
  _$jscoverage['/router.js'].lineData[313]++;
  setTimeout(function() {
  _$jscoverage['/router.js'].functionData[16]++;
  _$jscoverage['/router.js'].lineData[314]++;
  if (visit54_314_1(supportNativeHistory)) {
    _$jscoverage['/router.js'].lineData[315]++;
    DomEvent.on(win, 'popstate', function(e) {
  _$jscoverage['/router.js'].functionData[17]++;
  _$jscoverage['/router.js'].lineData[316]++;
  var state = e.originalEvent.state;
  _$jscoverage['/router.js'].lineData[317]++;
  var backward = false;
  _$jscoverage['/router.js'].lineData[318]++;
  if (visit55_318_1(state.pageDepth <= pageIdHistory[pageIdHistory.length - 1])) {
    _$jscoverage['/router.js'].lineData[319]++;
    backward = true;
    _$jscoverage['/router.js'].lineData[320]++;
    pageIdHistory.pop();
  } else {
    _$jscoverage['/router.js'].lineData[323]++;
    pageIdHistory.push(state.pageDepth);
  }
  _$jscoverage['/router.js'].lineData[327]++;
  dispatch(backward);
});
  } else {
    _$jscoverage['/router.js'].lineData[332]++;
    DomEvent.on(win, 'hashchange', dispatch);
    _$jscoverage['/router.js'].lineData[334]++;
    opts.triggerRoute = 1;
  }
  _$jscoverage['/router.js'].lineData[336]++;
  if (visit56_336_1(useHash)) {
    _$jscoverage['/router.js'].lineData[337]++;
    if (visit57_337_1(!getUrlForRouter())) {
      _$jscoverage['/router.js'].lineData[338]++;
      exports.navigate('/', {
  replaceHistory: 1});
      _$jscoverage['/router.js'].lineData[341]++;
      opts.triggerRoute = 0;
    }
  }
  _$jscoverage['/router.js'].lineData[347]++;
  if (visit58_347_1(opts.triggerRoute)) {
    _$jscoverage['/router.js'].lineData[348]++;
    dispatch();
  }
  _$jscoverage['/router.js'].lineData[350]++;
  if (visit59_350_1(opts.success)) {
    _$jscoverage['/router.js'].lineData[351]++;
    opts.success();
  }
}, BREATH_INTERVAL);
  _$jscoverage['/router.js'].lineData[355]++;
  started = true;
  _$jscoverage['/router.js'].lineData[356]++;
  return exports;
};
  _$jscoverage['/router.js'].lineData[360]++;
  exports.stop = function() {
  _$jscoverage['/router.js'].functionData[18]++;
  _$jscoverage['/router.js'].lineData[361]++;
  started = false;
  _$jscoverage['/router.js'].lineData[362]++;
  DomEvent.detach(win, 'popstate hashchange', dispatch);
};
});
