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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[8] = 0;
  _$jscoverage['/base.js'].lineData[9] = 0;
  _$jscoverage['/base.js'].lineData[10] = 0;
  _$jscoverage['/base.js'].lineData[12] = 0;
  _$jscoverage['/base.js'].lineData[15] = 0;
  _$jscoverage['/base.js'].lineData[16] = 0;
  _$jscoverage['/base.js'].lineData[20] = 0;
  _$jscoverage['/base.js'].lineData[21] = 0;
  _$jscoverage['/base.js'].lineData[23] = 0;
  _$jscoverage['/base.js'].lineData[24] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[33] = 0;
  _$jscoverage['/base.js'].lineData[34] = 0;
  _$jscoverage['/base.js'].lineData[42] = 0;
  _$jscoverage['/base.js'].lineData[45] = 0;
  _$jscoverage['/base.js'].lineData[49] = 0;
  _$jscoverage['/base.js'].lineData[51] = 0;
  _$jscoverage['/base.js'].lineData[55] = 0;
  _$jscoverage['/base.js'].lineData[58] = 0;
  _$jscoverage['/base.js'].lineData[59] = 0;
  _$jscoverage['/base.js'].lineData[60] = 0;
  _$jscoverage['/base.js'].lineData[61] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[66] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[69] = 0;
  _$jscoverage['/base.js'].lineData[72] = 0;
  _$jscoverage['/base.js'].lineData[77] = 0;
  _$jscoverage['/base.js'].lineData[80] = 0;
  _$jscoverage['/base.js'].lineData[85] = 0;
  _$jscoverage['/base.js'].lineData[87] = 0;
  _$jscoverage['/base.js'].lineData[91] = 0;
  _$jscoverage['/base.js'].lineData[92] = 0;
  _$jscoverage['/base.js'].lineData[93] = 0;
  _$jscoverage['/base.js'].lineData[98] = 0;
  _$jscoverage['/base.js'].lineData[99] = 0;
  _$jscoverage['/base.js'].lineData[102] = 0;
  _$jscoverage['/base.js'].lineData[103] = 0;
  _$jscoverage['/base.js'].lineData[110] = 0;
  _$jscoverage['/base.js'].lineData[111] = 0;
  _$jscoverage['/base.js'].lineData[112] = 0;
  _$jscoverage['/base.js'].lineData[117] = 0;
  _$jscoverage['/base.js'].lineData[122] = 0;
  _$jscoverage['/base.js'].lineData[131] = 0;
  _$jscoverage['/base.js'].lineData[133] = 0;
  _$jscoverage['/base.js'].lineData[137] = 0;
  _$jscoverage['/base.js'].lineData[142] = 0;
  _$jscoverage['/base.js'].lineData[146] = 0;
  _$jscoverage['/base.js'].lineData[155] = 0;
  _$jscoverage['/base.js'].lineData[158] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[177] = 0;
  _$jscoverage['/base.js'].lineData[181] = 0;
  _$jscoverage['/base.js'].lineData[183] = 0;
  _$jscoverage['/base.js'].lineData[187] = 0;
  _$jscoverage['/base.js'].lineData[188] = 0;
  _$jscoverage['/base.js'].lineData[189] = 0;
  _$jscoverage['/base.js'].lineData[190] = 0;
  _$jscoverage['/base.js'].lineData[193] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[197] = 0;
  _$jscoverage['/base.js'].lineData[198] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[200] = 0;
  _$jscoverage['/base.js'].lineData[201] = 0;
  _$jscoverage['/base.js'].lineData[202] = 0;
  _$jscoverage['/base.js'].lineData[203] = 0;
  _$jscoverage['/base.js'].lineData[204] = 0;
  _$jscoverage['/base.js'].lineData[205] = 0;
  _$jscoverage['/base.js'].lineData[206] = 0;
  _$jscoverage['/base.js'].lineData[209] = 0;
  _$jscoverage['/base.js'].lineData[210] = 0;
  _$jscoverage['/base.js'].lineData[211] = 0;
  _$jscoverage['/base.js'].lineData[212] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[217] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[224] = 0;
  _$jscoverage['/base.js'].lineData[225] = 0;
  _$jscoverage['/base.js'].lineData[226] = 0;
  _$jscoverage['/base.js'].lineData[228] = 0;
  _$jscoverage['/base.js'].lineData[229] = 0;
  _$jscoverage['/base.js'].lineData[230] = 0;
  _$jscoverage['/base.js'].lineData[231] = 0;
  _$jscoverage['/base.js'].lineData[235] = 0;
  _$jscoverage['/base.js'].lineData[239] = 0;
  _$jscoverage['/base.js'].lineData[240] = 0;
  _$jscoverage['/base.js'].lineData[242] = 0;
  _$jscoverage['/base.js'].lineData[251] = 0;
  _$jscoverage['/base.js'].lineData[252] = 0;
  _$jscoverage['/base.js'].lineData[253] = 0;
  _$jscoverage['/base.js'].lineData[254] = 0;
  _$jscoverage['/base.js'].lineData[255] = 0;
  _$jscoverage['/base.js'].lineData[256] = 0;
  _$jscoverage['/base.js'].lineData[257] = 0;
  _$jscoverage['/base.js'].lineData[261] = 0;
  _$jscoverage['/base.js'].lineData[262] = 0;
  _$jscoverage['/base.js'].lineData[263] = 0;
  _$jscoverage['/base.js'].lineData[264] = 0;
  _$jscoverage['/base.js'].lineData[265] = 0;
  _$jscoverage['/base.js'].lineData[266] = 0;
  _$jscoverage['/base.js'].lineData[267] = 0;
  _$jscoverage['/base.js'].lineData[273] = 0;
  _$jscoverage['/base.js'].lineData[274] = 0;
  _$jscoverage['/base.js'].lineData[275] = 0;
  _$jscoverage['/base.js'].lineData[276] = 0;
  _$jscoverage['/base.js'].lineData[278] = 0;
  _$jscoverage['/base.js'].lineData[280] = 0;
  _$jscoverage['/base.js'].lineData[287] = 0;
  _$jscoverage['/base.js'].lineData[291] = 0;
  _$jscoverage['/base.js'].lineData[292] = 0;
  _$jscoverage['/base.js'].lineData[293] = 0;
  _$jscoverage['/base.js'].lineData[294] = 0;
  _$jscoverage['/base.js'].lineData[295] = 0;
  _$jscoverage['/base.js'].lineData[297] = 0;
  _$jscoverage['/base.js'].lineData[298] = 0;
  _$jscoverage['/base.js'].lineData[299] = 0;
  _$jscoverage['/base.js'].lineData[300] = 0;
  _$jscoverage['/base.js'].lineData[301] = 0;
  _$jscoverage['/base.js'].lineData[305] = 0;
  _$jscoverage['/base.js'].lineData[306] = 0;
  _$jscoverage['/base.js'].lineData[307] = 0;
  _$jscoverage['/base.js'].lineData[308] = 0;
  _$jscoverage['/base.js'].lineData[312] = 0;
  _$jscoverage['/base.js'].lineData[316] = 0;
  _$jscoverage['/base.js'].lineData[318] = 0;
  _$jscoverage['/base.js'].lineData[319] = 0;
  _$jscoverage['/base.js'].lineData[320] = 0;
  _$jscoverage['/base.js'].lineData[325] = 0;
  _$jscoverage['/base.js'].lineData[326] = 0;
  _$jscoverage['/base.js'].lineData[327] = 0;
  _$jscoverage['/base.js'].lineData[328] = 0;
  _$jscoverage['/base.js'].lineData[329] = 0;
  _$jscoverage['/base.js'].lineData[331] = 0;
  _$jscoverage['/base.js'].lineData[332] = 0;
  _$jscoverage['/base.js'].lineData[334] = 0;
  _$jscoverage['/base.js'].lineData[338] = 0;
  _$jscoverage['/base.js'].lineData[341] = 0;
  _$jscoverage['/base.js'].lineData[342] = 0;
  _$jscoverage['/base.js'].lineData[344] = 0;
  _$jscoverage['/base.js'].lineData[345] = 0;
  _$jscoverage['/base.js'].lineData[346] = 0;
  _$jscoverage['/base.js'].lineData[348] = 0;
  _$jscoverage['/base.js'].lineData[349] = 0;
  _$jscoverage['/base.js'].lineData[350] = 0;
  _$jscoverage['/base.js'].lineData[352] = 0;
  _$jscoverage['/base.js'].lineData[353] = 0;
  _$jscoverage['/base.js'].lineData[354] = 0;
  _$jscoverage['/base.js'].lineData[355] = 0;
  _$jscoverage['/base.js'].lineData[356] = 0;
  _$jscoverage['/base.js'].lineData[357] = 0;
  _$jscoverage['/base.js'].lineData[358] = 0;
  _$jscoverage['/base.js'].lineData[360] = 0;
  _$jscoverage['/base.js'].lineData[361] = 0;
  _$jscoverage['/base.js'].lineData[363] = 0;
  _$jscoverage['/base.js'].lineData[364] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
  _$jscoverage['/base.js'].functionData[17] = 0;
  _$jscoverage['/base.js'].functionData[18] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['20'] = [];
  _$jscoverage['/base.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['23'] = [];
  _$jscoverage['/base.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['49'] = [];
  _$jscoverage['/base.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['49'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['51'] = [];
  _$jscoverage['/base.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['51'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['52'] = [];
  _$jscoverage['/base.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['52'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['53'] = [];
  _$jscoverage['/base.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['53'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['54'] = [];
  _$jscoverage['/base.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['65'] = [];
  _$jscoverage['/base.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['68'] = [];
  _$jscoverage['/base.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['91'] = [];
  _$jscoverage['/base.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['93'] = [];
  _$jscoverage['/base.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['102'] = [];
  _$jscoverage['/base.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['102'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['102'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['110'] = [];
  _$jscoverage['/base.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['177'] = [];
  _$jscoverage['/base.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['177'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['178'] = [];
  _$jscoverage['/base.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['178'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['179'] = [];
  _$jscoverage['/base.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['179'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['189'] = [];
  _$jscoverage['/base.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['193'] = [];
  _$jscoverage['/base.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['198'] = [];
  _$jscoverage['/base.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['201'] = [];
  _$jscoverage['/base.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['204'] = [];
  _$jscoverage['/base.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['209'] = [];
  _$jscoverage['/base.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['212'] = [];
  _$jscoverage['/base.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['215'] = [];
  _$jscoverage['/base.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['225'] = [];
  _$jscoverage['/base.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['239'] = [];
  _$jscoverage['/base.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['251'] = [];
  _$jscoverage['/base.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['255'] = [];
  _$jscoverage['/base.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['255'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['255'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['255'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['255'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['255'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['255'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['255'][8] = new BranchData();
  _$jscoverage['/base.js'].branchData['261'] = [];
  _$jscoverage['/base.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['265'] = [];
  _$jscoverage['/base.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['265'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['265'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['265'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['265'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['265'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['265'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['265'][8] = new BranchData();
  _$jscoverage['/base.js'].branchData['274'] = [];
  _$jscoverage['/base.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['297'] = [];
  _$jscoverage['/base.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['298'] = [];
  _$jscoverage['/base.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['300'] = [];
  _$jscoverage['/base.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['305'] = [];
  _$jscoverage['/base.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['307'] = [];
  _$jscoverage['/base.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['318'] = [];
  _$jscoverage['/base.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['328'] = [];
  _$jscoverage['/base.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['331'] = [];
  _$jscoverage['/base.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['341'] = [];
  _$jscoverage['/base.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['344'] = [];
  _$jscoverage['/base.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['348'] = [];
  _$jscoverage['/base.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['360'] = [];
  _$jscoverage['/base.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['363'] = [];
  _$jscoverage['/base.js'].branchData['363'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['363'][1].init(135, 17, 'top !== undefined');
function visit68_363_1(result) {
  _$jscoverage['/base.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['360'][1].init(22, 18, 'left !== undefined');
function visit67_360_1(result) {
  _$jscoverage['/base.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['348'][1].init(252, 17, 'top !== undefined');
function visit66_348_1(result) {
  _$jscoverage['/base.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['344'][1].init(84, 18, 'left !== undefined');
function visit65_344_1(result) {
  _$jscoverage['/base.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['341'][1].init(114, 7, 'animCfg');
function visit64_341_1(result) {
  _$jscoverage['/base.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['331'][1].init(272, 7, 'cfg.top');
function visit63_331_1(result) {
  _$jscoverage['/base.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['328'][1].init(138, 8, 'cfg.left');
function visit62_328_1(result) {
  _$jscoverage['/base.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['318'][1].init(78, 51, '(pageOffset = self.pagesOffset) && pageOffset[index]');
function visit61_318_1(result) {
  _$jscoverage['/base.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['307'][1].init(72, 15, 'offset[p2] <= v');
function visit60_307_1(result) {
  _$jscoverage['/base.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['305'][1].init(51, 6, 'i >= 0');
function visit59_305_1(result) {
  _$jscoverage['/base.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['300'][1].init(72, 15, 'offset[p2] >= v');
function visit58_300_1(result) {
  _$jscoverage['/base.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['298'][1].init(30, 22, 'i < pagesOffset.length');
function visit57_298_1(result) {
  _$jscoverage['/base.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['297'][1].init(261, 13, 'direction > 0');
function visit56_297_1(result) {
  _$jscoverage['/base.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['274'][1].init(48, 23, 'self.scrollAnims.length');
function visit55_274_1(result) {
  _$jscoverage['/base.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['265'][8].init(216, 10, 'deltaX < 0');
function visit54_265_8(result) {
  _$jscoverage['/base.js'].branchData['265'][8].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['265'][7].init(195, 17, 'scrollLeft >= max');
function visit53_265_7(result) {
  _$jscoverage['/base.js'].branchData['265'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['265'][6].init(195, 31, 'scrollLeft >= max && deltaX < 0');
function visit52_265_6(result) {
  _$jscoverage['/base.js'].branchData['265'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['265'][5].init(181, 10, 'deltaX > 0');
function visit51_265_5(result) {
  _$jscoverage['/base.js'].branchData['265'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['265'][4].init(160, 17, 'scrollLeft <= min');
function visit50_265_4(result) {
  _$jscoverage['/base.js'].branchData['265'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['265'][3].init(160, 31, 'scrollLeft <= min && deltaX > 0');
function visit49_265_3(result) {
  _$jscoverage['/base.js'].branchData['265'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['265'][2].init(160, 66, 'scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0');
function visit48_265_2(result) {
  _$jscoverage['/base.js'].branchData['265'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['265'][1].init(158, 69, '!(scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0)');
function visit47_265_1(result) {
  _$jscoverage['/base.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['261'][1].init(825, 43, '(deltaX = e.deltaX) && self.allowScroll.left');
function visit46_261_1(result) {
  _$jscoverage['/base.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['255'][8].init(210, 10, 'deltaY < 0');
function visit45_255_8(result) {
  _$jscoverage['/base.js'].branchData['255'][8].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['255'][7].init(190, 16, 'scrollTop >= max');
function visit44_255_7(result) {
  _$jscoverage['/base.js'].branchData['255'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['255'][6].init(190, 30, 'scrollTop >= max && deltaY < 0');
function visit43_255_6(result) {
  _$jscoverage['/base.js'].branchData['255'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['255'][5].init(176, 10, 'deltaY > 0');
function visit42_255_5(result) {
  _$jscoverage['/base.js'].branchData['255'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['255'][4].init(156, 16, 'scrollTop <= min');
function visit41_255_4(result) {
  _$jscoverage['/base.js'].branchData['255'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['255'][3].init(156, 30, 'scrollTop <= min && deltaY > 0');
function visit40_255_3(result) {
  _$jscoverage['/base.js'].branchData['255'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['255'][2].init(156, 64, 'scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0');
function visit39_255_2(result) {
  _$jscoverage['/base.js'].branchData['255'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['255'][1].init(154, 67, '!(scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0)');
function visit38_255_1(result) {
  _$jscoverage['/base.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['251'][1].init(368, 42, '(deltaY = e.deltaY) && self.allowScroll.top');
function visit37_251_1(result) {
  _$jscoverage['/base.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['239'][1].init(18, 20, 'this.get(\'disabled\')');
function visit36_239_1(result) {
  _$jscoverage['/base.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['225'][1].init(51, 18, 'control.scrollStep');
function visit35_225_1(result) {
  _$jscoverage['/base.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['215'][1].init(302, 24, 'keyCode === KeyCode.LEFT');
function visit34_215_1(result) {
  _$jscoverage['/base.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['212'][1].init(132, 25, 'keyCode === KeyCode.RIGHT');
function visit33_212_1(result) {
  _$jscoverage['/base.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['209'][1].init(1656, 6, 'allowX');
function visit32_209_1(result) {
  _$jscoverage['/base.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['204'][1].init(737, 27, 'keyCode === KeyCode.PAGE_UP');
function visit31_204_1(result) {
  _$jscoverage['/base.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['201'][1].init(564, 29, 'keyCode === KeyCode.PAGE_DOWN');
function visit30_201_1(result) {
  _$jscoverage['/base.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['198'][1].init(399, 22, 'keyCode === KeyCode.UP');
function visit29_198_1(result) {
  _$jscoverage['/base.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['193'][1].init(184, 24, 'keyCode === KeyCode.DOWN');
function visit28_193_1(result) {
  _$jscoverage['/base.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['189'][1].init(720, 6, 'allowY');
function visit27_189_1(result) {
  _$jscoverage['/base.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['179'][2].init(338, 21, 'nodeName === \'select\'');
function visit26_179_2(result) {
  _$jscoverage['/base.js'].branchData['179'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['179'][1].init(43, 76, 'nodeName === \'select\' || $target.hasAttr(\'contenteditable\')');
function visit25_179_1(result) {
  _$jscoverage['/base.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['178'][2].init(293, 23, 'nodeName === \'textarea\'');
function visit24_178_2(result) {
  _$jscoverage['/base.js'].branchData['178'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['178'][1].init(40, 120, 'nodeName === \'textarea\' || nodeName === \'select\' || $target.hasAttr(\'contenteditable\')');
function visit23_178_1(result) {
  _$jscoverage['/base.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['177'][2].init(250, 20, 'nodeName === \'input\'');
function visit22_177_2(result) {
  _$jscoverage['/base.js'].branchData['177'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['177'][1].init(250, 161, 'nodeName === \'input\' || nodeName === \'textarea\' || nodeName === \'select\' || $target.hasAttr(\'contenteditable\')');
function visit21_177_1(result) {
  _$jscoverage['/base.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['110'][1].init(805, 9, 'pageIndex');
function visit20_110_1(result) {
  _$jscoverage['/base.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['102'][3].init(200, 19, 'top <= maxScrollTop');
function visit19_102_3(result) {
  _$jscoverage['/base.js'].branchData['102'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['102'][2].init(175, 21, 'left <= maxScrollLeft');
function visit18_102_2(result) {
  _$jscoverage['/base.js'].branchData['102'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['102'][1].init(175, 44, 'left <= maxScrollLeft && top <= maxScrollTop');
function visit17_102_1(result) {
  _$jscoverage['/base.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['93'][1].init(91, 24, 'typeof snap === \'string\'');
function visit16_93_1(result) {
  _$jscoverage['/base.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['91'][1].init(1766, 4, 'snap');
function visit15_91_1(result) {
  _$jscoverage['/base.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['68'][1].init(1179, 25, 'scrollWidth > clientWidth');
function visit14_68_1(result) {
  _$jscoverage['/base.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['65'][1].init(1090, 27, 'scrollHeight > clientHeight');
function visit13_65_1(result) {
  _$jscoverage['/base.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['54'][1].init(53, 35, 'clientWidth === prevVal.clientWidth');
function visit12_54_1(result) {
  _$jscoverage['/base.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['53'][2].init(720, 37, 'clientHeight === prevVal.clientHeight');
function visit11_53_2(result) {
  _$jscoverage['/base.js'].branchData['53'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['53'][1].init(51, 89, 'clientHeight === prevVal.clientHeight && clientWidth === prevVal.clientWidth');
function visit10_53_1(result) {
  _$jscoverage['/base.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['52'][2].init(667, 35, 'prevVal.scrollWidth === scrollWidth');
function visit9_52_2(result) {
  _$jscoverage['/base.js'].branchData['52'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['52'][1].init(53, 141, 'prevVal.scrollWidth === scrollWidth && clientHeight === prevVal.clientHeight && clientWidth === prevVal.clientWidth');
function visit8_52_1(result) {
  _$jscoverage['/base.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['51'][2].init(611, 37, 'prevVal.scrollHeight === scrollHeight');
function visit7_51_2(result) {
  _$jscoverage['/base.js'].branchData['51'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['51'][1].init(611, 195, 'prevVal.scrollHeight === scrollHeight && prevVal.scrollWidth === scrollWidth && clientHeight === prevVal.clientHeight && clientWidth === prevVal.clientWidth');
function visit6_51_1(result) {
  _$jscoverage['/base.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['49'][2].init(574, 14, 'e && e.prevVal');
function visit5_49_2(result) {
  _$jscoverage['/base.js'].branchData['49'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['49'][1].init(574, 20, 'e && e.prevVal || {}');
function visit4_49_1(result) {
  _$jscoverage['/base.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['23'][1].init(255, 10, 'scrollLeft');
function visit3_23_1(result) {
  _$jscoverage['/base.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['20'][1].init(147, 9, 'scrollTop');
function visit2_20_1(result) {
  _$jscoverage['/base.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/base.js'].lineData[8]++;
  var Anim = require('anim');
  _$jscoverage['/base.js'].lineData[9]++;
  var Container = require('component/container');
  _$jscoverage['/base.js'].lineData[10]++;
  var Render = require('./base/render');
  _$jscoverage['/base.js'].lineData[12]++;
  var $ = S.all, KeyCode = Node.KeyCode;
  _$jscoverage['/base.js'].lineData[15]++;
  function onElScroll() {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[16]++;
    var self = this, el = self.el, scrollTop = el.scrollTop, scrollLeft = el.scrollLeft;
    _$jscoverage['/base.js'].lineData[20]++;
    if (visit2_20_1(scrollTop)) {
      _$jscoverage['/base.js'].lineData[21]++;
      self.set('scrollTop', scrollTop + self.get('scrollTop'));
    }
    _$jscoverage['/base.js'].lineData[23]++;
    if (visit3_23_1(scrollLeft)) {
      _$jscoverage['/base.js'].lineData[24]++;
      self.set('scrollLeft', scrollLeft + self.get('scrollLeft'));
    }
    _$jscoverage['/base.js'].lineData[26]++;
    el.scrollTop = el.scrollLeft = 0;
  }
  _$jscoverage['/base.js'].lineData[29]++;
  function frame(anim, fx) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[30]++;
    anim.scrollView.set(fx.prop, fx.val);
  }
  _$jscoverage['/base.js'].lineData[33]++;
  function reflow(v, e) {
    _$jscoverage['/base.js'].functionData[3]++;
    _$jscoverage['/base.js'].lineData[34]++;
    var control = this, $contentEl = control.$contentEl;
    _$jscoverage['/base.js'].lineData[42]++;
    var scrollHeight = v.scrollHeight, scrollWidth = v.scrollWidth;
    _$jscoverage['/base.js'].lineData[45]++;
    var clientHeight = v.clientHeight, allowScroll, clientWidth = v.clientWidth;
    _$jscoverage['/base.js'].lineData[49]++;
    var prevVal = visit4_49_1(visit5_49_2(e && e.prevVal) || {});
    _$jscoverage['/base.js'].lineData[51]++;
    if (visit6_51_1(visit7_51_2(prevVal.scrollHeight === scrollHeight) && visit8_52_1(visit9_52_2(prevVal.scrollWidth === scrollWidth) && visit10_53_1(visit11_53_2(clientHeight === prevVal.clientHeight) && visit12_54_1(clientWidth === prevVal.clientWidth))))) {
      _$jscoverage['/base.js'].lineData[55]++;
      return;
    }
    _$jscoverage['/base.js'].lineData[58]++;
    control.scrollHeight = scrollHeight;
    _$jscoverage['/base.js'].lineData[59]++;
    control.scrollWidth = scrollWidth;
    _$jscoverage['/base.js'].lineData[60]++;
    control.clientHeight = clientHeight;
    _$jscoverage['/base.js'].lineData[61]++;
    control.clientWidth = clientWidth;
    _$jscoverage['/base.js'].lineData[63]++;
    allowScroll = control.allowScroll = {};
    _$jscoverage['/base.js'].lineData[65]++;
    if (visit13_65_1(scrollHeight > clientHeight)) {
      _$jscoverage['/base.js'].lineData[66]++;
      allowScroll.top = 1;
    }
    _$jscoverage['/base.js'].lineData[68]++;
    if (visit14_68_1(scrollWidth > clientWidth)) {
      _$jscoverage['/base.js'].lineData[69]++;
      allowScroll.left = 1;
    }
    _$jscoverage['/base.js'].lineData[72]++;
    control.minScroll = {
  left: 0, 
  top: 0};
    _$jscoverage['/base.js'].lineData[77]++;
    var maxScrollLeft, maxScrollTop;
    _$jscoverage['/base.js'].lineData[80]++;
    control.maxScroll = {
  left: maxScrollLeft = scrollWidth - clientWidth, 
  top: maxScrollTop = scrollHeight - clientHeight};
    _$jscoverage['/base.js'].lineData[85]++;
    delete control.scrollStep;
    _$jscoverage['/base.js'].lineData[87]++;
    var snap = control.get('snap'), scrollLeft = control.get('scrollLeft'), scrollTop = control.get('scrollTop');
    _$jscoverage['/base.js'].lineData[91]++;
    if (visit15_91_1(snap)) {
      _$jscoverage['/base.js'].lineData[92]++;
      var elOffset = $contentEl.offset();
      _$jscoverage['/base.js'].lineData[93]++;
      var pages = control.pages = visit16_93_1(typeof snap === 'string') ? $contentEl.all(snap) : $contentEl.children(), pageIndex = control.get('pageIndex'), pagesOffset = control.pagesOffset = [];
      _$jscoverage['/base.js'].lineData[98]++;
      pages.each(function(p, i) {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[99]++;
  var offset = p.offset(), left = offset.left - elOffset.left, top = offset.top - elOffset.top;
  _$jscoverage['/base.js'].lineData[102]++;
  if (visit17_102_1(visit18_102_2(left <= maxScrollLeft) && visit19_102_3(top <= maxScrollTop))) {
    _$jscoverage['/base.js'].lineData[103]++;
    pagesOffset[i] = {
  left: left, 
  top: top, 
  index: i};
  }
});
      _$jscoverage['/base.js'].lineData[110]++;
      if (visit20_110_1(pageIndex)) {
        _$jscoverage['/base.js'].lineData[111]++;
        control.scrollToPage(pageIndex);
        _$jscoverage['/base.js'].lineData[112]++;
        return;
      }
    }
    _$jscoverage['/base.js'].lineData[117]++;
    control.scrollToWithBounds({
  left: scrollLeft, 
  top: scrollTop});
    _$jscoverage['/base.js'].lineData[122]++;
    control.fire('reflow', v);
  }
  _$jscoverage['/base.js'].lineData[131]++;
  return Container.extend({
  initializer: function() {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[133]++;
  this.scrollAnims = [];
}, 
  bindUI: function() {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[137]++;
  var self = this, $el = self.$el;
  _$jscoverage['/base.js'].lineData[142]++;
  $el.on('mousewheel', self.handleMouseWheel, self).on('scroll', onElScroll, self);
}, 
  sync: function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[146]++;
  var control = this, el = control.el, contentEl = control.contentEl;
  _$jscoverage['/base.js'].lineData[155]++;
  var scrollHeight = Math.max(contentEl.offsetHeight, contentEl.scrollHeight), scrollWidth = Math.max(contentEl.offsetWidth, contentEl.scrollWidth);
  _$jscoverage['/base.js'].lineData[158]++;
  var clientHeight = el.clientHeight, clientWidth = el.clientWidth;
  _$jscoverage['/base.js'].lineData[161]++;
  control.set('dimension', {
  'scrollHeight': scrollHeight, 
  'scrollWidth': scrollWidth, 
  'clientWidth': clientWidth, 
  'clientHeight': clientHeight});
}, 
  _onSetDimension: reflow, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[173]++;
  var target = e.target, $target = $(target), nodeName = $target.nodeName();
  _$jscoverage['/base.js'].lineData[177]++;
  if (visit21_177_1(visit22_177_2(nodeName === 'input') || visit23_178_1(visit24_178_2(nodeName === 'textarea') || visit25_179_1(visit26_179_2(nodeName === 'select') || $target.hasAttr('contenteditable'))))) {
    _$jscoverage['/base.js'].lineData[181]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[183]++;
  var self = this, keyCode = e.keyCode, scrollStep = self.getScrollStep(), ok;
  _$jscoverage['/base.js'].lineData[187]++;
  var allowX = self.allowScroll.left;
  _$jscoverage['/base.js'].lineData[188]++;
  var allowY = self.allowScroll.top;
  _$jscoverage['/base.js'].lineData[189]++;
  if (visit27_189_1(allowY)) {
    _$jscoverage['/base.js'].lineData[190]++;
    var scrollStepY = scrollStep.top, clientHeight = self.clientHeight, scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[193]++;
    if (visit28_193_1(keyCode === KeyCode.DOWN)) {
      _$jscoverage['/base.js'].lineData[194]++;
      self.scrollToWithBounds({
  top: scrollTop + scrollStepY});
      _$jscoverage['/base.js'].lineData[197]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[198]++;
      if (visit29_198_1(keyCode === KeyCode.UP)) {
        _$jscoverage['/base.js'].lineData[199]++;
        self.scrollToWithBounds({
  top: scrollTop - scrollStepY});
        _$jscoverage['/base.js'].lineData[200]++;
        ok = true;
      } else {
        _$jscoverage['/base.js'].lineData[201]++;
        if (visit30_201_1(keyCode === KeyCode.PAGE_DOWN)) {
          _$jscoverage['/base.js'].lineData[202]++;
          self.scrollToWithBounds({
  top: scrollTop + clientHeight});
          _$jscoverage['/base.js'].lineData[203]++;
          ok = true;
        } else {
          _$jscoverage['/base.js'].lineData[204]++;
          if (visit31_204_1(keyCode === KeyCode.PAGE_UP)) {
            _$jscoverage['/base.js'].lineData[205]++;
            self.scrollToWithBounds({
  top: scrollTop - clientHeight});
            _$jscoverage['/base.js'].lineData[206]++;
            ok = true;
          }
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[209]++;
  if (visit32_209_1(allowX)) {
    _$jscoverage['/base.js'].lineData[210]++;
    var scrollStepX = scrollStep.left;
    _$jscoverage['/base.js'].lineData[211]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[212]++;
    if (visit33_212_1(keyCode === KeyCode.RIGHT)) {
      _$jscoverage['/base.js'].lineData[213]++;
      self.scrollToWithBounds({
  left: scrollLeft + scrollStepX});
      _$jscoverage['/base.js'].lineData[214]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[215]++;
      if (visit34_215_1(keyCode === KeyCode.LEFT)) {
        _$jscoverage['/base.js'].lineData[216]++;
        self.scrollToWithBounds({
  left: scrollLeft - scrollStepX});
        _$jscoverage['/base.js'].lineData[217]++;
        ok = true;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[220]++;
  return ok;
}, 
  getScrollStep: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[224]++;
  var control = this;
  _$jscoverage['/base.js'].lineData[225]++;
  if (visit35_225_1(control.scrollStep)) {
    _$jscoverage['/base.js'].lineData[226]++;
    return control.scrollStep;
  }
  _$jscoverage['/base.js'].lineData[228]++;
  var elDoc = $(this.get('el')[0].ownerDocument);
  _$jscoverage['/base.js'].lineData[229]++;
  var clientHeight = control.clientHeight;
  _$jscoverage['/base.js'].lineData[230]++;
  var clientWidth = control.clientWidth;
  _$jscoverage['/base.js'].lineData[231]++;
  control.scrollStep = {
  top: Math.max(clientHeight * clientHeight * 0.7 / elDoc.height(), 20), 
  left: Math.max(clientWidth * clientWidth * 0.7 / elDoc.width(), 20)};
  _$jscoverage['/base.js'].lineData[235]++;
  return control.scrollStep;
}, 
  handleMouseWheel: function(e) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[239]++;
  if (visit36_239_1(this.get('disabled'))) {
    _$jscoverage['/base.js'].lineData[240]++;
    return;
  }
  _$jscoverage['/base.js'].lineData[242]++;
  var max, min, self = this, scrollStep = self.getScrollStep(), deltaY, deltaX, maxScroll = self.maxScroll, minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[251]++;
  if (visit37_251_1((deltaY = e.deltaY) && self.allowScroll.top)) {
    _$jscoverage['/base.js'].lineData[252]++;
    var scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[253]++;
    max = maxScroll.top;
    _$jscoverage['/base.js'].lineData[254]++;
    min = minScroll.top;
    _$jscoverage['/base.js'].lineData[255]++;
    if (visit38_255_1(!(visit39_255_2(visit40_255_3(visit41_255_4(scrollTop <= min) && visit42_255_5(deltaY > 0)) || visit43_255_6(visit44_255_7(scrollTop >= max) && visit45_255_8(deltaY < 0)))))) {
      _$jscoverage['/base.js'].lineData[256]++;
      self.scrollToWithBounds({
  top: scrollTop - e.deltaY * scrollStep.top});
      _$jscoverage['/base.js'].lineData[257]++;
      e.preventDefault();
    }
  }
  _$jscoverage['/base.js'].lineData[261]++;
  if (visit46_261_1((deltaX = e.deltaX) && self.allowScroll.left)) {
    _$jscoverage['/base.js'].lineData[262]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[263]++;
    max = maxScroll.left;
    _$jscoverage['/base.js'].lineData[264]++;
    min = minScroll.left;
    _$jscoverage['/base.js'].lineData[265]++;
    if (visit47_265_1(!(visit48_265_2(visit49_265_3(visit50_265_4(scrollLeft <= min) && visit51_265_5(deltaX > 0)) || visit52_265_6(visit53_265_7(scrollLeft >= max) && visit54_265_8(deltaX < 0)))))) {
      _$jscoverage['/base.js'].lineData[266]++;
      self.scrollToWithBounds({
  left: scrollLeft - e.deltaX * scrollStep.left});
      _$jscoverage['/base.js'].lineData[267]++;
      e.preventDefault();
    }
  }
}, 
  stopAnimation: function() {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[273]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[274]++;
  if (visit55_274_1(self.scrollAnims.length)) {
    _$jscoverage['/base.js'].lineData[275]++;
    S.each(self.scrollAnims, function(scrollAnim) {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[276]++;
  scrollAnim.stop();
});
    _$jscoverage['/base.js'].lineData[278]++;
    self.scrollAnims = [];
  }
  _$jscoverage['/base.js'].lineData[280]++;
  self.scrollToWithBounds({
  left: self.get('scrollLeft'), 
  top: self.get('scrollTop')});
}, 
  '_uiSetPageIndex': function(v) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[287]++;
  this.scrollToPage(v);
}, 
  getPageIndexFromXY: function(v, allowX, direction) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[291]++;
  var pagesOffset = this.pagesOffset.concat([]);
  _$jscoverage['/base.js'].lineData[292]++;
  var p2 = allowX ? 'left' : 'top';
  _$jscoverage['/base.js'].lineData[293]++;
  var i, offset;
  _$jscoverage['/base.js'].lineData[294]++;
  pagesOffset.sort(function(e1, e2) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[295]++;
  return e1[p2] - e2[p2];
});
  _$jscoverage['/base.js'].lineData[297]++;
  if (visit56_297_1(direction > 0)) {
    _$jscoverage['/base.js'].lineData[298]++;
    for (i = 0; visit57_298_1(i < pagesOffset.length); i++) {
      _$jscoverage['/base.js'].lineData[299]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[300]++;
      if (visit58_300_1(offset[p2] >= v)) {
        _$jscoverage['/base.js'].lineData[301]++;
        return offset.index;
      }
    }
  } else {
    _$jscoverage['/base.js'].lineData[305]++;
    for (i = pagesOffset.length - 1; visit59_305_1(i >= 0); i--) {
      _$jscoverage['/base.js'].lineData[306]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[307]++;
      if (visit60_307_1(offset[p2] <= v)) {
        _$jscoverage['/base.js'].lineData[308]++;
        return offset.index;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[312]++;
  return undefined;
}, 
  scrollToPage: function(index, animCfg) {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[316]++;
  var self = this, pageOffset;
  _$jscoverage['/base.js'].lineData[318]++;
  if (visit61_318_1((pageOffset = self.pagesOffset) && pageOffset[index])) {
    _$jscoverage['/base.js'].lineData[319]++;
    self.set('pageIndex', index);
    _$jscoverage['/base.js'].lineData[320]++;
    self.scrollTo(pageOffset[index], animCfg);
  }
}, 
  scrollToWithBounds: function(cfg, anim) {
  _$jscoverage['/base.js'].functionData[17]++;
  _$jscoverage['/base.js'].lineData[325]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[326]++;
  var maxScroll = self.maxScroll;
  _$jscoverage['/base.js'].lineData[327]++;
  var minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[328]++;
  if (visit62_328_1(cfg.left)) {
    _$jscoverage['/base.js'].lineData[329]++;
    cfg.left = Math.min(Math.max(cfg.left, minScroll.left), maxScroll.left);
  }
  _$jscoverage['/base.js'].lineData[331]++;
  if (visit63_331_1(cfg.top)) {
    _$jscoverage['/base.js'].lineData[332]++;
    cfg.top = Math.min(Math.max(cfg.top, minScroll.top), maxScroll.top);
  }
  _$jscoverage['/base.js'].lineData[334]++;
  self.scrollTo(cfg, anim);
}, 
  scrollTo: function(cfg, animCfg) {
  _$jscoverage['/base.js'].functionData[18]++;
  _$jscoverage['/base.js'].lineData[338]++;
  var self = this, left = cfg.left, top = cfg.top;
  _$jscoverage['/base.js'].lineData[341]++;
  if (visit64_341_1(animCfg)) {
    _$jscoverage['/base.js'].lineData[342]++;
    var node = {}, to = {};
    _$jscoverage['/base.js'].lineData[344]++;
    if (visit65_344_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[345]++;
      to.scrollLeft = left;
      _$jscoverage['/base.js'].lineData[346]++;
      node.scrollLeft = self.get('scrollLeft');
    }
    _$jscoverage['/base.js'].lineData[348]++;
    if (visit66_348_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[349]++;
      to.scrollTop = top;
      _$jscoverage['/base.js'].lineData[350]++;
      node.scrollTop = self.get('scrollTop');
    }
    _$jscoverage['/base.js'].lineData[352]++;
    animCfg.frame = frame;
    _$jscoverage['/base.js'].lineData[353]++;
    animCfg.node = node;
    _$jscoverage['/base.js'].lineData[354]++;
    animCfg.to = to;
    _$jscoverage['/base.js'].lineData[355]++;
    var anim;
    _$jscoverage['/base.js'].lineData[356]++;
    self.scrollAnims.push(anim = new Anim(animCfg));
    _$jscoverage['/base.js'].lineData[357]++;
    anim.scrollView = self;
    _$jscoverage['/base.js'].lineData[358]++;
    anim.run();
  } else {
    _$jscoverage['/base.js'].lineData[360]++;
    if (visit67_360_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[361]++;
      self.set('scrollLeft', left);
    }
    _$jscoverage['/base.js'].lineData[363]++;
    if (visit68_363_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[364]++;
      self.set('scrollTop', top);
    }
  }
}}, {
  ATTRS: {
  contentEl: {}, 
  scrollLeft: {
  view: 1, 
  value: 0}, 
  scrollTop: {
  view: 1, 
  value: 0}, 
  dimension: {}, 
  focusable: {
  value: true}, 
  allowTextSelection: {
  value: true}, 
  handleGestureEvents: {
  value: false}, 
  snap: {
  value: false}, 
  pageIndex: {
  value: 0}, 
  xrender: {
  value: Render}}, 
  xclass: 'scroll-view'});
});
