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
if (! _$jscoverage['/dent-cmd.js']) {
  _$jscoverage['/dent-cmd.js'] = {};
  _$jscoverage['/dent-cmd.js'].lineData = [];
  _$jscoverage['/dent-cmd.js'].lineData[10] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[11] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[12] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[14] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[25] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[26] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[29] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[33] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[35] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[36] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[38] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[39] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[42] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[43] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[47] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[50] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[51] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[52] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[54] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[55] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[57] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[58] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[65] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[67] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[68] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[71] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[72] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[73] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[74] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[77] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[83] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[87] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[88] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[90] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[92] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[93] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[109] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[111] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[116] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[120] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[121] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[122] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[124] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[126] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[129] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[130] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[132] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[138] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[139] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[141] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[144] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[145] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[146] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[150] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[156] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[157] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[159] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[161] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[163] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[168] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[171] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[172] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[175] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[176] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[177] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[178] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[182] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[183] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[184] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[185] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[187] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[188] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[189] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[191] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[192] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[193] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[194] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[195] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[198] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[202] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[203] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[205] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[206] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[208] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[213] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[215] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[217] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[222] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[224] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[225] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[226] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[229] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[231] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[232] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[233] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[236] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[238] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[239] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[240] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[241] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[243] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[247] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[249] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[253] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[255] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[258] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[259] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[260] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[262] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[263] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[264] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[265] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[271] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[273] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[274] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[275] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[277] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[278] = 0;
}
if (! _$jscoverage['/dent-cmd.js'].functionData) {
  _$jscoverage['/dent-cmd.js'].functionData = [];
  _$jscoverage['/dent-cmd.js'].functionData[0] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[1] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[2] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[3] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[4] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[5] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[6] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[7] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[8] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[9] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[10] = 0;
}
if (! _$jscoverage['/dent-cmd.js'].branchData) {
  _$jscoverage['/dent-cmd.js'].branchData = {};
  _$jscoverage['/dent-cmd.js'].branchData['26'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['26'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['26'][3] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['35'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['38'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['42'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['51'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['57'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['71'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['72'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['77'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['89'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['110'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['110'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['110'][3] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['122'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['124'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['125'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['129'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['130'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['131'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['138'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['139'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['140'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['144'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['145'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['150'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['156'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['157'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['184'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['187'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['188'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['194'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['204'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['205'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['213'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['213'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['213'][3] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['222'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['222'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['222'][3] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['229'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['229'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['229'][3] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['238'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['240'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['240'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['244'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['244'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['247'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['247'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['259'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['274'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['277'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['278'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['278'][1] = new BranchData();
}
_$jscoverage['/dent-cmd.js'].branchData['278'][1].init(85, 41, 'block && block.style(INDENT_CSS_PROPERTY)');
function visit55_278_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['277'][1].init(29, 31, 'elementPath.block || blockLimit');
function visit54_277_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['274'][1].init(70, 35, 'elementPath.contains(listNodeNames)');
function visit53_274_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['259'][1].init(13, 27, '!editor.hasCommand(cmdType)');
function visit52_259_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['247'][2].init(467, 72, 'indentWholeList && indentElement(nearestListBlock, type)');
function visit51_247_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['247'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['247'][1].init(464, 77, '!(indentWholeList && indentElement(nearestListBlock, type))');
function visit50_247_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['244'][2].init(72, 34, 'firstListItem[0] === rangeStart[0]');
function visit49_244_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['244'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['244'][1].init(72, 72, 'firstListItem[0] === rangeStart[0] || firstListItem.contains(rangeStart)');
function visit48_244_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['240'][2].init(95, 33, 'firstListItem.nodeName() !== \'li\'');
function visit47_240_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['240'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['240'][1].init(78, 50, 'firstListItem && firstListItem.nodeName() !== \'li\'');
function visit46_240_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['238'][1].init(1420, 16, 'nearestListBlock');
function visit45_238_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['229'][3].init(1090, 54, 'endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit44_229_3(result) {
  _$jscoverage['/dent-cmd.js'].branchData['229'][3].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['229'][2].init(1090, 110, 'endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && endContainer.nodeName() in listNodeNames');
function visit43_229_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['229'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['229'][1].init(1070, 130, 'nearestListBlock && endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && endContainer.nodeName() in listNodeNames');
function visit42_229_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['222'][3].init(796, 56, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit41_222_3(result) {
  _$jscoverage['/dent-cmd.js'].branchData['222'][3].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['222'][2].init(796, 114, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && startContainer.nodeName() in listNodeNames');
function visit40_222_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['222'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['222'][1].init(776, 134, 'nearestListBlock && startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && startContainer.nodeName() in listNodeNames');
function visit39_222_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['213'][3].init(389, 58, 'nearestListBlock[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit38_213_3(result) {
  _$jscoverage['/dent-cmd.js'].branchData['213'][3].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['213'][2].init(389, 118, 'nearestListBlock[0].nodeType === Dom.NodeType.ELEMENT_NODE && listNodeNames[nearestListBlock.nodeName()]');
function visit37_213_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['213'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['213'][1].init(366, 143, 'nearestListBlock && !(nearestListBlock[0].nodeType === Dom.NodeType.ELEMENT_NODE && listNodeNames[nearestListBlock.nodeName()])');
function visit36_213_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['205'][1].init(119, 6, '!range');
function visit35_205_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['204'][1].init(58, 37, 'selection && selection.getRanges()[0]');
function visit34_204_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['194'][1].init(536, 31, 'element[0].style.cssText === \'\'');
function visit33_194_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['188'][1].init(241, 17, 'currentOffset < 0');
function visit32_188_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['187'][1].init(183, 17, 'type === \'indent\'');
function visit31_187_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['184'][1].init(91, 20, 'isNaN(currentOffset)');
function visit30_184_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['157'][1].init(32, 45, 'isNotWhitespaces(node) && isNotBookmark(node)');
function visit29_157_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['156'][1].init(237, 140, 'UA.ie && !li.first(function(node) {\n  return isNotWhitespaces(node) && isNotBookmark(node);\n}, 1)');
function visit28_156_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['150'][1].init(182, 104, '(followingList = followingList.next()) && followingList.nodeName() in listNodeNames');
function visit27_150_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['145'][1].init(25, 22, 'i < pendingList.length');
function visit26_145_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['144'][1].init(4391, 33, 'pendingList && pendingList.length');
function visit25_144_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['140'][1].init(73, 23, 'listNode[0] || listNode');
function visit24_140_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['139'][1].init(30, 39, 'newList.listNode[0] || newList.listNode');
function visit23_139_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['138'][1].init(4150, 7, 'newList');
function visit22_138_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['131'][1].init(58, 25, 'child.nodeName() === \'li\'');
function visit21_131_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['130'][1].init(27, 84, '(child = new Node(children[i])) && child.nodeName() === \'li\'');
function visit20_130_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['129'][1].init(150, 6, 'i >= 0');
function visit19_129_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['125'][1].init(56, 35, 'parentLiElement.nodeName() === \'li\'');
function visit18_125_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['124'][1].init(20, 92, '(parentLiElement = listNode.parent()) && parentLiElement.nodeName() === \'li\'');
function visit17_124_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['122'][1].init(3609, 18, 'type === \'outdent\'');
function visit16_122_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['110'][3].init(23, 32, 'listArray[i].indent > baseIndent');
function visit15_110_3(result) {
  _$jscoverage['/dent-cmd.js'].branchData['110'][3].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['110'][2].init(3062, 20, 'i < listArray.length');
function visit14_110_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['110'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['110'][1].init(59, 56, 'i < listArray.length && listArray[i].indent > baseIndent');
function visit13_110_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['89'][1].init(56, 37, 'i <= lastItem.data(\'listarray_index\')');
function visit12_89_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['77'][1].init(1791, 17, 'type === \'indent\'');
function visit11_77_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['72'][1].init(17, 42, 'listNodeNames[listParents[i].nodeName()]');
function visit10_72_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['71'][1].init(1581, 22, 'i < listParents.length');
function visit9_71_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['57'][1].init(1053, 22, 'itemsToMove.length < 1');
function visit8_57_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['51'][1].init(17, 26, 'block.equals(endContainer)');
function visit7_51_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['42'][1].init(596, 32, '!startContainer || !endContainer');
function visit6_42_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['38'][1].init(464, 55, 'endContainer && !endContainer.parent().equals(listNode)');
function visit5_38_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['35'][1].init(322, 59, 'startContainer && !startContainer.parent().equals(listNode)');
function visit4_35_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['26'][3].init(63, 27, 'Dom.nodeName(node) === \'li\'');
function visit3_26_3(result) {
  _$jscoverage['/dent-cmd.js'].branchData['26'][3].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['26'][2].init(16, 43, 'node.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit2_26_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['26'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['26'][1].init(16, 74, 'node.nodeType === Dom.NodeType.ELEMENT_NODE && Dom.nodeName(node) === \'li\'');
function visit1_26_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dent-cmd.js'].functionData[0]++;
  _$jscoverage['/dent-cmd.js'].lineData[11]++;
  var Editor = require('editor');
  _$jscoverage['/dent-cmd.js'].lineData[12]++;
  var ListUtils = require('./list-utils');
  _$jscoverage['/dent-cmd.js'].lineData[14]++;
  var listNodeNames = {
  ol: 1, 
  ul: 1}, Walker = Editor.Walker, Dom = S.DOM, Node = S.Node, UA = S.UA, isNotWhitespaces = Walker.whitespaces(true), INDENT_CSS_PROPERTY = 'margin-left', INDENT_OFFSET = 40, INDENT_UNIT = 'px', isNotBookmark = Walker.bookmark(false, true);
  _$jscoverage['/dent-cmd.js'].lineData[25]++;
  function isListItem(node) {
    _$jscoverage['/dent-cmd.js'].functionData[1]++;
    _$jscoverage['/dent-cmd.js'].lineData[26]++;
    return visit1_26_1(visit2_26_2(node.nodeType === Dom.NodeType.ELEMENT_NODE) && visit3_26_3(Dom.nodeName(node) === 'li'));
  }
  _$jscoverage['/dent-cmd.js'].lineData[29]++;
  function indentList(range, listNode, type) {
    _$jscoverage['/dent-cmd.js'].functionData[2]++;
    _$jscoverage['/dent-cmd.js'].lineData[33]++;
    var startContainer = range.startContainer, endContainer = range.endContainer;
    _$jscoverage['/dent-cmd.js'].lineData[35]++;
    while (visit4_35_1(startContainer && !startContainer.parent().equals(listNode))) {
      _$jscoverage['/dent-cmd.js'].lineData[36]++;
      startContainer = startContainer.parent();
    }
    _$jscoverage['/dent-cmd.js'].lineData[38]++;
    while (visit5_38_1(endContainer && !endContainer.parent().equals(listNode))) {
      _$jscoverage['/dent-cmd.js'].lineData[39]++;
      endContainer = endContainer.parent();
    }
    _$jscoverage['/dent-cmd.js'].lineData[42]++;
    if (visit6_42_1(!startContainer || !endContainer)) {
      _$jscoverage['/dent-cmd.js'].lineData[43]++;
      return;
    }
    _$jscoverage['/dent-cmd.js'].lineData[47]++;
    var block = startContainer, itemsToMove = [], stopFlag = false;
    _$jscoverage['/dent-cmd.js'].lineData[50]++;
    while (!stopFlag) {
      _$jscoverage['/dent-cmd.js'].lineData[51]++;
      if (visit7_51_1(block.equals(endContainer))) {
        _$jscoverage['/dent-cmd.js'].lineData[52]++;
        stopFlag = true;
      }
      _$jscoverage['/dent-cmd.js'].lineData[54]++;
      itemsToMove.push(block);
      _$jscoverage['/dent-cmd.js'].lineData[55]++;
      block = block.next();
    }
    _$jscoverage['/dent-cmd.js'].lineData[57]++;
    if (visit8_57_1(itemsToMove.length < 1)) {
      _$jscoverage['/dent-cmd.js'].lineData[58]++;
      return;
    }
    _$jscoverage['/dent-cmd.js'].lineData[65]++;
    var listParents = listNode._4eParents(true, undefined);
    _$jscoverage['/dent-cmd.js'].lineData[67]++;
    listParents.each(function(n, i) {
  _$jscoverage['/dent-cmd.js'].functionData[3]++;
  _$jscoverage['/dent-cmd.js'].lineData[68]++;
  listParents[i] = n;
});
    _$jscoverage['/dent-cmd.js'].lineData[71]++;
    for (var i = 0; visit9_71_1(i < listParents.length); i++) {
      _$jscoverage['/dent-cmd.js'].lineData[72]++;
      if (visit10_72_1(listNodeNames[listParents[i].nodeName()])) {
        _$jscoverage['/dent-cmd.js'].lineData[73]++;
        listNode = listParents[i];
        _$jscoverage['/dent-cmd.js'].lineData[74]++;
        break;
      }
    }
    _$jscoverage['/dent-cmd.js'].lineData[77]++;
    var indentOffset = visit11_77_1(type === 'indent') ? 1 : -1, startItem = itemsToMove[0], lastItem = itemsToMove[itemsToMove.length - 1], database = {};
    _$jscoverage['/dent-cmd.js'].lineData[83]++;
    var listArray = ListUtils.listToArray(listNode, database);
    _$jscoverage['/dent-cmd.js'].lineData[87]++;
    var baseIndent = listArray[lastItem.data('listarray_index')].indent;
    _$jscoverage['/dent-cmd.js'].lineData[88]++;
    for (i = startItem.data('listarray_index'); visit12_89_1(i <= lastItem.data('listarray_index')); i++) {
      _$jscoverage['/dent-cmd.js'].lineData[90]++;
      listArray[i].indent += indentOffset;
      _$jscoverage['/dent-cmd.js'].lineData[92]++;
      var listRoot = listArray[i].parent;
      _$jscoverage['/dent-cmd.js'].lineData[93]++;
      listArray[i].parent = new Node(listRoot[0].ownerDocument.createElement(listRoot.nodeName()));
    }
    _$jscoverage['/dent-cmd.js'].lineData[109]++;
    for (i = lastItem.data('listarray_index') + 1; visit13_110_1(visit14_110_2(i < listArray.length) && visit15_110_3(listArray[i].indent > baseIndent)); i++) {
      _$jscoverage['/dent-cmd.js'].lineData[111]++;
      listArray[i].indent += indentOffset;
    }
    _$jscoverage['/dent-cmd.js'].lineData[116]++;
    var newList = ListUtils.arrayToList(listArray, database, null, 'p');
    _$jscoverage['/dent-cmd.js'].lineData[120]++;
    var pendingList = [];
    _$jscoverage['/dent-cmd.js'].lineData[121]++;
    var parentLiElement;
    _$jscoverage['/dent-cmd.js'].lineData[122]++;
    if (visit16_122_1(type === 'outdent')) {
      _$jscoverage['/dent-cmd.js'].lineData[124]++;
      if (visit17_124_1((parentLiElement = listNode.parent()) && visit18_125_1(parentLiElement.nodeName() === 'li'))) {
        _$jscoverage['/dent-cmd.js'].lineData[126]++;
        var children = newList.listNode.childNodes, count = children.length, child;
        _$jscoverage['/dent-cmd.js'].lineData[129]++;
        for (i = count - 1; visit19_129_1(i >= 0); i--) {
          _$jscoverage['/dent-cmd.js'].lineData[130]++;
          if (visit20_130_1((child = new Node(children[i])) && visit21_131_1(child.nodeName() === 'li'))) {
            _$jscoverage['/dent-cmd.js'].lineData[132]++;
            pendingList.push(child);
          }
        }
      }
    }
    _$jscoverage['/dent-cmd.js'].lineData[138]++;
    if (visit22_138_1(newList)) {
      _$jscoverage['/dent-cmd.js'].lineData[139]++;
      Dom.insertBefore(visit23_139_1(newList.listNode[0] || newList.listNode), visit24_140_1(listNode[0] || listNode));
      _$jscoverage['/dent-cmd.js'].lineData[141]++;
      listNode.remove();
    }
    _$jscoverage['/dent-cmd.js'].lineData[144]++;
    if (visit25_144_1(pendingList && pendingList.length)) {
      _$jscoverage['/dent-cmd.js'].lineData[145]++;
      for (i = 0; visit26_145_1(i < pendingList.length); i++) {
        _$jscoverage['/dent-cmd.js'].lineData[146]++;
        var li = pendingList[i], followingList = li;
        _$jscoverage['/dent-cmd.js'].lineData[150]++;
        while (visit27_150_1((followingList = followingList.next()) && followingList.nodeName() in listNodeNames)) {
          _$jscoverage['/dent-cmd.js'].lineData[156]++;
          if (visit28_156_1(UA.ie && !li.first(function(node) {
  _$jscoverage['/dent-cmd.js'].functionData[4]++;
  _$jscoverage['/dent-cmd.js'].lineData[157]++;
  return visit29_157_1(isNotWhitespaces(node) && isNotBookmark(node));
}, 1))) {
            _$jscoverage['/dent-cmd.js'].lineData[159]++;
            li[0].appendChild(range.document.createTextNode('\xa0'));
          }
          _$jscoverage['/dent-cmd.js'].lineData[161]++;
          li[0].appendChild(followingList[0]);
        }
        _$jscoverage['/dent-cmd.js'].lineData[163]++;
        Dom.insertAfter(li[0], parentLiElement[0]);
      }
    }
    _$jscoverage['/dent-cmd.js'].lineData[168]++;
    Editor.Utils.clearAllMarkers(database);
  }
  _$jscoverage['/dent-cmd.js'].lineData[171]++;
  function indentBlock(range, type) {
    _$jscoverage['/dent-cmd.js'].functionData[5]++;
    _$jscoverage['/dent-cmd.js'].lineData[172]++;
    var iterator = range.createIterator(), block;
    _$jscoverage['/dent-cmd.js'].lineData[175]++;
    iterator.enforceRealBlocks = true;
    _$jscoverage['/dent-cmd.js'].lineData[176]++;
    iterator.enlargeBr = true;
    _$jscoverage['/dent-cmd.js'].lineData[177]++;
    while ((block = iterator.getNextParagraph())) {
      _$jscoverage['/dent-cmd.js'].lineData[178]++;
      indentElement(block, type);
    }
  }
  _$jscoverage['/dent-cmd.js'].lineData[182]++;
  function indentElement(element, type) {
    _$jscoverage['/dent-cmd.js'].functionData[6]++;
    _$jscoverage['/dent-cmd.js'].lineData[183]++;
    var currentOffset = parseInt(element.style(INDENT_CSS_PROPERTY), 10);
    _$jscoverage['/dent-cmd.js'].lineData[184]++;
    if (visit30_184_1(isNaN(currentOffset))) {
      _$jscoverage['/dent-cmd.js'].lineData[185]++;
      currentOffset = 0;
    }
    _$jscoverage['/dent-cmd.js'].lineData[187]++;
    currentOffset += (visit31_187_1(type === 'indent') ? 1 : -1) * INDENT_OFFSET;
    _$jscoverage['/dent-cmd.js'].lineData[188]++;
    if (visit32_188_1(currentOffset < 0)) {
      _$jscoverage['/dent-cmd.js'].lineData[189]++;
      return false;
    }
    _$jscoverage['/dent-cmd.js'].lineData[191]++;
    currentOffset = Math.max(currentOffset, 0);
    _$jscoverage['/dent-cmd.js'].lineData[192]++;
    currentOffset = Math.ceil(currentOffset / INDENT_OFFSET) * INDENT_OFFSET;
    _$jscoverage['/dent-cmd.js'].lineData[193]++;
    element.css(INDENT_CSS_PROPERTY, currentOffset ? currentOffset + INDENT_UNIT : '');
    _$jscoverage['/dent-cmd.js'].lineData[194]++;
    if (visit33_194_1(element[0].style.cssText === '')) {
      _$jscoverage['/dent-cmd.js'].lineData[195]++;
      element.removeAttr('style');
    }
    _$jscoverage['/dent-cmd.js'].lineData[198]++;
    return true;
  }
  _$jscoverage['/dent-cmd.js'].lineData[202]++;
  function indentEditor(editor, type) {
    _$jscoverage['/dent-cmd.js'].functionData[7]++;
    _$jscoverage['/dent-cmd.js'].lineData[203]++;
    var selection = editor.getSelection(), range = visit34_204_1(selection && selection.getRanges()[0]);
    _$jscoverage['/dent-cmd.js'].lineData[205]++;
    if (visit35_205_1(!range)) {
      _$jscoverage['/dent-cmd.js'].lineData[206]++;
      return;
    }
    _$jscoverage['/dent-cmd.js'].lineData[208]++;
    var startContainer = range.startContainer, endContainer = range.endContainer, rangeRoot = range.getCommonAncestor(), nearestListBlock = rangeRoot;
    _$jscoverage['/dent-cmd.js'].lineData[213]++;
    while (visit36_213_1(nearestListBlock && !(visit37_213_2(visit38_213_3(nearestListBlock[0].nodeType === Dom.NodeType.ELEMENT_NODE) && listNodeNames[nearestListBlock.nodeName()])))) {
      _$jscoverage['/dent-cmd.js'].lineData[215]++;
      nearestListBlock = nearestListBlock.parent();
    }
    _$jscoverage['/dent-cmd.js'].lineData[217]++;
    var walker;
    _$jscoverage['/dent-cmd.js'].lineData[222]++;
    if (visit39_222_1(nearestListBlock && visit40_222_2(visit41_222_3(startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) && startContainer.nodeName() in listNodeNames))) {
      _$jscoverage['/dent-cmd.js'].lineData[224]++;
      walker = new Walker(range);
      _$jscoverage['/dent-cmd.js'].lineData[225]++;
      walker.evaluator = isListItem;
      _$jscoverage['/dent-cmd.js'].lineData[226]++;
      range.startContainer = walker.next();
    }
    _$jscoverage['/dent-cmd.js'].lineData[229]++;
    if (visit42_229_1(nearestListBlock && visit43_229_2(visit44_229_3(endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) && endContainer.nodeName() in listNodeNames))) {
      _$jscoverage['/dent-cmd.js'].lineData[231]++;
      walker = new Walker(range);
      _$jscoverage['/dent-cmd.js'].lineData[232]++;
      walker.evaluator = isListItem;
      _$jscoverage['/dent-cmd.js'].lineData[233]++;
      range.endContainer = walker.previous();
    }
    _$jscoverage['/dent-cmd.js'].lineData[236]++;
    var bookmarks = selection.createBookmarks(true);
    _$jscoverage['/dent-cmd.js'].lineData[238]++;
    if (visit45_238_1(nearestListBlock)) {
      _$jscoverage['/dent-cmd.js'].lineData[239]++;
      var firstListItem = nearestListBlock.first();
      _$jscoverage['/dent-cmd.js'].lineData[240]++;
      while (visit46_240_1(firstListItem && visit47_240_2(firstListItem.nodeName() !== 'li'))) {
        _$jscoverage['/dent-cmd.js'].lineData[241]++;
        firstListItem = firstListItem.next();
      }
      _$jscoverage['/dent-cmd.js'].lineData[243]++;
      var rangeStart = range.startContainer, indentWholeList = visit48_244_1(visit49_244_2(firstListItem[0] === rangeStart[0]) || firstListItem.contains(rangeStart));
      _$jscoverage['/dent-cmd.js'].lineData[247]++;
      if (visit50_247_1(!(visit51_247_2(indentWholeList && indentElement(nearestListBlock, type))))) {
        _$jscoverage['/dent-cmd.js'].lineData[249]++;
        indentList(range, nearestListBlock, type);
      }
    } else {
      _$jscoverage['/dent-cmd.js'].lineData[253]++;
      indentBlock(range, type);
    }
    _$jscoverage['/dent-cmd.js'].lineData[255]++;
    selection.selectBookmarks(bookmarks);
  }
  _$jscoverage['/dent-cmd.js'].lineData[258]++;
  function addCommand(editor, cmdType) {
    _$jscoverage['/dent-cmd.js'].functionData[8]++;
    _$jscoverage['/dent-cmd.js'].lineData[259]++;
    if (visit52_259_1(!editor.hasCommand(cmdType))) {
      _$jscoverage['/dent-cmd.js'].lineData[260]++;
      editor.addCommand(cmdType, {
  exec: function(editor) {
  _$jscoverage['/dent-cmd.js'].functionData[9]++;
  _$jscoverage['/dent-cmd.js'].lineData[262]++;
  editor.execCommand('save');
  _$jscoverage['/dent-cmd.js'].lineData[263]++;
  indentEditor(editor, cmdType);
  _$jscoverage['/dent-cmd.js'].lineData[264]++;
  editor.execCommand('save');
  _$jscoverage['/dent-cmd.js'].lineData[265]++;
  editor.notifySelectionChange();
}});
    }
  }
  _$jscoverage['/dent-cmd.js'].lineData[271]++;
  return {
  checkOutdentActive: function(elementPath) {
  _$jscoverage['/dent-cmd.js'].functionData[10]++;
  _$jscoverage['/dent-cmd.js'].lineData[273]++;
  var blockLimit = elementPath.blockLimit;
  _$jscoverage['/dent-cmd.js'].lineData[274]++;
  if (visit53_274_1(elementPath.contains(listNodeNames))) {
    _$jscoverage['/dent-cmd.js'].lineData[275]++;
    return true;
  } else {
    _$jscoverage['/dent-cmd.js'].lineData[277]++;
    var block = visit54_277_1(elementPath.block || blockLimit);
    _$jscoverage['/dent-cmd.js'].lineData[278]++;
    return visit55_278_1(block && block.style(INDENT_CSS_PROPERTY));
  }
}, 
  addCommand: addCommand};
});
