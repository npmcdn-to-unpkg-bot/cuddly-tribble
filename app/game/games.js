System.register(['immutable', 'angular2/core'], function(exports_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var immutable_1, core_1;
    var UPDATE_GAME, DELETE_GAME, ADD_GAME, GameRecord, Games;
    return {
        setters:[
            function (immutable_1_1) {
                immutable_1 = immutable_1_1;
            },
            function (core_1_1) {
                core_1 = core_1_1;
            }],
        execute: function() {
            UPDATE_GAME = 'UPDATE_GAME';
            DELETE_GAME = 'DELETE_GAME';
            ADD_GAME = 'ADD_GAME';
            ;
            ;
            exports_1("GameRecord", GameRecord = immutable_1.Record({
                id: null,
                playerName: null,
                tiles: null,
                matchedPairs: null,
                turnsTaken: null,
                dateCreated: null,
                completed: false
            }));
            Games = (function () {
                function Games() {
                }
                Games = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [])
                ], Games);
                return Games;
            }());
            exports_1("Games", Games);
        }
    }
});
//# sourceMappingURL=games.js.map