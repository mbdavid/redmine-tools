const routes = [];
const errors = [];
let running = false;

function start() {
    if (running === false) {
        running = true;
        window.addEventListener('hashchange', hashchange);
        hashchange();
    }
    else {
        hashchange();
    }
}

function redirect(url) {
    window.location.hash = url;
    if(running === false) setTimeout(start);
}

// route style: add('/view/:id', fn(ctx, next), fn2(ctx, next), ...)
function add(url) {

    // support for multi-url: add(['#/', '#/:user'], function() { ... })
    if (Array.isArray(url)) {
        const params = Array.prototype.slice.call(arguments).splice(1);
        url.forEach(function (u) {
            var arg = [u];
            params.forEach(function (item) { arg.push(item); });
            add.apply(this, arg);
        });
        return;
    }

    const args = Array.prototype.slice.call(arguments);

    if (args.length == 1) { // error route
        errors.push(args[0]);
        return;
    }

    // args can be an array ou params
    const route = {
        callbacks: Array.isArray(args[1]) ? args[1] : args.slice(1)
    };

    if (url instanceof RegExp) {
        route.regex = url;
        route.vars = [];
    }
    else if(url === '*') {
        route.all = true;
        route.regex = /.*/;
        route.vars = [];
    }
    else {

        if (url.match(/^#/) == null) throw 'Route must start with # or be only *';

        route.regex = new RegExp('^' +
                url.replace(/\/$/, '')
                    .replace(/:\w+\?/g, '?([^/]*)')
                    .replace(/:\w+/g, '([^/]+)') +
                '$', 'i');
        route.vars = url.match(/:\w+/g) || [];
    }

    routes.push(route);
}

function hashchange() {

    if (running == false) return;

    const hash = (window.location.hash || "#");

    const path = hash
        .replace(/\?.*$/, '')  // remove ? querystring
        .replace(/\/$/, '');   // remove last / slash

    const qstr = hash.replace(/^[^\?]*\??/, '');  // remove url, keep only query string without ?
    const segments = path.replace(/^#\/?/, '').replace(/\/$/, ''); // names between /
    const queue = [];
    let found = 0;

    // create context var - is the some across all matches and all callbacks
    const context = {
        url: hash,
        path: path,
        segments: segments ? segments.split('/') : [],
        queryString: qstr,
        query: parseQueryString(qstr)
    };

    for (let i in routes) { // routes

        const match = path.match(routes[i].regex);
        if (!match) continue;

        const route = routes[i];
        const params = {};

        // get params from route vars
        for (let j = 0; j < route.vars.length; j++) {
            const value = decodeURIComponent(path.replace(route.regex, '$' + (j + 1)));
            params[route.vars[j].substring(1)] = value;
        }

        // no vars? can be a url regex
        if (route.vars.length == 0) {
            for(let m in match) {
                if(m > 0) { 
                    params[m] = match[m];
                }
            }
        }
        
        // count if found a non-all route
        found += route.all ? 0 : 1;
                    
        // add all callbacks to a queue
        for(let cb in route.callbacks) {
            queue.push({ fn: route.callbacks[cb], params: params });
        }

    }

    if(found) {
        executeQueue(context, queue, 0);
    }
    else {
        executeErrorQueue(404, context, 0);
    }
}

// execute in queue all callbacks in all routes that url match
function executeQueue(context, queue, index) {

    if (index >= queue.length) return;

    const callback = queue[index];
    const next = function (err) {
        if(err !== undefined) {
            executeErrorQueue(err, context, 0);
        }
        else {
            executeQueue(context, queue, index + 1);
        }
    };
    
    context.params = queue.params;
    callback.fn(context, next);
}

// execute error function queue
function executeErrorQueue(err, context, index) {
    
    if(index >= errors.length) return;
    
    const fn = errors[index];
    const next = function() {
        executeErrorQueue(err, context, index + 1);
    };
    
    fn(err, context, next);
    
}

// parse a querystring to an object
function parseQueryString(str) {

    if (str.trim().length === 0) return {};

    const arr = str.split('&');
    const obj = {};

    for (var i = 0; i < arr.length; i++) {
        var bits = arr[i].split('=');
        obj[decodeURIComponent(bits[0])] = decodeURIComponent(bits[1].replace(/\+/g, ' '));
    }

    return obj;
}

// stop listen hashchange
function stop() {
    running = false;
}

// creating router function initializer
export default function () {
    // start/stop
    if (arguments.length == 0 || (arguments.length == 1 && arguments[0] === true)) return start();
    if (arguments.length == 1 && arguments[0] === false) return stop();
    // redirect
    if (arguments.length == 1 && typeof arguments[0] == 'string') return redirect(arguments[0]);
    // add new route
    add.apply(this, arguments);
};