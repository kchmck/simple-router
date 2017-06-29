import pathToRegexp from "path-to-regexp";

export default function createRouter() {
    let routes = [];
    let common = [];

    function add(list, path, fn) {
        list.push([pathToRegexp(path), fn]);
        return this;
    }

    function* lookup(list, loc) {
        for (let [re, fn] of list) {
            let ret = re.exec(loc.pathname);

            if (ret === null) {
                continue;
            }

            let [_, ...params] = ret;
            yield fn(...params, loc);
        }
    }

    function handlePath(loc) {
        for (let _ of lookup(common, loc)) {}

        lookup(routes, loc).next();
    }

    return {
        addRoute: (path, fn) => add(routes, path, fn),
        addCommon: (path, fn) => add(common, path, fn),
        handlePath,
    };
}
