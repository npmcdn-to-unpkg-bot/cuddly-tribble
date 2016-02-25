System.register([], function(exports_1) {
    "use strict";
    var SET_VISIBILITY_FILTER, visibilityFilter;
    return {
        setters:[],
        execute: function() {
            exports_1("SET_VISIBILITY_FILTER", SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER');
            exports_1("visibilityFilter", visibilityFilter = function (state, action) {
                if (state === void 0) { state = 'SHOW_ALL'; }
                switch (action.type) {
                    case SET_VISIBILITY_FILTER:
                        return action.payload;
                    default:
                        return state;
                }
            });
        }
    }
});
//# sourceMappingURL=visibility-filter.js.map