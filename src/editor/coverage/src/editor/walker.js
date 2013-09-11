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
if (! _$jscoverage['/editor/walker.js']) {
  _$jscoverage['/editor/walker.js'] = {};
  _$jscoverage['/editor/walker.js'].lineData = [];
  _$jscoverage['/editor/walker.js'].lineData[11] = 0;
  _$jscoverage['/editor/walker.js'].lineData[12] = 0;
  _$jscoverage['/editor/walker.js'].lineData[21] = 0;
  _$jscoverage['/editor/walker.js'].lineData[22] = 0;
  _$jscoverage['/editor/walker.js'].lineData[24] = 0;
  _$jscoverage['/editor/walker.js'].lineData[25] = 0;
  _$jscoverage['/editor/walker.js'].lineData[27] = 0;
  _$jscoverage['/editor/walker.js'].lineData[36] = 0;
  _$jscoverage['/editor/walker.js'].lineData[37] = 0;
  _$jscoverage['/editor/walker.js'].lineData[41] = 0;
  _$jscoverage['/editor/walker.js'].lineData[44] = 0;
  _$jscoverage['/editor/walker.js'].lineData[45] = 0;
  _$jscoverage['/editor/walker.js'].lineData[46] = 0;
  _$jscoverage['/editor/walker.js'].lineData[51] = 0;
  _$jscoverage['/editor/walker.js'].lineData[53] = 0;
  _$jscoverage['/editor/walker.js'].lineData[56] = 0;
  _$jscoverage['/editor/walker.js'].lineData[58] = 0;
  _$jscoverage['/editor/walker.js'].lineData[59] = 0;
  _$jscoverage['/editor/walker.js'].lineData[63] = 0;
  _$jscoverage['/editor/walker.js'].lineData[69] = 0;
  _$jscoverage['/editor/walker.js'].lineData[71] = 0;
  _$jscoverage['/editor/walker.js'].lineData[75] = 0;
  _$jscoverage['/editor/walker.js'].lineData[77] = 0;
  _$jscoverage['/editor/walker.js'].lineData[78] = 0;
  _$jscoverage['/editor/walker.js'].lineData[82] = 0;
  _$jscoverage['/editor/walker.js'].lineData[87] = 0;
  _$jscoverage['/editor/walker.js'].lineData[91] = 0;
  _$jscoverage['/editor/walker.js'].lineData[92] = 0;
  _$jscoverage['/editor/walker.js'].lineData[93] = 0;
  _$jscoverage['/editor/walker.js'].lineData[94] = 0;
  _$jscoverage['/editor/walker.js'].lineData[96] = 0;
  _$jscoverage['/editor/walker.js'].lineData[100] = 0;
  _$jscoverage['/editor/walker.js'].lineData[103] = 0;
  _$jscoverage['/editor/walker.js'].lineData[104] = 0;
  _$jscoverage['/editor/walker.js'].lineData[108] = 0;
  _$jscoverage['/editor/walker.js'].lineData[109] = 0;
  _$jscoverage['/editor/walker.js'].lineData[110] = 0;
  _$jscoverage['/editor/walker.js'].lineData[111] = 0;
  _$jscoverage['/editor/walker.js'].lineData[112] = 0;
  _$jscoverage['/editor/walker.js'].lineData[113] = 0;
  _$jscoverage['/editor/walker.js'].lineData[116] = 0;
  _$jscoverage['/editor/walker.js'].lineData[121] = 0;
  _$jscoverage['/editor/walker.js'].lineData[122] = 0;
  _$jscoverage['/editor/walker.js'].lineData[124] = 0;
  _$jscoverage['/editor/walker.js'].lineData[125] = 0;
  _$jscoverage['/editor/walker.js'].lineData[126] = 0;
  _$jscoverage['/editor/walker.js'].lineData[129] = 0;
  _$jscoverage['/editor/walker.js'].lineData[135] = 0;
  _$jscoverage['/editor/walker.js'].lineData[136] = 0;
  _$jscoverage['/editor/walker.js'].lineData[137] = 0;
  _$jscoverage['/editor/walker.js'].lineData[138] = 0;
  _$jscoverage['/editor/walker.js'].lineData[139] = 0;
  _$jscoverage['/editor/walker.js'].lineData[141] = 0;
  _$jscoverage['/editor/walker.js'].lineData[142] = 0;
  _$jscoverage['/editor/walker.js'].lineData[144] = 0;
  _$jscoverage['/editor/walker.js'].lineData[147] = 0;
  _$jscoverage['/editor/walker.js'].lineData[148] = 0;
  _$jscoverage['/editor/walker.js'].lineData[151] = 0;
  _$jscoverage['/editor/walker.js'].lineData[152] = 0;
  _$jscoverage['/editor/walker.js'].lineData[154] = 0;
  _$jscoverage['/editor/walker.js'].lineData[155] = 0;
  _$jscoverage['/editor/walker.js'].lineData[157] = 0;
  _$jscoverage['/editor/walker.js'].lineData[165] = 0;
  _$jscoverage['/editor/walker.js'].lineData[166] = 0;
  _$jscoverage['/editor/walker.js'].lineData[176] = 0;
  _$jscoverage['/editor/walker.js'].lineData[187] = 0;
  _$jscoverage['/editor/walker.js'].lineData[191] = 0;
  _$jscoverage['/editor/walker.js'].lineData[195] = 0;
  _$jscoverage['/editor/walker.js'].lineData[201] = 0;
  _$jscoverage['/editor/walker.js'].lineData[210] = 0;
  _$jscoverage['/editor/walker.js'].lineData[219] = 0;
  _$jscoverage['/editor/walker.js'].lineData[228] = 0;
  _$jscoverage['/editor/walker.js'].lineData[239] = 0;
  _$jscoverage['/editor/walker.js'].lineData[249] = 0;
  _$jscoverage['/editor/walker.js'].lineData[259] = 0;
  _$jscoverage['/editor/walker.js'].lineData[263] = 0;
  _$jscoverage['/editor/walker.js'].lineData[264] = 0;
  _$jscoverage['/editor/walker.js'].lineData[273] = 0;
  _$jscoverage['/editor/walker.js'].lineData[280] = 0;
  _$jscoverage['/editor/walker.js'].lineData[281] = 0;
  _$jscoverage['/editor/walker.js'].lineData[296] = 0;
  _$jscoverage['/editor/walker.js'].lineData[297] = 0;
  _$jscoverage['/editor/walker.js'].lineData[301] = 0;
  _$jscoverage['/editor/walker.js'].lineData[302] = 0;
  _$jscoverage['/editor/walker.js'].lineData[304] = 0;
  _$jscoverage['/editor/walker.js'].lineData[308] = 0;
  _$jscoverage['/editor/walker.js'].lineData[311] = 0;
  _$jscoverage['/editor/walker.js'].lineData[320] = 0;
  _$jscoverage['/editor/walker.js'].lineData[321] = 0;
  _$jscoverage['/editor/walker.js'].lineData[323] = 0;
  _$jscoverage['/editor/walker.js'].lineData[331] = 0;
  _$jscoverage['/editor/walker.js'].lineData[332] = 0;
  _$jscoverage['/editor/walker.js'].lineData[338] = 0;
  _$jscoverage['/editor/walker.js'].lineData[340] = 0;
  _$jscoverage['/editor/walker.js'].lineData[345] = 0;
  _$jscoverage['/editor/walker.js'].lineData[349] = 0;
  _$jscoverage['/editor/walker.js'].lineData[350] = 0;
  _$jscoverage['/editor/walker.js'].lineData[358] = 0;
  _$jscoverage['/editor/walker.js'].lineData[360] = 0;
  _$jscoverage['/editor/walker.js'].lineData[361] = 0;
  _$jscoverage['/editor/walker.js'].lineData[364] = 0;
  _$jscoverage['/editor/walker.js'].lineData[366] = 0;
  _$jscoverage['/editor/walker.js'].lineData[368] = 0;
  _$jscoverage['/editor/walker.js'].lineData[371] = 0;
  _$jscoverage['/editor/walker.js'].lineData[373] = 0;
  _$jscoverage['/editor/walker.js'].lineData[377] = 0;
  _$jscoverage['/editor/walker.js'].lineData[379] = 0;
}
if (! _$jscoverage['/editor/walker.js'].functionData) {
  _$jscoverage['/editor/walker.js'].functionData = [];
  _$jscoverage['/editor/walker.js'].functionData[0] = 0;
  _$jscoverage['/editor/walker.js'].functionData[1] = 0;
  _$jscoverage['/editor/walker.js'].functionData[2] = 0;
  _$jscoverage['/editor/walker.js'].functionData[3] = 0;
  _$jscoverage['/editor/walker.js'].functionData[4] = 0;
  _$jscoverage['/editor/walker.js'].functionData[5] = 0;
  _$jscoverage['/editor/walker.js'].functionData[6] = 0;
  _$jscoverage['/editor/walker.js'].functionData[7] = 0;
  _$jscoverage['/editor/walker.js'].functionData[8] = 0;
  _$jscoverage['/editor/walker.js'].functionData[9] = 0;
  _$jscoverage['/editor/walker.js'].functionData[10] = 0;
  _$jscoverage['/editor/walker.js'].functionData[11] = 0;
  _$jscoverage['/editor/walker.js'].functionData[12] = 0;
  _$jscoverage['/editor/walker.js'].functionData[13] = 0;
  _$jscoverage['/editor/walker.js'].functionData[14] = 0;
  _$jscoverage['/editor/walker.js'].functionData[15] = 0;
  _$jscoverage['/editor/walker.js'].functionData[16] = 0;
  _$jscoverage['/editor/walker.js'].functionData[17] = 0;
  _$jscoverage['/editor/walker.js'].functionData[18] = 0;
  _$jscoverage['/editor/walker.js'].functionData[19] = 0;
  _$jscoverage['/editor/walker.js'].functionData[20] = 0;
  _$jscoverage['/editor/walker.js'].functionData[21] = 0;
  _$jscoverage['/editor/walker.js'].functionData[22] = 0;
  _$jscoverage['/editor/walker.js'].functionData[23] = 0;
  _$jscoverage['/editor/walker.js'].functionData[24] = 0;
  _$jscoverage['/editor/walker.js'].functionData[25] = 0;
  _$jscoverage['/editor/walker.js'].functionData[26] = 0;
}
if (! _$jscoverage['/editor/walker.js'].branchData) {
  _$jscoverage['/editor/walker.js'].branchData = {};
  _$jscoverage['/editor/walker.js'].branchData['24'] = [];
  _$jscoverage['/editor/walker.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['36'] = [];
  _$jscoverage['/editor/walker.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['44'] = [];
  _$jscoverage['/editor/walker.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['51'] = [];
  _$jscoverage['/editor/walker.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['58'] = [];
  _$jscoverage['/editor/walker.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['58'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['58'][3] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['58'][4] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['63'] = [];
  _$jscoverage['/editor/walker.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['69'] = [];
  _$jscoverage['/editor/walker.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['72'] = [];
  _$jscoverage['/editor/walker.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['72'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['72'][3] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['77'] = [];
  _$jscoverage['/editor/walker.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['77'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['77'][3] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['77'][4] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['82'] = [];
  _$jscoverage['/editor/walker.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['91'] = [];
  _$jscoverage['/editor/walker.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['93'] = [];
  _$jscoverage['/editor/walker.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['103'] = [];
  _$jscoverage['/editor/walker.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['108'] = [];
  _$jscoverage['/editor/walker.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['110'] = [];
  _$jscoverage['/editor/walker.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['112'] = [];
  _$jscoverage['/editor/walker.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['116'] = [];
  _$jscoverage['/editor/walker.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['124'] = [];
  _$jscoverage['/editor/walker.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['125'] = [];
  _$jscoverage['/editor/walker.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['129'] = [];
  _$jscoverage['/editor/walker.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['135'] = [];
  _$jscoverage['/editor/walker.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['137'] = [];
  _$jscoverage['/editor/walker.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['137'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['138'] = [];
  _$jscoverage['/editor/walker.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['141'] = [];
  _$jscoverage['/editor/walker.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['228'] = [];
  _$jscoverage['/editor/walker.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['239'] = [];
  _$jscoverage['/editor/walker.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['281'] = [];
  _$jscoverage['/editor/walker.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['281'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['297'] = [];
  _$jscoverage['/editor/walker.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['297'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['304'] = [];
  _$jscoverage['/editor/walker.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['304'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['305'] = [];
  _$jscoverage['/editor/walker.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['308'] = [];
  _$jscoverage['/editor/walker.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['321'] = [];
  _$jscoverage['/editor/walker.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['321'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['338'] = [];
  _$jscoverage['/editor/walker.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['339'] = [];
  _$jscoverage['/editor/walker.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['339'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['350'] = [];
  _$jscoverage['/editor/walker.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['351'] = [];
  _$jscoverage['/editor/walker.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['352'] = [];
  _$jscoverage['/editor/walker.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['352'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['353'] = [];
  _$jscoverage['/editor/walker.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['362'] = [];
  _$jscoverage['/editor/walker.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['364'] = [];
  _$jscoverage['/editor/walker.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['364'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['365'] = [];
  _$jscoverage['/editor/walker.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['365'][2] = new BranchData();
}
_$jscoverage['/editor/walker.js'].branchData['365'][2].init(48, 21, 'tail[0].nodeType == 3');
function visit1136_365_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['365'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['365'][1].init(47, 56, 'tail[0].nodeType == 3 && tailNbspRegex.test(tail.text())');
function visit1135_365_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['364'][2].init(219, 23, 'tail.nodeName() == "br"');
function visit1134_364_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['364'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['364'][1].init(200, 116, 'tail && (!UA.ie ? tail.nodeName() == "br" : tail[0].nodeType == 3 && tailNbspRegex.test(tail.text()))');
function visit1133_364_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['362'][1].init(73, 23, 'tail && toSkip(tail[0])');
function visit1132_362_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['353'][1].init(42, 67, 'name in dtd.$inline && !(name in dtd.$empty)');
function visit1131_353_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['352'][2].init(145, 18, 'node.nodeType == 1');
function visit1130_352_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['352'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['352'][1].init(39, 110, 'node.nodeType == 1 && name in dtd.$inline && !(name in dtd.$empty)');
function visit1129_352_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['351'][1].init(36, 150, 'isWhitespaces(node) || node.nodeType == 1 && name in dtd.$inline && !(name in dtd.$empty)');
function visit1128_351_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['350'][1].init(65, 187, 'isBookmark(node) || isWhitespaces(node) || node.nodeType == 1 && name in dtd.$inline && !(name in dtd.$empty)');
function visit1127_350_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['339'][2].init(64, 42, 'node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1126_339_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['339'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['339'][1].init(44, 64, 'node.nodeType == Dom.NodeType.ELEMENT_NODE && !node.offsetHeight');
function visit1125_339_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['338'][1].init(403, 109, 'whitespace(node) || node.nodeType == Dom.NodeType.ELEMENT_NODE && !node.offsetHeight');
function visit1124_338_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['321'][2].init(41, 39, 'node.nodeType == Dom.NodeType.TEXT_NODE');
function visit1123_321_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['321'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['321'][1].init(41, 91, 'node.nodeType == Dom.NodeType.TEXT_NODE && !S.trim(node.nodeValue)');
function visit1122_321_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['308'][1].init(389, 34, 'isBookmark || isBookmarkNode(node)');
function visit1121_308_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['305'][1].init(69, 77, '(parent = node.parentNode) && isBookmarkNode(parent)');
function visit1120_305_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['304'][2].init(135, 39, 'node.nodeType == Dom.NodeType.TEXT_NODE');
function visit1119_304_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['304'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['304'][1].init(135, 147, 'node.nodeType == Dom.NodeType.TEXT_NODE && (parent = node.parentNode) && isBookmarkNode(parent)');
function visit1118_304_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['297'][2].init(30, 28, 'Dom.nodeName(node) == \'span\'');
function visit1117_297_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['297'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['297'][1].init(30, 87, 'Dom.nodeName(node) == \'span\' && Dom.attr(node, \'_ke_bookmark\')');
function visit1116_297_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['281'][2].init(31, 42, 'node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1115_281_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['281'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['281'][1].init(31, 117, 'node.nodeType == Dom.NodeType.ELEMENT_NODE && Dom._4e_isBlockBoundary(node, customNodeNames)');
function visit1114_281_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['239'][1].init(86, 40, 'iterate.call(this, TRUE, TRUE) !== FALSE');
function visit1113_239_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['228'][1].init(25, 41, 'iterate.call(this, FALSE, TRUE) !== FALSE');
function visit1112_228_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['141'][1].init(232, 38, 'breakOnFalseRetFalse && self.evaluator');
function visit1111_141_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['138'][1].init(22, 21, '!breakOnFalseRetFalse');
function visit1110_138_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['137'][2].init(71, 33, 'self.evaluator(node[0]) !== FALSE');
function visit1109_137_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['137'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['137'][1].init(52, 52, '!self.evaluator || self.evaluator(node[0]) !== FALSE');
function visit1108_137_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['135'][1].init(4166, 19, 'node && !self._.end');
function visit1107_135_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['129'][1].init(31, 43, 'guard(range.startContainer, TRUE) === FALSE');
function visit1106_129_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['125'][1].init(26, 24, 'guard(node[0]) === FALSE');
function visit1105_125_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['124'][1].init(143, 11, 'node.length');
function visit1104_124_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['116'][1].init(31, 27, 'guard(node, TRUE) === FALSE');
function visit1103_116_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['112'][1].init(105, 24, 'guard(node[0]) === FALSE');
function visit1102_112_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['110'][1].init(66, 19, 'range.endOffset > 0');
function visit1101_110_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['108'][1].init(71, 3, 'rtl');
function visit1100_108_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['103'][1].init(2927, 12, 'self.current');
function visit1099_103_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['93'][1].init(22, 36, 'stopGuard(node, movingOut) === FALSE');
function visit1098_93_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['91'][1].init(2596, 9, 'userGuard');
function visit1097_91_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['82'][1].init(293, 18, 'node != blockerRTL');
function visit1096_82_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['77'][4].init(103, 28, 'Dom.nodeName(node) == "body"');
function visit1095_77_4(result) {
  _$jscoverage['/editor/walker.js'].branchData['77'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['77'][3].init(83, 16, 'limitRTL == node');
function visit1094_77_3(result) {
  _$jscoverage['/editor/walker.js'].branchData['77'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['77'][2].init(83, 48, 'limitRTL == node || Dom.nodeName(node) == "body"');
function visit1093_77_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['77'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['77'][1].init(69, 63, 'movingOut && (limitRTL == node || Dom.nodeName(node) == "body")');
function visit1092_77_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['72'][3].init(71, 21, 'range.startOffset > 0');
function visit1091_72_3(result) {
  _$jscoverage['/editor/walker.js'].branchData['72'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['72'][2].init(71, 90, '(range.startOffset > 0) && limitRTL.childNodes[range.startOffset - 1]');
function visit1090_72_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['72'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['72'][1].init(71, 98, '(range.startOffset > 0) && limitRTL.childNodes[range.startOffset - 1] || null');
function visit1089_72_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['69'][1].init(1654, 23, 'rtl && !self._.guardRTL');
function visit1088_69_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['63'][1].init(293, 18, 'node != blockerLTR');
function visit1087_63_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['58'][4].init(103, 28, 'Dom.nodeName(node) == "body"');
function visit1086_58_4(result) {
  _$jscoverage['/editor/walker.js'].branchData['58'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['58'][3].init(83, 16, 'limitLTR == node');
function visit1085_58_3(result) {
  _$jscoverage['/editor/walker.js'].branchData['58'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['58'][2].init(83, 48, 'limitLTR == node || Dom.nodeName(node) == "body"');
function visit1084_58_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['58'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['58'][1].init(69, 63, 'movingOut && (limitLTR == node || Dom.nodeName(node) == "body")');
function visit1083_58_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['51'][1].init(915, 24, '!rtl && !self._.guardLTR');
function visit1082_51_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['44'][1].init(267, 15, 'range.collapsed');
function visit1081_44_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['36'][1].init(456, 13, '!self._.start');
function visit1080_36_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['24'][1].init(92, 10, 'self._.end');
function visit1079_24_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].lineData[11]++;
KISSY.add("editor/walker", function(S, Editor) {
  _$jscoverage['/editor/walker.js'].functionData[0]++;
  _$jscoverage['/editor/walker.js'].lineData[12]++;
  var TRUE = true, FALSE = false, NULL = null, UA = S.UA, Dom = S.DOM, dtd = Editor.XHTML_DTD, Node = S.Node;
  _$jscoverage['/editor/walker.js'].lineData[21]++;
  function iterate(rtl, breakOnFalseRetFalse) {
    _$jscoverage['/editor/walker.js'].functionData[1]++;
    _$jscoverage['/editor/walker.js'].lineData[22]++;
    var self = this;
    _$jscoverage['/editor/walker.js'].lineData[24]++;
    if (visit1079_24_1(self._.end)) {
      _$jscoverage['/editor/walker.js'].lineData[25]++;
      return NULL;
    }
    _$jscoverage['/editor/walker.js'].lineData[27]++;
    var node, range = self.range, guard, userGuard = self.guard, type = self.type, getSourceNodeFn = (rtl ? '_4e_previousSourceNode' : '_4e_nextSourceNode');
    _$jscoverage['/editor/walker.js'].lineData[36]++;
    if (visit1080_36_1(!self._.start)) {
      _$jscoverage['/editor/walker.js'].lineData[37]++;
      self._.start = 1;
      _$jscoverage['/editor/walker.js'].lineData[41]++;
      range.trim();
      _$jscoverage['/editor/walker.js'].lineData[44]++;
      if (visit1081_44_1(range.collapsed)) {
        _$jscoverage['/editor/walker.js'].lineData[45]++;
        self.end();
        _$jscoverage['/editor/walker.js'].lineData[46]++;
        return NULL;
      }
    }
    _$jscoverage['/editor/walker.js'].lineData[51]++;
    if (visit1082_51_1(!rtl && !self._.guardLTR)) {
      _$jscoverage['/editor/walker.js'].lineData[53]++;
      var limitLTR = range.endContainer[0], blockerLTR = limitLTR.childNodes[range.endOffset];
      _$jscoverage['/editor/walker.js'].lineData[56]++;
      this._.guardLTR = function(node, movingOut) {
  _$jscoverage['/editor/walker.js'].functionData[2]++;
  _$jscoverage['/editor/walker.js'].lineData[58]++;
  if (visit1083_58_1(movingOut && (visit1084_58_2(visit1085_58_3(limitLTR == node) || visit1086_58_4(Dom.nodeName(node) == "body"))))) {
    _$jscoverage['/editor/walker.js'].lineData[59]++;
    return false;
  }
  _$jscoverage['/editor/walker.js'].lineData[63]++;
  return visit1087_63_1(node != blockerLTR);
};
    }
    _$jscoverage['/editor/walker.js'].lineData[69]++;
    if (visit1088_69_1(rtl && !self._.guardRTL)) {
      _$jscoverage['/editor/walker.js'].lineData[71]++;
      var limitRTL = range.startContainer[0], blockerRTL = visit1089_72_1(visit1090_72_2((visit1091_72_3(range.startOffset > 0)) && limitRTL.childNodes[range.startOffset - 1]) || null);
      _$jscoverage['/editor/walker.js'].lineData[75]++;
      self._.guardRTL = function(node, movingOut) {
  _$jscoverage['/editor/walker.js'].functionData[3]++;
  _$jscoverage['/editor/walker.js'].lineData[77]++;
  if (visit1092_77_1(movingOut && (visit1093_77_2(visit1094_77_3(limitRTL == node) || visit1095_77_4(Dom.nodeName(node) == "body"))))) {
    _$jscoverage['/editor/walker.js'].lineData[78]++;
    return false;
  }
  _$jscoverage['/editor/walker.js'].lineData[82]++;
  return visit1096_82_1(node != blockerRTL);
};
    }
    _$jscoverage['/editor/walker.js'].lineData[87]++;
    var stopGuard = rtl ? self._.guardRTL : self._.guardLTR;
    _$jscoverage['/editor/walker.js'].lineData[91]++;
    if (visit1097_91_1(userGuard)) {
      _$jscoverage['/editor/walker.js'].lineData[92]++;
      guard = function(node, movingOut) {
  _$jscoverage['/editor/walker.js'].functionData[4]++;
  _$jscoverage['/editor/walker.js'].lineData[93]++;
  if (visit1098_93_1(stopGuard(node, movingOut) === FALSE)) {
    _$jscoverage['/editor/walker.js'].lineData[94]++;
    return FALSE;
  }
  _$jscoverage['/editor/walker.js'].lineData[96]++;
  return userGuard(node, movingOut);
};
    } else {
      _$jscoverage['/editor/walker.js'].lineData[100]++;
      guard = stopGuard;
    }
    _$jscoverage['/editor/walker.js'].lineData[103]++;
    if (visit1099_103_1(self.current)) {
      _$jscoverage['/editor/walker.js'].lineData[104]++;
      node = this.current[getSourceNodeFn](FALSE, type, guard);
    } else {
      _$jscoverage['/editor/walker.js'].lineData[108]++;
      if (visit1100_108_1(rtl)) {
        _$jscoverage['/editor/walker.js'].lineData[109]++;
        node = range.endContainer;
        _$jscoverage['/editor/walker.js'].lineData[110]++;
        if (visit1101_110_1(range.endOffset > 0)) {
          _$jscoverage['/editor/walker.js'].lineData[111]++;
          node = new Node(node[0].childNodes[range.endOffset - 1]);
          _$jscoverage['/editor/walker.js'].lineData[112]++;
          if (visit1102_112_1(guard(node[0]) === FALSE)) {
            _$jscoverage['/editor/walker.js'].lineData[113]++;
            node = NULL;
          }
        } else {
          _$jscoverage['/editor/walker.js'].lineData[116]++;
          node = (visit1103_116_1(guard(node, TRUE) === FALSE)) ? NULL : node._4e_previousSourceNode(TRUE, type, guard, undefined);
        }
      } else {
        _$jscoverage['/editor/walker.js'].lineData[121]++;
        node = range.startContainer;
        _$jscoverage['/editor/walker.js'].lineData[122]++;
        node = new Node(node[0].childNodes[range.startOffset]);
        _$jscoverage['/editor/walker.js'].lineData[124]++;
        if (visit1104_124_1(node.length)) {
          _$jscoverage['/editor/walker.js'].lineData[125]++;
          if (visit1105_125_1(guard(node[0]) === FALSE)) {
            _$jscoverage['/editor/walker.js'].lineData[126]++;
            node = NULL;
          }
        } else {
          _$jscoverage['/editor/walker.js'].lineData[129]++;
          node = (visit1106_129_1(guard(range.startContainer, TRUE) === FALSE)) ? NULL : range.startContainer._4e_nextSourceNode(TRUE, type, guard, undefined);
        }
      }
    }
    _$jscoverage['/editor/walker.js'].lineData[135]++;
    while (visit1107_135_1(node && !self._.end)) {
      _$jscoverage['/editor/walker.js'].lineData[136]++;
      self.current = node;
      _$jscoverage['/editor/walker.js'].lineData[137]++;
      if (visit1108_137_1(!self.evaluator || visit1109_137_2(self.evaluator(node[0]) !== FALSE))) {
        _$jscoverage['/editor/walker.js'].lineData[138]++;
        if (visit1110_138_1(!breakOnFalseRetFalse)) {
          _$jscoverage['/editor/walker.js'].lineData[139]++;
          return node;
        }
      } else {
        _$jscoverage['/editor/walker.js'].lineData[141]++;
        if (visit1111_141_1(breakOnFalseRetFalse && self.evaluator)) {
          _$jscoverage['/editor/walker.js'].lineData[142]++;
          return FALSE;
        }
      }
      _$jscoverage['/editor/walker.js'].lineData[144]++;
      node = node[getSourceNodeFn](FALSE, type, guard);
    }
    _$jscoverage['/editor/walker.js'].lineData[147]++;
    self.end();
    _$jscoverage['/editor/walker.js'].lineData[148]++;
    return self.current = NULL;
  }
  _$jscoverage['/editor/walker.js'].lineData[151]++;
  function iterateToLast(rtl) {
    _$jscoverage['/editor/walker.js'].functionData[5]++;
    _$jscoverage['/editor/walker.js'].lineData[152]++;
    var node, last = NULL;
    _$jscoverage['/editor/walker.js'].lineData[154]++;
    while (node = iterate.call(this, rtl)) {
      _$jscoverage['/editor/walker.js'].lineData[155]++;
      last = node;
    }
    _$jscoverage['/editor/walker.js'].lineData[157]++;
    return last;
  }
  _$jscoverage['/editor/walker.js'].lineData[165]++;
  function Walker(range) {
    _$jscoverage['/editor/walker.js'].functionData[6]++;
    _$jscoverage['/editor/walker.js'].lineData[166]++;
    this.range = range;
    _$jscoverage['/editor/walker.js'].lineData[176]++;
    this.evaluator = NULL;
    _$jscoverage['/editor/walker.js'].lineData[187]++;
    this.guard = NULL;
    _$jscoverage['/editor/walker.js'].lineData[191]++;
    this._ = {};
  }
  _$jscoverage['/editor/walker.js'].lineData[195]++;
  S.augment(Walker, {
  end: function() {
  _$jscoverage['/editor/walker.js'].functionData[7]++;
  _$jscoverage['/editor/walker.js'].lineData[201]++;
  this._.end = 1;
}, 
  next: function() {
  _$jscoverage['/editor/walker.js'].functionData[8]++;
  _$jscoverage['/editor/walker.js'].lineData[210]++;
  return iterate.call(this);
}, 
  previous: function() {
  _$jscoverage['/editor/walker.js'].functionData[9]++;
  _$jscoverage['/editor/walker.js'].lineData[219]++;
  return iterate.call(this, TRUE);
}, 
  checkForward: function() {
  _$jscoverage['/editor/walker.js'].functionData[10]++;
  _$jscoverage['/editor/walker.js'].lineData[228]++;
  return visit1112_228_1(iterate.call(this, FALSE, TRUE) !== FALSE);
}, 
  checkBackward: function() {
  _$jscoverage['/editor/walker.js'].functionData[11]++;
  _$jscoverage['/editor/walker.js'].lineData[239]++;
  return visit1113_239_1(iterate.call(this, TRUE, TRUE) !== FALSE);
}, 
  lastForward: function() {
  _$jscoverage['/editor/walker.js'].functionData[12]++;
  _$jscoverage['/editor/walker.js'].lineData[249]++;
  return iterateToLast.call(this);
}, 
  lastBackward: function() {
  _$jscoverage['/editor/walker.js'].functionData[13]++;
  _$jscoverage['/editor/walker.js'].lineData[259]++;
  return iterateToLast.call(this, TRUE);
}, 
  reset: function() {
  _$jscoverage['/editor/walker.js'].functionData[14]++;
  _$jscoverage['/editor/walker.js'].lineData[263]++;
  delete this.current;
  _$jscoverage['/editor/walker.js'].lineData[264]++;
  this._ = {};
}, 
  _iterator: iterate});
  _$jscoverage['/editor/walker.js'].lineData[273]++;
  S.mix(Walker, {
  blockBoundary: function(customNodeNames) {
  _$jscoverage['/editor/walker.js'].functionData[15]++;
  _$jscoverage['/editor/walker.js'].lineData[280]++;
  return function(node) {
  _$jscoverage['/editor/walker.js'].functionData[16]++;
  _$jscoverage['/editor/walker.js'].lineData[281]++;
  return !(visit1114_281_1(visit1115_281_2(node.nodeType == Dom.NodeType.ELEMENT_NODE) && Dom._4e_isBlockBoundary(node, customNodeNames)));
};
}, 
  bookmark: function(contentOnly, isReject) {
  _$jscoverage['/editor/walker.js'].functionData[17]++;
  _$jscoverage['/editor/walker.js'].lineData[296]++;
  function isBookmarkNode(node) {
    _$jscoverage['/editor/walker.js'].functionData[18]++;
    _$jscoverage['/editor/walker.js'].lineData[297]++;
    return visit1116_297_1(visit1117_297_2(Dom.nodeName(node) == 'span') && Dom.attr(node, '_ke_bookmark'));
  }
  _$jscoverage['/editor/walker.js'].lineData[301]++;
  return function(node) {
  _$jscoverage['/editor/walker.js'].functionData[19]++;
  _$jscoverage['/editor/walker.js'].lineData[302]++;
  var isBookmark, parent;
  _$jscoverage['/editor/walker.js'].lineData[304]++;
  isBookmark = (visit1118_304_1(visit1119_304_2(node.nodeType == Dom.NodeType.TEXT_NODE) && visit1120_305_1((parent = node.parentNode) && isBookmarkNode(parent))));
  _$jscoverage['/editor/walker.js'].lineData[308]++;
  isBookmark = contentOnly ? isBookmark : visit1121_308_1(isBookmark || isBookmarkNode(node));
  _$jscoverage['/editor/walker.js'].lineData[311]++;
  return !!(isReject ^ isBookmark);
};
}, 
  whitespaces: function(isReject) {
  _$jscoverage['/editor/walker.js'].functionData[20]++;
  _$jscoverage['/editor/walker.js'].lineData[320]++;
  return function(node) {
  _$jscoverage['/editor/walker.js'].functionData[21]++;
  _$jscoverage['/editor/walker.js'].lineData[321]++;
  var isWhitespace = visit1122_321_1(visit1123_321_2(node.nodeType == Dom.NodeType.TEXT_NODE) && !S.trim(node.nodeValue));
  _$jscoverage['/editor/walker.js'].lineData[323]++;
  return !!(isReject ^ isWhitespace);
};
}, 
  invisible: function(isReject) {
  _$jscoverage['/editor/walker.js'].functionData[22]++;
  _$jscoverage['/editor/walker.js'].lineData[331]++;
  var whitespace = Walker.whitespaces();
  _$jscoverage['/editor/walker.js'].lineData[332]++;
  return function(node) {
  _$jscoverage['/editor/walker.js'].functionData[23]++;
  _$jscoverage['/editor/walker.js'].lineData[338]++;
  var isInvisible = visit1124_338_1(whitespace(node) || visit1125_339_1(visit1126_339_2(node.nodeType == Dom.NodeType.ELEMENT_NODE) && !node.offsetHeight));
  _$jscoverage['/editor/walker.js'].lineData[340]++;
  return !!(isReject ^ isInvisible);
};
}});
  _$jscoverage['/editor/walker.js'].lineData[345]++;
  var tailNbspRegex = /^[\t\r\n ]*(?:&nbsp;|\xa0)$/, isWhitespaces = Walker.whitespaces(), isBookmark = Walker.bookmark(), toSkip = function(node) {
  _$jscoverage['/editor/walker.js'].functionData[24]++;
  _$jscoverage['/editor/walker.js'].lineData[349]++;
  var name = Dom.nodeName(node);
  _$jscoverage['/editor/walker.js'].lineData[350]++;
  return visit1127_350_1(isBookmark(node) || visit1128_351_1(isWhitespaces(node) || visit1129_352_1(visit1130_352_2(node.nodeType == 1) && visit1131_353_1(name in dtd.$inline && !(name in dtd.$empty)))));
};
  _$jscoverage['/editor/walker.js'].lineData[358]++;
  function getBogus(tail) {
    _$jscoverage['/editor/walker.js'].functionData[25]++;
    _$jscoverage['/editor/walker.js'].lineData[360]++;
    do {
      _$jscoverage['/editor/walker.js'].lineData[361]++;
      tail = tail._4e_previousSourceNode();
    } while (visit1132_362_1(tail && toSkip(tail[0])));
    _$jscoverage['/editor/walker.js'].lineData[364]++;
    if (visit1133_364_1(tail && (!UA.ie ? visit1134_364_2(tail.nodeName() == "br") : visit1135_365_1(visit1136_365_2(tail[0].nodeType == 3) && tailNbspRegex.test(tail.text()))))) {
      _$jscoverage['/editor/walker.js'].lineData[366]++;
      return tail[0];
    }
    _$jscoverage['/editor/walker.js'].lineData[368]++;
    return false;
  }
  _$jscoverage['/editor/walker.js'].lineData[371]++;
  Editor.Utils.injectDom({
  _4e_getBogus: function(el) {
  _$jscoverage['/editor/walker.js'].functionData[26]++;
  _$jscoverage['/editor/walker.js'].lineData[373]++;
  return getBogus(new Node(el));
}});
  _$jscoverage['/editor/walker.js'].lineData[377]++;
  Editor.Walker = Walker;
  _$jscoverage['/editor/walker.js'].lineData[379]++;
  return Walker;
}, {
  requires: ['./base', './utils', './dom', 'node']});
