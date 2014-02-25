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
if (! _$jscoverage['/lang/object.js']) {
  _$jscoverage['/lang/object.js'] = {};
  _$jscoverage['/lang/object.js'].lineData = [];
  _$jscoverage['/lang/object.js'].lineData[7] = 0;
  _$jscoverage['/lang/object.js'].lineData[8] = 0;
  _$jscoverage['/lang/object.js'].lineData[9] = 0;
  _$jscoverage['/lang/object.js'].lineData[29] = 0;
  _$jscoverage['/lang/object.js'].lineData[39] = 0;
  _$jscoverage['/lang/object.js'].lineData[40] = 0;
  _$jscoverage['/lang/object.js'].lineData[41] = 0;
  _$jscoverage['/lang/object.js'].lineData[42] = 0;
  _$jscoverage['/lang/object.js'].lineData[43] = 0;
  _$jscoverage['/lang/object.js'].lineData[44] = 0;
  _$jscoverage['/lang/object.js'].lineData[45] = 0;
  _$jscoverage['/lang/object.js'].lineData[48] = 0;
  _$jscoverage['/lang/object.js'].lineData[51] = 0;
  _$jscoverage['/lang/object.js'].lineData[62] = 0;
  _$jscoverage['/lang/object.js'].lineData[64] = 0;
  _$jscoverage['/lang/object.js'].lineData[66] = 0;
  _$jscoverage['/lang/object.js'].lineData[67] = 0;
  _$jscoverage['/lang/object.js'].lineData[71] = 0;
  _$jscoverage['/lang/object.js'].lineData[72] = 0;
  _$jscoverage['/lang/object.js'].lineData[73] = 0;
  _$jscoverage['/lang/object.js'].lineData[74] = 0;
  _$jscoverage['/lang/object.js'].lineData[75] = 0;
  _$jscoverage['/lang/object.js'].lineData[80] = 0;
  _$jscoverage['/lang/object.js'].lineData[106] = 0;
  _$jscoverage['/lang/object.js'].lineData[107] = 0;
  _$jscoverage['/lang/object.js'].lineData[111] = 0;
  _$jscoverage['/lang/object.js'].lineData[112] = 0;
  _$jscoverage['/lang/object.js'].lineData[115] = 0;
  _$jscoverage['/lang/object.js'].lineData[116] = 0;
  _$jscoverage['/lang/object.js'].lineData[117] = 0;
  _$jscoverage['/lang/object.js'].lineData[118] = 0;
  _$jscoverage['/lang/object.js'].lineData[122] = 0;
  _$jscoverage['/lang/object.js'].lineData[123] = 0;
  _$jscoverage['/lang/object.js'].lineData[126] = 0;
  _$jscoverage['/lang/object.js'].lineData[129] = 0;
  _$jscoverage['/lang/object.js'].lineData[130] = 0;
  _$jscoverage['/lang/object.js'].lineData[131] = 0;
  _$jscoverage['/lang/object.js'].lineData[133] = 0;
  _$jscoverage['/lang/object.js'].lineData[146] = 0;
  _$jscoverage['/lang/object.js'].lineData[147] = 0;
  _$jscoverage['/lang/object.js'].lineData[150] = 0;
  _$jscoverage['/lang/object.js'].lineData[151] = 0;
  _$jscoverage['/lang/object.js'].lineData[153] = 0;
  _$jscoverage['/lang/object.js'].lineData[166] = 0;
  _$jscoverage['/lang/object.js'].lineData[174] = 0;
  _$jscoverage['/lang/object.js'].lineData[176] = 0;
  _$jscoverage['/lang/object.js'].lineData[177] = 0;
  _$jscoverage['/lang/object.js'].lineData[178] = 0;
  _$jscoverage['/lang/object.js'].lineData[179] = 0;
  _$jscoverage['/lang/object.js'].lineData[181] = 0;
  _$jscoverage['/lang/object.js'].lineData[182] = 0;
  _$jscoverage['/lang/object.js'].lineData[183] = 0;
  _$jscoverage['/lang/object.js'].lineData[186] = 0;
  _$jscoverage['/lang/object.js'].lineData[187] = 0;
  _$jscoverage['/lang/object.js'].lineData[188] = 0;
  _$jscoverage['/lang/object.js'].lineData[189] = 0;
  _$jscoverage['/lang/object.js'].lineData[191] = 0;
  _$jscoverage['/lang/object.js'].lineData[194] = 0;
  _$jscoverage['/lang/object.js'].lineData[209] = 0;
  _$jscoverage['/lang/object.js'].lineData[210] = 0;
  _$jscoverage['/lang/object.js'].lineData[211] = 0;
  _$jscoverage['/lang/object.js'].lineData[213] = 0;
  _$jscoverage['/lang/object.js'].lineData[214] = 0;
  _$jscoverage['/lang/object.js'].lineData[216] = 0;
  _$jscoverage['/lang/object.js'].lineData[217] = 0;
  _$jscoverage['/lang/object.js'].lineData[221] = 0;
  _$jscoverage['/lang/object.js'].lineData[226] = 0;
  _$jscoverage['/lang/object.js'].lineData[229] = 0;
  _$jscoverage['/lang/object.js'].lineData[230] = 0;
  _$jscoverage['/lang/object.js'].lineData[231] = 0;
  _$jscoverage['/lang/object.js'].lineData[234] = 0;
  _$jscoverage['/lang/object.js'].lineData[235] = 0;
  _$jscoverage['/lang/object.js'].lineData[239] = 0;
  _$jscoverage['/lang/object.js'].lineData[240] = 0;
  _$jscoverage['/lang/object.js'].lineData[243] = 0;
  _$jscoverage['/lang/object.js'].lineData[261] = 0;
  _$jscoverage['/lang/object.js'].lineData[266] = 0;
  _$jscoverage['/lang/object.js'].lineData[267] = 0;
  _$jscoverage['/lang/object.js'].lineData[268] = 0;
  _$jscoverage['/lang/object.js'].lineData[269] = 0;
  _$jscoverage['/lang/object.js'].lineData[270] = 0;
  _$jscoverage['/lang/object.js'].lineData[273] = 0;
  _$jscoverage['/lang/object.js'].lineData[278] = 0;
  _$jscoverage['/lang/object.js'].lineData[281] = 0;
  _$jscoverage['/lang/object.js'].lineData[282] = 0;
  _$jscoverage['/lang/object.js'].lineData[283] = 0;
  _$jscoverage['/lang/object.js'].lineData[284] = 0;
  _$jscoverage['/lang/object.js'].lineData[286] = 0;
  _$jscoverage['/lang/object.js'].lineData[287] = 0;
  _$jscoverage['/lang/object.js'].lineData[289] = 0;
  _$jscoverage['/lang/object.js'].lineData[290] = 0;
  _$jscoverage['/lang/object.js'].lineData[293] = 0;
  _$jscoverage['/lang/object.js'].lineData[294] = 0;
  _$jscoverage['/lang/object.js'].lineData[295] = 0;
  _$jscoverage['/lang/object.js'].lineData[299] = 0;
  _$jscoverage['/lang/object.js'].lineData[300] = 0;
  _$jscoverage['/lang/object.js'].lineData[301] = 0;
  _$jscoverage['/lang/object.js'].lineData[303] = 0;
  _$jscoverage['/lang/object.js'].lineData[306] = 0;
  _$jscoverage['/lang/object.js'].lineData[309] = 0;
  _$jscoverage['/lang/object.js'].lineData[312] = 0;
  _$jscoverage['/lang/object.js'].lineData[313] = 0;
  _$jscoverage['/lang/object.js'].lineData[314] = 0;
  _$jscoverage['/lang/object.js'].lineData[315] = 0;
  _$jscoverage['/lang/object.js'].lineData[316] = 0;
  _$jscoverage['/lang/object.js'].lineData[318] = 0;
  _$jscoverage['/lang/object.js'].lineData[322] = 0;
  _$jscoverage['/lang/object.js'].lineData[325] = 0;
  _$jscoverage['/lang/object.js'].lineData[326] = 0;
  _$jscoverage['/lang/object.js'].lineData[329] = 0;
  _$jscoverage['/lang/object.js'].lineData[333] = 0;
  _$jscoverage['/lang/object.js'].lineData[334] = 0;
  _$jscoverage['/lang/object.js'].lineData[337] = 0;
  _$jscoverage['/lang/object.js'].lineData[339] = 0;
  _$jscoverage['/lang/object.js'].lineData[340] = 0;
  _$jscoverage['/lang/object.js'].lineData[342] = 0;
  _$jscoverage['/lang/object.js'].lineData[344] = 0;
  _$jscoverage['/lang/object.js'].lineData[345] = 0;
  _$jscoverage['/lang/object.js'].lineData[348] = 0;
  _$jscoverage['/lang/object.js'].lineData[349] = 0;
  _$jscoverage['/lang/object.js'].lineData[350] = 0;
  _$jscoverage['/lang/object.js'].lineData[354] = 0;
  _$jscoverage['/lang/object.js'].lineData[357] = 0;
  _$jscoverage['/lang/object.js'].lineData[358] = 0;
  _$jscoverage['/lang/object.js'].lineData[360] = 0;
  _$jscoverage['/lang/object.js'].lineData[361] = 0;
}
if (! _$jscoverage['/lang/object.js'].functionData) {
  _$jscoverage['/lang/object.js'].functionData = [];
  _$jscoverage['/lang/object.js'].functionData[0] = 0;
  _$jscoverage['/lang/object.js'].functionData[1] = 0;
  _$jscoverage['/lang/object.js'].functionData[2] = 0;
  _$jscoverage['/lang/object.js'].functionData[3] = 0;
  _$jscoverage['/lang/object.js'].functionData[4] = 0;
  _$jscoverage['/lang/object.js'].functionData[5] = 0;
  _$jscoverage['/lang/object.js'].functionData[6] = 0;
  _$jscoverage['/lang/object.js'].functionData[7] = 0;
  _$jscoverage['/lang/object.js'].functionData[8] = 0;
  _$jscoverage['/lang/object.js'].functionData[9] = 0;
  _$jscoverage['/lang/object.js'].functionData[10] = 0;
  _$jscoverage['/lang/object.js'].functionData[11] = 0;
  _$jscoverage['/lang/object.js'].functionData[12] = 0;
  _$jscoverage['/lang/object.js'].functionData[13] = 0;
  _$jscoverage['/lang/object.js'].functionData[14] = 0;
}
if (! _$jscoverage['/lang/object.js'].branchData) {
  _$jscoverage['/lang/object.js'].branchData = {};
  _$jscoverage['/lang/object.js'].branchData['39'] = [];
  _$jscoverage['/lang/object.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['41'] = [];
  _$jscoverage['/lang/object.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['43'] = [];
  _$jscoverage['/lang/object.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['61'] = [];
  _$jscoverage['/lang/object.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['66'] = [];
  _$jscoverage['/lang/object.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['71'] = [];
  _$jscoverage['/lang/object.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['72'] = [];
  _$jscoverage['/lang/object.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['74'] = [];
  _$jscoverage['/lang/object.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['106'] = [];
  _$jscoverage['/lang/object.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['115'] = [];
  _$jscoverage['/lang/object.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['115'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['122'] = [];
  _$jscoverage['/lang/object.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['150'] = [];
  _$jscoverage['/lang/object.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['176'] = [];
  _$jscoverage['/lang/object.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['181'] = [];
  _$jscoverage['/lang/object.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['186'] = [];
  _$jscoverage['/lang/object.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['209'] = [];
  _$jscoverage['/lang/object.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['210'] = [];
  _$jscoverage['/lang/object.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['213'] = [];
  _$jscoverage['/lang/object.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['216'] = [];
  _$jscoverage['/lang/object.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['234'] = [];
  _$jscoverage['/lang/object.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['239'] = [];
  _$jscoverage['/lang/object.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['264'] = [];
  _$jscoverage['/lang/object.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['264'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['266'] = [];
  _$jscoverage['/lang/object.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['269'] = [];
  _$jscoverage['/lang/object.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['269'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['270'] = [];
  _$jscoverage['/lang/object.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['283'] = [];
  _$jscoverage['/lang/object.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['300'] = [];
  _$jscoverage['/lang/object.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['314'] = [];
  _$jscoverage['/lang/object.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['316'] = [];
  _$jscoverage['/lang/object.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['326'] = [];
  _$jscoverage['/lang/object.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['333'] = [];
  _$jscoverage['/lang/object.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['333'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['337'] = [];
  _$jscoverage['/lang/object.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['339'] = [];
  _$jscoverage['/lang/object.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['344'] = [];
  _$jscoverage['/lang/object.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['348'] = [];
  _$jscoverage['/lang/object.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['348'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['348'][3] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['349'] = [];
  _$jscoverage['/lang/object.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['354'] = [];
  _$jscoverage['/lang/object.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['354'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['360'] = [];
  _$jscoverage['/lang/object.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['360'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['360'][3] = new BranchData();
}
_$jscoverage['/lang/object.js'].branchData['360'][3].init(1062, 15, 'ov || !(p in r)');
function visit277_360_3(result) {
  _$jscoverage['/lang/object.js'].branchData['360'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['360'][2].init(1040, 17, 'src !== undefined');
function visit276_360_2(result) {
  _$jscoverage['/lang/object.js'].branchData['360'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['360'][1].init(1040, 38, 'src !== undefined && (ov || !(p in r))');
function visit275_360_1(result) {
  _$jscoverage['/lang/object.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['354'][2].init(136, 44, 'S.isArray(target) || S.isPlainObject(target)');
function visit274_354_2(result) {
  _$jscoverage['/lang/object.js'].branchData['354'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['354'][1].init(125, 56, 'target && (S.isArray(target) || S.isPlainObject(target))');
function visit273_354_1(result) {
  _$jscoverage['/lang/object.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['349'][1].init(21, 27, 'src[MIX_CIRCULAR_DETECTION]');
function visit272_349_1(result) {
  _$jscoverage['/lang/object.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['348'][3].init(455, 38, 'S.isArray(src) || S.isPlainObject(src)');
function visit271_348_3(result) {
  _$jscoverage['/lang/object.js'].branchData['348'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['348'][2].init(447, 47, 'src && (S.isArray(src) || S.isPlainObject(src))');
function visit270_348_2(result) {
  _$jscoverage['/lang/object.js'].branchData['348'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['348'][1].init(439, 55, 'deep && src && (S.isArray(src) || S.isPlainObject(src))');
function visit269_348_1(result) {
  _$jscoverage['/lang/object.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['344'][1].init(326, 2, 'wl');
function visit268_344_1(result) {
  _$jscoverage['/lang/object.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['339'][1].init(64, 20, 'target === undefined');
function visit267_339_1(result) {
  _$jscoverage['/lang/object.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['337'][1].init(114, 14, 'target === src');
function visit266_337_1(result) {
  _$jscoverage['/lang/object.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['333'][2].init(73, 17, '!(p in r) || deep');
function visit265_333_2(result) {
  _$jscoverage['/lang/object.js'].branchData['333'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['333'][1].init(67, 23, 'ov || !(p in r) || deep');
function visit264_333_1(result) {
  _$jscoverage['/lang/object.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['326'][1].init(16, 19, 'k === \'constructor\'');
function visit263_326_1(result) {
  _$jscoverage['/lang/object.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['316'][1].init(42, 28, 'p !== MIX_CIRCULAR_DETECTION');
function visit262_316_1(result) {
  _$jscoverage['/lang/object.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['314'][1].init(297, 7, 'i < len');
function visit261_314_1(result) {
  _$jscoverage['/lang/object.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['300'][1].init(13, 8, '!s || !r');
function visit260_300_1(result) {
  _$jscoverage['/lang/object.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['283'][1].init(35, 12, 'objectCreate');
function visit259_283_1(result) {
  _$jscoverage['/lang/object.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['270'][1].init(35, 14, 'o[p[j]] || {}');
function visit258_270_1(result) {
  _$jscoverage['/lang/object.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['269'][2].init(146, 12, 'j < p.length');
function visit257_269_2(result) {
  _$jscoverage['/lang/object.js'].branchData['269'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['269'][1].init(119, 16, 'host[p[0]] === o');
function visit256_269_1(result) {
  _$jscoverage['/lang/object.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['266'][1].init(197, 5, 'i < l');
function visit255_266_1(result) {
  _$jscoverage['/lang/object.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['264'][2].init(128, 20, 'args[l - 1] === TRUE');
function visit254_264_2(result) {
  _$jscoverage['/lang/object.js'].branchData['264'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['264'][1].init(128, 27, 'args[l - 1] === TRUE && l--');
function visit253_264_1(result) {
  _$jscoverage['/lang/object.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['239'][1].init(818, 2, 'sx');
function visit252_239_1(result) {
  _$jscoverage['/lang/object.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['234'][1].init(714, 2, 'px');
function visit251_234_1(result) {
  _$jscoverage['/lang/object.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['216'][1].init(217, 8, '!s || !r');
function visit250_216_1(result) {
  _$jscoverage['/lang/object.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['213'][1].init(119, 2, '!s');
function visit249_213_1(result) {
  _$jscoverage['/lang/object.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['210'][1].init(21, 2, '!r');
function visit248_210_1(result) {
  _$jscoverage['/lang/object.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['209'][1].init(17, 9, '\'@DEBUG@\'');
function visit247_209_1(result) {
  _$jscoverage['/lang/object.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['186'][1].init(515, 7, 'i < len');
function visit246_186_1(result) {
  _$jscoverage['/lang/object.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['181'][1].init(399, 23, 'typeof ov !== \'boolean\'');
function visit245_181_1(result) {
  _$jscoverage['/lang/object.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['176'][1].init(271, 14, '!S.isArray(wl)');
function visit244_176_1(result) {
  _$jscoverage['/lang/object.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['150'][1].init(150, 5, 'i < l');
function visit243_150_1(result) {
  _$jscoverage['/lang/object.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['122'][1].init(508, 16, 'ov === undefined');
function visit242_122_1(result) {
  _$jscoverage['/lang/object.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['115'][2].init(274, 24, 'typeof wl !== \'function\'');
function visit241_115_2(result) {
  _$jscoverage['/lang/object.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['115'][1].init(267, 32, 'wl && (typeof wl !== \'function\')');
function visit240_115_1(result) {
  _$jscoverage['/lang/object.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['106'][1].init(17, 22, 'typeof ov === \'object\'');
function visit239_106_1(result) {
  _$jscoverage['/lang/object.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['74'][1].init(68, 19, 'o.hasOwnProperty(p)');
function visit238_74_1(result) {
  _$jscoverage['/lang/object.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['72'][1].init(53, 6, 'i >= 0');
function visit237_72_1(result) {
  _$jscoverage['/lang/object.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['71'][1].init(228, 10, 'hasEnumBug');
function visit236_71_1(result) {
  _$jscoverage['/lang/object.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['66'][1].init(57, 19, 'o.hasOwnProperty(p)');
function visit235_66_1(result) {
  _$jscoverage['/lang/object.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['61'][1].init(975, 556, 'Obj.keys || function(o) {\n  var result = [], p, i;\n  for (p in o) {\n    if (o.hasOwnProperty(p)) {\n      result.push(p);\n    }\n  }\n  if (hasEnumBug) {\n    for (i = enumProperties.length - 1; i >= 0; i--) {\n      p = enumProperties[i];\n      if (o.hasOwnProperty(p)) {\n        result.push(p);\n      }\n    }\n  }\n  return result;\n}');
function visit234_61_1(result) {
  _$jscoverage['/lang/object.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['43'][1].init(157, 9, '!readOnly');
function visit233_43_1(result) {
  _$jscoverage['/lang/object.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['41'][1].init(96, 4, 'guid');
function visit232_41_1(result) {
  _$jscoverage['/lang/object.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['39'][1].init(22, 22, 'marker || STAMP_MARKER');
function visit231_39_1(result) {
  _$jscoverage['/lang/object.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].lineData[7]++;
(function(S, undefined) {
  _$jscoverage['/lang/object.js'].functionData[0]++;
  _$jscoverage['/lang/object.js'].lineData[8]++;
  var logger = S.getLogger('s/lang');
  _$jscoverage['/lang/object.js'].lineData[9]++;
  var MIX_CIRCULAR_DETECTION = '__MIX_CIRCULAR', STAMP_MARKER = '__~ks_stamped', host = this, TRUE = true, EMPTY = '', Obj = Object, objectCreate = Obj.create, hasEnumBug = !({
  toString: 1}.propertyIsEnumerable('toString')), enumProperties = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toString', 'toLocaleString', 'valueOf'];
  _$jscoverage['/lang/object.js'].lineData[29]++;
  mix(S, {
  stamp: function(o, readOnly, marker) {
  _$jscoverage['/lang/object.js'].functionData[1]++;
  _$jscoverage['/lang/object.js'].lineData[39]++;
  marker = visit231_39_1(marker || STAMP_MARKER);
  _$jscoverage['/lang/object.js'].lineData[40]++;
  var guid = o[marker];
  _$jscoverage['/lang/object.js'].lineData[41]++;
  if (visit232_41_1(guid)) {
    _$jscoverage['/lang/object.js'].lineData[42]++;
    return guid;
  } else {
    _$jscoverage['/lang/object.js'].lineData[43]++;
    if (visit233_43_1(!readOnly)) {
      _$jscoverage['/lang/object.js'].lineData[44]++;
      try {
        _$jscoverage['/lang/object.js'].lineData[45]++;
        guid = o[marker] = S.guid(marker);
      }      catch (e) {
  _$jscoverage['/lang/object.js'].lineData[48]++;
  guid = undefined;
}
    }
  }
  _$jscoverage['/lang/object.js'].lineData[51]++;
  return guid;
}, 
  keys: visit234_61_1(Obj.keys || function(o) {
  _$jscoverage['/lang/object.js'].functionData[2]++;
  _$jscoverage['/lang/object.js'].lineData[62]++;
  var result = [], p, i;
  _$jscoverage['/lang/object.js'].lineData[64]++;
  for (p in o) {
    _$jscoverage['/lang/object.js'].lineData[66]++;
    if (visit235_66_1(o.hasOwnProperty(p))) {
      _$jscoverage['/lang/object.js'].lineData[67]++;
      result.push(p);
    }
  }
  _$jscoverage['/lang/object.js'].lineData[71]++;
  if (visit236_71_1(hasEnumBug)) {
    _$jscoverage['/lang/object.js'].lineData[72]++;
    for (i = enumProperties.length - 1; visit237_72_1(i >= 0); i--) {
      _$jscoverage['/lang/object.js'].lineData[73]++;
      p = enumProperties[i];
      _$jscoverage['/lang/object.js'].lineData[74]++;
      if (visit238_74_1(o.hasOwnProperty(p))) {
        _$jscoverage['/lang/object.js'].lineData[75]++;
        result.push(p);
      }
    }
  }
  _$jscoverage['/lang/object.js'].lineData[80]++;
  return result;
}), 
  mix: function(r, s, ov, wl, deep) {
  _$jscoverage['/lang/object.js'].functionData[3]++;
  _$jscoverage['/lang/object.js'].lineData[106]++;
  if (visit239_106_1(typeof ov === 'object')) {
    _$jscoverage['/lang/object.js'].lineData[107]++;
    wl = ov.whitelist;
    _$jscoverage['/lang/object.js'].lineData[111]++;
    deep = ov.deep;
    _$jscoverage['/lang/object.js'].lineData[112]++;
    ov = ov.overwrite;
  }
  _$jscoverage['/lang/object.js'].lineData[115]++;
  if (visit240_115_1(wl && (visit241_115_2(typeof wl !== 'function')))) {
    _$jscoverage['/lang/object.js'].lineData[116]++;
    var originalWl = wl;
    _$jscoverage['/lang/object.js'].lineData[117]++;
    wl = function(name, val) {
  _$jscoverage['/lang/object.js'].functionData[4]++;
  _$jscoverage['/lang/object.js'].lineData[118]++;
  return S.inArray(name, originalWl) ? val : undefined;
};
  }
  _$jscoverage['/lang/object.js'].lineData[122]++;
  if (visit242_122_1(ov === undefined)) {
    _$jscoverage['/lang/object.js'].lineData[123]++;
    ov = TRUE;
  }
  _$jscoverage['/lang/object.js'].lineData[126]++;
  var cache = [], c, i = 0;
  _$jscoverage['/lang/object.js'].lineData[129]++;
  mixInternal(r, s, ov, wl, deep, cache);
  _$jscoverage['/lang/object.js'].lineData[130]++;
  while ((c = cache[i++])) {
    _$jscoverage['/lang/object.js'].lineData[131]++;
    delete c[MIX_CIRCULAR_DETECTION];
  }
  _$jscoverage['/lang/object.js'].lineData[133]++;
  return r;
}, 
  merge: function(varArgs) {
  _$jscoverage['/lang/object.js'].functionData[5]++;
  _$jscoverage['/lang/object.js'].lineData[146]++;
  varArgs = S.makeArray(arguments);
  _$jscoverage['/lang/object.js'].lineData[147]++;
  var o = {}, i, l = varArgs.length;
  _$jscoverage['/lang/object.js'].lineData[150]++;
  for (i = 0; visit243_150_1(i < l); i++) {
    _$jscoverage['/lang/object.js'].lineData[151]++;
    S.mix(o, varArgs[i]);
  }
  _$jscoverage['/lang/object.js'].lineData[153]++;
  return o;
}, 
  augment: function(r, varArgs) {
  _$jscoverage['/lang/object.js'].functionData[6]++;
  _$jscoverage['/lang/object.js'].lineData[166]++;
  var args = S.makeArray(arguments), len = args.length - 2, i = 1, proto, arg, ov = args[len], wl = args[len + 1];
  _$jscoverage['/lang/object.js'].lineData[174]++;
  args[1] = varArgs;
  _$jscoverage['/lang/object.js'].lineData[176]++;
  if (visit244_176_1(!S.isArray(wl))) {
    _$jscoverage['/lang/object.js'].lineData[177]++;
    ov = wl;
    _$jscoverage['/lang/object.js'].lineData[178]++;
    wl = undefined;
    _$jscoverage['/lang/object.js'].lineData[179]++;
    len++;
  }
  _$jscoverage['/lang/object.js'].lineData[181]++;
  if (visit245_181_1(typeof ov !== 'boolean')) {
    _$jscoverage['/lang/object.js'].lineData[182]++;
    ov = undefined;
    _$jscoverage['/lang/object.js'].lineData[183]++;
    len++;
  }
  _$jscoverage['/lang/object.js'].lineData[186]++;
  for (; visit246_186_1(i < len); i++) {
    _$jscoverage['/lang/object.js'].lineData[187]++;
    arg = args[i];
    _$jscoverage['/lang/object.js'].lineData[188]++;
    if ((proto = arg.prototype)) {
      _$jscoverage['/lang/object.js'].lineData[189]++;
      arg = S.mix({}, proto, true, removeConstructor);
    }
    _$jscoverage['/lang/object.js'].lineData[191]++;
    S.mix(r.prototype, arg, ov, wl);
  }
  _$jscoverage['/lang/object.js'].lineData[194]++;
  return r;
}, 
  extend: function(r, s, px, sx) {
  _$jscoverage['/lang/object.js'].functionData[7]++;
  _$jscoverage['/lang/object.js'].lineData[209]++;
  if (visit247_209_1('@DEBUG@')) {
    _$jscoverage['/lang/object.js'].lineData[210]++;
    if (visit248_210_1(!r)) {
      _$jscoverage['/lang/object.js'].lineData[211]++;
      logger.error('extend r is null');
    }
    _$jscoverage['/lang/object.js'].lineData[213]++;
    if (visit249_213_1(!s)) {
      _$jscoverage['/lang/object.js'].lineData[214]++;
      logger.error('extend s is null');
    }
    _$jscoverage['/lang/object.js'].lineData[216]++;
    if (visit250_216_1(!s || !r)) {
      _$jscoverage['/lang/object.js'].lineData[217]++;
      return r;
    }
  }
  _$jscoverage['/lang/object.js'].lineData[221]++;
  var sp = s.prototype, rp;
  _$jscoverage['/lang/object.js'].lineData[226]++;
  sp.constructor = s;
  _$jscoverage['/lang/object.js'].lineData[229]++;
  rp = createObject(sp, r);
  _$jscoverage['/lang/object.js'].lineData[230]++;
  r.prototype = S.mix(rp, r.prototype);
  _$jscoverage['/lang/object.js'].lineData[231]++;
  r.superclass = sp;
  _$jscoverage['/lang/object.js'].lineData[234]++;
  if (visit251_234_1(px)) {
    _$jscoverage['/lang/object.js'].lineData[235]++;
    S.mix(rp, px);
  }
  _$jscoverage['/lang/object.js'].lineData[239]++;
  if (visit252_239_1(sx)) {
    _$jscoverage['/lang/object.js'].lineData[240]++;
    S.mix(r, sx);
  }
  _$jscoverage['/lang/object.js'].lineData[243]++;
  return r;
}, 
  namespace: function() {
  _$jscoverage['/lang/object.js'].functionData[8]++;
  _$jscoverage['/lang/object.js'].lineData[261]++;
  var args = S.makeArray(arguments), l = args.length, o = null, i, j, p, global = (visit253_264_1(visit254_264_2(args[l - 1] === TRUE) && l--));
  _$jscoverage['/lang/object.js'].lineData[266]++;
  for (i = 0; visit255_266_1(i < l); i++) {
    _$jscoverage['/lang/object.js'].lineData[267]++;
    p = (EMPTY + args[i]).split('.');
    _$jscoverage['/lang/object.js'].lineData[268]++;
    o = global ? host : this;
    _$jscoverage['/lang/object.js'].lineData[269]++;
    for (j = (visit256_269_1(host[p[0]] === o)) ? 1 : 0; visit257_269_2(j < p.length); ++j) {
      _$jscoverage['/lang/object.js'].lineData[270]++;
      o = o[p[j]] = visit258_270_1(o[p[j]] || {});
    }
  }
  _$jscoverage['/lang/object.js'].lineData[273]++;
  return o;
}});
  _$jscoverage['/lang/object.js'].lineData[278]++;
  function Empty() {
    _$jscoverage['/lang/object.js'].functionData[9]++;
  }
  _$jscoverage['/lang/object.js'].lineData[281]++;
  function createObject(proto, constructor) {
    _$jscoverage['/lang/object.js'].functionData[10]++;
    _$jscoverage['/lang/object.js'].lineData[282]++;
    var newProto;
    _$jscoverage['/lang/object.js'].lineData[283]++;
    if (visit259_283_1(objectCreate)) {
      _$jscoverage['/lang/object.js'].lineData[284]++;
      newProto = objectCreate(proto);
    } else {
      _$jscoverage['/lang/object.js'].lineData[286]++;
      Empty.prototype = proto;
      _$jscoverage['/lang/object.js'].lineData[287]++;
      newProto = new Empty();
    }
    _$jscoverage['/lang/object.js'].lineData[289]++;
    newProto.constructor = constructor;
    _$jscoverage['/lang/object.js'].lineData[290]++;
    return newProto;
  }
  _$jscoverage['/lang/object.js'].lineData[293]++;
  function mix(r, s) {
    _$jscoverage['/lang/object.js'].functionData[11]++;
    _$jscoverage['/lang/object.js'].lineData[294]++;
    for (var i in s) {
      _$jscoverage['/lang/object.js'].lineData[295]++;
      r[i] = s[i];
    }
  }
  _$jscoverage['/lang/object.js'].lineData[299]++;
  function mixInternal(r, s, ov, wl, deep, cache) {
    _$jscoverage['/lang/object.js'].functionData[12]++;
    _$jscoverage['/lang/object.js'].lineData[300]++;
    if (visit260_300_1(!s || !r)) {
      _$jscoverage['/lang/object.js'].lineData[301]++;
      return r;
    }
    _$jscoverage['/lang/object.js'].lineData[303]++;
    var i, p, keys, len;
    _$jscoverage['/lang/object.js'].lineData[306]++;
    s[MIX_CIRCULAR_DETECTION] = r;
    _$jscoverage['/lang/object.js'].lineData[309]++;
    cache.push(s);
    _$jscoverage['/lang/object.js'].lineData[312]++;
    keys = S.keys(s);
    _$jscoverage['/lang/object.js'].lineData[313]++;
    len = keys.length;
    _$jscoverage['/lang/object.js'].lineData[314]++;
    for (i = 0; visit261_314_1(i < len); i++) {
      _$jscoverage['/lang/object.js'].lineData[315]++;
      p = keys[i];
      _$jscoverage['/lang/object.js'].lineData[316]++;
      if (visit262_316_1(p !== MIX_CIRCULAR_DETECTION)) {
        _$jscoverage['/lang/object.js'].lineData[318]++;
        _mix(p, r, s, ov, wl, deep, cache);
      }
    }
    _$jscoverage['/lang/object.js'].lineData[322]++;
    return r;
  }
  _$jscoverage['/lang/object.js'].lineData[325]++;
  function removeConstructor(k, v) {
    _$jscoverage['/lang/object.js'].functionData[13]++;
    _$jscoverage['/lang/object.js'].lineData[326]++;
    return visit263_326_1(k === 'constructor') ? undefined : v;
  }
  _$jscoverage['/lang/object.js'].lineData[329]++;
  function _mix(p, r, s, ov, wl, deep, cache) {
    _$jscoverage['/lang/object.js'].functionData[14]++;
    _$jscoverage['/lang/object.js'].lineData[333]++;
    if (visit264_333_1(ov || visit265_333_2(!(p in r) || deep))) {
      _$jscoverage['/lang/object.js'].lineData[334]++;
      var target = r[p], src = s[p];
      _$jscoverage['/lang/object.js'].lineData[337]++;
      if (visit266_337_1(target === src)) {
        _$jscoverage['/lang/object.js'].lineData[339]++;
        if (visit267_339_1(target === undefined)) {
          _$jscoverage['/lang/object.js'].lineData[340]++;
          r[p] = target;
        }
        _$jscoverage['/lang/object.js'].lineData[342]++;
        return;
      }
      _$jscoverage['/lang/object.js'].lineData[344]++;
      if (visit268_344_1(wl)) {
        _$jscoverage['/lang/object.js'].lineData[345]++;
        src = wl.call(s, p, src);
      }
      _$jscoverage['/lang/object.js'].lineData[348]++;
      if (visit269_348_1(deep && visit270_348_2(src && (visit271_348_3(S.isArray(src) || S.isPlainObject(src)))))) {
        _$jscoverage['/lang/object.js'].lineData[349]++;
        if (visit272_349_1(src[MIX_CIRCULAR_DETECTION])) {
          _$jscoverage['/lang/object.js'].lineData[350]++;
          r[p] = src[MIX_CIRCULAR_DETECTION];
        } else {
          _$jscoverage['/lang/object.js'].lineData[354]++;
          var clone = visit273_354_1(target && (visit274_354_2(S.isArray(target) || S.isPlainObject(target)))) ? target : (S.isArray(src) ? [] : {});
          _$jscoverage['/lang/object.js'].lineData[357]++;
          r[p] = clone;
          _$jscoverage['/lang/object.js'].lineData[358]++;
          mixInternal(clone, src, ov, wl, TRUE, cache);
        }
      } else {
        _$jscoverage['/lang/object.js'].lineData[360]++;
        if (visit275_360_1(visit276_360_2(src !== undefined) && (visit277_360_3(ov || !(p in r))))) {
          _$jscoverage['/lang/object.js'].lineData[361]++;
          r[p] = src;
        }
      }
    }
  }
})(KISSY);
