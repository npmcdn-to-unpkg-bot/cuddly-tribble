System.register([], function(exports_1) {
    "use strict";
    var ADD_GAME, TOGGLE_GAME, game, games;
    return {
        setters:[],
        execute: function() {
            ;
            exports_1("ADD_GAME", ADD_GAME = 'ADD_GAME');
            exports_1("TOGGLE_GAME", TOGGLE_GAME = 'TOGGLE_GAME');
            game = function (state, action) {
                switch (action.type) {
                    case ADD_GAME:
                        return {
                            id: action.payload.id,
                            playerName: action.payload.playerName,
                            tiles: action.payload.tiles,
                            matchedPairs: action.payload.matchedPairs,
                            turnsTaken: action.payload.turnsTaken,
                            dateCreated: Date.now(),
                            completed: action.payload.completed
                        };
                    case TOGGLE_GAME:
                        if (state.id !== action.payload.id) {
                            return state;
                        }
                        return Object.assign({}, state, {
                            completed: !state.completed
                        });
                    default:
                        return state;
                }
            };
            exports_1("games", games = function (state, action) {
                if (state === void 0) { state = []; }
                switch (action.type) {
                    case ADD_GAME:
                        return state.concat([
                            game(undefined, action)
                        ]);
                    case TOGGLE_GAME:
                        return state.map(function (t) { return game(t, action); });
                    default:
                        return state;
                }
            });
        }
    }
});
//# sourceMappingURL=games.js.map