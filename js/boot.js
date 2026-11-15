import {personalPack} from './assets.js';
window.__PERSONAL_PACK = personalPack;
// The existing game entry retains its original lexical scope and initialization order.
await import('./game.js');
