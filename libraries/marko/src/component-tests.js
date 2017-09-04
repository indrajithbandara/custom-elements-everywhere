/**
 * @license
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import runTests from './run-tests';
import NoChildren from './components/no-children';
import ShadowAndLightDOM from './components/shadow-and-light-dom';
import UpdateLightDOM from './components/update-light-dom';
import DifferentViews from './components/different-views';
import AttributesAndProperties from './components/attributes-and-properties';
import UnregisteredProperties from './components/unregistered-properties';
import ImperativeEvents from './components/imperative-events';
import DeclarativeEvents from './components/declarative-events';

runTests({
  // Map of the required components for testing
  components: {
    NoChildren,
    ShadowAndLightDOM,
    UpdateLightDOM,
    DifferentViews,
    AttributesAndProperties,
    UnregisteredProperties,
    ImperativeEvents,
    DeclarativeEvents
  },

  // Mount Component to rootEl and return the component instance
  // This component instance is not used directly by runTest
  // but is passed to triggerAction and ensureDOMUpdated
  mountAndGetComponent: (Component, rootEl) => Component.renderSync().appendTo(rootEl),

  // Call a method on component to trigger a specific update
  triggerAction: (component, action) => component.getComponent()[action](),

  // Ensure the component's DOM is up to date
  // and any queued updates have completed.
  // May return a promise.
  ensureDOMUpdated: (component) => component.getComponent().update()
});

/*

// Setup the test harness. This will get cleaned out with every test.
let root = document.createElement('div');
let mount = (c) => c.renderSync().appendTo(root).getComponent();
document.body.appendChild(root);

afterEach(function() {
  root.innerHTML = '';
});

describe('no children', function() {
  it('can display a Custom Element with no children', function() {
    let component = mount(withoutChildren);
    let wc = component.getEl('wc');
    expect(wc).toExist();
  });
});

describe('with children', function() {
  function expectHasChildren(wc) {
    expect(wc).toExist();
    let shadowRoot = wc.shadowRoot;
    let heading = shadowRoot.querySelector('h1');
    expect(heading).toExist();
    expect(heading.textContent).toEqual('Test h1');
    let paragraph = shadowRoot.querySelector('p');
    expect(paragraph).toExist();
    expect(paragraph.textContent).toEqual('Test p');
  }

  it('can display a Custom Element with children in a Shadow Root', function() {
    let component = mount(withChildren);
    let wc = component.getEl('wc');
    expectHasChildren(wc);
  });

  it('can display a Custom Element with children in a Shadow Root and pass in Light DOM children', async function() {
    let component = mount(withChildrenRerender);
    let wc = component.getEl('wc');
    expectHasChildren(wc);
    expect(wc.textContent).toInclude('START');
    component.UPDATE();
    component.update();
    expectHasChildren(wc);
    expect(wc.textContent).toInclude('FINISH');
  });

  it('can display a Custom Element with children in the Shadow DOM and handle hiding and showing the element', function() {
    let component = mount(withDifferentViews);
    let wc = component.getEl('wc');
    expectHasChildren(wc);
    component.toggle();
    component.update();
    let dummy = component.getEl('dummy');
    expect(dummy).toExist();
    expect(dummy.textContent).toEqual('Dummy view');
    component.toggle();
    component.update();
    wc = component.getEl('wc');
    expectHasChildren(wc);
  });
});

describe('attributes and properties', function() {
  it('will pass boolean data as either an attribute or a property', function() {
    let component = mount(withProperties);
    let wc = component.getEl('wc');
    let data = wc.bool || wc.hasAttribute('bool');
    expect(data).toBe(true);
  });

  it('will pass numeric data as either an attribute or a property', function() {
    let component = mount(withProperties);
    let wc = component.getEl('wc');
    let data = wc.num || wc.getAttribute('num');
    expect(data).toEqual(42);
  });

  it('will pass string data as either an attribute or a property', function() {
    let component = mount(withProperties);
    let wc = component.getEl('wc');
    let data = wc.str || wc.getAttribute('str');
    expect(data).toEqual('Marko');
  });

  it('will pass array data as a property', function() {
    let component = mount(withProperties);
    let wc = component.getEl('wc');
    let data = wc.arr;
    expect(data).toEqual(['M', 'a', 'r', 'k', 'o']);
  });

  it('will pass object data as a property', function() {
    let component = mount(withProperties);
    let wc = component.getEl('wc');
    let data = wc.obj;
    expect(data).toEqual({ org: 'marko-js', repo: 'marko' });
  });

  it('will set boolean attributes on a Custom Element that has not already been defined and upgraded', function() {
    let component = mount(withUnregistered);
    let wc = component.getEl('wc');
    expect(wc.hasAttribute('bool')).toBe(true);
  });

  it('will set numeric attributes on a Custom Element that has not already been defined and upgraded', function() {
    let component = mount(withUnregistered);
    let wc = component.getEl('wc');
    expect(wc.getAttribute('num')).toEqual('42');
  });

  it('will set string attributes on a Custom Element that has not already been defined and upgraded', function() {
    let component = mount(withUnregistered);
    let wc = component.getEl('wc');
    expect(wc.getAttribute('str')).toEqual('Marko');
  });

  it('will set array properties on a Custom Element that has not already been defined and upgraded', function() {
    let component = mount(withUnregistered);
    let wc = component.getEl('wc');
    expect(wc.arr).toEqual(['M', 'a', 'r', 'k', 'o']);
  });

  it('will set object properties on a Custom Element that has not already been defined and upgraded', function() {
    let component = mount(withUnregistered);
    let wc = component.getEl('wc');
    expect(wc.obj).toEqual({ org: 'marko-js', repo: 'marko' });
  });
});

describe('events', function() {
  it('can imperatively listen to a DOM event dispatched by a Custom Element', function() {
    let component = mount(withImperativeEvent);
    let wc = component.getEl('wc');
    expect(wc).toExist();
    let handled = component.getEl('handled');
    expect(handled.textContent).toEqual('false');
    wc.click();
    component.update();
    expect(handled.textContent).toEqual('true');
  });

  it('can declaratively listen to a lowercase DOM event dispatched by a Custom Element', function() {
    let component = mount(withDeclarativeEvent);
    let wc = component.getEl('wc');
    expect(wc).toExist();
    let handled = component.getEl('lowercase');
    expect(handled.textContent).toEqual('false');
    wc.click();
    component.update();
    expect(handled.textContent).toEqual('true');
  });

  it('can declaratively listen to a kebab-case DOM event dispatched by a Custom Element', function() {
    let component = mount(withDeclarativeEvent);
    let wc = component.getEl('wc');
    let handled = component.getEl('kebab');
    expect(handled.textContent).toEqual('false');
    wc.click();
    component.update();
    expect(handled.textContent).toEqual('true');
  });

  it('can declaratively listen to a camelCase DOM event dispatched by a Custom Element', function() {
    let component = mount(withDeclarativeEvent);
    let wc = component.getEl('wc');
    let handled = component.getEl('camel');
    expect(handled.textContent).toEqual('false');
    wc.click();
    component.update();
    expect(handled.textContent).toEqual('true');
  });

  it('can declaratively listen to a CAPScase DOM event dispatched by a Custom Element', function() {
    let component = mount(withDeclarativeEvent);
    let wc = component.getEl('wc');
    let handled = component.getEl('caps');
    expect(handled.textContent).toEqual('false');
    wc.click();
    component.update();
    expect(handled.textContent).toEqual('true');
  });

  it('can declaratively listen to a PascalCase DOM event dispatched by a Custom Element', function() {
    let component = mount(withDeclarativeEvent);
    let wc = component.getEl('wc');
    let handled = component.getEl('pascal');
    expect(handled.textContent).toEqual('false');
    wc.click();
    component.update();
    expect(handled.textContent).toEqual('true');
  });
});
*/