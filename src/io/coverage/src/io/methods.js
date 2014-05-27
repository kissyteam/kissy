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
if (! _$jscoverage['/io/methods.js']) {
  _$jscoverage['/io/methods.js'] = {};
  _$jscoverage['/io/methods.js'].lineData = [];
  _$jscoverage['/io/methods.js'].lineData[6] = 0;
  _$jscoverage['/io/methods.js'].lineData[7] = 0;
  _$jscoverage['/io/methods.js'].lineData[8] = 0;
  _$jscoverage['/io/methods.js'].lineData[10] = 0;
  _$jscoverage['/io/methods.js'].lineData[11] = 0;
  _$jscoverage['/io/methods.js'].lineData[17] = 0;
  _$jscoverage['/io/methods.js'].lineData[19] = 0;
  _$jscoverage['/io/methods.js'].lineData[31] = 0;
  _$jscoverage['/io/methods.js'].lineData[32] = 0;
  _$jscoverage['/io/methods.js'].lineData[35] = 0;
  _$jscoverage['/io/methods.js'].lineData[36] = 0;
  _$jscoverage['/io/methods.js'].lineData[39] = 0;
  _$jscoverage['/io/methods.js'].lineData[41] = 0;
  _$jscoverage['/io/methods.js'].lineData[42] = 0;
  _$jscoverage['/io/methods.js'].lineData[43] = 0;
  _$jscoverage['/io/methods.js'].lineData[44] = 0;
  _$jscoverage['/io/methods.js'].lineData[46] = 0;
  _$jscoverage['/io/methods.js'].lineData[52] = 0;
  _$jscoverage['/io/methods.js'].lineData[55] = 0;
  _$jscoverage['/io/methods.js'].lineData[56] = 0;
  _$jscoverage['/io/methods.js'].lineData[57] = 0;
  _$jscoverage['/io/methods.js'].lineData[58] = 0;
  _$jscoverage['/io/methods.js'].lineData[59] = 0;
  _$jscoverage['/io/methods.js'].lineData[61] = 0;
  _$jscoverage['/io/methods.js'].lineData[62] = 0;
  _$jscoverage['/io/methods.js'].lineData[66] = 0;
  _$jscoverage['/io/methods.js'].lineData[67] = 0;
  _$jscoverage['/io/methods.js'].lineData[69] = 0;
  _$jscoverage['/io/methods.js'].lineData[70] = 0;
  _$jscoverage['/io/methods.js'].lineData[72] = 0;
  _$jscoverage['/io/methods.js'].lineData[73] = 0;
  _$jscoverage['/io/methods.js'].lineData[74] = 0;
  _$jscoverage['/io/methods.js'].lineData[75] = 0;
  _$jscoverage['/io/methods.js'].lineData[77] = 0;
  _$jscoverage['/io/methods.js'].lineData[81] = 0;
  _$jscoverage['/io/methods.js'].lineData[84] = 0;
  _$jscoverage['/io/methods.js'].lineData[85] = 0;
  _$jscoverage['/io/methods.js'].lineData[87] = 0;
  _$jscoverage['/io/methods.js'].lineData[89] = 0;
  _$jscoverage['/io/methods.js'].lineData[90] = 0;
  _$jscoverage['/io/methods.js'].lineData[92] = 0;
  _$jscoverage['/io/methods.js'].lineData[94] = 0;
  _$jscoverage['/io/methods.js'].lineData[97] = 0;
  _$jscoverage['/io/methods.js'].lineData[100] = 0;
  _$jscoverage['/io/methods.js'].lineData[103] = 0;
  _$jscoverage['/io/methods.js'].lineData[104] = 0;
  _$jscoverage['/io/methods.js'].lineData[105] = 0;
  _$jscoverage['/io/methods.js'].lineData[114] = 0;
  _$jscoverage['/io/methods.js'].lineData[115] = 0;
  _$jscoverage['/io/methods.js'].lineData[125] = 0;
  _$jscoverage['/io/methods.js'].lineData[128] = 0;
  _$jscoverage['/io/methods.js'].lineData[129] = 0;
  _$jscoverage['/io/methods.js'].lineData[130] = 0;
  _$jscoverage['/io/methods.js'].lineData[131] = 0;
  _$jscoverage['/io/methods.js'].lineData[132] = 0;
  _$jscoverage['/io/methods.js'].lineData[133] = 0;
  _$jscoverage['/io/methods.js'].lineData[136] = 0;
  _$jscoverage['/io/methods.js'].lineData[138] = 0;
  _$jscoverage['/io/methods.js'].lineData[143] = 0;
  _$jscoverage['/io/methods.js'].lineData[144] = 0;
  _$jscoverage['/io/methods.js'].lineData[145] = 0;
  _$jscoverage['/io/methods.js'].lineData[147] = 0;
  _$jscoverage['/io/methods.js'].lineData[157] = 0;
  _$jscoverage['/io/methods.js'].lineData[158] = 0;
  _$jscoverage['/io/methods.js'].lineData[159] = 0;
  _$jscoverage['/io/methods.js'].lineData[160] = 0;
  _$jscoverage['/io/methods.js'].lineData[162] = 0;
  _$jscoverage['/io/methods.js'].lineData[163] = 0;
  _$jscoverage['/io/methods.js'].lineData[172] = 0;
  _$jscoverage['/io/methods.js'].lineData[173] = 0;
  _$jscoverage['/io/methods.js'].lineData[174] = 0;
  _$jscoverage['/io/methods.js'].lineData[176] = 0;
  _$jscoverage['/io/methods.js'].lineData[180] = 0;
  _$jscoverage['/io/methods.js'].lineData[187] = 0;
  _$jscoverage['/io/methods.js'].lineData[188] = 0;
  _$jscoverage['/io/methods.js'].lineData[190] = 0;
  _$jscoverage['/io/methods.js'].lineData[191] = 0;
  _$jscoverage['/io/methods.js'].lineData[192] = 0;
  _$jscoverage['/io/methods.js'].lineData[193] = 0;
  _$jscoverage['/io/methods.js'].lineData[196] = 0;
  _$jscoverage['/io/methods.js'].lineData[197] = 0;
  _$jscoverage['/io/methods.js'].lineData[198] = 0;
  _$jscoverage['/io/methods.js'].lineData[200] = 0;
  _$jscoverage['/io/methods.js'].lineData[201] = 0;
  _$jscoverage['/io/methods.js'].lineData[202] = 0;
  _$jscoverage['/io/methods.js'].lineData[203] = 0;
  _$jscoverage['/io/methods.js'].lineData[205] = 0;
  _$jscoverage['/io/methods.js'].lineData[206] = 0;
  _$jscoverage['/io/methods.js'].lineData[207] = 0;
  _$jscoverage['/io/methods.js'].lineData[208] = 0;
  _$jscoverage['/io/methods.js'].lineData[211] = 0;
  _$jscoverage['/io/methods.js'].lineData[215] = 0;
  _$jscoverage['/io/methods.js'].lineData[216] = 0;
  _$jscoverage['/io/methods.js'].lineData[220] = 0;
  _$jscoverage['/io/methods.js'].lineData[221] = 0;
  _$jscoverage['/io/methods.js'].lineData[223] = 0;
  _$jscoverage['/io/methods.js'].lineData[226] = 0;
  _$jscoverage['/io/methods.js'].lineData[227] = 0;
  _$jscoverage['/io/methods.js'].lineData[228] = 0;
  _$jscoverage['/io/methods.js'].lineData[256] = 0;
  _$jscoverage['/io/methods.js'].lineData[265] = 0;
  _$jscoverage['/io/methods.js'].lineData[266] = 0;
  _$jscoverage['/io/methods.js'].lineData[268] = 0;
  _$jscoverage['/io/methods.js'].lineData[269] = 0;
  _$jscoverage['/io/methods.js'].lineData[271] = 0;
  _$jscoverage['/io/methods.js'].lineData[272] = 0;
  _$jscoverage['/io/methods.js'].lineData[273] = 0;
  _$jscoverage['/io/methods.js'].lineData[284] = 0;
  _$jscoverage['/io/methods.js'].lineData[289] = 0;
}
if (! _$jscoverage['/io/methods.js'].functionData) {
  _$jscoverage['/io/methods.js'].functionData = [];
  _$jscoverage['/io/methods.js'].functionData[0] = 0;
  _$jscoverage['/io/methods.js'].functionData[1] = 0;
  _$jscoverage['/io/methods.js'].functionData[2] = 0;
  _$jscoverage['/io/methods.js'].functionData[3] = 0;
  _$jscoverage['/io/methods.js'].functionData[4] = 0;
  _$jscoverage['/io/methods.js'].functionData[5] = 0;
  _$jscoverage['/io/methods.js'].functionData[6] = 0;
  _$jscoverage['/io/methods.js'].functionData[7] = 0;
  _$jscoverage['/io/methods.js'].functionData[8] = 0;
  _$jscoverage['/io/methods.js'].functionData[9] = 0;
  _$jscoverage['/io/methods.js'].functionData[10] = 0;
  _$jscoverage['/io/methods.js'].functionData[11] = 0;
}
if (! _$jscoverage['/io/methods.js'].branchData) {
  _$jscoverage['/io/methods.js'].branchData = {};
  _$jscoverage['/io/methods.js'].branchData['31'] = [];
  _$jscoverage['/io/methods.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['32'] = [];
  _$jscoverage['/io/methods.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['35'] = [];
  _$jscoverage['/io/methods.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['39'] = [];
  _$jscoverage['/io/methods.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['42'] = [];
  _$jscoverage['/io/methods.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['43'] = [];
  _$jscoverage['/io/methods.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['52'] = [];
  _$jscoverage['/io/methods.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['55'] = [];
  _$jscoverage['/io/methods.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['56'] = [];
  _$jscoverage['/io/methods.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['56'][2] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['56'][3] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['59'] = [];
  _$jscoverage['/io/methods.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['59'][2] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['59'][3] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['66'] = [];
  _$jscoverage['/io/methods.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['71'] = [];
  _$jscoverage['/io/methods.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['72'] = [];
  _$jscoverage['/io/methods.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['74'] = [];
  _$jscoverage['/io/methods.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['84'] = [];
  _$jscoverage['/io/methods.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['87'] = [];
  _$jscoverage['/io/methods.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['89'] = [];
  _$jscoverage['/io/methods.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['115'] = [];
  _$jscoverage['/io/methods.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['129'] = [];
  _$jscoverage['/io/methods.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['130'] = [];
  _$jscoverage['/io/methods.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['138'] = [];
  _$jscoverage['/io/methods.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['144'] = [];
  _$jscoverage['/io/methods.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['158'] = [];
  _$jscoverage['/io/methods.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['159'] = [];
  _$jscoverage['/io/methods.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['173'] = [];
  _$jscoverage['/io/methods.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['187'] = [];
  _$jscoverage['/io/methods.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['193'] = [];
  _$jscoverage['/io/methods.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['193'][2] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['193'][3] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['193'][4] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['193'][5] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['196'] = [];
  _$jscoverage['/io/methods.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['205'] = [];
  _$jscoverage['/io/methods.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['206'] = [];
  _$jscoverage['/io/methods.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['211'] = [];
  _$jscoverage['/io/methods.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['215'] = [];
  _$jscoverage['/io/methods.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/io/methods.js'].branchData['286'] = [];
  _$jscoverage['/io/methods.js'].branchData['286'][1] = new BranchData();
}
_$jscoverage['/io/methods.js'].branchData['286'][1].init(91, 36, 'Uri.getComponents(c.url).query || \'\'');
function visit114_286_1(result) {
  _$jscoverage['/io/methods.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['215'][1].init(26, 10, 'status < 0');
function visit113_215_1(result) {
  _$jscoverage['/io/methods.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['211'][1].init(323, 27, 'e.message || \'parser error\'');
function visit112_211_1(result) {
  _$jscoverage['/io/methods.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['206'][1].init(93, 9, '\'@DEBUG@\'');
function visit111_206_1(result) {
  _$jscoverage['/io/methods.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['205'][1].init(36, 12, 'e.stack || e');
function visit110_205_1(result) {
  _$jscoverage['/io/methods.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['196'][1].init(165, 23, 'status === NOT_MODIFIED');
function visit109_196_1(result) {
  _$jscoverage['/io/methods.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['193'][5].init(476, 23, 'status === NOT_MODIFIED');
function visit108_193_5(result) {
  _$jscoverage['/io/methods.js'].branchData['193'][5].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['193'][4].init(447, 25, 'status < MULTIPLE_CHOICES');
function visit107_193_4(result) {
  _$jscoverage['/io/methods.js'].branchData['193'][4].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['193'][3].init(426, 17, 'status >= OK_CODE');
function visit106_193_3(result) {
  _$jscoverage['/io/methods.js'].branchData['193'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['193'][2].init(426, 46, 'status >= OK_CODE && status < MULTIPLE_CHOICES');
function visit105_193_2(result) {
  _$jscoverage['/io/methods.js'].branchData['193'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['193'][1].init(426, 73, 'status >= OK_CODE && status < MULTIPLE_CHOICES || status === NOT_MODIFIED');
function visit104_193_1(result) {
  _$jscoverage['/io/methods.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['187'][1].init(234, 16, 'self.state === 2');
function visit103_187_1(result) {
  _$jscoverage['/io/methods.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['173'][1].init(71, 9, 'transport');
function visit102_173_1(result) {
  _$jscoverage['/io/methods.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['159'][1].init(109, 14, 'self.transport');
function visit101_159_1(result) {
  _$jscoverage['/io/methods.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['158'][1].init(65, 21, 'statusText || \'abort\'');
function visit100_158_1(result) {
  _$jscoverage['/io/methods.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['144'][1].init(56, 11, '!self.state');
function visit99_144_1(result) {
  _$jscoverage['/io/methods.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['138'][1].init(679, 19, 'match === undefined');
function visit98_138_1(result) {
  _$jscoverage['/io/methods.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['130'][1].init(26, 41, '!(responseHeaders = self.responseHeaders)');
function visit97_130_1(result) {
  _$jscoverage['/io/methods.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['129'][1].init(204, 16, 'self.state === 2');
function visit96_129_1(result) {
  _$jscoverage['/io/methods.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['115'][1].init(59, 16, 'self.state === 2');
function visit95_115_1(result) {
  _$jscoverage['/io/methods.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['89'][1].init(132, 10, '!converter');
function visit94_89_1(result) {
  _$jscoverage['/io/methods.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['87'][1].init(65, 46, 'converts[prevType] && converts[prevType][type]');
function visit93_87_1(result) {
  _$jscoverage['/io/methods.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['84'][1].init(2438, 19, 'i < dataType.length');
function visit92_84_1(result) {
  _$jscoverage['/io/methods.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['74'][1].init(94, 19, 'prevType === \'text\'');
function visit91_74_1(result) {
  _$jscoverage['/io/methods.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['72'][1].init(156, 30, 'converter && rawData[prevType]');
function visit90_72_1(result) {
  _$jscoverage['/io/methods.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['71'][1].init(60, 46, 'converts[prevType] && converts[prevType][type]');
function visit89_71_1(result) {
  _$jscoverage['/io/methods.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['66'][1].init(1236, 13, '!responseData');
function visit88_66_1(result) {
  _$jscoverage['/io/methods.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['59'][3].init(218, 17, 'xml !== undefined');
function visit87_59_3(result) {
  _$jscoverage['/io/methods.js'].branchData['59'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['59'][2].init(181, 33, 'dataType[dataTypeIndex] === \'xml\'');
function visit86_59_2(result) {
  _$jscoverage['/io/methods.js'].branchData['59'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['59'][1].init(181, 54, 'dataType[dataTypeIndex] === \'xml\' && xml !== undefined');
function visit85_59_1(result) {
  _$jscoverage['/io/methods.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['56'][3].init(60, 18, 'text !== undefined');
function visit84_56_3(result) {
  _$jscoverage['/io/methods.js'].branchData['56'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['56'][2].init(22, 34, 'dataType[dataTypeIndex] === \'text\'');
function visit83_56_2(result) {
  _$jscoverage['/io/methods.js'].branchData['56'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['56'][1].init(22, 56, 'dataType[dataTypeIndex] === \'text\' && text !== undefined');
function visit82_56_1(result) {
  _$jscoverage['/io/methods.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['55'][1].init(775, 31, 'dataTypeIndex < dataType.length');
function visit81_55_1(result) {
  _$jscoverage['/io/methods.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['52'][1].init(683, 21, 'dataType[0] || \'text\'');
function visit80_52_1(result) {
  _$jscoverage['/io/methods.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['43'][1].init(30, 20, 'dataType[0] !== type');
function visit79_43_1(result) {
  _$jscoverage['/io/methods.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['42'][1].init(26, 32, 'contents[type].test(contentType)');
function visit78_42_1(result) {
  _$jscoverage['/io/methods.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['39'][1].init(221, 16, '!dataType.length');
function visit77_39_1(result) {
  _$jscoverage['/io/methods.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['35'][1].init(129, 19, 'dataType[0] === \'*\'');
function visit76_35_1(result) {
  _$jscoverage['/io/methods.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['32'][1].init(28, 51, 'io.mimeType || io.getResponseHeader(\'Content-Type\')');
function visit75_32_1(result) {
  _$jscoverage['/io/methods.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].branchData['31'][1].init(427, 11, 'text || xml');
function visit74_31_1(result) {
  _$jscoverage['/io/methods.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/methods.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/methods.js'].functionData[0]++;
  _$jscoverage['/io/methods.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/io/methods.js'].lineData[8]++;
  var Promise = require('promise'), IO = require('./base');
  _$jscoverage['/io/methods.js'].lineData[10]++;
  var Uri = require('uri');
  _$jscoverage['/io/methods.js'].lineData[11]++;
  var OK_CODE = 200, MULTIPLE_CHOICES = 300, NOT_MODIFIED = 304, HEADER_REG = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;
  _$jscoverage['/io/methods.js'].lineData[17]++;
  function handleResponseData(io) {
    _$jscoverage['/io/methods.js'].functionData[1]++;
    _$jscoverage['/io/methods.js'].lineData[19]++;
    var text = io.responseText, xml = io.responseXML, c = io.config, converts = c.converters, type, contentType, responseData, contents = c.contents, dataType = c.dataType;
    _$jscoverage['/io/methods.js'].lineData[31]++;
    if (visit74_31_1(text || xml)) {
      _$jscoverage['/io/methods.js'].lineData[32]++;
      contentType = visit75_32_1(io.mimeType || io.getResponseHeader('Content-Type'));
      _$jscoverage['/io/methods.js'].lineData[35]++;
      while (visit76_35_1(dataType[0] === '*')) {
        _$jscoverage['/io/methods.js'].lineData[36]++;
        dataType.shift();
      }
      _$jscoverage['/io/methods.js'].lineData[39]++;
      if (visit77_39_1(!dataType.length)) {
        _$jscoverage['/io/methods.js'].lineData[41]++;
        for (type in contents) {
          _$jscoverage['/io/methods.js'].lineData[42]++;
          if (visit78_42_1(contents[type].test(contentType))) {
            _$jscoverage['/io/methods.js'].lineData[43]++;
            if (visit79_43_1(dataType[0] !== type)) {
              _$jscoverage['/io/methods.js'].lineData[44]++;
              dataType.unshift(type);
            }
            _$jscoverage['/io/methods.js'].lineData[46]++;
            break;
          }
        }
      }
      _$jscoverage['/io/methods.js'].lineData[52]++;
      dataType[0] = visit80_52_1(dataType[0] || 'text');
      _$jscoverage['/io/methods.js'].lineData[55]++;
      for (var dataTypeIndex = 0; visit81_55_1(dataTypeIndex < dataType.length); dataTypeIndex++) {
        _$jscoverage['/io/methods.js'].lineData[56]++;
        if (visit82_56_1(visit83_56_2(dataType[dataTypeIndex] === 'text') && visit84_56_3(text !== undefined))) {
          _$jscoverage['/io/methods.js'].lineData[57]++;
          responseData = text;
          _$jscoverage['/io/methods.js'].lineData[58]++;
          break;
        } else {
          _$jscoverage['/io/methods.js'].lineData[59]++;
          if (visit85_59_1(visit86_59_2(dataType[dataTypeIndex] === 'xml') && visit87_59_3(xml !== undefined))) {
            _$jscoverage['/io/methods.js'].lineData[61]++;
            responseData = xml;
            _$jscoverage['/io/methods.js'].lineData[62]++;
            break;
          }
        }
      }
      _$jscoverage['/io/methods.js'].lineData[66]++;
      if (visit88_66_1(!responseData)) {
        _$jscoverage['/io/methods.js'].lineData[67]++;
        var rawData = {
  text: text, 
  xml: xml};
        _$jscoverage['/io/methods.js'].lineData[69]++;
        util.each(['text', 'xml'], function(prevType) {
  _$jscoverage['/io/methods.js'].functionData[2]++;
  _$jscoverage['/io/methods.js'].lineData[70]++;
  var type = dataType[0], converter = visit89_71_1(converts[prevType] && converts[prevType][type]);
  _$jscoverage['/io/methods.js'].lineData[72]++;
  if (visit90_72_1(converter && rawData[prevType])) {
    _$jscoverage['/io/methods.js'].lineData[73]++;
    dataType.unshift(prevType);
    _$jscoverage['/io/methods.js'].lineData[74]++;
    responseData = visit91_74_1(prevType === 'text') ? text : xml;
    _$jscoverage['/io/methods.js'].lineData[75]++;
    return false;
  }
  _$jscoverage['/io/methods.js'].lineData[77]++;
  return undefined;
});
      }
    }
    _$jscoverage['/io/methods.js'].lineData[81]++;
    var prevType = dataType[0];
    _$jscoverage['/io/methods.js'].lineData[84]++;
    for (var i = 1; visit92_84_1(i < dataType.length); i++) {
      _$jscoverage['/io/methods.js'].lineData[85]++;
      type = dataType[i];
      _$jscoverage['/io/methods.js'].lineData[87]++;
      var converter = visit93_87_1(converts[prevType] && converts[prevType][type]);
      _$jscoverage['/io/methods.js'].lineData[89]++;
      if (visit94_89_1(!converter)) {
        _$jscoverage['/io/methods.js'].lineData[90]++;
        throw new Error('no covert for ' + prevType + ' => ' + type);
      }
      _$jscoverage['/io/methods.js'].lineData[92]++;
      responseData = converter(responseData);
      _$jscoverage['/io/methods.js'].lineData[94]++;
      prevType = type;
    }
    _$jscoverage['/io/methods.js'].lineData[97]++;
    io.responseData = responseData;
  }
  _$jscoverage['/io/methods.js'].lineData[100]++;
  util.extend(IO, Promise, {
  setRequestHeader: function(name, value) {
  _$jscoverage['/io/methods.js'].functionData[3]++;
  _$jscoverage['/io/methods.js'].lineData[103]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[104]++;
  self.requestHeaders[name] = value;
  _$jscoverage['/io/methods.js'].lineData[105]++;
  return self;
}, 
  getAllResponseHeaders: function() {
  _$jscoverage['/io/methods.js'].functionData[4]++;
  _$jscoverage['/io/methods.js'].lineData[114]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[115]++;
  return visit95_115_1(self.state === 2) ? self.responseHeadersString : null;
}, 
  getResponseHeader: function(name) {
  _$jscoverage['/io/methods.js'].functionData[5]++;
  _$jscoverage['/io/methods.js'].lineData[125]++;
  var match, responseHeaders, self = this;
  _$jscoverage['/io/methods.js'].lineData[128]++;
  name = name.toLowerCase();
  _$jscoverage['/io/methods.js'].lineData[129]++;
  if (visit96_129_1(self.state === 2)) {
    _$jscoverage['/io/methods.js'].lineData[130]++;
    if (visit97_130_1(!(responseHeaders = self.responseHeaders))) {
      _$jscoverage['/io/methods.js'].lineData[131]++;
      responseHeaders = self.responseHeaders = {};
      _$jscoverage['/io/methods.js'].lineData[132]++;
      while ((match = HEADER_REG.exec(self.responseHeadersString))) {
        _$jscoverage['/io/methods.js'].lineData[133]++;
        responseHeaders[match[1].toLowerCase()] = match[2];
      }
    }
    _$jscoverage['/io/methods.js'].lineData[136]++;
    match = responseHeaders[name];
  }
  _$jscoverage['/io/methods.js'].lineData[138]++;
  return visit98_138_1(match === undefined) ? null : match;
}, 
  overrideMimeType: function(type) {
  _$jscoverage['/io/methods.js'].functionData[6]++;
  _$jscoverage['/io/methods.js'].lineData[143]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[144]++;
  if (visit99_144_1(!self.state)) {
    _$jscoverage['/io/methods.js'].lineData[145]++;
    self.mimeType = type;
  }
  _$jscoverage['/io/methods.js'].lineData[147]++;
  return self;
}, 
  abort: function(statusText) {
  _$jscoverage['/io/methods.js'].functionData[7]++;
  _$jscoverage['/io/methods.js'].lineData[157]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[158]++;
  statusText = visit100_158_1(statusText || 'abort');
  _$jscoverage['/io/methods.js'].lineData[159]++;
  if (visit101_159_1(self.transport)) {
    _$jscoverage['/io/methods.js'].lineData[160]++;
    self.transport.abort(statusText);
  }
  _$jscoverage['/io/methods.js'].lineData[162]++;
  self._ioReady(0, statusText);
  _$jscoverage['/io/methods.js'].lineData[163]++;
  return self;
}, 
  getNativeXhr: function() {
  _$jscoverage['/io/methods.js'].functionData[8]++;
  _$jscoverage['/io/methods.js'].lineData[172]++;
  var transport = this.transport;
  _$jscoverage['/io/methods.js'].lineData[173]++;
  if (visit102_173_1(transport)) {
    _$jscoverage['/io/methods.js'].lineData[174]++;
    return transport.nativeXhr;
  }
  _$jscoverage['/io/methods.js'].lineData[176]++;
  return null;
}, 
  _ioReady: function(status, statusText) {
  _$jscoverage['/io/methods.js'].functionData[9]++;
  _$jscoverage['/io/methods.js'].lineData[180]++;
  var self = this;
  _$jscoverage['/io/methods.js'].lineData[187]++;
  if (visit103_187_1(self.state === 2)) {
    _$jscoverage['/io/methods.js'].lineData[188]++;
    return;
  }
  _$jscoverage['/io/methods.js'].lineData[190]++;
  self.state = 2;
  _$jscoverage['/io/methods.js'].lineData[191]++;
  self.readyState = 4;
  _$jscoverage['/io/methods.js'].lineData[192]++;
  var isSuccess;
  _$jscoverage['/io/methods.js'].lineData[193]++;
  if (visit104_193_1(visit105_193_2(visit106_193_3(status >= OK_CODE) && visit107_193_4(status < MULTIPLE_CHOICES)) || visit108_193_5(status === NOT_MODIFIED))) {
    _$jscoverage['/io/methods.js'].lineData[196]++;
    if (visit109_196_1(status === NOT_MODIFIED)) {
      _$jscoverage['/io/methods.js'].lineData[197]++;
      statusText = 'not modified';
      _$jscoverage['/io/methods.js'].lineData[198]++;
      isSuccess = true;
    } else {
      _$jscoverage['/io/methods.js'].lineData[200]++;
      try {
        _$jscoverage['/io/methods.js'].lineData[201]++;
        handleResponseData(self);
        _$jscoverage['/io/methods.js'].lineData[202]++;
        statusText = 'success';
        _$jscoverage['/io/methods.js'].lineData[203]++;
        isSuccess = true;
      }      catch (e) {
  _$jscoverage['/io/methods.js'].lineData[205]++;
  S.log(visit110_205_1(e.stack || e), 'error');
  _$jscoverage['/io/methods.js'].lineData[206]++;
  if (visit111_206_1('@DEBUG@')) {
    _$jscoverage['/io/methods.js'].lineData[207]++;
    setTimeout(function() {
  _$jscoverage['/io/methods.js'].functionData[10]++;
  _$jscoverage['/io/methods.js'].lineData[208]++;
  throw e;
}, 0);
  }
  _$jscoverage['/io/methods.js'].lineData[211]++;
  statusText = visit112_211_1(e.message || 'parser error');
}
    }
  } else {
    _$jscoverage['/io/methods.js'].lineData[215]++;
    if (visit113_215_1(status < 0)) {
      _$jscoverage['/io/methods.js'].lineData[216]++;
      status = 0;
    }
  }
  _$jscoverage['/io/methods.js'].lineData[220]++;
  self.status = status;
  _$jscoverage['/io/methods.js'].lineData[221]++;
  self.statusText = statusText;
  _$jscoverage['/io/methods.js'].lineData[223]++;
  var defer = self.defer, config = self.config, timeoutTimer;
  _$jscoverage['/io/methods.js'].lineData[226]++;
  if ((timeoutTimer = self.timeoutTimer)) {
    _$jscoverage['/io/methods.js'].lineData[227]++;
    clearTimeout(timeoutTimer);
    _$jscoverage['/io/methods.js'].lineData[228]++;
    self.timeoutTimer = 0;
  }
  _$jscoverage['/io/methods.js'].lineData[256]++;
  var handler = isSuccess ? 'success' : 'error', h, v = [self.responseData, statusText, self], context = config.context, eventObject = {
  ajaxConfig: config, 
  io: self};
  _$jscoverage['/io/methods.js'].lineData[265]++;
  if ((h = config[handler])) {
    _$jscoverage['/io/methods.js'].lineData[266]++;
    h.apply(context, v);
  }
  _$jscoverage['/io/methods.js'].lineData[268]++;
  if ((h = config.complete)) {
    _$jscoverage['/io/methods.js'].lineData[269]++;
    h.apply(context, v);
  }
  _$jscoverage['/io/methods.js'].lineData[271]++;
  IO.fire(handler, eventObject);
  _$jscoverage['/io/methods.js'].lineData[272]++;
  IO.fire('complete', eventObject);
  _$jscoverage['/io/methods.js'].lineData[273]++;
  defer[isSuccess ? 'resolve' : 'reject'](v);
}, 
  _getUrlForSend: function() {
  _$jscoverage['/io/methods.js'].functionData[11]++;
  _$jscoverage['/io/methods.js'].lineData[284]++;
  var c = this.config, uri = c.uri, originalQuery = visit114_286_1(Uri.getComponents(c.url).query || ''), url = uri.toString.call(uri, c.serializeArray);
  _$jscoverage['/io/methods.js'].lineData[289]++;
  return url + (originalQuery ? ((uri.query.has() ? '&' : '?') + originalQuery) : originalQuery);
}});
});
