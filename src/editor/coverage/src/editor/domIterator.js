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
if (! _$jscoverage['/editor/domIterator.js']) {
  _$jscoverage['/editor/domIterator.js'] = {};
  _$jscoverage['/editor/domIterator.js'].lineData = [];
  _$jscoverage['/editor/domIterator.js'].lineData[10] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[11] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[28] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[29] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[30] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[31] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[32] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[33] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[36] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[37] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[39] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[42] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[44] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[58] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[61] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[64] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[67] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[70] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[71] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[76] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[78] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[81] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[84] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[85] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[87] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[88] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[89] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[90] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[95] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[98] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[99] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[100] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[101] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[102] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[103] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[108] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[109] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[110] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[114] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[117] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[118] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[120] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[121] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[124] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[128] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[133] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[134] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[136] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[139] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[140] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[141] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[144] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[145] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[146] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[151] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[152] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[156] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[157] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[160] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[163] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[165] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[166] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[167] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[170] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[171] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[173] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[176] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[179] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[180] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[185] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[186] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[187] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[191] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[195] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[196] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[197] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[199] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[200] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[201] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[202] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[205] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[206] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[207] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[208] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[213] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[214] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[216] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[217] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[221] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[222] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[226] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[228] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[229] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[230] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[231] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[234] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[235] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[237] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[239] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[244] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[245] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[247] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[249] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[250] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[252] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[253] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[255] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[259] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[261] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[264] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[265] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[269] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[271] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[272] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[275] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[278] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[284] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[289] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[290] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[291] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[292] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[293] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[294] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[295] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[299] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[301] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[303] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[304] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[306] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[309] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[316] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[317] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[321] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[330] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[331] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[334] = 0;
}
if (! _$jscoverage['/editor/domIterator.js'].functionData) {
  _$jscoverage['/editor/domIterator.js'].functionData = [];
  _$jscoverage['/editor/domIterator.js'].functionData[0] = 0;
  _$jscoverage['/editor/domIterator.js'].functionData[1] = 0;
  _$jscoverage['/editor/domIterator.js'].functionData[2] = 0;
  _$jscoverage['/editor/domIterator.js'].functionData[3] = 0;
}
if (! _$jscoverage['/editor/domIterator.js'].branchData) {
  _$jscoverage['/editor/domIterator.js'].branchData = {};
  _$jscoverage['/editor/domIterator.js'].branchData['29'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['39'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['70'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['78'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['95'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['96'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['96'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['96'][3] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['100'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['102'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['108'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['128'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['133'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['136'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['136'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['139'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['141'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['141'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['141'][3] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['151'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['156'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['163'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['165'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['176'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['179'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['185'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['191'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['191'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['195'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['196'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['199'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['199'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['201'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['213'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['221'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['221'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['226'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['228'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['229'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['239'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['239'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['240'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['241'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['242'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['245'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['245'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['245'][3] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['247'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['255'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['259'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['278'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['289'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['291'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['291'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['292'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['294'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['294'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['299'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['304'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['304'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['304'][3] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['304'][4] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['306'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['307'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['316'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['317'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['317'][1] = new BranchData();
}
_$jscoverage['/editor/domIterator.js'].branchData['317'][1].init(38, 32, 'isLast || block.equals(lastNode)');
function visit274_317_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['316'][1].init(12818, 16, '!self._.nextNode');
function visit273_316_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['307'][1].init(36, 93, 'lastChild.prev(bookmarkGuard, 1) || lastChild.next(bookmarkGuard, 1)');
function visit272_307_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['306'][1].init(119, 130, 'UA[\'ie\'] || lastChild.prev(bookmarkGuard, 1) || lastChild.next(bookmarkGuard, 1)');
function visit271_306_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['304'][4].init(274, 28, 'lastChild.nodeName() == \'br\'');
function visit270_304_4(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['304'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['304'][3].init(220, 50, 'lastChild[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit269_304_3(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['304'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['304'][2].init(220, 82, 'lastChild[0].nodeType == Dom.NodeType.ELEMENT_NODE && lastChild.nodeName() == \'br\'');
function visit268_304_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['304'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['304'][1].init(204, 98, 'lastChild[0] && lastChild[0].nodeType == Dom.NodeType.ELEMENT_NODE && lastChild.nodeName() == \'br\'');
function visit267_304_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['299'][1].init(11948, 12, 'removeLastBr');
function visit266_299_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['294'][2].init(180, 50, 'Dom.nodeName(previousSibling[0].lastChild) == \'br\'');
function visit265_294_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['294'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['294'][1].init(148, 82, 'previousSibling[0].lastChild && Dom.nodeName(previousSibling[0].lastChild) == \'br\'');
function visit264_294_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['292'][1].init(26, 34, 'previousSibling.nodeName() == \'br\'');
function visit263_292_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['291'][2].init(119, 56, 'previousSibling[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit262_291_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['291'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['291'][1].init(97, 78, 'previousSibling[0] && previousSibling[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit261_291_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['289'][1].init(11396, 16, 'removePreviousBr');
function visit260_289_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['278'][1].init(2632, 7, '!isLast');
function visit259_278_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['259'][1].init(222, 54, '!range.checkStartOfBlock() || !range.checkEndOfBlock()');
function visit258_259_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['255'][1].init(1455, 24, 'block.nodeName() != \'li\'');
function visit257_255_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['247'][1].init(121, 15, 'blockTag || \'p\'');
function visit256_247_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['245'][3].init(880, 24, 'block.nodeName() == \'li\'');
function visit255_245_3(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['245'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['245'][2].init(854, 50, 'self.enforceRealBlocks && block.nodeName() == \'li\'');
function visit254_245_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['245'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['245'][1].init(842, 64, '!block || (self.enforceRealBlocks && block.nodeName() == \'li\')');
function visit253_245_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['242'][1].init(65, 73, 'range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit252_242_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['241'][1].init(47, 139, 'checkLimits[startBlockLimit.nodeName()] && range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit251_241_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['240'][1].init(44, 187, '!self.enforceRealBlocks && checkLimits[startBlockLimit.nodeName()] && range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit250_240_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['239'][2].init(535, 19, '!block || !block[0]');
function visit249_239_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['239'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['239'][1].init(535, 232, '(!block || !block[0]) && !self.enforceRealBlocks && checkLimits[startBlockLimit.nodeName()] && range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit248_239_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['229'][1].init(22, 55, 'self._.docEndMarker && self._.docEndMarker._4e_remove()');
function visit247_229_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['228'][1].init(87, 6, '!range');
function visit246_228_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['226'][1].init(8214, 6, '!block');
function visit245_226_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['221'][2].init(4998, 19, 'closeRange && range');
function visit244_221_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['221'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['221'][1].init(4986, 33, 'isLast || (closeRange && range)');
function visit243_221_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['213'][1].init(4614, 11, 'includeNode');
function visit242_213_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['201'][1].init(87, 37, 'isLast || parentNode.equals(lastNode)');
function visit241_201_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['199'][2].init(127, 30, 'self.forceBrBreak && {\n  br: 1}');
function visit240_199_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['199'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['199'][1].init(96, 62, 'parentNode._4e_isBlockBoundary(self.forceBrBreak && {\n  br: 1})');
function visit239_199_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['196'][1].init(29, 38, '!currentNode[0].nextSibling && !isLast');
function visit238_196_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['195'][1].init(3841, 20, 'range && !closeRange');
function visit237_195_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['191'][2].init(3593, 26, '!closeRange || includeNode');
function visit236_191_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['191'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['191'][1].init(3593, 60, '(!closeRange || includeNode) && currentNode.equals(lastNode)');
function visit235_191_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['185'][1].init(3327, 21, 'includeNode && !range');
function visit234_185_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['179'][1].init(184, 51, 'beginWhitespaceRegex.test(currentNode[0].nodeValue)');
function visit233_179_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['176'][1].init(2808, 49, 'currentNode[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit232_176_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['165'][1].init(112, 6, '!range');
function visit231_165_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['163'][1].init(100, 25, 'currentNode[0].firstChild');
function visit230_163_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['156'][1].init(255, 16, 'nodeName != \'br\'');
function visit229_156_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['151'][1].init(868, 5, 'range');
function visit228_151_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['141'][3].init(315, 16, 'nodeName != \'hr\'');
function visit227_141_3(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['141'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['141'][2].init(278, 53, '!currentNode[0].childNodes.length && nodeName != \'hr\'');
function visit226_141_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['141'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['141'][1].init(268, 63, '!range && !currentNode[0].childNodes.length && nodeName != \'hr\'');
function visit225_141_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['139'][1].init(166, 16, 'nodeName == \'br\'');
function visit224_139_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['136'][2].init(120, 30, 'self.forceBrBreak && {\n  br: 1}');
function visit223_136_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['136'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['136'][1].init(88, 63, 'currentNode._4e_isBlockBoundary(self.forceBrBreak && {\n  br: 1})');
function visit222_136_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['133'][1].init(615, 12, '!includeNode');
function visit221_133_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['128'][1].init(376, 52, 'currentNode[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit220_128_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['108'][1].init(2057, 16, '!self._.lastNode');
function visit219_108_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['102'][1].init(119, 29, 'path.block || path.blockLimit');
function visit218_102_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['100'][1].init(180, 27, 'testRange.checkEndOfBlock()');
function visit217_100_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['96'][3].init(56, 108, '!S.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4e_isBlockBoundary()');
function visit216_96_3(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['96'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['96'][2].init(1306, 53, 'self._.lastNode[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit215_96_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['96'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['96'][1].init(39, 165, 'self._.lastNode[0].nodeType == Dom.NodeType.TEXT_NODE && !S.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4e_isBlockBoundary()');
function visit214_96_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['95'][1].init(1264, 205, 'self._.lastNode && self._.lastNode[0].nodeType == Dom.NodeType.TEXT_NODE && !S.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4e_isBlockBoundary()');
function visit213_95_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['78'][1].init(294, 36, 'self.forceBrBreak || !self.enlargeBr');
function visit212_78_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['70'][1].init(482, 16, '!self._.lastNode');
function visit211_70_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['39'][1].init(301, 25, 'self._ || (self._ = {})');
function visit210_39_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['29'][1].init(14, 20, 'arguments.length < 1');
function visit209_29_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].lineData[10]++;
KISSY.add("editor/domIterator", function(S, Editor) {
  _$jscoverage['/editor/domIterator.js'].functionData[0]++;
  _$jscoverage['/editor/domIterator.js'].lineData[11]++;
  var TRUE = true, FALSE = false, NULL = null, UA = S.UA, Walker = Editor.Walker, KERange = Editor.Range, KER = Editor.RangeType, ElementPath = Editor.ElementPath, Node = S.Node, Dom = S.DOM;
  _$jscoverage['/editor/domIterator.js'].lineData[28]++;
  function Iterator(range) {
    _$jscoverage['/editor/domIterator.js'].functionData[1]++;
    _$jscoverage['/editor/domIterator.js'].lineData[29]++;
    if (visit209_29_1(arguments.length < 1)) {
      _$jscoverage['/editor/domIterator.js'].lineData[30]++;
      return;
    }
    _$jscoverage['/editor/domIterator.js'].lineData[31]++;
    var self = this;
    _$jscoverage['/editor/domIterator.js'].lineData[32]++;
    self.range = range;
    _$jscoverage['/editor/domIterator.js'].lineData[33]++;
    self.forceBrBreak = FALSE;
    _$jscoverage['/editor/domIterator.js'].lineData[36]++;
    self.enlargeBr = TRUE;
    _$jscoverage['/editor/domIterator.js'].lineData[37]++;
    self.enforceRealBlocks = FALSE;
    _$jscoverage['/editor/domIterator.js'].lineData[39]++;
    visit210_39_1(self._ || (self._ = {}));
  }
  _$jscoverage['/editor/domIterator.js'].lineData[42]++;
  var beginWhitespaceRegex = /^[\r\n\t ]*$/;
  _$jscoverage['/editor/domIterator.js'].lineData[44]++;
  S.augment(Iterator, {
  getNextParagraph: function(blockTag) {
  _$jscoverage['/editor/domIterator.js'].functionData[2]++;
  _$jscoverage['/editor/domIterator.js'].lineData[58]++;
  var block, self = this;
  _$jscoverage['/editor/domIterator.js'].lineData[61]++;
  var range;
  _$jscoverage['/editor/domIterator.js'].lineData[64]++;
  var isLast;
  _$jscoverage['/editor/domIterator.js'].lineData[67]++;
  var removePreviousBr, removeLastBr;
  _$jscoverage['/editor/domIterator.js'].lineData[70]++;
  if (visit211_70_1(!self._.lastNode)) {
    _$jscoverage['/editor/domIterator.js'].lineData[71]++;
    range = self.range.clone();
    _$jscoverage['/editor/domIterator.js'].lineData[76]++;
    range.shrink(KER.SHRINK_ELEMENT, TRUE);
    _$jscoverage['/editor/domIterator.js'].lineData[78]++;
    range.enlarge(visit212_78_1(self.forceBrBreak || !self.enlargeBr) ? KER.ENLARGE_LIST_ITEM_CONTENTS : KER.ENLARGE_BLOCK_CONTENTS);
    _$jscoverage['/editor/domIterator.js'].lineData[81]++;
    var walker = new Walker(range), ignoreBookmarkTextEvaluator = Walker.bookmark(TRUE, TRUE);
    _$jscoverage['/editor/domIterator.js'].lineData[84]++;
    walker.evaluator = ignoreBookmarkTextEvaluator;
    _$jscoverage['/editor/domIterator.js'].lineData[85]++;
    self._.nextNode = walker.next();
    _$jscoverage['/editor/domIterator.js'].lineData[87]++;
    walker = new Walker(range);
    _$jscoverage['/editor/domIterator.js'].lineData[88]++;
    walker.evaluator = ignoreBookmarkTextEvaluator;
    _$jscoverage['/editor/domIterator.js'].lineData[89]++;
    var lastNode = walker.previous();
    _$jscoverage['/editor/domIterator.js'].lineData[90]++;
    self._.lastNode = lastNode._4e_nextSourceNode(TRUE);
    _$jscoverage['/editor/domIterator.js'].lineData[95]++;
    if (visit213_95_1(self._.lastNode && visit214_96_1(visit215_96_2(self._.lastNode[0].nodeType == Dom.NodeType.TEXT_NODE) && visit216_96_3(!S.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4e_isBlockBoundary())))) {
      _$jscoverage['/editor/domIterator.js'].lineData[98]++;
      var testRange = new KERange(range.document);
      _$jscoverage['/editor/domIterator.js'].lineData[99]++;
      testRange.moveToPosition(self._.lastNode, KER.POSITION_AFTER_END);
      _$jscoverage['/editor/domIterator.js'].lineData[100]++;
      if (visit217_100_1(testRange.checkEndOfBlock())) {
        _$jscoverage['/editor/domIterator.js'].lineData[101]++;
        var path = new ElementPath(testRange.endContainer);
        _$jscoverage['/editor/domIterator.js'].lineData[102]++;
        var lastBlock = visit218_102_1(path.block || path.blockLimit);
        _$jscoverage['/editor/domIterator.js'].lineData[103]++;
        self._.lastNode = lastBlock._4e_nextSourceNode(TRUE);
      }
    }
    _$jscoverage['/editor/domIterator.js'].lineData[108]++;
    if (visit219_108_1(!self._.lastNode)) {
      _$jscoverage['/editor/domIterator.js'].lineData[109]++;
      self._.lastNode = self._.docEndMarker = new Node(range.document.createTextNode(''));
      _$jscoverage['/editor/domIterator.js'].lineData[110]++;
      Dom.insertAfter(self._.lastNode[0], lastNode[0]);
    }
    _$jscoverage['/editor/domIterator.js'].lineData[114]++;
    range = NULL;
  }
  _$jscoverage['/editor/domIterator.js'].lineData[117]++;
  var currentNode = self._.nextNode;
  _$jscoverage['/editor/domIterator.js'].lineData[118]++;
  lastNode = self._.lastNode;
  _$jscoverage['/editor/domIterator.js'].lineData[120]++;
  self._.nextNode = NULL;
  _$jscoverage['/editor/domIterator.js'].lineData[121]++;
  while (currentNode) {
    _$jscoverage['/editor/domIterator.js'].lineData[124]++;
    var closeRange = FALSE;
    _$jscoverage['/editor/domIterator.js'].lineData[128]++;
    var includeNode = (visit220_128_1(currentNode[0].nodeType != Dom.NodeType.ELEMENT_NODE)), continueFromSibling = FALSE;
    _$jscoverage['/editor/domIterator.js'].lineData[133]++;
    if (visit221_133_1(!includeNode)) {
      _$jscoverage['/editor/domIterator.js'].lineData[134]++;
      var nodeName = currentNode.nodeName();
      _$jscoverage['/editor/domIterator.js'].lineData[136]++;
      if (visit222_136_1(currentNode._4e_isBlockBoundary(visit223_136_2(self.forceBrBreak && {
  br: 1})))) {
        _$jscoverage['/editor/domIterator.js'].lineData[139]++;
        if (visit224_139_1(nodeName == 'br')) {
          _$jscoverage['/editor/domIterator.js'].lineData[140]++;
          includeNode = TRUE;
        } else {
          _$jscoverage['/editor/domIterator.js'].lineData[141]++;
          if (visit225_141_1(!range && visit226_141_2(!currentNode[0].childNodes.length && visit227_141_3(nodeName != 'hr')))) {
            _$jscoverage['/editor/domIterator.js'].lineData[144]++;
            block = currentNode;
            _$jscoverage['/editor/domIterator.js'].lineData[145]++;
            isLast = currentNode.equals(lastNode);
            _$jscoverage['/editor/domIterator.js'].lineData[146]++;
            break;
          }
        }
        _$jscoverage['/editor/domIterator.js'].lineData[151]++;
        if (visit228_151_1(range)) {
          _$jscoverage['/editor/domIterator.js'].lineData[152]++;
          range.setEndAt(currentNode, KER.POSITION_BEFORE_START);
          _$jscoverage['/editor/domIterator.js'].lineData[156]++;
          if (visit229_156_1(nodeName != 'br')) {
            _$jscoverage['/editor/domIterator.js'].lineData[157]++;
            self._.nextNode = currentNode;
          }
        }
        _$jscoverage['/editor/domIterator.js'].lineData[160]++;
        closeRange = TRUE;
      } else {
        _$jscoverage['/editor/domIterator.js'].lineData[163]++;
        if (visit230_163_1(currentNode[0].firstChild)) {
          _$jscoverage['/editor/domIterator.js'].lineData[165]++;
          if (visit231_165_1(!range)) {
            _$jscoverage['/editor/domIterator.js'].lineData[166]++;
            range = new KERange(self.range.document);
            _$jscoverage['/editor/domIterator.js'].lineData[167]++;
            range.setStartAt(currentNode, KER.POSITION_BEFORE_START);
          }
          _$jscoverage['/editor/domIterator.js'].lineData[170]++;
          currentNode = new Node(currentNode[0].firstChild);
          _$jscoverage['/editor/domIterator.js'].lineData[171]++;
          continue;
        }
        _$jscoverage['/editor/domIterator.js'].lineData[173]++;
        includeNode = TRUE;
      }
    } else {
      _$jscoverage['/editor/domIterator.js'].lineData[176]++;
      if (visit232_176_1(currentNode[0].nodeType == Dom.NodeType.TEXT_NODE)) {
        _$jscoverage['/editor/domIterator.js'].lineData[179]++;
        if (visit233_179_1(beginWhitespaceRegex.test(currentNode[0].nodeValue))) {
          _$jscoverage['/editor/domIterator.js'].lineData[180]++;
          includeNode = FALSE;
        }
      }
    }
    _$jscoverage['/editor/domIterator.js'].lineData[185]++;
    if (visit234_185_1(includeNode && !range)) {
      _$jscoverage['/editor/domIterator.js'].lineData[186]++;
      range = new KERange(self.range.document);
      _$jscoverage['/editor/domIterator.js'].lineData[187]++;
      range.setStartAt(currentNode, KER.POSITION_BEFORE_START);
    }
    _$jscoverage['/editor/domIterator.js'].lineData[191]++;
    isLast = visit235_191_1((visit236_191_2(!closeRange || includeNode)) && currentNode.equals(lastNode));
    _$jscoverage['/editor/domIterator.js'].lineData[195]++;
    if (visit237_195_1(range && !closeRange)) {
      _$jscoverage['/editor/domIterator.js'].lineData[196]++;
      while (visit238_196_1(!currentNode[0].nextSibling && !isLast)) {
        _$jscoverage['/editor/domIterator.js'].lineData[197]++;
        var parentNode = currentNode.parent();
        _$jscoverage['/editor/domIterator.js'].lineData[199]++;
        if (visit239_199_1(parentNode._4e_isBlockBoundary(visit240_199_2(self.forceBrBreak && {
  br: 1})))) {
          _$jscoverage['/editor/domIterator.js'].lineData[200]++;
          closeRange = TRUE;
          _$jscoverage['/editor/domIterator.js'].lineData[201]++;
          isLast = visit241_201_1(isLast || parentNode.equals(lastNode));
          _$jscoverage['/editor/domIterator.js'].lineData[202]++;
          break;
        }
        _$jscoverage['/editor/domIterator.js'].lineData[205]++;
        currentNode = parentNode;
        _$jscoverage['/editor/domIterator.js'].lineData[206]++;
        includeNode = TRUE;
        _$jscoverage['/editor/domIterator.js'].lineData[207]++;
        isLast = currentNode.equals(lastNode);
        _$jscoverage['/editor/domIterator.js'].lineData[208]++;
        continueFromSibling = TRUE;
      }
    }
    _$jscoverage['/editor/domIterator.js'].lineData[213]++;
    if (visit242_213_1(includeNode)) {
      _$jscoverage['/editor/domIterator.js'].lineData[214]++;
      range.setEndAt(currentNode, KER.POSITION_AFTER_END);
    }
    _$jscoverage['/editor/domIterator.js'].lineData[216]++;
    currentNode = currentNode._4e_nextSourceNode(continueFromSibling, NULL, lastNode);
    _$jscoverage['/editor/domIterator.js'].lineData[217]++;
    isLast = !currentNode;
    _$jscoverage['/editor/domIterator.js'].lineData[221]++;
    if (visit243_221_1(isLast || (visit244_221_2(closeRange && range)))) {
      _$jscoverage['/editor/domIterator.js'].lineData[222]++;
      break;
    }
  }
  _$jscoverage['/editor/domIterator.js'].lineData[226]++;
  if (visit245_226_1(!block)) {
    _$jscoverage['/editor/domIterator.js'].lineData[228]++;
    if (visit246_228_1(!range)) {
      _$jscoverage['/editor/domIterator.js'].lineData[229]++;
      visit247_229_1(self._.docEndMarker && self._.docEndMarker._4e_remove());
      _$jscoverage['/editor/domIterator.js'].lineData[230]++;
      self._.nextNode = NULL;
      _$jscoverage['/editor/domIterator.js'].lineData[231]++;
      return NULL;
    }
    _$jscoverage['/editor/domIterator.js'].lineData[234]++;
    var startPath = new ElementPath(range.startContainer);
    _$jscoverage['/editor/domIterator.js'].lineData[235]++;
    var startBlockLimit = startPath.blockLimit, checkLimits = {
  div: 1, 
  th: 1, 
  td: 1};
    _$jscoverage['/editor/domIterator.js'].lineData[237]++;
    block = startPath.block;
    _$jscoverage['/editor/domIterator.js'].lineData[239]++;
    if (visit248_239_1((visit249_239_2(!block || !block[0])) && visit250_240_1(!self.enforceRealBlocks && visit251_241_1(checkLimits[startBlockLimit.nodeName()] && visit252_242_1(range.checkStartOfBlock() && range.checkEndOfBlock()))))) {
      _$jscoverage['/editor/domIterator.js'].lineData[244]++;
      block = startBlockLimit;
    } else {
      _$jscoverage['/editor/domIterator.js'].lineData[245]++;
      if (visit253_245_1(!block || (visit254_245_2(self.enforceRealBlocks && visit255_245_3(block.nodeName() == 'li'))))) {
        _$jscoverage['/editor/domIterator.js'].lineData[247]++;
        block = new Node(self.range.document.createElement(visit256_247_1(blockTag || 'p')));
        _$jscoverage['/editor/domIterator.js'].lineData[249]++;
        block[0].appendChild(range.extractContents());
        _$jscoverage['/editor/domIterator.js'].lineData[250]++;
        block._4e_trim();
        _$jscoverage['/editor/domIterator.js'].lineData[252]++;
        range.insertNode(block);
        _$jscoverage['/editor/domIterator.js'].lineData[253]++;
        removePreviousBr = removeLastBr = TRUE;
      } else {
        _$jscoverage['/editor/domIterator.js'].lineData[255]++;
        if (visit257_255_1(block.nodeName() != 'li')) {
          _$jscoverage['/editor/domIterator.js'].lineData[259]++;
          if (visit258_259_1(!range.checkStartOfBlock() || !range.checkEndOfBlock())) {
            _$jscoverage['/editor/domIterator.js'].lineData[261]++;
            block = block.clone(FALSE);
            _$jscoverage['/editor/domIterator.js'].lineData[264]++;
            block[0].appendChild(range.extractContents());
            _$jscoverage['/editor/domIterator.js'].lineData[265]++;
            block._4e_trim();
            _$jscoverage['/editor/domIterator.js'].lineData[269]++;
            var splitInfo = range.splitBlock();
            _$jscoverage['/editor/domIterator.js'].lineData[271]++;
            removePreviousBr = !splitInfo.wasStartOfBlock;
            _$jscoverage['/editor/domIterator.js'].lineData[272]++;
            removeLastBr = !splitInfo.wasEndOfBlock;
            _$jscoverage['/editor/domIterator.js'].lineData[275]++;
            range.insertNode(block);
          }
        } else {
          _$jscoverage['/editor/domIterator.js'].lineData[278]++;
          if (visit259_278_1(!isLast)) {
            _$jscoverage['/editor/domIterator.js'].lineData[284]++;
            self._.nextNode = (block.equals(lastNode) ? NULL : range.getBoundaryNodes().endNode._4e_nextSourceNode(TRUE, NULL, lastNode));
          }
        }
      }
    }
  }
  _$jscoverage['/editor/domIterator.js'].lineData[289]++;
  if (visit260_289_1(removePreviousBr)) {
    _$jscoverage['/editor/domIterator.js'].lineData[290]++;
    var previousSibling = new Node(block[0].previousSibling);
    _$jscoverage['/editor/domIterator.js'].lineData[291]++;
    if (visit261_291_1(previousSibling[0] && visit262_291_2(previousSibling[0].nodeType == Dom.NodeType.ELEMENT_NODE))) {
      _$jscoverage['/editor/domIterator.js'].lineData[292]++;
      if (visit263_292_1(previousSibling.nodeName() == 'br')) {
        _$jscoverage['/editor/domIterator.js'].lineData[293]++;
        previousSibling._4e_remove();
      } else {
        _$jscoverage['/editor/domIterator.js'].lineData[294]++;
        if (visit264_294_1(previousSibling[0].lastChild && visit265_294_2(Dom.nodeName(previousSibling[0].lastChild) == 'br'))) {
          _$jscoverage['/editor/domIterator.js'].lineData[295]++;
          Dom._4e_remove(previousSibling[0].lastChild);
        }
      }
    }
  }
  _$jscoverage['/editor/domIterator.js'].lineData[299]++;
  if (visit266_299_1(removeLastBr)) {
    _$jscoverage['/editor/domIterator.js'].lineData[301]++;
    var bookmarkGuard = Walker.bookmark(FALSE, TRUE);
    _$jscoverage['/editor/domIterator.js'].lineData[303]++;
    var lastChild = new Node(block[0].lastChild);
    _$jscoverage['/editor/domIterator.js'].lineData[304]++;
    if (visit267_304_1(lastChild[0] && visit268_304_2(visit269_304_3(lastChild[0].nodeType == Dom.NodeType.ELEMENT_NODE) && visit270_304_4(lastChild.nodeName() == 'br')))) {
      _$jscoverage['/editor/domIterator.js'].lineData[306]++;
      if (visit271_306_1(UA['ie'] || visit272_307_1(lastChild.prev(bookmarkGuard, 1) || lastChild.next(bookmarkGuard, 1)))) {
        _$jscoverage['/editor/domIterator.js'].lineData[309]++;
        lastChild.remove();
      }
    }
  }
  _$jscoverage['/editor/domIterator.js'].lineData[316]++;
  if (visit273_316_1(!self._.nextNode)) {
    _$jscoverage['/editor/domIterator.js'].lineData[317]++;
    self._.nextNode = (visit274_317_1(isLast || block.equals(lastNode))) ? NULL : block._4e_nextSourceNode(TRUE, NULL, lastNode);
  }
  _$jscoverage['/editor/domIterator.js'].lineData[321]++;
  return block;
}});
  _$jscoverage['/editor/domIterator.js'].lineData[330]++;
  KERange.prototype.createIterator = function() {
  _$jscoverage['/editor/domIterator.js'].functionData[3]++;
  _$jscoverage['/editor/domIterator.js'].lineData[331]++;
  return new Iterator(this);
};
  _$jscoverage['/editor/domIterator.js'].lineData[334]++;
  return Iterator;
}, {
  requires: ['./base', './range', './elementPath', './walker', 'node']});
