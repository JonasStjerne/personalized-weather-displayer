
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    class WeatherService {
          constructor(location) {
                this.location = location;
          }

          async getAirTemperature() {
                // const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
                // const airTemperature = await response.json();
                return 20;
          }

          async getWaterTemperature() {
                return 14;
          }

          async getWeatherState() {
                return "partCloudy";
          }

          async getWindSpeed() {
                return 2;
          }

    }

    //Returns animations which conditions are met by the weatherData
    function getFilteredAnimations(animationList, weatherData) {
          const result = [];

          //For each animation
          animationList.default.forEach((animation, i) => {
                let conditionsMet = true;
                //Check if all its conditions are met
                Object.keys(animation.conditions).forEach(key => {
                      //If animation condition isn't passed in the weatherData log error
                      if(!weatherData[key]) { console.error("Animation condition error: No condition called ", key); return}
                      const condition = animation.conditions[key];

                      //If object it will have a min and or max value
                      if(typeof condition === 'object') {
                            if(condition.min !== null && condition.min > weatherData[key] ) {
                                  conditionsMet = false;
                                  return;
                            }
                            else if(condition.max !== null && condition.max < weatherData[key] ) {
                                  conditionsMet = false;
                                  return;
                            }
                      //If not object it should just check if equal to.  An example is weatherState = 'rainy'
                      } else {
                            if (condition != weatherData[key] ) {
                                  conditionsMet = false;
                                  return
                            }
                      }
                });
                if(conditionsMet) {
                      result.push(animation.src);
                }
          });

          return result;
    }

    var list = [{src:"happy.gif",conditions:{airTemperature:{min:10,max:25}}}];

    var animations = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': list
    });

    /* src\App.svelte generated by Svelte v3.48.0 */
    const file = "src\\App.svelte";

    // (99:1) {#if currentAnimation}
    function create_if_block_2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = `./assets/animations/${/*currentAnimation*/ ctx[4]}`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "idiot svelte-1gqungj");
    			add_location(img, file, 99, 2, 3346);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentAnimation*/ 16 && !src_url_equal(img.src, img_src_value = `./assets/animations/${/*currentAnimation*/ ctx[4]}`)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(99:1) {#if currentAnimation}",
    		ctx
    	});

    	return block;
    }

    // (106:2) {#if weatherState}
    function create_if_block_1(ctx) {
    	let video;
    	let source;
    	let source_src_value;

    	const block = {
    		c: function create() {
    			video = element("video");
    			source = element("source");
    			if (!src_url_equal(source.src, source_src_value = `./assets/weather/${/*weatherState*/ ctx[2]}.mp4`)) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file, 107, 4, 3747);
    			video.autoplay = true;
    			video.muted = true;
    			video.loop = true;
    			attr_dev(video, "class", "backgroundWeather svelte-1gqungj");
    			set_style(video, "filter", "blur(4px) brightness(" + /*brightness*/ ctx[5] + ")");
    			add_location(video, file, 106, 3, 3637);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    			append_dev(video, source);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*weatherState*/ 4 && !src_url_equal(source.src, source_src_value = `./assets/weather/${/*weatherState*/ ctx[2]}.mp4`)) {
    				attr_dev(source, "src", source_src_value);
    			}

    			if (dirty & /*brightness*/ 32) {
    				set_style(video, "filter", "blur(4px) brightness(" + /*brightness*/ ctx[5] + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(106:2) {#if weatherState}",
    		ctx
    	});

    	return block;
    }

    // (111:2) {#if airTemperature && windSpeed && waterTemperature}
    function create_if_block(ctx) {
    	let div4;
    	let div0;
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let div3;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t3;
    	let h20;
    	let t4;
    	let t5;
    	let t6;
    	let div2;
    	let img1;
    	let img1_src_value;
    	let t7;
    	let h21;
    	let t8;
    	let t9;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(/*airTemperature*/ ctx[0]);
    			t1 = text("°");
    			t2 = space();
    			div3 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t3 = space();
    			h20 = element("h2");
    			t4 = text(/*windSpeed*/ ctx[3]);
    			t5 = text("m/s");
    			t6 = space();
    			div2 = element("div");
    			img1 = element("img");
    			t7 = space();
    			h21 = element("h2");
    			t8 = text(/*waterTemperature*/ ctx[1]);
    			t9 = text("°");
    			add_location(h1, file, 113, 4, 3983);
    			attr_dev(div0, "class", "airTemperature");
    			add_location(div0, file, 112, 4, 3949);
    			if (!src_url_equal(img0.src, img0_src_value = "./assets/windIcon.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-1gqungj");
    			add_location(img0, file, 117, 6, 4110);
    			add_location(h20, file, 118, 6, 4158);
    			attr_dev(div1, "class", "windSpeedContainer svelte-1gqungj");
    			add_location(div1, file, 116, 5, 4070);
    			if (!src_url_equal(img1.src, img1_src_value = "./assets/waterIcon.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-1gqungj");
    			add_location(img1, file, 121, 6, 4241);
    			add_location(h21, file, 122, 5, 4289);
    			attr_dev(div2, "class", "waterTemperature svelte-1gqungj");
    			add_location(div2, file, 120, 5, 4203);
    			attr_dev(div3, "class", "secondaryWeatherInfo svelte-1gqungj");
    			add_location(div3, file, 115, 4, 4029);
    			attr_dev(div4, "class", "weatherInformationContainer svelte-1gqungj");
    			add_location(div4, file, 111, 3, 3902);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, img0);
    			append_dev(div1, t3);
    			append_dev(div1, h20);
    			append_dev(h20, t4);
    			append_dev(h20, t5);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, img1);
    			append_dev(div2, t7);
    			append_dev(div2, h21);
    			append_dev(h21, t8);
    			append_dev(h21, t9);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*airTemperature*/ 1) set_data_dev(t0, /*airTemperature*/ ctx[0]);
    			if (dirty & /*windSpeed*/ 8) set_data_dev(t4, /*windSpeed*/ ctx[3]);
    			if (dirty & /*waterTemperature*/ 2) set_data_dev(t8, /*waterTemperature*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(111:2) {#if airTemperature && windSpeed && waterTemperature}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let if_block0 = /*currentAnimation*/ ctx[4] && create_if_block_2(ctx);
    	let if_block1 = /*weatherState*/ ctx[2] && create_if_block_1(ctx);
    	let if_block2 = /*airTemperature*/ ctx[0] && /*windSpeed*/ ctx[3] && /*waterTemperature*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div0, "class", "weatherVideoContainer svelte-1gqungj");
    			add_location(div0, file, 104, 1, 3575);
    			attr_dev(div1, "class", "wrapper");
    			add_location(div1, file, 97, 0, 3296);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t1);
    			if (if_block2) if_block2.m(div0, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*currentAnimation*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*weatherState*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(div0, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*airTemperature*/ ctx[0] && /*windSpeed*/ ctx[3] && /*waterTemperature*/ ctx[1]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					if_block2.m(div0, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const updateWeatherDataIntervalMinutes = 0.1;
    const animationCycleTimeMinutes = 0.5;
    const defaultAnimation = 'defaultAnimation.gif';
    const latitude = 57.046707;
    const longitude = 9.935932;

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const weatherService = new WeatherService("Location");

    	let airTemperature,
    		waterTemperature,
    		weatherState,
    		windSpeed,
    		currentDate,
    		currentAnimation,
    		brightness;

    	//Set the brighness of the video according to daylight outside
    	//Thanks to https://sunrise-sunset.org/api for using the API
    	async function updateBrightnessToSunlight(lat, lng) {
    		return fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=today&formatted=0`).then(response => response.json()).then(data => {
    			if (data.status == "OK") {
    				const sunrise = new Date(data.results.sunrise);
    				const sunset = new Date(data.results.sunset);
    				const currentTime = new Date();

    				if (currentTime.getHours() > sunrise.getHours() + 1 && currentTime.getHours() < sunset.getHours() - 1) {
    					$$invalidate(5, brightness = 1);
    				} else if (currentTime.getHours() == sunrise.getHours() + 1 || currentTime.getHours() == sunset.getHours() - 1) {
    					$$invalidate(5, brightness = 0.6);
    				} else {
    					$$invalidate(5, brightness = 0.3);
    				}
    			}
    		});
    	}

    	async function updateWeather() {
    		$$invalidate(0, airTemperature = await weatherService.getAirTemperature());
    		$$invalidate(1, waterTemperature = await weatherService.getWaterTemperature());
    		$$invalidate(2, weatherState = await weatherService.getWeatherState());
    		$$invalidate(3, windSpeed = await weatherService.getWindSpeed());
    		const date = new Date();
    		currentDate = date.getDate() + '/' + (date.getMonth() + 1);
    		return;
    	}

    	function runNewAnimation() {
    		//Save last animation
    		const previousAnimation = currentAnimation;

    		var pickedAnimation;

    		//Get animations with conditions that match weatherData
    		let animationContainer = getFilteredAnimations(animations, {
    			airTemperature,
    			waterTemperature,
    			weatherState,
    			windSpeed,
    			currentDate
    		});

    		function pickRandomAnimation() {
    			//If no animations condition are met, play default animation
    			if (animationContainer.length == 0) {
    				pickedAnimation = defaultAnimation;
    				return;
    			}

    			//Select random animation from animationContainer
    			pickedAnimation = animationContainer[Math.floor(animationContainer.length * Math.random()) | 0];

    			//If its the same as last animation and there are others to pick, pick a new one
    			if (pickedAnimation == previousAnimation && animationContainer.length > 1) {
    				pickRandomAnimation();
    			}
    		}

    		//Call function
    		pickRandomAnimation();

    		//Set the new animation
    		$$invalidate(4, currentAnimation = pickedAnimation);
    	}

    	onMount(() => {
    		async function start() {
    			//Get weather information and update every set amount of time
    			await updateWeather();

    			setInterval(updateWeather, updateWeatherDataIntervalMinutes * 60 * 1000);

    			//Set new animation and set a new one every set amount of time
    			runNewAnimation();

    			setInterval(runNewAnimation, animationCycleTimeMinutes * 60 * 1000);
    			updateBrightnessToSunlight(latitude, longitude);
    		}
    		start();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		WeatherService,
    		getFilteredAnimations,
    		animations,
    		weatherService,
    		updateWeatherDataIntervalMinutes,
    		animationCycleTimeMinutes,
    		defaultAnimation,
    		latitude,
    		longitude,
    		airTemperature,
    		waterTemperature,
    		weatherState,
    		windSpeed,
    		currentDate,
    		currentAnimation,
    		brightness,
    		updateBrightnessToSunlight,
    		updateWeather,
    		runNewAnimation
    	});

    	$$self.$inject_state = $$props => {
    		if ('airTemperature' in $$props) $$invalidate(0, airTemperature = $$props.airTemperature);
    		if ('waterTemperature' in $$props) $$invalidate(1, waterTemperature = $$props.waterTemperature);
    		if ('weatherState' in $$props) $$invalidate(2, weatherState = $$props.weatherState);
    		if ('windSpeed' in $$props) $$invalidate(3, windSpeed = $$props.windSpeed);
    		if ('currentDate' in $$props) currentDate = $$props.currentDate;
    		if ('currentAnimation' in $$props) $$invalidate(4, currentAnimation = $$props.currentAnimation);
    		if ('brightness' in $$props) $$invalidate(5, brightness = $$props.brightness);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		airTemperature,
    		waterTemperature,
    		weatherState,
    		windSpeed,
    		currentAnimation,
    		brightness
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
