System.register(['./games.actions', './visibility-filter.actions'], function(exports_1) {
    "use strict";
    var games_actions_1, visibility_filter_actions_1;
    var APP_ACTIONS;
    return {
        setters:[
            function (games_actions_1_1) {
                games_actions_1 = games_actions_1_1;
            },
            function (visibility_filter_actions_1_1) {
                visibility_filter_actions_1 = visibility_filter_actions_1_1;
            }],
        execute: function() {
            exports_1("APP_ACTIONS", APP_ACTIONS = [
                games_actions_1.GamesActions,
                visibility_filter_actions_1.VisibilityFilterActions
            ]);
        }
    }
});
//# sourceMappingURL=actions.js.map