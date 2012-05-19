var nodes = require('../nodes'),
    NodeList = nodes.NodeList,
    Node = nodes.Node;

var IncludeNode = function(templatevar, withs, loader) {
    this.templatevar = templatevar;
	this.withs = withs;
    this.loader = loader;
};
IncludeNode.prototype = new Node;
IncludeNode.prototype.render = function(context, callback) {
    var self = this,
        platelib = require('..');
	
	for (var i in self.withs) {
		var withvar = self.withs[i];
		var param = withvar(context, function(err, data) {
			if(err) {
				callback(err, null);
			} else {
				context[i] = data;
			}
		});
	}

    self.templatevar(context, function(err, tpl) {
		if (err) {
			callback(err);
			return;
		}
        var fn = tpl instanceof platelib.Template ? 
            function(tpl, callback) { callback(null, tpl); } :
            self.loader;

        fn(tpl, function(err, template) {
            template.render(context, callback);
        });
    });
};

IncludeNode.parse = function(contents, parser) {
    var bits = contents.split(/\s+/g),
        templatevar = parser.compileFilter(bits[1]),
        loader;

	var withs = {};
	var i = bits.indexOf('with');
	if (i >= 0) {
		for (++i ; i < bits.length; ++i) {
			var p = bits[i].split(/=/);
			if (p.length <= 1) {
				continue;
			}
			withs[p[0]] = parser.compileFilter(p[1]);
		}
	}

    try {
        loader = parser.pluginLibrary.lookup('loader');
    } catch(err){}

    return new IncludeNode(templatevar, withs, loader);
};

exports.IncludeNode = IncludeNode;
