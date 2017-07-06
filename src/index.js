import pathToRegexp from "path-to-regexp";

export default function createRouter() {
    let routes = [];
    let common = [];

    function add(list, path, fn) {
        list.push(new Route(path, fn));
    }

    function addRoute(path, fn) { add(routes, path, fn); return this; }
    function addCommon(path, fn) { add(common, path, fn); return this; }

    function handlePath(loc) {
        lookup(common, loc, () => true);
        lookup(routes, loc, () => false);
    }

    return {
        addRoute,
        addCommon,
        handlePath,
    };
}

function lookup(list, loc, continueFn) {
    list.every(route => route.handle(loc) === null || continueFn());
}

function Route(path, fn) {
    this.regex = pathToRegexp(path);
    this.fn = fn;
}

Route.prototype.handle = function(loc) {
    let params = this.regex.exec(loc.pathname);

    if (params === null) {
        return null;
    }

    params.shift();
    params.push(loc);

    return this.fn.apply(null, params);
};
