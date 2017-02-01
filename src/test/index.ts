import test from 'ava';
import HandlerBuilder, { handler, defaultHandler } from '../lib';


test('build', (t) => {
  class Test {
    @handler('ADD_TODO')
    addTodo(state, action) {
      return [...state, {what: action.what, done: action.done}];
    }
  }

  let target = new Test();
  let builder = new HandlerBuilder<string>((state, action) => action.type);
  let fn = builder.build(target);

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
  class Test {
    @handler('ADD_TODO')
    addTodo(state, action) {
      return null;
    }

    @defaultHandler
    default(state, action) {
      return state + '!';
    }
  }

  let target = new Test();
  let builder = new HandlerBuilder<string>((state, action) => action.type);
  let fn = builder.build(target);

  t.is(fn('test', {type: 'foo'}), 'test!');
});


test('default value', (t) => {
  class Test {
    @handler('ADD_TODO')
    addTodo(state, action) {
      return null;
    }
  }

  let target = new Test();
  let builder = new HandlerBuilder<string>((state, action) => action.type, 'the default');
  let fn = builder.build(target);

  t.is(fn('test', {type: 'foo'}), 'the default');
});


test('default function', (t) => {
  class Test {
    @handler('ADD_TODO')
    addTodo(state, action) {
      return null;
    }
  }

  let target = new Test();
  let builder = new HandlerBuilder<string>((state, action) => action.type, (state, action) => state + '!');
  let fn = builder.build(target);

  t.is(fn('test', {type: 'foo'}), 'test!');
});


test('no default', (t) => {
  class Test {
    @handler('ADD_TODO')
    addTodo(state, action) {
      return null;
    }
  }

  let target = new Test();
  let builder = new HandlerBuilder<string>((state, action) => action.type);
  let fn = builder.build(target);

  t.throws(() => fn('test', {type: 'foo'}), 'no matching handler or default value available for foo');
});
