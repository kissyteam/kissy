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
  _$jscoverage['/lang/object.js'].lineData[175] = 0;
  _$jscoverage['/lang/object.js'].lineData[176] = 0;
  _$jscoverage['/lang/object.js'].lineData[177] = 0;
  _$jscoverage['/lang/object.js'].lineData[179] = 0;
  _$jscoverage['/lang/object.js'].lineData[180] = 0;
  _$jscoverage['/lang/object.js'].lineData[181] = 0;
  _$jscoverage['/lang/object.js'].lineData[184] = 0;
  _$jscoverage['/lang/object.js'].lineData[185] = 0;
  _$jscoverage['/lang/object.js'].lineData[186] = 0;
  _$jscoverage['/lang/object.js'].lineData[187] = 0;
  _$jscoverage['/lang/object.js'].lineData[189] = 0;
  _$jscoverage['/lang/object.js'].lineData[192] = 0;
  _$jscoverage['/lang/object.js'].lineData[207] = 0;
  _$jscoverage['/lang/object.js'].lineData[208] = 0;
  _$jscoverage['/lang/object.js'].lineData[209] = 0;
  _$jscoverage['/lang/object.js'].lineData[211] = 0;
  _$jscoverage['/lang/object.js'].lineData[212] = 0;
  _$jscoverage['/lang/object.js'].lineData[214] = 0;
  _$jscoverage['/lang/object.js'].lineData[215] = 0;
  _$jscoverage['/lang/object.js'].lineData[219] = 0;
  _$jscoverage['/lang/object.js'].lineData[224] = 0;
  _$jscoverage['/lang/object.js'].lineData[227] = 0;
  _$jscoverage['/lang/object.js'].lineData[228] = 0;
  _$jscoverage['/lang/object.js'].lineData[229] = 0;
  _$jscoverage['/lang/object.js'].lineData[232] = 0;
  _$jscoverage['/lang/object.js'].lineData[233] = 0;
  _$jscoverage['/lang/object.js'].lineData[237] = 0;
  _$jscoverage['/lang/object.js'].lineData[238] = 0;
  _$jscoverage['/lang/object.js'].lineData[241] = 0;
  _$jscoverage['/lang/object.js'].lineData[259] = 0;
  _$jscoverage['/lang/object.js'].lineData[264] = 0;
  _$jscoverage['/lang/object.js'].lineData[265] = 0;
  _$jscoverage['/lang/object.js'].lineData[266] = 0;
  _$jscoverage['/lang/object.js'].lineData[267] = 0;
  _$jscoverage['/lang/object.js'].lineData[268] = 0;
  _$jscoverage['/lang/object.js'].lineData[271] = 0;
  _$jscoverage['/lang/object.js'].lineData[276] = 0;
  _$jscoverage['/lang/object.js'].lineData[279] = 0;
  _$jscoverage['/lang/object.js'].lineData[280] = 0;
  _$jscoverage['/lang/object.js'].lineData[281] = 0;
  _$jscoverage['/lang/object.js'].lineData[282] = 0;
  _$jscoverage['/lang/object.js'].lineData[284] = 0;
  _$jscoverage['/lang/object.js'].lineData[285] = 0;
  _$jscoverage['/lang/object.js'].lineData[287] = 0;
  _$jscoverage['/lang/object.js'].lineData[288] = 0;
  _$jscoverage['/lang/object.js'].lineData[291] = 0;
  _$jscoverage['/lang/object.js'].lineData[292] = 0;
  _$jscoverage['/lang/object.js'].lineData[293] = 0;
  _$jscoverage['/lang/object.js'].lineData[297] = 0;
  _$jscoverage['/lang/object.js'].lineData[298] = 0;
  _$jscoverage['/lang/object.js'].lineData[299] = 0;
  _$jscoverage['/lang/object.js'].lineData[301] = 0;
  _$jscoverage['/lang/object.js'].lineData[304] = 0;
  _$jscoverage['/lang/object.js'].lineData[307] = 0;
  _$jscoverage['/lang/object.js'].lineData[310] = 0;
  _$jscoverage['/lang/object.js'].lineData[311] = 0;
  _$jscoverage['/lang/object.js'].lineData[312] = 0;
  _$jscoverage['/lang/object.js'].lineData[313] = 0;
  _$jscoverage['/lang/object.js'].lineData[314] = 0;
  _$jscoverage['/lang/object.js'].lineData[316] = 0;
  _$jscoverage['/lang/object.js'].lineData[320] = 0;
  _$jscoverage['/lang/object.js'].lineData[323] = 0;
  _$jscoverage['/lang/object.js'].lineData[324] = 0;
  _$jscoverage['/lang/object.js'].lineData[327] = 0;
  _$jscoverage['/lang/object.js'].lineData[331] = 0;
  _$jscoverage['/lang/object.js'].lineData[332] = 0;
  _$jscoverage['/lang/object.js'].lineData[335] = 0;
  _$jscoverage['/lang/object.js'].lineData[337] = 0;
  _$jscoverage['/lang/object.js'].lineData[338] = 0;
  _$jscoverage['/lang/object.js'].lineData[340] = 0;
  _$jscoverage['/lang/object.js'].lineData[342] = 0;
  _$jscoverage['/lang/object.js'].lineData[343] = 0;
  _$jscoverage['/lang/object.js'].lineData[346] = 0;
  _$jscoverage['/lang/object.js'].lineData[347] = 0;
  _$jscoverage['/lang/object.js'].lineData[348] = 0;
  _$jscoverage['/lang/object.js'].lineData[352] = 0;
  _$jscoverage['/lang/object.js'].lineData[355] = 0;
  _$jscoverage['/lang/object.js'].lineData[356] = 0;
  _$jscoverage['/lang/object.js'].lineData[358] = 0;
  _$jscoverage['/lang/object.js'].lineData[359] = 0;
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
  _$jscoverage['/lang/object.js'].branchData['174'] = [];
  _$jscoverage['/lang/object.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['179'] = [];
  _$jscoverage['/lang/object.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['184'] = [];
  _$jscoverage['/lang/object.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['186'] = [];
  _$jscoverage['/lang/object.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['207'] = [];
  _$jscoverage['/lang/object.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['208'] = [];
  _$jscoverage['/lang/object.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['211'] = [];
  _$jscoverage['/lang/object.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['214'] = [];
  _$jscoverage['/lang/object.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['232'] = [];
  _$jscoverage['/lang/object.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['237'] = [];
  _$jscoverage['/lang/object.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['262'] = [];
  _$jscoverage['/lang/object.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['262'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['264'] = [];
  _$jscoverage['/lang/object.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['267'] = [];
  _$jscoverage['/lang/object.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['267'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['268'] = [];
  _$jscoverage['/lang/object.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['281'] = [];
  _$jscoverage['/lang/object.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['298'] = [];
  _$jscoverage['/lang/object.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['312'] = [];
  _$jscoverage['/lang/object.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['314'] = [];
  _$jscoverage['/lang/object.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['324'] = [];
  _$jscoverage['/lang/object.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['331'] = [];
  _$jscoverage['/lang/object.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['331'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['335'] = [];
  _$jscoverage['/lang/object.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['337'] = [];
  _$jscoverage['/lang/object.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['342'] = [];
  _$jscoverage['/lang/object.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['346'] = [];
  _$jscoverage['/lang/object.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['346'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['346'][3] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['347'] = [];
  _$jscoverage['/lang/object.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['352'] = [];
  _$jscoverage['/lang/object.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['352'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['358'] = [];
  _$jscoverage['/lang/object.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['358'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['358'][3] = new BranchData();
}
_$jscoverage['/lang/object.js'].branchData['358'][3].init(1062, 15, 'ov || !(p in r)');
function visit271_358_3(result) {
  _$jscoverage['/lang/object.js'].branchData['358'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['358'][2].init(1040, 17, 'src !== undefined');
function visit270_358_2(result) {
  _$jscoverage['/lang/object.js'].branchData['358'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['358'][1].init(1040, 38, 'src !== undefined && (ov || !(p in r))');
function visit269_358_1(result) {
  _$jscoverage['/lang/object.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['352'][2].init(136, 44, 'S.isArray(target) || S.isPlainObject(target)');
function visit268_352_2(result) {
  _$jscoverage['/lang/object.js'].branchData['352'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['352'][1].init(125, 56, 'target && (S.isArray(target) || S.isPlainObject(target))');
function visit267_352_1(result) {
  _$jscoverage['/lang/object.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['347'][1].init(21, 27, 'src[MIX_CIRCULAR_DETECTION]');
function visit266_347_1(result) {
  _$jscoverage['/lang/object.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['346'][3].init(455, 38, 'S.isArray(src) || S.isPlainObject(src)');
function visit265_346_3(result) {
  _$jscoverage['/lang/object.js'].branchData['346'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['346'][2].init(447, 47, 'src && (S.isArray(src) || S.isPlainObject(src))');
function visit264_346_2(result) {
  _$jscoverage['/lang/object.js'].branchData['346'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['346'][1].init(439, 55, 'deep && src && (S.isArray(src) || S.isPlainObject(src))');
function visit263_346_1(result) {
  _$jscoverage['/lang/object.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['342'][1].init(326, 2, 'wl');
function visit262_342_1(result) {
  _$jscoverage['/lang/object.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['337'][1].init(64, 20, 'target === undefined');
function visit261_337_1(result) {
  _$jscoverage['/lang/object.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['335'][1].init(114, 14, 'target === src');
function visit260_335_1(result) {
  _$jscoverage['/lang/object.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['331'][2].init(73, 17, '!(p in r) || deep');
function visit259_331_2(result) {
  _$jscoverage['/lang/object.js'].branchData['331'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['331'][1].init(67, 23, 'ov || !(p in r) || deep');
function visit258_331_1(result) {
  _$jscoverage['/lang/object.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['324'][1].init(16, 18, 'k == \'constructor\'');
function visit257_324_1(result) {
  _$jscoverage['/lang/object.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['314'][1].init(42, 27, 'p != MIX_CIRCULAR_DETECTION');
function visit256_314_1(result) {
  _$jscoverage['/lang/object.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['312'][1].init(297, 7, 'i < len');
function visit255_312_1(result) {
  _$jscoverage['/lang/object.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['298'][1].init(13, 8, '!s || !r');
function visit254_298_1(result) {
  _$jscoverage['/lang/object.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['281'][1].init(35, 12, 'ObjectCreate');
function visit253_281_1(result) {
  _$jscoverage['/lang/object.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['268'][1].init(35, 14, 'o[p[j]] || {}');
function visit252_268_1(result) {
  _$jscoverage['/lang/object.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['267'][2].init(146, 12, 'j < p.length');
function visit251_267_2(result) {
  _$jscoverage['/lang/object.js'].branchData['267'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['267'][1].init(119, 16, 'host[p[0]] === o');
function visit250_267_1(result) {
  _$jscoverage['/lang/object.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['264'][1].init(197, 5, 'i < l');
function visit249_264_1(result) {
  _$jscoverage['/lang/object.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['262'][2].init(128, 20, 'args[l - 1] === TRUE');
function visit248_262_2(result) {
  _$jscoverage['/lang/object.js'].branchData['262'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['262'][1].init(128, 27, 'args[l - 1] === TRUE && l--');
function visit247_262_1(result) {
  _$jscoverage['/lang/object.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['237'][1].init(818, 2, 'sx');
function visit246_237_1(result) {
  _$jscoverage['/lang/object.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['232'][1].init(714, 2, 'px');
function visit245_232_1(result) {
  _$jscoverage['/lang/object.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['214'][1].init(217, 8, '!s || !r');
function visit244_214_1(result) {
  _$jscoverage['/lang/object.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['211'][1].init(119, 2, '!s');
function visit243_211_1(result) {
  _$jscoverage['/lang/object.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['208'][1].init(21, 2, '!r');
function visit242_208_1(result) {
  _$jscoverage['/lang/object.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['207'][1].init(17, 9, '\'@DEBUG@\'');
function visit241_207_1(result) {
  _$jscoverage['/lang/object.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['186'][1].init(52, 21, 'proto = arg.prototype');
function visit240_186_1(result) {
  _$jscoverage['/lang/object.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['184'][1].init(483, 7, 'i < len');
function visit239_184_1(result) {
  _$jscoverage['/lang/object.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['179'][1].init(367, 23, 'typeof ov !== \'boolean\'');
function visit238_179_1(result) {
  _$jscoverage['/lang/object.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['174'][1].init(239, 14, '!S.isArray(wl)');
function visit237_174_1(result) {
  _$jscoverage['/lang/object.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['150'][1].init(152, 5, 'i < l');
function visit236_150_1(result) {
  _$jscoverage['/lang/object.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['122'][1].init(517, 16, 'ov === undefined');
function visit235_122_1(result) {
  _$jscoverage['/lang/object.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['115'][2].init(283, 24, 'typeof wl !== \'function\'');
function visit234_115_2(result) {
  _$jscoverage['/lang/object.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['115'][1].init(276, 32, 'wl && (typeof wl !== \'function\')');
function visit233_115_1(result) {
  _$jscoverage['/lang/object.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['106'][1].init(17, 22, 'typeof ov === \'object\'');
function visit232_106_1(result) {
  _$jscoverage['/lang/object.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['74'][1].init(68, 19, 'o.hasOwnProperty(p)');
function visit231_74_1(result) {
  _$jscoverage['/lang/object.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['72'][1].init(53, 6, 'i >= 0');
function visit230_72_1(result) {
  _$jscoverage['/lang/object.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['71'][1].init(228, 10, 'hasEnumBug');
function visit229_71_1(result) {
  _$jscoverage['/lang/object.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['66'][1].init(57, 19, 'o.hasOwnProperty(p)');
function visit228_66_1(result) {
  _$jscoverage['/lang/object.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['61'][1].init(975, 556, 'Obj.keys || function(o) {\n  var result = [], p, i;\n  for (p in o) {\n    if (o.hasOwnProperty(p)) {\n      result.push(p);\n    }\n  }\n  if (hasEnumBug) {\n    for (i = enumProperties.length - 1; i >= 0; i--) {\n      p = enumProperties[i];\n      if (o.hasOwnProperty(p)) {\n        result.push(p);\n      }\n    }\n  }\n  return result;\n}');
function visit227_61_1(result) {
  _$jscoverage['/lang/object.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['43'][1].init(157, 9, '!readOnly');
function visit226_43_1(result) {
  _$jscoverage['/lang/object.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['41'][1].init(96, 4, 'guid');
function visit225_41_1(result) {
  _$jscoverage['/lang/object.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['39'][1].init(22, 22, 'marker || STAMP_MARKER');
function visit224_39_1(result) {
  _$jscoverage['/lang/object.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].lineData[7]++;
(function(S, undefined) {
  _$jscoverage['/lang/object.js'].functionData[0]++;
  _$jscoverage['/lang/object.js'].lineData[9]++;
  var MIX_CIRCULAR_DETECTION = '__MIX_CIRCULAR', STAMP_MARKER = '__~ks_stamped', host = this, TRUE = true, EMPTY = '', Obj = Object, logger = S.getLogger('s/lang'), ObjectCreate = Obj.create, hasEnumBug = !({
  toString: 1}['propertyIsEnumerable']('toString')), enumProperties = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toString', 'toLocaleString', 'valueOf'];
  _$jscoverage['/lang/object.js'].lineData[29]++;
  mix(S, {
  stamp: function(o, readOnly, marker) {
  _$jscoverage['/lang/object.js'].functionData[1]++;
  _$jscoverage['/lang/object.js'].lineData[39]++;
  marker = visit224_39_1(marker || STAMP_MARKER);
  _$jscoverage['/lang/object.js'].lineData[40]++;
  var guid = o[marker];
  _$jscoverage['/lang/object.js'].lineData[41]++;
  if (visit225_41_1(guid)) {
    _$jscoverage['/lang/object.js'].lineData[42]++;
    return guid;
  } else {
    _$jscoverage['/lang/object.js'].lineData[43]++;
    if (visit226_43_1(!readOnly)) {
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
  keys: visit227_61_1(Obj.keys || function(o) {
  _$jscoverage['/lang/object.js'].functionData[2]++;
  _$jscoverage['/lang/object.js'].lineData[62]++;
  var result = [], p, i;
  _$jscoverage['/lang/object.js'].lineData[64]++;
  for (p in o) {
    _$jscoverage['/lang/object.js'].lineData[66]++;
    if (visit228_66_1(o.hasOwnProperty(p))) {
      _$jscoverage['/lang/object.js'].lineData[67]++;
      result.push(p);
    }
  }
  _$jscoverage['/lang/object.js'].lineData[71]++;
  if (visit229_71_1(hasEnumBug)) {
    _$jscoverage['/lang/object.js'].lineData[72]++;
    for (i = enumProperties.length - 1; visit230_72_1(i >= 0); i--) {
      _$jscoverage['/lang/object.js'].lineData[73]++;
      p = enumProperties[i];
      _$jscoverage['/lang/object.js'].lineData[74]++;
      if (visit231_74_1(o.hasOwnProperty(p))) {
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
  if (visit232_106_1(typeof ov === 'object')) {
    _$jscoverage['/lang/object.js'].lineData[107]++;
    wl = ov['whitelist'];
    _$jscoverage['/lang/object.js'].lineData[111]++;
    deep = ov['deep'];
    _$jscoverage['/lang/object.js'].lineData[112]++;
    ov = ov['overwrite'];
  }
  _$jscoverage['/lang/object.js'].lineData[115]++;
  if (visit233_115_1(wl && (visit234_115_2(typeof wl !== 'function')))) {
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
  if (visit235_122_1(ov === undefined)) {
    _$jscoverage['/lang/object.js'].lineData[123]++;
    ov = TRUE;
  }
  _$jscoverage['/lang/object.js'].lineData[126]++;
  var cache = [], c, i = 0;
  _$jscoverage['/lang/object.js'].lineData[129]++;
  mixInternal(r, s, ov, wl, deep, cache);
  _$jscoverage['/lang/object.js'].lineData[130]++;
  while (c = cache[i++]) {
    _$jscoverage['/lang/object.js'].lineData[131]++;
    delete c[MIX_CIRCULAR_DETECTION];
  }
  _$jscoverage['/lang/object.js'].lineData[133]++;
  return r;
}, 
  merge: function(var_args) {
  _$jscoverage['/lang/object.js'].functionData[5]++;
  _$jscoverage['/lang/object.js'].lineData[146]++;
  var_args = S.makeArray(arguments);
  _$jscoverage['/lang/object.js'].lineData[147]++;
  var o = {}, i, l = var_args.length;
  _$jscoverage['/lang/object.js'].lineData[150]++;
  for (i = 0; visit236_150_1(i < l); i++) {
    _$jscoverage['/lang/object.js'].lineData[151]++;
    S.mix(o, var_args[i]);
  }
  _$jscoverage['/lang/object.js'].lineData[153]++;
  return o;
}, 
  augment: function(r, var_args) {
  _$jscoverage['/lang/object.js'].functionData[6]++;
  _$jscoverage['/lang/object.js'].lineData[166]++;
  var args = S.makeArray(arguments), len = args.length - 2, i = 1, proto, arg, ov = args[len], wl = args[len + 1];
  _$jscoverage['/lang/object.js'].lineData[174]++;
  if (visit237_174_1(!S.isArray(wl))) {
    _$jscoverage['/lang/object.js'].lineData[175]++;
    ov = wl;
    _$jscoverage['/lang/object.js'].lineData[176]++;
    wl = undefined;
    _$jscoverage['/lang/object.js'].lineData[177]++;
    len++;
  }
  _$jscoverage['/lang/object.js'].lineData[179]++;
  if (visit238_179_1(typeof ov !== 'boolean')) {
    _$jscoverage['/lang/object.js'].lineData[180]++;
    ov = undefined;
    _$jscoverage['/lang/object.js'].lineData[181]++;
    len++;
  }
  _$jscoverage['/lang/object.js'].lineData[184]++;
  for (; visit239_184_1(i < len); i++) {
    _$jscoverage['/lang/object.js'].lineData[185]++;
    arg = args[i];
    _$jscoverage['/lang/object.js'].lineData[186]++;
    if (visit240_186_1(proto = arg.prototype)) {
      _$jscoverage['/lang/object.js'].lineData[187]++;
      arg = S.mix({}, proto, true, removeConstructor);
    }
    _$jscoverage['/lang/object.js'].lineData[189]++;
    S.mix(r.prototype, arg, ov, wl);
  }
  _$jscoverage['/lang/object.js'].lineData[192]++;
  return r;
}, 
  extend: function(r, s, px, sx) {
  _$jscoverage['/lang/object.js'].functionData[7]++;
  _$jscoverage['/lang/object.js'].lineData[207]++;
  if (visit241_207_1('@DEBUG@')) {
    _$jscoverage['/lang/object.js'].lineData[208]++;
    if (visit242_208_1(!r)) {
      _$jscoverage['/lang/object.js'].lineData[209]++;
      logger.error('extend r is null');
    }
    _$jscoverage['/lang/object.js'].lineData[211]++;
    if (visit243_211_1(!s)) {
      _$jscoverage['/lang/object.js'].lineData[212]++;
      logger.error('extend s is null');
    }
    _$jscoverage['/lang/object.js'].lineData[214]++;
    if (visit244_214_1(!s || !r)) {
      _$jscoverage['/lang/object.js'].lineData[215]++;
      return r;
    }
  }
  _$jscoverage['/lang/object.js'].lineData[219]++;
  var sp = s.prototype, rp;
  _$jscoverage['/lang/object.js'].lineData[224]++;
  sp.constructor = s;
  _$jscoverage['/lang/object.js'].lineData[227]++;
  rp = createObject(sp, r);
  _$jscoverage['/lang/object.js'].lineData[228]++;
  r.prototype = S.mix(rp, r.prototype);
  _$jscoverage['/lang/object.js'].lineData[229]++;
  r.superclass = sp;
  _$jscoverage['/lang/object.js'].lineData[232]++;
  if (visit245_232_1(px)) {
    _$jscoverage['/lang/object.js'].lineData[233]++;
    S.mix(rp, px);
  }
  _$jscoverage['/lang/object.js'].lineData[237]++;
  if (visit246_237_1(sx)) {
    _$jscoverage['/lang/object.js'].lineData[238]++;
    S.mix(r, sx);
  }
  _$jscoverage['/lang/object.js'].lineData[241]++;
  return r;
}, 
  namespace: function() {
  _$jscoverage['/lang/object.js'].functionData[8]++;
  _$jscoverage['/lang/object.js'].lineData[259]++;
  var args = S.makeArray(arguments), l = args.length, o = null, i, j, p, global = (visit247_262_1(visit248_262_2(args[l - 1] === TRUE) && l--));
  _$jscoverage['/lang/object.js'].lineData[264]++;
  for (i = 0; visit249_264_1(i < l); i++) {
    _$jscoverage['/lang/object.js'].lineData[265]++;
    p = (EMPTY + args[i]).split('.');
    _$jscoverage['/lang/object.js'].lineData[266]++;
    o = global ? host : this;
    _$jscoverage['/lang/object.js'].lineData[267]++;
    for (j = (visit250_267_1(host[p[0]] === o)) ? 1 : 0; visit251_267_2(j < p.length); ++j) {
      _$jscoverage['/lang/object.js'].lineData[268]++;
      o = o[p[j]] = visit252_268_1(o[p[j]] || {});
    }
  }
  _$jscoverage['/lang/object.js'].lineData[271]++;
  return o;
}});
  _$jscoverage['/lang/object.js'].lineData[276]++;
  function Empty() {
    _$jscoverage['/lang/object.js'].functionData[9]++;
  }
  _$jscoverage['/lang/object.js'].lineData[279]++;
  function createObject(proto, constructor) {
    _$jscoverage['/lang/object.js'].functionData[10]++;
    _$jscoverage['/lang/object.js'].lineData[280]++;
    var newProto;
    _$jscoverage['/lang/object.js'].lineData[281]++;
    if (visit253_281_1(ObjectCreate)) {
      _$jscoverage['/lang/object.js'].lineData[282]++;
      newProto = ObjectCreate(proto);
    } else {
      _$jscoverage['/lang/object.js'].lineData[284]++;
      Empty.prototype = proto;
      _$jscoverage['/lang/object.js'].lineData[285]++;
      newProto = new Empty();
    }
    _$jscoverage['/lang/object.js'].lineData[287]++;
    newProto.constructor = constructor;
    _$jscoverage['/lang/object.js'].lineData[288]++;
    return newProto;
  }
  _$jscoverage['/lang/object.js'].lineData[291]++;
  function mix(r, s) {
    _$jscoverage['/lang/object.js'].functionData[11]++;
    _$jscoverage['/lang/object.js'].lineData[292]++;
    for (var i in s) {
      _$jscoverage['/lang/object.js'].lineData[293]++;
      r[i] = s[i];
    }
  }
  _$jscoverage['/lang/object.js'].lineData[297]++;
  function mixInternal(r, s, ov, wl, deep, cache) {
    _$jscoverage['/lang/object.js'].functionData[12]++;
    _$jscoverage['/lang/object.js'].lineData[298]++;
    if (visit254_298_1(!s || !r)) {
      _$jscoverage['/lang/object.js'].lineData[299]++;
      return r;
    }
    _$jscoverage['/lang/object.js'].lineData[301]++;
    var i, p, keys, len;
    _$jscoverage['/lang/object.js'].lineData[304]++;
    s[MIX_CIRCULAR_DETECTION] = r;
    _$jscoverage['/lang/object.js'].lineData[307]++;
    cache.push(s);
    _$jscoverage['/lang/object.js'].lineData[310]++;
    keys = S.keys(s);
    _$jscoverage['/lang/object.js'].lineData[311]++;
    len = keys.length;
    _$jscoverage['/lang/object.js'].lineData[312]++;
    for (i = 0; visit255_312_1(i < len); i++) {
      _$jscoverage['/lang/object.js'].lineData[313]++;
      p = keys[i];
      _$jscoverage['/lang/object.js'].lineData[314]++;
      if (visit256_314_1(p != MIX_CIRCULAR_DETECTION)) {
        _$jscoverage['/lang/object.js'].lineData[316]++;
        _mix(p, r, s, ov, wl, deep, cache);
      }
    }
    _$jscoverage['/lang/object.js'].lineData[320]++;
    return r;
  }
  _$jscoverage['/lang/object.js'].lineData[323]++;
  function removeConstructor(k, v) {
    _$jscoverage['/lang/object.js'].functionData[13]++;
    _$jscoverage['/lang/object.js'].lineData[324]++;
    return visit257_324_1(k == 'constructor') ? undefined : v;
  }
  _$jscoverage['/lang/object.js'].lineData[327]++;
  function _mix(p, r, s, ov, wl, deep, cache) {
    _$jscoverage['/lang/object.js'].functionData[14]++;
    _$jscoverage['/lang/object.js'].lineData[331]++;
    if (visit258_331_1(ov || visit259_331_2(!(p in r) || deep))) {
      _$jscoverage['/lang/object.js'].lineData[332]++;
      var target = r[p], src = s[p];
      _$jscoverage['/lang/object.js'].lineData[335]++;
      if (visit260_335_1(target === src)) {
        _$jscoverage['/lang/object.js'].lineData[337]++;
        if (visit261_337_1(target === undefined)) {
          _$jscoverage['/lang/object.js'].lineData[338]++;
          r[p] = target;
        }
        _$jscoverage['/lang/object.js'].lineData[340]++;
        return;
      }
      _$jscoverage['/lang/object.js'].lineData[342]++;
      if (visit262_342_1(wl)) {
        _$jscoverage['/lang/object.js'].lineData[343]++;
        src = wl.call(s, p, src);
      }
      _$jscoverage['/lang/object.js'].lineData[346]++;
      if (visit263_346_1(deep && visit264_346_2(src && (visit265_346_3(S.isArray(src) || S.isPlainObject(src)))))) {
        _$jscoverage['/lang/object.js'].lineData[347]++;
        if (visit266_347_1(src[MIX_CIRCULAR_DETECTION])) {
          _$jscoverage['/lang/object.js'].lineData[348]++;
          r[p] = src[MIX_CIRCULAR_DETECTION];
        } else {
          _$jscoverage['/lang/object.js'].lineData[352]++;
          var clone = visit267_352_1(target && (visit268_352_2(S.isArray(target) || S.isPlainObject(target)))) ? target : (S.isArray(src) ? [] : {});
          _$jscoverage['/lang/object.js'].lineData[355]++;
          r[p] = clone;
          _$jscoverage['/lang/object.js'].lineData[356]++;
          mixInternal(clone, src, ov, wl, TRUE, cache);
        }
      } else {
        _$jscoverage['/lang/object.js'].lineData[358]++;
        if (visit269_358_1(visit270_358_2(src !== undefined) && (visit271_358_3(ov || !(p in r))))) {
          _$jscoverage['/lang/object.js'].lineData[359]++;
          r[p] = src;
        }
      }
    }
  }
})(KISSY);
