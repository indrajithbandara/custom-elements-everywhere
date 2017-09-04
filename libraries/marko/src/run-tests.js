import expect from 'expect';

export default function runTests({ components, mountAndGetComponent, triggerAction, ensureDOMUpdated }) {
  if (!components) {
    throw new Error(
      'Missing option: components \n\
       Pass an object/map of the required components for testing.'
    );
  }

  if (!mountAndGetComponent) {
    throw new Error(
      'Missing option: mountAndGetComponent(Component, rootEl). \n\
       Pass a function that mounts `Component` to `rootEl` and returns the component instance.'
    );
  }

  if (!triggerAction) {
    throw new Error(
      'Missing option: triggerAction(component, action). \n\
       Pass a function that triggers the corresponding action on the \
       `component` instance returned from mountAndGetComponent.'
    );
  }

  if (!ensureDOMUpdated) {
    throw new Error(
      'Missing option: ensureDOMUpdated(). \n\
       Pass a function that ensures the DOM is up-to-date after calling. \
       This function may return a promise.  \
       If your library automatically and synchrously updates the DOM, \
       you may pass an empty/noop function.'
    );
  }

  // Setup the test harness. This will get cleaned out with every test.
  let app = document.createElement('div');
  app.id = 'app';
  document.body.appendChild(app);
  let rootEl; // This will hold the actual element under test.

  let mount = (Component) => {
    let component = mountAndGetComponent(Component, rootEl);
    return {
      trigger: triggerAction.bind(null, component),
      update: ensureDOMUpdated.bind(null, component),
      find: (selector) => rootEl.querySelector(selector),
    };
  }

  let getComponent = (componentName, example) => {
    let Component = components[componentName];

    if (!Component) {
      console.error(
        'Missing component: ' + componentName + '\n' + example
      );
    }

    return Component;
  }

  beforeEach(function() {
    rootEl = document.createElement('div');
    rootEl.id = 'rootEl';
    app.appendChild(rootEl);
  });

  afterEach(function() {
    app.innerHTML = '';
    rootEl = null;
  });

  describe('NoChildren', function() {
    let NoChildren = getComponent('NoChildren',`
      <ce-without-children></ce-without-children>
    `);

    let test = NoChildren ? it : it.skip;

    test('can display a Custom Element with no children', async function() {
      let component = mount(NoChildren);
      let wc = component.find('ce-without-children');
      expect(wc).toExist();
    });
  });

  describe('ShadowAndLightDOM', function() {
    let ShadowAndLightDOM = getComponent('ShadowAndLightDOM',`
      <ce-with-children>
        LIGHTDOM
      </ce-with-children>
    `);

    let test = ShadowAndLightDOM ? it : it.skip;

    /*test('can display a Custom Element with children in a Shadow Root', async function() {
      let component = mount(ShadowAndLightDOM);
      let wc = component.find('ce-with-children');
      expectHasChildren(wc);
    });*/

    test('can display a Custom Element with children in a Shadow Root and pass in Light DOM children', async function() {
      let component = mount(ShadowAndLightDOM);
      let wc = component.find('ce-with-children');
      expectHasChildren(wc);
      expect(wc.textContent).toInclude('LIGHTDOM');
    });
  });

  describe('UpdateLightDOM', function() {
    let UpdateLightDOM = getComponent('UpdateLightDOM',`
      let content = 'START';
      UPDATE() {
        content = 'FINISH';
      }

      <ce-with-children>
        {{content}}
      </ce-with-children>
    `);

    let test = UpdateLightDOM ? it : it.skip;

    test('can display a Custom Element with children in a Shadow Root and pass in Light DOM children', async function() {
      let component = mount(UpdateLightDOM);
      let wc = component.find('ce-with-children');
      expectHasChildren(wc);
      expect(wc.textContent).toInclude('START');
      component.trigger('UPDATE');
      await component.update();
      wc = component.find('ce-with-children');
      expectHasChildren(wc);
      expect(wc.textContent).toInclude('FINISH');
    });
  });

  describe('DifferentViews', function() {
    let DifferentViews = getComponent('DifferentViews',`
      let showCustomElement = true;
      TOGGLE() {
        showCustomElement = !showCustomElement;
      }
      {{if showCustomElement}}
        <ce-with-children/>
      {{else}}
        <div id="dummy">
          DUMMY
        </div>
      {{/if}}
    `);

    let test = DifferentViews ? it : it.skip;

    test('can display a Custom Element with children in the Shadow DOM and handle hiding and showing the element', async function() {
      let component = mount(DifferentViews);
      let wc = component.find('ce-with-children');
      expectHasChildren(wc);
      component.trigger('TOGGLE');
      await component.update();
      let dummy = component.find('#dummy');
      expect(dummy).toExist();
      expect(dummy.textContent).toEqual('Dummy view');
      component.trigger('TOGGLE');
      await component.update();
      wc = component.find('ce-with-children');
      expectHasChildren(wc);
    });
  })

  describe('AttributesAndProperties', function() {
    let AttributesAndProperties = getComponent('AttributesAndProperties',`
      <ce-with-properties
        bool=true
        num=42
        str="abc"
        arr=[1,2,3]
        obj={ key:'value' }
        ></ce-with-properties>
    `);

    let test = AttributesAndProperties ? it : it.skip;

    test('will pass boolean data as either an attribute or a property', async function() {
      let component = mount(AttributesAndProperties);
      let wc = component.find('ce-with-properties');
      let data = wc.bool || wc.hasAttribute('bool');
      expect(data).toBe(true);
    });

    test('will pass numeric data as either an attribute or a property', async function() {
      let component = mount(AttributesAndProperties);
      let wc = component.find('ce-with-properties');
      let data = wc.num || wc.getAttribute('num');
      expect(data).toEqual(42);
    });

    test('will pass string data as either an attribute or a property', async function() {
      let component = mount(AttributesAndProperties);
      let wc = component.find('ce-with-properties');
      let data = wc.str || wc.getAttribute('str');
      expect(data).toEqual('abc');
    });

    test('will pass array data as a property', async function() {
      let component = mount(AttributesAndProperties);
      let wc = component.find('ce-with-properties');
      let data = wc.arr;
      expect(data).toEqual([1,2,3]);
    });

    test('will pass object data as a property', async function() {
      let component = mount(AttributesAndProperties);
      let wc = component.find('ce-with-properties');
      let data = wc.obj;
      expect(data).toEqual({ key: 'value' });
    });
  });

  describe('UnregisteredProperties', function() {
    let UnregisteredProperties = getComponent('UnregisteredProperties',`
      <ce-unregistered
        bool=true
        num=42
        str="abc"
        arr=[1,2,3]
        obj={ key:'value' }
        ></ce-with-properties>
    `);

    let test = UnregisteredProperties ? it : it.skip;

    test('will set boolean attributes on a Custom Element that has not already been defined and upgraded', async function() {
      let component = mount(UnregisteredProperties);
      let wc = component.find('ce-unregistered');
      expect(wc.bool || wc.hasAttribute('bool')).toBe(true);
    });

    test('will set numeric attributes on a Custom Element that has not already been defined and upgraded', async function() {
      let component = mount(UnregisteredProperties);
      let wc = component.find('ce-unregistered');
      expect(wc.num || wc.getAttribute('num')).toEqual('42');
    });

    test('will set string attributes on a Custom Element that has not already been defined and upgraded', async function() {
      let component = mount(UnregisteredProperties);
      let wc = component.find('ce-unregistered');
      expect(wc.str || wc.getAttribute('str')).toEqual('abc');
    });

    test('will set array properties on a Custom Element that has not already been defined and upgraded', async function() {
      let component = mount(UnregisteredProperties);
      let wc = component.find('ce-unregistered');
      expect(wc.arr).toEqual([1,2,3]);
    });

    test('will set object properties on a Custom Element that has not already been defined and upgraded', async function() {
      let component = mount(UnregisteredProperties);
      let wc = component.find('ce-unregistered');
      expect(wc.obj).toEqual({ key: 'value' });
    });
  });

  describe('ImperativeEvents', function() {
    let ImperativeEvents = getComponent('ImperativeEvents',`
      <div id="handled">{{handled}}</div>
      <ce-unregistered></ce-with-properties>
      <script>
        document
          .querySelector('ce-unregistered')
          .addEventListener('camelEvent', () => handled = true);
      </script>
    `);

    let test = ImperativeEvents ? it : it.skip;

    test('can imperatively listen to a DOM event dispatched by a Custom Element', async function() {
      let component = mount(ImperativeEvents);
      let wc = component.find('ce-with-event');
      expect(wc).toExist();
      let handled = component.find('#handled');
      expect(handled.textContent).toEqual('false');
      wc.click();
      await component.update();
      expect(handled.textContent).toEqual('true');
    });
  });

  describe('DeclarativeEvents', function() {
    let DeclarativeEvents = getComponent('DeclarativeEvents',`
      <div id="lowercase">{{lowercaseHandled}}</div>
      <div id="kebab">{{kebabHandled}}</div>
      <div id="camel">{{camelHandled}}</div>
      <div id="caps">{{capsHandled}}</div>
      <div id="pascal">{{pascalHandled}}</div>
      <ce-unregistered
        on:lowerevent=(() => lowercaseHandled = true)
        on:kebab-event=(() => kebabHandled = true)
        on:camelEvent=(() => camelHandled = true)
        on:CAPSevent=(() => capsHandled = true)
        on:PascalEvent=(() => pascalHandled = true)
        ></ce-with-properties>
    `);

    let test = DeclarativeEvents ? it : it.skip;

    test('can declaratively listen to a lowercase DOM event dispatched by a Custom Element', async function() {
      let component = mount(DeclarativeEvents);
      let wc = component.find('ce-with-event');
      expect(wc).toExist();
      let handled = component.find('#lowercase');
      expect(handled.textContent).toEqual('false');
      wc.click();
      await component.update();
      expect(handled.textContent).toEqual('true');
    });

    test('can declaratively listen to a kebab-case DOM event dispatched by a Custom Element', async function() {
      let component = mount(DeclarativeEvents);
      let wc = component.find('ce-with-event');
      let handled = component.find('#kebab');
      expect(handled.textContent).toEqual('false');
      wc.click();
      await component.update();
      expect(handled.textContent).toEqual('true');
    });

    test('can declaratively listen to a camelCase DOM event dispatched by a Custom Element', async function() {
      let component = mount(DeclarativeEvents);
      let wc = component.find('ce-with-event');
      let handled = component.find('#camel');
      expect(handled.textContent).toEqual('false');
      wc.click();
      await component.update();
      expect(handled.textContent).toEqual('true');
    });

    test('can declaratively listen to a CAPScase DOM event dispatched by a Custom Element', async function() {
      let component = mount(DeclarativeEvents);
      let wc = component.find('ce-with-event');
      let handled = component.find('#caps');
      expect(handled.textContent).toEqual('false');
      wc.click();
      await component.update();
      expect(handled.textContent).toEqual('true');
    });

    test('can declaratively listen to a PascalCase DOM event dispatched by a Custom Element', async function() {
      let component = mount(DeclarativeEvents);
      let wc = component.find('ce-with-event');
      let handled = component.find('#pascal');
      expect(handled.textContent).toEqual('false');
      wc.click();
      await component.update();
      expect(handled.textContent).toEqual('true');
    });
  });
}

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