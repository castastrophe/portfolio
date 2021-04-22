/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function() {
  'use strict';

  /**
   * Basic flow of the loader process
   *
   * There are 4 flows the loader can take when booting up
   *
   * - Synchronous script, no polyfills needed
   *   - wait for `DOMContentLoaded`
   *   - fire WCR event, as there could not be any callbacks passed to `waitFor`
   *
   * - Synchronous script, polyfills needed
   *   - document.write the polyfill bundle
   *   - wait on the `load` event of the bundle to batch Custom Element upgrades
   *   - wait for `DOMContentLoaded`
   *   - run callbacks passed to `waitFor`
   *   - fire WCR event
   *
   * - Asynchronous script, no polyfills needed
   *   - wait for `DOMContentLoaded`
   *   - run callbacks passed to `waitFor`
   *   - fire WCR event
   *
   * - Asynchronous script, polyfills needed
   *   - Append the polyfill bundle script
   *   - wait for `load` event of the bundle
   *   - batch Custom Element Upgrades
   *   - run callbacks pass to `waitFor`
   *   - fire WCR event
   */

  var polyfillsLoaded = false;
  var whenLoadedFns = [];
  var allowUpgrades = false;
  var flushFn;

  function fireEvent() {
    window.WebComponents.ready = true;
    document.dispatchEvent(new CustomEvent('WebComponentsReady', { bubbles: true }));
  }

  function batchCustomElements() {
    if (window.customElements && customElements.polyfillWrapFlushCallback) {
      customElements.polyfillWrapFlushCallback(function (flushCallback) {
        flushFn = flushCallback;
        if (allowUpgrades) {
          flushFn();
        }
      });
    }
  }

  function asyncReady() {
    batchCustomElements();
    ready();
  }

  function ready() {
    // bootstrap <template> elements before custom elements
    if (window.HTMLTemplateElement && HTMLTemplateElement.bootstrap) {
      HTMLTemplateElement.bootstrap(window.document);
    }
    polyfillsLoaded = true;
    runWhenLoadedFns().then(fireEvent);
  }

  function runWhenLoadedFns() {
    allowUpgrades = false;
    var fnsMap = whenLoadedFns.map(function(fn) {
      return fn instanceof Function ? fn() : fn;
    });
    whenLoadedFns = [];
    return Promise.all(fnsMap).then(function() {
      allowUpgrades = true;
      flushFn && flushFn();
    }).catch(function(err) {
      console.error(err);
    });
  }

  window.WebComponents = window.WebComponents || {};
  window.WebComponents.ready = window.WebComponents.ready || false;
  window.WebComponents.waitFor = window.WebComponents.waitFor || function(waitFn) {
    if (!waitFn) {
      return;
    }
    whenLoadedFns.push(waitFn);
    if (polyfillsLoaded) {
      runWhenLoadedFns();
    }
  };
  window.WebComponents._batchCustomElements = batchCustomElements;

  var name = 'webcomponents-loader.js';
  // Feature detect which polyfill needs to be imported.
  var polyfills = [];
  if (!('attachShadow' in Element.prototype && 'getRootNode' in Element.prototype) ||
    (window.ShadyDOM && window.ShadyDOM.force)) {
    polyfills.push('sd');
  }
  if (!window.customElements || window.customElements.forcePolyfill) {
    polyfills.push('ce');
  }

  var needsTemplate = (function() {
    // no real <template> because no `content` property (IE and older browsers)
    var t = document.createElement('template');
    if (!('content' in t)) {
      return true;
    }
    // broken doc fragment (older Edge)
    if (!(t.content.cloneNode() instanceof DocumentFragment)) {
      return true;
    }
    // broken <template> cloning (Edge up to at least version 17)
    var t2 = document.createElement('template');
    t2.content.appendChild(document.createElement('div'));
    t.content.appendChild(t2);
    var clone = t.cloneNode(true);
    return (clone.content.childNodes.length === 0 ||
        clone.content.firstChild.content.childNodes.length === 0);
  })();

  // NOTE: any browser that does not have template or ES6 features
  // must load the full suite of polyfills.
  if (!window.Promise || !Array.from || !window.URL || !window.Symbol || needsTemplate) {
    polyfills = ['sd-ce-pf'];
  }

  if (polyfills.length) {
    var url;
    var polyfillFile = 'bundles/webcomponents-' + polyfills.join('-') + '.js';

    // Load it from the right place.
    if (window.WebComponents.root) {
      url = window.WebComponents.root + polyfillFile;
    } else {
      var script = document.querySelector('script[src*="' + name +'"]');
      // Load it from the right place.
      url = script.src.replace(name, polyfillFile);
    }

    var newScript = document.createElement('script');
    newScript.src = url;
    // if readyState is 'loading', this script is synchronous
    if (document.readyState === 'loading') {
      // make sure custom elements are batched whenever parser gets to the injected script
      newScript.setAttribute('onload', 'window.WebComponents._batchCustomElements()');
      document.write(newScript.outerHTML);
      document.addEventListener('DOMContentLoaded', ready);
    } else {
      newScript.addEventListener('load', function () {
        asyncReady();
      });
      newScript.addEventListener('error', function () {
        throw new Error('Could not load polyfill bundle' + url);
      });
      document.head.appendChild(newScript);
    }
  } else {
    // if readyState is 'complete', script is loaded imperatively on a spec-compliant browser, so just fire WCR
    if (document.readyState === 'complete') {
      polyfillsLoaded = true;
      fireEvent();
    } else {
      // this script may come between DCL and load, so listen for both, and cancel load listener if DCL fires
      window.addEventListener('load', ready);
      window.addEventListener('DOMContentLoaded', function() {
        window.removeEventListener('load', ready);
        ready();
      })
    }
  }
})();

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ3ZWJjb21wb25lbnRzLWxvYWRlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTggVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdCBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdCBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLyoqXG4gICAqIEJhc2ljIGZsb3cgb2YgdGhlIGxvYWRlciBwcm9jZXNzXG4gICAqXG4gICAqIFRoZXJlIGFyZSA0IGZsb3dzIHRoZSBsb2FkZXIgY2FuIHRha2Ugd2hlbiBib290aW5nIHVwXG4gICAqXG4gICAqIC0gU3luY2hyb25vdXMgc2NyaXB0LCBubyBwb2x5ZmlsbHMgbmVlZGVkXG4gICAqICAgLSB3YWl0IGZvciBgRE9NQ29udGVudExvYWRlZGBcbiAgICogICAtIGZpcmUgV0NSIGV2ZW50LCBhcyB0aGVyZSBjb3VsZCBub3QgYmUgYW55IGNhbGxiYWNrcyBwYXNzZWQgdG8gYHdhaXRGb3JgXG4gICAqXG4gICAqIC0gU3luY2hyb25vdXMgc2NyaXB0LCBwb2x5ZmlsbHMgbmVlZGVkXG4gICAqICAgLSBkb2N1bWVudC53cml0ZSB0aGUgcG9seWZpbGwgYnVuZGxlXG4gICAqICAgLSB3YWl0IG9uIHRoZSBgbG9hZGAgZXZlbnQgb2YgdGhlIGJ1bmRsZSB0byBiYXRjaCBDdXN0b20gRWxlbWVudCB1cGdyYWRlc1xuICAgKiAgIC0gd2FpdCBmb3IgYERPTUNvbnRlbnRMb2FkZWRgXG4gICAqICAgLSBydW4gY2FsbGJhY2tzIHBhc3NlZCB0byBgd2FpdEZvcmBcbiAgICogICAtIGZpcmUgV0NSIGV2ZW50XG4gICAqXG4gICAqIC0gQXN5bmNocm9ub3VzIHNjcmlwdCwgbm8gcG9seWZpbGxzIG5lZWRlZFxuICAgKiAgIC0gd2FpdCBmb3IgYERPTUNvbnRlbnRMb2FkZWRgXG4gICAqICAgLSBydW4gY2FsbGJhY2tzIHBhc3NlZCB0byBgd2FpdEZvcmBcbiAgICogICAtIGZpcmUgV0NSIGV2ZW50XG4gICAqXG4gICAqIC0gQXN5bmNocm9ub3VzIHNjcmlwdCwgcG9seWZpbGxzIG5lZWRlZFxuICAgKiAgIC0gQXBwZW5kIHRoZSBwb2x5ZmlsbCBidW5kbGUgc2NyaXB0XG4gICAqICAgLSB3YWl0IGZvciBgbG9hZGAgZXZlbnQgb2YgdGhlIGJ1bmRsZVxuICAgKiAgIC0gYmF0Y2ggQ3VzdG9tIEVsZW1lbnQgVXBncmFkZXNcbiAgICogICAtIHJ1biBjYWxsYmFja3MgcGFzcyB0byBgd2FpdEZvcmBcbiAgICogICAtIGZpcmUgV0NSIGV2ZW50XG4gICAqL1xuXG4gIHZhciBwb2x5ZmlsbHNMb2FkZWQgPSBmYWxzZTtcbiAgdmFyIHdoZW5Mb2FkZWRGbnMgPSBbXTtcbiAgdmFyIGFsbG93VXBncmFkZXMgPSBmYWxzZTtcbiAgdmFyIGZsdXNoRm47XG5cbiAgZnVuY3Rpb24gZmlyZUV2ZW50KCkge1xuICAgIHdpbmRvdy5XZWJDb21wb25lbnRzLnJlYWR5ID0gdHJ1ZTtcbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnV2ViQ29tcG9uZW50c1JlYWR5JywgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJhdGNoQ3VzdG9tRWxlbWVudHMoKSB7XG4gICAgaWYgKHdpbmRvdy5jdXN0b21FbGVtZW50cyAmJiBjdXN0b21FbGVtZW50cy5wb2x5ZmlsbFdyYXBGbHVzaENhbGxiYWNrKSB7XG4gICAgICBjdXN0b21FbGVtZW50cy5wb2x5ZmlsbFdyYXBGbHVzaENhbGxiYWNrKGZ1bmN0aW9uIChmbHVzaENhbGxiYWNrKSB7XG4gICAgICAgIGZsdXNoRm4gPSBmbHVzaENhbGxiYWNrO1xuICAgICAgICBpZiAoYWxsb3dVcGdyYWRlcykge1xuICAgICAgICAgIGZsdXNoRm4oKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYXN5bmNSZWFkeSgpIHtcbiAgICBiYXRjaEN1c3RvbUVsZW1lbnRzKCk7XG4gICAgcmVhZHkoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWR5KCkge1xuICAgIC8vIGJvb3RzdHJhcCA8dGVtcGxhdGU+IGVsZW1lbnRzIGJlZm9yZSBjdXN0b20gZWxlbWVudHNcbiAgICBpZiAod2luZG93LkhUTUxUZW1wbGF0ZUVsZW1lbnQgJiYgSFRNTFRlbXBsYXRlRWxlbWVudC5ib290c3RyYXApIHtcbiAgICAgIEhUTUxUZW1wbGF0ZUVsZW1lbnQuYm9vdHN0cmFwKHdpbmRvdy5kb2N1bWVudCk7XG4gICAgfVxuICAgIHBvbHlmaWxsc0xvYWRlZCA9IHRydWU7XG4gICAgcnVuV2hlbkxvYWRlZEZucygpLnRoZW4oZmlyZUV2ZW50KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJ1bldoZW5Mb2FkZWRGbnMoKSB7XG4gICAgYWxsb3dVcGdyYWRlcyA9IGZhbHNlO1xuICAgIHZhciBmbnNNYXAgPSB3aGVuTG9hZGVkRm5zLm1hcChmdW5jdGlvbihmbikge1xuICAgICAgcmV0dXJuIGZuIGluc3RhbmNlb2YgRnVuY3Rpb24gPyBmbigpIDogZm47XG4gICAgfSk7XG4gICAgd2hlbkxvYWRlZEZucyA9IFtdO1xuICAgIHJldHVybiBQcm9taXNlLmFsbChmbnNNYXApLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICBhbGxvd1VwZ3JhZGVzID0gdHJ1ZTtcbiAgICAgIGZsdXNoRm4gJiYgZmx1c2hGbigpO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgIH0pO1xuICB9XG5cbiAgd2luZG93LldlYkNvbXBvbmVudHMgPSB3aW5kb3cuV2ViQ29tcG9uZW50cyB8fCB7fTtcbiAgd2luZG93LldlYkNvbXBvbmVudHMucmVhZHkgPSB3aW5kb3cuV2ViQ29tcG9uZW50cy5yZWFkeSB8fCBmYWxzZTtcbiAgd2luZG93LldlYkNvbXBvbmVudHMud2FpdEZvciA9IHdpbmRvdy5XZWJDb21wb25lbnRzLndhaXRGb3IgfHwgZnVuY3Rpb24od2FpdEZuKSB7XG4gICAgaWYgKCF3YWl0Rm4pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgd2hlbkxvYWRlZEZucy5wdXNoKHdhaXRGbik7XG4gICAgaWYgKHBvbHlmaWxsc0xvYWRlZCkge1xuICAgICAgcnVuV2hlbkxvYWRlZEZucygpO1xuICAgIH1cbiAgfTtcbiAgd2luZG93LldlYkNvbXBvbmVudHMuX2JhdGNoQ3VzdG9tRWxlbWVudHMgPSBiYXRjaEN1c3RvbUVsZW1lbnRzO1xuXG4gIHZhciBuYW1lID0gJ3dlYmNvbXBvbmVudHMtbG9hZGVyLmpzJztcbiAgLy8gRmVhdHVyZSBkZXRlY3Qgd2hpY2ggcG9seWZpbGwgbmVlZHMgdG8gYmUgaW1wb3J0ZWQuXG4gIHZhciBwb2x5ZmlsbHMgPSBbXTtcbiAgaWYgKCEoJ2F0dGFjaFNoYWRvdycgaW4gRWxlbWVudC5wcm90b3R5cGUgJiYgJ2dldFJvb3ROb2RlJyBpbiBFbGVtZW50LnByb3RvdHlwZSkgfHxcbiAgICAod2luZG93LlNoYWR5RE9NICYmIHdpbmRvdy5TaGFkeURPTS5mb3JjZSkpIHtcbiAgICBwb2x5ZmlsbHMucHVzaCgnc2QnKTtcbiAgfVxuICBpZiAoIXdpbmRvdy5jdXN0b21FbGVtZW50cyB8fCB3aW5kb3cuY3VzdG9tRWxlbWVudHMuZm9yY2VQb2x5ZmlsbCkge1xuICAgIHBvbHlmaWxscy5wdXNoKCdjZScpO1xuICB9XG5cbiAgdmFyIG5lZWRzVGVtcGxhdGUgPSAoZnVuY3Rpb24oKSB7XG4gICAgLy8gbm8gcmVhbCA8dGVtcGxhdGU+IGJlY2F1c2Ugbm8gYGNvbnRlbnRgIHByb3BlcnR5IChJRSBhbmQgb2xkZXIgYnJvd3NlcnMpXG4gICAgdmFyIHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICAgIGlmICghKCdjb250ZW50JyBpbiB0KSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8vIGJyb2tlbiBkb2MgZnJhZ21lbnQgKG9sZGVyIEVkZ2UpXG4gICAgaWYgKCEodC5jb250ZW50LmNsb25lTm9kZSgpIGluc3RhbmNlb2YgRG9jdW1lbnRGcmFnbWVudCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvLyBicm9rZW4gPHRlbXBsYXRlPiBjbG9uaW5nIChFZGdlIHVwIHRvIGF0IGxlYXN0IHZlcnNpb24gMTcpXG4gICAgdmFyIHQyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgICB0Mi5jb250ZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcbiAgICB0LmNvbnRlbnQuYXBwZW5kQ2hpbGQodDIpO1xuICAgIHZhciBjbG9uZSA9IHQuY2xvbmVOb2RlKHRydWUpO1xuICAgIHJldHVybiAoY2xvbmUuY29udGVudC5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICBjbG9uZS5jb250ZW50LmZpcnN0Q2hpbGQuY29udGVudC5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMCk7XG4gIH0pKCk7XG5cbiAgLy8gTk9URTogYW55IGJyb3dzZXIgdGhhdCBkb2VzIG5vdCBoYXZlIHRlbXBsYXRlIG9yIEVTNiBmZWF0dXJlc1xuICAvLyBtdXN0IGxvYWQgdGhlIGZ1bGwgc3VpdGUgb2YgcG9seWZpbGxzLlxuICBpZiAoIXdpbmRvdy5Qcm9taXNlIHx8ICFBcnJheS5mcm9tIHx8ICF3aW5kb3cuVVJMIHx8ICF3aW5kb3cuU3ltYm9sIHx8IG5lZWRzVGVtcGxhdGUpIHtcbiAgICBwb2x5ZmlsbHMgPSBbJ3NkLWNlLXBmJ107XG4gIH1cblxuICBpZiAocG9seWZpbGxzLmxlbmd0aCkge1xuICAgIHZhciB1cmw7XG4gICAgdmFyIHBvbHlmaWxsRmlsZSA9ICdidW5kbGVzL3dlYmNvbXBvbmVudHMtJyArIHBvbHlmaWxscy5qb2luKCctJykgKyAnLmpzJztcblxuICAgIC8vIExvYWQgaXQgZnJvbSB0aGUgcmlnaHQgcGxhY2UuXG4gICAgaWYgKHdpbmRvdy5XZWJDb21wb25lbnRzLnJvb3QpIHtcbiAgICAgIHVybCA9IHdpbmRvdy5XZWJDb21wb25lbnRzLnJvb3QgKyBwb2x5ZmlsbEZpbGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBzY3JpcHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzY3JpcHRbc3JjKj1cIicgKyBuYW1lICsnXCJdJyk7XG4gICAgICAvLyBMb2FkIGl0IGZyb20gdGhlIHJpZ2h0IHBsYWNlLlxuICAgICAgdXJsID0gc2NyaXB0LnNyYy5yZXBsYWNlKG5hbWUsIHBvbHlmaWxsRmlsZSk7XG4gICAgfVxuXG4gICAgdmFyIG5ld1NjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgIG5ld1NjcmlwdC5zcmMgPSB1cmw7XG4gICAgLy8gaWYgcmVhZHlTdGF0ZSBpcyAnbG9hZGluZycsIHRoaXMgc2NyaXB0IGlzIHN5bmNocm9ub3VzXG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdsb2FkaW5nJykge1xuICAgICAgLy8gbWFrZSBzdXJlIGN1c3RvbSBlbGVtZW50cyBhcmUgYmF0Y2hlZCB3aGVuZXZlciBwYXJzZXIgZ2V0cyB0byB0aGUgaW5qZWN0ZWQgc2NyaXB0XG4gICAgICBuZXdTY3JpcHQuc2V0QXR0cmlidXRlKCdvbmxvYWQnLCAnd2luZG93LldlYkNvbXBvbmVudHMuX2JhdGNoQ3VzdG9tRWxlbWVudHMoKScpO1xuICAgICAgZG9jdW1lbnQud3JpdGUobmV3U2NyaXB0Lm91dGVySFRNTCk7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgcmVhZHkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXdTY3JpcHQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYXN5bmNSZWFkeSgpO1xuICAgICAgfSk7XG4gICAgICBuZXdTY3JpcHQuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGxvYWQgcG9seWZpbGwgYnVuZGxlJyArIHVybCk7XG4gICAgICB9KTtcbiAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobmV3U2NyaXB0KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gaWYgcmVhZHlTdGF0ZSBpcyAnY29tcGxldGUnLCBzY3JpcHQgaXMgbG9hZGVkIGltcGVyYXRpdmVseSBvbiBhIHNwZWMtY29tcGxpYW50IGJyb3dzZXIsIHNvIGp1c3QgZmlyZSBXQ1JcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xuICAgICAgcG9seWZpbGxzTG9hZGVkID0gdHJ1ZTtcbiAgICAgIGZpcmVFdmVudCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyB0aGlzIHNjcmlwdCBtYXkgY29tZSBiZXR3ZWVuIERDTCBhbmQgbG9hZCwgc28gbGlzdGVuIGZvciBib3RoLCBhbmQgY2FuY2VsIGxvYWQgbGlzdGVuZXIgaWYgRENMIGZpcmVzXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJlYWR5KTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgcmVhZHkpO1xuICAgICAgICByZWFkeSgpO1xuICAgICAgfSlcbiAgICB9XG4gIH1cbn0pKCk7XG4iXSwiZmlsZSI6IndlYmNvbXBvbmVudHMtbG9hZGVyLmpzIn0=
