import {Injectable} from 'angular2/core';
import {Store, Action} from '@ngrx/store';
import {IGame, ADD_GAME, TOGGLE_GAME} from '../reducers/games';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/Rx';

@Injectable()
export class GamesActions {
 private actions$: BehaviorSubject<Action> = new BehaviorSubject({type: null, payload: null});
}
