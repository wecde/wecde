// Converts Touch events to Mouse Events

const TouchCompat = {
  supported:
    "ontouchstart" in document ||
    (window.DocumentTouch && document instanceof window.DocumentTouch) ||
    (window.navigator.msPointerEnabled &&
      window.navigator.msMaxTouchPoints > 0) || //IE 10
    (window.navigator.pointerEnabled && window.navigator.maxTouchPoints > 0) || //IE >=11
    false,
  init() {
    if (TouchCompat.supported) {
      document.addEventListener("touchstart", touchHandler, true);
      document.addEventListener("touchmove", touchHandler, true);
      document.addEventListener("touchend", touchHandler, true);
      document.addEventListener("touchcancel", touchHandler, true);
    }

    function touchHandler(event) {
      const touches = event.changedTouches;
      const first = touches[0];
      let type = "";
      switch (event.type) {
        case "touchstart": {
          type = "mousedown";
          break;
        }
        case "touchmove": {
          type = "mousemove";
          break;
        }
        case "touchend": {
          type = "mouseup";
          break;
        }
        default: {
          return;
        }
      }
      const simulatedEvent = document.createEvent("MouseEvent");
      simulatedEvent.initMouseEvent(
        type,
        true,
        true,
        window,
        1,
        first.screenX,
        first.screenY,
        first.clientX,
        first.clientY,
        false,
        false,
        false,
        false,
        0 /*left*/,
        null
      );
      first.target.dispatchEvent(simulatedEvent);
    }
  },
  joystick(options) {
    options = options || {};
    options.dataOnly = !TouchCompat.supported || options.dataOnly;
    return nipplejs.create(options);
  },
};

