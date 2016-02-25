import { Action, Reducer, Store } from '@ngrx/store';
import { List, Map, Record, fromJS } from 'immutable';
import { Injectable } from 'angular2/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';

const UPDATE_GAME = 'UPDATE_GAME';
const DELETE_GAME = 'DELETE_GAME';
const ADD_GAME = 'ADD_GAME';

export interface IGame {
  id: number;
  playerName: string;
  tiles: any;
  matchedPairs: number;
  turnsTaken: number;
  dateCreated: any;
  completed: boolean;
};

export interface IGames extends Map<String, any> {
  games: IGame[];
};

export const GameRecord = Record({
  id: null,
  playerName: null,
  tiles: null,
  matchedPairs: null,
  turnsTaken: null,
  dateCreated: null,
  completed: false
});

@Injectable()
export class Games {
  users$: Observable<Map<String, any>>;
}
