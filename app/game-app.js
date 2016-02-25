System.register(['angular2/core', "./components/game-list", "./components/games-viewmodel", "./actions/visibility-filter.actions", "./actions/games.actions"], function(exports_1) {
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
    var core_1, game_list_1, games_viewmodel_1, visibility_filter_actions_1, games_actions_1;
    var GameApp;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (game_list_1_1) {
                game_list_1 = game_list_1_1;
            },
            function (games_viewmodel_1_1) {
                games_viewmodel_1 = games_viewmodel_1_1;
            },
            function (visibility_filter_actions_1_1) {
                visibility_filter_actions_1 = visibility_filter_actions_1_1;
            },
            function (games_actions_1_1) {
                games_actions_1 = games_actions_1_1;
            }],
        execute: function() {
            GameApp = (function () {
                function GameApp(gamesVm, gamesActions, visibilityFilterActions) {
                    var _this = this;
                    this.gamesVm = gamesVm;
                    this.gamesActions = gamesActions;
                    this.visibilityFilterActions = visibilityFilterActions;
                    this.gamesVm.viewModel$.subscribe(function (vm) { return _this.viewModel = vm; });
                }
                GameApp = __decorate([
                    core_1.Component({
                        selector: 'game-app',
                        templateUrl: './app/app.html',
                        directives: [game_list_1.GameList],
                        providers: [games_viewmodel_1.GamesViewModel]
                    }), 
                    __metadata('design:paramtypes', [(typeof (_a = typeof games_viewmodel_1.GamesViewModel !== 'undefined' && games_viewmodel_1.GamesViewModel) === 'function' && _a) || Object, (typeof (_b = typeof games_actions_1.GamesActions !== 'undefined' && games_actions_1.GamesActions) === 'function' && _b) || Object, (typeof (_c = typeof visibility_filter_actions_1.VisibilityFilterActions !== 'undefined' && visibility_filter_actions_1.VisibilityFilterActions) === 'function' && _c) || Object])
                ], GameApp);
                return GameApp;
                var _a, _b, _c;
            }());
            exports_1("GameApp", GameApp);
        }
    }
});
//# sourceMappingURL=game-app.js.map