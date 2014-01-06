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
if (! _$jscoverage['/element-path.js']) {
  _$jscoverage['/element-path.js'] = {};
  _$jscoverage['/element-path.js'].lineData = [];
  _$jscoverage['/element-path.js'].lineData[6] = 0;
  _$jscoverage['/element-path.js'].lineData[7] = 0;
  _$jscoverage['/element-path.js'].lineData[8] = 0;
  _$jscoverage['/element-path.js'].lineData[9] = 0;
  _$jscoverage['/element-path.js'].lineData[11] = 0;
  _$jscoverage['/element-path.js'].lineData[12] = 0;
  _$jscoverage['/element-path.js'].lineData[13] = 0;
  _$jscoverage['/element-path.js'].lineData[14] = 0;
  _$jscoverage['/element-path.js'].lineData[15] = 0;
  _$jscoverage['/element-path.js'].lineData[18] = 0;
  _$jscoverage['/element-path.js'].lineData[20] = 0;
  _$jscoverage['/element-path.js'].lineData[23] = 0;
  _$jscoverage['/element-path.js'].lineData[24] = 0;
  _$jscoverage['/element-path.js'].lineData[25] = 0;
  _$jscoverage['/element-path.js'].lineData[26] = 0;
  _$jscoverage['/element-path.js'].lineData[29] = 0;
  _$jscoverage['/element-path.js'].lineData[32] = 0;
  _$jscoverage['/element-path.js'].lineData[35] = 0;
  _$jscoverage['/element-path.js'].lineData[44] = 0;
  _$jscoverage['/element-path.js'].lineData[45] = 0;
  _$jscoverage['/element-path.js'].lineData[47] = 0;
  _$jscoverage['/element-path.js'].lineData[49] = 0;
  _$jscoverage['/element-path.js'].lineData[50] = 0;
  _$jscoverage['/element-path.js'].lineData[52] = 0;
  _$jscoverage['/element-path.js'].lineData[60] = 0;
  _$jscoverage['/element-path.js'].lineData[62] = 0;
  _$jscoverage['/element-path.js'].lineData[63] = 0;
  _$jscoverage['/element-path.js'].lineData[64] = 0;
  _$jscoverage['/element-path.js'].lineData[65] = 0;
  _$jscoverage['/element-path.js'].lineData[66] = 0;
  _$jscoverage['/element-path.js'].lineData[67] = 0;
  _$jscoverage['/element-path.js'].lineData[71] = 0;
  _$jscoverage['/element-path.js'].lineData[75] = 0;
  _$jscoverage['/element-path.js'].lineData[79] = 0;
  _$jscoverage['/element-path.js'].lineData[83] = 0;
  _$jscoverage['/element-path.js'].lineData[85] = 0;
  _$jscoverage['/element-path.js'].lineData[88] = 0;
  _$jscoverage['/element-path.js'].lineData[89] = 0;
  _$jscoverage['/element-path.js'].lineData[94] = 0;
}
if (! _$jscoverage['/element-path.js'].functionData) {
  _$jscoverage['/element-path.js'].functionData = [];
  _$jscoverage['/element-path.js'].functionData[0] = 0;
  _$jscoverage['/element-path.js'].functionData[1] = 0;
  _$jscoverage['/element-path.js'].functionData[2] = 0;
  _$jscoverage['/element-path.js'].functionData[3] = 0;
  _$jscoverage['/element-path.js'].functionData[4] = 0;
  _$jscoverage['/element-path.js'].functionData[5] = 0;
  _$jscoverage['/element-path.js'].functionData[6] = 0;
  _$jscoverage['/element-path.js'].functionData[7] = 0;
  _$jscoverage['/element-path.js'].functionData[8] = 0;
  _$jscoverage['/element-path.js'].functionData[9] = 0;
  _$jscoverage['/element-path.js'].functionData[10] = 0;
  _$jscoverage['/element-path.js'].functionData[11] = 0;
  _$jscoverage['/element-path.js'].functionData[12] = 0;
}
if (! _$jscoverage['/element-path.js'].branchData) {
  _$jscoverage['/element-path.js'].branchData = {};
  _$jscoverage['/element-path.js'].branchData['44'] = [];
  _$jscoverage['/element-path.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/element-path.js'].branchData['49'] = [];
  _$jscoverage['/element-path.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/element-path.js'].branchData['52'] = [];
  _$jscoverage['/element-path.js'].branchData['52'][1] = new BranchData();
}
_$jscoverage['/element-path.js'].branchData['52'][1].init(102, 59, 'element.attr(\'_ke_real_element_type\') || element.nodeName()');
function visit3_52_1(result) {
  _$jscoverage['/element-path.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/element-path.js'].branchData['49'][1].init(554, 19, 'i < elements.length');
function visit2_49_1(result) {
  _$jscoverage['/element-path.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/element-path.js'].branchData['44'][1].init(370, 16, 'i < cache.length');
function visit1_44_1(result) {
  _$jscoverage['/element-path.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/element-path.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/element-path.js'].functionData[0]++;
  _$jscoverage['/element-path.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/element-path.js'].lineData[8]++;
  var Node = S.Node;
  _$jscoverage['/element-path.js'].lineData[9]++;
  var CLASS = 'editor-element-path';
  _$jscoverage['/element-path.js'].lineData[11]++;
  function ElementPaths(cfg) {
    _$jscoverage['/element-path.js'].functionData[1]++;
    _$jscoverage['/element-path.js'].lineData[12]++;
    var self = this;
    _$jscoverage['/element-path.js'].lineData[13]++;
    self.cfg = cfg;
    _$jscoverage['/element-path.js'].lineData[14]++;
    self._cache = [];
    _$jscoverage['/element-path.js'].lineData[15]++;
    self._init();
  }
  _$jscoverage['/element-path.js'].lineData[18]++;
  S.augment(ElementPaths, {
  _init: function() {
  _$jscoverage['/element-path.js'].functionData[2]++;
  _$jscoverage['/element-path.js'].lineData[20]++;
  var self = this, cfg = self.cfg, editor = cfg.editor;
  _$jscoverage['/element-path.js'].lineData[23]++;
  self.holder = new Node('<span>');
  _$jscoverage['/element-path.js'].lineData[24]++;
  self.holder.appendTo(editor.get('statusBarEl'), undefined);
  _$jscoverage['/element-path.js'].lineData[25]++;
  editor.on('selectionChange', self._selectionChange, self);
  _$jscoverage['/element-path.js'].lineData[26]++;
  Editor.Utils.sourceDisable(editor, self);
}, 
  disable: function() {
  _$jscoverage['/element-path.js'].functionData[3]++;
  _$jscoverage['/element-path.js'].lineData[29]++;
  this.holder.css('visibility', 'hidden');
}, 
  enable: function() {
  _$jscoverage['/element-path.js'].functionData[4]++;
  _$jscoverage['/element-path.js'].lineData[32]++;
  this.holder.css('visibility', '');
}, 
  _selectionChange: function(ev) {
  _$jscoverage['/element-path.js'].functionData[5]++;
  _$jscoverage['/element-path.js'].lineData[35]++;
  var self = this, cfg = self.cfg, editor = cfg.editor, prefixCls = editor.get('prefixCls'), statusDom = self.holder, elementPath = ev.path, elements = elementPath.elements, element, i, cache = self._cache;
  _$jscoverage['/element-path.js'].lineData[44]++;
  for (i = 0; visit1_44_1(i < cache.length); i++) {
    _$jscoverage['/element-path.js'].lineData[45]++;
    cache[i].remove();
  }
  _$jscoverage['/element-path.js'].lineData[47]++;
  self._cache = [];
  _$jscoverage['/element-path.js'].lineData[49]++;
  for (i = 0; visit2_49_1(i < elements.length); i++) {
    _$jscoverage['/element-path.js'].lineData[50]++;
    element = elements[i];
    _$jscoverage['/element-path.js'].lineData[52]++;
    var type = visit3_52_1(element.attr('_ke_real_element_type') || element.nodeName()), a = new Node('<a ' + 'href="javascript(\'' + type + '\')" ' + 'class="' + prefixCls + CLASS + '">' + type + '</a>');
    _$jscoverage['/element-path.js'].lineData[60]++;
    self._cache.push(a);
    _$jscoverage['/element-path.js'].lineData[62]++;
    (function(element) {
  _$jscoverage['/element-path.js'].functionData[6]++;
  _$jscoverage['/element-path.js'].lineData[63]++;
  a.on('click', function(ev2) {
  _$jscoverage['/element-path.js'].functionData[7]++;
  _$jscoverage['/element-path.js'].lineData[64]++;
  ev2.halt();
  _$jscoverage['/element-path.js'].lineData[65]++;
  editor.focus();
  _$jscoverage['/element-path.js'].lineData[66]++;
  setTimeout(function() {
  _$jscoverage['/element-path.js'].functionData[8]++;
  _$jscoverage['/element-path.js'].lineData[67]++;
  editor.getSelection().selectElement(element);
}, 50);
});
})(element);
    _$jscoverage['/element-path.js'].lineData[71]++;
    statusDom.prepend(a);
  }
}, 
  destroy: function() {
  _$jscoverage['/element-path.js'].functionData[9]++;
  _$jscoverage['/element-path.js'].lineData[75]++;
  this.holder.remove();
}});
  _$jscoverage['/element-path.js'].lineData[79]++;
  function ElementPathPlugin() {
    _$jscoverage['/element-path.js'].functionData[10]++;
  }
  _$jscoverage['/element-path.js'].lineData[83]++;
  S.augment(ElementPathPlugin, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/element-path.js'].functionData[11]++;
  _$jscoverage['/element-path.js'].lineData[85]++;
  var elemPath = new ElementPaths({
  editor: editor});
  _$jscoverage['/element-path.js'].lineData[88]++;
  editor.on('destroy', function() {
  _$jscoverage['/element-path.js'].functionData[12]++;
  _$jscoverage['/element-path.js'].lineData[89]++;
  elemPath.destroy();
});
}});
  _$jscoverage['/element-path.js'].lineData[94]++;
  return ElementPathPlugin;
});
