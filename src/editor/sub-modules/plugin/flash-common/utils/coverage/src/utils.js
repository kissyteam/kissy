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
if (! _$jscoverage['/utils.js']) {
  _$jscoverage['/utils.js'] = {};
  _$jscoverage['/utils.js'].lineData = [];
  _$jscoverage['/utils.js'].lineData[6] = 0;
  _$jscoverage['/utils.js'].lineData[7] = 0;
  _$jscoverage['/utils.js'].lineData[8] = 0;
  _$jscoverage['/utils.js'].lineData[13] = 0;
  _$jscoverage['/utils.js'].lineData[25] = 0;
  _$jscoverage['/utils.js'].lineData[26] = 0;
  _$jscoverage['/utils.js'].lineData[30] = 0;
  _$jscoverage['/utils.js'].lineData[37] = 0;
  _$jscoverage['/utils.js'].lineData[41] = 0;
  _$jscoverage['/utils.js'].lineData[44] = 0;
  _$jscoverage['/utils.js'].lineData[45] = 0;
  _$jscoverage['/utils.js'].lineData[46] = 0;
  _$jscoverage['/utils.js'].lineData[47] = 0;
  _$jscoverage['/utils.js'].lineData[48] = 0;
  _$jscoverage['/utils.js'].lineData[49] = 0;
  _$jscoverage['/utils.js'].lineData[56] = 0;
}
if (! _$jscoverage['/utils.js'].functionData) {
  _$jscoverage['/utils.js'].functionData = [];
  _$jscoverage['/utils.js'].functionData[0] = 0;
  _$jscoverage['/utils.js'].functionData[1] = 0;
  _$jscoverage['/utils.js'].functionData[2] = 0;
  _$jscoverage['/utils.js'].functionData[3] = 0;
  _$jscoverage['/utils.js'].functionData[4] = 0;
}
if (! _$jscoverage['/utils.js'].branchData) {
  _$jscoverage['/utils.js'].branchData = {};
  _$jscoverage['/utils.js'].branchData['20'] = [];
  _$jscoverage['/utils.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['21'] = [];
  _$jscoverage['/utils.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['31'] = [];
  _$jscoverage['/utils.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['31'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['32'] = [];
  _$jscoverage['/utils.js'].branchData['32'][1] = new BranchData();
}
_$jscoverage['/utils.js'].branchData['32'][1].init(110, 30, 'Dom.attr(element, \'src\') || \'\'');
function visit5_32_1(result) {
  _$jscoverage['/utils.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['31'][2].init(29, 61, 'Dom.attr(element, \'type\') === \'application/x-shockwave-flash\'');
function visit4_31_2(result) {
  _$jscoverage['/utils.js'].branchData['31'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['31'][1].init(-1, 142, 'Dom.attr(element, \'type\') === \'application/x-shockwave-flash\' || /\\.swf(?:$|\\?)/i.test(Dom.attr(element, \'src\') || \'\')');
function visit3_31_1(result) {
  _$jscoverage['/utils.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['21'][1].init(98, 16, '_type || \'flash\'');
function visit2_21_1(result) {
  _$jscoverage['/utils.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['20'][1].init(54, 18, '_cls || \'ke_flash\'');
function visit1_20_1(result) {
  _$jscoverage['/utils.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/utils.js'].functionData[0]++;
  _$jscoverage['/utils.js'].lineData[7]++;
  var SWF = require('swf');
  _$jscoverage['/utils.js'].lineData[8]++;
  var Dom = S.DOM, flashUtils = {
  insertFlash: function(editor, src, attrs, _cls, _type) {
  _$jscoverage['/utils.js'].functionData[1]++;
  _$jscoverage['/utils.js'].lineData[13]++;
  var nodeInfo = flashUtils.createSWF({
  src: src, 
  attrs: attrs, 
  document: editor.get('document')[0]}), real = nodeInfo.el, substitute = editor.createFakeElement(real, visit1_20_1(_cls || 'ke_flash'), visit2_21_1(_type || 'flash'), true, nodeInfo.html, attrs);
  _$jscoverage['/utils.js'].lineData[25]++;
  editor.insertElement(substitute);
  _$jscoverage['/utils.js'].lineData[26]++;
  return substitute;
}, 
  isFlashEmbed: function(element) {
  _$jscoverage['/utils.js'].functionData[2]++;
  _$jscoverage['/utils.js'].lineData[30]++;
  return (visit3_31_1(visit4_31_2(Dom.attr(element, 'type') === 'application/x-shockwave-flash') || /\.swf(?:$|\?)/i.test(visit5_32_1(Dom.attr(element, 'src') || ''))));
}, 
  getUrl: function(r) {
  _$jscoverage['/utils.js'].functionData[3]++;
  _$jscoverage['/utils.js'].lineData[37]++;
  return SWF.getSrc(r);
}, 
  createSWF: function(cfg) {
  _$jscoverage['/utils.js'].functionData[4]++;
  _$jscoverage['/utils.js'].lineData[41]++;
  var render = Dom.create('<div style="' + 'position:absolute;left:-9999px;top:-9999px;' + '"></div>', undefined, cfg.document);
  _$jscoverage['/utils.js'].lineData[44]++;
  cfg.htmlMode = 'full';
  _$jscoverage['/utils.js'].lineData[45]++;
  Dom.append(render, cfg.document.body);
  _$jscoverage['/utils.js'].lineData[46]++;
  cfg.render = render;
  _$jscoverage['/utils.js'].lineData[47]++;
  var swf = new SWF(cfg);
  _$jscoverage['/utils.js'].lineData[48]++;
  Dom.remove(render);
  _$jscoverage['/utils.js'].lineData[49]++;
  return {
  el: S.all(swf.get('el')), 
  html: swf.get('html')};
}};
  _$jscoverage['/utils.js'].lineData[56]++;
  return flashUtils;
});
