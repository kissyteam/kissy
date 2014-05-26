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
if (! _$jscoverage['/base/observable.js']) {
  _$jscoverage['/base/observable.js'] = {};
  _$jscoverage['/base/observable.js'].lineData = [];
  _$jscoverage['/base/observable.js'].lineData[6] = 0;
  _$jscoverage['/base/observable.js'].lineData[7] = 0;
  _$jscoverage['/base/observable.js'].lineData[8] = 0;
  _$jscoverage['/base/observable.js'].lineData[9] = 0;
  _$jscoverage['/base/observable.js'].lineData[10] = 0;
  _$jscoverage['/base/observable.js'].lineData[11] = 0;
  _$jscoverage['/base/observable.js'].lineData[12] = 0;
  _$jscoverage['/base/observable.js'].lineData[13] = 0;
  _$jscoverage['/base/observable.js'].lineData[14] = 0;
  _$jscoverage['/base/observable.js'].lineData[16] = 0;
  _$jscoverage['/base/observable.js'].lineData[25] = 0;
  _$jscoverage['/base/observable.js'].lineData[26] = 0;
  _$jscoverage['/base/observable.js'].lineData[27] = 0;
  _$jscoverage['/base/observable.js'].lineData[28] = 0;
  _$jscoverage['/base/observable.js'].lineData[35] = 0;
  _$jscoverage['/base/observable.js'].lineData[37] = 0;
  _$jscoverage['/base/observable.js'].lineData[44] = 0;
  _$jscoverage['/base/observable.js'].lineData[45] = 0;
  _$jscoverage['/base/observable.js'].lineData[52] = 0;
  _$jscoverage['/base/observable.js'].lineData[53] = 0;
  _$jscoverage['/base/observable.js'].lineData[54] = 0;
  _$jscoverage['/base/observable.js'].lineData[55] = 0;
  _$jscoverage['/base/observable.js'].lineData[74] = 0;
  _$jscoverage['/base/observable.js'].lineData[93] = 0;
  _$jscoverage['/base/observable.js'].lineData[94] = 0;
  _$jscoverage['/base/observable.js'].lineData[95] = 0;
  _$jscoverage['/base/observable.js'].lineData[96] = 0;
  _$jscoverage['/base/observable.js'].lineData[98] = 0;
  _$jscoverage['/base/observable.js'].lineData[99] = 0;
  _$jscoverage['/base/observable.js'].lineData[100] = 0;
  _$jscoverage['/base/observable.js'].lineData[101] = 0;
  _$jscoverage['/base/observable.js'].lineData[102] = 0;
  _$jscoverage['/base/observable.js'].lineData[103] = 0;
  _$jscoverage['/base/observable.js'].lineData[104] = 0;
  _$jscoverage['/base/observable.js'].lineData[105] = 0;
  _$jscoverage['/base/observable.js'].lineData[107] = 0;
  _$jscoverage['/base/observable.js'].lineData[108] = 0;
  _$jscoverage['/base/observable.js'].lineData[111] = 0;
  _$jscoverage['/base/observable.js'].lineData[112] = 0;
  _$jscoverage['/base/observable.js'].lineData[118] = 0;
  _$jscoverage['/base/observable.js'].lineData[124] = 0;
  _$jscoverage['/base/observable.js'].lineData[125] = 0;
  _$jscoverage['/base/observable.js'].lineData[135] = 0;
  _$jscoverage['/base/observable.js'].lineData[136] = 0;
  _$jscoverage['/base/observable.js'].lineData[137] = 0;
  _$jscoverage['/base/observable.js'].lineData[138] = 0;
  _$jscoverage['/base/observable.js'].lineData[139] = 0;
  _$jscoverage['/base/observable.js'].lineData[141] = 0;
  _$jscoverage['/base/observable.js'].lineData[142] = 0;
  _$jscoverage['/base/observable.js'].lineData[143] = 0;
  _$jscoverage['/base/observable.js'].lineData[147] = 0;
  _$jscoverage['/base/observable.js'].lineData[148] = 0;
  _$jscoverage['/base/observable.js'].lineData[155] = 0;
  _$jscoverage['/base/observable.js'].lineData[164] = 0;
  _$jscoverage['/base/observable.js'].lineData[166] = 0;
  _$jscoverage['/base/observable.js'].lineData[174] = 0;
  _$jscoverage['/base/observable.js'].lineData[175] = 0;
  _$jscoverage['/base/observable.js'].lineData[178] = 0;
  _$jscoverage['/base/observable.js'].lineData[179] = 0;
  _$jscoverage['/base/observable.js'].lineData[180] = 0;
  _$jscoverage['/base/observable.js'].lineData[183] = 0;
  _$jscoverage['/base/observable.js'].lineData[186] = 0;
  _$jscoverage['/base/observable.js'].lineData[187] = 0;
  _$jscoverage['/base/observable.js'].lineData[189] = 0;
  _$jscoverage['/base/observable.js'].lineData[190] = 0;
  _$jscoverage['/base/observable.js'].lineData[196] = 0;
  _$jscoverage['/base/observable.js'].lineData[208] = 0;
  _$jscoverage['/base/observable.js'].lineData[209] = 0;
  _$jscoverage['/base/observable.js'].lineData[211] = 0;
  _$jscoverage['/base/observable.js'].lineData[214] = 0;
  _$jscoverage['/base/observable.js'].lineData[217] = 0;
  _$jscoverage['/base/observable.js'].lineData[218] = 0;
  _$jscoverage['/base/observable.js'].lineData[219] = 0;
  _$jscoverage['/base/observable.js'].lineData[221] = 0;
  _$jscoverage['/base/observable.js'].lineData[222] = 0;
  _$jscoverage['/base/observable.js'].lineData[223] = 0;
  _$jscoverage['/base/observable.js'].lineData[224] = 0;
  _$jscoverage['/base/observable.js'].lineData[228] = 0;
  _$jscoverage['/base/observable.js'].lineData[229] = 0;
  _$jscoverage['/base/observable.js'].lineData[231] = 0;
  _$jscoverage['/base/observable.js'].lineData[234] = 0;
  _$jscoverage['/base/observable.js'].lineData[237] = 0;
  _$jscoverage['/base/observable.js'].lineData[240] = 0;
  _$jscoverage['/base/observable.js'].lineData[242] = 0;
  _$jscoverage['/base/observable.js'].lineData[245] = 0;
  _$jscoverage['/base/observable.js'].lineData[248] = 0;
  _$jscoverage['/base/observable.js'].lineData[251] = 0;
  _$jscoverage['/base/observable.js'].lineData[254] = 0;
  _$jscoverage['/base/observable.js'].lineData[262] = 0;
  _$jscoverage['/base/observable.js'].lineData[268] = 0;
  _$jscoverage['/base/observable.js'].lineData[269] = 0;
  _$jscoverage['/base/observable.js'].lineData[270] = 0;
  _$jscoverage['/base/observable.js'].lineData[274] = 0;
  _$jscoverage['/base/observable.js'].lineData[276] = 0;
  _$jscoverage['/base/observable.js'].lineData[277] = 0;
  _$jscoverage['/base/observable.js'].lineData[278] = 0;
  _$jscoverage['/base/observable.js'].lineData[280] = 0;
  _$jscoverage['/base/observable.js'].lineData[281] = 0;
  _$jscoverage['/base/observable.js'].lineData[282] = 0;
  _$jscoverage['/base/observable.js'].lineData[284] = 0;
  _$jscoverage['/base/observable.js'].lineData[288] = 0;
  _$jscoverage['/base/observable.js'].lineData[289] = 0;
  _$jscoverage['/base/observable.js'].lineData[299] = 0;
  _$jscoverage['/base/observable.js'].lineData[310] = 0;
  _$jscoverage['/base/observable.js'].lineData[311] = 0;
  _$jscoverage['/base/observable.js'].lineData[314] = 0;
  _$jscoverage['/base/observable.js'].lineData[315] = 0;
  _$jscoverage['/base/observable.js'].lineData[318] = 0;
  _$jscoverage['/base/observable.js'].lineData[321] = 0;
  _$jscoverage['/base/observable.js'].lineData[322] = 0;
  _$jscoverage['/base/observable.js'].lineData[324] = 0;
  _$jscoverage['/base/observable.js'].lineData[325] = 0;
  _$jscoverage['/base/observable.js'].lineData[326] = 0;
  _$jscoverage['/base/observable.js'].lineData[327] = 0;
  _$jscoverage['/base/observable.js'].lineData[356] = 0;
  _$jscoverage['/base/observable.js'].lineData[358] = 0;
  _$jscoverage['/base/observable.js'].lineData[359] = 0;
  _$jscoverage['/base/observable.js'].lineData[361] = 0;
  _$jscoverage['/base/observable.js'].lineData[362] = 0;
  _$jscoverage['/base/observable.js'].lineData[364] = 0;
  _$jscoverage['/base/observable.js'].lineData[365] = 0;
  _$jscoverage['/base/observable.js'].lineData[370] = 0;
  _$jscoverage['/base/observable.js'].lineData[373] = 0;
  _$jscoverage['/base/observable.js'].lineData[376] = 0;
  _$jscoverage['/base/observable.js'].lineData[380] = 0;
  _$jscoverage['/base/observable.js'].lineData[387] = 0;
  _$jscoverage['/base/observable.js'].lineData[388] = 0;
  _$jscoverage['/base/observable.js'].lineData[389] = 0;
  _$jscoverage['/base/observable.js'].lineData[390] = 0;
  _$jscoverage['/base/observable.js'].lineData[393] = 0;
  _$jscoverage['/base/observable.js'].lineData[394] = 0;
  _$jscoverage['/base/observable.js'].lineData[397] = 0;
  _$jscoverage['/base/observable.js'].lineData[401] = 0;
  _$jscoverage['/base/observable.js'].lineData[402] = 0;
  _$jscoverage['/base/observable.js'].lineData[403] = 0;
  _$jscoverage['/base/observable.js'].lineData[412] = 0;
  _$jscoverage['/base/observable.js'].lineData[420] = 0;
  _$jscoverage['/base/observable.js'].lineData[421] = 0;
  _$jscoverage['/base/observable.js'].lineData[423] = 0;
  _$jscoverage['/base/observable.js'].lineData[424] = 0;
  _$jscoverage['/base/observable.js'].lineData[426] = 0;
  _$jscoverage['/base/observable.js'].lineData[427] = 0;
  _$jscoverage['/base/observable.js'].lineData[430] = 0;
  _$jscoverage['/base/observable.js'].lineData[433] = 0;
  _$jscoverage['/base/observable.js'].lineData[434] = 0;
  _$jscoverage['/base/observable.js'].lineData[435] = 0;
  _$jscoverage['/base/observable.js'].lineData[436] = 0;
  _$jscoverage['/base/observable.js'].lineData[438] = 0;
  _$jscoverage['/base/observable.js'].lineData[441] = 0;
}
if (! _$jscoverage['/base/observable.js'].functionData) {
  _$jscoverage['/base/observable.js'].functionData = [];
  _$jscoverage['/base/observable.js'].functionData[0] = 0;
  _$jscoverage['/base/observable.js'].functionData[1] = 0;
  _$jscoverage['/base/observable.js'].functionData[2] = 0;
  _$jscoverage['/base/observable.js'].functionData[3] = 0;
  _$jscoverage['/base/observable.js'].functionData[4] = 0;
  _$jscoverage['/base/observable.js'].functionData[5] = 0;
  _$jscoverage['/base/observable.js'].functionData[6] = 0;
  _$jscoverage['/base/observable.js'].functionData[7] = 0;
  _$jscoverage['/base/observable.js'].functionData[8] = 0;
  _$jscoverage['/base/observable.js'].functionData[9] = 0;
  _$jscoverage['/base/observable.js'].functionData[10] = 0;
}
if (! _$jscoverage['/base/observable.js'].branchData) {
  _$jscoverage['/base/observable.js'].branchData = {};
  _$jscoverage['/base/observable.js'].branchData['39'] = [];
  _$jscoverage['/base/observable.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['44'] = [];
  _$jscoverage['/base/observable.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['44'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['86'] = [];
  _$jscoverage['/base/observable.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['93'] = [];
  _$jscoverage['/base/observable.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['94'] = [];
  _$jscoverage['/base/observable.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['95'] = [];
  _$jscoverage['/base/observable.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['95'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['95'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['99'] = [];
  _$jscoverage['/base/observable.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['104'] = [];
  _$jscoverage['/base/observable.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['107'] = [];
  _$jscoverage['/base/observable.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['111'] = [];
  _$jscoverage['/base/observable.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['118'] = [];
  _$jscoverage['/base/observable.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['124'] = [];
  _$jscoverage['/base/observable.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['135'] = [];
  _$jscoverage['/base/observable.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['135'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['141'] = [];
  _$jscoverage['/base/observable.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['141'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['147'] = [];
  _$jscoverage['/base/observable.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['147'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['147'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['164'] = [];
  _$jscoverage['/base/observable.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['169'] = [];
  _$jscoverage['/base/observable.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['170'] = [];
  _$jscoverage['/base/observable.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['174'] = [];
  _$jscoverage['/base/observable.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['174'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['178'] = [];
  _$jscoverage['/base/observable.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['187'] = [];
  _$jscoverage['/base/observable.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['189'] = [];
  _$jscoverage['/base/observable.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['189'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['211'] = [];
  _$jscoverage['/base/observable.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['211'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['211'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['211'][4] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['212'] = [];
  _$jscoverage['/base/observable.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['212'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['221'] = [];
  _$jscoverage['/base/observable.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['223'] = [];
  _$jscoverage['/base/observable.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['223'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['223'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['228'] = [];
  _$jscoverage['/base/observable.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['228'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['232'] = [];
  _$jscoverage['/base/observable.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['232'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['234'] = [];
  _$jscoverage['/base/observable.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['240'] = [];
  _$jscoverage['/base/observable.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['264'] = [];
  _$jscoverage['/base/observable.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['268'] = [];
  _$jscoverage['/base/observable.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['269'] = [];
  _$jscoverage['/base/observable.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['274'] = [];
  _$jscoverage['/base/observable.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['276'] = [];
  _$jscoverage['/base/observable.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['280'] = [];
  _$jscoverage['/base/observable.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['288'] = [];
  _$jscoverage['/base/observable.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['301'] = [];
  _$jscoverage['/base/observable.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['310'] = [];
  _$jscoverage['/base/observable.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['314'] = [];
  _$jscoverage['/base/observable.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['321'] = [];
  _$jscoverage['/base/observable.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['321'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['322'] = [];
  _$jscoverage['/base/observable.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['324'] = [];
  _$jscoverage['/base/observable.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['326'] = [];
  _$jscoverage['/base/observable.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['328'] = [];
  _$jscoverage['/base/observable.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['328'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['330'] = [];
  _$jscoverage['/base/observable.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['330'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['330'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['345'] = [];
  _$jscoverage['/base/observable.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['346'] = [];
  _$jscoverage['/base/observable.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['348'] = [];
  _$jscoverage['/base/observable.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['348'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['348'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['349'] = [];
  _$jscoverage['/base/observable.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['354'] = [];
  _$jscoverage['/base/observable.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['358'] = [];
  _$jscoverage['/base/observable.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['361'] = [];
  _$jscoverage['/base/observable.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['364'] = [];
  _$jscoverage['/base/observable.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['384'] = [];
  _$jscoverage['/base/observable.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['387'] = [];
  _$jscoverage['/base/observable.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['389'] = [];
  _$jscoverage['/base/observable.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['393'] = [];
  _$jscoverage['/base/observable.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['393'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['401'] = [];
  _$jscoverage['/base/observable.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['423'] = [];
  _$jscoverage['/base/observable.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['426'] = [];
  _$jscoverage['/base/observable.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['435'] = [];
  _$jscoverage['/base/observable.js'].branchData['435'][1] = new BranchData();
}
_$jscoverage['/base/observable.js'].branchData['435'][1].init(75, 30, '!domEventObservables && create');
function visit192_435_1(result) {
  _$jscoverage['/base/observable.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['426'][1].init(242, 19, 'domEventObservables');
function visit191_426_1(result) {
  _$jscoverage['/base/observable.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['423'][1].init(115, 25, 'domEventObservablesHolder');
function visit190_423_1(result) {
  _$jscoverage['/base/observable.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['401'][1].init(723, 39, 'util.isEmptyObject(domEventObservables)');
function visit189_401_1(result) {
  _$jscoverage['/base/observable.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['393'][2].init(212, 46, 's.tearDown.call(currentTarget, type) === false');
function visit188_393_2(result) {
  _$jscoverage['/base/observable.js'].branchData['393'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['393'][1].init(197, 61, '!s.tearDown || s.tearDown.call(currentTarget, type) === false');
function visit187_393_1(result) {
  _$jscoverage['/base/observable.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['389'][1].init(84, 19, '!self.hasObserver()');
function visit186_389_1(result) {
  _$jscoverage['/base/observable.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['387'][1].init(305, 9, 'eventDesc');
function visit185_387_1(result) {
  _$jscoverage['/base/observable.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['384'][1].init(135, 19, 'Special[type] || {}');
function visit184_384_1(result) {
  _$jscoverage['/base/observable.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['364'][1].init(316, 8, 's.remove');
function visit183_364_1(result) {
  _$jscoverage['/base/observable.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['361'][1].init(178, 31, 'observer.last && self.lastCount');
function visit182_361_1(result) {
  _$jscoverage['/base/observable.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['358'][1].init(30, 37, 'observer.filter && self.delegateCount');
function visit181_358_1(result) {
  _$jscoverage['/base/observable.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['354'][1].init(343, 44, 'groupsRe && !observer.groups.match(groupsRe)');
function visit180_354_1(result) {
  _$jscoverage['/base/observable.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['349'][1].init(74, 27, '!filter && !observer.filter');
function visit179_349_1(result) {
  _$jscoverage['/base/observable.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['348'][3].init(88, 26, 'filter !== observer.filter');
function visit178_348_3(result) {
  _$jscoverage['/base/observable.js'].branchData['348'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['348'][2].init(78, 36, 'filter && filter !== observer.filter');
function visit177_348_2(result) {
  _$jscoverage['/base/observable.js'].branchData['348'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['348'][1].init(-1, 103, '(filter && filter !== observer.filter) || (!filter && !observer.filter)');
function visit176_348_1(result) {
  _$jscoverage['/base/observable.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['346'][1].init(-1, 216, 'hasFilter && ((filter && filter !== observer.filter) || (!filter && !observer.filter))');
function visit175_346_1(result) {
  _$jscoverage['/base/observable.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['345'][1].init(855, 389, '(hasFilter && ((filter && filter !== observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit174_345_1(result) {
  _$jscoverage['/base/observable.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['330'][3].init(282, 18, 'fn !== observer.fn');
function visit173_330_3(result) {
  _$jscoverage['/base/observable.js'].branchData['330'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['330'][2].init(276, 24, 'fn && fn !== observer.fn');
function visit172_330_2(result) {
  _$jscoverage['/base/observable.js'].branchData['330'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['330'][1].init(100, 1245, '(fn && fn !== observer.fn) || (hasFilter && ((filter && filter !== observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit171_330_1(result) {
  _$jscoverage['/base/observable.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['328'][2].init(174, 27, 'context !== observerContext');
function visit170_328_2(result) {
  _$jscoverage['/base/observable.js'].branchData['328'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['328'][1].init(30, 1346, '(context !== observerContext) || (fn && fn !== observer.fn) || (hasFilter && ((filter && filter !== observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit169_328_1(result) {
  _$jscoverage['/base/observable.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['326'][1].init(86, 33, 'observer.context || currentTarget');
function visit168_326_1(result) {
  _$jscoverage['/base/observable.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['324'][1].init(100, 7, 'i < len');
function visit167_324_1(result) {
  _$jscoverage['/base/observable.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['322'][1].init(28, 24, 'context || currentTarget');
function visit166_322_1(result) {
  _$jscoverage['/base/observable.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['321'][2].init(704, 21, 'hasFilter || groupsRe');
function visit165_321_2(result) {
  _$jscoverage['/base/observable.js'].branchData['321'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['321'][1].init(698, 27, 'fn || hasFilter || groupsRe');
function visit164_321_1(result) {
  _$jscoverage['/base/observable.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['314'][1].init(494, 6, 'groups');
function visit163_314_1(result) {
  _$jscoverage['/base/observable.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['310'][1].init(414, 17, '!observers.length');
function visit162_310_1(result) {
  _$jscoverage['/base/observable.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['301'][1].init(64, 24, 'Special[self.type] || {}');
function visit161_301_1(result) {
  _$jscoverage['/base/observable.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['288'][1].init(536, 5, 's.add');
function visit160_288_1(result) {
  _$jscoverage['/base/observable.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['280'][1].init(26, 13, 'observer.last');
function visit159_280_1(result) {
  _$jscoverage['/base/observable.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['276'][1].init(54, 15, 'observer.filter');
function visit158_276_1(result) {
  _$jscoverage['/base/observable.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['274'][1].init(442, 34, 'self.findObserver(observer) === -1');
function visit157_274_1(result) {
  _$jscoverage['/base/observable.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['269'][1].init(22, 12, '!observer.fn');
function visit156_269_1(result) {
  _$jscoverage['/base/observable.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['268'][1].init(265, 14, 'S.Config.debug');
function visit155_268_1(result) {
  _$jscoverage['/base/observable.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['264'][1].init(82, 24, 'Special[self.type] || {}');
function visit154_264_1(result) {
  _$jscoverage['/base/observable.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['240'][1].init(124, 59, 'currentTarget[eventType] && !util.isWindow(currentTarget)');
function visit153_240_1(result) {
  _$jscoverage['/base/observable.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['234'][1].init(2857, 44, '!onlyHandlers && !event.isDefaultPrevented()');
function visit152_234_1(result) {
  _$jscoverage['/base/observable.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['232'][2].init(2800, 36, 'cur && !event.isPropagationStopped()');
function visit151_232_2(result) {
  _$jscoverage['/base/observable.js'].branchData['232'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['232'][1].init(704, 53, '!onlyHandlers && cur && !event.isPropagationStopped()');
function visit150_232_1(result) {
  _$jscoverage['/base/observable.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['228'][2].init(526, 33, 'cur[ontype].call(cur) === false');
function visit149_228_2(result) {
  _$jscoverage['/base/observable.js'].branchData['228'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['228'][1].init(509, 50, 'cur[ontype] && cur[ontype].call(cur) === false');
function visit148_228_1(result) {
  _$jscoverage['/base/observable.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['223'][3].init(108, 14, 'gret !== false');
function visit147_223_3(result) {
  _$jscoverage['/base/observable.js'].branchData['223'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['223'][2].init(87, 17, 'ret !== undefined');
function visit146_223_2(result) {
  _$jscoverage['/base/observable.js'].branchData['223'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['223'][1].init(87, 35, 'ret !== undefined && gret !== false');
function visit145_223_1(result) {
  _$jscoverage['/base/observable.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['221'][1].init(211, 18, 'domEventObservable');
function visit144_221_1(result) {
  _$jscoverage['/base/observable.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['212'][2].init(1963, 14, 'cur && bubbles');
function visit143_212_2(result) {
  _$jscoverage['/base/observable.js'].branchData['212'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['212'][1].init(214, 31, '!onlyHandlers && cur && bubbles');
function visit142_212_1(result) {
  _$jscoverage['/base/observable.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['211'][4].init(160, 19, 'cur === curDocument');
function visit141_211_4(result) {
  _$jscoverage['/base/observable.js'].branchData['211'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['211'][3].init(160, 27, '(cur === curDocument) && win');
function visit140_211_3(result) {
  _$jscoverage['/base/observable.js'].branchData['211'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['211'][2].init(138, 49, 'cur.ownerDocument || (cur === curDocument) && win');
function visit139_211_2(result) {
  _$jscoverage['/base/observable.js'].branchData['211'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['211'][1].init(120, 67, 'cur.parentNode || cur.ownerDocument || (cur === curDocument) && win');
function visit138_211_1(result) {
  _$jscoverage['/base/observable.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['189'][2].init(925, 71, 'specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false');
function visit137_189_2(result) {
  _$jscoverage['/base/observable.js'].branchData['189'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['189'][1].init(901, 95, 'specialEvent.preFire && specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false');
function visit136_189_1(result) {
  _$jscoverage['/base/observable.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['187'][1].init(851, 29, 'event.target || currentTarget');
function visit135_187_1(result) {
  _$jscoverage['/base/observable.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['178'][1].init(547, 20, '!event.isEventObject');
function visit134_178_1(result) {
  _$jscoverage['/base/observable.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['174'][2].init(423, 61, 'specialEvent.fire.call(currentTarget, onlyHandlers) === false');
function visit133_174_2(result) {
  _$jscoverage['/base/observable.js'].branchData['174'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['174'][1].init(402, 82, 'specialEvent.fire && specialEvent.fire.call(currentTarget, onlyHandlers) === false');
function visit132_174_1(result) {
  _$jscoverage['/base/observable.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['170'][1].init(197, 30, 'specialEvent.bubbles !== false');
function visit131_170_1(result) {
  _$jscoverage['/base/observable.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['169'][1].init(144, 24, 'Special[eventType] || {}');
function visit130_169_1(result) {
  _$jscoverage['/base/observable.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['164'][1].init(22, 11, 'event || {}');
function visit129_164_1(result) {
  _$jscoverage['/base/observable.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['147'][3].init(309, 17, 'ret !== undefined');
function visit128_147_3(result) {
  _$jscoverage['/base/observable.js'].branchData['147'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['147'][2].init(291, 14, 'gRet !== false');
function visit127_147_2(result) {
  _$jscoverage['/base/observable.js'].branchData['147'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['147'][1].init(291, 35, 'gRet !== false && ret !== undefined');
function visit126_147_1(result) {
  _$jscoverage['/base/observable.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['141'][2].init(367, 33, 'j < currentTargetObservers.length');
function visit125_141_2(result) {
  _$jscoverage['/base/observable.js'].branchData['141'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['141'][1].init(325, 75, '!event.isImmediatePropagationStopped() && j < currentTargetObservers.length');
function visit124_141_1(result) {
  _$jscoverage['/base/observable.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['135'][2].init(3196, 7, 'i < len');
function visit123_135_2(result) {
  _$jscoverage['/base/observable.js'].branchData['135'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['135'][1].init(3163, 40, '!event.isPropagationStopped() && i < len');
function visit122_135_1(result) {
  _$jscoverage['/base/observable.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['124'][1].init(2595, 32, 'delegateCount < observers.length');
function visit121_124_1(result) {
  _$jscoverage['/base/observable.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['118'][1].init(1219, 34, 'target.parentNode || currentTarget');
function visit120_118_1(result) {
  _$jscoverage['/base/observable.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['111'][1].init(810, 29, 'currentTargetObservers.length');
function visit119_111_1(result) {
  _$jscoverage['/base/observable.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['107'][1].init(425, 7, 'matched');
function visit118_107_1(result) {
  _$jscoverage['/base/observable.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['104'][1].init(248, 21, 'matched === undefined');
function visit117_104_1(result) {
  _$jscoverage['/base/observable.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['99'][1].init(190, 17, 'i < delegateCount');
function visit116_99_1(result) {
  _$jscoverage['/base/observable.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['95'][3].init(54, 21, 'eventType !== \'click\'');
function visit115_95_3(result) {
  _$jscoverage['/base/observable.js'].branchData['95'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['95'][2].init(26, 24, 'target.disabled !== true');
function visit114_95_2(result) {
  _$jscoverage['/base/observable.js'].branchData['95'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['95'][1].init(26, 49, 'target.disabled !== true || eventType !== \'click\'');
function visit113_95_1(result) {
  _$jscoverage['/base/observable.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['94'][1].init(25, 24, 'target !== currentTarget');
function visit112_94_1(result) {
  _$jscoverage['/base/observable.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['93'][1].init(1043, 32, 'delegateCount && target.nodeType');
function visit111_93_1(result) {
  _$jscoverage['/base/observable.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['86'][1].init(412, 23, 'self.delegateCount || 0');
function visit110_86_1(result) {
  _$jscoverage['/base/observable.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['44'][2].init(342, 43, 's.setup.call(currentTarget, type) === false');
function visit109_44_2(result) {
  _$jscoverage['/base/observable.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['44'][1].init(330, 55, '!s.setup || s.setup.call(currentTarget, type) === false');
function visit108_44_1(result) {
  _$jscoverage['/base/observable.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['39'][1].init(72, 19, 'Special[type] || {}');
function visit107_39_1(result) {
  _$jscoverage['/base/observable.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/observable.js'].functionData[0]++;
  _$jscoverage['/base/observable.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/base/observable.js'].lineData[8]++;
  var logger = S.getLogger('s/event');
  _$jscoverage['/base/observable.js'].lineData[9]++;
  var BaseEvent = require('event/base');
  _$jscoverage['/base/observable.js'].lineData[10]++;
  var Dom = require('dom');
  _$jscoverage['/base/observable.js'].lineData[11]++;
  var Special = require('./special');
  _$jscoverage['/base/observable.js'].lineData[12]++;
  var DomEventUtils = require('./utils');
  _$jscoverage['/base/observable.js'].lineData[13]++;
  var DomEventObserver = require('./observer');
  _$jscoverage['/base/observable.js'].lineData[14]++;
  var DomEventObject = require('./object');
  _$jscoverage['/base/observable.js'].lineData[16]++;
  var BaseUtils = BaseEvent.Utils;
  _$jscoverage['/base/observable.js'].lineData[25]++;
  function DomEventObservable(cfg) {
    _$jscoverage['/base/observable.js'].functionData[1]++;
    _$jscoverage['/base/observable.js'].lineData[26]++;
    var self = this;
    _$jscoverage['/base/observable.js'].lineData[27]++;
    util.mix(self, cfg);
    _$jscoverage['/base/observable.js'].lineData[28]++;
    self.reset();
  }
  _$jscoverage['/base/observable.js'].lineData[35]++;
  util.extend(DomEventObservable, BaseEvent.Observable, {
  setup: function() {
  _$jscoverage['/base/observable.js'].functionData[2]++;
  _$jscoverage['/base/observable.js'].lineData[37]++;
  var self = this, type = self.type, s = visit107_39_1(Special[type] || {}), currentTarget = self.currentTarget, eventDesc = DomEventUtils.data(currentTarget), handle = eventDesc.handle;
  _$jscoverage['/base/observable.js'].lineData[44]++;
  if (visit108_44_1(!s.setup || visit109_44_2(s.setup.call(currentTarget, type) === false))) {
    _$jscoverage['/base/observable.js'].lineData[45]++;
    DomEventUtils.simpleAdd(currentTarget, type, handle);
  }
}, 
  constructor: DomEventObservable, 
  reset: function() {
  _$jscoverage['/base/observable.js'].functionData[3]++;
  _$jscoverage['/base/observable.js'].lineData[52]++;
  var self = this;
  _$jscoverage['/base/observable.js'].lineData[53]++;
  DomEventObservable.superclass.reset.call(self);
  _$jscoverage['/base/observable.js'].lineData[54]++;
  self.delegateCount = 0;
  _$jscoverage['/base/observable.js'].lineData[55]++;
  self.lastCount = 0;
}, 
  notify: function(event) {
  _$jscoverage['/base/observable.js'].functionData[4]++;
  _$jscoverage['/base/observable.js'].lineData[74]++;
  var target = event.target, eventType = event.type, self = this, currentTarget = self.currentTarget, observers = self.observers, currentTarget0, allObservers = [], ret, gRet, observerObj, i, j, delegateCount = visit110_86_1(self.delegateCount || 0), len, currentTargetObservers, currentTargetObserver, observer;
  _$jscoverage['/base/observable.js'].lineData[93]++;
  if (visit111_93_1(delegateCount && target.nodeType)) {
    _$jscoverage['/base/observable.js'].lineData[94]++;
    while (visit112_94_1(target !== currentTarget)) {
      _$jscoverage['/base/observable.js'].lineData[95]++;
      if (visit113_95_1(visit114_95_2(target.disabled !== true) || visit115_95_3(eventType !== 'click'))) {
        _$jscoverage['/base/observable.js'].lineData[96]++;
        var cachedMatch = {}, matched, key, filter;
        _$jscoverage['/base/observable.js'].lineData[98]++;
        currentTargetObservers = [];
        _$jscoverage['/base/observable.js'].lineData[99]++;
        for (i = 0; visit116_99_1(i < delegateCount); i++) {
          _$jscoverage['/base/observable.js'].lineData[100]++;
          observer = observers[i];
          _$jscoverage['/base/observable.js'].lineData[101]++;
          filter = observer.filter;
          _$jscoverage['/base/observable.js'].lineData[102]++;
          key = filter + '';
          _$jscoverage['/base/observable.js'].lineData[103]++;
          matched = cachedMatch[key];
          _$jscoverage['/base/observable.js'].lineData[104]++;
          if (visit117_104_1(matched === undefined)) {
            _$jscoverage['/base/observable.js'].lineData[105]++;
            matched = cachedMatch[key] = Dom.test(target, filter);
          }
          _$jscoverage['/base/observable.js'].lineData[107]++;
          if (visit118_107_1(matched)) {
            _$jscoverage['/base/observable.js'].lineData[108]++;
            currentTargetObservers.push(observer);
          }
        }
        _$jscoverage['/base/observable.js'].lineData[111]++;
        if (visit119_111_1(currentTargetObservers.length)) {
          _$jscoverage['/base/observable.js'].lineData[112]++;
          allObservers.push({
  currentTarget: target, 
  currentTargetObservers: currentTargetObservers});
        }
      }
      _$jscoverage['/base/observable.js'].lineData[118]++;
      target = visit120_118_1(target.parentNode || currentTarget);
    }
  }
  _$jscoverage['/base/observable.js'].lineData[124]++;
  if (visit121_124_1(delegateCount < observers.length)) {
    _$jscoverage['/base/observable.js'].lineData[125]++;
    allObservers.push({
  currentTarget: currentTarget, 
  currentTargetObservers: observers.slice(delegateCount)});
  }
  _$jscoverage['/base/observable.js'].lineData[135]++;
  for (i = 0 , len = allObservers.length; visit122_135_1(!event.isPropagationStopped() && visit123_135_2(i < len)); ++i) {
    _$jscoverage['/base/observable.js'].lineData[136]++;
    observerObj = allObservers[i];
    _$jscoverage['/base/observable.js'].lineData[137]++;
    currentTargetObservers = observerObj.currentTargetObservers;
    _$jscoverage['/base/observable.js'].lineData[138]++;
    currentTarget0 = observerObj.currentTarget;
    _$jscoverage['/base/observable.js'].lineData[139]++;
    event.currentTarget = currentTarget0;
    _$jscoverage['/base/observable.js'].lineData[141]++;
    for (j = 0; visit124_141_1(!event.isImmediatePropagationStopped() && visit125_141_2(j < currentTargetObservers.length)); j++) {
      _$jscoverage['/base/observable.js'].lineData[142]++;
      currentTargetObserver = currentTargetObservers[j];
      _$jscoverage['/base/observable.js'].lineData[143]++;
      ret = currentTargetObserver.notify(event, self);
      _$jscoverage['/base/observable.js'].lineData[147]++;
      if (visit126_147_1(visit127_147_2(gRet !== false) && visit128_147_3(ret !== undefined))) {
        _$jscoverage['/base/observable.js'].lineData[148]++;
        gRet = ret;
      }
    }
  }
  _$jscoverage['/base/observable.js'].lineData[155]++;
  return gRet;
}, 
  fire: function(event, onlyHandlers) {
  _$jscoverage['/base/observable.js'].functionData[5]++;
  _$jscoverage['/base/observable.js'].lineData[164]++;
  event = visit129_164_1(event || {});
  _$jscoverage['/base/observable.js'].lineData[166]++;
  var self = this, eventType = String(self.type), domEventObservable, eventData, specialEvent = visit130_169_1(Special[eventType] || {}), bubbles = visit131_170_1(specialEvent.bubbles !== false), currentTarget = self.currentTarget;
  _$jscoverage['/base/observable.js'].lineData[174]++;
  if (visit132_174_1(specialEvent.fire && visit133_174_2(specialEvent.fire.call(currentTarget, onlyHandlers) === false))) {
    _$jscoverage['/base/observable.js'].lineData[175]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[178]++;
  if (visit134_178_1(!event.isEventObject)) {
    _$jscoverage['/base/observable.js'].lineData[179]++;
    eventData = event;
    _$jscoverage['/base/observable.js'].lineData[180]++;
    event = new DomEventObject({
  type: eventType});
    _$jscoverage['/base/observable.js'].lineData[183]++;
    util.mix(event, eventData);
  }
  _$jscoverage['/base/observable.js'].lineData[186]++;
  event.currentTarget = currentTarget;
  _$jscoverage['/base/observable.js'].lineData[187]++;
  event.target = visit135_187_1(event.target || currentTarget);
  _$jscoverage['/base/observable.js'].lineData[189]++;
  if (visit136_189_1(specialEvent.preFire && visit137_189_2(specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false))) {
    _$jscoverage['/base/observable.js'].lineData[190]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[196]++;
  var cur = currentTarget, win = Dom.getWindow(cur), curDocument = win.document, eventPath = [], gret, ret, ontype = 'on' + eventType, eventPathIndex = 0;
  _$jscoverage['/base/observable.js'].lineData[208]++;
  do {
    _$jscoverage['/base/observable.js'].lineData[209]++;
    eventPath.push(cur);
    _$jscoverage['/base/observable.js'].lineData[211]++;
    cur = visit138_211_1(cur.parentNode || visit139_211_2(cur.ownerDocument || visit140_211_3((visit141_211_4(cur === curDocument)) && win)));
  } while (visit142_212_1(!onlyHandlers && visit143_212_2(cur && bubbles)));
  _$jscoverage['/base/observable.js'].lineData[214]++;
  cur = eventPath[eventPathIndex];
  _$jscoverage['/base/observable.js'].lineData[217]++;
  do {
    _$jscoverage['/base/observable.js'].lineData[218]++;
    event.currentTarget = cur;
    _$jscoverage['/base/observable.js'].lineData[219]++;
    domEventObservable = DomEventObservable.getDomEventObservable(cur, eventType);
    _$jscoverage['/base/observable.js'].lineData[221]++;
    if (visit144_221_1(domEventObservable)) {
      _$jscoverage['/base/observable.js'].lineData[222]++;
      ret = domEventObservable.notify(event);
      _$jscoverage['/base/observable.js'].lineData[223]++;
      if (visit145_223_1(visit146_223_2(ret !== undefined) && visit147_223_3(gret !== false))) {
        _$jscoverage['/base/observable.js'].lineData[224]++;
        gret = ret;
      }
    }
    _$jscoverage['/base/observable.js'].lineData[228]++;
    if (visit148_228_1(cur[ontype] && visit149_228_2(cur[ontype].call(cur) === false))) {
      _$jscoverage['/base/observable.js'].lineData[229]++;
      event.preventDefault();
    }
    _$jscoverage['/base/observable.js'].lineData[231]++;
    cur = eventPath[++eventPathIndex];
  } while (visit150_232_1(!onlyHandlers && visit151_232_2(cur && !event.isPropagationStopped())));
  _$jscoverage['/base/observable.js'].lineData[234]++;
  if (visit152_234_1(!onlyHandlers && !event.isDefaultPrevented())) {
    _$jscoverage['/base/observable.js'].lineData[237]++;
    try {
      _$jscoverage['/base/observable.js'].lineData[240]++;
      if (visit153_240_1(currentTarget[eventType] && !util.isWindow(currentTarget))) {
        _$jscoverage['/base/observable.js'].lineData[242]++;
        DomEventObservable.triggeredEvent = eventType;
        _$jscoverage['/base/observable.js'].lineData[245]++;
        currentTarget[eventType]();
      }
    }    catch (eError) {
  _$jscoverage['/base/observable.js'].lineData[248]++;
  logger.debug('trigger action error: ' + eError);
}
    _$jscoverage['/base/observable.js'].lineData[251]++;
    DomEventObservable.triggeredEvent = '';
  }
  _$jscoverage['/base/observable.js'].lineData[254]++;
  return gret;
}, 
  on: function(cfg) {
  _$jscoverage['/base/observable.js'].functionData[6]++;
  _$jscoverage['/base/observable.js'].lineData[262]++;
  var self = this, observers = self.observers, s = visit154_264_1(Special[self.type] || {}), observer = cfg instanceof DomEventObserver ? cfg : new DomEventObserver(cfg);
  _$jscoverage['/base/observable.js'].lineData[268]++;
  if (visit155_268_1(S.Config.debug)) {
    _$jscoverage['/base/observable.js'].lineData[269]++;
    if (visit156_269_1(!observer.fn)) {
      _$jscoverage['/base/observable.js'].lineData[270]++;
      S.error('lack event handler for ' + self.type);
    }
  }
  _$jscoverage['/base/observable.js'].lineData[274]++;
  if (visit157_274_1(self.findObserver(observer) === -1)) {
    _$jscoverage['/base/observable.js'].lineData[276]++;
    if (visit158_276_1(observer.filter)) {
      _$jscoverage['/base/observable.js'].lineData[277]++;
      observers.splice(self.delegateCount, 0, observer);
      _$jscoverage['/base/observable.js'].lineData[278]++;
      self.delegateCount++;
    } else {
      _$jscoverage['/base/observable.js'].lineData[280]++;
      if (visit159_280_1(observer.last)) {
        _$jscoverage['/base/observable.js'].lineData[281]++;
        observers.push(observer);
        _$jscoverage['/base/observable.js'].lineData[282]++;
        self.lastCount++;
      } else {
        _$jscoverage['/base/observable.js'].lineData[284]++;
        observers.splice(observers.length - self.lastCount, 0, observer);
      }
    }
    _$jscoverage['/base/observable.js'].lineData[288]++;
    if (visit160_288_1(s.add)) {
      _$jscoverage['/base/observable.js'].lineData[289]++;
      s.add.call(self.currentTarget, observer);
    }
  }
}, 
  detach: function(cfg) {
  _$jscoverage['/base/observable.js'].functionData[7]++;
  _$jscoverage['/base/observable.js'].lineData[299]++;
  var groupsRe, self = this, s = visit161_301_1(Special[self.type] || {}), hasFilter = 'filter' in cfg, filter = cfg.filter, context = cfg.context, fn = cfg.fn, currentTarget = self.currentTarget, observers = self.observers, groups = cfg.groups;
  _$jscoverage['/base/observable.js'].lineData[310]++;
  if (visit162_310_1(!observers.length)) {
    _$jscoverage['/base/observable.js'].lineData[311]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[314]++;
  if (visit163_314_1(groups)) {
    _$jscoverage['/base/observable.js'].lineData[315]++;
    groupsRe = BaseUtils.getGroupsRe(groups);
  }
  _$jscoverage['/base/observable.js'].lineData[318]++;
  var i, j, t, observer, observerContext, len = observers.length;
  _$jscoverage['/base/observable.js'].lineData[321]++;
  if (visit164_321_1(fn || visit165_321_2(hasFilter || groupsRe))) {
    _$jscoverage['/base/observable.js'].lineData[322]++;
    context = visit166_322_1(context || currentTarget);
    _$jscoverage['/base/observable.js'].lineData[324]++;
    for (i = 0 , j = 0 , t = []; visit167_324_1(i < len); ++i) {
      _$jscoverage['/base/observable.js'].lineData[325]++;
      observer = observers[i];
      _$jscoverage['/base/observable.js'].lineData[326]++;
      observerContext = visit168_326_1(observer.context || currentTarget);
      _$jscoverage['/base/observable.js'].lineData[327]++;
      if (visit169_328_1((visit170_328_2(context !== observerContext)) || visit171_330_1((visit172_330_2(fn && visit173_330_3(fn !== observer.fn))) || visit174_345_1((visit175_346_1(hasFilter && (visit176_348_1((visit177_348_2(filter && visit178_348_3(filter !== observer.filter))) || (visit179_349_1(!filter && !observer.filter)))))) || (visit180_354_1(groupsRe && !observer.groups.match(groupsRe))))))) {
        _$jscoverage['/base/observable.js'].lineData[356]++;
        t[j++] = observer;
      } else {
        _$jscoverage['/base/observable.js'].lineData[358]++;
        if (visit181_358_1(observer.filter && self.delegateCount)) {
          _$jscoverage['/base/observable.js'].lineData[359]++;
          self.delegateCount--;
        }
        _$jscoverage['/base/observable.js'].lineData[361]++;
        if (visit182_361_1(observer.last && self.lastCount)) {
          _$jscoverage['/base/observable.js'].lineData[362]++;
          self.lastCount--;
        }
        _$jscoverage['/base/observable.js'].lineData[364]++;
        if (visit183_364_1(s.remove)) {
          _$jscoverage['/base/observable.js'].lineData[365]++;
          s.remove.call(currentTarget, observer);
        }
      }
    }
    _$jscoverage['/base/observable.js'].lineData[370]++;
    self.observers = t;
  } else {
    _$jscoverage['/base/observable.js'].lineData[373]++;
    self.reset();
  }
  _$jscoverage['/base/observable.js'].lineData[376]++;
  self.checkMemory();
}, 
  checkMemory: function() {
  _$jscoverage['/base/observable.js'].functionData[8]++;
  _$jscoverage['/base/observable.js'].lineData[380]++;
  var self = this, type = self.type, domEventObservables, handle, s = visit184_384_1(Special[type] || {}), currentTarget = self.currentTarget, eventDesc = DomEventUtils.data(currentTarget);
  _$jscoverage['/base/observable.js'].lineData[387]++;
  if (visit185_387_1(eventDesc)) {
    _$jscoverage['/base/observable.js'].lineData[388]++;
    domEventObservables = eventDesc.observables;
    _$jscoverage['/base/observable.js'].lineData[389]++;
    if (visit186_389_1(!self.hasObserver())) {
      _$jscoverage['/base/observable.js'].lineData[390]++;
      handle = eventDesc.handle;
      _$jscoverage['/base/observable.js'].lineData[393]++;
      if ((visit187_393_1(!s.tearDown || visit188_393_2(s.tearDown.call(currentTarget, type) === false)))) {
        _$jscoverage['/base/observable.js'].lineData[394]++;
        DomEventUtils.simpleRemove(currentTarget, type, handle);
      }
      _$jscoverage['/base/observable.js'].lineData[397]++;
      delete domEventObservables[type];
    }
    _$jscoverage['/base/observable.js'].lineData[401]++;
    if (visit189_401_1(util.isEmptyObject(domEventObservables))) {
      _$jscoverage['/base/observable.js'].lineData[402]++;
      eventDesc.handle = null;
      _$jscoverage['/base/observable.js'].lineData[403]++;
      DomEventUtils.removeData(currentTarget);
    }
  }
}});
  _$jscoverage['/base/observable.js'].lineData[412]++;
  DomEventObservable.triggeredEvent = '';
  _$jscoverage['/base/observable.js'].lineData[420]++;
  DomEventObservable.getDomEventObservable = function(node, type) {
  _$jscoverage['/base/observable.js'].functionData[9]++;
  _$jscoverage['/base/observable.js'].lineData[421]++;
  var domEventObservablesHolder = DomEventUtils.data(node), domEventObservables;
  _$jscoverage['/base/observable.js'].lineData[423]++;
  if (visit190_423_1(domEventObservablesHolder)) {
    _$jscoverage['/base/observable.js'].lineData[424]++;
    domEventObservables = domEventObservablesHolder.observables;
  }
  _$jscoverage['/base/observable.js'].lineData[426]++;
  if (visit191_426_1(domEventObservables)) {
    _$jscoverage['/base/observable.js'].lineData[427]++;
    return domEventObservables[type];
  }
  _$jscoverage['/base/observable.js'].lineData[430]++;
  return null;
};
  _$jscoverage['/base/observable.js'].lineData[433]++;
  DomEventObservable.getDomEventObservablesHolder = function(node, create) {
  _$jscoverage['/base/observable.js'].functionData[10]++;
  _$jscoverage['/base/observable.js'].lineData[434]++;
  var domEventObservables = DomEventUtils.data(node);
  _$jscoverage['/base/observable.js'].lineData[435]++;
  if (visit192_435_1(!domEventObservables && create)) {
    _$jscoverage['/base/observable.js'].lineData[436]++;
    DomEventUtils.data(node, domEventObservables = {});
  }
  _$jscoverage['/base/observable.js'].lineData[438]++;
  return domEventObservables;
};
  _$jscoverage['/base/observable.js'].lineData[441]++;
  return DomEventObservable;
});
