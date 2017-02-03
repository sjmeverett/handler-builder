import test from 'ava';
import HandlerBuilder, { defaultHandlerSymbol } from '../lib';


test('build', (t) => {
  let builder = new HandlerBuilder<string>((state, action) => action.type);

  let fn = builder.build({
    ADD_TODO(state, action) {
      return [...state, {what: action.what, done: action.done}];
    }
  });

  let state = fn([], {
    type: 'ADD_TODO',
    what: 'learn Portuguese',
    done: false
  });

  t.deepEqual(state, [{
    what: 'learn Portuguese',
    done: false
  }]);
});


test('default handler', (t) => {
  let builder = new HandlerBuilder<string>((state, action) => action.type);

  let fn = builder.build({
    ADD_TODO(state, action) {
      return null;
    },

    [defaultHandlerSymbol](state, action) {
      return state + '!';
    }
  });

  t.is(fn('test', {type: 'foo'}), 'test!');
});


test('default value', (t) => {
  let builder = new HandlerBuilder<string>((state, action) => action.type, 'the default');

  let fn = builder.build({
    ADD_TODO(state, action) {
      return null;
    }
  });

  t.is(fn('test', {type: 'foo'}), 'the default');
});


test('default function', (t) => {
  let builder = new HandlerBuilder<string>((state, action) => action.type, (state, action) => state + '!');

  let fn = builder.build({
    ADD_TODO(state, action) {
      return null;
    }
  });

  t.is(fn('test', {type: 'foo'}), 'test!');
});


test('no default', (t) => {
  let builder = new HandlerBuilder<string>((state, action) => action.type);

  let fn = builder.build({
    ADD_TODO(state, action) {
      return null;
    }
  });

  t.throws(() => fn('test', {type: 'foo'}), 'no matching handler or default value available for foo');
});
