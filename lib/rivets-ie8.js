(function(watch, unwatch){
createWatcher = watch && unwatch ?
    // Andrea Giammarchi - Mit Style License
    function(Object){
        var handlers = [];
        return {
            destroy:function(){
                handlers.forEach(function(prop){
                    unwatch.call(this, prop);
                }, this);
                delete handlers;
            },
            watch:function(prop, handler){
                if(-1 === handlers.indexOf(prop))
                    handlers.push(prop);
                watch.call(this, prop, function(prop, prevValue, newValue){
                    return Object[prop] = handler.call(Object, prop, prevValue, newValue);
                });
            },
            unwatch:function(prop){
                var i = handlers.indexOf(prop);
                if(-1 !== i){
                    unwatch.call(this, prop);
                    handlers.splice(i, 1);
                };
            }
        }
    }:(Object.prototype.__defineSetter__?
    function(Object){
        var handlers = [];
        return {
            destroy:function(){
                handlers.forEach(function(prop){
                    delete this[prop];
                }, this);
                delete handlers;
            },
            watch:function(prop, handler){
                if(-1 === handlers.indexOf(prop))
                    handlers.push(prop);
                if(!this.__lookupGetter__(prop))
                    this.__defineGetter__(prop, function(){return Object[prop]});
                this.__defineSetter__(prop, function(newValue){
                    Object[prop] = handler.call(Object, prop, Object[prop], newValue);
                });
            },
            unwatch:function(prop){
                var i = handlers.indexOf(prop);
                if(-1 !== i){
                    delete this[prop];
                    handlers.splice(i, 1);
                };
            }
        };
    }:
    function(Object){
        function onpropertychange(){
            var prop = event.propertyName,
                newValue = empty[prop]
                prevValue = Object[prop],
                handler = handlers[prop];
            if(handler)
                attachEvent(detachEvent()[prop] = Object[prop] = handler.call(Object, prop, prevValue, newValue));
        };
        function attachEvent(){empty.attachEvent("onpropertychange", onpropertychange)};
        function detachEvent(){empty.detachEvent("onpropertychange", onpropertychange);return empty};
        var empty = document.createElement("empty"), handlers = {};
        empty.destroy = function(){
            detachEvent();
            empty.parentNode.removeChild(empty);
            empty = handlers = null;
        };
        empty.watch = function(prop, handler){handlers[prop] = handler};
        empty.unwatch = function(prop){delete handlers[prop]};
        attachEvent();
        return (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(empty);
    }
    )
;
})(Object.prototype.watch, Object.prototype.unwatch);

rivets.adapters['.'] = {
    subscribe: function(obj, keypath, callback) {
        obj.on('change:' + keypath, callback);
    },
    unsubscribe: function(obj, keypath, callback) {
        obj.off('change:' + keypath, callback);
    },
    // probably dont need to overwrite these two, but follows the docs.
    read: function(obj, keypath) {
        return obj.get(keypath);
    },
    publish: function(obj, keypath, value) {
        obj.set(keypath, value);
    }
};

// These could potentially mess with other stuff but hey, it works - kind of.
Object.prototype.on = function(event_name, callback){
    // Trigger listeners
    this.__events = (this.__events || {});
    this.__events[event_name] = (this.__events[event_name]||[]);
    this.__events[event_name].push(callback);
}
Object.prototype.off = function(event_name, callback){
    // Trigger listeners
    var evts = this.__events[event_name];
    for(var i=0;i<evts;i++){
        if( evts[i] === callback ){
            evts.splice(i,1);
        }
    }
}
Object.prototype.set = function(prop, value){
    // Assign the value
    this[prop] = value;
    // Trigger listeners
    var evts = this.__events["change:"+prop];
    for( var i=0; i<evts.length; i++){
        evts[i].call(this);
    }
}
Object.prototype.get = function(prop){
    return this[prop];
}
Object.prototype.push = function(prop, item){
    // Assign the value
    this[prop].push( item );
    // Trigger listeners
    var evts = this.__events["change:"+prop];
    for( var i=0; i<evts.length; i++){
        evts[i].call(this);
    }
}
// SHIMS a dependency of Rivets
if(!String.prototype.trim){
    String.prototype.trim = function(){
        return this.replace(/(^\s*|\s*$)/g,'');
    };
}