(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    let g;
    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }
    g.nipplejs = f();
  }
})(() => {
  let define, module, exports;

  // Constants
  const isTouch = !!("ontouchstart" in window);
  const isPointer = window.PointerEvent ? true : false;
  const isMSPointer = window.MSPointerEvent ? true : false;
  const events = {
    touch: {
      start: "touchstart",
      move: "touchmove",
      end: "touchend, touchcancel",
    },
    mouse: {
      start: "mousedown",
      move: "mousemove",
      end: "mouseup",
    },
    pointer: {
      start: "pointerdown",
      move: "pointermove",
      end: "pointerup, pointercancel",
    },
    MSPointer: {
      start: "MSPointerDown",
      move: "MSPointerMove",
      end: "MSPointerUp",
    },
  };
  let toBind;
  let secondBind = {};
  if (isPointer) {
    toBind = events.pointer;
  } else if (isMSPointer) {
    toBind = events.MSPointer;
  } else if (isTouch) {
    toBind = events.touch;
    secondBind = events.mouse;
  } else {
    toBind = events.mouse;
  }

  ///////////////////////
  ///      UTILS      ///
  ///////////////////////

  const u = {};
  u.distance = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    return Math.sqrt(dx * dx + dy * dy);
  };

  u.angle = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    return u.degrees(Math.atan2(dy, dx));
  };

  u.findCoord = (p, d, a) => {
    const b = { x: 0, y: 0 };
    a = u.radians(a);
    b.x = p.x - d * Math.cos(a);
    b.y = p.y - d * Math.sin(a);
    return b;
  };

  u.radians = (a) => {
    return a * (Math.PI / 180);
  };

  u.degrees = (a) => {
    return a * (180 / Math.PI);
  };

  u.bindEvt = (el, arg, handler) => {
    const types = arg.split(/[ ,]+/g);
    let type;
    for (let i = 0; i < types.length; i += 1) {
      type = types[i];
      if (el.addEventListener) {
        el.addEventListener(type, handler, false);
      } else if (el.attachEvent) {
        el.attachEvent(type, handler);
      }
    }
  };

  u.unbindEvt = (el, arg, handler) => {
    const types = arg.split(/[ ,]+/g);
    let type;
    for (let i = 0; i < types.length; i += 1) {
      type = types[i];
      if (el.removeEventListener) {
        el.removeEventListener(type, handler);
      } else if (el.detachEvent) {
        el.detachEvent(type, handler);
      }
    }
  };

  u.trigger = (el, type, data) => {
    const evt = new CustomEvent(type, data);
    el.dispatchEvent(evt);
  };

  u.prepareEvent = (evt) => {
    evt.preventDefault();
    return evt.type.match(/^touch/) ? evt.changedTouches : evt;
  };

  u.getScroll = () => {
    const x =
      window.pageXOffset !== undefined
        ? window.pageXOffset
        : (
            document.documentElement ||
            document.body.parentNode ||
            document.body
          ).scrollLeft;

    const y =
      window.pageYOffset !== undefined
        ? window.pageYOffset
        : (
            document.documentElement ||
            document.body.parentNode ||
            document.body
          ).scrollTop;
    return {
      x,
      y,
    };
  };

  u.applyPosition = (el, pos) => {
    if (pos.top || pos.right || pos.bottom || pos.left) {
      el.style.top = pos.top;
      el.style.right = pos.right;
      el.style.bottom = pos.bottom;
      el.style.left = pos.left;
    } else {
      el.style.left = `${pos.x}px`;
      el.style.top = `${pos.y}px`;
    }
  };

  u.getTransitionStyle = (property, values, time) => {
    const obj = u.configStylePropertyObject(property);
    for (const i in obj) {
      if (obj.hasOwnProperty(i)) {
        if (typeof values === "string") {
          obj[i] = `${values} ${time}`;
        } else {
          let st = "";
          for (let j = 0, max = values.length; j < max; j += 1) {
            st += `${values[j]} ${time}, `;
          }
          obj[i] = st.slice(0, -2);
        }
      }
    }
    return obj;
  };

  u.getVendorStyle = (property, value) => {
    const obj = u.configStylePropertyObject(property);
    for (const i in obj) {
      if (obj.hasOwnProperty(i)) {
        obj[i] = value;
      }
    }
    return obj;
  };

  u.configStylePropertyObject = (prop) => {
    const obj = {};
    obj[prop] = "";
    const vendors = ["webkit", "Moz", "o"];
    vendors.forEach((vendor) => {
      obj[vendor + prop.charAt(0).toUpperCase() + prop.slice(1)] = "";
    });
    return obj;
  };

  u.extend = (objA, objB) => {
    for (const i in objB) {
      if (objB.hasOwnProperty(i)) {
        objA[i] = objB[i];
      }
    }
    return objA;
  };

  // Overwrite only what's already present
  u.safeExtend = (objA, objB) => {
    const obj = {};
    for (const i in objA) {
      if (objA.hasOwnProperty(i) && objB.hasOwnProperty(i)) {
        obj[i] = objB[i];
      } else if (objA.hasOwnProperty(i)) {
        obj[i] = objA[i];
      }
    }
    return obj;
  };

  // Map for array or unique item.
  u.map = (ar, fn) => {
    if (ar.length) {
      for (let i = 0, max = ar.length; i < max; i += 1) {
        fn(ar[i]);
      }
    } else {
      fn(ar);
    }
  };

  ///////////////////////
  ///   SUPER CLASS   ///
  ///////////////////////

  function Super() {}

  // Basic event system.
  Super.prototype.on = function (arg, cb) {
    const self = this;
    const types = arg.split(/[ ,]+/g);
    let type;
    self._handlers_ = self._handlers_ || {};

    for (let i = 0; i < types.length; i += 1) {
      type = types[i];
      self._handlers_[type] = self._handlers_[type] || [];
      self._handlers_[type].push(cb);
    }
    return self;
  };

  Super.prototype.off = function (type, cb) {
    const self = this;
    self._handlers_ = self._handlers_ || {};

    if (type === undefined) {
      self._handlers_ = {};
    } else if (cb === undefined) {
      self._handlers_[type] = null;
    } else if (
      self._handlers_[type] &&
      self._handlers_[type].indexOf(cb) >= 0
    ) {
      self._handlers_[type].splice(self._handlers_[type].indexOf(cb), 1);
    }

    return self;
  };

  Super.prototype.trigger = function (arg, data) {
    const self = this;
    const types = arg.split(/[ ,]+/g);
    let type;
    self._handlers_ = self._handlers_ || {};

    for (let i = 0; i < types.length; i += 1) {
      type = types[i];
      if (self._handlers_[type] && self._handlers_[type].length) {
        self._handlers_[type].forEach((handler) => {
          handler.call(
            self,
            {
              type,
              target: self,
            },
            data
          );
        });
      }
    }
  };

  // Configuration
  Super.prototype.config = function (options) {
    const self = this;
    self.options = self.defaults || {};
    if (options) {
      self.options = u.safeExtend(self.options, options);
    }
  };

  // Bind internal events.
  Super.prototype.bindEvt = function (el, type) {
    const self = this;
    self._domHandlers_ = self._domHandlers_ || {};

    self._domHandlers_[type] = function (...args) {
      if (typeof self[`on${type}`] === "function") {
        self[`on${type}`](...args);
      } else {
        console.warn(`[WARNING] : Missing "on${type}" handler.`);
      }
    };

    u.bindEvt(el, toBind[type], self._domHandlers_[type]);

    if (secondBind[type]) {
      // Support for both touch and mouse at the same time.
      u.bindEvt(el, secondBind[type], self._domHandlers_[type]);
    }

    return self;
  };

  // Unbind dom events.
  Super.prototype.unbindEvt = function (el, type) {
    const self = this;
    self._domHandlers_ = self._domHandlers_ || {};

    u.unbindEvt(el, toBind[type], self._domHandlers_[type]);

    if (secondBind[type]) {
      // Support for both touch and mouse at the same time.
      u.unbindEvt(el, secondBind[type], self._domHandlers_[type]);
    }

    delete self._domHandlers_[type];

    return this;
  };

  ///////////////////////
  ///   THE NIPPLE    ///
  ///////////////////////

  function Nipple(collection, options) {
    this.identifier = options.identifier;
    this.position = options.position;
    this.frontPosition = options.frontPosition;
    this.collection = collection;

    // Defaults
    this.defaults = {
      size: 100,
      threshold: 0.1,
      color: "white",
      fadeTime: 250,
      dataOnly: false,
      restJoystick: true,
      restOpacity: 0.5,
      mode: "dynamic",
      zone: document.body,
      lockX: false,
      lockY: false,
    };

    this.config(options);

    // Overwrites
    if (this.options.mode === "dynamic") {
      this.options.restOpacity = 0;
    }

    this.id = Nipple.id;
    Nipple.id += 1;
    this.buildEl().stylize();

    // Nipple's API.
    this.instance = {
      el: this.ui.el,
      on: this.on.bind(this),
      off: this.off.bind(this),
      show: this.show.bind(this),
      hide: this.hide.bind(this),
      add: this.addToDom.bind(this),
      remove: this.removeFromDom.bind(this),
      destroy: this.destroy.bind(this),
      resetDirection: this.resetDirection.bind(this),
      computeDirection: this.computeDirection.bind(this),
      trigger: this.trigger.bind(this),
      position: this.position,
      frontPosition: this.frontPosition,
      ui: this.ui,
      identifier: this.identifier,
      id: this.id,
      options: this.options,
    };

    return this.instance;
  }

  Nipple.prototype = new Super();
  Nipple.constructor = Nipple;
  Nipple.id = 0;

  // Build the dom element of the Nipple instance.
  Nipple.prototype.buildEl = function (options) {
    this.ui = {};

    if (this.options.dataOnly) {
      return this;
    }

    this.ui.el = document.createElement("div");
    this.ui.back = document.createElement("div");
    this.ui.front = document.createElement("div");

    this.ui.el.className = `nipple collection_${this.collection.id}`;
    this.ui.back.className = "back";
    this.ui.front.className = "front";

    this.ui.el.setAttribute("id", `nipple_${this.collection.id}_${this.id}`);

    this.ui.el.appendChild(this.ui.back);
    this.ui.el.appendChild(this.ui.front);

    return this;
  };

  // Apply CSS to the Nipple instance.
  Nipple.prototype.stylize = function () {
    if (this.options.dataOnly) {
      return this;
    }
    const animTime = `${this.options.fadeTime}ms`;
    const borderStyle = u.getVendorStyle("borderRadius", "50%");
    const transitStyle = u.getTransitionStyle(
      "transition",
      "opacity",
      animTime
    );
    const styles = {};
    styles.el = {
      position: "absolute",
      opacity: this.options.restOpacity,
      display: "block",
      zIndex: 999,
    };

    styles.back = {
      position: "absolute",
      display: "block",
      width: `${this.options.size}px`,
      height: `${this.options.size}px`,
      marginLeft: `${-this.options.size / 2}px`,
      marginTop: `${-this.options.size / 2}px`,
      background: this.options.color,
      opacity: ".5",
    };

    styles.front = {
      width: `${this.options.size / 2}px`,
      height: `${this.options.size / 2}px`,
      position: "absolute",
      display: "block",
      marginLeft: `${-this.options.size / 4}px`,
      marginTop: `${-this.options.size / 4}px`,
      background: this.options.color,
      opacity: ".5",
    };

    u.extend(styles.el, transitStyle);
    u.extend(styles.back, borderStyle);
    u.extend(styles.front, borderStyle);

    this.applyStyles(styles);

    return this;
  };

  Nipple.prototype.applyStyles = function (styles) {
    // Apply styles
    for (const i in this.ui) {
      if (this.ui.hasOwnProperty(i)) {
        for (const j in styles[i]) {
          this.ui[i].style[j] = styles[i][j];
        }
      }
    }

    return this;
  };

  // Inject the Nipple instance into DOM.
  Nipple.prototype.addToDom = function () {
    // We're not adding it if we're dataOnly or already in dom.
    if (this.options.dataOnly || document.body.contains(this.ui.el)) {
      return this;
    }
    this.options.zone.appendChild(this.ui.el);
    return this;
  };

  // Remove the Nipple instance from DOM.
  Nipple.prototype.removeFromDom = function () {
    if (this.options.dataOnly || !document.body.contains(this.ui.el)) {
      return this;
    }
    this.options.zone.removeChild(this.ui.el);
    return this;
  };

  // Entirely destroy this nipple
  Nipple.prototype.destroy = function () {
    clearTimeout(this.removeTimeout);
    clearTimeout(this.showTimeout);
    clearTimeout(this.restTimeout);
    this.trigger("destroyed", this.instance);
    this.removeFromDom();
    this.off();
  };

  // Fade in the Nipple instance.
  Nipple.prototype.show = function (cb) {
    const self = this;

    if (self.options.dataOnly) {
      return self;
    }

    clearTimeout(self.removeTimeout);
    clearTimeout(self.showTimeout);
    clearTimeout(self.restTimeout);

    self.addToDom();

    self.restCallback();

    setTimeout(() => {
      self.ui.el.style.opacity = 1;
    }, 0);

    self.showTimeout = setTimeout(function () {
      self.trigger("shown", self.instance);
      if (typeof cb === "function") {
        cb.call(this);
      }
    }, self.options.fadeTime);

    return self;
  };

  // Fade out the Nipple instance.
  Nipple.prototype.hide = function (cb) {
    const self = this;

    if (self.options.dataOnly) {
      return self;
    }

    self.ui.el.style.opacity = self.options.restOpacity;

    clearTimeout(self.removeTimeout);
    clearTimeout(self.showTimeout);
    clearTimeout(self.restTimeout);

    self.removeTimeout = setTimeout(() => {
      const display = self.options.mode === "dynamic" ? "none" : "block";
      self.ui.el.style.display = display;
      if (typeof cb === "function") {
        cb.call(self);
      }

      self.trigger("hidden", self.instance);
    }, self.options.fadeTime);
    if (self.options.restJoystick) {
      self.restPosition();
    }

    return self;
  };

  Nipple.prototype.restPosition = function (cb) {
    const self = this;
    self.frontPosition = {
      x: 0,
      y: 0,
    };
    const animTime = `${self.options.fadeTime}ms`;

    const transitStyle = {};
    transitStyle.front = u.getTransitionStyle(
      "transition",
      ["top", "left"],
      animTime
    );

    const styles = { front: {} };
    styles.front = {
      left: `${self.frontPosition.x}px`,
      top: `${self.frontPosition.y}px`,
    };

    self.applyStyles(transitStyle);
    self.applyStyles(styles);

    self.restTimeout = setTimeout(() => {
      if (typeof cb === "function") {
        cb.call(self);
      }
      self.restCallback();
    }, self.options.fadeTime);
  };

  Nipple.prototype.restCallback = function () {
    const self = this;
    const transitStyle = {};
    transitStyle.front = u.getTransitionStyle("transition", "none", "");
    self.applyStyles(transitStyle);
    self.trigger("rested", self.instance);
  };

  Nipple.prototype.resetDirection = function () {
    // Fully rebuild the object to let the iteration possible.
    this.direction = {
      x: false,
      y: false,
      angle: false,
    };
  };

  Nipple.prototype.computeDirection = function (obj) {
    const rAngle = obj.angle.radian;
    const angle45 = Math.PI / 4;
    const angle90 = Math.PI / 2;
    let direction, directionX, directionY;

    // Angular direction
    //     \  UP /
    //      \   /
    // LEFT       RIGHT
    //      /   \
    //     /DOWN \
    //
    if (rAngle > angle45 && rAngle < angle45 * 3 && !obj.lockX) {
      direction = "up";
    } else if (rAngle > -angle45 && rAngle <= angle45 && !obj.lockY) {
      direction = "left";
    } else if (rAngle > -angle45 * 3 && rAngle <= -angle45 && !obj.lockX) {
      direction = "down";
    } else if (!obj.lockY) {
      direction = "right";
    }

    // Plain direction
    //    UP                 |
    // _______               | RIGHT
    //                  LEFT |
    //   DOWN                |
    if (!obj.lockY) {
      if (rAngle > -angle90 && rAngle < angle90) {
        directionX = "left";
      } else {
        directionX = "right";
      }
    }

    if (!obj.lockX) {
      if (rAngle > 0) {
        directionY = "up";
      } else {
        directionY = "down";
      }
    }

    if (obj.force > this.options.threshold) {
      const oldDirection = {};
      for (var i in this.direction) {
        if (this.direction.hasOwnProperty(i)) {
          oldDirection[i] = this.direction[i];
        }
      }

      const same = {};

      this.direction = {
        x: directionX,
        y: directionY,
        angle: direction,
      };

      obj.direction = this.direction;

      for (var i in oldDirection) {
        if (oldDirection[i] === this.direction[i]) {
          same[i] = true;
        }
      }

      // If all 3 directions are the same, we don't trigger anything.
      if (same.x && same.y && same.angle) {
        return obj;
      }

      if (!same.x || !same.y) {
        this.trigger("plain", obj);
      }

      if (!same.x) {
        this.trigger(`plain:${directionX}`, obj);
      }

      if (!same.y) {
        this.trigger(`plain:${directionY}`, obj);
      }

      if (!same.angle) {
        this.trigger(`dir dir:${direction}`, obj);
      }
    }
    return obj;
  };

  /* global Nipple, Super */

  ///////////////////////////
  ///   THE COLLECTION    ///
  ///////////////////////////

  function Collection(manager, options) {
    const self = this;
    self.nipples = [];
    self.idles = [];
    self.actives = [];
    self.ids = [];
    self.pressureIntervals = {};
    self.manager = manager;
    self.id = Collection.id;
    Collection.id += 1;

    // Defaults
    self.defaults = {
      zone: document.body,
      multitouch: false,
      maxNumberOfNipples: 10,
      mode: "dynamic",
      position: { top: 0, left: 0 },
      catchDistance: 200,
      size: 100,
      threshold: 0.1,
      color: "white",
      fadeTime: 250,
      dataOnly: false,
      restJoystick: true,
      restOpacity: 0.5,
      lockX: false,
      lockY: false,
    };

    self.config(options);

    // Overwrites
    if (self.options.mode === "static" || self.options.mode === "semi") {
      self.options.multitouch = false;
    }

    if (!self.options.multitouch) {
      self.options.maxNumberOfNipples = 1;
    }

    self.updateBox();
    self.prepareNipples();
    self.bindings();
    self.begin();

    return self.nipples;
  }

  Collection.prototype = new Super();
  Collection.constructor = Collection;
  Collection.id = 0;

  Collection.prototype.prepareNipples = function () {
    const self = this;
    const nips = self.nipples;

    // Public API Preparation.
    nips.on = self.on.bind(self);
    nips.off = self.off.bind(self);
    nips.options = self.options;
    nips.destroy = self.destroy.bind(self);
    nips.ids = self.ids;
    nips.id = self.id;
    nips.processOnMove = self.processOnMove.bind(self);
    nips.processOnEnd = self.processOnEnd.bind(self);
    nips.get = (id) => {
      if (id === undefined) {
        return nips[0];
      }
      for (let i = 0, max = nips.length; i < max; i += 1) {
        if (nips[i].identifier === id) {
          return nips[i];
        }
      }
      return false;
    };
  };

  Collection.prototype.bindings = function () {
    const self = this;
    // Touch start event.
    self.bindEvt(self.options.zone, "start");
    // Avoid native touch actions (scroll, zoom etc...) on the zone.
    self.options.zone.style.touchAction = "none";
    self.options.zone.style.msTouchAction = "none";
  };

  Collection.prototype.begin = function () {
    const self = this;
    const opts = self.options;

    // We place our static nipple
    // if needed.
    if (opts.mode === "static") {
      const nipple = self.createNipple(
        opts.position,
        self.manager.getIdentifier()
      );
      // Add it to the dom.
      nipple.add();
      // Store it in idles.
      self.idles.push(nipple);
    }
  };

  // Nipple Factory
  Collection.prototype.createNipple = function (position, identifier) {
    const self = this;
    const scroll = u.getScroll();
    let toPutOn = {};
    const opts = self.options;

    if (position.x && position.y) {
      toPutOn = {
        x: position.x - (scroll.x + self.box.left),
        y: position.y - (scroll.y + self.box.top),
      };
    } else if (
      position.top ||
      position.right ||
      position.bottom ||
      position.left
    ) {
      // We need to compute the position X / Y of the joystick.
      const dumb = document.createElement("DIV");
      dumb.style.display = "hidden";
      dumb.style.top = position.top;
      dumb.style.right = position.right;
      dumb.style.bottom = position.bottom;
      dumb.style.left = position.left;
      dumb.style.position = "absolute";

      opts.zone.appendChild(dumb);
      const dumbBox = dumb.getBoundingClientRect();
      opts.zone.removeChild(dumb);

      toPutOn = position;
      position = {
        x: dumbBox.left + scroll.x,
        y: dumbBox.top + scroll.y,
      };
    }

    const nipple = new Nipple(self, {
      color: opts.color,
      size: opts.size,
      threshold: opts.threshold,
      fadeTime: opts.fadeTime,
      dataOnly: opts.dataOnly,
      restJoystick: opts.restJoystick,
      restOpacity: opts.restOpacity,
      mode: opts.mode,
      identifier,
      position,
      zone: opts.zone,
      frontPosition: {
        x: 0,
        y: 0,
      },
    });

    if (!opts.dataOnly) {
      u.applyPosition(nipple.ui.el, toPutOn);
      u.applyPosition(nipple.ui.front, nipple.frontPosition);
    }
    self.nipples.push(nipple);
    self.trigger(`added ${nipple.identifier}:added`, nipple);
    self.manager.trigger(`added ${nipple.identifier}:added`, nipple);

    self.bindNipple(nipple);

    return nipple;
  };

  Collection.prototype.updateBox = function () {
    const self = this;
    self.box = self.options.zone.getBoundingClientRect();
  };

  Collection.prototype.bindNipple = function (nipple) {
    const self = this;
    let type;
    // Bubble up identified events.
    const handler = (evt, data) => {
      // Identify the event type with the nipple's id.
      type = `${evt.type} ${data.id}:${evt.type}`;
      self.trigger(type, data);
    };

    // When it gets destroyed.
    nipple.on("destroyed", self.onDestroyed.bind(self));

    // Other events that will get bubbled up.
    nipple.on("shown hidden rested dir plain", handler);
    nipple.on("dir:up dir:right dir:down dir:left", handler);
    nipple.on("plain:up plain:right plain:down plain:left", handler);
  };

  Collection.prototype.pressureFn = function (touch, nipple, identifier) {
    const self = this;
    let previousPressure = 0;
    clearInterval(self.pressureIntervals[identifier]);
    // Create an interval that will read the pressure every 100ms
    self.pressureIntervals[identifier] = setInterval(
      (() => {
        const pressure =
          touch.force || touch.pressure || touch.webkitForce || 0;
        if (pressure !== previousPressure) {
          nipple.trigger("pressure", pressure);
          self.trigger(`pressure ${nipple.identifier}:pressure`, pressure);
          previousPressure = pressure;
        }
      }).bind(self),
      100
    );
  };

  Collection.prototype.onstart = function (evt) {
    const self = this;
    const opts = self.options;
    evt = u.prepareEvent(evt);

    // Update the box position
    self.updateBox();

    const process = (touch) => {
      // If we can create new nipples
      // meaning we don't have more active nipples than we should.
      if (self.actives.length < opts.maxNumberOfNipples) {
        self.processOnStart(touch);
      }
    };

    u.map(evt, process);

    // We ask upstream to bind the document
    // on 'move' and 'end'
    self.manager.bindDocument();
    return false;
  };

  Collection.prototype.processOnStart = function (evt) {
    const self = this;
    const opts = self.options;
    let indexInIdles;
    const identifier = self.manager.getIdentifier(evt);
    const pressure = evt.force || evt.pressure || evt.webkitForce || 0;
    const position = {
      x: evt.pageX,
      y: evt.pageY,
    };

    const nipple = self.getOrCreate(identifier, position);

    // Update its touch identifier
    if (nipple.identifier !== identifier) {
      self.manager.removeIdentifier(nipple.identifier);
    }
    nipple.identifier = identifier;

    const process = (nip) => {
      // Trigger the start.
      nip.trigger("start", nip);
      self.trigger(`start ${nip.id}:start`, nip);

      nip.show();
      if (pressure > 0) {
        self.pressureFn(evt, nip, nip.identifier);
      }
      // Trigger the first move event.
      self.processOnMove(evt);
    };

    // Transfer it from idles to actives.
    if ((indexInIdles = self.idles.indexOf(nipple)) >= 0) {
      self.idles.splice(indexInIdles, 1);
    }

    // Store the nipple in the actives array
    self.actives.push(nipple);
    self.ids.push(nipple.identifier);

    if (opts.mode !== "semi") {
      process(nipple);
    } else {
      // In semi we check the distance of the touch
      // to decide if we have to reset the nipple
      const distance = u.distance(position, nipple.position);
      if (distance <= opts.catchDistance) {
        process(nipple);
      } else {
        nipple.destroy();
        self.processOnStart(evt);
        return;
      }
    }

    return nipple;
  };

  Collection.prototype.getOrCreate = function (identifier, position) {
    const self = this;
    const opts = self.options;
    let nipple;

    // If we're in static or semi, we might already have an active.
    if (/(semi|static)/.test(opts.mode)) {
      // Get the active one.
      // TODO: Multi-touche for semi and static will start here.
      // Return the nearest one.
      nipple = self.idles[0];
      if (nipple) {
        self.idles.splice(0, 1);
        return nipple;
      }

      if (opts.mode === "semi") {
        // If we're in semi mode, we need to create one.
        return self.createNipple(position, identifier);
      }

      console.warn("Coudln't find the needed nipple.");
      return false;
    }
    // In dynamic, we create a new one.
    nipple = self.createNipple(position, identifier);
    return nipple;
  };

  Collection.prototype.processOnMove = function (evt) {
    const self = this;
    const opts = self.options;
    const identifier = self.manager.getIdentifier(evt);
    const nipple = self.nipples.get(identifier);

    if (!nipple) {
      // This is here just for safety.
      // It shouldn't happen.
      console.error(`Found zombie joystick with ID ${identifier}`);
      self.manager.removeIdentifier(identifier);
      return;
    }

    nipple.identifier = identifier;

    const size = nipple.options.size / 2;
    let pos = {
      x: evt.pageX,
      y: evt.pageY,
    };

    let dist = u.distance(pos, nipple.position);
    const angle = u.angle(pos, nipple.position);
    const rAngle = u.radians(angle);
    const force = dist / size;

    // If distance is bigger than nipple's size
    // we clamp the position.
    if (dist > size) {
      dist = size;
      pos = u.findCoord(nipple.position, dist, angle);
    }

    let xPosition = pos.x - nipple.position.x;
    let yPosition = pos.y - nipple.position.y;

    if (opts.lockX) {
      yPosition = 0;
    }
    if (opts.lockY) {
      xPosition = 0;
    }

    nipple.frontPosition = {
      x: xPosition,
      y: yPosition,
    };

    if (!opts.dataOnly) {
      u.applyPosition(nipple.ui.front, nipple.frontPosition);
    }

    // Prepare event's datas.
    let toSend = {
      identifier: nipple.identifier,
      position: pos,
      force,
      pressure: evt.force || evt.pressure || evt.webkitForce || 0,
      distance: dist,
      angle: {
        radian: rAngle,
        degree: angle,
      },
      instance: nipple,
      lockX: opts.lockX,
      lockY: opts.lockY,
    };

    // Compute the direction's datas.
    toSend = nipple.computeDirection(toSend);

    // Offset angles to follow units circle.
    toSend.angle = {
      radian: u.radians(180 - angle),
      degree: 180 - angle,
    };

    // Send everything to everyone.
    nipple.trigger("move", toSend);
    self.trigger(`move ${nipple.id}:move`, toSend);
  };

  Collection.prototype.processOnEnd = function (evt) {
    const self = this;
    const opts = self.options;
    const identifier = self.manager.getIdentifier(evt);
    const nipple = self.nipples.get(identifier);
    const removedIdentifier = self.manager.removeIdentifier(nipple.identifier);

    if (!nipple) {
      return;
    }

    if (!opts.dataOnly) {
      nipple.hide(() => {
        if (opts.mode === "dynamic") {
          nipple.trigger("removed", nipple);
          self.trigger(`removed ${nipple.id}:removed`, nipple);
          self.manager.trigger(`removed ${nipple.id}:removed`, nipple);
          nipple.destroy();
        }
      });
    }

    // Clear the pressure interval reader
    clearInterval(self.pressureIntervals[nipple.identifier]);

    // Reset the direciton of the nipple, to be able to trigger a new direction
    // on start.
    nipple.resetDirection();

    nipple.trigger("end", nipple);
    self.trigger(`end ${nipple.id}:end`, nipple);

    // Remove identifier from our bank.
    if (self.ids.indexOf(nipple.identifier) >= 0) {
      self.ids.splice(self.ids.indexOf(nipple.identifier), 1);
    }

    // Clean our actives array.
    if (self.actives.indexOf(nipple) >= 0) {
      self.actives.splice(self.actives.indexOf(nipple), 1);
    }

    if (/(semi|static)/.test(opts.mode)) {
      // Transfer nipple from actives to idles
      // if we're in semi or static mode.
      self.idles.push(nipple);
    } else if (self.nipples.indexOf(nipple) >= 0) {
      // Only if we're not in semi or static mode
      // we can remove the instance.
      self.nipples.splice(self.nipples.indexOf(nipple), 1);
    }

    // We unbind move and end.
    self.manager.unbindDocument();

    // We add back the identifier of the idle nipple;
    if (/(semi|static)/.test(opts.mode)) {
      self.manager.ids[removedIdentifier.id] = removedIdentifier.identifier;
    }
  };

  // Remove destroyed nipple from the lists
  Collection.prototype.onDestroyed = function (evt, nipple) {
    const self = this;
    if (self.nipples.indexOf(nipple) >= 0) {
      self.nipples.splice(self.nipples.indexOf(nipple), 1);
    }
    if (self.actives.indexOf(nipple) >= 0) {
      self.actives.splice(self.actives.indexOf(nipple), 1);
    }
    if (self.idles.indexOf(nipple) >= 0) {
      self.idles.splice(self.idles.indexOf(nipple), 1);
    }
    if (self.ids.indexOf(nipple.identifier) >= 0) {
      self.ids.splice(self.ids.indexOf(nipple.identifier), 1);
    }

    // Remove the identifier from our bank
    self.manager.removeIdentifier(nipple.identifier);

    // We unbind move and end.
    self.manager.unbindDocument();
  };

  // Cleanly destroy the manager
  Collection.prototype.destroy = function () {
    const self = this;
    self.unbindEvt(self.options.zone, "start");

    // Destroy nipples.
    self.nipples.forEach((nipple) => {
      nipple.destroy();
    });

    // Clean 3DTouch intervals.
    for (const i in self.pressureIntervals) {
      if (self.pressureIntervals.hasOwnProperty(i)) {
        clearInterval(self.pressureIntervals[i]);
      }
    }

    // Notify the manager passing the instance
    self.trigger("destroyed", self.nipples);
    // We unbind move and end.
    self.manager.unbindDocument();
    // Unbind everything.
    self.off();
  };

  /* global u, Super, Collection */

  ///////////////////////
  ///     MANAGER     ///
  ///////////////////////

  function Manager(options) {
    const self = this;
    self.ids = {};
    self.index = 0;
    self.collections = [];

    self.config(options);
    self.prepareCollections();

    // Listen for resize, to reposition every joysticks
    let resizeTimer;
    u.bindEvt(window, "resize", (evt) => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        let pos;
        const scroll = u.getScroll();
        self.collections.forEach((collection) => {
          collection.forEach((nipple) => {
            pos = nipple.el.getBoundingClientRect();
            nipple.position = {
              x: scroll.x + pos.left,
              y: scroll.y + pos.top,
            };
          });
        });
      }, 100);
    });

    return self.collections;
  }

  Manager.prototype = new Super();
  Manager.constructor = Manager;

  Manager.prototype.prepareCollections = function () {
    const self = this;
    // Public API Preparation.
    self.collections.create = self.create.bind(self);
    // Listen to anything
    self.collections.on = self.on.bind(self);
    // Unbind general events
    self.collections.off = self.off.bind(self);
    // Destroy everything
    self.collections.destroy = self.destroy.bind(self);
    // Get any nipple
    self.collections.get = (id) => {
      let nipple;
      self.collections.every((collection) => {
        if ((nipple = collection.get(id))) {
          return false;
        }
        return true;
      });
      return nipple;
    };
  };

  Manager.prototype.create = function (options) {
    return this.createCollection(options);
  };

  // Collection Factory
  Manager.prototype.createCollection = function (options) {
    const self = this;
    const collection = new Collection(self, options);

    self.bindCollection(collection);
    self.collections.push(collection);

    return collection;
  };

  Manager.prototype.bindCollection = function (collection) {
    const self = this;
    let type;
    // Bubble up identified events.
    const handler = (evt, data) => {
      // Identify the event type with the nipple's identifier.
      type = `${evt.type} ${data.id}:${evt.type}`;
      self.trigger(type, data);
    };

    // When it gets destroyed we clean.
    collection.on("destroyed", self.onDestroyed.bind(self));

    // Other events that will get bubbled up.
    collection.on("shown hidden rested dir plain", handler);
    collection.on("dir:up dir:right dir:down dir:left", handler);
    collection.on("plain:up plain:right plain:down plain:left", handler);
  };

  Manager.prototype.bindDocument = function () {
    const self = this;
    // Bind only if not already binded
    if (!self.binded) {
      self.bindEvt(document, "move").bindEvt(document, "end");
      self.binded = true;
    }
  };

  Manager.prototype.unbindDocument = function (force) {
    const self = this;
    // If there are no touch left
    // unbind the document.
    if (!Object.keys(self.ids).length || force === true) {
      self.unbindEvt(document, "move").unbindEvt(document, "end");
      self.binded = false;
    }
  };

  Manager.prototype.getIdentifier = function (evt) {
    let id;
    // If no event, simple increment
    if (!evt) {
      id = this.index;
    } else {
      // Extract identifier from event object.
      // Unavailable in mouse events so replaced by latest increment.
      id = evt.identifier === undefined ? evt.pointerId : evt.identifier;
      if (id === undefined) {
        id = this.latest || 0;
      }
    }

    if (this.ids[id] === undefined) {
      this.ids[id] = this.index;
      this.index += 1;
    }

    // Keep the latest id used in case we're using an unidentified mouseEvent
    this.latest = id;
    return this.ids[id];
  };

  Manager.prototype.removeIdentifier = function (identifier) {
    const removed = {};
    for (const id in this.ids) {
      if (this.ids[id] === identifier) {
        removed.id = id;
        removed.identifier = this.ids[id];
        delete this.ids[id];
        break;
      }
    }
    return removed;
  };

  Manager.prototype.onmove = function (evt) {
    const self = this;
    self.onAny("move", evt);
    return false;
  };

  Manager.prototype.onend = function (evt) {
    const self = this;
    self.onAny("end", evt);
    return false;
  };

  Manager.prototype.oncancel = function (evt) {
    const self = this;
    self.onAny("end", evt);
    return false;
  };

  Manager.prototype.onAny = function (which, evt) {
    const self = this;
    let id;
    const processFn = `processOn${which.charAt(0).toUpperCase()}${which.slice(
      1
    )}`;
    evt = u.prepareEvent(evt);
    const processColl = (e, id, coll) => {
      if (coll.ids.indexOf(id) >= 0) {
        coll[processFn](e);
        // Mark the event to avoid cleaning it later.
        e._found_ = true;
      }
    };
    const processEvt = (e) => {
      id = self.getIdentifier(e);
      u.map(self.collections, processColl.bind(null, e, id));
      // If the event isn't handled by any collection,
      // we need to clean its identifier.
      if (!e._found_) {
        self.removeIdentifier(id);
      }
    };

    u.map(evt, processEvt);

    return false;
  };

  // Cleanly destroy the manager
  Manager.prototype.destroy = function () {
    const self = this;
    self.unbindDocument(true);
    self.ids = {};
    self.index = 0;
    self.collections.forEach((collection) => {
      collection.destroy();
    });
    self.off();
  };

  // When a collection gets destroyed
  // we clean behind.
  Manager.prototype.onDestroyed = function (evt, coll) {
    const self = this;
    if (self.collections.indexOf(coll) < 0) {
      return false;
    }
    self.collections.splice(self.collections.indexOf(coll), 1);
  };

  const factory = new Manager();
  return {
    create(options) {
      return factory.create(options);
    },
    factory,
  };
});
