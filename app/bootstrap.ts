import 'zone.js/dist/zone.min.js';
import 'reflect-metadata';
import {bootstrap} from 'angular2/platform/browser';
import {App} from './app';
import {provideStore, createStore, combineReducers, Store} from '@ngrx/store';
import * as devtools from '@ngrx/devtools';
bootstrap(App);
