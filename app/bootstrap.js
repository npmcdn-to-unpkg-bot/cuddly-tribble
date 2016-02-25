System.register(['angular2/platform/browser', 'angular2/platform/common_dom', './game-app', "@ngrx/store", "./reducers/reducers", "./actions/actions"], function(exports_1) {
    "use strict";
    var browser_1, common_dom_1, game_app_1, store_1, reducers_1, actions_1;
    function main() {
        return browser_1.bootstrap(game_app_1.GameApp, [
            common_dom_1.ELEMENT_PROBE_PROVIDERS,
            actions_1.APP_ACTIONS,
            store_1.provideStore(reducers_1.APP_REDUCERS)
        ])
            .catch(function (err) { return console.error(err); });
    }
    exports_1("main", main);
    return {
        setters:[
            function (browser_1_1) {
                browser_1 = browser_1_1;
            },
            function (common_dom_1_1) {
                common_dom_1 = common_dom_1_1;
            },
            function (game_app_1_1) {
                game_app_1 = game_app_1_1;
            },
            function (store_1_1) {
                store_1 = store_1_1;
            },
            function (reducers_1_1) {
                reducers_1 = reducers_1_1;
            },
            function (actions_1_1) {
                actions_1 = actions_1_1;
            }],
        execute: function() {
            document.addEventListener('DOMContentLoaded', main);
        }
    }
});
//# sourceMappingURL=bootstrap.js.map