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
if (! _$jscoverage['/touch/handle.js']) {
  _$jscoverage['/touch/handle.js'] = {};
  _$jscoverage['/touch/handle.js'].lineData = [];
  _$jscoverage['/touch/handle.js'].lineData[6] = 0;
  _$jscoverage['/touch/handle.js'].lineData[7] = 0;
  _$jscoverage['/touch/handle.js'].lineData[13] = 0;
  _$jscoverage['/touch/handle.js'].lineData[14] = 0;
  _$jscoverage['/touch/handle.js'].lineData[17] = 0;
  _$jscoverage['/touch/handle.js'].lineData[18] = 0;
  _$jscoverage['/touch/handle.js'].lineData[22] = 0;
  _$jscoverage['/touch/handle.js'].lineData[24] = 0;
  _$jscoverage['/touch/handle.js'].lineData[26] = 0;
  _$jscoverage['/touch/handle.js'].lineData[27] = 0;
  _$jscoverage['/touch/handle.js'].lineData[29] = 0;
  _$jscoverage['/touch/handle.js'].lineData[30] = 0;
  _$jscoverage['/touch/handle.js'].lineData[31] = 0;
  _$jscoverage['/touch/handle.js'].lineData[33] = 0;
  _$jscoverage['/touch/handle.js'].lineData[34] = 0;
  _$jscoverage['/touch/handle.js'].lineData[35] = 0;
  _$jscoverage['/touch/handle.js'].lineData[37] = 0;
  _$jscoverage['/touch/handle.js'].lineData[38] = 0;
  _$jscoverage['/touch/handle.js'].lineData[39] = 0;
  _$jscoverage['/touch/handle.js'].lineData[40] = 0;
  _$jscoverage['/touch/handle.js'].lineData[42] = 0;
  _$jscoverage['/touch/handle.js'].lineData[43] = 0;
  _$jscoverage['/touch/handle.js'].lineData[44] = 0;
  _$jscoverage['/touch/handle.js'].lineData[47] = 0;
  _$jscoverage['/touch/handle.js'].lineData[48] = 0;
  _$jscoverage['/touch/handle.js'].lineData[49] = 0;
  _$jscoverage['/touch/handle.js'].lineData[50] = 0;
  _$jscoverage['/touch/handle.js'].lineData[51] = 0;
  _$jscoverage['/touch/handle.js'].lineData[53] = 0;
  _$jscoverage['/touch/handle.js'].lineData[55] = 0;
  _$jscoverage['/touch/handle.js'].lineData[58] = 0;
  _$jscoverage['/touch/handle.js'].lineData[64] = 0;
  _$jscoverage['/touch/handle.js'].lineData[66] = 0;
  _$jscoverage['/touch/handle.js'].lineData[67] = 0;
  _$jscoverage['/touch/handle.js'].lineData[68] = 0;
  _$jscoverage['/touch/handle.js'].lineData[72] = 0;
  _$jscoverage['/touch/handle.js'].lineData[75] = 0;
  _$jscoverage['/touch/handle.js'].lineData[76] = 0;
  _$jscoverage['/touch/handle.js'].lineData[80] = 0;
  _$jscoverage['/touch/handle.js'].lineData[81] = 0;
  _$jscoverage['/touch/handle.js'].lineData[87] = 0;
  _$jscoverage['/touch/handle.js'].lineData[88] = 0;
  _$jscoverage['/touch/handle.js'].lineData[90] = 0;
  _$jscoverage['/touch/handle.js'].lineData[92] = 0;
  _$jscoverage['/touch/handle.js'].lineData[93] = 0;
  _$jscoverage['/touch/handle.js'].lineData[94] = 0;
  _$jscoverage['/touch/handle.js'].lineData[95] = 0;
  _$jscoverage['/touch/handle.js'].lineData[96] = 0;
  _$jscoverage['/touch/handle.js'].lineData[97] = 0;
  _$jscoverage['/touch/handle.js'].lineData[100] = 0;
  _$jscoverage['/touch/handle.js'].lineData[106] = 0;
  _$jscoverage['/touch/handle.js'].lineData[107] = 0;
  _$jscoverage['/touch/handle.js'].lineData[109] = 0;
  _$jscoverage['/touch/handle.js'].lineData[111] = 0;
  _$jscoverage['/touch/handle.js'].lineData[113] = 0;
  _$jscoverage['/touch/handle.js'].lineData[114] = 0;
  _$jscoverage['/touch/handle.js'].lineData[117] = 0;
  _$jscoverage['/touch/handle.js'].lineData[123] = 0;
  _$jscoverage['/touch/handle.js'].lineData[126] = 0;
  _$jscoverage['/touch/handle.js'].lineData[127] = 0;
  _$jscoverage['/touch/handle.js'].lineData[130] = 0;
  _$jscoverage['/touch/handle.js'].lineData[131] = 0;
  _$jscoverage['/touch/handle.js'].lineData[132] = 0;
  _$jscoverage['/touch/handle.js'].lineData[133] = 0;
  _$jscoverage['/touch/handle.js'].lineData[135] = 0;
  _$jscoverage['/touch/handle.js'].lineData[137] = 0;
  _$jscoverage['/touch/handle.js'].lineData[139] = 0;
  _$jscoverage['/touch/handle.js'].lineData[140] = 0;
  _$jscoverage['/touch/handle.js'].lineData[141] = 0;
  _$jscoverage['/touch/handle.js'].lineData[142] = 0;
  _$jscoverage['/touch/handle.js'].lineData[143] = 0;
  _$jscoverage['/touch/handle.js'].lineData[147] = 0;
  _$jscoverage['/touch/handle.js'].lineData[150] = 0;
  _$jscoverage['/touch/handle.js'].lineData[151] = 0;
  _$jscoverage['/touch/handle.js'].lineData[152] = 0;
  _$jscoverage['/touch/handle.js'].lineData[153] = 0;
  _$jscoverage['/touch/handle.js'].lineData[154] = 0;
  _$jscoverage['/touch/handle.js'].lineData[155] = 0;
  _$jscoverage['/touch/handle.js'].lineData[158] = 0;
  _$jscoverage['/touch/handle.js'].lineData[159] = 0;
  _$jscoverage['/touch/handle.js'].lineData[160] = 0;
  _$jscoverage['/touch/handle.js'].lineData[162] = 0;
  _$jscoverage['/touch/handle.js'].lineData[163] = 0;
  _$jscoverage['/touch/handle.js'].lineData[165] = 0;
  _$jscoverage['/touch/handle.js'].lineData[168] = 0;
  _$jscoverage['/touch/handle.js'].lineData[172] = 0;
  _$jscoverage['/touch/handle.js'].lineData[173] = 0;
  _$jscoverage['/touch/handle.js'].lineData[174] = 0;
  _$jscoverage['/touch/handle.js'].lineData[175] = 0;
  _$jscoverage['/touch/handle.js'].lineData[178] = 0;
  _$jscoverage['/touch/handle.js'].lineData[180] = 0;
  _$jscoverage['/touch/handle.js'].lineData[184] = 0;
  _$jscoverage['/touch/handle.js'].lineData[185] = 0;
  _$jscoverage['/touch/handle.js'].lineData[186] = 0;
  _$jscoverage['/touch/handle.js'].lineData[187] = 0;
  _$jscoverage['/touch/handle.js'].lineData[190] = 0;
  _$jscoverage['/touch/handle.js'].lineData[191] = 0;
  _$jscoverage['/touch/handle.js'].lineData[192] = 0;
  _$jscoverage['/touch/handle.js'].lineData[193] = 0;
  _$jscoverage['/touch/handle.js'].lineData[194] = 0;
  _$jscoverage['/touch/handle.js'].lineData[195] = 0;
  _$jscoverage['/touch/handle.js'].lineData[198] = 0;
  _$jscoverage['/touch/handle.js'].lineData[203] = 0;
  _$jscoverage['/touch/handle.js'].lineData[207] = 0;
  _$jscoverage['/touch/handle.js'].lineData[208] = 0;
  _$jscoverage['/touch/handle.js'].lineData[210] = 0;
  _$jscoverage['/touch/handle.js'].lineData[211] = 0;
  _$jscoverage['/touch/handle.js'].lineData[212] = 0;
  _$jscoverage['/touch/handle.js'].lineData[214] = 0;
  _$jscoverage['/touch/handle.js'].lineData[216] = 0;
  _$jscoverage['/touch/handle.js'].lineData[217] = 0;
  _$jscoverage['/touch/handle.js'].lineData[221] = 0;
  _$jscoverage['/touch/handle.js'].lineData[222] = 0;
  _$jscoverage['/touch/handle.js'].lineData[223] = 0;
  _$jscoverage['/touch/handle.js'].lineData[228] = 0;
  _$jscoverage['/touch/handle.js'].lineData[231] = 0;
  _$jscoverage['/touch/handle.js'].lineData[232] = 0;
  _$jscoverage['/touch/handle.js'].lineData[234] = 0;
  _$jscoverage['/touch/handle.js'].lineData[242] = 0;
  _$jscoverage['/touch/handle.js'].lineData[243] = 0;
  _$jscoverage['/touch/handle.js'].lineData[244] = 0;
  _$jscoverage['/touch/handle.js'].lineData[245] = 0;
  _$jscoverage['/touch/handle.js'].lineData[246] = 0;
  _$jscoverage['/touch/handle.js'].lineData[252] = 0;
  _$jscoverage['/touch/handle.js'].lineData[254] = 0;
  _$jscoverage['/touch/handle.js'].lineData[255] = 0;
  _$jscoverage['/touch/handle.js'].lineData[256] = 0;
  _$jscoverage['/touch/handle.js'].lineData[260] = 0;
  _$jscoverage['/touch/handle.js'].lineData[262] = 0;
  _$jscoverage['/touch/handle.js'].lineData[264] = 0;
  _$jscoverage['/touch/handle.js'].lineData[265] = 0;
  _$jscoverage['/touch/handle.js'].lineData[267] = 0;
  _$jscoverage['/touch/handle.js'].lineData[268] = 0;
  _$jscoverage['/touch/handle.js'].lineData[273] = 0;
  _$jscoverage['/touch/handle.js'].lineData[275] = 0;
  _$jscoverage['/touch/handle.js'].lineData[276] = 0;
  _$jscoverage['/touch/handle.js'].lineData[277] = 0;
  _$jscoverage['/touch/handle.js'].lineData[279] = 0;
  _$jscoverage['/touch/handle.js'].lineData[280] = 0;
  _$jscoverage['/touch/handle.js'].lineData[281] = 0;
}
if (! _$jscoverage['/touch/handle.js'].functionData) {
  _$jscoverage['/touch/handle.js'].functionData = [];
  _$jscoverage['/touch/handle.js'].functionData[0] = 0;
  _$jscoverage['/touch/handle.js'].functionData[1] = 0;
  _$jscoverage['/touch/handle.js'].functionData[2] = 0;
  _$jscoverage['/touch/handle.js'].functionData[3] = 0;
  _$jscoverage['/touch/handle.js'].functionData[4] = 0;
  _$jscoverage['/touch/handle.js'].functionData[5] = 0;
  _$jscoverage['/touch/handle.js'].functionData[6] = 0;
  _$jscoverage['/touch/handle.js'].functionData[7] = 0;
  _$jscoverage['/touch/handle.js'].functionData[8] = 0;
  _$jscoverage['/touch/handle.js'].functionData[9] = 0;
  _$jscoverage['/touch/handle.js'].functionData[10] = 0;
  _$jscoverage['/touch/handle.js'].functionData[11] = 0;
  _$jscoverage['/touch/handle.js'].functionData[12] = 0;
  _$jscoverage['/touch/handle.js'].functionData[13] = 0;
  _$jscoverage['/touch/handle.js'].functionData[14] = 0;
  _$jscoverage['/touch/handle.js'].functionData[15] = 0;
  _$jscoverage['/touch/handle.js'].functionData[16] = 0;
  _$jscoverage['/touch/handle.js'].functionData[17] = 0;
  _$jscoverage['/touch/handle.js'].functionData[18] = 0;
  _$jscoverage['/touch/handle.js'].functionData[19] = 0;
  _$jscoverage['/touch/handle.js'].functionData[20] = 0;
  _$jscoverage['/touch/handle.js'].functionData[21] = 0;
}
if (! _$jscoverage['/touch/handle.js'].branchData) {
  _$jscoverage['/touch/handle.js'].branchData = {};
  _$jscoverage['/touch/handle.js'].branchData['26'] = [];
  _$jscoverage['/touch/handle.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['31'] = [];
  _$jscoverage['/touch/handle.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['37'] = [];
  _$jscoverage['/touch/handle.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['72'] = [];
  _$jscoverage['/touch/handle.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['75'] = [];
  _$jscoverage['/touch/handle.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['80'] = [];
  _$jscoverage['/touch/handle.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['90'] = [];
  _$jscoverage['/touch/handle.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['96'] = [];
  _$jscoverage['/touch/handle.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['109'] = [];
  _$jscoverage['/touch/handle.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['109'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['113'] = [];
  _$jscoverage['/touch/handle.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['113'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['113'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['126'] = [];
  _$jscoverage['/touch/handle.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['127'] = [];
  _$jscoverage['/touch/handle.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['127'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['127'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['130'] = [];
  _$jscoverage['/touch/handle.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['150'] = [];
  _$jscoverage['/touch/handle.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['153'] = [];
  _$jscoverage['/touch/handle.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['154'] = [];
  _$jscoverage['/touch/handle.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['162'] = [];
  _$jscoverage['/touch/handle.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['173'] = [];
  _$jscoverage['/touch/handle.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['174'] = [];
  _$jscoverage['/touch/handle.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['185'] = [];
  _$jscoverage['/touch/handle.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['186'] = [];
  _$jscoverage['/touch/handle.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['191'] = [];
  _$jscoverage['/touch/handle.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['211'] = [];
  _$jscoverage['/touch/handle.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['216'] = [];
  _$jscoverage['/touch/handle.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['216'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['216'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['231'] = [];
  _$jscoverage['/touch/handle.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['243'] = [];
  _$jscoverage['/touch/handle.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['245'] = [];
  _$jscoverage['/touch/handle.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['264'] = [];
  _$jscoverage['/touch/handle.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['267'] = [];
  _$jscoverage['/touch/handle.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['275'] = [];
  _$jscoverage['/touch/handle.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['276'] = [];
  _$jscoverage['/touch/handle.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['279'] = [];
  _$jscoverage['/touch/handle.js'].branchData['279'][1] = new BranchData();
}
_$jscoverage['/touch/handle.js'].branchData['279'][1].init(125, 35, 'S.isEmptyObject(handle.eventHandle)');
function visit44_279_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['276'][1].init(22, 5, 'event');
function visit43_276_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['275'][1].init(108, 6, 'handle');
function visit42_275_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['267'][1].init(223, 5, 'event');
function visit41_267_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['264'][1].init(108, 7, '!handle');
function visit40_264_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['245'][1].init(67, 25, '!eventHandle[event].count');
function visit39_245_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['243'][1].init(67, 18, 'eventHandle[event]');
function visit38_243_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['231'][1].init(153, 18, 'eventHandle[event]');
function visit37_231_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['216'][3].init(311, 26, 'h[method](event) === false');
function visit36_216_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['216'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['216'][2].init(298, 39, 'h[method] && h[method](event) === false');
function visit35_216_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['216'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['216'][1].init(284, 53, 'h.isActive && h[method] && h[method](event) === false');
function visit34_216_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['211'][1].init(128, 11, 'h.processed');
function visit33_211_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['191'][1].init(269, 19, 'isTouchEvent(event)');
function visit32_191_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['186'][1].init(22, 37, 'self.isEventSimulatedFromTouch(event)');
function visit31_186_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['185'][1].init(48, 19, 'isMouseEvent(event)');
function visit30_185_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['174'][1].init(22, 33, 'this.isEventSimulatedFromTouch(e)');
function visit29_174_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['173'][1].init(48, 15, 'isMouseEvent(e)');
function visit28_173_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['162'][1].init(565, 19, 'isTouchEvent(event)');
function visit27_162_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['154'][1].init(22, 37, 'self.isEventSimulatedFromTouch(event)');
function visit26_154_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['153'][1].init(271, 19, 'isMouseEvent(event)');
function visit25_153_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['150'][1].init(120, 19, 'isTouchEvent(event)');
function visit24_150_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['130'][1].init(171, 21, 'touchList.length == 1');
function visit23_130_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['127'][3].init(53, 21, 'type == \'touchcancel\'');
function visit22_127_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['127'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['127'][2].init(31, 18, 'type == \'touchend\'');
function visit21_127_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['127'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['127'][1].init(31, 43, 'type == \'touchend\' || type == \'touchcancel\'');
function visit20_127_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['126'][1].init(102, 15, 'isTouchEvent(e)');
function visit19_126_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['113'][3].init(215, 14, 'dy <= DUP_DIST');
function visit18_113_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['113'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['113'][2].init(197, 14, 'dx <= DUP_DIST');
function visit17_113_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['113'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['113'][1].init(197, 32, 'dx <= DUP_DIST && dy <= DUP_DIST');
function visit16_113_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['109'][2].init(166, 5, 'i < l');
function visit15_109_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['109'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['109'][1].init(166, 21, 'i < l && (t = lts[i])');
function visit14_109_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['96'][1].init(72, 6, 'i > -1');
function visit13_96_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['90'][1].init(169, 22, 'this.isPrimaryTouch(t)');
function visit12_90_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['80'][1].init(18, 28, 'this.isPrimaryTouch(inTouch)');
function visit11_80_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['75'][1].init(18, 24, 'this.firstTouch === null');
function visit10_75_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['72'][1].init(21, 38, 'this.firstTouch === inTouch.identifier');
function visit9_72_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['37'][1].init(1012, 31, 'Features.isMsPointerSupported()');
function visit8_37_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['31'][1].init(216, 8, 'S.UA.ios');
function visit7_31_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['26'][1].init(536, 32, 'Features.isTouchEventSupported()');
function visit6_26_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].lineData[6]++;
KISSY.add('event/dom/touch/handle', function(S, Dom, eventHandleMap, DomEvent) {
  _$jscoverage['/touch/handle.js'].functionData[0]++;
  _$jscoverage['/touch/handle.js'].lineData[7]++;
  var key = S.guid('touch-handle'), Features = S.Features, gestureStartEvent, gestureMoveEvent, gestureEndEvent;
  _$jscoverage['/touch/handle.js'].lineData[13]++;
  function isTouchEvent(e) {
    _$jscoverage['/touch/handle.js'].functionData[1]++;
    _$jscoverage['/touch/handle.js'].lineData[14]++;
    return S.startsWith(e.type, 'touch');
  }
  _$jscoverage['/touch/handle.js'].lineData[17]++;
  function isMouseEvent(e) {
    _$jscoverage['/touch/handle.js'].functionData[2]++;
    _$jscoverage['/touch/handle.js'].lineData[18]++;
    return S.startsWith(e.type, 'mouse');
  }
  _$jscoverage['/touch/handle.js'].lineData[22]++;
  var DUP_TIMEOUT = 2500;
  _$jscoverage['/touch/handle.js'].lineData[24]++;
  var DUP_DIST = 25;
  _$jscoverage['/touch/handle.js'].lineData[26]++;
  if (visit6_26_1(Features.isTouchEventSupported())) {
    _$jscoverage['/touch/handle.js'].lineData[27]++;
    gestureEndEvent = 'touchend touchcancel mouseup';
    _$jscoverage['/touch/handle.js'].lineData[29]++;
    gestureStartEvent = 'touchstart mousedown';
    _$jscoverage['/touch/handle.js'].lineData[30]++;
    gestureMoveEvent = 'touchmove mousemove';
    _$jscoverage['/touch/handle.js'].lineData[31]++;
    if (visit7_31_1(S.UA.ios)) {
      _$jscoverage['/touch/handle.js'].lineData[33]++;
      gestureEndEvent = 'touchend touchcancel';
      _$jscoverage['/touch/handle.js'].lineData[34]++;
      gestureStartEvent = 'touchstart';
      _$jscoverage['/touch/handle.js'].lineData[35]++;
      gestureMoveEvent = 'touchmove';
    }
  } else {
    _$jscoverage['/touch/handle.js'].lineData[37]++;
    if (visit8_37_1(Features.isMsPointerSupported())) {
      _$jscoverage['/touch/handle.js'].lineData[38]++;
      gestureStartEvent = 'MSPointerDown';
      _$jscoverage['/touch/handle.js'].lineData[39]++;
      gestureMoveEvent = 'MSPointerMove';
      _$jscoverage['/touch/handle.js'].lineData[40]++;
      gestureEndEvent = 'MSPointerUp MSPointerCancel';
    } else {
      _$jscoverage['/touch/handle.js'].lineData[42]++;
      gestureStartEvent = 'mousedown';
      _$jscoverage['/touch/handle.js'].lineData[43]++;
      gestureMoveEvent = 'mousemove';
      _$jscoverage['/touch/handle.js'].lineData[44]++;
      gestureEndEvent = 'mouseup';
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[47]++;
  function DocumentHandler(doc) {
    _$jscoverage['/touch/handle.js'].functionData[3]++;
    _$jscoverage['/touch/handle.js'].lineData[48]++;
    var self = this;
    _$jscoverage['/touch/handle.js'].lineData[49]++;
    self.doc = doc;
    _$jscoverage['/touch/handle.js'].lineData[50]++;
    self.eventHandle = {};
    _$jscoverage['/touch/handle.js'].lineData[51]++;
    self.init();
    _$jscoverage['/touch/handle.js'].lineData[53]++;
    self.touches = [];
    _$jscoverage['/touch/handle.js'].lineData[55]++;
    self.inTouch = 0;
  }
  _$jscoverage['/touch/handle.js'].lineData[58]++;
  DocumentHandler.prototype = {
  lastTouches: [], 
  firstTouch: null, 
  init: function() {
  _$jscoverage['/touch/handle.js'].functionData[4]++;
  _$jscoverage['/touch/handle.js'].lineData[64]++;
  var self = this, doc = self.doc;
  _$jscoverage['/touch/handle.js'].lineData[66]++;
  DomEvent.on(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/touch/handle.js'].lineData[67]++;
  DomEvent.on(doc, gestureMoveEvent, self.onTouchMove, self);
  _$jscoverage['/touch/handle.js'].lineData[68]++;
  DomEvent.on(doc, gestureEndEvent, self.onTouchEnd, self);
}, 
  isPrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[5]++;
  _$jscoverage['/touch/handle.js'].lineData[72]++;
  return visit9_72_1(this.firstTouch === inTouch.identifier);
}, 
  setPrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[6]++;
  _$jscoverage['/touch/handle.js'].lineData[75]++;
  if (visit10_75_1(this.firstTouch === null)) {
    _$jscoverage['/touch/handle.js'].lineData[76]++;
    this.firstTouch = inTouch.identifier;
  }
}, 
  removePrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[7]++;
  _$jscoverage['/touch/handle.js'].lineData[80]++;
  if (visit11_80_1(this.isPrimaryTouch(inTouch))) {
    _$jscoverage['/touch/handle.js'].lineData[81]++;
    this.firstTouch = null;
  }
}, 
  dupMouse: function(inEvent) {
  _$jscoverage['/touch/handle.js'].functionData[8]++;
  _$jscoverage['/touch/handle.js'].lineData[87]++;
  var lts = this.lastTouches;
  _$jscoverage['/touch/handle.js'].lineData[88]++;
  var t = inEvent.changedTouches[0];
  _$jscoverage['/touch/handle.js'].lineData[90]++;
  if (visit12_90_1(this.isPrimaryTouch(t))) {
    _$jscoverage['/touch/handle.js'].lineData[92]++;
    var lt = {
  x: t.clientX, 
  y: t.clientY};
    _$jscoverage['/touch/handle.js'].lineData[93]++;
    lts.push(lt);
    _$jscoverage['/touch/handle.js'].lineData[94]++;
    var fn = (function(lts, lt) {
  _$jscoverage['/touch/handle.js'].functionData[9]++;
  _$jscoverage['/touch/handle.js'].lineData[95]++;
  var i = lts.indexOf(lt);
  _$jscoverage['/touch/handle.js'].lineData[96]++;
  if (visit13_96_1(i > -1)) {
    _$jscoverage['/touch/handle.js'].lineData[97]++;
    lts.splice(i, 1);
  }
}).bind(null, lts, lt);
    _$jscoverage['/touch/handle.js'].lineData[100]++;
    setTimeout(fn, DUP_TIMEOUT);
  }
}, 
  isEventSimulatedFromTouch: function(inEvent) {
  _$jscoverage['/touch/handle.js'].functionData[10]++;
  _$jscoverage['/touch/handle.js'].lineData[106]++;
  var lts = this.lastTouches;
  _$jscoverage['/touch/handle.js'].lineData[107]++;
  var x = inEvent.clientX, y = inEvent.clientY;
  _$jscoverage['/touch/handle.js'].lineData[109]++;
  for (var i = 0, l = lts.length, t; visit14_109_1(visit15_109_2(i < l) && (t = lts[i])); i++) {
    _$jscoverage['/touch/handle.js'].lineData[111]++;
    var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
    _$jscoverage['/touch/handle.js'].lineData[113]++;
    if (visit16_113_1(visit17_113_2(dx <= DUP_DIST) && visit18_113_3(dy <= DUP_DIST))) {
      _$jscoverage['/touch/handle.js'].lineData[114]++;
      return true;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[117]++;
  return 0;
}, 
  constructor: DocumentHandler, 
  normalize: function(e) {
  _$jscoverage['/touch/handle.js'].functionData[11]++;
  _$jscoverage['/touch/handle.js'].lineData[123]++;
  var type = e.type, notUp, touchList;
  _$jscoverage['/touch/handle.js'].lineData[126]++;
  if (visit19_126_1(isTouchEvent(e))) {
    _$jscoverage['/touch/handle.js'].lineData[127]++;
    touchList = (visit20_127_1(visit21_127_2(type == 'touchend') || visit22_127_3(type == 'touchcancel'))) ? e.changedTouches : e.touches;
    _$jscoverage['/touch/handle.js'].lineData[130]++;
    if (visit23_130_1(touchList.length == 1)) {
      _$jscoverage['/touch/handle.js'].lineData[131]++;
      e.which = 1;
      _$jscoverage['/touch/handle.js'].lineData[132]++;
      e.pageX = touchList[0].pageX;
      _$jscoverage['/touch/handle.js'].lineData[133]++;
      e.pageY = touchList[0].pageY;
    }
    _$jscoverage['/touch/handle.js'].lineData[135]++;
    return e;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[137]++;
    touchList = this.touches;
  }
  _$jscoverage['/touch/handle.js'].lineData[139]++;
  notUp = !type.match(/(up|cancel)$/i);
  _$jscoverage['/touch/handle.js'].lineData[140]++;
  e.touches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[141]++;
  e.targetTouches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[142]++;
  e.changedTouches = touchList;
  _$jscoverage['/touch/handle.js'].lineData[143]++;
  return e;
}, 
  onTouchStart: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[12]++;
  _$jscoverage['/touch/handle.js'].lineData[147]++;
  var e, h, self = this, eventHandle = self.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[150]++;
  if (visit24_150_1(isTouchEvent(event))) {
    _$jscoverage['/touch/handle.js'].lineData[151]++;
    self.setPrimaryTouch(event.changedTouches[0]);
    _$jscoverage['/touch/handle.js'].lineData[152]++;
    self.dupMouse(event);
  } else {
    _$jscoverage['/touch/handle.js'].lineData[153]++;
    if (visit25_153_1(isMouseEvent(event))) {
      _$jscoverage['/touch/handle.js'].lineData[154]++;
      if (visit26_154_1(self.isEventSimulatedFromTouch(event))) {
        _$jscoverage['/touch/handle.js'].lineData[155]++;
        return;
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[158]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[159]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[160]++;
    h.isActive = 1;
  }
  _$jscoverage['/touch/handle.js'].lineData[162]++;
  if (visit27_162_1(isTouchEvent(event))) {
    _$jscoverage['/touch/handle.js'].lineData[163]++;
    self.touches = S.makeArray(event.touches);
  } else {
    _$jscoverage['/touch/handle.js'].lineData[165]++;
    self.touches = [event.originalEvent];
  }
  _$jscoverage['/touch/handle.js'].lineData[168]++;
  self.callEventHandle('onTouchStart', event);
}, 
  onTouchMove: function(e) {
  _$jscoverage['/touch/handle.js'].functionData[13]++;
  _$jscoverage['/touch/handle.js'].lineData[172]++;
  var self = this;
  _$jscoverage['/touch/handle.js'].lineData[173]++;
  if (visit28_173_1(isMouseEvent(e))) {
    _$jscoverage['/touch/handle.js'].lineData[174]++;
    if (visit29_174_1(this.isEventSimulatedFromTouch(e))) {
      _$jscoverage['/touch/handle.js'].lineData[175]++;
      return;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[178]++;
  self.touches = [e.originalEvent];
  _$jscoverage['/touch/handle.js'].lineData[180]++;
  self.callEventHandle('onTouchMove', e);
}, 
  onTouchEnd: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[14]++;
  _$jscoverage['/touch/handle.js'].lineData[184]++;
  var self = this;
  _$jscoverage['/touch/handle.js'].lineData[185]++;
  if (visit30_185_1(isMouseEvent(event))) {
    _$jscoverage['/touch/handle.js'].lineData[186]++;
    if (visit31_186_1(self.isEventSimulatedFromTouch(event))) {
      _$jscoverage['/touch/handle.js'].lineData[187]++;
      return;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[190]++;
  self.callEventHandle('onTouchEnd', event);
  _$jscoverage['/touch/handle.js'].lineData[191]++;
  if (visit32_191_1(isTouchEvent(event))) {
    _$jscoverage['/touch/handle.js'].lineData[192]++;
    self.touches = S.makeArray(event.touches);
    _$jscoverage['/touch/handle.js'].lineData[193]++;
    self.dupMouse(event);
    _$jscoverage['/touch/handle.js'].lineData[194]++;
    S.makeArray(event.changedTouches).forEach(function(touch) {
  _$jscoverage['/touch/handle.js'].functionData[15]++;
  _$jscoverage['/touch/handle.js'].lineData[195]++;
  self.removePrimaryTouch(touch);
});
  } else {
    _$jscoverage['/touch/handle.js'].lineData[198]++;
    self.touches = [];
  }
}, 
  callEventHandle: function(method, event) {
  _$jscoverage['/touch/handle.js'].functionData[16]++;
  _$jscoverage['/touch/handle.js'].lineData[203]++;
  var self = this, eventHandle = self.eventHandle, e, h;
  _$jscoverage['/touch/handle.js'].lineData[207]++;
  event = self.normalize(event);
  _$jscoverage['/touch/handle.js'].lineData[208]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[210]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[211]++;
    if (visit33_211_1(h.processed)) {
      _$jscoverage['/touch/handle.js'].lineData[212]++;
      continue;
    }
    _$jscoverage['/touch/handle.js'].lineData[214]++;
    h.processed = 1;
    _$jscoverage['/touch/handle.js'].lineData[216]++;
    if (visit34_216_1(h.isActive && visit35_216_2(h[method] && visit36_216_3(h[method](event) === false)))) {
      _$jscoverage['/touch/handle.js'].lineData[217]++;
      h.isActive = 0;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[221]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[222]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[223]++;
    h.processed = 0;
  }
}, 
  addEventHandle: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[17]++;
  _$jscoverage['/touch/handle.js'].lineData[228]++;
  var self = this, eventHandle = self.eventHandle, handle = eventHandleMap[event].handle;
  _$jscoverage['/touch/handle.js'].lineData[231]++;
  if (visit37_231_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[232]++;
    eventHandle[event].count++;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[234]++;
    eventHandle[event] = {
  count: 1, 
  handle: handle};
  }
}, 
  'removeEventHandle': function(event) {
  _$jscoverage['/touch/handle.js'].functionData[18]++;
  _$jscoverage['/touch/handle.js'].lineData[242]++;
  var eventHandle = this.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[243]++;
  if (visit38_243_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[244]++;
    eventHandle[event].count--;
    _$jscoverage['/touch/handle.js'].lineData[245]++;
    if (visit39_245_1(!eventHandle[event].count)) {
      _$jscoverage['/touch/handle.js'].lineData[246]++;
      delete eventHandle[event];
    }
  }
}, 
  destroy: function() {
  _$jscoverage['/touch/handle.js'].functionData[19]++;
  _$jscoverage['/touch/handle.js'].lineData[252]++;
  var self = this, doc = self.doc;
  _$jscoverage['/touch/handle.js'].lineData[254]++;
  DomEvent.detach(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/touch/handle.js'].lineData[255]++;
  DomEvent.detach(doc, gestureMoveEvent, self.onTouchMove, self);
  _$jscoverage['/touch/handle.js'].lineData[256]++;
  DomEvent.detach(doc, gestureEndEvent, self.onTouchEnd, self);
}};
  _$jscoverage['/touch/handle.js'].lineData[260]++;
  return {
  addDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[20]++;
  _$jscoverage['/touch/handle.js'].lineData[262]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[264]++;
  if (visit40_264_1(!handle)) {
    _$jscoverage['/touch/handle.js'].lineData[265]++;
    Dom.data(doc, key, handle = new DocumentHandler(doc));
  }
  _$jscoverage['/touch/handle.js'].lineData[267]++;
  if (visit41_267_1(event)) {
    _$jscoverage['/touch/handle.js'].lineData[268]++;
    handle.addEventHandle(event);
  }
}, 
  removeDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[21]++;
  _$jscoverage['/touch/handle.js'].lineData[273]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[275]++;
  if (visit42_275_1(handle)) {
    _$jscoverage['/touch/handle.js'].lineData[276]++;
    if (visit43_276_1(event)) {
      _$jscoverage['/touch/handle.js'].lineData[277]++;
      handle.removeEventHandle(event);
    }
    _$jscoverage['/touch/handle.js'].lineData[279]++;
    if (visit44_279_1(S.isEmptyObject(handle.eventHandle))) {
      _$jscoverage['/touch/handle.js'].lineData[280]++;
      handle.destroy();
      _$jscoverage['/touch/handle.js'].lineData[281]++;
      Dom.removeData(doc, key);
    }
  }
}};
}, {
  requires: ['dom', './handle-map', 'event/dom/base', './tap', './swipe', './double-tap', './pinch', './tap-hold', './rotate']});
