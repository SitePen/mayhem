var fs = require("fs");
var Module = require("module");

var moduleStack = [];
var defaultCompile = module.constructor.prototype._compile;

module.constructor.prototype._compile = function(content, filename){  
    moduleStack.push(this);
    try {        
        return defaultCompile.call(this, content, filename);
    }
    finally {
        moduleStack.pop();
    }
};

function resolveModulePath(mid, module) {
	// rewrite any mayhem module paths
	mid = mid.replace(/^mayhem\//, './');
    return Module._resolveFilename(mid, module);
}

function toAbsMid(id) {
    return id;
}

global.define = function (id, injects, factory) {

    // infere the module
    var currentModule = moduleStack[moduleStack.length-1];
    var mod = currentModule || module.parent || require.main;
    
    // parse arguments
    if (!factory) {
        // two or less arguments
        factory = injects;
        if (factory) {
            // two args
            if (typeof id === "string") {
                if (id !== mod.id) {
                    throw new Error("Can not assign module to a different id than the current file");
                }
                // default injects
                injects = [];
            }
            else{
                // anonymous, deps included
                injects = id;          
            }
        }
        else {
            // only one arg, just the factory
            factory = id;
            injects = [];
        }
    }

    var req = function(module, relativeId, callback) {
        if (Array.isArray(relativeId)) {
            // async require
            return callback.apply(this, relativeId.map(req))
        }
        
        var chunks = relativeId.split("!");
        if (chunks.length >= 2) {
            var plugin = require(resolveModulePath(chunks[0], module));
            var relativeId = chunks.slice(1).join("!");
            if (plugin.normalize) {
                relativeId = plugin.normalize(relativeId, toAbsMid);
            }
            if (!relativeId) {
                return;
            }
            if (plugin.load) {
                plugin.load(resolveModulePath(relativeId, module), req, function (result) {
                    plugin = result;
                });
                return plugin;
            }
        }
        else {
            return require(resolveModulePath(relativeId, module));
        }
    }.bind(this, mod);
    req.toAbsMid = toAbsMid;
    req.getText = function (url, sync, load) {
        load(fs.readFileSync(url, { encoding: 'utf8' }));
    };
    req.toUrl = toAbsMid;

    // injects.unshift("require", "exports", "module");
    
    id = mod.id;
    if (typeof factory !== "function") {
        // we can just provide a plain object
        return mod.exports = factory;
    }
    
    var returned = factory.apply(mod.exports, injects.map(function (injection) {
        switch (injection) {
            // check for CommonJS injection variables
            case "require": return req;
            case "exports": return mod.exports;
            case "module": return mod;
            default:
                // a module dependency
                return req(injection);
        }
    }));
    
    if (returned) {
        // since AMD encapsulates a function/callback, it can allow the factory to return the exports.
        mod.exports = returned;
    }
};
