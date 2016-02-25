System.register(['./games', './visibility-filter'], function(exports_1) {
    "use strict";
    var games_1, visibility_filter_1;
    var APP_REDUCERS;
    return {
        setters:[
            function (games_1_1) {
                games_1 = games_1_1;
            },
            function (visibility_filter_1_1) {
                visibility_filter_1 = visibility_filter_1_1;
            }],
        execute: function() {
            exports_1("APP_REDUCERS", APP_REDUCERS = {
                games: games_1.games,
                visibilityFilter: visibility_filter_1.visibilityFilter
            });
        }
    }
});
//# sourceMappingURL=reducers.js.map