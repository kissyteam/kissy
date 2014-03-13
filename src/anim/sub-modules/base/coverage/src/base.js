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
  _$jscoverage['/base.js'].lineData[19] = 0;
  _$jscoverage['/base.js'].lineData[25] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[32] = 0;
  _$jscoverage['/base.js'].lineData[61] = 0;
  _$jscoverage['/base.js'].lineData[62] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[66] = 0;
  _$jscoverage['/base.js'].lineData[69] = 0;
  _$jscoverage['/base.js'].lineData[70] = 0;
  _$jscoverage['/base.js'].lineData[71] = 0;
  _$jscoverage['/base.js'].lineData[72] = 0;
  _$jscoverage['/base.js'].lineData[73] = 0;
  _$jscoverage['/base.js'].lineData[74] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[77] = 0;
  _$jscoverage['/base.js'].lineData[82] = 0;
  _$jscoverage['/base.js'].lineData[85] = 0;
  _$jscoverage['/base.js'].lineData[86] = 0;
  _$jscoverage['/base.js'].lineData[88] = 0;
  _$jscoverage['/base.js'].lineData[91] = 0;
  _$jscoverage['/base.js'].lineData[92] = 0;
  _$jscoverage['/base.js'].lineData[94] = 0;
  _$jscoverage['/base.js'].lineData[95] = 0;
  _$jscoverage['/base.js'].lineData[98] = 0;
  _$jscoverage['/base.js'].lineData[99] = 0;
  _$jscoverage['/base.js'].lineData[102] = 0;
  _$jscoverage['/base.js'].lineData[105] = 0;
  _$jscoverage['/base.js'].lineData[106] = 0;
  _$jscoverage['/base.js'].lineData[112] = 0;
  _$jscoverage['/base.js'].lineData[114] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[117] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[120] = 0;
  _$jscoverage['/base.js'].lineData[121] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[133] = 0;
  _$jscoverage['/base.js'].lineData[144] = 0;
  _$jscoverage['/base.js'].lineData[147] = 0;
  _$jscoverage['/base.js'].lineData[148] = 0;
  _$jscoverage['/base.js'].lineData[149] = 0;
  _$jscoverage['/base.js'].lineData[153] = 0;
  _$jscoverage['/base.js'].lineData[163] = 0;
  _$jscoverage['/base.js'].lineData[166] = 0;
  _$jscoverage['/base.js'].lineData[171] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[177] = 0;
  _$jscoverage['/base.js'].lineData[179] = 0;
  _$jscoverage['/base.js'].lineData[181] = 0;
  _$jscoverage['/base.js'].lineData[182] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[189] = 0;
  _$jscoverage['/base.js'].lineData[190] = 0;
  _$jscoverage['/base.js'].lineData[191] = 0;
  _$jscoverage['/base.js'].lineData[192] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[195] = 0;
  _$jscoverage['/base.js'].lineData[197] = 0;
  _$jscoverage['/base.js'].lineData[198] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[202] = 0;
  _$jscoverage['/base.js'].lineData[203] = 0;
  _$jscoverage['/base.js'].lineData[204] = 0;
  _$jscoverage['/base.js'].lineData[206] = 0;
  _$jscoverage['/base.js'].lineData[207] = 0;
  _$jscoverage['/base.js'].lineData[209] = 0;
  _$jscoverage['/base.js'].lineData[211] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[217] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[225] = 0;
  _$jscoverage['/base.js'].lineData[226] = 0;
  _$jscoverage['/base.js'].lineData[227] = 0;
  _$jscoverage['/base.js'].lineData[228] = 0;
  _$jscoverage['/base.js'].lineData[229] = 0;
  _$jscoverage['/base.js'].lineData[232] = 0;
  _$jscoverage['/base.js'].lineData[233] = 0;
  _$jscoverage['/base.js'].lineData[242] = 0;
  _$jscoverage['/base.js'].lineData[250] = 0;
  _$jscoverage['/base.js'].lineData[259] = 0;
  _$jscoverage['/base.js'].lineData[260] = 0;
  _$jscoverage['/base.js'].lineData[262] = 0;
  _$jscoverage['/base.js'].lineData[263] = 0;
  _$jscoverage['/base.js'].lineData[264] = 0;
  _$jscoverage['/base.js'].lineData[265] = 0;
  _$jscoverage['/base.js'].lineData[266] = 0;
  _$jscoverage['/base.js'].lineData[267] = 0;
  _$jscoverage['/base.js'].lineData[269] = 0;
  _$jscoverage['/base.js'].lineData[272] = 0;
  _$jscoverage['/base.js'].lineData[294] = 0;
  _$jscoverage['/base.js'].lineData[295] = 0;
  _$jscoverage['/base.js'].lineData[297] = 0;
  _$jscoverage['/base.js'].lineData[298] = 0;
  _$jscoverage['/base.js'].lineData[299] = 0;
  _$jscoverage['/base.js'].lineData[300] = 0;
  _$jscoverage['/base.js'].lineData[301] = 0;
  _$jscoverage['/base.js'].lineData[302] = 0;
  _$jscoverage['/base.js'].lineData[305] = 0;
  _$jscoverage['/base.js'].lineData[306] = 0;
  _$jscoverage['/base.js'].lineData[309] = 0;
  _$jscoverage['/base.js'].lineData[324] = 0;
  _$jscoverage['/base.js'].lineData[328] = 0;
  _$jscoverage['/base.js'].lineData[329] = 0;
  _$jscoverage['/base.js'].lineData[332] = 0;
  _$jscoverage['/base.js'].lineData[333] = 0;
  _$jscoverage['/base.js'].lineData[334] = 0;
  _$jscoverage['/base.js'].lineData[338] = 0;
  _$jscoverage['/base.js'].lineData[347] = 0;
  _$jscoverage['/base.js'].lineData[352] = 0;
  _$jscoverage['/base.js'].lineData[353] = 0;
  _$jscoverage['/base.js'].lineData[356] = 0;
  _$jscoverage['/base.js'].lineData[357] = 0;
  _$jscoverage['/base.js'].lineData[358] = 0;
  _$jscoverage['/base.js'].lineData[361] = 0;
  _$jscoverage['/base.js'].lineData[362] = 0;
  _$jscoverage['/base.js'].lineData[364] = 0;
  _$jscoverage['/base.js'].lineData[366] = 0;
  _$jscoverage['/base.js'].lineData[369] = 0;
  _$jscoverage['/base.js'].lineData[370] = 0;
  _$jscoverage['/base.js'].lineData[371] = 0;
  _$jscoverage['/base.js'].lineData[373] = 0;
  _$jscoverage['/base.js'].lineData[374] = 0;
  _$jscoverage['/base.js'].lineData[375] = 0;
  _$jscoverage['/base.js'].lineData[376] = 0;
  _$jscoverage['/base.js'].lineData[378] = 0;
  _$jscoverage['/base.js'].lineData[381] = 0;
  _$jscoverage['/base.js'].lineData[383] = 0;
  _$jscoverage['/base.js'].lineData[384] = 0;
  _$jscoverage['/base.js'].lineData[385] = 0;
  _$jscoverage['/base.js'].lineData[388] = 0;
  _$jscoverage['/base.js'].lineData[392] = 0;
  _$jscoverage['/base.js'].lineData[399] = 0;
  _$jscoverage['/base.js'].lineData[400] = 0;
  _$jscoverage['/base.js'].lineData[401] = 0;
  _$jscoverage['/base.js'].lineData[409] = 0;
  _$jscoverage['/base.js'].lineData[411] = 0;
  _$jscoverage['/base.js'].lineData[415] = 0;
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
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['28'] = [];
  _$jscoverage['/base.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['31'] = [];
  _$jscoverage['/base.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['65'] = [];
  _$jscoverage['/base.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['69'] = [];
  _$jscoverage['/base.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['73'] = [];
  _$jscoverage['/base.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['76'] = [];
  _$jscoverage['/base.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['85'] = [];
  _$jscoverage['/base.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['91'] = [];
  _$jscoverage['/base.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['94'] = [];
  _$jscoverage['/base.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['116'] = [];
  _$jscoverage['/base.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['140'] = [];
  _$jscoverage['/base.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['148'] = [];
  _$jscoverage['/base.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['163'] = [];
  _$jscoverage['/base.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['166'] = [];
  _$jscoverage['/base.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['179'] = [];
  _$jscoverage['/base.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['179'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['180'] = [];
  _$jscoverage['/base.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['181'] = [];
  _$jscoverage['/base.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['190'] = [];
  _$jscoverage['/base.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['194'] = [];
  _$jscoverage['/base.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['195'] = [];
  _$jscoverage['/base.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['195'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['195'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['195'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['195'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['203'] = [];
  _$jscoverage['/base.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['206'] = [];
  _$jscoverage['/base.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['220'] = [];
  _$jscoverage['/base.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['226'] = [];
  _$jscoverage['/base.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['260'] = [];
  _$jscoverage['/base.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['266'] = [];
  _$jscoverage['/base.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['295'] = [];
  _$jscoverage['/base.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['300'] = [];
  _$jscoverage['/base.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['328'] = [];
  _$jscoverage['/base.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['333'] = [];
  _$jscoverage['/base.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['352'] = [];
  _$jscoverage['/base.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['356'] = [];
  _$jscoverage['/base.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['361'] = [];
  _$jscoverage['/base.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['362'] = [];
  _$jscoverage['/base.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['374'] = [];
  _$jscoverage['/base.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['381'] = [];
  _$jscoverage['/base.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['384'] = [];
  _$jscoverage['/base.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['403'] = [];
  _$jscoverage['/base.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['403'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['405'] = [];
  _$jscoverage['/base.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['405'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['407'] = [];
  _$jscoverage['/base.js'].branchData['407'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['407'][1].init(103, 15, 'queue === false');
function visit80_407_1(result) {
  _$jscoverage['/base.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['405'][2].init(155, 25, 'typeof queue === \'string\'');
function visit79_405_2(result) {
  _$jscoverage['/base.js'].branchData['405'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['405'][1].init(86, 119, 'typeof queue === \'string\' || queue === false');
function visit78_405_1(result) {
  _$jscoverage['/base.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['403'][2].init(67, 14, 'queue === null');
function visit77_403_2(result) {
  _$jscoverage['/base.js'].branchData['403'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['403'][1].init(51, 206, 'queue === null || typeof queue === \'string\' || queue === false');
function visit76_403_1(result) {
  _$jscoverage['/base.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['384'][1].init(129, 9, 'q && q[0]');
function visit75_384_1(result) {
  _$jscoverage['/base.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['381'][1].init(1011, 15, 'queue !== false');
function visit74_381_1(result) {
  _$jscoverage['/base.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['374'][1].init(829, 6, 'finish');
function visit73_374_1(result) {
  _$jscoverage['/base.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['362'][1].init(22, 15, 'queue !== false');
function visit72_362_1(result) {
  _$jscoverage['/base.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['361'][1].init(403, 37, '!self.isRunning() && !self.isPaused()');
function visit71_361_1(result) {
  _$jscoverage['/base.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['356'][1].init(255, 18, 'self.__waitTimeout');
function visit70_356_1(result) {
  _$jscoverage['/base.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['352'][1].init(149, 38, 'self.isResolved() || self.isRejected()');
function visit69_352_1(result) {
  _$jscoverage['/base.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['333'][1].init(107, 14, 'q.length === 1');
function visit68_333_1(result) {
  _$jscoverage['/base.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['328'][1].init(114, 15, 'queue === false');
function visit67_328_1(result) {
  _$jscoverage['/base.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['300'][1].init(234, 18, 'self.__waitTimeout');
function visit66_300_1(result) {
  _$jscoverage['/base.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['295'][1].init(48, 15, 'self.isPaused()');
function visit65_295_1(result) {
  _$jscoverage['/base.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['266'][1].init(263, 18, 'self.__waitTimeout');
function visit64_266_1(result) {
  _$jscoverage['/base.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['260'][1].init(48, 16, 'self.isRunning()');
function visit63_260_1(result) {
  _$jscoverage['/base.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['226'][1].init(3920, 27, 'S.isEmptyObject(_propsData)');
function visit62_226_1(result) {
  _$jscoverage['/base.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['220'][1].init(2701, 14, 'exit === false');
function visit61_220_1(result) {
  _$jscoverage['/base.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['206'][1].init(597, 14, 'val === \'hide\'');
function visit60_206_1(result) {
  _$jscoverage['/base.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['203'][1].init(460, 16, 'val === \'toggle\'');
function visit59_203_1(result) {
  _$jscoverage['/base.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['195'][5].init(58, 14, 'val === \'show\'');
function visit58_195_5(result) {
  _$jscoverage['/base.js'].branchData['195'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['195'][4].init(58, 25, 'val === \'show\' && !hidden');
function visit57_195_4(result) {
  _$jscoverage['/base.js'].branchData['195'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['195'][3].init(30, 14, 'val === \'hide\'');
function visit56_195_3(result) {
  _$jscoverage['/base.js'].branchData['195'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['195'][2].init(30, 24, 'val === \'hide\' && hidden');
function visit55_195_2(result) {
  _$jscoverage['/base.js'].branchData['195'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['195'][1].init(30, 53, 'val === \'hide\' && hidden || val === \'show\' && !hidden');
function visit54_195_1(result) {
  _$jscoverage['/base.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['194'][1].init(99, 16, 'specialVals[val]');
function visit53_194_1(result) {
  _$jscoverage['/base.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['190'][1].init(1327, 35, 'Dom.css(node, \'display\') === \'none\'');
function visit52_190_1(result) {
  _$jscoverage['/base.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['181'][1].init(30, 16, 'S.UA.ieMode < 10');
function visit51_181_1(result) {
  _$jscoverage['/base.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['180'][1].init(65, 33, 'Dom.css(node, \'float\') === \'none\'');
function visit50_180_1(result) {
  _$jscoverage['/base.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['179'][2].init(697, 37, 'Dom.css(node, \'display\') === \'inline\'');
function visit49_179_2(result) {
  _$jscoverage['/base.js'].branchData['179'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['179'][1].init(697, 99, 'Dom.css(node, \'display\') === \'inline\' && Dom.css(node, \'float\') === \'none\'');
function visit48_179_1(result) {
  _$jscoverage['/base.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['166'][1].init(177, 21, 'to.width || to.height');
function visit47_166_1(result) {
  _$jscoverage['/base.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['163'][1].init(1038, 39, 'node.nodeType === NodeType.ELEMENT_NODE');
function visit46_163_1(result) {
  _$jscoverage['/base.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['148'][1].init(22, 21, '!S.isPlainObject(val)');
function visit45_148_1(result) {
  _$jscoverage['/base.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['140'][1].init(276, 17, 'config.delay || 0');
function visit44_140_1(result) {
  _$jscoverage['/base.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['116'][1].init(1639, 22, '!S.isPlainObject(node)');
function visit43_116_1(result) {
  _$jscoverage['/base.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['94'][1].init(211, 6, 'easing');
function visit42_94_1(result) {
  _$jscoverage['/base.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['91'][1].init(110, 8, 'duration');
function visit41_91_1(result) {
  _$jscoverage['/base.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['85'][1].init(698, 25, 'S.isPlainObject(duration)');
function visit40_85_1(result) {
  _$jscoverage['/base.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['76'][2].init(204, 17, 'trimProp !== prop');
function visit39_76_2(result) {
  _$jscoverage['/base.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['76'][1].init(191, 30, '!trimProp || trimProp !== prop');
function visit38_76_1(result) {
  _$jscoverage['/base.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['73'][1].init(76, 8, 'trimProp');
function visit37_73_1(result) {
  _$jscoverage['/base.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['69'][1].init(60, 22, 'typeof to === \'string\'');
function visit36_69_1(result) {
  _$jscoverage['/base.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['65'][1].init(63, 9, 'node.node');
function visit35_65_1(result) {
  _$jscoverage['/base.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['31'][1].init(244, 8, 'complete');
function visit34_31_1(result) {
  _$jscoverage['/base.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['28'][1].init(119, 50, '!S.isEmptyObject(_backupProps = self._backupProps)');
function visit33_28_1(result) {
  _$jscoverage['/base.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Dom = require('dom'), Utils = require('./base/utils'), Q = require('./base/queue'), Promise = require('promise'), NodeType = Dom.NodeType, noop = S.noop, specialVals = {
  toggle: 1, 
  hide: 1, 
  show: 1};
  _$jscoverage['/base.js'].lineData[19]++;
  var defaultConfig = {
  duration: 1, 
  easing: 'linear'};
  _$jscoverage['/base.js'].lineData[25]++;
  function syncComplete(self) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[26]++;
    var _backupProps, complete = self.config.complete;
    _$jscoverage['/base.js'].lineData[28]++;
    if (visit33_28_1(!S.isEmptyObject(_backupProps = self._backupProps))) {
      _$jscoverage['/base.js'].lineData[29]++;
      Dom.css(self.node, _backupProps);
    }
    _$jscoverage['/base.js'].lineData[31]++;
    if (visit34_31_1(complete)) {
      _$jscoverage['/base.js'].lineData[32]++;
      complete.call(self);
    }
  }
  _$jscoverage['/base.js'].lineData[61]++;
  function AnimBase(node, to, duration, easing, complete) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[62]++;
    var self = this;
    _$jscoverage['/base.js'].lineData[63]++;
    var config;
    _$jscoverage['/base.js'].lineData[65]++;
    if (visit35_65_1(node.node)) {
      _$jscoverage['/base.js'].lineData[66]++;
      config = node;
    } else {
      _$jscoverage['/base.js'].lineData[69]++;
      if (visit36_69_1(typeof to === 'string')) {
        _$jscoverage['/base.js'].lineData[70]++;
        to = S.unparam(String(to), ';', ':');
        _$jscoverage['/base.js'].lineData[71]++;
        S.each(to, function(value, prop) {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[72]++;
  var trimProp = S.trim(prop);
  _$jscoverage['/base.js'].lineData[73]++;
  if (visit37_73_1(trimProp)) {
    _$jscoverage['/base.js'].lineData[74]++;
    to[trimProp] = S.trim(value);
  }
  _$jscoverage['/base.js'].lineData[76]++;
  if (visit38_76_1(!trimProp || visit39_76_2(trimProp !== prop))) {
    _$jscoverage['/base.js'].lineData[77]++;
    delete to[prop];
  }
});
      } else {
        _$jscoverage['/base.js'].lineData[82]++;
        to = S.clone(to);
      }
      _$jscoverage['/base.js'].lineData[85]++;
      if (visit40_85_1(S.isPlainObject(duration))) {
        _$jscoverage['/base.js'].lineData[86]++;
        config = S.clone(duration);
      } else {
        _$jscoverage['/base.js'].lineData[88]++;
        config = {
  complete: complete};
        _$jscoverage['/base.js'].lineData[91]++;
        if (visit41_91_1(duration)) {
          _$jscoverage['/base.js'].lineData[92]++;
          config.duration = duration;
        }
        _$jscoverage['/base.js'].lineData[94]++;
        if (visit42_94_1(easing)) {
          _$jscoverage['/base.js'].lineData[95]++;
          config.easing = easing;
        }
      }
      _$jscoverage['/base.js'].lineData[98]++;
      config.node = node;
      _$jscoverage['/base.js'].lineData[99]++;
      config.to = to;
    }
    _$jscoverage['/base.js'].lineData[102]++;
    config = S.merge(defaultConfig, config);
    _$jscoverage['/base.js'].lineData[105]++;
    AnimBase.superclass.constructor.call(self);
    _$jscoverage['/base.js'].lineData[106]++;
    Promise.Defer(self);
    _$jscoverage['/base.js'].lineData[112]++;
    self.config = config;
    _$jscoverage['/base.js'].lineData[114]++;
    node = config.node;
    _$jscoverage['/base.js'].lineData[116]++;
    if (visit43_116_1(!S.isPlainObject(node))) {
      _$jscoverage['/base.js'].lineData[117]++;
      node = Dom.get(config.node);
    }
    _$jscoverage['/base.js'].lineData[119]++;
    self.node = self.el = node;
    _$jscoverage['/base.js'].lineData[120]++;
    self._backupProps = {};
    _$jscoverage['/base.js'].lineData[121]++;
    self._propsData = {};
  }
  _$jscoverage['/base.js'].lineData[124]++;
  S.extend(AnimBase, Promise, {
  prepareFx: noop, 
  runInternal: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[133]++;
  var self = this, config = self.config, node = self.node, val, _backupProps = self._backupProps, _propsData = self._propsData, to = config.to, defaultDelay = (visit44_140_1(config.delay || 0)), defaultDuration = config.duration;
  _$jscoverage['/base.js'].lineData[144]++;
  Utils.saveRunningAnim(self);
  _$jscoverage['/base.js'].lineData[147]++;
  S.each(to, function(val, prop) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[148]++;
  if (visit45_148_1(!S.isPlainObject(val))) {
    _$jscoverage['/base.js'].lineData[149]++;
    val = {
  value: val};
  }
  _$jscoverage['/base.js'].lineData[153]++;
  _propsData[prop] = S.mix({
  delay: defaultDelay, 
  easing: config.easing, 
  frame: config.frame, 
  duration: defaultDuration}, val);
});
  _$jscoverage['/base.js'].lineData[163]++;
  if (visit46_163_1(node.nodeType === NodeType.ELEMENT_NODE)) {
    _$jscoverage['/base.js'].lineData[166]++;
    if (visit47_166_1(to.width || to.height)) {
      _$jscoverage['/base.js'].lineData[171]++;
      var elStyle = node.style;
      _$jscoverage['/base.js'].lineData[172]++;
      S.mix(_backupProps, {
  overflow: elStyle.overflow, 
  'overflow-x': elStyle.overflowX, 
  'overflow-y': elStyle.overflowY});
      _$jscoverage['/base.js'].lineData[177]++;
      elStyle.overflow = 'hidden';
      _$jscoverage['/base.js'].lineData[179]++;
      if (visit48_179_1(visit49_179_2(Dom.css(node, 'display') === 'inline') && visit50_180_1(Dom.css(node, 'float') === 'none'))) {
        _$jscoverage['/base.js'].lineData[181]++;
        if (visit51_181_1(S.UA.ieMode < 10)) {
          _$jscoverage['/base.js'].lineData[182]++;
          elStyle.zoom = 1;
        } else {
          _$jscoverage['/base.js'].lineData[184]++;
          elStyle.display = 'inline-block';
        }
      }
    }
    _$jscoverage['/base.js'].lineData[189]++;
    var exit, hidden;
    _$jscoverage['/base.js'].lineData[190]++;
    hidden = (visit52_190_1(Dom.css(node, 'display') === 'none'));
    _$jscoverage['/base.js'].lineData[191]++;
    S.each(_propsData, function(_propData, prop) {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[192]++;
  val = _propData.value;
  _$jscoverage['/base.js'].lineData[194]++;
  if (visit53_194_1(specialVals[val])) {
    _$jscoverage['/base.js'].lineData[195]++;
    if (visit54_195_1(visit55_195_2(visit56_195_3(val === 'hide') && hidden) || visit57_195_4(visit58_195_5(val === 'show') && !hidden))) {
      _$jscoverage['/base.js'].lineData[197]++;
      self.stop(true);
      _$jscoverage['/base.js'].lineData[198]++;
      exit = false;
      _$jscoverage['/base.js'].lineData[199]++;
      return exit;
    }
    _$jscoverage['/base.js'].lineData[202]++;
    _backupProps[prop] = Dom.style(node, prop);
    _$jscoverage['/base.js'].lineData[203]++;
    if (visit59_203_1(val === 'toggle')) {
      _$jscoverage['/base.js'].lineData[204]++;
      val = hidden ? 'show' : 'hide';
    }
    _$jscoverage['/base.js'].lineData[206]++;
    if (visit60_206_1(val === 'hide')) {
      _$jscoverage['/base.js'].lineData[207]++;
      _propData.value = 0;
      _$jscoverage['/base.js'].lineData[209]++;
      _backupProps.display = 'none';
    } else {
      _$jscoverage['/base.js'].lineData[211]++;
      _propData.value = Dom.css(node, prop);
      _$jscoverage['/base.js'].lineData[213]++;
      Dom.css(node, prop, 0);
      _$jscoverage['/base.js'].lineData[214]++;
      Dom.show(node);
    }
  }
  _$jscoverage['/base.js'].lineData[217]++;
  return undefined;
});
    _$jscoverage['/base.js'].lineData[220]++;
    if (visit61_220_1(exit === false)) {
      _$jscoverage['/base.js'].lineData[221]++;
      return;
    }
  }
  _$jscoverage['/base.js'].lineData[225]++;
  self.startTime = S.now();
  _$jscoverage['/base.js'].lineData[226]++;
  if (visit62_226_1(S.isEmptyObject(_propsData))) {
    _$jscoverage['/base.js'].lineData[227]++;
    self.__totalTime = defaultDuration * 1000;
    _$jscoverage['/base.js'].lineData[228]++;
    self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[229]++;
  self.stop(true);
}, self.__totalTime);
  } else {
    _$jscoverage['/base.js'].lineData[232]++;
    self.prepareFx();
    _$jscoverage['/base.js'].lineData[233]++;
    self.doStart();
  }
}, 
  isRunning: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[242]++;
  return Utils.isAnimRunning(this);
}, 
  isPaused: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[250]++;
  return Utils.isAnimPaused(this);
}, 
  pause: function() {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[259]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[260]++;
  if (visit63_260_1(self.isRunning())) {
    _$jscoverage['/base.js'].lineData[262]++;
    self._runTime = S.now() - self.startTime;
    _$jscoverage['/base.js'].lineData[263]++;
    self.__totalTime -= self._runTime;
    _$jscoverage['/base.js'].lineData[264]++;
    Utils.removeRunningAnim(self);
    _$jscoverage['/base.js'].lineData[265]++;
    Utils.savePausedAnim(self);
    _$jscoverage['/base.js'].lineData[266]++;
    if (visit64_266_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[267]++;
      clearTimeout(self.__waitTimeout);
    } else {
      _$jscoverage['/base.js'].lineData[269]++;
      self.doStop();
    }
  }
  _$jscoverage['/base.js'].lineData[272]++;
  return self;
}, 
  doStop: noop, 
  doStart: noop, 
  resume: function() {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[294]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[295]++;
  if (visit65_295_1(self.isPaused())) {
    _$jscoverage['/base.js'].lineData[297]++;
    self.startTime = S.now() - self._runTime;
    _$jscoverage['/base.js'].lineData[298]++;
    Utils.removePausedAnim(self);
    _$jscoverage['/base.js'].lineData[299]++;
    Utils.saveRunningAnim(self);
    _$jscoverage['/base.js'].lineData[300]++;
    if (visit66_300_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[301]++;
      self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[302]++;
  self.stop(true);
}, self.__totalTime);
    } else {
      _$jscoverage['/base.js'].lineData[305]++;
      self.beforeResume();
      _$jscoverage['/base.js'].lineData[306]++;
      self.doStart();
    }
  }
  _$jscoverage['/base.js'].lineData[309]++;
  return self;
}, 
  'beforeResume': noop, 
  run: function() {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[324]++;
  var self = this, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[328]++;
  if (visit67_328_1(queue === false)) {
    _$jscoverage['/base.js'].lineData[329]++;
    self.runInternal();
  } else {
    _$jscoverage['/base.js'].lineData[332]++;
    q = Q.queue(self.node, queue, self);
    _$jscoverage['/base.js'].lineData[333]++;
    if (visit68_333_1(q.length === 1)) {
      _$jscoverage['/base.js'].lineData[334]++;
      self.runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[338]++;
  return self;
}, 
  stop: function(finish) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[347]++;
  var self = this, node = self.node, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[352]++;
  if (visit69_352_1(self.isResolved() || self.isRejected())) {
    _$jscoverage['/base.js'].lineData[353]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[356]++;
  if (visit70_356_1(self.__waitTimeout)) {
    _$jscoverage['/base.js'].lineData[357]++;
    clearTimeout(self.__waitTimeout);
    _$jscoverage['/base.js'].lineData[358]++;
    self.__waitTimeout = 0;
  }
  _$jscoverage['/base.js'].lineData[361]++;
  if (visit71_361_1(!self.isRunning() && !self.isPaused())) {
    _$jscoverage['/base.js'].lineData[362]++;
    if (visit72_362_1(queue !== false)) {
      _$jscoverage['/base.js'].lineData[364]++;
      Q.remove(node, queue, self);
    }
    _$jscoverage['/base.js'].lineData[366]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[369]++;
  self.doStop(finish);
  _$jscoverage['/base.js'].lineData[370]++;
  Utils.removeRunningAnim(self);
  _$jscoverage['/base.js'].lineData[371]++;
  Utils.removePausedAnim(self);
  _$jscoverage['/base.js'].lineData[373]++;
  var defer = self.defer;
  _$jscoverage['/base.js'].lineData[374]++;
  if (visit73_374_1(finish)) {
    _$jscoverage['/base.js'].lineData[375]++;
    syncComplete(self);
    _$jscoverage['/base.js'].lineData[376]++;
    defer.resolve([self]);
  } else {
    _$jscoverage['/base.js'].lineData[378]++;
    defer.reject([self]);
  }
  _$jscoverage['/base.js'].lineData[381]++;
  if (visit74_381_1(queue !== false)) {
    _$jscoverage['/base.js'].lineData[383]++;
    q = Q.dequeue(node, queue);
    _$jscoverage['/base.js'].lineData[384]++;
    if (visit75_384_1(q && q[0])) {
      _$jscoverage['/base.js'].lineData[385]++;
      q[0].runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[388]++;
  return self;
}});
  _$jscoverage['/base.js'].lineData[392]++;
  var Statics = AnimBase.Statics = {
  isRunning: Utils.isElRunning, 
  isPaused: Utils.isElPaused, 
  stop: Utils.stopEl, 
  Q: Q};
  _$jscoverage['/base.js'].lineData[399]++;
  S.each(['pause', 'resume'], function(action) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[400]++;
  Statics[action] = function(node, queue) {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[401]++;
  if (visit76_403_1(visit77_403_2(queue === null) || visit78_405_1(visit79_405_2(typeof queue === 'string') || visit80_407_1(queue === false)))) {
    _$jscoverage['/base.js'].lineData[409]++;
    return Utils.pauseOrResumeQueue(node, queue, action);
  }
  _$jscoverage['/base.js'].lineData[411]++;
  return Utils.pauseOrResumeQueue(node, undefined, action);
};
});
  _$jscoverage['/base.js'].lineData[415]++;
  return AnimBase;
});
