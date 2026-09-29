var e = {
    LevelsControls(exports) {
      const MouseHandler = require("MouseHandler").MouseHandler,
        CELL_SIZE = require("ChunkConsts").CELL_SIZE;
      exports.LevelsControls = class {
        mouseHandler;
        mousePosPrev;
        mousePressedPrev;
        wheelDelta;
        game;
        constructor(e, t) {
          ((this.game = t),
            (this.mouseHandler = new MouseHandler(
              e,
              () => {},
              () => {},
              this.wheelCallback,
            )),
            (this.mousePosPrev = [0, 0]),
            (this.mousePressedPrev = false),
            (this.wheelDelta = 0));
        }
        update() {
          const e = this.mouseHandler.getMousePosition();
          if (0 !== this.wheelDelta) {
            let t = this.game.scale * (1 - 0.001 * this.wheelDelta);
            ((t = Math.max(20, Math.min(t, 128))), this.game.setScale(t, e), (this.wheelDelta = 0));
          }
          const t =
              (e[0] * window.devicePixelRatio) / this.game.scale - this.game.offset[0] / CELL_SIZE,
            s =
              (e[1] * window.devicePixelRatio) / this.game.scale - this.game.offset[1] / CELL_SIZE,
            i = Math.floor(t),
            a = Math.floor(s);
          ((this.game.mousePosition = [i, a]),
            this.mouseHandler.getWheelPressed()
              ? (this.moveCamera(e[0], e[1]), (this.game.screenUpdated = true))
              : this.mouseHandler.getMousePressed()
                ? (this.mousePressedPrev || (this.mousePosPrev = e),
                  this.moveCamera(e[0], e[1]),
                  (this.game.screenUpdated = true),
                  (this.mousePressedPrev = true))
                : (this.mousePressedPrev = false),
            (this.mousePosPrev = e));
        }
        dispose() {
          this.mouseHandler.dispose();
        }
        moveCamera(e, t) {
          ((this.game.offset[0] +=
            (((e - this.mousePosPrev[0]) * CELL_SIZE) / this.game.scale) * window.devicePixelRatio),
            (this.game.offset[1] +=
              (((t - this.mousePosPrev[1]) * CELL_SIZE) / this.game.scale) *
              window.devicePixelRatio));
        }
        wheelCallback = (e) => {
          this.wheelDelta += e;
        };
      };
    },
    ChunkConsts(exports) {
      ((exports.CELL_SIZE = 256),
        (exports.CHUNK_SIZE = 16),
        (exports.CHUNK_AREA = exports.CHUNK_SIZE * exports.CHUNK_SIZE));
    },
    LevelInfo(exports) {
      exports.LevelInfo = class {
        id;
        state;
        nextLevels;
        previousLevels;
        stateCallback;
        constructor(e, t) {
          ((this.id = e),
            (this.state = "locked"),
            (this.nextLevels = t),
            (this.previousLevels = []),
            (this.stateCallback = undefined));
        }
        setState(e) {
          return (
            (this.state = e),
            undefined !== this.stateCallback && this.stateCallback(e),
            this
          );
        }
        setCallback(e) {
          this.stateCallback = e;
        }
      };
    },
    UILevelPlayButton(exports) {
      const UIComponent = require("UIComponent").UIComponent;
      class o extends UIComponent {
        constructor(e, t) {
          super(e);
          const s = document.createElement("img");
          ((s.src = "res/icons/level-play-button.svg"),
            (s.className = "level-play-button"),
            this.element.appendChild(s),
            this.element.addEventListener("click", t),
            (this.element.onmousedown = (e) => {
              (e.preventDefault(), e.stopPropagation());
            }),
            (this.element.ontouchstart = (e) => {
              (t(), e.preventDefault(), e.stopPropagation());
            }),
            (this.element.ontouchend = (e) => e.stopPropagation()),
            (this.element.ondragstart = () => false));
        }
        getClass() {
          return "ui-level-play-button";
        }
      }
      exports.UILevelPlayButton = o;
    },
    RenderTexture(exports) {
      exports.RenderTexture = class {
        width;
        height;
        filtering;
        hdr;
        hasMipmaps;
        texture;
        framebuffer;
        gl;
        mipmapLevels = 0;
        constructor(e, t, s, i = {}) {
          const {
            filtering: o = "linear",
            hdr: a = false,
            mipmaps: n = false,
            mipmapLevels: r,
          } = i;
          ((this.gl = e),
            (this.width = Math.round(t)),
            (this.height = Math.round(s)),
            (this.filtering = o),
            (this.hdr = a),
            (this.hasMipmaps = n),
            n && this.setMipmapLevels(r),
            (this.texture = this.createTexture()),
            (this.framebuffer = this.createFramebuffer()));
        }
        generateMipmaps() {
          this.hasMipmaps &&
            (this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture),
            this.gl.generateMipmap(this.gl.TEXTURE_2D),
            this.gl.bindTexture(this.gl.TEXTURE_2D, null));
        }
        dispose() {
          (this.gl.deleteTexture(this.texture), this.gl.deleteFramebuffer(this.framebuffer));
        }
        createTexture() {
          const e = this.gl.createTexture(),
            t = this.hdr ? this.gl.RGBA16F : this.gl.RGBA8,
            s = this.hdr ? this.gl.FLOAT : this.gl.UNSIGNED_BYTE;
          return (
            this.gl.bindTexture(this.gl.TEXTURE_2D, e),
            this.gl.texImage2D(
              this.gl.TEXTURE_2D,
              0,
              t,
              this.width,
              this.height,
              0,
              this.gl.RGBA,
              s,
              null,
            ),
            this.gl.texParameteri(
              this.gl.TEXTURE_2D,
              this.gl.TEXTURE_MIN_FILTER,
              this.getMinFiltering(),
            ),
            this.gl.texParameteri(
              this.gl.TEXTURE_2D,
              this.gl.TEXTURE_MAG_FILTER,
              this.getMagFiltering(),
            ),
            this.gl.texParameteri(
              this.gl.TEXTURE_2D,
              this.gl.TEXTURE_WRAP_S,
              this.gl.CLAMP_TO_EDGE,
            ),
            this.gl.texParameteri(
              this.gl.TEXTURE_2D,
              this.gl.TEXTURE_WRAP_T,
              this.gl.CLAMP_TO_EDGE,
            ),
            this.hasMipmaps &&
              (this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_MAX_LEVEL,
                this.mipmapLevels - 1,
              ),
              this.gl.generateMipmap(this.gl.TEXTURE_2D)),
            this.gl.bindTexture(this.gl.TEXTURE_2D, null),
            e
          );
        }
        createFramebuffer() {
          const e = this.gl.createFramebuffer();
          return (
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, e),
            this.gl.framebufferTexture2D(
              this.gl.FRAMEBUFFER,
              this.gl.COLOR_ATTACHMENT0,
              this.gl.TEXTURE_2D,
              this.texture,
              0,
            ),
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null),
            e
          );
        }
        setMipmapLevels(e) {
          const t = Math.floor(Math.log2(Math.max(this.width, this.height))) + 1;
          this.mipmapLevels = undefined === e ? t : Math.min(e, t);
        }
        getMinFiltering() {
          const e = this.gl;
          return this.hasMipmaps
            ? "nearest" === this.filtering
              ? e.NEAREST_MIPMAP_LINEAR
              : e.LINEAR_MIPMAP_LINEAR
            : "nearest" === this.filtering
              ? e.NEAREST
              : e.LINEAR;
        }
        getMagFiltering() {
          const e = this.gl;
          return "nearest" === this.filtering ? e.NEAREST : e.LINEAR;
        }
      };
    },
    UIArrowInfo(exports) {
      const ArrowDescriptions = require("ArrowDescriptions").ArrowDescriptions,
        GameText = require("GameText").GameText,
        UIComponent = require("UIComponent").UIComponent;
      class n extends UIComponent {
        constructor(e, t) {
          super(e);
          const s = document.createElement("div");
          ((s.className = "ui-arrow-left-div"), this.element.appendChild(s));
          const a = document.createElement("img");
          ((a.src = `res/sprites/arrow${t}.png?v=${window.gameVersion}`),
            (a.className = "ui-arrow-info-image"),
            s.appendChild(a));
          const n = document.createElement("div");
          ((n.className = "ui-arrow-info-div"), this.element.appendChild(n));
          const r = document.createElement("div");
          ((r.className = "ui-arrow-info-name"),
            (r.innerText = ArrowDescriptions.getArrowName(t)),
            n.appendChild(r));
          const l = document.createElement("div");
          ((l.className = "ui-arrow-info-text-title"),
            (l.innerText = GameText.ACTIVATES.get()),
            n.appendChild(l));
          const h = document.createElement("div");
          h.className = "ui-arrow-info-text";
          const c = /(#(\w)(\(.+?\)))|@(\w+)/gm;
          let d = ArrowDescriptions.getArrowActivation(t);
          ((d = d.replace(c, this.replaceInlineColors)), (h.innerHTML = d), n.appendChild(h));
          const u = document.createElement("div");
          ((u.className = "ui-arrow-info-text-title"),
            (u.innerText = GameText.ON_ACTIVATION.get()),
            n.appendChild(u));
          const g = document.createElement("div");
          g.className = "ui-arrow-info-text";
          let m = ArrowDescriptions.getArrowAction(t);
          ((m = m.replace(c, this.replaceInlineColors)), (g.innerHTML = m), n.appendChild(g));
        }
        getClass() {
          return "ui-arrow-info";
        }
        replaceInlineColors = (e) => {
          const t = e.match(/#\w/);
          if (null === t || 0 === t.length) return "";
          const s = t[0].at(1);
          if (undefined === s) return "";
          let i = "#000";
          "r" === s ? (i = "#f00") : "b" === s && (i = "#00f");
          const o = e.match(/\((.+)\)/);
          return null === o || 0 === o.length ? "" : `<span style="color:${i};">${o[1]}</span>`;
        };
      }
      exports.UIArrowInfo = n;
    },
    UIControlsHint(exports) {
      const ControlsHintsText = require("ControlsHintsText").ControlsHintsText,
        UIComponent = require("UIComponent").UIComponent;
      class a extends UIComponent {
        hint;
        rights;
        state;
        constructor(e, t) {
          (super(e),
            (this.state = "none"),
            (this.rights = t),
            (this.hint = document.createElement("div")),
            this.element.appendChild(this.hint));
        }
        updateRights(e) {
          ((this.rights = e),
            "free" === this.state
              ? this.showFreeCursorHint()
              : "arrow" === this.state
                ? this.showArrowCursorHint()
                : "selected" === this.state && this.showSelectedHint());
        }
        setState(e) {
          this.state !== e &&
            ((this.state = e),
            "none" === this.state
              ? this.hide()
              : "free" === this.state
                ? this.showFreeCursorHint()
                : "arrow" === this.state
                  ? this.showArrowCursorHint()
                  : "selected" === this.state && this.showSelectedHint());
        }
        showFreeCursorHint() {
          this.hide();
          let e = "";
          (this.rights.canMove &&
            (e += `<p><img class="inline-icon-blue" src="res/icons/icon_mouse_left.svg"> ${ControlsHintsText.MOVE.get()}</p>`),
            this.rights.canRotate && (e += `<p>#W #A #S #D ${ControlsHintsText.ROTATE.get()}</p>`),
            this.rights.canDelete && (e += `<p>#R ${ControlsHintsText.DELETE.get()}</p>`),
            this.rights.canSelect && (e += `<p>#E ${ControlsHintsText.SELECT.get()}</p>`),
            this.rights.canUndo && (e += `<p>#Z ${ControlsHintsText.UNDO.get()}</p>`),
            this.rights.canPause && (e += `<p>#(Space) ${ControlsHintsText.PAUSE.get()}</p>`),
            this.rights.canOpenMenu && (e += `<p>#Esc ${ControlsHintsText.MENU.get()}</p>`),
            (e = e.replace(/(#(\w+))|(#\(.+?\))/gm, this.replaceInlineKeys)),
            (this.hint.innerHTML += e));
        }
        showArrowCursorHint() {
          this.hide();
          let e = "";
          (this.rights.canSetArrows &&
            (e += `<p><img class="inline-icon-blue" src="res/icons/icon_mouse_left.svg"> ${ControlsHintsText.SET_ARROW.get()}</p>`),
            this.rights.canMove &&
              (e += `<p><img class="inline-icon-blue" src="res/icons/icon_mouse_middle.svg"> ${ControlsHintsText.MOVE.get()}</p>`),
            this.rights.canRotate && (e += `<p>#W #A #S #D ${ControlsHintsText.ROTATE.get()}</p>`),
            this.rights.canFlip && (e += `<p>#F ${ControlsHintsText.FLIP.get()}</p>`),
            this.rights.canPick && (e += `<p>#Q ${ControlsHintsText.PICK.get()}</p>`),
            this.rights.arrowGroups.length > 1 &&
              (e += `<p>#Tab ${ControlsHintsText.INVENTORY.get()}</p>`),
            (e += `<p>#(~) ${ControlsHintsText.FREE_CURSOR.get()}</p>`),
            (e = e.replace(/(#(\w+))|(#\(.+?\))/gm, this.replaceInlineKeys)),
            (this.hint.innerHTML += e));
        }
        showSelectedHint() {
          this.hide();
          let e = "";
          (this.rights.canCopy && (e += `<p>#C ${ControlsHintsText.COPY.get()}</p>`),
            this.rights.canPaste && (e += `<p>#V ${ControlsHintsText.PASTE.get()}</p>`),
            this.rights.canCopy &&
              this.rights.canDelete &&
              (e += `<p>#X ${ControlsHintsText.CUT.get()}</p>`),
            this.rights.canDelete &&
              (e += `<p>#(⌫) ${ControlsHintsText.DELETE_SELECTION.get()}</p>`),
            this.rights.canSelect &&
              (e += `<p>#E ${ControlsHintsText.SELECT_OR_DESELECT.get()}</p>`),
            this.rights.canSelect &&
              (e += `<p>#(Shift + E) ${ControlsHintsText.ADD_SELECTION.get()}</p>`),
            this.rights.canSelect &&
              (e += `<p>#(Ctrl + E) ${ControlsHintsText.REMOVE_SELECTION.get()}</p>`),
            (e = e.replace(/(#(\w+))|(#\(.+?\))/gm, this.replaceInlineKeys)),
            (this.hint.innerHTML += e));
        }
        hide() {
          (this.hint.remove(),
            (this.hint = document.createElement("div")),
            this.element.appendChild(this.hint));
        }
        getClass() {
          return "ui-controls-hint";
        }
        replaceInlineKeys = (e) =>
          `<span class="inline-key-blue">${(e = e.replace("#", "").replace("(", "").replace(")", ""))}</span>`;
      }
      exports.UIControlsHint = a;
    },
    AccountPage(exports) {
      const GameText = require("GameText").GameText,
        PlayerState = require("PlayerState").PlayerState,
        Backend = require("Backend").Backend,
        Page = require("Page").Page;
      class r extends Page {
        constructor(e) {
          super(e);
          const t = document.createElement("div");
          ((t.className = "account-user-name-title"),
            (t.innerText = PlayerState.userName),
            this.mainDiv.appendChild(t));
          const s = document.createElement("div");
          ((s.className = "logout-button"),
            (s.innerText = GameText.LOGOUT.get()),
            (s.onclick = () => Backend.logout()),
            this.mainDiv.appendChild(s));
        }
        getClass() {
          return "account-page";
        }
      }
      exports.AccountPage = r;
    },
    MouseHandler(exports) {
      exports.MouseHandler = class {
        leftClickCallback;
        rightClickCallback;
        wheelAction;
        twoFingerCallback;
        rotateCallback;
        multitouchPanCallback;
        mouseX;
        mouseY;
        mousePressed;
        wheelPressed;
        isUiInteraction = false;
        touches = new Map();
        lastTouchDistance = 0;
        lastTouchAngle = 0;
        lastTouchCenterX = 0;
        lastTouchCenterY = 0;
        touchStartTime = 0;
        isMultitouch = false;
        startedAsMultitouch = false;
        longPressTimer = null;
        longPressStartX = 0;
        longPressStartY = 0;
        longPressCallback;
        longPressDuration = 500;
        longPressMoveThreshold = 10;
        lastPanDeltaX = 0;
        lastPanDeltaY = 0;
        lastZoomScale = 1;
        rect;
        constructor(e, t, s, i, o, a, n, r) {
          ((this.leftClickCallback = t),
            (this.rightClickCallback = s),
            (this.wheelAction = i),
            (this.twoFingerCallback = o),
            (this.rotateCallback = a),
            (this.multitouchPanCallback = n),
            (this.longPressCallback = r),
            (this.mouseX = 0),
            (this.mouseY = 0),
            (this.mousePressed = false),
            (this.wheelPressed = false),
            (this.rect = e.getBoundingClientRect()),
            document.addEventListener("mousemove", this.mouseMove),
            document.addEventListener("mousedown", this.mouseDown),
            document.addEventListener("mouseup", this.mouseUp),
            document.addEventListener("wheel", this.wheel),
            document.addEventListener("touchmove", this.touchMove, {
              passive: false,
            }),
            document.addEventListener("touchstart", this.touchStart, {
              passive: false,
            }),
            document.addEventListener("touchend", this.touchEnd, {
              passive: false,
            }),
            document.addEventListener("click", this.leftClick),
            document.addEventListener("contextmenu", this.rightClick));
        }
        dispose() {
          (this.clearLongPressTimer(),
            document.removeEventListener("mousemove", this.mouseMove),
            document.removeEventListener("mousedown", this.mouseDown),
            document.removeEventListener("mouseup", this.mouseUp),
            document.removeEventListener("wheel", this.wheel),
            document.removeEventListener("touchmove", this.touchMove),
            document.removeEventListener("touchstart", this.touchStart),
            document.removeEventListener("touchend", this.touchEnd),
            document.removeEventListener("click", this.leftClick),
            document.removeEventListener("contextmenu", this.rightClick));
        }
        resize(e) {
          ((this.rect.x = e.x),
            (this.rect.y = e.y),
            (this.rect.width = e.width),
            (this.rect.height = e.height));
        }
        getMousePosition() {
          return [this.mouseX, this.mouseY];
        }
        getMousePositionNormalized() {
          return [
            ((this.mouseX / this.rect.width) * 2 - 1) * (this.rect.width / this.rect.height),
            (-this.mouseY / this.rect.height) * 2 + 1,
          ];
        }
        getMousePressed() {
          return (this.mousePressed || this.isMultitouch) && !this.isUiInteraction;
        }
        getWheelPressed() {
          return this.wheelPressed;
        }
        setUiInteraction(e) {
          this.isUiInteraction = e;
        }
        getTouchCount() {
          return this.touches.size;
        }
        getIsMultitouch() {
          return this.isMultitouch;
        }
        getLastPanDelta() {
          return [this.lastPanDeltaX, this.lastPanDeltaY];
        }
        getLastZoomScale() {
          return this.lastZoomScale;
        }
        clearLastDeltas() {
          ((this.lastPanDeltaX = 0), (this.lastPanDeltaY = 0), (this.lastZoomScale = 1));
        }
        clearLongPressTimer() {
          null !== this.longPressTimer &&
            (window.clearTimeout(this.longPressTimer), (this.longPressTimer = null));
        }
        startLongPressTimer(e, t) {
          (this.clearLongPressTimer(),
            (this.longPressStartX = e),
            (this.longPressStartY = t),
            (this.longPressTimer = window.setTimeout(() => {
              (this.longPressCallback && this.longPressCallback(), (this.longPressTimer = null));
            }, this.longPressDuration)));
        }
        getTouchDistance(e, t) {
          const s = e.clientX - t.clientX,
            i = e.clientY - t.clientY;
          return Math.sqrt(s * s + i * i);
        }
        getTouchAngle(e, t) {
          const s = t.clientX - e.clientX,
            i = t.clientY - e.clientY;
          return Math.atan2(i, s);
        }
        getTouchCenter(e, t) {
          return [
            (e.clientX + t.clientX) / 2 - this.rect.x,
            (e.clientY + t.clientY) / 2 - this.rect.y,
          ];
        }
        mouseMove = (e) => {
          ((this.mouseX = e.clientX - this.rect.x), (this.mouseY = e.clientY - this.rect.y));
        };
        mouseDown = (e) => {
          this.isUiInteraction ||
            (0 === e.button && (this.mousePressed = true),
            1 === e.button && (e.preventDefault(), (this.wheelPressed = true)));
        };
        mouseUp = (e) => {
          this.isUiInteraction ||
            (0 === e.button && (this.mousePressed = false),
            1 === e.button && (e.preventDefault(), (this.wheelPressed = false)));
        };
        wheel = (e) => {
          (this.wheelAction(e.deltaY),
            (this.mouseX = e.clientX - this.rect.x),
            (this.mouseY = e.clientY - this.rect.y));
        };
        leftClick = (e) => {
          this.leftClickCallback();
        };
        rightClick = (e) => {
          this.rightClickCallback();
        };
        touchMove = (e) => {
          if ((e.preventDefault(), !this.isUiInteraction)) {
            for (let t = 0; t < e.touches.length; t++) {
              const s = e.touches[t];
              this.touches.set(s.identifier, s);
            }
            if (1 === e.touches.length) {
              const t = e.touches[0],
                s = t.clientX - this.rect.x,
                i = t.clientY - this.rect.y;
              if (null !== this.longPressTimer) {
                const e = s - this.longPressStartX,
                  t = i - this.longPressStartY;
                Math.sqrt(e * e + t * t) > this.longPressMoveThreshold &&
                  this.clearLongPressTimer();
              }
              (this.startedAsMultitouch
                ? ((this.lastPanDeltaX = 0), (this.lastPanDeltaY = 0))
                : ((this.lastPanDeltaX = s - this.mouseX), (this.lastPanDeltaY = i - this.mouseY)),
                (this.mouseX = s),
                (this.mouseY = i));
            } else if (2 === e.touches.length) {
              const t = e.touches[0],
                s = e.touches[1],
                i = this.getTouchDistance(t, s),
                o = this.getTouchAngle(t, s),
                [a, n] = this.getTouchCenter(t, s);
              if (this.lastTouchDistance > 0 && this.twoFingerCallback) {
                const e = i / this.lastTouchDistance,
                  t = a - this.lastTouchCenterX,
                  s = n - this.lastTouchCenterY;
                ((this.lastPanDeltaX = t),
                  (this.lastPanDeltaY = s),
                  (this.lastZoomScale = e),
                  (Math.abs(e - 1) > 0.01 || Math.abs(t) > 1 || Math.abs(s) > 1) &&
                    this.twoFingerCallback(e, t, s, a, n));
                const r = o - this.lastTouchAngle;
                this.rotateCallback && Math.abs(r) > 0.02 && this.rotateCallback(r, a, n);
              }
              ((this.mouseX = a),
                (this.mouseY = n),
                (this.lastTouchDistance = i),
                (this.lastTouchAngle = o),
                (this.lastTouchCenterX = a),
                (this.lastTouchCenterY = n));
            } else if (e.touches.length > 2 && this.multitouchPanCallback) {
              const t = e.touches[0],
                s = t.clientX - this.rect.x,
                i = t.clientY - this.rect.y,
                o = s - this.mouseX,
                a = i - this.mouseY;
              ((this.lastPanDeltaX = o),
                (this.lastPanDeltaY = a),
                (Math.abs(o) > 1 || Math.abs(a) > 1) && this.multitouchPanCallback(o, a),
                (this.mouseX = s),
                (this.mouseY = i));
            }
          }
        };
        touchStart = (e) => {
          if (!this.isUiInteraction) {
            ((this.touchStartTime = Date.now()), this.clearLastDeltas());
            for (let t = 0; t < e.touches.length; t++) {
              const s = e.touches[t];
              this.touches.set(s.identifier, s);
            }
            if (1 === e.touches.length) {
              ((this.mousePressed = true),
                (this.isMultitouch = false),
                (this.startedAsMultitouch = false));
              const t = e.touches[0];
              ((this.mouseX = t.clientX - this.rect.x),
                (this.mouseY = t.clientY - this.rect.y),
                this.startLongPressTimer(this.mouseX, this.mouseY));
            } else if (2 === e.touches.length) {
              (this.clearLongPressTimer(),
                (this.mousePressed = false),
                (this.isMultitouch = true),
                (this.startedAsMultitouch = true));
              const t = e.touches[0],
                s = e.touches[1];
              ((this.lastTouchDistance = this.getTouchDistance(t, s)),
                (this.lastTouchAngle = this.getTouchAngle(t, s)));
              const [i, o] = this.getTouchCenter(t, s);
              ((this.mouseX = i),
                (this.mouseY = o),
                (this.lastTouchCenterX = i),
                (this.lastTouchCenterY = o));
            } else {
              (this.clearLongPressTimer(),
                (this.mousePressed = false),
                (this.isMultitouch = true),
                (this.startedAsMultitouch = true));
              const t = e.touches[0];
              ((this.mouseX = t.clientX - this.rect.x), (this.mouseY = t.clientY - this.rect.y));
            }
          }
        };
        touchEnd = (e) => {
          if (this.isUiInteraction) return;
          this.clearLongPressTimer();
          const t = new Set();
          for (let s = 0; s < e.touches.length; s++) t.add(e.touches[s].identifier);
          for (const e of this.touches.keys()) t.has(e) || this.touches.delete(e);
          if (0 === e.touches.length) {
            const e = !this.startedAsMultitouch;
            ((this.mousePressed = false),
              (this.isMultitouch = false),
              (this.startedAsMultitouch = false),
              (this.lastTouchDistance = 0),
              (this.lastTouchAngle = 0),
              (this.lastTouchCenterX = 0),
              (this.lastTouchCenterY = 0),
              Date.now() - this.touchStartTime < 300 &&
                0 === this.touches.size &&
                e &&
                (this.leftClickCallback(), this.clearLastDeltas()));
          } else if (1 === e.touches.length) {
            (this.startedAsMultitouch
              ? ((this.mousePressed = false), (this.isMultitouch = false), this.clearLastDeltas())
              : ((this.mousePressed = true), (this.isMultitouch = false)),
              (this.lastTouchDistance = 0),
              (this.lastTouchAngle = 0));
            const t = e.touches[0];
            ((this.mouseX = t.clientX - this.rect.x), (this.mouseY = t.clientY - this.rect.y));
          } else if (((this.isMultitouch = true), 2 === e.touches.length)) {
            const t = e.touches[0],
              s = e.touches[1];
            ((this.lastTouchDistance = this.getTouchDistance(t, s)),
              (this.lastTouchAngle = this.getTouchAngle(t, s)));
            const [i, o] = this.getTouchCenter(t, s);
            ((this.mouseX = i), (this.mouseY = o));
          }
        };
      };
    },
    UIToolbarArrow(exports) {
      const UIComponent = require("UIComponent").UIComponent;
      class o extends UIComponent {
        type;
        callback;
        constructor(e, t) {
          (super(e), (this.type = t), (this.element.className = this.getClass()));
          const s = document.createElement("img");
          ((s.src = "res/icons/toolbar-arrow.svg"),
            (s.className = "toolbar-arrow-icon"),
            (s.onmousedown = (e) => {
              (e.stopPropagation(), e.preventDefault());
            }),
            (s.ontouchstart = (e) => {
              (e.stopPropagation(), e.preventDefault());
            }),
            this.element.appendChild(s),
            (this.element.onclick = (e) => {
              (e.stopPropagation(),
                e.preventDefault(),
                this.callback && !this.element.classList.contains("disabled") && this.callback());
            }),
            (this.element.ontouchend = (e) => {
              (e.stopPropagation(),
                e.preventDefault(),
                this.callback && !this.element.classList.contains("disabled") && this.callback());
            }));
        }
        setCallback(e) {
          this.callback = e;
        }
        toggle(e) {
          e ? this.element.classList.remove("disabled") : this.element.classList.add("disabled");
        }
        getClass() {
          return `ui-toolbar-arrow-${this.type}`;
        }
      }
      exports.UIToolbarArrow = o;
    },
    UIToolbarController(exports) {
      const PLATFORM = require("PLATFORM").PLATFORM,
        UIComponent = require("UIComponent").UIComponent,
        UIInventory = require("UIInventory").UIInventory,
        UIToolbar = require("UIToolbar").UIToolbar,
        UIToolsToggle = require("UIToolsToggle").UIToolsToggle;
      class l extends UIComponent {
        ITEMS_PER_GROUP = 6;
        arrowGroups;
        currentGroup = 0;
        activeType = -1;
        currentMode = "arrows";
        uiToolbar;
        inventory;
        toolsToggle = null;
        constructor(e, t) {
          (super(document.body),
            (this.arrowGroups = []),
            e.forEach((e) => {
              this.arrowGroups.push(e.slice());
            }));
          const s = document.createElement("div");
          ((s.className = "ui-toolbar-container"),
            this.element.appendChild(s),
            (this.uiToolbar = new UIToolbar(s, 0, t)),
            (this.inventory = new UIInventory(this.element)),
            this.inventory.addArrows(e),
            "mobile" === PLATFORM && (this.toolsToggle = new UIToolsToggle(this.element)));
        }
        getClass() {
          return "ui-toolbar-controller";
        }
        showInventory() {
          this.inventory.show();
        }
        hideInventory() {
          this.inventory.hide();
        }
        toggleInventory() {
          this.inventory.toggle();
        }
        nextGroup() {
          undefined !== this.arrowGroups[this.currentGroup + 1] &&
            (this.currentGroup++,
            this.uiToolbar.setItems(this.currentGroup, this.arrowGroups),
            this.activateItem(this.activeType));
        }
        previousGroup() {
          undefined !== this.arrowGroups[this.currentGroup - 1] &&
            (this.currentGroup--,
            this.uiToolbar.setItems(this.currentGroup, this.arrowGroups),
            this.activateItem(this.activeType));
        }
        getCurrentGroup() {
          return this.arrowGroups[this.currentGroup];
        }
        getCurrentMode() {
          return this.currentMode;
        }
        activateItem(e) {
          "arrows" === this.currentMode || "main" === this.currentMode
            ? ((this.activeType = e),
              this.uiToolbar.activateItem(e),
              this.inventory.updateSelected(e))
            : (this.activeType = -1);
        }
        setSelectCallback(e, t, s) {
          (this.uiToolbar.setSelectCallback((t) => e(t)),
            this.uiToolbar.setArrowsCallback(
              () => this.previousGroup(),
              () => this.nextGroup(),
            ),
            this.uiToolbar.setItems(this.currentGroup, this.arrowGroups),
            this.activateItem(this.activeType),
            this.inventory.setSelectCallback((t) => {
              (this.setGroupByType(t), e(t));
            }),
            null !== this.toolsToggle &&
              this.toolsToggle.setToggleCallback((e) => {
                (t(), "arrows" === e && s && s(), this.handleToggle(e));
              }));
        }
        isMouseCaptured() {
          return (
            !(null === this.toolsToggle || !this.toolsToggle.isMouseCaptured()) ||
            this.uiToolbar.isMouseCaptured()
          );
        }
        remove() {
          (this.inventory.remove(), this.uiToolbar.remove(), super.remove());
        }
        setGroupByType(e) {
          for (let t = 0; t < this.arrowGroups.length; t++)
            if (-1 !== this.arrowGroups[t].indexOf(e)) {
              ((this.currentGroup = t),
                this.uiToolbar.setItems(t, this.arrowGroups),
                this.toolsToggle?.setState("arrows"),
                this.handleToggle("arrows"));
              break;
            }
        }
        switchToToolGroup(e) {
          ((this.currentMode = e),
            this.uiToolbar.setTools(e),
            null !== this.toolsToggle && this.toolsToggle.setState(e));
        }
        disableItems(e) {
          this.uiToolbar.disableItems(e);
        }
        handleToggle(e) {
          if (((this.currentMode = e), "arrows" === e))
            return (
              this.uiToolbar.setItems(this.currentGroup, this.arrowGroups),
              void this.activateItem(this.activeType)
            );
          this.uiToolbar.setTools(e);
        }
      }
      exports.UIToolbarController = l;
    },
    Routes(exports) {
      function s(e) {
        return JSON.stringify(e);
      }
      var i;
      (function (e) {
        function t() {
          const e =
            "localhost" === window.location.hostname ||
            window.location.hostname.startsWith("192.168.")
              ? ":3000"
              : "";
          return `${window.location.protocol}//${window.location.hostname}${e}/api`;
        }
        ((e.getURL = t),
          (e.getMap = function (e, i) {
            const o = `${t()}/map`;
            fetch(o, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: s({
                id: e,
              }),
              credentials: "include",
            }).then((e) => {
              401 !== e.status
                ? e.text().then((e) => {
                    const t = JSON.parse(e);
                    i(t);
                  })
                : (window.location.href = "/login");
            });
          }),
          (e.getMapGuest = function (e, i) {
            const o = `${t()}/mapguest`;
            fetch(o, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: s({
                id: e,
              }),
              credentials: "include",
            }).then((e) => {
              e.text().then((e) => {
                const t = JSON.parse(e);
                i(t);
              });
            });
          }),
          (e.getMaps = function (e) {
            const i = `${t()}/maps`;
            return new Promise((t) => {
              fetch(i, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: s({
                  ids: e,
                }),
                credentials: "include",
              }).then((e) => {
                if (401 === e.status) return ((window.location.href = "/login"), void t([]));
                e.text().then((e) => {
                  const s = JSON.parse(e);
                  t(s);
                });
              });
            });
          }),
          (e.getMapsInfo = function () {
            const e = `${t()}/mapsinfo`;
            return new Promise((t) => {
              fetch(e, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: s({}),
                credentials: "include",
              }).then((e) => {
                if (401 === e.status) return ((window.location.href = "/login"), void t([]));
                e.text().then((e) => {
                  const s = JSON.parse(e);
                  for (let e = 0; e < s.length; e++) s[e].data = "";
                  t(s);
                });
              });
            });
          }),
          (e.saveMap = function (e, i) {
            if (i.length > 2e6) return Promise.resolve(413);
            const o = {
                id: e,
                data: i,
              },
              a = `${t()}/update`;
            return new Promise((e) => {
              fetch(a, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: s(o),
                credentials: "include",
              }).then((t) => {
                (e(t.status), 401 === t.status && (window.location.href = "/login"));
              });
            });
          }),
          (e.saveMapInfo = function (e, i) {
            const o = {
                id: e.id,
                name: e.name,
                tags: e.tags,
                isPublic: e.isPublic,
              },
              a = `${t()}/updateinfo`;
            fetch(a, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: s(o),
              credentials: "include",
            }).then((e) => {
              401 !== e.status
                ? e.text().then(() => {
                    i(e.status);
                  })
                : (window.location.href = "/login");
            });
          }),
          (e.createMap = function (e) {
            const i = `${t()}/create`;
            fetch(i, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: s({}),
              credentials: "include",
            }).then((t) => {
              401 !== t.status
                ? t.text().then((t) => {
                    const s = JSON.parse(t);
                    e(s);
                  })
                : (window.location.href = "/login");
            });
          }),
          (e.deleteMap = function (e, i) {
            const o = {
                id: e,
              },
              a = `${t()}/delete`;
            fetch(a, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: s(o),
              credentials: "include",
            }).then((e) => {
              401 !== e.status
                ? e.text().then(() => {
                    i();
                  })
                : (window.location.href = "/login");
            });
          }),
          (e.checkUser = function (e, i) {
            const o = `${t()}/checkuser`;
            fetch(o, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: s({}),
              credentials: "include",
            }).then((t) => {
              t.json().then((t) => {
                const s = JSON.parse(t);
                null !== s &&
                "null" !== s &&
                "object" == typeof s &&
                "name" in s &&
                "string" == typeof s.name &&
                "" !== s.name
                  ? e(s.name)
                  : i();
              });
            });
          }),
          (e.checkConnection = function () {
            const e = `${t()}/checkuser`;
            return new Promise((t) => {
              fetch(e, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: s({}),
                credentials: "include",
              })
                .then((e) => {
                  200 !== e.status ? t(false) : t(true);
                })
                .catch(() => {
                  t(false);
                });
            });
          }),
          (e.checkNameChange = async function () {
            const e = `${t()}/checknamechange`;
            return new Promise((t) => {
              fetch(e, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: s({}),
                credentials: "include",
              }).then((e) => {
                e.text().then((e) => {
                  t('"false"' !== e);
                });
              });
            });
          }),
          (e.logout = function () {
            const e = `${t()}/logout`;
            fetch(e, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: s({}),
              credentials: "include",
            }).then(() => {
              window.location.reload();
            });
          }),
          (e.setName = function (e) {
            const i = `${t()}/setname`;
            return new Promise((t) => {
              fetch(i, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: s({
                  name: e,
                }),
                credentials: "include",
              }).then((e) => {
                200 !== e.status ? t(false) : t(true);
              });
            });
          }),
          (e.getLevels = function () {
            const e = `${t()}/getlevels`;
            return new Promise((t) => {
              fetch(e, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: s({}),
                credentials: "include",
              }).then((e) => {
                e.json().then((e) => {
                  const s = JSON.parse(e);
                  null !== s && "null" !== s && "object" == typeof s && Array.isArray(s)
                    ? t(s)
                    : t([]);
                });
              });
            });
          }),
          (e.completeLevel = function (e) {
            const i = `${t()}/completelevel`;
            return new Promise((t) => {
              fetch(i, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: s({
                  level: e,
                }),
                credentials: "include",
              }).then(() => {
                t();
              });
            });
          }));
      })(i || (exports.Routes = i = {}));
    },
    MapsPage(exports) {
      const GameText = require("GameText").GameText,
        UIMapsMenuItem = require("UIMapsMenuItem").UIMapsMenuItem,
        UISavedItem = require("UISavedItem").UISavedItem,
        ArrowsDB = require("ArrowsDB").ArrowsDB,
        Backend = require("Backend").Backend,
        Page = require("Page").Page;
      class h extends Page {
        constructor(e, t) {
          (super(t), this.addNewMapButton(this.mainDiv, e), this.loadMaps(this.mainDiv, e));
        }
        getClass() {
          return "maps-page";
        }
        addNewMapButton(e, t) {
          new UIMapsMenuItem(e, GameText.NEW_MAP.get(), () => {
            Backend.createMap((e) => {
              t(e);
            });
          });
        }
        async loadMaps(e, t) {
          const s = await Backend.getMapsInfo(),
            i = [];
          for (let e = 0; e < s.length; e++) {
            const t = s[e];
            i.push(this.getCachedMapData(t.id, t.version));
          }
          const o = await Promise.all(i),
            n = [];
          for (let i = 0; i < s.length; i++) {
            const r = s[i],
              l = o[i];
            undefined !== l ? ((r.data = l), new UISavedItem(e, r, t)) : n.push(r.id);
          }
          const l = await Backend.getMaps(n);
          for (let s = 0; s < l.length; s++) {
            const i = l[s];
            (this.cacheMapData(i), new UISavedItem(e, i, t));
          }
        }
        async getCachedMapData(e, t) {
          const s = await ArrowsDB.read("mapCache", e);
          if (undefined !== s && "data" in s && "version" in s) {
            const e = s.version;
            if ("number" != typeof e) return;
            if (e >= t && undefined !== s.data && "string" == typeof s.data) return s.data;
          }
        }
        async cacheMapData(e) {
          await ArrowsDB.write("mapCache", e);
        }
      }
      exports.MapsPage = h;
    },
    ArrowsDB(exports) {
      var s;
      (function (e) {
        function t(e, t) {
          e.result.objectStoreNames.contains(t) ||
            e.result
              .createObjectStore(t, {
                keyPath: "id",
              })
              .createIndex("id", "id", {
                unique: true,
              });
        }
        function s(e) {
          (t(e, "clipboard"), t(e, "mapCache"));
        }
        ((e.write = async function (e, t) {
          const i = indexedDB.open("arrows", 2);
          ((i.onupgradeneeded = () => s(i)),
            (i.onsuccess = async () => {
              const s = i.result;
              await (async function (e, t, s) {
                const i = e.transaction([t], "readwrite").objectStore(t).put(s);
                return new Promise((e, t) => {
                  ((i.onsuccess = (t) => {
                    const s = t.target;
                    s instanceof IDBRequest && e(s.result);
                  }),
                    (i.onerror = (e) => {
                      t(e);
                    }));
                });
              })(s, e, t);
            }),
            (i.onerror = () => {
              throw new Error("Error opening database");
            }));
        }),
          (e.read = async function (e, t) {
            const i = indexedDB.open("arrows", 2);
            return (
              (i.onupgradeneeded = () => s(i)),
              new Promise((s, o) => {
                ((i.onsuccess = async () => {
                  const o = i.result,
                    a = await (async function (e, t, s) {
                      const i = e.transaction([t], "readwrite").objectStore(t).get(s);
                      return new Promise((e, t) => {
                        ((i.onsuccess = (t) => {
                          const s = t.target;
                          s instanceof IDBRequest && e(s.result);
                        }),
                          (i.onerror = (e) => {
                            t(e);
                          }));
                      });
                    })(o, e, t);
                  s(a);
                }),
                  (i.onerror = (e) => {
                    o(e);
                  }));
              })
            );
          }),
          (e.getAllKeys = async function (e) {
            const t = indexedDB.open("arrows", 2);
            return (
              (t.onupgradeneeded = () => s(t)),
              new Promise((s, i) => {
                ((t.onsuccess = () => {
                  const o = t.result.transaction([e], "readwrite").objectStore(e).getAllKeys();
                  ((o.onsuccess = (e) => {
                    const t = e.target;
                    t instanceof IDBRequest && s(t.result);
                  }),
                    (o.onerror = (e) => {
                      i(e);
                    }));
                }),
                  (t.onerror = (e) => {
                    i(e);
                  }));
              })
            );
          }),
          (e.remove = async function (e, t) {
            const i = indexedDB.open("arrows", 2);
            return (
              (i.onupgradeneeded = () => s(i)),
              new Promise((s, o) => {
                ((i.onsuccess = () => {
                  const a = i.result.transaction([e], "readwrite").objectStore(e).delete(t);
                  ((a.onsuccess = () => {
                    s();
                  }),
                    (a.onerror = (e) => {
                      o(e);
                    }));
                }),
                  (i.onerror = (e) => {
                    o(e);
                  }));
              })
            );
          }));
      })(s || (exports.ArrowsDB = s = {}));
    },
    PlayerUI(exports) {
      const ControlsHintsText = require("ControlsHintsText").ControlsHintsText,
        GameText = require("GameText").GameText,
        UIControlsHint = require("UIControlsHint").UIControlsHint,
        UIMenu = require("UIMenu").UIMenu,
        UIMenuButton = require("UIMenuButton").UIMenuButton,
        UIPauseSign = require("UIPauseSign").UIPauseSign,
        UISpeedController = require("UISpeedController").UISpeedController,
        UIToolbarController = require("UIToolbarController").UIToolbarController,
        UIUndoButton = require("UIUndoButton").UIUndoButton,
        PLATFORM = require("PLATFORM").PLATFORM,
        PlayerAccess = require("PlayerAccess").PlayerAccess,
        PlayerSettings = require("PlayerSettings").PlayerSettings;
      exports.PlayerUI = class {
        toolbarController;
        pauseSign;
        speedController;
        menu;
        menuButton;
        undoButton;
        redoButton;
        autoSaveMessage;
        controlsHint;
        mapInfo;
        game;
        sidePanelScrolling = false;
        fpsDisplay = null;
        constructor(e, t) {
          ((this.game = e),
            (this.mapInfo = t),
            (this.toolbarController = new UIToolbarController([[]], new PlayerAccess())),
            (this.pauseSign = new UIPauseSign(document.body)),
            (this.menu = null),
            (this.menuButton = null),
            (this.undoButton = null),
            (this.redoButton = null),
            (this.speedController = null),
            (this.controlsHint = null),
            (this.autoSaveMessage = document.createElement("span")),
            (this.autoSaveMessage.className = "ui-text-message"),
            document.body.appendChild(this.autoSaveMessage),
            (this.game.onFPSUpdate = () => this.updateFpsDisplay()));
        }
        updateToolbar(e) {
          (this.toolbarController.remove(),
            (this.toolbarController = new UIToolbarController(e.arrowGroups, e)));
        }
        addSpeedController() {
          this.speedController = new UISpeedController(
            document.body,
            5,
            "mobile" === PLATFORM,
            (e) =>
              ((e) => {
                if ("mobile" === PLATFORM) {
                  if (0 === e) return ControlsHintsText.PAUSE.get();
                  e--;
                }
                return `${(PlayerSettings.framesToUpdate[e] / PlayerSettings.framesToSkip[e]) * 60} ${GameText.PER_SECOND.get()}`;
              })(e),
            (e) =>
              ((e) => {
                if ("mobile" === PLATFORM) {
                  if (0 === e) return "pause";
                  e--;
                }
                return "";
              })(e),
          );
        }
        removeSpeedController() {
          null !== this.speedController &&
            (this.speedController.remove(), (this.speedController = null));
        }
        addMenuButton() {
          if (null === this.game) return;
          const e = this.game;
          null === this.menuButton &&
            (this.menuButton = new UIMenuButton(document.body, () => this.toggleMenu(e)));
        }
        removeMenuButton() {
          null !== this.menuButton && (this.menuButton.remove(), (this.menuButton = null));
        }
        addFpsDisplay() {
          null === this.fpsDisplay &&
            ((this.fpsDisplay = document.createElement("div")),
            (this.fpsDisplay.className = "ui-fps-display"),
            (this.fpsDisplay.innerText = "FPS: 0\nTPS: 0"),
            document.body.appendChild(this.fpsDisplay));
        }
        updateFpsDisplay() {
          null !== this.fpsDisplay &&
            null !== this.game &&
            (this.fpsDisplay.innerText = `FPS: ${this.game.getFPS()}\nTPS: ${this.game.getTPS()}`);
        }
        addUndoButton(e) {
          "mobile" === PLATFORM &&
            null === this.undoButton &&
            (this.undoButton = new UIUndoButton(document.body, e));
        }
        removeUndoButton() {
          null !== this.undoButton && (this.undoButton.remove(), (this.undoButton = null));
        }
        updateUndoButtonState(e) {
          null !== this.undoButton && this.undoButton.setEnabled(e);
        }
        addRedoButton(e) {
          "mobile" === PLATFORM &&
            null === this.redoButton &&
            (this.redoButton = new UIUndoButton(document.body, e, true));
        }
        removeRedoButton() {
          null !== this.redoButton && (this.redoButton.remove(), (this.redoButton = null));
        }
        updateRedoButtonState(e) {
          null !== this.redoButton && this.redoButton.setEnabled(e);
        }
        isMenuOpen() {
          return null !== this.menu && !this.menu.getIsRemoved();
        }
        isMouseCaptured() {
          return (
            !!this.sidePanelScrolling ||
            !(null === this.speedController || !this.speedController.isMouseCaptured()) ||
            !(null === this.menuButton || !this.menuButton.isMouseCaptured()) ||
            !(null === this.undoButton || !this.undoButton.isMouseCaptured()) ||
            !(null === this.redoButton || !this.redoButton.isMouseCaptured()) ||
            this.toolbarController.isMouseCaptured()
          );
        }
        setSidePanelScrolling(e) {
          this.sidePanelScrolling = e;
        }
        toggleMenu(e) {
          undefined !== this.mapInfo &&
            (null === this.menu || this.menu.getIsRemoved()
              ? (this.menu = new UIMenu(document.body, this.mapInfo, e))
              : (this.menu.remove(), (this.menu = null)));
        }
        showAutoSaveMessage(e, t = false) {
          if (
            ((this.autoSaveMessage.innerText = e),
            t
              ? this.autoSaveMessage.classList.add("error")
              : this.autoSaveMessage.classList.remove("error"),
            this.autoSaveMessage.classList.add("active"),
            (this.autoSaveMessage.style.bottom = "10px"),
            null !== this.controlsHint)
          ) {
            const e = this.controlsHint.getRect();
            this.autoSaveMessage.style.left = `${e.left + e.width}px`;
          }
        }
        hideAutoSaveMessage() {
          setTimeout(() => {
            this.autoSaveMessage.classList.remove("active");
          }, 500);
        }
        addControlsHint(e) {
          "mobile" !== PLATFORM && (this.controlsHint = new UIControlsHint(document.body, e));
        }
        setControlsHintState(e) {
          null !== this.controlsHint && this.controlsHint.setState(e);
        }
        updateControlsHintRights(e) {
          null !== this.controlsHint && this.controlsHint.updateRights(e);
        }
        dispose() {
          (this.toolbarController.remove(),
            this.pauseSign.remove(),
            this.speedController?.remove(),
            this.menuButton?.remove(),
            this.undoButton?.remove(),
            this.redoButton?.remove(),
            this.autoSaveMessage.remove(),
            this.controlsHint?.remove(),
            this.fpsDisplay?.remove(),
            null !== this.menu && this.menu.remove());
        }
      };
    },
    LocalRoutes(exports) {
      const AuthState = require("AuthState").AuthState,
        PlayerState = require("PlayerState").PlayerState,
        ArrowsDB = require("ArrowsDB").ArrowsDB;
      async function n(e) {
        const t = await ArrowsDB.read("mapCache", e);
        if (undefined === t) return;
        if (!("data" in t) || !("version" in t) || !("name" in t)) return;
        if (!("isPublic" in t) || !("tags" in t) || !("id" in t)) return;
        const s = t.name,
          i = t.version,
          o = t.data,
          n = t.isPublic,
          r = t.tags;
        return "number" == typeof i &&
          "string" == typeof s &&
          "string" == typeof o &&
          "boolean" == typeof n &&
          Array.isArray(r)
          ? {
              id: e,
              name: s,
              data: o,
              version: i,
              isPublic: n,
              tags: r,
            }
          : undefined;
      }
      var r;
      !(function (e) {
        ((e.getMap = async function (e) {
          return n(e);
        }),
          (e.getMaps = async function (e) {
            const t = [];
            for (let s = 0; s < e.length; s++) {
              const i = e[s];
              t.push(n(i));
            }
            return (await Promise.all(t)).filter((e) => undefined !== e);
          }),
          (e.getMapsInfo = async function () {
            const e = await ArrowsDB.getAllKeys("mapCache"),
              t = [];
            for (let s = 0; s < e.length; s++) {
              const i = e[s];
              i.startsWith("local-") && t.push(n(i));
            }
            const s = (await Promise.all(t)).filter((e) => undefined !== e);
            return (
              s.forEach((e) => {
                e.data = "";
              }),
              s
            );
          }),
          (e.saveMap = async function (e, t) {
            return e.id.startsWith("local-")
              ? (await ArrowsDB.write("mapCache", {
                  ...e,
                  data: t,
                  version: e.version + 1,
                }),
                Promise.resolve(200))
              : Promise.resolve(403);
          }),
          (e.saveMapInfo = async function (e) {
            const t = await n(e.id);
            return undefined === t
              ? 404
              : t.id.startsWith("local-")
                ? (await ArrowsDB.write("mapCache", {
                    ...e,
                    data: t.data,
                    version: e.version + 1,
                  }),
                  200)
                : 403;
          }),
          (e.createMap = async function () {
            const e = await ArrowsDB.getAllKeys("mapCache"),
              t = [];
            for (let s = 0; s < e.length; s++) {
              const i = e[s];
              if (!i.startsWith("local-")) continue;
              const o = i.split("local-")[1],
                a = Number.parseInt(o, 10);
              Number.isNaN(a) || t.push(a);
            }
            t.sort();
            let s = -1;
            for (let e = 1; e < t.length + 1; e++)
              if (t[e - 1] !== e) {
                s = e;
                break;
              }
            -1 === s && (s = t.length + 1);
            const i = {
              id: `local-${s}`,
              name: "New map",
              data: "AAAAAA==",
              tags: [],
              isPublic: false,
              version: 1,
            };
            return (await ArrowsDB.write("mapCache", i), i);
          }),
          (e.deleteMap = async function (e) {
            await ArrowsDB.remove("mapCache", e);
          }),
          (e.getLevels = async function () {
            const e = localStorage.getItem("levels");
            if (null !== e && "null" !== e && "" !== e) {
              const t = JSON.parse(e);
              if (Array.isArray(t)) return Promise.resolve(t);
            }
            return Promise.resolve([]);
          }),
          (e.logout = async function () {
            ((PlayerState.completedLevels = []),
              AuthState.setLoggedOut(),
              window.location.reload());
          }),
          (e.completeLevel = async function (e) {
            const t = localStorage.getItem("levels");
            if (null !== t && "null" !== t && "" !== t) {
              const s = JSON.parse(t);
              if (Array.isArray(s) && !s.includes(e))
                return (
                  s.push(e),
                  localStorage.setItem("levels", JSON.stringify(s)),
                  Promise.resolve()
                );
            }
            return (localStorage.setItem("levels", JSON.stringify([e])), Promise.resolve());
          }));
      })(r || (exports.LocalRoutes = r = {}));
    },
    ArrowData(exports) {
      class s {
        type = 0;
        rotation = 0;
        flipped = false;
        static fromArrow(e) {
          const t = new s();
          return (
            undefined === e ||
              ((t.type = e.type), (t.rotation = e.rotation), (t.flipped = e.flipped)),
            t
          );
        }
        static fromState(e, t, i) {
          const o = new s();
          return ((o.type = e), (o.rotation = t), (o.flipped = i), o);
        }
        static fromCopy(e) {
          const t = new s();
          return ((t.type = e.type), (t.rotation = e.rotation), (t.flipped = e.flipped), t);
        }
        equals(e) {
          return this.type === e.type && this.rotation === e.rotation && this.flipped === e.flipped;
        }
      }
      exports.ArrowData = s;
    },
    GamePage(exports) {
      const GameText = require("GameText").GameText,
        Game = require("Game").Game,
        GameHistory = require("GameHistory").GameHistory,
        PlayerControls = require("PlayerControls").PlayerControls,
        PlayerMapAction = require("PlayerMapAction").PlayerMapAction,
        PlayerOverlay = require("PlayerOverlay").PlayerOverlay,
        PlayerUI = require("PlayerUI").PlayerUI,
        Backend = require("Backend").Backend,
        load = require("load").load,
        save = require("save").save,
        Utils = require("Utils").Utils;
      exports.GamePage = class {
        game;
        playerUI;
        playerControls;
        playerOverlay;
        canvasDiv;
        isDeleted;
        mapInfo;
        history;
        saveInterval;
        constructor(e) {
          ((this.mapInfo = e),
            (this.isDeleted = false),
            (this.canvasDiv = document.createElement("div")),
            document.body.appendChild(this.canvasDiv));
          const t = document.createElement("canvas");
          ((t.className = "cnv"),
            (t.width = window.innerWidth * window.devicePixelRatio),
            (t.height = window.innerHeight * window.devicePixelRatio),
            this.canvasDiv.appendChild(t),
            (this.game = new Game(t)),
            this.game.setCurrentPivotIndex(parseInt(localStorage.getItem("pivotPoint") ?? "0", 10)),
            (this.history = new GameHistory()),
            this.history.pushState(new PlayerMapAction()),
            (this.playerUI = new PlayerUI(this.game, this.mapInfo)),
            (this.playerControls = new PlayerControls(t, this.game, this.playerUI, this.history)),
            this.playerControls.updatePlayerAccess({}),
            (this.playerOverlay = new PlayerOverlay(this.canvasDiv, this.game)));
          try {
            const t = window
              .atob(e.data)
              .split("")
              .map((e) => e.charCodeAt(0));
            (0, load)(this.game.gameMap, t);
          } catch (e) {
            console.error("Failed to load the map", e);
          }
          ((this.saveInterval = window.setInterval(() => this.autosave(), 3e4)),
            window.requestAnimationFrame(this.update),
            window.addEventListener("resize", this.resize));
        }
        async dispose() {
          ((this.isDeleted = true), window.clearInterval(this.saveInterval));
          const e = (0, save)(this.game.gameMap);
          (await this.saveMap(e),
            window.removeEventListener("resize", this.resize),
            this.playerControls.dispose(),
            this.playerUI.dispose(),
            this.playerOverlay.dispose(),
            this.game.dispose(),
            document.body.removeChild(this.canvasDiv));
        }
        resize = () => {
          this.game.resize(
            window.innerWidth * window.devicePixelRatio,
            window.innerHeight * window.devicePixelRatio,
          );
        };
        update = () => {
          this.isDeleted ||
            (this.playerControls.update(),
            this.game.updateFrame(),
            this.game.draw(),
            this.playerOverlay.update(),
            window.requestAnimationFrame(this.update));
        };
        async autosave() {
          if (this.isDeleted) return;
          this.playerUI.showAutoSaveMessage(GameText.AUTOSAVING.get());
          const e = (0, save)(this.game.gameMap);
          (200 === (await this.saveMap(e))
            ? this.playerUI.showAutoSaveMessage(GameText.SAVED.get())
            : this.playerUI.showAutoSaveMessage(GameText.UNABLE_TO_SAVE.get(), true),
            this.playerUI.hideAutoSaveMessage());
        }
        async saveMap(e) {
          if (undefined === this.mapInfo) return -1;
          const t = Utils.arrayBufferToBase64(e);
          if (this.mapInfo.data === t) return 200;
          const s = await Backend.saveMap(this.mapInfo, t);
          return (200 === s && (this.mapInfo.version++, (this.mapInfo.data = t)), s);
        }
      };
    },
    Utils(exports) {
      var s;
      (function (e) {
        e.arrayBufferToBase64 = function (e) {
          let t = "";
          const s = new Uint8Array(e),
            i = s.byteLength;
          for (let e = 0; e < i; e++) t += String.fromCharCode(s[e]);
          return window.btoa(t);
        };
      })(s || (exports.Utils = s = {}));
    },
    UIPauseSign(exports) {
      const UIComponent = require("UIComponent").UIComponent;
      class o extends UIComponent {
        constructor(e) {
          (super(e), (this.element.hidden = true));
          const t = document.createElement("div");
          ((t.className = "ui-pause-sign-line"), this.element.appendChild(t));
          const s = document.createElement("div");
          ((s.className = "ui-pause-sign-line"), this.element.appendChild(s));
        }
        getClass() {
          return "ui-pause-sign";
        }
      }
      exports.UIPauseSign = o;
    },
    UIMenu(exports) {
      const GameText = require("GameText").GameText,
        Backend = require("Backend").Backend,
        save = require("save").save,
        Utils = require("Utils").Utils,
        UIPanel = require("UIPanel").UIPanel;
      class l extends UIPanel {
        savingDiv;
        messagePanelDiv;
        constructor(e, t, s) {
          (super(e),
            (this.messagePanelDiv = document.createElement("div")),
            (this.messagePanelDiv.className = "ui-menu-panel"),
            (this.messagePanelDiv.onpointerdown = (e) => e.stopPropagation()),
            this.element.appendChild(this.messagePanelDiv));
          const a = document.createElement("div");
          a.className = "ui-menu-back-button";
          const n = () => {
            window.game.navigation.goToMaps("go");
          };
          ((a.onclick = n),
            a.addEventListener(
              "touchend",
              (e) => {
                (e.stopPropagation(), e.preventDefault(), n());
              },
              {
                capture: false,
              },
            ),
            a.addEventListener(
              "touchstart",
              (e) => {
                e.stopPropagation();
              },
              {
                passive: false,
              },
            ),
            a.addEventListener(
              "pointerdown",
              (e) => {
                e.stopPropagation();
              },
              {
                capture: false,
              },
            ));
          const r = document.createElement("img");
          ((r.src = "res/icons/toolbar-arrow.svg"),
            (r.className = "ui-menu-back-icon"),
            a.appendChild(r));
          const l = document.createElement("span");
          ((l.innerText = GameText.BUTTON_BACK_TO_MENU.get()),
            (l.className = "ui-menu-back-text"),
            a.appendChild(l),
            this.messagePanelDiv.appendChild(a));
          const h = document.createElement("input");
          ((h.type = "text"),
            (h.placeholder = GameText.MAP_NAME.get()),
            (h.value = t.name),
            (h.maxLength = 32),
            (h.className = "ui-menu-map-name-input"),
            (h.readOnly = false),
            (h.inputMode = "text"),
            (h.autocomplete = "off"),
            h.setAttribute("autocapitalize", "words"),
            h.setAttribute("autocorrect", "off"),
            h.addEventListener(
              "touchend",
              (e) => {
                (e.stopPropagation(), e.preventDefault(), h.focus(), h.click());
              },
              {
                capture: false,
              },
            ),
            h.addEventListener(
              "touchstart",
              (e) => {
                e.stopPropagation();
              },
              {
                passive: false,
              },
            ),
            h.addEventListener("click", (e) => {
              e.stopPropagation();
            }),
            h.addEventListener(
              "pointerdown",
              (e) => {
                e.stopPropagation();
              },
              {
                capture: false,
              },
            ),
            (h.onblur = () => {
              "" !== h.value &&
                h.value !== t.name &&
                ((t.name = h.value),
                this.setSaving(),
                (document.title = `${t.name} | ${GameText.ARROWS_TITLE.get()}`),
                Backend.saveMapInfo(t, this.setSaved));
            }),
            this.messagePanelDiv.appendChild(h));
          const c = document.createElement("img");
          ((c.src = t.isPublic ? "res/icons/icon_public_active.svg" : "res/icons/icon_public.svg"),
            (c.className = "ui-menu-public-checkbox"));
          const d = () => {
            ((t.isPublic = !t.isPublic),
              this.setSaving(),
              Backend.saveMapInfo(t, this.setSaved),
              (c.src = t.isPublic
                ? "res/icons/icon_public_active.svg"
                : "res/icons/icon_public.svg"));
          };
          ((c.onclick = d),
            c.addEventListener(
              "touchend",
              (e) => {
                (e.stopPropagation(), e.preventDefault(), d());
              },
              {
                capture: false,
              },
            ),
            c.addEventListener(
              "touchstart",
              (e) => {
                e.stopPropagation();
              },
              {
                passive: false,
              },
            ),
            c.addEventListener(
              "pointerdown",
              (e) => {
                e.stopPropagation();
              },
              {
                capture: false,
              },
            ),
            this.messagePanelDiv.appendChild(c),
            (this.savingDiv = document.createElement("div")),
            (this.savingDiv.className = "ui-menu-saving"),
            this.saveMap(t, s));
        }
        async saveMap(e, t) {
          (this.setSaving(), this.messagePanelDiv.appendChild(this.savingDiv));
          const s = (0, save)(t.gameMap),
            i = Utils.arrayBufferToBase64(s);
          if (i === e.data) return void this.setSaved(200);
          const r = await Backend.saveMap(e, i);
          this.setSaved(r);
        }
        setSaving() {
          this.savingDiv.innerText = GameText.SAVING.get();
        }
        setSaved = (e) => {
          this.savingDiv.innerText =
            413 === e
              ? `${GameText.UNABLE_TO_SAVE.get()}. ${GameText.MAP_TOO_LARGE.get()}.`
              : 200 !== e
                ? GameText.UNABLE_TO_SAVE.get()
                : GameText.SAVED.get();
        };
      }
      exports.UIMenu = l;
    },
    ToolsData(exports) {
      const GameText = require("GameText").GameText;
      class o {
        static TOOL_GROUPS = new Map([
          ["main", [1, 2, 3, 4, 7]],
          ["selection", [5, 6, 3, 8]],
          ["paste", [5, 1, 2, 9, 7]],
        ]);
        static getToolName(e) {
          return 1 === e
            ? GameText.TOOL_ROTATE.get()
            : 2 === e
              ? GameText.TOOL_FLIP.get()
              : 3 === e
                ? GameText.TOOL_DELETE.get()
                : 4 === e
                  ? GameText.TOOL_SELECT.get()
                  : 5 === e
                    ? GameText.TOOL_BACK.get()
                    : 6 === e
                      ? GameText.TOOL_COPY.get()
                      : 7 === e
                        ? GameText.TOOL_PASTE.get()
                        : 8 === e
                          ? GameText.TOOL_CUT.get()
                          : 9 === e
                            ? GameText.TOOL_SWITCH_PIVOT.get()
                            : "";
        }
        static TOOL_RIGHTS = new Map([
          [
            "main",
            [
              (e) => e.canRotate,
              (e) => e.canFlip,
              (e) => e.canDelete,
              (e) => e.canSelect,
              (e) => e.canPaste,
            ],
          ],
          [
            "selection",
            [() => true, (e) => e.canCopy, (e) => e.canDelete, (e) => e.canCopy && e.canDelete],
          ],
          ["paste", [() => true, (e) => e.canRotate, (e) => e.canFlip, () => true, () => true]],
        ]);
      }
      exports.ToolsData = o;
    },
    UIInventory(exports) {
      const UIComponent = require("UIComponent").UIComponent;
      class o extends UIComponent {
        dialog;
        itemsBlock;
        selectCallback;
        arrowGroups;
        arrows;
        constructor(e) {
          (super(e),
            (this.dialog = document.createElement("dialog")),
            (this.itemsBlock = document.createElement("div")),
            (this.selectCallback = () => {}),
            (this.arrowGroups = []),
            (this.arrows = []),
            (this.dialog.className = "ui-inventory"),
            this.element.appendChild(this.dialog),
            this.dialog.appendChild(this.itemsBlock),
            (this.dialog.onmousedown = (e) => e.stopPropagation()),
            (this.dialog.onclick = () => this.dialog.close()));
        }
        show() {
          this.dialog.showModal();
        }
        hide() {
          this.dialog.close();
        }
        toggle() {
          this.dialog.open ? this.dialog.close() : this.dialog.showModal();
        }
        setSelectCallback(e) {
          this.selectCallback = e;
        }
        addArrows(e) {
          ((this.arrows = []),
            (this.arrowGroups = e),
            this.itemsBlock.remove(),
            (this.itemsBlock = document.createElement("div")),
            (this.itemsBlock.className = "ui-inventory-items"),
            this.dialog.appendChild(this.itemsBlock));
          for (let t = 0; t < e.length; t++) {
            const s = e[t],
              i = document.createElement("div");
            ((i.className = "ui-inventory-line"),
              this.itemsBlock.appendChild(i),
              this.arrows.push([]));
            for (let e = 0; e < s.length; e++) {
              const o = document.createElement("div");
              ((o.className = "inventory-item"),
                (o.onclick = () => {
                  this.selectCallback(s[e]);
                }),
                i.appendChild(o));
              const a = document.createElement("img");
              ((a.src = `/res/sprites/arrow${s[e]}.png?v=${window.gameVersion}`),
                (a.onmousedown = (e) => {
                  (e.stopPropagation(), e.preventDefault());
                }),
                o.appendChild(a),
                this.arrows[t].push(o));
            }
          }
        }
        updateSelected(e) {
          for (let t = 0; t < this.arrowGroups.length; t++)
            for (let s = 0; s < this.arrowGroups[t].length; s++) {
              const i = this.arrows[t][s];
              (i.classList.remove("ui-toolbar-item-active"),
                this.arrowGroups[t][s] === e && i.classList.add("ui-toolbar-item-active"));
            }
        }
        getClass() {
          return "ui-inventory-div";
        }
      }
      exports.UIInventory = o;
    },
    UIToolbarItem(exports) {
      const UIComponent = require("UIComponent").UIComponent,
        ToolsData = require("ToolsData").ToolsData,
        ArrowDescriptions = require("ArrowDescriptions").ArrowDescriptions,
        GameText = require("GameText").GameText,
        PLATFORM = require("PLATFORM").PLATFORM;
      class l extends UIComponent {
        image;
        text;
        arrowType;
        indexInToolbar;
        mode;
        tooltip = null;
        mouseCaptured = false;
        mouseReleasedTime = 0;
        constructor(e, t, s, i, o) {
          (super(e),
            (this.arrowType = s + 1),
            (this.mode = i),
            (this.image = document.createElement("img")),
            (this.image.draggable = false),
            this.element.appendChild(this.image),
            (this.text = document.createElement("span")),
            (this.indexInToolbar = t),
            this.element.appendChild(this.text));
          const l = /(#(\w)(\(.+?\)))|@(\w+)/gm;
          let h = ArrowDescriptions.getArrowActivation(s + 1);
          h = h.replace(l, this.replaceInlineColors);
          let c = ArrowDescriptions.getArrowAction(s + 1);
          if (
            ((c = c.replace(l, this.replaceInlineColors)),
            "false" !== localStorage.getItem("show-controls-hints") &&
              "mobile" !== PLATFORM &&
              "Unknown" !== h &&
              "Unknown" !== c)
          ) {
            ((this.tooltip = document.createElement("div")),
              (this.tooltip.className = "ui-toolbar-item-tooltip"));
            const e = document.createElement("h3");
            e.innerHTML = `${ArrowDescriptions.getArrowName(s + 1)}`;
            const t = document.createElement("p");
            t.innerHTML = `<b>${GameText.ACTIVATES.get()}</b> ${h}`;
            const i = document.createElement("p");
            ((i.innerHTML = `<b>${GameText.ON_ACTIVATION.get()}</b> ${c}`),
              this.tooltip.appendChild(e),
              this.tooltip.appendChild(t),
              this.tooltip.appendChild(i),
              document.body.appendChild(this.tooltip));
          }
          (this.setImage(s),
            (this.element.onpointerdown = () => {
              (o(this.arrowType), (this.mouseCaptured = true));
            }),
            (this.element.onmouseover = () => {
              if (null === this.tooltip) return;
              const e = this.element.getBoundingClientRect(),
                t = (window.innerWidth * window.devicePixelRatio) / 2 - e.left - e.width / 2 + "px";
              (this.tooltip.style.setProperty("--item-offset", t),
                this.tooltip.classList.add("ui-toolbar-item-tooltip-hovered"));
            }),
            (this.element.onmouseout = () => {
              this.tooltip?.classList.remove("ui-toolbar-item-tooltip-hovered");
            }),
            document.addEventListener("pointerup", this.pointerUp));
        }
        setImage(e) {
          if (
            ("arrow" === this.mode &&
              (this.element.classList.add("ui-toolbar-item-arrow"),
              (this.image.src = `res/sprites/arrow${e + 1}.png?v=${window.gameVersion}`),
              (this.text.innerText = `${this.indexInToolbar}`)),
            "tool" === this.mode)
          ) {
            (this.element.classList.add("ui-toolbar-item-tool"),
              (this.image.src = `res/sprites/tool${e + 1}.png?v=${window.gameVersion}`),
              this.image.classList.add("tool-icon"));
            const t = ToolsData.getToolName(e + 1);
            ((this.text.innerText = t),
              t.length > 9
                ? this.text.classList.add("long-tool-title")
                : this.text.classList.remove("long-tool-title"));
          }
        }
        activate() {
          this.element.classList.add("ui-toolbar-item-active");
        }
        deactivate() {
          this.element.classList.remove("ui-toolbar-item-active");
        }
        disable() {
          this.element.classList.add("ui-toolbar-item-disabled");
        }
        enable() {
          this.element.classList.remove("ui-toolbar-item-disabled");
        }
        getClass() {
          return "ui-toolbar-item";
        }
        isMouseCaptured() {
          return !!this.mouseCaptured || Date.now() - this.mouseReleasedTime < 100;
        }
        remove() {
          (document.removeEventListener("pointerup", this.pointerUp),
            this.tooltip?.remove(),
            super.remove());
        }
        pointerUp = () => {
          (this.mouseCaptured && (this.mouseReleasedTime = Date.now()),
            (this.mouseCaptured = false));
        };
        replaceInlineColors = (e) => {
          const t = e.match(/#\w/);
          if (null === t || 0 === t.length) return "";
          const s = t[0].at(1);
          if (undefined === s) return "";
          let i = "#000";
          "r" === s ? (i = "#f00") : "b" === s && (i = "#00f");
          const o = e.match(/\((.+)\)/);
          return null === o || 0 === o.length ? "" : `<span style="color:${i};">${o[1]}</span>`;
        };
      }
      exports.UIToolbarItem = l;
    },
    LoginPage(exports) {
      const LangSettings = require("LangSettings").LangSettings,
        GameText = require("GameText").GameText,
        Game = require("Game").Game,
        CHUNK_SIZE = require("ChunkConsts").CHUNK_SIZE,
        LangUtils = require("LangUtils").LangUtils,
        Backend = require("Backend").Backend;
      exports.LoginPage = class {
        game;
        canvas;
        mainDiv;
        socialsDiv;
        isDeleted;
        CELL_SIZE = 160;
        LEFT_PANEL_WIDTH = 0.4;
        constructor(e, t, s) {
          ((this.isDeleted = false),
            (this.canvas = document.createElement("canvas")),
            (this.canvas.id = "login-cnv"),
            document.body.appendChild(this.canvas),
            (this.mainDiv = document.createElement("div")),
            (this.mainDiv.id = "login-main-div"),
            document.body.appendChild(this.mainDiv));
          const n = [];
          for (let e = LangSettings.languages.length - 1; e >= 0; e--) {
            const s = LangSettings.languages[e];
            if (LangSettings.getLanguage() === s) continue;
            const o = document.createElement("div");
            ((o.className = "login-lang"),
              (o.innerText = LangSettings.languageNames[e]),
              n.push(o),
              this.mainDiv.appendChild(o));
            const a = "true" === localStorage.getItem("cookies");
            o.addEventListener("click", () => {
              (LangSettings.setLanguage(LangUtils.getLanguageFromString(s)),
                a && localStorage.setItem("lang", s),
                t());
            });
          }
          const l = document.createElement("h1"),
            h = document.createElement("div");
          ((l.id = "login-caption"),
            (h.id = "login-text"),
            (l.innerText = GameText.ARROWS_TITLE.get()),
            (h.innerText = GameText.LOGIN_TEXT.get()),
            this.mainDiv.appendChild(l),
            this.mainDiv.appendChild(h));
          const c = document.createElement("div");
          ((c.className = "policy-links-div"),
            this.mainDiv.appendChild(c),
            (this.socialsDiv = document.createElement("div")),
            (this.socialsDiv.className = "social-links-div"),
            document.body.appendChild(this.socialsDiv));
          const d =
              "ru" === LangSettings.getLanguage() ||
              "by" === LangSettings.getLanguage() ||
              "ua" === LangSettings.getLanguage(),
            u = document.createElement("a");
          if (
            ((u.className = "social-link social-link-youtube"),
            (u.href = "https://www.youtube.com/@ArtemYashin"),
            d && (u.href = "https://www.youtube.com/@OnigiriScience"),
            (u.target = "_blank"),
            this.socialsDiv.appendChild(u),
            d)
          ) {
            const e = document.createElement("a");
            ((e.className = "social-link social-link-telegram"),
              (e.href = "https://t.me/onigiriScience"),
              (e.target = "_blank"),
              this.socialsDiv.appendChild(e));
          }
          const g = document.createElement("a");
          ((g.className = "social-link social-link-discord"),
            (g.href = d ? "https://discord.gg/Ud3x8jsrCZ" : "https://discord.gg/CchbeN9QUW"),
            (g.target = "_blank"),
            this.socialsDiv.appendChild(g));
          const m = document.createElement("a");
          ((m.className = "social-link social-link-steam"),
            (m.href = "https://store.steampowered.com/app/4210250/Logic_Arrows/"),
            (m.target = "_blank"),
            this.socialsDiv.appendChild(m));
          const p = document.createElement("a");
          ((p.className = "policy-link"),
            (p.innerText = GameText.PRIVACY_POLICY.get()),
            (p.href = "/doc/privacy.html"),
            (p.target = "_blank"),
            c.appendChild(p));
          const w = document.createElement("a");
          ((w.className = "policy-link"),
            (w.innerText = GameText.TERMS_AND_CONDITIONS.get()),
            (w.href = "/doc/terms.html"),
            (w.target = "_blank"),
            c.appendChild(w));
          const v = document.createElement("div");
          ((v.className = "version-div"),
            (v.innerText = `v${window.gameVersion.replace(/_/g, ".")}`),
            c.appendChild(v),
            this.addStartButton(s, e),
            (this.game = new Game(this.canvas)),
            window.addEventListener("resize", this.resize),
            this.resize(),
            this.setChunk(1),
            this.setChunk(0),
            this.setChunk(-1),
            this.setChunk(-2),
            window.requestAnimationFrame(this.update));
        }
        dispose() {
          ((this.isDeleted = true),
            window.removeEventListener("resize", this.resize),
            this.game.dispose(),
            document.body.removeChild(this.canvas),
            document.body.removeChild(this.mainDiv),
            document.body.removeChild(this.socialsDiv));
        }
        addStartButton(e, t) {
          if ("true" === localStorage.getItem("cookies"))
            return void Backend.checkUser(
              () => {
                const t = this.makeGoToGameButton();
                (this.mainDiv.appendChild(t), t.addEventListener("click", e));
              },
              () => {
                const s = this.makeLoginWithGoogleButton();
                (this.mainDiv.appendChild(s), s.addEventListener("click", t));
                const i = this.makeLoginAsGuestButton();
                (this.mainDiv.appendChild(i),
                  i.addEventListener("click", () => {
                    (Backend.loginAsGuest(), e());
                  }));
              },
            );
          const s = document.createElement("div");
          ((s.className = "login-cookies-div"), this.mainDiv.appendChild(s));
          const a = document.createElement("div");
          ((a.className = "login-cookies-title"),
            (a.innerText = GameText.COOKIES_TITLE.get()),
            s.appendChild(a));
          const n = document.createElement("div");
          ((n.className = "login-cookies-text"),
            (n.innerText = GameText.COOKIES_TEXT.get()),
            s.appendChild(n));
          const r = document.createElement("div");
          ((r.className = "login-cookies-button"),
            (r.innerText = GameText.ACCEPT.get()),
            r.addEventListener("click", () => {
              (localStorage.setItem("cookies", "true"),
                this.mainDiv.removeChild(s),
                this.addStartButton(e, t),
                localStorage.setItem("lang", LangSettings.getLanguage()));
            }),
            s.appendChild(r));
        }
        makeGoToGameButton() {
          const e = document.createElement("div");
          return ((e.id = "login-btn"), (e.innerText = GameText.START_GAME.get()), e);
        }
        makeLoginWithGoogleButton() {
          const e = document.createElement("div");
          e.className = "google-btn";
          const t = document.createElement("div");
          ((t.className = "google-icon-wrapper"), e.appendChild(t));
          const s = document.createElement("img");
          ((s.className = "google-icon-svg"),
            (s.src = "/res/icons/icon_google.svg"),
            t.appendChild(s));
          const i = document.createElement("p");
          return (
            (i.className = "google-btn-text"),
            (i.innerText = GameText.SIGN_IN_WITH_GOOGLE.get()),
            e.appendChild(i),
            e
          );
        }
        makeLoginAsGuestButton() {
          const e = document.createElement("div");
          return (
            (e.className = "login-guest-btn"),
            (e.innerText = GameText.CONTINUE_AS_GUEST.get()),
            e
          );
        }
        resize = () => {
          const e = window.innerWidth * window.devicePixelRatio * this.LEFT_PANEL_WIDTH,
            t = (this.CELL_SIZE * e) / 1e3,
            s = Math.min(Math.floor(e / t), CHUNK_SIZE),
            i = 0.025 * t * window.devicePixelRatio,
            o = (s * t + i) / window.devicePixelRatio;
          ((this.canvas.style.width = `${o}px`),
            this.game.resize(s * t + i, window.innerHeight * window.devicePixelRatio),
            this.game.setScale(t, [0, 0]),
            (this.socialsDiv.style.left = `${o + 10}px`));
        };
        update = () => {
          if (this.isDeleted) return;
          ((this.game.screenUpdated = true),
            this.game.updateFrame(),
            this.game.draw(),
            (this.game.offset[1] = this.game.frame));
          const e = -Math.floor(this.game.offset[1] / 256);
          this.setChunk(~~(e / CHUNK_SIZE) - 1);
          const t = e + ~~(this.game.height / this.CELL_SIZE) + 1 * CHUNK_SIZE + 1;
          (this.deleteChunk(1 + ~~(t / CHUNK_SIZE)), window.requestAnimationFrame(this.update));
        };
        setChunk(e) {
          if (undefined !== this.game.gameMap.getChunk(0, e)) return;
          const t = this.game.gameMap.getOrCreateChunk(0, e);
          for (let s = 0; s < CHUNK_SIZE; s++)
            for (let i = 0; i < CHUNK_SIZE; i++) {
              const o = t.getArrow(s, i),
                a = s ^ (i + Math.abs(e + 2) * CHUNK_SIZE);
              o.type = Math.floor(a % 20);
            }
        }
        deleteChunk(e) {
          const t = this.game.gameMap.getChunk(0, e);
          undefined !== t && (t.clear(), this.game.gameMap.clearChunkIfEmpty(t));
        }
      };
    },
    LevelArrow(exports) {
      const Arrow = require("Arrow").Arrow;
      exports.LevelArrow = class {
        type;
        x;
        y;
        arrow;
        state;
        action;
        levelAction;
        isStateValid;
        constructor(e, t, s, o) {
          ((this.type = e),
            (this.x = t),
            (this.y = s),
            (this.action = o),
            (this.levelAction = () => {}),
            (this.state = null),
            (this.isStateValid = false),
            (this.arrow = new Arrow()));
        }
        setAction(e) {
          this.action = e;
        }
        setLevelAction(e) {
          this.levelAction = e;
        }
        update() {
          this.isStateValid = this.action(this);
        }
        updateLevel() {
          this.levelAction();
        }
        isValid() {
          return this.isStateValid;
        }
      };
    },
    UIMapsMenuItem(exports) {
      const UIComponent = require("UIComponent").UIComponent;
      class o extends UIComponent {
        constructor(e, t, s) {
          (super(e), this.element.addEventListener("click", () => s()));
          const i = document.createElement("div");
          ((i.className = "ui-maps-menu-item-name"),
            this.element.appendChild(i),
            (i.innerText = t));
        }
        getClass() {
          return "ui-new-item";
        }
      }
      exports.UIMapsMenuItem = o;
    },
    OverlayLevel(exports) {
      const CELL_SIZE = require("ChunkConsts").CELL_SIZE;
      exports.OverlayLevel = class {
        info;
        overlayInfo;
        elementOffset = [0, 0];
        textColor;
        element;
        upperDiv;
        lowerDiv;
        onLevelClick;
        constructor(e, t, s) {
          ((this.info = e),
            (this.overlayInfo = t),
            this.info.setCallback((e) => this.setState(e)),
            (this.onLevelClick = s),
            (this.element = null),
            (this.upperDiv = null),
            (this.lowerDiv = null),
            (this.textColor = "#000"));
        }
        setState(e) {
          return (
            null === this.element ||
              ("locked" === e
                ? ((this.element.style.backgroundColor = "#ccc"),
                  (this.element.style.boxShadow = "0px 0px 0px 0.2em #aaa inset"))
                : "unlocked" === e
                  ? ((this.element.style.boxShadow = "0px 0px 0px 0.2em #fa5 inset"),
                    (this.element.style.backgroundColor = "#fec"))
                  : "completed" === e &&
                    ((this.element.style.boxShadow = "0px 0px 0px 0.2em #7cf inset"),
                    (this.element.style.backgroundColor = "#def"))),
            this
          );
        }
        add(e) {
          null === this.element &&
            ((this.element = document.createElement("div")),
            (this.element.onclick = this.click),
            e.appendChild(this.element),
            (this.element.className = "overlay-level"),
            (this.element.style.backgroundColor = "#ccc"),
            (this.element.style.boxShadow = "0px 0px 0px 0.2em #aaa inset"),
            (this.element.style.color = this.textColor),
            (this.upperDiv = document.createElement("div")),
            (this.upperDiv.style.paddingRight = "0.2em"),
            (this.upperDiv.innerText = `${this.info.id}`),
            this.element.appendChild(this.upperDiv),
            (this.lowerDiv = document.createElement("div")),
            (this.lowerDiv.style.fontFamily = "Trebuchet MS"),
            (this.lowerDiv.style.paddingLeft = "0.3em"),
            (this.lowerDiv.style.paddingRight = "0.3em"),
            this.element.appendChild(this.lowerDiv),
            this.update([0, 0], 80));
        }
        update(e, t, s = window.devicePixelRatio) {
          if (null === this.element || null === this.upperDiv || null === this.lowerDiv) return;
          const o = t / (s > 0 ? s : window.devicePixelRatio),
            a = 0.05 * o,
            n = (e[0] / CELL_SIZE + this.overlayInfo.x) * o + a + this.elementOffset[0],
            r = (e[1] / CELL_SIZE + this.overlayInfo.y) * o + a + this.elementOffset[1],
            l = this.overlayInfo.width * o - a,
            h = this.overlayInfo.height * o - a;
          ((this.element.style.left = `${n}px`),
            (this.element.style.top = `${r}px`),
            (this.element.style.width = `${l}px`),
            (this.element.style.height = `${h}px`),
            (this.element.style.fontSize = `${o}px`),
            (this.upperDiv.style.fontSize = 2 * o + "px"),
            (this.lowerDiv.style.fontSize = 0.65 * o + "px"));
        }
        remove() {
          null !== this.element && (this.element.remove(), (this.element = null));
        }
        click = () => {
          "locked" !== this.info.state && this.onLevelClick(this.info.id);
        };
      };
    },
    AuthGoogle(exports) {
      const Routes = require("Routes").Routes;
      var o;
      !(function (e) {
        e.getAuthURL = function () {
          const e = {
            redirect_uri: `${Routes.getURL()}/auth/google`,
            client_id: "480103000605-r44ki2s4brehsbih1nb676gnialp4a5v.apps.googleusercontent.com",
            access_type: "offline",
            response_type: "code",
            prompt: "consent",
            scope: "https://www.googleapis.com/auth/userinfo.email",
          };
          return `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(e).toString()}`;
        };
      })(o || (exports.AuthGoogle = o = {}));
    },
    LevelsPage(exports) {
      const CELL_SIZE = require("ChunkConsts").CELL_SIZE,
        Levels = require("Levels").Levels,
        LevelsControls = require("LevelsControls").LevelsControls,
        LevelsUI = require("LevelsUI").LevelsUI,
        OverlayLevel = require("OverlayLevel").OverlayLevel,
        Game = require("Game").Game,
        PlayerOverlay = require("PlayerOverlay").PlayerOverlay,
        PlayerState = require("PlayerState").PlayerState,
        Backend = require("Backend").Backend,
        Page = require("Page").Page;
      class g extends Page {
        game;
        levelsUI;
        levelsControls;
        playerOverlay;
        levelOverlays;
        onLevelClick;
        parent;
        canvas;
        devicePixelRatio;
        constructor(e, t) {
          (super(t),
            (this.onLevelClick = e),
            (t ??= document.body),
            (this.parent = t),
            (this.devicePixelRatio = window.devicePixelRatio));
          const s = document.createElement("canvas");
          s.className = "cnv";
          const i = this.getContainerRect();
          ((s.width = i.width * this.devicePixelRatio),
            (s.height = i.height * this.devicePixelRatio),
            (s.style.width = `${i.width}px`),
            (s.style.height = `${i.height}px`),
            this.mainDiv.appendChild(s),
            (this.canvas = s),
            (this.game = new Game(s)),
            (this.levelsUI = new LevelsUI()),
            (this.levelsControls = new LevelsControls(this.canvas, this.game)),
            (this.playerOverlay = new PlayerOverlay(this.mainDiv, this.game)),
            (this.levelOverlays = new Map()),
            this.makeMap().then(() => {
              (window.requestAnimationFrame(this.update),
                window.addEventListener("resize", this.resize));
            }));
        }
        getClass() {
          return "levels-page";
        }
        dispose() {
          (window.removeEventListener("resize", this.resize),
            this.levelsControls.dispose(),
            this.levelsUI.dispose(),
            this.playerOverlay.dispose(),
            this.game.dispose(),
            super.dispose());
        }
        async makeMap() {
          const e = await Backend.getLevels();
          ((PlayerState.completedLevels = e),
            this.makeRedArrows(17, 6, 17, 4, true),
            this.makeRedArrows(17, -2, 17, -4, true),
            this.makeRedArrows(17, -10, 17, -12, true),
            this.makeRedArrows(14, -15, 5, -15, false),
            this.makeRedArrows(20, -15, 29, -15, false),
            this.makeObliqueArrows(2, -18, 2, false, false),
            this.makeObliqueArrows(5, -28, 2, false, true),
            this.makeObliqueArrows(32, -18, 2, true, false),
            this.makeObliqueArrows(12, -37, 2, false, true),
            this.makeObliqueArrows(29, -28, 2, true, true),
            this.makeObliqueArrows(22, -37, 2, true, true),
            Levels.levels.forEach((e) => {
              this.addLevelOverlay(e.id);
            }),
            Levels.unlockLevel(0),
            e.forEach((e) => {
              Levels.completeLevel(e);
            }),
            this.game.setScale(60, [0, 0]),
            this.focusOnLevel(),
            this.updateMap());
        }
        focusOnLevel() {
          for (const e of this.levelOverlays) {
            const t = e[1];
            if ("unlocked" === t.info.state) {
              const e = (t.overlayInfo.x + t.overlayInfo.width / 2) * CELL_SIZE + CELL_SIZE / 2,
                s = (t.overlayInfo.y + t.overlayInfo.height / 2) * CELL_SIZE + CELL_SIZE / 2;
              return (
                (this.game.offset[0] = -e + (this.game.width * CELL_SIZE) / this.game.scale / 2),
                void (this.game.offset[1] =
                  -s + (this.game.height * CELL_SIZE) / this.game.scale / 2)
              );
            }
          }
        }
        addLevelOverlay(e) {
          const t = Levels.levels.get(e),
            s = Levels.levelOverlayInfos.get(e);
          if (undefined === t) throw new Error(`Level with id ${e} not found`);
          if (undefined === s) throw new Error(`Level overlay with id ${e} not found`);
          const i = new OverlayLevel(t, s, this.onLevelClick);
          return (this.playerOverlay.addLevel(i), this.levelOverlays.set(t.id, i), i);
        }
        makeRedArrows(e, t, s, i, o) {
          const a = s - e,
            n = i - t,
            r = Math.sign(a),
            l = Math.sign(n);
          let h = e,
            c = t;
          if (o) {
            this.game.gameMap.setArrowType(h, c, 1);
            for (let e = 1; e <= Math.abs(n); e++)
              ((c += l),
                this.game.gameMap.setArrowType(h, c, 1),
                e === Math.abs(n) &&
                  Math.abs(a) > 0 &&
                  (r > 0
                    ? this.game.gameMap.setArrowRotation(h, c, 1)
                    : this.game.gameMap.setArrowRotation(h, c, 3)));
            for (let e = 1; e <= Math.abs(a); e++)
              ((h += r),
                this.game.gameMap.setArrowType(h, c, 1),
                r > 0
                  ? this.game.gameMap.setArrowRotation(h, c, 1)
                  : this.game.gameMap.setArrowRotation(h, c, 3));
          } else {
            (this.game.gameMap.setArrowType(h, c, 1),
              r > 0
                ? this.game.gameMap.setArrowRotation(h, c, 1)
                : this.game.gameMap.setArrowRotation(h, c, 3));
            for (let e = 1; e <= Math.abs(a); e++)
              ((h += r),
                this.game.gameMap.setArrowType(h, c, 1),
                (e === Math.abs(a) && Math.abs(n) > 0) ||
                  (r > 0
                    ? this.game.gameMap.setArrowRotation(h, c, 1)
                    : this.game.gameMap.setArrowRotation(h, c, 3)));
            for (let e = 1; e <= Math.abs(n); e++)
              ((c += l), this.game.gameMap.setArrowType(h, c, 1));
          }
        }
        makeObliqueArrows(e, t, s, i, o) {
          let a = e,
            n = t,
            r = 1;
          o && (r = 11);
          for (let e = 0; e < 2 * s + 1; e++) {
            this.game.gameMap.setArrowType(a, n, r);
            let e = 0,
              t = -1;
            (11 === r && (e = 1),
              i && (this.game.gameMap.setArrowFlipped(a, n, true), (e = -e)),
              (a += e),
              (n += t),
              (r = 1 === r ? 11 : 1));
          }
        }
        makeBlueArrows(e, t, s) {
          let i = e,
            o = t;
          for (let e = 0; e < s; e++) (this.game.gameMap.setArrowType(i, o, 10), (o -= 2));
        }
        resize = () => {
          const e = this.getContainerRect();
          if (e.width <= 0 || e.height <= 0)
            return void (this.devicePixelRatio = window.devicePixelRatio);
          const t = window.devicePixelRatio;
          ((this.canvas.style.width = `${e.width}px`),
            (this.canvas.style.height = `${e.height}px`),
            this.game.resize(e.width * t, e.height * t),
            (this.devicePixelRatio = t),
            this.playerOverlay.resize());
        };
        updateMap() {
          for (let e = 0; e < 15; e++) {
            this.game.updateFrame();
            for (const e of this.levelOverlays) {
              const t = e[1];
              "completed" === t.info.state &&
                t.overlayInfo.outputs.forEach((e) => {
                  this.game.gameMap.setArrowSignal(
                    t.overlayInfo.x + e[0],
                    t.overlayInfo.y + e[1],
                    e[2],
                  );
                });
            }
          }
        }
        getContainerRect() {
          const e = this.mainDiv.getBoundingClientRect();
          if (e.width > 0 && e.height > 0) return e;
          const t = this.parent.getBoundingClientRect();
          return t.width > 0 && t.height > 0
            ? t
            : new DOMRect(0, 0, window.innerWidth, window.innerHeight);
        }
        update = () => {
          this.isDeleted ||
            (Math.abs(window.devicePixelRatio - this.devicePixelRatio) > 0.01 && this.resize(),
            this.levelsControls.update(),
            this.game.draw(),
            this.playerOverlay.update(),
            window.requestAnimationFrame(this.update));
        };
      }
      exports.LevelsPage = g;
    },
    PlayerMapAction(exports) {
      exports.PlayerMapAction = class {
        changedArrows;
        constructor() {
          this.changedArrows = new Map();
        }
        addChangedArrow(e, t, s, i) {
          const o = `${e},${t}`,
            a = this.changedArrows.get(o);
          (undefined !== a && (s = a[0]), this.changedArrows.set(o, [s, i]));
        }
      };
    },
    UIToolbar(exports) {
      const ToolsData = require("ToolsData").ToolsData,
        UIComponent = require("UIComponent").UIComponent,
        UIToolbarArrow = require("UIToolbarArrow").UIToolbarArrow,
        UIToolbarItem = require("UIToolbarItem").UIToolbarItem,
        UIToolbarItemEmpty = require("UIToolbarItemEmpty").UIToolbarItemEmpty;
      class l extends UIComponent {
        items = [];
        playerAccess;
        arrowLeft;
        arrowRight;
        itemsDiv;
        mouseCaptured = false;
        mouseReleasedTime = 0;
        selectCallback;
        constructor(e, t, s) {
          (super(e),
            (this.playerAccess = s),
            (this.itemsDiv = document.createElement("div")),
            (this.itemsDiv.className = "ui-toolbar-items"),
            (this.arrowLeft = new UIToolbarArrow(this.element, "left")),
            this.element.appendChild(this.itemsDiv),
            (this.arrowRight = new UIToolbarArrow(this.element, "right")),
            this.setArrows(t, s.arrowGroups),
            (this.selectCallback = () => {}),
            this.setItems(t, s.arrowGroups),
            (this.element.onpointerdown = () => {
              this.mouseCaptured = true;
            }),
            document.addEventListener("pointerup", this.pointerUp));
        }
        setItems(e, t) {
          this.setArrows(e, t);
          for (let e = 0; e < this.items.length; e++) this.items[e].remove();
          ((this.items = []), this.setVisibility(0 !== t[e].length));
          for (let s = 0; s < 5; s++)
            if (s < t[e].length) {
              const i = new UIToolbarItem(
                this.itemsDiv,
                s + 1,
                t[e][s] - 1,
                "arrow",
                this.selectCallback,
              );
              this.items.push(i);
            } else {
              const e = new UIToolbarItemEmpty(this.itemsDiv);
              this.items.push(e);
            }
        }
        setTools(e) {
          this.setVisibility(true);
          for (let e = 0; e < this.items.length; e++) this.items[e].remove();
          this.items = [];
          const t = ToolsData.TOOL_GROUPS.get(e) || [];
          for (let s = 0; s < 5; s++)
            if (s < t.length && ToolsData.TOOL_RIGHTS.get(e)?.[s](this.playerAccess)) {
              const e = new UIToolbarItem(
                this.itemsDiv,
                s + 1,
                t[s] - 1,
                "tool",
                this.selectCallback,
              );
              this.items.push(e);
            } else {
              const e = new UIToolbarItemEmpty(this.itemsDiv);
              this.items.push(e);
            }
          (this.arrowLeft.toggle(false), this.arrowRight.toggle(false));
        }
        activateItem(e) {
          for (let t = 0; t < this.items.length; t++) {
            const s = this.items[t];
            s instanceof UIToolbarItemEmpty || (s.deactivate(), s.arrowType === e && s.activate());
          }
        }
        disableItems(e) {
          for (let t = 0; t < this.items.length; t++) {
            const s = this.items[t];
            s instanceof UIToolbarItemEmpty || (e.includes(s.arrowType) ? s.disable() : s.enable());
          }
        }
        isMouseCaptured() {
          if (this.mouseCaptured) return true;
          if (Date.now() - this.mouseReleasedTime < 100) return true;
          for (let e = 0; e < this.items.length; e++)
            if (this.items[e].isMouseCaptured()) return true;
          return false;
        }
        setSelectCallback(e) {
          this.selectCallback = e;
        }
        setArrowsCallback(e, t) {
          (this.arrowLeft.setCallback(e), this.arrowRight.setCallback(t));
        }
        getClass() {
          return "ui-toolbar";
        }
        remove() {
          (document.removeEventListener("pointerup", this.pointerUp), super.remove());
        }
        setArrows(e, t) {
          (this.arrowLeft.toggle(0 !== e), this.arrowRight.toggle(e !== t.length - 1));
        }
        pointerUp = () => {
          (this.mouseCaptured && (this.mouseReleasedTime = Date.now()),
            (this.mouseCaptured = false));
        };
      }
      exports.UIToolbar = l;
    },
    GameText(exports) {
      const I18nText = require("I18nText").I18nText;
      var o;
      !(function (e) {
        ((e.SIGN_IN_WITH_GOOGLE = new I18nText(
          "Sign in with Google",
          "Войти через Google",
          "Увійти через Google",
          "Увайсці праз Google",
          "Se connecter via Google",
        )),
          (e.LOGIN_TEXT = new I18nText(
            "Let’s play with simplicity to create complexity!",
            "Создайте сложные структуры из простых элементов!",
            "Створіть складні структури з простих елементів!",
            "Стварыце складаныя структуры з простых элементаў!",
            "Créez des structures compliquées avec des éléments simples !",
          )),
          (e.LOGOUT = new I18nText("Logout", "Выйти", "Вийти", "Выйсці", "Se connecter")),
          (e.ARROWS_TITLE = new I18nText(
            "Logic Arrows",
            "Стрелочки",
            "Стрілочки",
            "Стрэлачкі",
            "Fléchettes",
          )),
          (e.MAPS = new I18nText("Maps", "Карты", "Мапи", "Карты", "Cartes")),
          (e.GUIDE = new I18nText("Guide", "Гайд", "Гайд", "Гайд", "Guide")),
          (e.MENU_BACK = new I18nText("Back", "Назад", "Назад", "Назад", "Retour")),
          (e.PERFORMANCE_TITLE = new I18nText(
            "Performance",
            "Производительность",
            "Продуктивність",
            "Прадукцыйнасць",
            "Performance",
          )),
          (e.PER_SECOND = new I18nText(
            "per second",
            "в секунду",
            "за секунду",
            "у секунду",
            "par seconde",
          )),
          (e.NEW_MAP = new I18nText(
            "New map",
            "Новая карта",
            "Нова мапа",
            "Новая карта",
            "Nouvelle carte",
          )),
          (e.MAP_NAME = new I18nText(
            "Map name",
            "Название карты",
            "Назва мапи",
            "Назва карты",
            "Nom de la carte",
          )),
          (e.MAP_DESCRIPTION = new I18nText(
            "Map description",
            "Описание карты",
            "Опис мапи",
            "Апісанне карты",
            "Description de la carte",
          )),
          (e.SAVING = new I18nText(
            "Saving...",
            "Сохранение...",
            "Збереження...",
            "Захаванне...",
            "Sauvegarde...",
          )),
          (e.SAVED = new I18nText("Saved", "Сохранено", "Збережено", "Захавана", "Sauvé")),
          (e.CANCEL = new I18nText("Cancel", "Отмена", "Скасувати", "Адмяніць", "Annuler")),
          (e.DELETE = new I18nText("Delete", "Удалить", "Видалити", "Выдаліць", "Supprimer")),
          (e.START_GAME = new I18nText(
            "Start game",
            "Начать игру",
            "Почати гру",
            "Пачаць гульню",
            "Commencer le jeu",
          )),
          (e.LEVELS = new I18nText("Levels", "Уровни", "Рівні", "Узроўні", "Niveaux")),
          (e.LEVEL = new I18nText("Level", "Уровень", "Рівень", "Узровень", "Niveau")),
          (e.ACCEPT = new I18nText("Accept", "Принять", "Прийняти", "Прыняць", "Accepter")),
          (e.SET_NAME = new I18nText(
            "Enter your game name",
            "Введите ваше имя в игре",
            "Введіть ваше ім'я у грі",
            "Увядзіце ваша імя ў гульні",
            "Entrer votre pseudo",
          )),
          (e.NAME = new I18nText("Name", "Имя", "Ім'я", "Імя", "Nom")),
          (e.ACCOUNT = new I18nText("Account", "Аккаунт", "Акаунт", "Акаўнт", "Compte")),
          (e.COMMUNITY_MAPS = new I18nText(
            "Community maps",
            "Карты сообщества",
            "Мапи спільноти",
            "Карты суполкі",
            "Cartes de comminauté",
          )),
          (e.NEWS = new I18nText("News", "Новости", "Новини", "Навіны", "Nouvelles")),
          (e.SETTINGS = new I18nText(
            "Settings",
            "Настройки",
            "Налаштування",
            "Налады",
            "Paramètres",
          )),
          (e.NAME_ERROR_TOO_SHORT = new I18nText(
            "Name must be longer than 3 characters",
            "Имя должно быть длиннее 3 символов",
            "Ім'я повинно бути довшим за 3 символи",
            "Імя павінна быць даўжэй чым за 3 сімвалы",
            "Le nom doit être plus long que 3 symboles",
          )),
          (e.NAME_ERROR_CHARS = new I18nText(
            'Name can only contain English letters, numbers, spaces or "_" symbol',
            'Имя может содержать только английские буквы, цифры, пробелы или символ "_"',
            'Ім\'я може містити тільки англійські літери, цифри, пробіли або символ "_"',
            'Імя можа ўтрымліваць толькі ангельскія літары, лічбы, прабелы або сімвал "_"',
            'Le nom ne peut contenir que des lettres anglaises, espaces ou le symbole "_"',
          )),
          (e.NAME_ERROR_SPACE = new I18nText(
            "Name cannot start or end with a space",
            "Имя не может начинаться или заканчиваться пробелом",
            "Ім'я не може починатися або закінчуватися пробілом",
            "Імя не можа пачынацца ці заканчвацца прабелам",
            "Le nom ne doit pas se terminer avec une espace",
          )),
          (e.NAME_ERROR_SPACES_COUNT = new I18nText(
            "Name cannot contain more than one space in a row",
            "Имя не может содержать больше одного пробела подряд",
            "Ім'я не може містити більше одного пробілу поспіль",
            "Імя не можа ўтрымліваць больш за адзін прабел пад радок",
            "Le nom ne doit pas contenir plus qu'une espace de suite",
          )),
          (e.NAME_ERROR_UNDERSCORES_COUNT = new I18nText(
            'Name cannot contain more than one "_" symbol in a row',
            'Имя не может содержать больше одного символа "_" подряд',
            'Ім\'я не може містити більше одного символу "_" поспіль',
            'Імя не можа ўтрымліваць больш за адзін сімвал "_" пад радок',
            'Le nom ne doit pas contenir plus q\'un symbole "_" de suite',
          )),
          (e.NAME_ERROR_CANNOT_START_WITH_DIGIT = new I18nText(
            "Name cannot start with a digit",
            "Имя не может начинаться с цифры",
            "Ім'я не може починатися з цифри",
            "Імя не можа пачынацца з лічбы",
            "Le nom ne doit pas se commencer avec une chiffre",
          )),
          (e.NAME_ERROR_EXIST_OR_UNAVAILABLE = new I18nText(
            "This name already exists or unavailable",
            "Это имя уже существует или недоступно",
            "Це ім'я вже існує або недоступне",
            "Гэта імя ўжо існуе або недаступна",
            "Ce nom-ci est déjà pris ou indisponible",
          )),
          (e.PRIVACY_POLICY = new I18nText(
            "Privacy policy",
            "Политика конфиденциальности",
            "Політика конфіденційності",
            "Палітыка канфідэнцыяльнасці",
            "Politique de confidentialité",
          )),
          (e.TERMS_AND_CONDITIONS = new I18nText(
            "Terms and conditions",
            "Условия использования",
            "Умови використання",
            "Умовы выкарыстання",
            "Conditions d'usage",
          )),
          (e.LEVEL_TESTING = new I18nText(
            "Testing the level...",
            "Тестирование уровня...",
            "Тестування рівня...",
            "Тэставанне ўзроўня...",
            "Test du niveau...",
          )),
          (e.MAPS_10_LVL = new I18nText(
            "Complete level 10 to unlock maps",
            "Пройдите уровень 10, чтобы разблокировать карты",
            "Пройдіть рівень 10, щоби розблокувати мапи",
            "Прайдзіце ўзровень 10, каб разблакаваць карты",
            "Complétez le niveau 10 pour débloquer les cartes",
          )),
          (e.UNABLE_TO_SAVE = new I18nText(
            "Unable to save",
            "Не удалось сохранить",
            "Неможливо зберегти",
            "Не атрымалася захаваць",
            "Impossible de sauver",
          )),
          (e.MAP_TOO_LARGE = new I18nText(
            "Map is too large",
            "Карта слишком большая",
            "Мапа занадта вялікая",
            "Карта занадта вялікая",
            "La carte est trop grande",
          )),
          (e.SHOW_SPOILER = new I18nText(
            "Show spoiler",
            "Показать подсказку",
            "Показати підказку",
            "Паказаць падказку",
            "Montrer une astuce",
          )),
          (e.COOKIES_TITLE = new I18nText(
            "Accept cookies to start the game",
            "Примите куки, чтобы начать игру",
            "Прийміть кукі, щоби почати гру",
            "Прымеце кукі, каб пачаць гульню",
            'Accepter les "Cookies" pour commencer le jeu',
          )),
          (e.COOKIES_TEXT = new I18nText(
            'Our website uses cookies for authentication and saving the game progress.\n     We do not collect any cookies unless you click the "Accept" button below.',
            'Наш сайт использует куки для аутентификации и сохранения прогресса игры.\n      Мы не собираем никаких куки, пока вы не нажмете кнопку "Принять" ниже.',
            'Наш сайт використовує кукі для аутентифікації та збереження прогресу гри.\n      Ми не збираємо жодних кукі, поки ви не натиснете кнопку "Прийняти" нижче.',
            'Наш сайт выкарыстоўвае кукі для аўтэнтыфікацыі і захавання прагрэсу гульні.\n      Мы не збіраем ніякіх кукі, пакуль вы не націснеце кнопку "Прыняць" ніжэй.',
            'Notre site web n\'utilise les "Cookies" que pour authentification et pour saver le progrès du jeu.\n      L\'on ne collecte pas de "Cookies" si vous n\'avez encore pas cliqué sur le bouton "Accepter" ci-dessous',
          )),
          (e.AUTOSAVING = new I18nText(
            "Autosaving...",
            "Автосохранение...",
            "Автозбереження...",
            "Аўтазахаванне...",
            "Sauvegarde automatique",
          )),
          (e.ACTIVATES = new I18nText(
            "Activates:",
            "Активируется:",
            "Активується:",
            "Актывуецца:",
            "S'active :",
          )),
          (e.ON_ACTIVATION = new I18nText(
            "On activation:",
            "При активации:",
            "При активації:",
            "Пры актывацыі:",
            "Quand activé :",
          )),
          (e.LANGUAGE = new I18nText("Language", "Язык", "Мова", "Мова", "Langue")),
          (e.SHOW_CONTROLS_HINTS = new I18nText(
            "Show controls hints",
            "Показывать подсказки управления",
            "Показувати підказки управління",
            "Паказваць падказкі кіравання",
            "Afficher les conseils sur les contrôles",
          )),
          (e.SHOW_CHUNK_BORDERS = new I18nText(
            "Show chunk borders",
            "Показывать границы чанков",
            "Показувати межі чанків",
            "Паказваць межы чанкаў",
            "Afficher les bordures des chunks",
          )),
          (e.SHOW_FPS = new I18nText(
            "Show FPS",
            "Показывать FPS",
            "Показувати FPS",
            "Паказваць FPS",
            "Afficher les FPS",
          )),
          (e.MAX_ZOOM_OUT = new I18nText(
            "Max zoom out",
            "Максимальное отдаление",
            "Максимальне віддалення",
            "Максімальнае аддаленне",
            "Zoom arrière maximum",
          )),
          (e.MENU_TOOLS = new I18nText(
            "tools",
            "инструменты",
            "інструменти",
            "інструменты",
            "outils",
          )),
          (e.MENU_ARROWS = new I18nText(
            "arrows",
            "стрелочки",
            "стрілочки",
            "стрэлачкі",
            "flèches",
          )),
          (e.TOOL_ROTATE = new I18nText(
            "rotate",
            "повернуть",
            "повернути",
            "павярнуць",
            "tourner",
          )),
          (e.TOOL_FLIP = new I18nText(
            "flip",
            "отразить",
            "віддзеркалити",
            "адлюстраваць",
            "retourner",
          )),
          (e.TOOL_DELETE = new I18nText("delete", "удалить", "видалити", "выдаліць", "supprimer")),
          (e.TOOL_SELECT = new I18nText(
            "select",
            "выделить",
            "виділити",
            "вылучыць",
            "sélectionner",
          )),
          (e.TOOL_BACK = new I18nText("back", "назад", "назад", "назад", "retour")),
          (e.TOOL_COPY = new I18nText("copy", "копировать", "копіювати", "капіраваць", "copier")),
          (e.TOOL_PASTE = new I18nText("paste", "вставить", "вставити", "ўставіць", "coller")),
          (e.TOOL_CUT = new I18nText("cut", "вырезать", "вирізати", "выразаць", "couper")),
          (e.TOOL_SWITCH_PIVOT = new I18nText(
            "pivot point",
            "центр вращения",
            "центр обертання",
            "цэнтр павароту",
            "point de pivot",
          )),
          (e.BUTTON_BACK_TO_MENU = new I18nText(
            "Back to menu",
            "Назад в меню",
            "Назад до меню",
            "Назад у меню",
            "Retour au menu",
          )),
          (e.SETTINGS_INTERFACE_MODE = new I18nText(
            "Interface mode",
            "Режим интерфейса",
            "Режим інтерфейсу",
            "Рэжым інтэрфейсу",
            "Mode d’interface",
          )),
          (e.SETTINGS_INTERFACE_OPTION_AUTO = new I18nText("Auto", "Авто", "Авто", "Аўта", "Auto")),
          (e.SETTINGS_INTERFACE_OPTION_MOBILE = new I18nText(
            "Mobile",
            "Мобильный",
            "Мобільний",
            "Мабільны",
            "Mobile",
          )),
          (e.SETTINGS_INTERFACE_OPTION_DESKTOP = new I18nText(
            "Desktop",
            "Десктопный",
            "Десктопний",
            "Дэсктопны",
            "Bureau",
          )),
          (e.CONTINUE_AS_GUEST = new I18nText(
            "Continue as Guest",
            "Продолжить как гость",
            "Продовжити як гість",
            "Працягнуць як госць",
            "Continuer en tant qu’invité",
          )));
      })(o || (exports.GameText = o = {}));
    },
    GuidePage(exports) {
      const ArrowDescriptions = require("ArrowDescriptions").ArrowDescriptions,
        UIArrowInfo = require("UIArrowInfo").UIArrowInfo,
        Page = require("Page").Page;
      class n extends Page {
        constructor(e) {
          super(e);
          const t = ArrowDescriptions.getArrowsCount();
          for (let e = 1; e < t; e++) this.addArrowInfo(e);
        }
        getClass() {
          return "guide-page";
        }
        addArrowInfo(e) {
          22 !== e && 23 !== e && new UIArrowInfo(this.mainDiv, e);
        }
      }
      exports.GuidePage = n;
    },
    NameChangePage(exports) {
      const GameText = require("GameText").GameText,
        Backend = require("Backend").Backend,
        Page = require("Page").Page;
      class n extends Page {
        constructor(e) {
          super(e);
          const t = document.createElement("div");
          ((t.className = "name-change-center-div"), this.mainDiv.appendChild(t));
          const s = document.createElement("div");
          ((s.className = "name-change-title"),
            (s.innerText = GameText.SET_NAME.get()),
            t.appendChild(s));
          const a = document.createElement("input");
          ((a.className = "name-change-input"),
            (a.type = "text"),
            (a.maxLength = 20),
            (a.placeholder = GameText.NAME.get()),
            t.appendChild(a));
          const n = document.createElement("div");
          ((n.className = "name-change-message"), t.appendChild(n));
          const r = document.createElement("div");
          ((r.className = "name-change-button-div"), t.appendChild(r));
          const l = document.createElement("div");
          ((l.className = "name-change-button"),
            (l.innerText = GameText.CANCEL.get()),
            (l.onclick = () => Backend.logout()),
            r.appendChild(l));
          const h = document.createElement("div");
          ((h.className = "name-change-button"),
            (h.innerText = GameText.ACCEPT.get()),
            (h.onclick = async () => {
              const e = a.value;
              n.innerText = await this.acceptCallback(e);
            }),
            r.appendChild(h));
        }
        acceptCallback = async (e) =>
          e.length < 3
            ? GameText.NAME_ERROR_TOO_SHORT.get()
            : e.includes("  ")
              ? GameText.NAME_ERROR_SPACES_COUNT.get()
              : e.includes("__")
                ? GameText.NAME_ERROR_UNDERSCORES_COUNT.get()
                : " " === e.charAt(0) || " " === e.at(-1)
                  ? GameText.NAME_ERROR_SPACE.get()
                  : e.charAt(0).match(/[0-9]/)
                    ? GameText.NAME_ERROR_CANNOT_START_WITH_DIGIT.get()
                    : e.match(/^[A-Za-z0-9_\s]+$/)
                      ? (await Backend.setName(e))
                        ? ((window.location.href = "/maps"), "")
                        : GameText.NAME_ERROR_EXIST_OR_UNAVAILABLE.get()
                      : GameText.NAME_ERROR_CHARS.get();
        getClass() {
          return "name-change-page";
        }
      }
      exports.NameChangePage = n;
    },
    PlayerAccess(exports) {
      class s {
        arrowGroups = [
          [1, 2, 3, 4, 5],
          [6, 7, 8, 9],
          [10, 11, 12, 13, 14],
          [15, 16, 17, 18, 19],
          [20, 21, 24, 25],
        ];
        canMove = true;
        canZoom = true;
        canPause = true;
        canOpenMenu = true;
        canChangeSpeed = true;
        canSetArrows = true;
        canDelete = true;
        canRotate = true;
        canFlip = true;
        canSelect = true;
        canCopy = true;
        canPaste = true;
        canPick = true;
        canUndo = true;
        canClearSignals = true;
        canRunOneTick = true;
        static makeCopy(e) {
          return {
            ...e,
          };
        }
        static makeLevelSpectator() {
          const e = this.makeSpectator();
          return ((e.canClearSignals = false), (e.canRunOneTick = false), e);
        }
        static makeSpectator() {
          return {
            canSetArrows: false,
            canDelete: false,
            canRotate: false,
            canFlip: false,
            canSelect: false,
            canCopy: false,
            canPaste: false,
            canPick: false,
            canUndo: false,
          };
        }
        static makeOnly(e) {
          const t = new s();
          return (
            (t.arrowGroups = [[]]),
            (t.canMove = false),
            (t.canZoom = false),
            (t.canPause = false),
            (t.canOpenMenu = false),
            (t.canChangeSpeed = false),
            (t.canSetArrows = false),
            (t.canDelete = false),
            (t.canRotate = false),
            (t.canFlip = false),
            (t.canSelect = false),
            (t.canCopy = false),
            (t.canPaste = false),
            (t.canPick = false),
            (t.canUndo = false),
            (t.canClearSignals = false),
            (t.canRunOneTick = false),
            {
              ...t,
              ...e,
            }
          );
        }
      }
      exports.PlayerAccess = s;
    },
    loadShader(exports) {
      const s = new Map();
      exports.loadShader = async function (e) {
        if (s.has(e)) return Promise.resolve(s.get(e));
        const t = await fetch(e);
        if (t.ok && "text/html" !== t.headers.get("Content-Type")) {
          const i = await t.text();
          return (s.set(e, i), i);
        }
        return Promise.reject(new Error(`Error loading shader: ${e}`));
      };
    },
    Page(exports) {
      exports.Page = class {
        mainDiv;
        isDeleted;
        constructor(e) {
          ((this.isDeleted = false),
            (this.mainDiv = document.createElement("div")),
            (this.mainDiv.className = this.getClass()),
            undefined !== e
              ? e.appendChild(this.mainDiv)
              : document.body.appendChild(this.mainDiv));
        }
        dispose() {
          ((this.isDeleted = true), this.mainDiv.remove());
        }
      };
    },
    PlayerState(exports) {
      exports.PlayerState = class {
        static userName = "";
        static completedLevels = [];
        static isGuest = false;
      };
    },
    MenuPage(exports) {
      const GameText = require("GameText").GameText;
      exports.MenuPage = class {
        page;
        mainDiv;
        sideBar;
        content;
        selectedCategory;
        categories = new Map([
          ["levels", [GameText.LEVELS.get(), "res/icons/icon-levels.svg", null]],
          ["maps", [GameText.MAPS.get(), "res/icons/icon-maps.svg", null]],
          ["guide", [GameText.GUIDE.get(), "res/icons/icon-guide.svg", null]],
          ["settings", [GameText.SETTINGS.get(), "res/icons/icon-settings.svg", null]],
        ]);
        action;
        constructor(e, t) {
          ((this.action = t),
            (this.page = null),
            (this.mainDiv = document.createElement("div")),
            document.body.appendChild(this.mainDiv),
            (this.mainDiv.id = "menu-page-main-div"),
            (this.sideBar = document.createElement("div")),
            this.mainDiv.appendChild(this.sideBar),
            (this.sideBar.id = "menu-page-side-bar"),
            (this.content = document.createElement("div")),
            this.mainDiv.appendChild(this.content),
            (this.content.id = "menu-page-content"));
          for (const e of this.categories) this.addMenuItem(e[0]);
          ((this.selectedCategory = e), this.updateSelectedCategory());
        }
        setCategory(e) {
          ((this.selectedCategory = e), this.updateSelectedCategory());
        }
        getContent() {
          return this.content;
        }
        dispose() {
          this.mainDiv.remove();
        }
        addMenuItem(e) {
          this.selectedCategory = e;
          const t = this.categories.get(e);
          if (undefined === t) return;
          const s = t[0],
            i = t[1],
            o = document.createElement("div");
          ((t[2] = o), (o.className = "side-menu-element"), this.sideBar.appendChild(o));
          const a = document.createElement("img");
          ((a.className = "side-menu-icon"),
            (a.src = i),
            (a.ondragstart = () => false),
            o.appendChild(a));
          const n = document.createElement("div");
          ((n.className = "side-menu-title"),
            (n.innerText = s),
            o.appendChild(n),
            (o.onclick = () => {
              this.selectedCategory !== e &&
                ("back" === e && (window.location.href = "/login"),
                (this.selectedCategory = e),
                this.updateSelectedCategory(),
                this.action(this.selectedCategory));
            }));
        }
        updateSelectedCategory() {
          for (const e of this.categories) {
            const t = e[1][2];
            null !== t &&
              (e[0] === this.selectedCategory
                ? t.classList.add("side-menu-element-selected")
                : t.classList.remove("side-menu-element-selected"));
          }
        }
      };
    },
    UISavedItem(exports) {
      const GameText = require("GameText").GameText,
        Backend = require("Backend").Backend,
        UIComponent = require("UIComponent").UIComponent,
        UIOkCancel = require("UIOkCancel").UIOkCancel;
      class r extends UIComponent {
        constructor(e, t, s) {
          (super(e), this.element.addEventListener("click", () => s(t)));
          const a = document.createElement("div");
          ((a.className = "ui-saved-item-top"), this.element.appendChild(a));
          const r = document.createElement("div");
          ((r.className = "ui-saved-item-name"), (r.innerText = t.name), a.appendChild(r));
          const l = document.createElement("img");
          ((l.src = t.isPublic ? "res/icons/icon_public_active.svg" : "res/icons/icon_public.svg"),
            (l.className = "ui-saved-item-public-checkbox"),
            t.isPublic || l.classList.add("ui-saved-item-public-checkbox-unchecked"),
            l.addEventListener("click", (e) => {
              (e.stopPropagation(),
                (t.isPublic = !t.isPublic),
                Backend.saveMapInfo(t, () => {}),
                (l.src = t.isPublic
                  ? "res/icons/icon_public_active.svg"
                  : "res/icons/icon_public.svg"),
                l.classList.toggle("ui-saved-item-public-checkbox-unchecked"));
            }),
            a.appendChild(l));
          const h = document.createElement("div");
          ((h.className = "ui-saved-item-bottom"), this.element.appendChild(h));
          const c = document.createElement("div");
          ((c.className = "ui-saved-item-tags"),
            h.appendChild(c),
            (c.innerText = t.tags.join(", ")));
          const d = document.createElement("img");
          ((d.src = "res/icons/icon_bin.svg"),
            (d.alt = GameText.DELETE.get()),
            (d.className = "ui-saved-item-delete"),
            h.appendChild(d));
          const u = () => {
            Backend.deleteMap(t.id, () => {
              this.dispose();
            });
          };
          d.addEventListener("click", (e) => {
            e.stopPropagation();
            const s = `${GameText.DELETE.get()} ${t.name}?`;
            new UIOkCancel(document.body, s, GameText.DELETE.get(), u);
          });
        }
        dispose() {
          this.remove();
        }
        getClass() {
          return "ui-saved-item";
        }
      }
      exports.UISavedItem = r;
    },
    Levels(exports) {
      const LevelArrow = require("LevelArrow").LevelArrow,
        PlayerAccess = require("PlayerAccess").PlayerAccess,
        UIGameView = require("UIGameView").UIGameView,
        LevelInfo = require("LevelInfo").LevelInfo,
        LevelOverlayInfo = require("LevelOverlayInfo").LevelOverlayInfo;
      class l {
        static levels = new Map();
        static levelOverlayInfos = new Map();
        static levelInitActions = new Map([
          [
            0,
            (e) => {
              (e.levelArrows.push(new LevelArrow(23, 0, 0, (e) => 1 === e.arrow.signal)),
                e.levelArrows.push(new LevelArrow(22, 0, 10, (e) => ((e.arrow.signal = 1), true))));
              const t = this.levelRights.get(e.info.id);
              (undefined !== t && e.playerControls.updatePlayerAccess(t),
                e.initLevel(),
                e.showTutorial((e) => {
                  const t = new UIGameView(e, "AAABAAAAAAACFwAAAAEDEAAgADAAQAAWAFAA");
                  t.setResizeAction(() => t.game.focusOnBox(1, 0, 0, 6, 0.5, 1));
                }));
            },
          ],
          [
            1,
            (e) => {
              e.game.focusOnBox(0, -5, 1, 8, 3, 1);
              const t = (e) => (
                  null === e.state && 1 === e.arrow.signal && (e.state = 1),
                  2 === e.state && 1 === e.arrow.signal
                ),
                s = [
                  [0, new LevelArrow(22, 0, 0, t)],
                  [0, new LevelArrow(22, 0, -10, t)],
                  [1, new LevelArrow(22, 0, -20, t)],
                  [2, new LevelArrow(22, 10, -20, t)],
                  [3, new LevelArrow(22, 10, -10, t)],
                  [0, new LevelArrow(22, 2, -10, t)],
                  [
                    0,
                    new LevelArrow(
                      22,
                      2,
                      -18,
                      (e) => (
                        null === e.state && 1 === e.arrow.signal && (e.state = 1),
                        1 === e.arrow.signal
                      ),
                    ),
                  ],
                ],
                o = [
                  () => {
                    (e.game.focusOnBox(0, -10, 0, 10, 3, 0.01), e.nextTutorialStep());
                  },
                  () => {
                    (e.game.focusOnBox(0, -25, 0, -5, 3, 0.01),
                      setTimeout(() => {
                        (e.game.focusOnBox(0, -10, 0, 10, 3, 0.02),
                          e.playerControls.updatePlayerAccess({
                            canMove: true,
                            canZoom: true,
                          }),
                          e.nextTutorialStep());
                      }, 2e3));
                  },
                  () => {
                    (e.game.focusOnBox(0, -20, 10, -5, 3, 0.01),
                      e.playerControls.updatePlayerAccess({
                        canRotate: true,
                      }),
                      e.nextTutorialStep());
                  },
                  () => {},
                  () => {},
                  () => {},
                  () => {},
                ],
                a = (t, i) => {
                  if (1 === t.state) {
                    t.state = 2;
                    const a = s[i + 1][1];
                    (e.levelArrows.push(a),
                      e.game.gameMap.setLevelArrow(a),
                      (a.arrow.rotation = s[i + 1][0]),
                      o[i](),
                      (e.game.screenUpdated = true));
                  }
                };
              for (let e = 0; e < s.length - 1; e++) {
                const t = s[e][1];
                t.setLevelAction(() => a(t, e));
              }
              const n = s[0][1];
              (e.levelArrows.push(n),
                e.game.gameMap.setLevelArrow(n),
                e.levelArrows.push(new LevelArrow(22, 0, 5, (e) => ((e.arrow.signal = 1), true))));
              const r = this.levelRights.get(e.info.id);
              (undefined !== r && e.playerControls.updatePlayerAccess(r),
                e.initLevel(),
                e.showTutorial());
            },
          ],
          [
            2,
            (e) => {
              const t = [0];
              let s = 0,
                o = 0;
              const n = () => {
                ((s = 0), (e.game.updateSpeedLevel = 0), e.restartLevel());
              };
              (e.levelArrows.push(
                new LevelArrow(22, -2, 10, (t) => ((t.arrow.signal = e.game.tick % 2), true)),
              ),
                e.levelArrows.push(
                  new LevelArrow(
                    22,
                    2,
                    10,
                    (t) => ((t.arrow.signal = e.game.tick % 3 == 2 ? 1 : 0), true),
                  ),
                ),
                e.levelArrows.push(
                  new LevelArrow(23, 0, 0, (i) => {
                    if (
                      (e.game.tick > 200
                        ? n()
                        : e.game.tick > 50
                          ? (e.game.updateSpeedLevel = 2)
                          : e.game.tick > 10 && (e.game.updateSpeedLevel = 1),
                      null === i.state)
                    ) {
                      if ((t.push(i.arrow.signal), t.length > 2)) {
                        let s = 1 === t.at(-1);
                        ((s &&= 1 === t.at(-2)),
                          (s &&= 1 === t.at(-3)),
                          s && ((i.state = 1), (o = e.game.tick - 3), (t.length = 0)));
                      }
                      return false;
                    }
                    const a = (e.game.tick - o) % 2,
                      r = (e.game.tick - o) % 3 == 2 ? 1 : 0;
                    return (
                      i.arrow.signal === (a | r) ? s++ : ((i.state = null), n()),
                      e.setProgress(s / 50),
                      s >= 50
                    );
                  }),
                ));
              const r = this.levelRights.get(e.info.id);
              (undefined !== r && e.playerControls.updatePlayerAccess(r),
                e.initLevel(true),
                e.showTutorial((e) => {
                  const t = new UIGameView(
                    e,
                    "AAABAAAAAAACCQGwALQAARZhAXEAgQCRALEAAgASACIAMgBCAFIAYgCiArIDYwNzAIMAkwCUA5UDtQCmArYDBwGhAKUA",
                  );
                  t.setResizeAction(() => t.game.focusOnBox(2, 4, 3, 8, 0.5, 1));
                }));
            },
          ],
          [
            3,
            (e) => {
              (e.levelArrows.push(new LevelArrow(23, 0, 0, (e) => 1 === e.arrow.signal)),
                e.levelArrows.push(new LevelArrow(23, 2, 0, (e) => 1 === e.arrow.signal)),
                e.levelArrows.push(new LevelArrow(23, 4, 0, (e) => 1 === e.arrow.signal)),
                e.levelArrows.push(new LevelArrow(23, 6, 0, (e) => 1 === e.arrow.signal)),
                e.game.gameMap.setArrowType(3, 5, 2));
              const t = e.game.gameMap.getArrow(3, 5);
              undefined !== t && (t.canBeEdited = false);
              const s = this.levelRights.get(e.info.id);
              (undefined !== s && e.playerControls.updatePlayerAccess(s),
                e.initLevel(),
                e.showTutorial());
            },
          ],
          [
            4,
            (e) => {
              (e.levelArrows.push(new LevelArrow(23, 0, 0, (e) => 1 === e.arrow.signal)),
                e.levelArrows.push(new LevelArrow(23, -2, 0, (e) => 1 === e.arrow.signal)),
                e.levelArrows.push(new LevelArrow(23, 2, 0, (e) => 1 === e.arrow.signal)),
                e.levelArrows.push(new LevelArrow(22, 0, 5, (e) => ((e.arrow.signal = 1), true))));
              const t = this.levelRights.get(e.info.id);
              (undefined !== t && e.playerControls.updatePlayerAccess(t),
                e.initLevel(),
                e.showTutorial((e) => {
                  const t = new UIGameView(
                    e,
                    "AAABAAAAAAAFCQCwAAwAsQEBEgIAEgAiADIAQgBSAGIAcgCCAJIAsgCjAbMDVAG0A1UBtQNWAVcBBwCiAAUAUwELAKQB",
                  );
                  t.setResizeAction(() => t.game.focusOnBox(2, 4, 4, 8, 0.5, 1));
                }));
            },
          ],
          [
            5,
            (e) => {
              const t = [0];
              let s = 0,
                o = 0;
              const n = () => {
                ((s = 0), (e.game.updateSpeedLevel = 0), e.restartLevel());
              };
              (e.levelArrows.push(new LevelArrow(22, 0, 10, (e) => ((e.arrow.signal = 1), true))),
                e.levelArrows.push(
                  new LevelArrow(
                    22,
                    4,
                    10,
                    (t) => ((t.arrow.signal = e.game.tick % 4 == 0 ? 1 : 0), true),
                  ),
                ),
                e.levelArrows.push(
                  new LevelArrow(23, 0, 0, (i) => {
                    if (
                      (e.game.tick > 200
                        ? n()
                        : e.game.tick > 50
                          ? (e.game.updateSpeedLevel = 2)
                          : e.game.tick > 10 && (e.game.updateSpeedLevel = 1),
                      null === i.state)
                    ) {
                      if ((t.push(i.arrow.signal), t.length > 2)) {
                        let s = 1 === t.at(-1);
                        ((s &&= 0 === t.at(-2)),
                          (s &&= 1 === t.at(-3)),
                          s && ((i.state = 1), (o = e.game.tick - 1), (t.length = 0)));
                      }
                      return false;
                    }
                    const a = (e.game.tick - o) % 4 == 0 ? 0 : 1;
                    return (
                      i.arrow.signal === a ? s++ : ((i.state = null), n()),
                      e.setProgress(s / 50),
                      s >= 50
                    );
                  }),
                ));
              const r = this.levelRights.get(e.info.id);
              (undefined !== r && e.playerControls.updatePlayerAccess(r),
                e.initLevel(true),
                e.showTutorial((e) => {
                  const t = new UIGameView(
                    e,
                    "AAABAAAAAAAGAQ8AABAAIAAwAEAAUABgAHAAQgNDA0QDNQAWAiYCNgJGAwIAgAADAEEDCwAlAAcARQMMAFYACQBmAw==",
                  );
                  t.setResizeAction(() => t.game.focusOnBox(-2, 3, 4, 6, 0.5, 1));
                }));
            },
          ],
          [
            6,
            (e) => {
              let t = 0;
              const s = () => {
                ((t = 0), (e.game.updateSpeedLevel = 0), e.restartLevel());
              };
              (e.levelArrows.push(
                new LevelArrow(
                  22,
                  0,
                  10,
                  (t) => ((t.arrow.signal = e.game.tick % 4 == 0 ? 1 : 0), true),
                ),
              ),
                e.levelArrows.push(
                  new LevelArrow(23, 0, 0, (i) => {
                    if (
                      (e.game.tick > 200
                        ? s()
                        : e.game.tick > 50
                          ? (e.game.updateSpeedLevel = 2)
                          : e.game.tick > 10 && (e.game.updateSpeedLevel = 1),
                      null === i.state)
                    )
                      return (1 === i.arrow.signal && (i.state = 1), false);
                    if (1 === i.state && 0 === i.arrow.signal) i.state = 2;
                    else {
                      if (2 !== i.state || 1 !== i.arrow.signal)
                        return ((i.state = null), s(), false);
                      i.state = 1;
                    }
                    return (t++, e.setProgress(t / 50), t >= 50);
                  }),
                ));
              const o = this.levelRights.get(e.info.id);
              (undefined !== o && e.playerControls.updatePlayerAccess(o),
                e.initLevel(true),
                e.showTutorial((e) => {
                  const t = new UIGameView(
                    e,
                    "AAABAAAAAAAFARsAABAAIAAwAEAAUABgAHAAgACQAJEDsgCTAaMBswMEABQAJAA0AEQAVABkAHQAhACUALQDdQO1AwkAsQAGAJIBBwCiAAsApAEFAYUAlQE=",
                  );
                  t.setResizeAction(() => t.game.focusOnBox(-1, 2, 6, 5, 0.5, 1));
                }));
            },
          ],
          [
            7,
            (e) => {
              let t = 0;
              const s = [1, 4, 5, 8, 9, 10],
                o = [0, 3, 7],
                n = [0];
              let r = 0;
              const l = () => {
                ((t = 0), (e.game.updateSpeedLevel = 0), e.restartLevel());
              };
              (e.levelArrows.push(
                new LevelArrow(
                  22,
                  0,
                  10,
                  (t) => (
                    (t.arrow.signal = 0),
                    s.includes(e.game.tick % 12) && (t.arrow.signal = 1),
                    true
                  ),
                ),
              ),
                e.levelArrows.push(
                  new LevelArrow(23, 0, 0, (s) => {
                    if (
                      (e.game.tick > 200
                        ? l()
                        : e.game.tick > 50
                          ? (e.game.updateSpeedLevel = 2)
                          : e.game.tick > 10 && (e.game.updateSpeedLevel = 1),
                      null === s.state)
                    ) {
                      if ((n.push(s.arrow.signal), n.length > 3)) {
                        let t = 0 === n.at(-1);
                        ((t &&= 1 === n.at(-2)),
                          (t &&= 1 === n.at(-3)),
                          (t &&= 0 === n.at(-4)),
                          t && ((s.state = 1), (r = e.game.tick - 3), (n.length = 0)));
                      }
                      return false;
                    }
                    let i = 0 === s.arrow.signal && o.includes((e.game.tick - r) % 12);
                    return (
                      (i ||= 1 === s.arrow.signal && !o.includes((e.game.tick - r) % 12)),
                      i ? t++ : ((s.state = null), l()),
                      e.setProgress(t / 50),
                      t >= 50
                    );
                  }),
                ));
              const h = this.levelRights.get(e.info.id);
              (undefined !== h && e.playerControls.updatePlayerAccess(h),
                e.initLevel(true),
                e.showTutorial((e) => {
                  let t =
                    "AAACAAAAAAAHARgAABAAIAAwAEAAUABgAHAAgACQAJEDogCTAcMA0wDzAQQAFAAkADQARABUAGQ";
                  t +=
                    "AdACEAAYAkgEQALIAEwDCAAwA0gAOAOIABwHyAJQACwKzA/QBlQMAAAEAAQkAAQABAwIAAwMEAwUD";
                  const s = new UIGameView(
                    e,
                    "AAACAAAAAAAHARgAABAAIAAwAEAAUABgAHAAgACQAJEDogCTAcMA0wDzAQQAFAAkADQARABUAGQAdACEAAYAkgEQALIAEwDCAAwA0gAOAOIABwHyAJQACwKzA/QBlQMAAAEAAQkAAQABAwIAAwMEAwUD",
                  );
                  s.setResizeAction(() => s.game.focusOnBox(-1, 2, 6, 5, 0.5, 1));
                }));
            },
          ],
          [
            8,
            (e) => {
              let t = 0;
              const s = [0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0],
                o = [0];
              let a = 0;
              const n = () => {
                ((t = 0), (e.game.updateSpeedLevel = 0), e.restartLevel());
              };
              (e.levelArrows.push(
                new LevelArrow(
                  22,
                  0,
                  10,
                  (t) => ((t.arrow.signal = s[e.game.tick % s.length]), true),
                ),
              ),
                e.levelArrows.push(
                  new LevelArrow(23, 0, 0, (i) => {
                    if (
                      (e.game.tick > 200
                        ? n()
                        : e.game.tick > 50
                          ? (e.game.updateSpeedLevel = 2)
                          : e.game.tick > 10 && (e.game.updateSpeedLevel = 1),
                      null === i.state)
                    ) {
                      if ((o.push(i.arrow.signal), o.length > 2)) {
                        let t = 1 === o.at(-1);
                        ((t &&= 0 === o.at(-2)),
                          (t &&= 1 === o.at(-3)),
                          t && ((i.state = 1), (a = e.game.tick - 2), (o.length = 0)));
                      }
                      return false;
                    }
                    return (
                      i.arrow.signal === 1 - s[(e.game.tick - a) % s.length]
                        ? t++
                        : ((i.state = null), n()),
                      e.setProgress(t / 50),
                      t >= 50
                    );
                  }),
                ));
              const r = this.levelRights.get(e.info.id);
              (undefined !== r && e.playerControls.updatePlayerAccess(r),
                e.initLevel(true),
                e.showTutorial());
            },
          ],
          [
            9,
            (e) => {
              let t = 0;
              const s = [0, 1, 1, 0],
                o = [0];
              let n = 0;
              const r = () => {
                ((t = 0), (e.game.updateSpeedLevel = 0), e.restartLevel());
              };
              e.levelArrows.push(
                new LevelArrow(23, 0, 0, (i) => {
                  if (
                    (e.game.tick > 200
                      ? r()
                      : e.game.tick > 50
                        ? (e.game.updateSpeedLevel = 2)
                        : e.game.tick > 10 && (e.game.updateSpeedLevel = 1),
                    null === i.state)
                  ) {
                    if ((o.push(i.arrow.signal), o.length > 3)) {
                      let t = 0 === o.at(-1);
                      ((t &&= 1 === o.at(-2)),
                        (t &&= 1 === o.at(-3)),
                        (t &&= 0 === o.at(-4)),
                        t && ((i.state = 1), (n = e.game.tick - 3), (o.length = 0)));
                    }
                    return false;
                  }
                  return (
                    i.arrow.signal === s[(e.game.tick - n) % s.length]
                      ? t++
                      : ((i.state = null), r()),
                    e.setProgress(t / 50),
                    t >= 50
                  );
                }),
              );
              const l = this.levelRights.get(e.info.id);
              (undefined !== l && e.playerControls.updatePlayerAccess(l),
                e.initLevel(true),
                e.showTutorial((e) => {
                  const t = new UIGameView(e, "AAABAAAAAAADFwAAAAEDEAAgADAAQAACAFAAAwBRAw==");
                  t.setResizeAction(() => t.game.focusOnBox(-2, 0, 3, 4, 0.5, 1));
                }));
            },
          ],
          [
            10,
            (e) => {
              let t = 0;
              const s = [0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0],
                o = [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0],
                n = [0];
              let r = 0;
              const l = () => {
                ((t = 0), (e.game.updateSpeedLevel = 0), e.restartLevel());
              };
              (e.levelArrows.push(
                new LevelArrow(
                  22,
                  0,
                  10,
                  (t) => ((t.arrow.signal = s[e.game.tick % s.length]), true),
                ),
              ),
                e.game.gameMap.setArrowType(0, 5, 4));
              const h = e.game.gameMap.getArrow(0, 5);
              (undefined !== h && (h.canBeEdited = false),
                e.levelArrows.push(
                  new LevelArrow(23, 0, 0, (s) => {
                    if (
                      (e.game.tick > 200
                        ? l()
                        : e.game.tick > 50
                          ? (e.game.updateSpeedLevel = 2)
                          : e.game.tick > 10 && (e.game.updateSpeedLevel = 1),
                      null === s.state)
                    ) {
                      if ((n.push(s.arrow.signal), n.length > 4)) {
                        let t = 1 === n.at(-1);
                        ((t &&= 0 === n.at(-2)),
                          (t &&= 0 === n.at(-3)),
                          (t &&= 0 === n.at(-4)),
                          (t &&= 0 === n.at(-5)),
                          t && ((s.state = 1), (r = e.game.tick - 1), (n.length = 0)));
                      }
                      return false;
                    }
                    const i = o[(e.game.tick - r) % o.length];
                    return (
                      s.arrow.signal === i ? t++ : ((s.state = null), l()),
                      e.setProgress(t / 50),
                      t >= 50
                    );
                  }),
                ));
              const c = this.levelRights.get(e.info.id);
              (undefined !== c && e.playerControls.updatePlayerAccess(c),
                e.initLevel(true),
                e.showTutorial((e) => {
                  let t = "AAACAAAAAAAHARcAABAAIAAwAEAAUABgAHAAgACQAJEDogCTAdMA4wAEABQAJAA0AEQAV";
                  t +=
                    "ABkAHQAhAAGAJIBDAGyAOIAEADCABMA0gAOAfIAlAALAMMDAwCFAwAAAQADCQARAAcAAgABBBIAAwETAxQDFQMLAAQB";
                  const s = new UIGameView(
                    e,
                    "AAACAAAAAAAHARcAABAAIAAwAEAAUABgAHAAgACQAJEDogCTAdMA4wAEABQAJAA0AEQAVABkAHQAhAAGAJIBDAGyAOIAEADCABMA0gAOAfIAlAALAMMDAwCFAwAAAQADCQARAAcAAgABBBIAAwETAxQDFQMLAAQB",
                  );
                  s.setResizeAction(() => s.game.focusOnBox(-1, 2, 6, 5, 0.5, 1));
                }));
            },
          ],
        ]);
        static levelRights = new Map([
          [
            0,
            PlayerAccess.makeOnly({
              canSetArrows: true,
              arrowGroups: [[1]],
            }),
          ],
          [
            1,
            PlayerAccess.makeOnly({
              canSetArrows: true,
              arrowGroups: [[1]],
            }),
          ],
          [
            2,
            PlayerAccess.makeOnly({
              canSetArrows: true,
              canMove: true,
              canZoom: true,
              canRotate: true,
              canDelete: true,
              arrowGroups: [[1]],
            }),
          ],
          [
            3,
            PlayerAccess.makeOnly({
              canSetArrows: true,
              canMove: true,
              canZoom: true,
              canRotate: true,
              canDelete: true,
              arrowGroups: [[1]],
            }),
          ],
          [
            4,
            PlayerAccess.makeOnly({
              canSetArrows: true,
              canMove: true,
              canZoom: true,
              canRotate: true,
              canDelete: true,
              arrowGroups: [[1, 5]],
            }),
          ],
          [
            5,
            PlayerAccess.makeOnly({
              canSetArrows: true,
              canMove: true,
              canZoom: true,
              canRotate: true,
              canDelete: true,
              arrowGroups: [[1, 3]],
            }),
          ],
          [
            6,
            PlayerAccess.makeOnly({
              canSetArrows: true,
              canMove: true,
              canZoom: true,
              canRotate: true,
              canDelete: true,
              arrowGroups: [[1, 5]],
            }),
          ],
          [
            7,
            PlayerAccess.makeOnly({
              canSetArrows: true,
              canMove: true,
              canZoom: true,
              canRotate: true,
              canDelete: true,
              arrowGroups: [[1, 4, 5]],
            }),
          ],
          [
            8,
            PlayerAccess.makeOnly({
              canSetArrows: true,
              canMove: true,
              canZoom: true,
              canRotate: true,
              canDelete: true,
              arrowGroups: [[1, 2, 3]],
            }),
          ],
          [
            9,
            PlayerAccess.makeOnly({
              canSetArrows: true,
              canMove: true,
              canZoom: true,
              canRotate: true,
              canDelete: true,
              arrowGroups: [[1, 2, 3]],
            }),
          ],
          [
            10,
            PlayerAccess.makeOnly({
              canSetArrows: true,
              canMove: true,
              canZoom: true,
              canRotate: true,
              canDelete: true,
              arrowGroups: [[1, 2, 3, 5]],
            }),
          ],
        ]);
        static {
          (this.addLevel(0, [1], 15, 7, 5, [[2, -1, 1]]),
            this.addLevel(1, [2], 15, -1, 5, [[2, -1, 1]]),
            this.addLevel(2, [3], 15, -9, 5, [[2, -1, 1]]),
            this.addLevel(3, [4, 5], 15, -17, 5, [
              [-1, 2, 1],
              [5, 2, 1],
            ]),
            this.addLevel(4, [6], 0, -17, 5, [[2, -1, 1]]),
            this.addLevel(5, [8], 30, -17, 5, [[2, -1, 1]]),
            this.addLevel(6, [7], 2, -27, 5, [[3, -1, 2]]),
            this.addLevel(7, [10], 8, -36, 5, [[4, -1, 2]]),
            this.addLevel(8, [9], 28, -27, 5, [[1, -1, 2]]),
            this.addLevel(9, [10], 22, -36, 5, [[0, -1, 2]]),
            this.addLevel(10, [], 15, -45, 5, [[2, -1, 2]]),
            this.setPreviousLevels());
        }
        static completeLevel(e) {
          const t = this.levels.get(e);
          undefined !== t &&
            (t.setState("completed"),
            t.nextLevels.forEach((e) => {
              const t = this.levels.get(e);
              undefined !== t &&
                "completed" !== t.state &&
                this.allPreviousLevelsCompleted(t) &&
                t.setState("unlocked");
            }));
        }
        static unlockLevel(e) {
          const t = this.levels.get(e);
          undefined !== t && t.setState("unlocked");
        }
        static startLevel(e) {
          this.levelInitActions.get(e.info.id)?.(e);
        }
        static addLevel(e, t, s, i, o, a) {
          const l = new LevelInfo(e, t),
            h = new LevelOverlayInfo(s, i, o, o, a);
          (this.levels.set(e, l), this.levelOverlayInfos.set(e, h));
        }
        static setPreviousLevels() {
          this.levels.forEach((e) => {
            e.nextLevels.forEach((t) => {
              const s = this.levels.get(t);
              undefined !== s && s.previousLevels.push(e.id);
            });
          });
        }
        static allPreviousLevelsCompleted(e) {
          for (let t = 0; t < e.previousLevels.length; t++) {
            const s = l.levels.get(e.previousLevels[t]);
            if (undefined === s || "completed" !== s.state) return false;
          }
          return true;
        }
      }
      exports.Levels = l;
    },
    SettingsPage(exports) {
      const GameText = require("GameText").GameText,
        LangSettings = require("LangSettings").LangSettings,
        LangUtils = require("LangUtils").LangUtils,
        PlayerState = require("PlayerState").PlayerState,
        Backend = require("Backend").Backend,
        Page = require("Page").Page,
        h = ["auto", "desktop", "mobile"];
      class c extends Page {
        table;
        constructor(e) {
          (super(e),
            (this.table = document.createElement("table")),
            this.table.classList.add("settings-table"),
            this.mainDiv.appendChild(this.table),
            this.addBlock(GameText.NAME.get(), () => {
              const e = document.createElement("div");
              return (
                (e.className = "account-user-name-title"),
                (e.innerText = PlayerState.userName),
                e
              );
            }),
            this.addLine(),
            this.addBlock(GameText.LANGUAGE.get(), () => {
              const e = document.createElement("select");
              e.classList.add("lang-select");
              for (let t = 0; t < LangSettings.languages.length; t++) {
                const s = document.createElement("option");
                ((s.value = LangSettings.languages[t]),
                  (s.innerText = LangSettings.languageNames[t]),
                  e.appendChild(s));
              }
              return (
                (e.value = LangSettings.getLanguage()),
                e.addEventListener("change", () => {
                  const t = LangUtils.getLanguageFromString(e.value);
                  (LangSettings.setLanguage(t),
                    localStorage.setItem("lang", t),
                    window.location.reload());
                }),
                e
              );
            }),
            this.addBlock(GameText.SHOW_CONTROLS_HINTS.get(), () => {
              const e = document.createElement("input");
              return (
                (e.type = "checkbox"),
                (e.checked = "false" !== localStorage.getItem("show-controls-hints")),
                e.addEventListener("change", () => {
                  localStorage.setItem("show-controls-hints", e.checked.toString());
                }),
                e
              );
            }),
            this.addBlock(GameText.SHOW_CHUNK_BORDERS.get(), () => {
              const e = document.createElement("input");
              return (
                (e.type = "checkbox"),
                (e.checked = "true" === localStorage.getItem("show-chunk-borders")),
                e.addEventListener("change", () => {
                  localStorage.setItem("show-chunk-borders", e.checked.toString());
                }),
                e
              );
            }),
            this.addBlock(GameText.SHOW_FPS.get(), () => {
              const e = document.createElement("input");
              return (
                (e.type = "checkbox"),
                (e.checked = "true" === localStorage.getItem("show-fps")),
                e.addEventListener("change", () => {
                  localStorage.setItem("show-fps", e.checked.toString());
                }),
                e
              );
            }),
            this.addBlock(GameText.MAX_ZOOM_OUT.get(), () => {
              const e = document.createElement("div"),
                t = document.createElement("input"),
                s = document.createElement("span");
              return (
                (t.type = "range"),
                (t.min = "1"),
                (t.max = "5"),
                (t.step = "1"),
                (t.value = localStorage.getItem("max-zoom-out") || "1"),
                t.addEventListener("change", () => {
                  (localStorage.setItem("max-zoom-out", t.value), (s.innerText = `${t.value}x`));
                }),
                (t.style.display = "inline"),
                e.appendChild(t),
                (s.innerText = `${t.value}x`),
                (s.className = "setting-max-zoom-out-text"),
                e.appendChild(s),
                e
              );
            }),
            this.addBlock(GameText.SETTINGS_INTERFACE_MODE.get(), () => {
              const e = document.createElement("select");
              e.classList.add("interface-mode-select");
              const t = [
                GameText.SETTINGS_INTERFACE_OPTION_AUTO,
                GameText.SETTINGS_INTERFACE_OPTION_DESKTOP,
                GameText.SETTINGS_INTERFACE_OPTION_MOBILE,
              ];
              for (let s = 0; s < h.length; s++) {
                const i = document.createElement("option");
                ((i.value = h[s]), (i.innerText = t[s].get()), e.appendChild(i));
              }
              return (
                (e.value = localStorage.getItem("interface-mode") || "auto"),
                e.addEventListener("change", () => {
                  (localStorage.setItem("interface-mode", e.value), window.location.reload());
                }),
                e
              );
            }),
            this.addLine());
          const t = document.createElement("div");
          ((t.className = "logout-button"),
            (t.innerText = GameText.LOGOUT.get()),
            (t.onclick = () => Backend.logout()),
            this.addElement(t));
        }
        getClass() {
          return "settings-page";
        }
        addBlock(e, t) {
          const s = document.createElement("tr");
          this.table.appendChild(s);
          const i = document.createElement("td");
          (i.classList.add("setting-name"), (i.innerText = `${e}:`), s.appendChild(i));
          const o = document.createElement("td");
          (o.classList.add("setting-value"), o.appendChild(t()), s.appendChild(o));
        }
        addLine() {
          const e = document.createElement("tr");
          this.table.appendChild(e);
          const t = document.createElement("td");
          (t.classList.add("setting-divider"), (t.colSpan = 2));
          const s = document.createElement("hr");
          (t.appendChild(s), e.appendChild(t));
        }
        addElement(e) {
          const t = document.createElement("tr");
          this.table.appendChild(t);
          const s = document.createElement("td");
          ((s.colSpan = 2), s.appendChild(e), t.appendChild(s));
        }
      }
      exports.SettingsPage = c;
    },
    LangUtils(exports) {
      var s;
      (function (e) {
        ((e.getLanguageFromString = function (e) {
          switch (e) {
            case "en":
            default:
              return "en";
            case "ru":
              return "ru";
            case "ua":
              return "ua";
            case "by":
              return "by";
            case "fr":
              return "fr";
          }
        }),
          (e.getLanguageFromName = function (e) {
            switch (e) {
              case "English":
              default:
                return "en";
              case "Русский":
                return "ru";
              case "Українська":
                return "ua";
              case "Беларуская":
                return "by";
              case "Français":
                return "fr";
            }
          }));
      })(s || (exports.LangUtils = s = {}));
    },
    UIGameView(exports) {
      const Game = require("Game").Game,
        load = require("load").load,
        UIComponent = require("UIComponent").UIComponent;
      class n extends UIComponent {
        game;
        time;
        isDeleted;
        resizeAction;
        constructor(e, t) {
          (super(e), (this.time = 0), (this.isDeleted = false), (this.resizeAction = () => {}));
          const s = document.createElement("canvas");
          ((s.className = "ui-game-view-canvas"),
            this.element.appendChild(s),
            (this.game = new Game(s)),
            this.resize());
          const a = window
            .atob(t)
            .split("")
            .map((e) => e.charCodeAt(0));
          ((0, load)(this.game.gameMap, a),
            (this.game.drawPastedArrows = true),
            window.requestAnimationFrame(this.update),
            window.addEventListener("resize", this.resize));
        }
        getClass() {
          return "ui-game-view";
        }
        setResizeAction(e) {
          ((this.resizeAction = e), this.resizeAction());
        }
        remove() {
          ((this.isDeleted = true),
            window.removeEventListener("resize", this.resize),
            this.game.dispose(),
            super.remove());
        }
        resize = () => {
          const e = this.element.clientWidth * window.devicePixelRatio,
            t = this.element.clientHeight * window.devicePixelRatio;
          (this.game.resize(e, t), this.resizeAction());
        };
        update = () => {
          this.isDeleted ||
            (this.game.updateFrame(),
            this.game.draw(),
            (this.time += 0.017),
            window.requestAnimationFrame(this.update));
        };
      }
      exports.UIGameView = n;
    },
    LevelPage(exports) {
      const ArrowDescriptions = require("ArrowDescriptions").ArrowDescriptions,
        GameText = require("GameText").GameText,
        LangSettings = require("LangSettings").LangSettings,
        Game = require("Game").Game,
        PlayerAccess = require("PlayerAccess").PlayerAccess,
        PlayerControls = require("PlayerControls").PlayerControls,
        PlayerOverlay = require("PlayerOverlay").PlayerOverlay,
        PlayerUI = require("PlayerUI").PlayerUI,
        ToolsData = require("ToolsData").ToolsData,
        UILevelPlayButton = require("UILevelPlayButton").UILevelPlayButton,
        Backend = require("Backend").Backend,
        PLATFORM = require("PLATFORM").PLATFORM;
      exports.LevelPage = class {
        game;
        playerUI;
        playerControls;
        playerOverlay;
        info;
        levelArrows;
        canvasDiv;
        isDeleted;
        levelRights = new PlayerAccess();
        scoreHolder;
        prograssBar;
        playButton;
        sidePanel;
        levelTestHolder;
        levelTestBar;
        tutorialDataStep;
        tutorialData;
        sidePanelStartY = 0;
        sidePanelStartScrollTop = 0;
        levelTesting;
        constructor(e) {
          ((this.info = e),
            (this.levelArrows = []),
            (this.isDeleted = false),
            (this.canvasDiv = document.createElement("div")),
            (this.playButton = null),
            (this.sidePanel = null),
            (this.tutorialDataStep = 0),
            (this.tutorialData = []),
            (this.levelTesting = false),
            document.body.appendChild(this.canvasDiv));
          const t = document.createElement("canvas");
          ((t.className = "cnv"),
            (t.width = window.innerWidth * window.devicePixelRatio),
            (t.height = window.innerHeight * window.devicePixelRatio),
            this.canvasDiv.appendChild(t),
            (this.game = new Game(t)),
            (this.playerUI = new PlayerUI(this.game)),
            (this.playerControls = new PlayerControls(t, this.game, this.playerUI)),
            (this.playerOverlay = new PlayerOverlay(this.canvasDiv, this.game)),
            (this.scoreHolder = document.createElement("div")),
            (this.scoreHolder.className = "score-holder"),
            document.body.appendChild(this.scoreHolder),
            (this.prograssBar = document.createElement("div")),
            (this.prograssBar.className = "score-progress"),
            this.scoreHolder.appendChild(this.prograssBar),
            (this.levelTestHolder = document.createElement("div")),
            (this.levelTestHolder.className = "level-test-holder"),
            document.body.appendChild(this.levelTestHolder),
            (this.levelTestHolder.style.visibility = "hidden"));
          const s = document.createElement("div");
          ((s.className = "level-test-title"),
            (s.innerText = GameText.LEVEL_TESTING.get()),
            this.levelTestHolder.appendChild(s),
            (this.levelTestBar = document.createElement("div")),
            (this.levelTestBar.className = "level-test-bar"),
            this.levelTestHolder.appendChild(this.levelTestBar),
            window.requestAnimationFrame(this.update),
            window.addEventListener("resize", this.resize),
            this.game.focusOnBox(0, 0, 1, 12, 3, 1));
        }
        async showTutorial(e) {
          const t = await fetch(
            `/res/tutorials/${LangSettings.getLanguage()}/tutorial-${this.info.id}.html?v=${window.gameVersion}`,
          );
          if (!t.ok) return;
          const s = document.createElement("div");
          ((this.sidePanel = s),
            (s.className = "level-side-panel"),
            (s.onwheel = (e) => e.stopPropagation()),
            (s.onmousemove = (e) => e.stopPropagation()),
            (s.onpointerdown = (e) => {
              (this.playerUI.setSidePanelScrolling(true),
                (this.sidePanelStartY = e.clientY),
                (this.sidePanelStartScrollTop = s.scrollTop),
                (s.style.cursor = "grabbing"),
                e.stopPropagation());
            }),
            (s.onpointermove = (e) => {
              if (!this.playerUI.isMouseCaptured()) return;
              (e.preventDefault(), e.stopPropagation());
              const t = this.sidePanelStartY - e.clientY;
              s.scrollTop = this.sidePanelStartScrollTop + t;
            }),
            (s.onpointerup = (e) => {
              (this.playerUI.setSidePanelScrolling(false),
                (s.style.cursor = "auto"),
                e.stopPropagation());
            }),
            (s.onpointercancel = (e) => {
              (this.playerUI.setSidePanelScrolling(false),
                (s.style.cursor = "auto"),
                e.stopPropagation());
            }),
            document.body.appendChild(s));
          const i = (await t.text()).split("====="),
            n = i[0],
            r = i.length > 1 ? i[1] : n;
          "mobile" === PLATFORM
            ? (this.tutorialData = r.split("---"))
            : (this.tutorialData = n.split("---"));
          const l = `<div class="level-tutorial-back-button">${GameText.MENU_BACK.get()}</div>`;
          ((s.innerHTML = `<h1>${GameText.LEVEL.get()} ${this.info.id}${l}</h1>`),
            s.addEventListener("click", (e) => {
              e.target.classList.contains("level-tutorial-back-button") &&
                (e.stopPropagation(), (window.location.href = "/levels"));
            }),
            s.addEventListener("touchend", (e) => {
              e.target.classList.contains("level-tutorial-back-button") &&
                (e.stopPropagation(), (window.location.href = "/levels"));
            }),
            this.nextTutorialStep(),
            undefined !== e && e(s));
        }
        nextTutorialStep() {
          if (null === this.sidePanel) return;
          if (this.tutorialDataStep >= this.tutorialData.length) return;
          let e = this.tutorialData[this.tutorialDataStep];
          ((e = this.replaceInlineSpoilers(e)),
            (e = e.replace(/(@(\d+)(\(.+?\)))|@(\d+)/gm, this.replaceInlineArrows)),
            (e = e.replace(/(@i(\d+)(\(.+?\)))|@i(\d+)/gm, this.replaceInlineTools)),
            (e = e.replace(/(#(\w+))|(#\(.+?\))/gm, this.replaceInlineKeys)),
            (this.sidePanel.innerHTML += e),
            this.tutorialDataStep++);
        }
        dispose() {
          ((this.isDeleted = true),
            window.removeEventListener("resize", this.resize),
            this.playerControls.dispose(),
            this.playerUI.dispose(),
            this.playerOverlay.dispose(),
            this.game.dispose(),
            document.body.removeChild(this.scoreHolder),
            document.body.removeChild(this.canvasDiv),
            null !== this.playButton && this.playButton.remove(),
            null !== this.sidePanel && document.body.removeChild(this.sidePanel));
        }
        setProgress(e) {
          this.prograssBar.style.height = 100 * e + "%";
        }
        initLevel(e = false) {
          (this.levelArrows.forEach((e) => {
            this.game.gameMap.setLevelArrow(e);
          }),
            e &&
              ((this.game.playing = false),
              (this.playButton = new UILevelPlayButton(document.body, this.runLevel))));
        }
        restartLevel() {
          ((this.game.playing = false),
            null !== this.playButton && this.playButton.setVisibility(true),
            this.playerControls.updatePlayerAccess(this.levelRights),
            this.game.clearSignals(),
            (this.game.screenUpdated = true),
            (this.game.tick = -1),
            (this.levelTestHolder.style.visibility = "hidden"),
            (this.levelTesting = false));
        }
        updateLevelArrows() {
          const e = new Array(this.levelArrows.length);
          for (let t = 0; t < this.levelArrows.length; t++) {
            const s = this.levelArrows[t];
            (s.updateLevel(), (e[t] = s.isValid()));
          }
          e.length > 0 && e.every((e) => e) && this.complete();
        }
        async complete() {
          this.isDeleted ||
            (this.dispose(),
            "unlocked" === this.info.state
              ? (await Backend.completeLevel(this.info.id), (window.location.href = "/levels"))
              : (window.location.href = "/levels"));
        }
        resize = () => {
          this.game.resize(
            window.innerWidth * window.devicePixelRatio,
            window.innerHeight * window.devicePixelRatio,
          );
        };
        runLevel = () => {
          null !== this.playButton &&
            ((this.game.playing = true),
            this.playButton.setVisibility(false),
            (this.levelRights = this.playerControls.getPlayerAccess()),
            this.playerControls.updatePlayerAccess(PlayerAccess.makeLevelSpectator()),
            (this.levelTestHolder.style.visibility = "visible"),
            (this.levelTesting = true));
        };
        update = () => {
          this.isDeleted ||
            (this.playerControls.update(),
            this.game.updateFrame(() => this.updateLevelArrows()),
            this.game.draw(),
            this.playerOverlay.update(),
            this.levelTesting && (this.levelTestBar.style.width = this.game.tick / 2 + "%"),
            window.requestAnimationFrame(this.update));
        };
        replaceInlineArrows = (e) => {
          const t = e.match(/@(\d+)/);
          if (null === t || 0 === t.length) return "";
          const s = t[1],
            o = e.match(/\((.+)\)/);
          let a = ArrowDescriptions.getArrowName(Number(s));
          return (
            null !== o && o.length > 0 && (a = o[1]),
            `<span class="inline-arrow"><img class="inline-icon" src="res/sprites/arrow${s}.png?v=${window.gameVersion}">${a}</span>`
          );
        };
        replaceInlineTools = (e) => {
          const t = e.match(/@i(\d+)/);
          if (null === t || 0 === t.length) return "";
          const s = t[1],
            i = e.match(/\((.+)\)/);
          let o = ToolsData.getToolName(Number(s));
          return (
            null !== i && i.length > 0 && (o = i[1]),
            `<span class="inline-arrow"><img class="inline-icon" src="res/sprites/tool${s}.png?v=${window.gameVersion}">${o}</span>`
          );
        };
        replaceInlineKeys = (e) =>
          `<span class="inline-key">${(e = e.replace("#", "").replace("(", "").replace(")", ""))}</span>`;
        replaceInlineSpoilers = (e) => {
          const t = e.indexOf("$(");
          let s = -1,
            i = 1;
          for (let o = t + 2; o < e.length; o++)
            if (("(" === e[o] ? i++ : ")" === e[o] && i--, 0 === i)) {
              s = o + 1;
              break;
            }
          if (-1 === s) return e;
          const a = `<span class="inline-spoiler" onclick="this.firstChild.className='inline-spoiler-caption-opened';"><span class="inline-spoiler-caption">${GameText.SHOW_SPOILER.get()}</span><span class="inline-spoiler-text">${e.substring(t + 2, s - 1)}</span></span>`;
          return e.substring(0, t) + a + e.substring(s);
        };
      };
    },
    getGameFiles(exports) {
      exports.getGameFiles = () => [
        `/bundle-shell.js?v=${window.bundleShellVersion}`,
        `/bundle.js?v=${window.gameVersion}`,
        `/bundle-1_2_1.js?v=${window.gameVersion}`,
        `/bundle-1_3.js?v=${window.gameVersion}`,
        "/index.html",
        "/manifest.json",
        `/style-1_3.css?v=${window.gameVersion}`,
        `/style-v1_2.css?v=${window.gameVersion}`,
        `/style.css?v=${window.gameVersion}`,
        `/sw.js?v=${window.gameVersion}-${window.bundleShellVersion}`,
        "/doc/privacy.html",
        "/doc/terms.html",
        "/res/favicon.png",
        "/res/favicon512.png",
        "/res/fonts/Nunito-VariableFont_wght.ttf",
        "/res/fonts/Roboto-Regular.ttf",
        "/res/icons/icon-google.svg",
        "/res/icons/icon-guide.svg",
        "/res/icons/icon-levels.svg",
        "/res/icons/icon-maps.svg",
        "/res/icons/icon-news.svg",
        "/res/icons/icon-public.svg",
        "/res/icons/icon-settings.svg",
        "/res/icons/icon-user.svg",
        "/res/icons/icon_bin.svg",
        "/res/icons/icon_discord.svg",
        "/res/icons/icon_google.svg",
        "/res/icons/icon_like.svg",
        "/res/icons/icon_like_active.svg",
        "/res/icons/icon_mouse.svg",
        "/res/icons/icon_mouse_left.svg",
        "/res/icons/icon_mouse_middle.svg",
        "/res/icons/icon_public.svg",
        "/res/icons/icon_public_active.svg",
        "/res/icons/icon_telegram.svg",
        "/res/icons/icon_undo.svg",
        "/res/icons/icon_youtube.svg",
        "/res/icons/level-play-button.svg",
        "/res/icons/menu-back-icon.svg",
        "/res/icons/toolbar-arrow.svg",
        `/res/sprites/arrow1.png?v=${window.gameVersion}`,
        `/res/sprites/arrow10.png?v=${window.gameVersion}`,
        `/res/sprites/arrow11.png?v=${window.gameVersion}`,
        `/res/sprites/arrow12.png?v=${window.gameVersion}`,
        `/res/sprites/arrow13.png?v=${window.gameVersion}`,
        `/res/sprites/arrow14.png?v=${window.gameVersion}`,
        `/res/sprites/arrow15.png?v=${window.gameVersion}`,
        `/res/sprites/arrow16.png?v=${window.gameVersion}`,
        `/res/sprites/arrow17.png?v=${window.gameVersion}`,
        `/res/sprites/arrow18.png?v=${window.gameVersion}`,
        `/res/sprites/arrow19.png?v=${window.gameVersion}`,
        `/res/sprites/arrow2.png?v=${window.gameVersion}`,
        `/res/sprites/arrow20.png?v=${window.gameVersion}`,
        `/res/sprites/arrow21.png?v=${window.gameVersion}`,
        `/res/sprites/arrow22.png?v=${window.gameVersion}`,
        `/res/sprites/arrow23.png?v=${window.gameVersion}`,
        `/res/sprites/arrow24.png?v=${window.gameVersion}`,
        `/res/sprites/arrow25.png?v=${window.gameVersion}`,
        `/res/sprites/arrow26.png?v=${window.gameVersion}`,
        `/res/sprites/arrow3.png?v=${window.gameVersion}`,
        `/res/sprites/arrow4.png?v=${window.gameVersion}`,
        `/res/sprites/arrow5.png?v=${window.gameVersion}`,
        `/res/sprites/arrow6.png?v=${window.gameVersion}`,
        `/res/sprites/arrow7.png?v=${window.gameVersion}`,
        `/res/sprites/arrow8.png?v=${window.gameVersion}`,
        `/res/sprites/arrow9.png?v=${window.gameVersion}`,
        `/res/sprites/atlas.png?v=${window.gameVersion}`,
        `/res/sprites/tool1.png?v=${window.gameVersion}`,
        `/res/sprites/tool2.png?v=${window.gameVersion}`,
        `/res/sprites/tool3.png?v=${window.gameVersion}`,
        `/res/sprites/tool4.png?v=${window.gameVersion}`,
        `/res/sprites/tool5.png?v=${window.gameVersion}`,
        `/res/sprites/tool6.png?v=${window.gameVersion}`,
        `/res/sprites/tool7.png?v=${window.gameVersion}`,
        `/res/sprites/tool8.png?v=${window.gameVersion}`,
        `/res/sprites/tool9.png?v=${window.gameVersion}`,
        `/res/tutorials/by/tutorial-0.html?v=${window.gameVersion}`,
        `/res/tutorials/by/tutorial-1.html?v=${window.gameVersion}`,
        `/res/tutorials/by/tutorial-10.html?v=${window.gameVersion}`,
        `/res/tutorials/by/tutorial-2.html?v=${window.gameVersion}`,
        `/res/tutorials/by/tutorial-3.html?v=${window.gameVersion}`,
        `/res/tutorials/by/tutorial-4.html?v=${window.gameVersion}`,
        `/res/tutorials/by/tutorial-5.html?v=${window.gameVersion}`,
        `/res/tutorials/by/tutorial-6.html?v=${window.gameVersion}`,
        `/res/tutorials/by/tutorial-7.html?v=${window.gameVersion}`,
        `/res/tutorials/by/tutorial-8.html?v=${window.gameVersion}`,
        `/res/tutorials/by/tutorial-9.html?v=${window.gameVersion}`,
        `/res/tutorials/en/tutorial-0.html?v=${window.gameVersion}`,
        `/res/tutorials/en/tutorial-1.html?v=${window.gameVersion}`,
        `/res/tutorials/en/tutorial-10.html?v=${window.gameVersion}`,
        `/res/tutorials/en/tutorial-2.html?v=${window.gameVersion}`,
        `/res/tutorials/en/tutorial-3.html?v=${window.gameVersion}`,
        `/res/tutorials/en/tutorial-4.html?v=${window.gameVersion}`,
        `/res/tutorials/en/tutorial-5.html?v=${window.gameVersion}`,
        `/res/tutorials/en/tutorial-6.html?v=${window.gameVersion}`,
        `/res/tutorials/en/tutorial-7.html?v=${window.gameVersion}`,
        `/res/tutorials/en/tutorial-8.html?v=${window.gameVersion}`,
        `/res/tutorials/en/tutorial-9.html?v=${window.gameVersion}`,
        `/res/tutorials/fr/tutorial-0.html?v=${window.gameVersion}`,
        `/res/tutorials/fr/tutorial-1.html?v=${window.gameVersion}`,
        `/res/tutorials/fr/tutorial-10.html?v=${window.gameVersion}`,
        `/res/tutorials/fr/tutorial-2.html?v=${window.gameVersion}`,
        `/res/tutorials/fr/tutorial-3.html?v=${window.gameVersion}`,
        `/res/tutorials/fr/tutorial-4.html?v=${window.gameVersion}`,
        `/res/tutorials/fr/tutorial-5.html?v=${window.gameVersion}`,
        `/res/tutorials/fr/tutorial-6.html?v=${window.gameVersion}`,
        `/res/tutorials/fr/tutorial-7.html?v=${window.gameVersion}`,
        `/res/tutorials/fr/tutorial-8.html?v=${window.gameVersion}`,
        `/res/tutorials/fr/tutorial-9.html?v=${window.gameVersion}`,
        "/res/tutorials/img/lvl6.jpg",
        "/res/tutorials/img/lvl7.jpg",
        "/res/tutorials/img/lvl8.jpg",
        `/res/tutorials/ru/tutorial-0.html?v=${window.gameVersion}`,
        `/res/tutorials/ru/tutorial-1.html?v=${window.gameVersion}`,
        `/res/tutorials/ru/tutorial-10.html?v=${window.gameVersion}`,
        `/res/tutorials/ru/tutorial-2.html?v=${window.gameVersion}`,
        `/res/tutorials/ru/tutorial-3.html?v=${window.gameVersion}`,
        `/res/tutorials/ru/tutorial-4.html?v=${window.gameVersion}`,
        `/res/tutorials/ru/tutorial-5.html?v=${window.gameVersion}`,
        `/res/tutorials/ru/tutorial-6.html?v=${window.gameVersion}`,
        `/res/tutorials/ru/tutorial-7.html?v=${window.gameVersion}`,
        `/res/tutorials/ru/tutorial-8.html?v=${window.gameVersion}`,
        `/res/tutorials/ru/tutorial-9.html?v=${window.gameVersion}`,
        `/res/tutorials/ua/tutorial-0.html?v=${window.gameVersion}`,
        `/res/tutorials/ua/tutorial-1.html?v=${window.gameVersion}`,
        `/res/tutorials/ua/tutorial-10.html?v=${window.gameVersion}`,
        `/res/tutorials/ua/tutorial-2.html?v=${window.gameVersion}`,
        `/res/tutorials/ua/tutorial-3.html?v=${window.gameVersion}`,
        `/res/tutorials/ua/tutorial-4.html?v=${window.gameVersion}`,
        `/res/tutorials/ua/tutorial-5.html?v=${window.gameVersion}`,
        `/res/tutorials/ua/tutorial-6.html?v=${window.gameVersion}`,
        `/res/tutorials/ua/tutorial-7.html?v=${window.gameVersion}`,
        `/res/tutorials/ua/tutorial-8.html?v=${window.gameVersion}`,
        `/res/tutorials/ua/tutorial-9.html?v=${window.gameVersion}`,
      ];
    },
    GameMap(exports) {
      const PlayerSettings = require("PlayerSettings").PlayerSettings,
        Chunk = require("Chunk").Chunk,
        CHUNK_SIZE = require("ChunkConsts").CHUNK_SIZE;
      exports.GameMap = class {
        chunks;
        constructor() {
          this.chunks = new Map();
        }
        setArrowType(e, t, s, o = true) {
          const n = this.getOrCreateChunkByArrowCoordinates(e, t),
            r = n.getArrow(e - n.x * CHUNK_SIZE, t - n.y * CHUNK_SIZE);
          if (o && !r.canBeEdited) return;
          if (o && PlayerSettings.levelArrows.includes(r.type)) return;
          const l = r.type;
          (l !== s && (r.signal = 0), (r.type = s), n.setUpdated(), l !== s && n.markRenderDirty());
        }
        setArrowSignal(e, t, s) {
          const i = this.getArrowForEditing(e, t);
          if (undefined !== i && 0 !== i.type) {
            if (i.signal !== s) {
              const s = this.getChunkByArrowCoordinates(e, t);
              s?.markRenderDirty();
            }
            i.signal = s;
          }
        }
        setArrowRotation(e, t, s, o = true) {
          const a = this.getArrowForEditing(e, t);
          if (undefined !== a && 0 !== a.type) {
            if (o && !a.canBeEdited) return;
            if (o && PlayerSettings.levelArrows.includes(a.type)) return;
            if (a.rotation !== s) {
              const s = this.getChunkByArrowCoordinates(e, t);
              s?.markRenderDirty();
            }
            a.rotation = s;
          }
        }
        setArrowFlipped(e, t, s, o = true) {
          const a = this.getArrowForEditing(e, t);
          if (undefined !== a && 0 !== a.type) {
            if (o && !a.canBeEdited) return;
            if (o && PlayerSettings.levelArrows.includes(a.type)) return;
            if (a.flipped !== s) {
              const s = this.getChunkByArrowCoordinates(e, t);
              s?.markRenderDirty();
            }
            a.flipped = s;
          }
        }
        getArrowType(e, t) {
          const s = this.getArrow(e, t);
          return undefined === s ? 0 : s.type;
        }
        removeArrow(e, t, s = true) {
          const o = this.getChunkByArrowCoordinates(e, t);
          if (undefined === o) return;
          const a = this.getArrowForEditing(e, t);
          if (undefined !== a) {
            if (s && !a.canBeEdited) return;
            if (s && PlayerSettings.levelArrows.includes(a.type)) return;
            const e = 0 !== a.type || 0 !== a.signal || 0 !== a.rotation || a.flipped;
            ((a.type = 0),
              (a.signal = 0),
              (a.signalsCount = 0),
              (a.rotation = 0),
              (a.flipped = false),
              e && o.markRenderDirty());
          }
          this.clearChunkIfEmpty(o);
        }
        getArrow(e, t) {
          const s = this.getChunkByArrowCoordinates(e, t);
          if (undefined !== s) return s.getArrow(e - s.x * CHUNK_SIZE, t - s.y * CHUNK_SIZE);
        }
        getChunk(e, t) {
          const s = (e << 16) | (65535 & t);
          return this.chunks.get(s);
        }
        getOrCreateChunk(e, t) {
          const s = (e << 16) | (65535 & t),
            i = this.chunks.get(s);
          if (undefined !== i) return i;
          const a = new Chunk(e, t);
          this.chunks.set(s, a);
          const n = [
            this.getChunk(e, t - 1),
            this.getChunk(e + 1, t - 1),
            this.getChunk(e + 1, t),
            this.getChunk(e + 1, t + 1),
            this.getChunk(e, t + 1),
            this.getChunk(e - 1, t + 1),
            this.getChunk(e - 1, t),
            this.getChunk(e - 1, t - 1),
          ];
          for (let e = 0; e < 8; e++) {
            const t = n[e];
            undefined !== t && ((a.adjacentChunks[e] = t), (t.adjacentChunks[(e + 4) % 8] = a));
          }
          return a;
        }
        clear() {
          this.chunks.forEach((e) => {
            (e.clear(), this.clearChunkIfEmpty(e));
          });
        }
        getChunkByArrowCoordinates(e, t) {
          const s = Math.floor(e / CHUNK_SIZE),
            i = Math.floor(t / CHUNK_SIZE);
          return this.getChunk(s, i);
        }
        clearChunkIfEmpty(e) {
          if (e.isEmpty()) {
            for (let t = 0; t < 8; t++) {
              const s = e.adjacentChunks[t];
              undefined !== s && (s.adjacentChunks[(t + 4) % 8] = undefined);
            }
            this.chunks.delete((e.x << 16) | (65535 & e.y));
          }
        }
        setLevelArrow(e) {
          const t = this.getOrCreateChunkByArrowCoordinates(e.x, e.y),
            s = e.x - t.x * CHUNK_SIZE + (e.y - t.y * CHUNK_SIZE) * CHUNK_SIZE;
          if (t.levelArrows.has(s)) return;
          t.levelArrows.set(s, e);
          const i = t.getArrow(e.x - t.x * CHUNK_SIZE, e.y - t.y * CHUNK_SIZE);
          ((i.type = e.type), (e.arrow = i), t.setUpdated(), t.markRenderDirty());
        }
        getOrCreateChunkByArrowCoordinates(e, t) {
          const s = Math.floor(e / CHUNK_SIZE),
            i = Math.floor(t / CHUNK_SIZE);
          return this.getOrCreateChunk(s, i);
        }
        getArrowForEditing(e, t) {
          const s = this.getChunkByArrowCoordinates(e, t);
          if (undefined !== s)
            return (s.setUpdated(), s.getArrow(e - s.x * CHUNK_SIZE, t - s.y * CHUNK_SIZE));
        }
      };
    },
    KeyboardHandler(exports) {
      exports.KeyboardHandler = class {
        onKeyDown;
        onKeyUp;
        keys;
        chars;
        constructor(e, t) {
          ((this.keys = new Set()),
            (this.chars = new Set()),
            (this.onKeyDown = e),
            (this.onKeyUp = t),
            document.addEventListener("keydown", this.keyDown),
            document.addEventListener("keyup", this.keyUp));
        }
        dispose() {
          (document.removeEventListener("keydown", this.keyDown),
            document.removeEventListener("keyup", this.keyUp));
        }
        getKeyPressed(e) {
          return this.keys.has(e);
        }
        getShiftPressed() {
          return this.getKeyPressed("ShiftLeft") || this.getKeyPressed("ShiftRight");
        }
        getCtrlPressed() {
          const e = this.getKeyPressed("ControlLeft") || this.getKeyPressed("ControlRight"),
            t = this.getKeyPressed("MetaLeft") || this.getKeyPressed("MetaRight");
          return e || t;
        }
        getCharPressed(e) {
          return this.chars.has(e);
        }
        keyDown = (e) => {
          (("Tab" === e.code || ("KeyE" === e.code && this.getCtrlPressed())) && e.preventDefault(),
            this.keys.has(e.code) || this.onKeyDown?.(e.code, e.key),
            this.keys.add(e.code),
            this.chars.add(e.key));
        };
        keyUp = (e) => {
          if (
            "MetaLeft" === e.code ||
            "MetaRight" === e.code ||
            "ControlLeft" === e.code ||
            "ControlRight" === e.code
          )
            return (this.keys.clear(), void this.chars.clear());
          (this.keys.has(e.code) && this.onKeyUp?.(e.code),
            this.keys.delete(e.code),
            this.chars.delete(e.key));
        };
      };
    },
    GameRender(exports) {
      const Render = require("Render").Render,
        RenderTexture = require("RenderTexture").RenderTexture,
        loadShader = require("loadShader").loadShader,
        Texture = require("Texture").Texture;
      exports.GameRender = class {
        canvas;
        render;
        gridTileShader = null;
        selectionArrowShader = null;
        chunkArrowShader = null;
        gridGeneratorShader = null;
        solidColorShader = null;
        fullscreenShader = null;
        arrowsTexture = null;
        chunkMeshes = new Map();
        backgroundTexture = null;
        mainRenderTexture = null;
        gridRenderTexture = null;
        lastArrowType = 0;
        lastArrowSignal = 0;
        lastArrowRotation = 0;
        lastArrowFlipped = false;
        isInitialized = false;
        constructor(e) {
          ((this.canvas = e), (this.render = new Render(e)));
        }
        async init() {
          (await this.initTextures(),
            await this.initShaders(),
            this.createBackgroundTexture(),
            this.render.setBlendMode("alpha"),
            this.resize(this.canvas.width, this.canvas.height),
            (this.isInitialized = true));
        }
        resize(e, t) {
          ((this.canvas.width = e),
            (this.canvas.height = t),
            this.render.gl.viewport(0, 0, e, t),
            null !== this.selectionArrowShader &&
              (this.render.setShader(this.selectionArrowShader),
              this.selectionArrowShader.uniform2f("u_resolution", e, t)),
            null !== this.chunkArrowShader &&
              (this.render.setShader(this.chunkArrowShader),
              this.chunkArrowShader.uniform2f("u_resolution", e, t)),
            null !== this.gridTileShader &&
              (this.render.setShader(this.gridTileShader),
              this.gridTileShader.uniform2f("u_resolution", e, t)),
            null !== this.solidColorShader &&
              (this.render.setShader(this.solidColorShader),
              this.solidColorShader.uniform2f("u_resolution", e, t)),
            this.createRenderTextures());
        }
        dispose() {
          (this.gridTileShader?.dispose(),
            this.selectionArrowShader?.dispose(),
            this.chunkArrowShader?.dispose(),
            this.gridGeneratorShader?.dispose(),
            this.solidColorShader?.dispose(),
            this.fullscreenShader?.dispose(),
            this.arrowsTexture?.dispose(),
            this.backgroundTexture?.dispose(),
            this.mainRenderTexture?.dispose(),
            this.gridRenderTexture?.dispose(),
            this.disposeChunkMeshes(),
            this.render.dispose());
        }
        clearRenderTextures() {
          (this.render.setRenderTarget(this.mainRenderTexture),
            this.render.clear(1, 1, 1, 1),
            this.render.setRenderTarget(this.gridRenderTexture),
            this.render.clear(1, 1, 1, 1),
            this.render.setRenderTarget(null));
        }
        clear() {
          this.render.clear(1, 1, 1, 1);
        }
        startArrowsRendering() {
          null !== this.chunkArrowShader &&
            null !== this.arrowsTexture &&
            null !== this.mainRenderTexture &&
            (this.render.setBlendMode("premultiplied"),
            this.render.setShader(this.chunkArrowShader),
            this.render.setTexture(this.arrowsTexture),
            this.render.setRenderTarget(this.mainRenderTexture));
        }
        startTransparentArrowsRendering() {
          null !== this.selectionArrowShader &&
            null !== this.arrowsTexture &&
            (this.render.setBlendMode("alpha"),
            this.render.setShader(this.selectionArrowShader),
            this.render.setTexture(this.arrowsTexture));
        }
        endArrowsRendering() {
          (this.render.setRenderTarget(null), this.render.gl.bindVertexArray(null));
        }
        setArrowSize(e) {
          null !== this.selectionArrowShader && this.selectionArrowShader.uniform2f("u_size", e, e);
        }
        setArrowAlpha(e) {
          null !== this.selectionArrowShader && this.selectionArrowShader.uniform1f("u_alpha", e);
        }
        setChunkArrowSize(e) {
          null !== this.chunkArrowShader && this.chunkArrowShader.uniform2f("u_size", e, e);
        }
        setChunkArrowAlpha(e) {
          null !== this.chunkArrowShader && this.chunkArrowShader.uniform1f("u_alpha", e);
        }
        setChunkArrowOffset(e, t) {
          null !== this.chunkArrowShader && this.chunkArrowShader.uniform2f("u_offset", e, t);
        }
        drawArrow(e, t, s, i, o, a) {
          if (null !== this.selectionArrowShader) {
            if (((s < 0 || s >= 27) && (s = 26), (s -= 1) !== this.lastArrowType)) {
              const e = (s / 8) % 1,
                t = ~~(s / 8) / 8;
              (this.selectionArrowShader.uniform2f("u_sprite_position", e, t),
                (this.lastArrowType = s));
            }
            (i !== this.lastArrowSignal &&
              (this.selectionArrowShader.uniform1i("u_signal", i), (this.lastArrowSignal = i)),
              (o === this.lastArrowRotation && a === this.lastArrowFlipped) ||
                (this.selectionArrowShader.uniform2f("u_rotation", (o / 2) * Math.PI, a ? 1 : 0),
                (this.lastArrowRotation = o),
                (this.lastArrowFlipped = a)),
              this.selectionArrowShader.uniform2f("u_position", e, t),
              this.render.gl.drawElements(
                this.render.gl.TRIANGLES,
                6,
                this.render.gl.UNSIGNED_SHORT,
                0,
              ));
          }
        }
        hasChunkMesh(e) {
          return this.chunkMeshes.has(e);
        }
        updateChunkMesh(e, t, s) {
          if (null === this.chunkArrowShader) return;
          const i = this.render.gl;
          let o = this.chunkMeshes.get(e);
          if (undefined === o) {
            if (((o = this.createChunkMesh()), null === o)) return;
            this.chunkMeshes.set(e, o);
          }
          (i.bindVertexArray(o.vao),
            i.bindBuffer(i.ARRAY_BUFFER, o.vbo),
            i.bufferData(i.ARRAY_BUFFER, t, i.DYNAMIC_DRAW),
            i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, o.ibo),
            i.bufferData(i.ELEMENT_ARRAY_BUFFER, s, i.DYNAMIC_DRAW),
            i.bindVertexArray(null),
            (o.indexCount = s.length));
        }
        drawChunkMesh(e) {
          const t = this.chunkMeshes.get(e);
          if (undefined === t || 0 === t.indexCount) return;
          const s = this.render.gl;
          (s.bindVertexArray(t.vao),
            s.drawElements(s.TRIANGLES, t.indexCount, s.UNSIGNED_SHORT, 0));
        }
        removeMissingChunkMeshes(e) {
          this.chunkMeshes.forEach((t, s) => {
            e.has(s) || this.disposeChunkMesh(s);
          });
        }
        drawBackground(e, t) {
          if (
            null === this.gridTileShader ||
            null === this.backgroundTexture ||
            null === this.gridRenderTexture
          )
            return;
          const s = 16;
          (this.render.setShader(this.gridTileShader),
            this.render.setTexture(this.backgroundTexture),
            this.render.setRenderTarget(this.gridRenderTexture),
            this.gridTileShader.uniform2f("u_size", 16 * e, 16 * e));
          const i = Math.ceil(this.canvas.width / (s * e)) + 2,
            o = Math.ceil(this.canvas.height / (s * e)) + 2,
            a = Math.floor(t[0] / s),
            n = Math.floor(t[1] / s);
          for (let r = -1; r < i; r++)
            for (let i = -1; i < o; i++) {
              const o = (r - 0.5 + a) * s - t[0],
                l = (i - 0.5 + n) * s - t[1];
              this.drawBackgroundTexture(o * e, l * e);
            }
          this.render.setRenderTarget(null);
        }
        drawBackgroundTexture(e, t) {
          null !== this.gridTileShader &&
            (this.gridTileShader.uniform2f("u_position", e, t), this.render.drawQuad());
        }
        drawArrowsRenderTexture() {
          null !== this.fullscreenShader &&
            null !== this.mainRenderTexture &&
            (this.render.setBlendMode("premultiplied"),
            this.render.setShader(this.fullscreenShader),
            this.render.setTexture(this.mainRenderTexture),
            this.render.drawQuad());
        }
        drawGridRenderTexture() {
          null !== this.fullscreenShader &&
            null !== this.gridRenderTexture &&
            (this.render.setShader(this.fullscreenShader),
            this.render.setTexture(this.gridRenderTexture),
            this.render.setBlendMode("multiply"),
            this.render.drawQuad(),
            this.render.setBlendMode("alpha"));
        }
        setSolidColor(e, t, s, i) {
          null !== this.solidColorShader &&
            (this.render.setShader(this.solidColorShader),
            this.solidColorShader.uniform4f("u_color", e, t, s, i));
        }
        drawSolidColorRect(e, t, s, i) {
          null !== this.solidColorShader &&
            (this.render.setShader(this.solidColorShader),
            this.solidColorShader.uniform2f("u_position", e, t),
            this.solidColorShader.uniform2f("u_size", s, i),
            this.render.drawQuad());
        }
        isReady() {
          return this.isInitialized;
        }
        createChunkMesh() {
          if (null === this.chunkArrowShader) return null;
          const e = this.render.gl,
            t = e.createVertexArray(),
            s = e.createBuffer(),
            i = e.createBuffer();
          if (null === t || null === s || null === i) return null;
          (e.bindVertexArray(t),
            e.bindBuffer(e.ARRAY_BUFFER, s),
            e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, i));
          const o = this.chunkArrowShader.getAttribute("a_position");
          -1 !== o &&
            (e.enableVertexAttribArray(o), e.vertexAttribPointer(o, 2, e.FLOAT, false, 20, 0));
          const a = this.chunkArrowShader.getAttribute("a_texcoord");
          -1 !== a &&
            (e.enableVertexAttribArray(a), e.vertexAttribPointer(a, 2, e.FLOAT, false, 20, 8));
          const n = this.chunkArrowShader.getAttribute("a_signal");
          return (
            -1 !== n &&
              (e.enableVertexAttribArray(n), e.vertexAttribPointer(n, 1, e.FLOAT, false, 20, 16)),
            e.bindVertexArray(null),
            {
              vao: t,
              vbo: s,
              ibo: i,
              indexCount: 0,
            }
          );
        }
        disposeChunkMesh(e) {
          const t = this.chunkMeshes.get(e);
          if (undefined === t) return;
          const s = this.render.gl;
          (s.deleteBuffer(t.vbo),
            s.deleteBuffer(t.ibo),
            s.deleteVertexArray(t.vao),
            this.chunkMeshes.delete(e));
        }
        disposeChunkMeshes() {
          const e = this.render.gl;
          (this.chunkMeshes.forEach((t) => {
            (e.deleteBuffer(t.vbo), e.deleteBuffer(t.ibo), e.deleteVertexArray(t.vao));
          }),
            this.chunkMeshes.clear());
        }
        async initTextures() {
          this.arrowsTexture = await Texture.load(
            this.render.gl,
            `res/sprites/atlas.png?v=${window.gameVersion}`,
            {
              filtering: "linear",
              mipmaps: true,
              mipmapLevels: 8,
              premultiplyAlpha: true,
            },
          );
        }
        async initShaders() {
          const e = await (0, loadShader)(`./res/shaders/vertex.vert?v=${window.gameVersion}`),
            t = await (0, loadShader)(`./res/shaders/sprite.vert?v=${window.gameVersion}`),
            s = await (0, loadShader)(`./res/shaders/arrow-chunk.vert?v=${window.gameVersion}`),
            i = await (0, loadShader)(`./res/shaders/grid-tile.frag?v=${window.gameVersion}`);
          ((this.gridTileShader = this.render.compileShader(t, i)),
            this.gridTileShader.uniform1i("u_texture", 0),
            this.gridTileShader.uniform2f("u_size", 1, 1),
            this.gridTileShader.uniform2f("u_resolution", this.canvas.width, this.canvas.height),
            this.gridTileShader.uniform2f("u_rotation", 0, 0));
          const n = await (0, loadShader)(`./res/shaders/arrow.frag?v=${window.gameVersion}`);
          ((this.selectionArrowShader = this.render.compileShader(t, n)),
            this.selectionArrowShader.uniform1f("u_sprite_size", 1 / 8),
            this.selectionArrowShader.uniform2f(
              "u_resolution",
              this.canvas.width,
              this.canvas.height,
            ),
            this.selectionArrowShader.uniform1f("u_alpha", 1),
            this.selectionArrowShader.uniform1i("u_signal", 0),
            this.selectionArrowShader.uniform1i("u_texture", 0));
          const r = await (0, loadShader)(`./res/shaders/arrow-chunk.frag?v=${window.gameVersion}`);
          ((this.chunkArrowShader = this.render.compileShader(s, r)),
            this.chunkArrowShader.uniform2f("u_resolution", this.canvas.width, this.canvas.height),
            this.chunkArrowShader.uniform2f("u_size", 1, 1),
            this.chunkArrowShader.uniform2f("u_offset", 0, 0),
            this.chunkArrowShader.uniform1f("u_alpha", 1),
            this.chunkArrowShader.uniform1i("u_texture", 0));
          const l = await (0, loadShader)(
            `./res/shaders/grid-generator.frag?v=${window.gameVersion}`,
          );
          ((this.gridGeneratorShader = this.render.compileShader(e, l)),
            this.gridGeneratorShader.uniform1f("u_scale", 16),
            (this.backgroundTexture = new RenderTexture(this.render.gl, 2048, 2048, {
              filtering: "linear",
              mipmaps: true,
            })));
          const h = await (0, loadShader)(`./res/shaders/solid-color.frag?v=${window.gameVersion}`);
          ((this.solidColorShader = this.render.compileShader(t, h)),
            this.solidColorShader.uniform2f("u_resolution", this.canvas.width, this.canvas.height),
            this.solidColorShader.uniform2f("u_rotation", 0, 0),
            (this.fullscreenShader = this.render.compileShader(e, i)),
            this.fullscreenShader.uniform1i("u_texture", 0),
            this.fullscreenShader.uniform2f("u_size", this.canvas.width, this.canvas.height));
        }
        createBackgroundTexture() {
          null !== this.backgroundTexture &&
            null !== this.gridGeneratorShader &&
            (this.render.setShader(this.gridGeneratorShader),
            this.gridGeneratorShader.uniform1f(
              "u_show_chunk_borders",
              "true" === localStorage.getItem("show-chunk-borders") ? 1 : 0,
            ),
            this.render.setRenderTarget(this.backgroundTexture),
            this.render.setShader(this.gridGeneratorShader),
            this.render.drawQuad(),
            this.backgroundTexture.generateMipmaps(),
            this.render.setRenderTarget(null));
        }
        createRenderTextures() {
          (this.mainRenderTexture?.dispose(), this.gridRenderTexture?.dispose());
          const e = {
            filtering: "nearest",
          };
          ((this.mainRenderTexture = new RenderTexture(
            this.render.gl,
            this.canvas.width,
            this.canvas.height,
            e,
          )),
            (this.gridRenderTexture = new RenderTexture(
              this.render.gl,
              this.canvas.width,
              this.canvas.height,
              e,
            )));
        }
      };
    },
    save(exports) {
      const CHUNK_SIZE = require("ChunkConsts").CHUNK_SIZE;
      exports.save = function (e) {
        const t = [];
        return (
          t.push(0, 0),
          t.push(255 & e.chunks.size, (e.chunks.size >> 8) & 255),
          e.chunks.forEach((e) => {
            const s = e.getArrowTypes(),
              o = [255 & Math.abs(e.x), (Math.abs(e.x) >> 8) & 255],
              a = [255 & Math.abs(e.y), (Math.abs(e.y) >> 8) & 255];
            (e.x < 0 ? (o[1] |= 128) : (o[1] &= 127),
              e.y < 0 ? (a[1] |= 128) : (a[1] &= 127),
              t.push(...o),
              t.push(...a),
              t.push(s.length - 1),
              s.forEach((s) => {
                (t.push(s), t.push(0));
                const o = t.length - 1;
                let a = 0;
                for (let o = 0; o < CHUNK_SIZE; o++)
                  for (let n = 0; n < CHUNK_SIZE; n++) {
                    const i = e.getArrow(o, n);
                    if (i.type === s) {
                      const e = o | (n << 4),
                        s = i.rotation | ((i.flipped ? 1 : 0) << 2);
                      (t.push(e), t.push(s), a++);
                    }
                  }
                t[o] = a - 1;
              }));
          }),
          t
        );
      };
    },
    LangSettings(exports) {
      var s;
      (function (e) {
        let t = "en";
        ((e.languages = ["en", "ru", "ua", "by", "fr"]),
          (e.languageNames = ["English", "Русский", "Українська", "Беларуская", "Français"]),
          (e.htmlCodes = ["en", "ru", "uk", "be", "fr"]),
          (e.getLanguage = function () {
            return t;
          }),
          (e.setLanguage = function (s) {
            e.languages.includes(s) &&
              ((t = s), (document.documentElement.lang = e.htmlCodes[e.languages.indexOf(s)]));
          }));
      })(s || (exports.LangSettings = s = {}));
    },
    PerformancePage(exports) {
      const Game = require("Game").Game;
      exports.PerformancePage = class {
        game;
        canvas;
        isDeleted;
        framesTotal = 100;
        phase = 0;
        frame = 0;
        times = [0, 0, 0, 0, 0, 0];
        constructor() {
          ((this.isDeleted = false),
            (this.canvas = document.createElement("canvas")),
            (this.canvas.className = "cnv"),
            (this.canvas.width = 3840),
            (this.canvas.height = 2160),
            document.body.appendChild(this.canvas),
            (this.game = new Game(this.canvas)),
            window.requestAnimationFrame(this.update));
        }
        dispose() {
          ((this.isDeleted = true), this.game.dispose(), document.body.removeChild(this.canvas));
        }
        start() {
          (this.game.gameMap.clear(), this.phase++);
          let e = 80;
          1 === this.phase
            ? (e = 80)
            : 2 === this.phase
              ? (e = 40)
              : 3 === this.phase
                ? (e = 20)
                : 4 === this.phase
                  ? (e = 80)
                  : 5 === this.phase
                    ? (e = 40)
                    : 6 === this.phase
                      ? (e = 20)
                      : (this.dispose(),
                        (document.body.innerHTML = this.times
                          .map((e) => (e / this.framesTotal).toFixed(2))
                          .join("<br>")));
          const t = ~~(this.canvas.width / e),
            s = ~~(this.canvas.height / e);
          for (let e = 0; e < t; e++)
            for (let t = 0; t < s; t++) {
              const s = ~~(25 * Math.random()),
                i = ~~(4 * Math.random()),
                o = Math.random() > 0.5;
              (this.game.gameMap.setArrowType(e, t, s),
                this.game.gameMap.setArrowRotation(e, t, i),
                this.game.gameMap.setArrowFlipped(e, t, o));
            }
          ((this.game.updateSpeedLevel = 2), this.game.setScale(e, [0, 0]));
        }
        update = () => {
          if (!this.isDeleted) {
            if (0 === this.phase)
              return (this.start(), void window.requestAnimationFrame(this.update));
            if (this.frame === this.framesTotal)
              return (
                this.start(),
                (this.frame = 0),
                void window.requestAnimationFrame(this.update)
              );
            ((1 !== this.phase && 2 !== this.phase && 3 !== this.phase) ||
              (this.measureUpdate(), this.game.draw()),
              (4 !== this.phase && 5 !== this.phase && 6 !== this.phase) ||
                (this.game.updateFrame(), this.measureDraw()),
              this.frame++,
              window.requestAnimationFrame(this.update));
          }
        };
        measureUpdate() {
          const e = performance.now();
          this.game.updateFrame();
          const t = performance.now();
          this.times[this.phase - 1] += t - e;
        }
        measureDraw() {
          const e = performance.now();
          this.game.draw();
          const t = performance.now();
          this.times[this.phase - 1] += t - e;
        }
      };
    },
    Navigation(exports) {
      const GameText = require("GameText").GameText,
        LangSettings = require("LangSettings").LangSettings,
        LangUtils = require("LangUtils").LangUtils,
        Levels = require("Levels").Levels,
        PlayerState = require("PlayerState").PlayerState,
        AuthGoogle = require("AuthGoogle").AuthGoogle,
        AccountPage = require("AccountPage").AccountPage,
        GuidePage = require("GuidePage").GuidePage,
        GamePage = require("GamePage").GamePage,
        LevelPage = require("LevelPage").LevelPage,
        LevelsPage = require("LevelsPage").LevelsPage,
        LoginPage = require("LoginPage").LoginPage,
        MapsPage = require("MapsPage").MapsPage,
        MenuPage = require("MenuPage").MenuPage,
        NameChangePage = require("NameChangePage").NameChangePage,
        PerformancePage = require("PerformancePage").PerformancePage,
        SettingsPage = require("SettingsPage").SettingsPage,
        Backend = require("Backend").Backend;
      class T {
        loginPage = null;
        gamePage = null;
        levelPage = null;
        nameChangePage = null;
        menuPage = null;
        accountPage = null;
        mapsPage = null;
        levelsPage = null;
        guidePage = null;
        settingsPage = null;
        performancePage = null;
        static authGoogle = () => {
          const e = AuthGoogle.getAuthURL();
          window.location.href = e;
        };
        static setLanguege() {
          try {
            const e = localStorage.getItem("lang");
            null !== e && LangSettings.setLanguage(LangUtils.getLanguageFromString(e));
          } catch (e) {
            console.log(e);
          }
        }
        startGameAction = async () => {
          if (await Backend.checkNameChange()) return void this.goToNameChange("go");
          const e = await Backend.getLevels();
          ((PlayerState.completedLevels = e), this.goToMaps("go"));
        };
        reloadLoginPage = () => {
          (this.removePages(),
            (this.loginPage = new LoginPage(
              T.authGoogle,
              this.reloadLoginPage,
              this.startGameAction,
            )));
        };
        start() {
          (T.setLanguege(),
            "/login" === window.location.pathname
              ? this.goToLogin("start")
              : "/performance" === window.location.pathname
                ? this.goToPerformance("start")
                : "/setname" === window.location.pathname
                  ? this.goToNameChange("start")
                  : Backend.checkUser(
                      async () => {
                        const e = await Backend.getLevels();
                        ((PlayerState.completedLevels = e), this.goToPath("start"));
                      },
                      () => {
                        window.location.pathname.startsWith("/map")
                          ? this.goToPath("start")
                          : this.goToLogin("start");
                      },
                    ),
            window.addEventListener("popstate", () => this.goToPath("return")));
        }
        async goToMaps(e) {
          (null !== this.menuPage
            ? this.menuPage.page?.dispose()
            : (await this.removePages(), (this.menuPage = new MenuPage("maps", this.doMenuAction))),
            (document.title = `${GameText.MAPS.get()} | ${GameText.ARROWS_TITLE.get()}`),
            (this.mapsPage = new MapsPage(
              (e) => this.goToGame("go", e),
              this.menuPage.getContent(),
            )),
            (this.menuPage.page = this.mapsPage),
            "go" === e
              ? window.history.pushState(null, "", "maps")
              : "start" === e
                ? window.history.replaceState(null, "", "maps")
                : "return" === e && this.menuPage.setCategory("maps"));
        }
        goToLogin(e) {
          (this.removePages(),
            (document.title = GameText.ARROWS_TITLE.get()),
            (this.loginPage = new LoginPage(
              T.authGoogle,
              this.reloadLoginPage,
              this.startGameAction,
            )),
            "go" === e
              ? window.history.pushState(null, "", "login")
              : "start" === e && window.history.replaceState(null, "", "login"));
        }
        goToGame(e, t) {
          (this.removePages(),
            (this.gamePage = new GamePage(t)),
            (document.title = `${t.name} | ${GameText.ARROWS_TITLE.get()}`),
            "go" === e
              ? window.history.pushState(null, "", `map-${t.id}`)
              : "start" === e && window.history.replaceState(null, "", `map-${t.id}`));
        }
        goToPerformance(e) {
          (this.removePages(),
            (document.title = `${GameText.PERFORMANCE_TITLE.get()} | ${GameText.ARROWS_TITLE.get()}`),
            (this.performancePage = new PerformancePage()),
            "go" === e
              ? window.history.pushState(null, "", "performance")
              : "start" === e && window.history.replaceState(null, "", "performance"));
        }
        async goToNameChange(e) {
          (await Backend.checkNameChange())
            ? (this.removePages(),
              (document.title = `${GameText.SET_NAME.get()} | ${GameText.ARROWS_TITLE.get()}`),
              (this.nameChangePage = new NameChangePage()),
              "go" === e
                ? window.history.pushState(null, "", "setname")
                : "start" === e && window.history.replaceState(null, "", "setname"))
            : this.goToLogin(e);
        }
        goToLevel(e, t) {
          const s = Levels.levels.get(t);
          undefined !== s && "locked" !== s.state
            ? (this.removePages(),
              (document.title = `${GameText.LEVEL.get()} ${t} | ${GameText.ARROWS_TITLE.get()}`),
              (this.levelPage = new LevelPage(s)),
              Levels.startLevel(this.levelPage),
              "go" === e
                ? window.history.pushState(null, "", `level-${t}`)
                : "start" === e && window.history.replaceState(null, "", `level-${t}`))
            : this.goToLevels(e);
        }
        goToPath(e) {
          if ("/login" === window.location.pathname) this.goToLogin(e);
          else if ("/maps" === window.location.pathname) this.goToMaps(e);
          else if (window.location.pathname.startsWith("/map")) {
            const t = window.location.pathname.substring(5);
            Backend.getMap(t, (t) => this.goToGame(e, t));
          } else if ("/performance" === window.location.pathname) this.goToPerformance(e);
          else if ("/levels" === window.location.pathname) this.goToLevels(e);
          else if ("/account" === window.location.pathname) this.goToAccount(e);
          else if ("/guide" === window.location.pathname) this.goToGuide(e);
          else if ("/settings" === window.location.pathname) this.goToSettings(e);
          else if (window.location.pathname.startsWith("/level")) {
            const t = Number(window.location.pathname.substring(7));
            this.goToLevel(e, t);
          } else this.goToLogin(e);
        }
        async removePages() {
          (null !== this.loginPage && (this.loginPage.dispose(), (this.loginPage = null)),
            null !== this.menuPage && (this.menuPage.dispose(), (this.menuPage = null)),
            null !== this.gamePage && (await this.gamePage.dispose(), (this.gamePage = null)),
            null !== this.performancePage &&
              (this.performancePage.dispose(), (this.performancePage = null)),
            null !== this.nameChangePage &&
              (this.nameChangePage.dispose(), (this.nameChangePage = null)),
            null !== this.levelPage && (this.levelPage.dispose(), (this.levelPage = null)));
        }
        goToAccount(e) {
          (null !== this.menuPage
            ? this.menuPage.page?.dispose()
            : (this.removePages(), (this.menuPage = new MenuPage("account", this.doMenuAction))),
            (document.title = `${GameText.ACCOUNT.get()} | ${GameText.ARROWS_TITLE.get()}`),
            (this.accountPage = new AccountPage(this.menuPage.getContent())),
            (this.menuPage.page = this.accountPage),
            "go" === e
              ? window.history.pushState(null, "", "account")
              : "start" === e
                ? window.history.replaceState(null, "", "account")
                : "return" === e && this.menuPage.setCategory("account"));
        }
        goToLevels(e) {
          (null !== this.menuPage
            ? this.menuPage.page?.dispose()
            : (this.removePages(), (this.menuPage = new MenuPage("levels", this.doMenuAction))),
            (document.title = `${GameText.LEVELS.get()} | ${GameText.ARROWS_TITLE.get()}`),
            (this.levelsPage = new LevelsPage(
              (e) => this.goToLevel("go", e),
              this.menuPage.getContent(),
            )),
            (this.menuPage.page = this.levelsPage),
            "go" === e
              ? window.history.pushState(null, "", "levels")
              : "start" === e
                ? window.history.replaceState(null, "", "levels")
                : "return" === e && this.menuPage.setCategory("levels"));
        }
        goToGuide(e) {
          (null !== this.menuPage
            ? this.menuPage.page?.dispose()
            : (this.removePages(), (this.menuPage = new MenuPage("guide", this.doMenuAction))),
            (document.title = `${GameText.GUIDE.get()} | ${GameText.ARROWS_TITLE.get()}`),
            (this.guidePage = new GuidePage(this.menuPage.getContent())),
            (this.menuPage.page = this.guidePage),
            "go" === e
              ? window.history.pushState(null, "", "guide")
              : "start" === e
                ? window.history.replaceState(null, "", "guide")
                : "return" === e && this.menuPage.setCategory("guide"));
        }
        goToSettings(e) {
          (null !== this.menuPage
            ? this.menuPage.page?.dispose()
            : (this.removePages(), (this.menuPage = new MenuPage("settings", this.doMenuAction))),
            (document.title = `${GameText.SETTINGS.get()} | ${GameText.ARROWS_TITLE.get()}`),
            (this.settingsPage = new SettingsPage(this.menuPage.getContent())),
            (this.menuPage.page = this.settingsPage),
            "go" === e
              ? window.history.pushState(null, "", "settings")
              : "start" === e
                ? window.history.replaceState(null, "", "settings")
                : "return" === e && this.menuPage.setCategory("settings"));
        }
        doMenuAction = (e) => {
          "account" === e
            ? this.goToAccount("go")
            : "levels" === e
              ? this.goToLevels("go")
              : "maps" === e
                ? this.goToMaps("go")
                : "community" === e ||
                  ("guide" === e
                    ? this.goToGuide("go")
                    : "news" === e || ("settings" === e && this.goToSettings("go")));
        };
      }
      exports.Navigation = T;
    },
    PlayerControls(exports) {
      const KeyboardHandler = require("KeyboardHandler").KeyboardHandler,
        MouseHandler = require("MouseHandler").MouseHandler,
        CELL_SIZE = require("ChunkConsts").CELL_SIZE,
        PLATFORM = require("PLATFORM").PLATFORM,
        PlayerArrowActions = require("PlayerArrowActions").PlayerArrowActions,
        PlayerClipboardController = require("PlayerClipboardController").PlayerClipboardController,
        PlayerAccess = require("PlayerAccess").PlayerAccess;
      exports.PlayerControls = class {
        playerAccess;
        mousePosPrev;
        mousePressedPrev;
        wheelDelta;
        mouseHandler;
        keyboardHandler;
        game;
        playerUI;
        history;
        arrowActions;
        clipboard;
        controlsHints;
        maxZoomOut;
        keyboardZoomVelocity;
        keyboardMoveVelocity;
        touchPanVelocityX;
        touchPanVelocityY;
        touchHandler;
        constructor(e, t, s, a = null) {
          ((this.playerAccess = new PlayerAccess()),
            (this.mousePosPrev = null),
            (this.mousePressedPrev = false),
            (this.wheelDelta = 0),
            (this.mouseHandler = new MouseHandler(
              e,
              this.leftClickCallback,
              () => {},
              this.wheelCallback,
              this.twoFingerCallback,
              undefined,
              undefined,
              this.longPressCallback,
            )),
            (this.keyboardHandler = new KeyboardHandler(this.keyDownCallback, this.keyUpCallback)),
            (this.game = t),
            (this.playerUI = s),
            (this.history = a),
            (this.arrowActions = new PlayerArrowActions(t, s, a, () => this.playerAccess)),
            (this.clipboard = new PlayerClipboardController(
              t,
              this.arrowActions,
              () => this.playerAccess,
              a,
            )),
            (this.keyboardZoomVelocity = 0),
            (this.keyboardMoveVelocity = [0, 0]),
            (this.touchPanVelocityX = 0),
            (this.touchPanVelocityY = 0),
            (this.touchHandler = (e) => {
              e.preventDefault();
            }),
            document.addEventListener("touchstart", this.touchHandler, {
              passive: false,
            }),
            document.addEventListener("touchmove", this.touchHandler, {
              passive: false,
            }),
            document.addEventListener("touchend", this.touchHandler, {
              passive: false,
            }),
            document.addEventListener("touchcancel", this.touchHandler, {
              passive: false,
            }),
            document.addEventListener("paste", this.clipboard.pasteEvent),
            document.addEventListener("copy", this.clipboard.copyEvent),
            this.playerUI.toolbarController.setSelectCallback(
              (e) => this.selectToolBarArrow(e),
              () => this.arrowActions.takeCursor(),
              () => this.game.selectedMap.clear(),
            ),
            this.playerUI.addControlsHint(this.playerAccess),
            (this.controlsHints = "false" !== localStorage.getItem("show-controls-hints")),
            (this.maxZoomOut = parseInt(localStorage.getItem("max-zoom-out") || "1", 10)),
            this.clipboard.checkClipboardData(),
            "mobile" === PLATFORM &&
              this.playerAccess.canUndo &&
              null !== this.history &&
              (this.playerUI.addUndoButton(() => this.undo()),
              this.playerUI.addRedoButton(() => this.redo()),
              this.updateUndoButton(),
              this.updateRedoButton()));
        }
        updatePlayerAccess(e) {
          (e.canSetArrows || this.arrowActions.takeCursor(),
            (this.playerAccess = {
              ...this.playerAccess,
              ...e,
            }),
            this.playerAccess.canChangeSpeed
              ? this.playerUI.addSpeedController()
              : this.playerUI.removeSpeedController(),
            this.playerAccess.canOpenMenu
              ? this.playerUI.addMenuButton()
              : this.playerUI.removeMenuButton(),
            "true" === localStorage.getItem("show-fps") && this.playerUI.addFpsDisplay(),
            "mobile" === PLATFORM && this.playerAccess.canUndo && null !== this.history
              ? (this.playerUI.addUndoButton(() => this.undo()),
                this.playerUI.addRedoButton(() => this.redo()),
                this.updateUndoButton(),
                this.updateRedoButton())
              : (this.playerUI.removeUndoButton(), this.playerUI.removeRedoButton()),
            this.playerUI.updateToolbar(this.playerAccess),
            this.playerUI.toolbarController.setSelectCallback(
              (e) => this.selectToolBarArrow(e),
              () => this.arrowActions.takeCursor(),
              () => this.game.selectedMap.clear(),
            ),
            this.playerUI.updateControlsHintRights(this.playerAccess));
        }
        getPlayerAccess() {
          return this.playerAccess;
        }
        update() {
          if (this.playerUI.isMenuOpen()) return void this.arrowActions.takeCursor();
          if (
            (this.updateUndoButton(),
            this.updateRedoButton(),
            this.handleZoom(this.wheelDelta, this.playerAccess.canMove),
            (this.wheelDelta = 0),
            "mobile" === PLATFORM)
          ) {
            const [e, t] = this.mouseHandler.getLastPanDelta();
            if (this.mouseHandler.getMousePressed() && !this.playerUI.isMouseCaptured()) {
              const s = 2;
              Math.abs(e) > s || Math.abs(t) > s
                ? ((this.touchPanVelocityX = e), (this.touchPanVelocityY = t))
                : ((this.touchPanVelocityX *= 0.7), (this.touchPanVelocityY *= 0.7));
            } else if (this.mouseHandler.getMousePressed() && this.playerUI.isMouseCaptured())
              ((this.touchPanVelocityX = 0), (this.touchPanVelocityY = 0));
            else {
              const e = 0.92;
              ((this.touchPanVelocityX *= e),
                (this.touchPanVelocityY *= e),
                Math.abs(this.touchPanVelocityX) < 0.1 && (this.touchPanVelocityX = 0),
                Math.abs(this.touchPanVelocityY) < 0.1 && (this.touchPanVelocityY = 0),
                (Math.abs(this.touchPanVelocityX) > 0.1 ||
                  Math.abs(this.touchPanVelocityY) > 0.1) &&
                  this.playerAccess.canMove &&
                  ((this.game.offset[0] +=
                    ((this.touchPanVelocityX * CELL_SIZE) / this.game.scale) *
                    window.devicePixelRatio),
                  (this.game.offset[1] +=
                    ((this.touchPanVelocityY * CELL_SIZE) / this.game.scale) *
                    window.devicePixelRatio),
                  (this.game.screenUpdated = true)));
            }
          }
          const e = this.mouseHandler.getMousePosition(),
            t =
              (e[0] * window.devicePixelRatio) / this.game.scale - this.game.offset[0] / CELL_SIZE,
            s =
              (e[1] * window.devicePixelRatio) / this.game.scale - this.game.offset[1] / CELL_SIZE,
            i = Math.floor(t),
            o = Math.floor(s);
          this.game.mousePosition = [i, o];
          const r = this.keyboardHandler.getShiftPressed(),
            l = this.keyboardHandler.getCtrlPressed(),
            h = this.arrowActions.getActiveArrowType(),
            c = this.arrowActions.isFreeCursor();
          if (this.mouseHandler.getWheelPressed())
            (this.moveCamera(e[0], e[1]),
              (this.game.screenUpdated = true),
              "mobile" === PLATFORM &&
                ((this.touchPanVelocityX = 0), (this.touchPanVelocityY = 0)));
          else if (this.mouseHandler.getMousePressed()) {
            if (this.playerUI.isMouseCaptured())
              null !== this.playerUI.speedController && this.updateSpeedController();
            else {
              const a = this.mouseHandler.getIsMultitouch(),
                d = this.playerUI.toolbarController.getCurrentMode(),
                u = "selection" === d,
                g = "paste" === d;
              if (c && !a)
                "mobile" === PLATFORM
                  ? -1 === h
                    ? this.moveCamera(e[0], e[1])
                    : ((this.touchPanVelocityX = 0), (this.touchPanVelocityY = 0))
                  : this.moveCamera(e[0], e[1]);
              else if (!a && g && "mobile" === PLATFORM) this.moveCamera(e[0], e[1]);
              else if (!a) {
                const e = this.arrowActions.getLastSetArrowPos(),
                  c = null === e || i !== e[0] || o !== e[1],
                  g = "arrows" !== d,
                  m = g && 1 === h && !a,
                  p = g && 3 === h && !a;
                "mobile" === PLATFORM
                  ? (m
                      ? this.arrowActions.handleRotationTool(i, o, t, s)
                      : c &&
                        -1 !== h &&
                        (p
                          ? this.arrowActions.handleDeleteTool(i, o)
                          : u && this.arrowActions.selectArrows(t, s, r, l)),
                    g || -1 === h || this.arrowActions.setPath(t, s),
                    (this.touchPanVelocityX = 0),
                    (this.touchPanVelocityY = 0))
                  : (r && -1 !== h && this.arrowActions.setPath(t, s),
                    this.arrowActions.setArrows(i, o));
              }
              this.game.screenUpdated = true;
            }
          } else
            (this.arrowActions.resetDragState(),
              "mobile" === PLATFORM &&
                this.game.isSelecting &&
                (this.game.selectedMap.updateSelectionFromCurrentSelection(),
                (this.game.screenUpdated = true)));
          if (
            (this.keyboardHandler.getKeyPressed("KeyR") && this.arrowActions.deleteArrow(i, o),
            this.keyboardHandler.getKeyPressed("KeyW")
              ? this.arrowActions.rotateArrow(i, o, 0)
              : this.keyboardHandler.getKeyPressed("KeyD")
                ? this.arrowActions.rotateArrow(i, o, 1)
                : this.keyboardHandler.getKeyPressed("KeyS")
                  ? this.arrowActions.rotateArrow(i, o, 2)
                  : this.keyboardHandler.getKeyPressed("KeyA")
                    ? this.arrowActions.rotateArrow(i, o, 3)
                    : this.keyboardHandler.getKeyPressed("KeyF") &&
                      this.arrowActions.flipArrow(i, o),
            this.keyboardHandler.getKeyPressed("ArrowUp")
              ? (this.keyboardMoveVelocity[1] += 4)
              : this.keyboardHandler.getKeyPressed("ArrowDown") &&
                (this.keyboardMoveVelocity[1] -= 4),
            this.keyboardHandler.getKeyPressed("ArrowLeft")
              ? (this.keyboardMoveVelocity[0] += 4)
              : this.keyboardHandler.getKeyPressed("ArrowRight") &&
                (this.keyboardMoveVelocity[0] -= 4),
            (Math.abs(this.keyboardMoveVelocity[0]) > 0.1 ||
              Math.abs(this.keyboardMoveVelocity[1]) > 0.1) &&
              ((this.game.offset[0] +=
                (this.keyboardMoveVelocity[0] * CELL_SIZE) / this.game.scale),
              (this.game.offset[1] += (this.keyboardMoveVelocity[1] * CELL_SIZE) / this.game.scale),
              (this.keyboardMoveVelocity[0] *= 0.85),
              (this.keyboardMoveVelocity[1] *= 0.85),
              (this.game.screenUpdated = true)),
            this.mousePressedPrev || "mobile" !== PLATFORM
              ? (this.mousePosPrev = e)
              : (this.mousePosPrev = null),
            "mobile" !== PLATFORM && (this.game.isSelecting = false),
            this.keyboardHandler.getKeyPressed("KeyE") &&
              this.arrowActions.selectArrows(
                t,
                s,
                this.keyboardHandler.getShiftPressed(),
                this.keyboardHandler.getCtrlPressed(),
              ),
            this.keyboardHandler.getKeyPressed("Minus") || this.keyboardHandler.getCharPressed("-"))
          )
            this.keyboardZoomVelocity += 5;
          else if (
            this.keyboardHandler.getKeyPressed("Equal") ||
            this.keyboardHandler.getCharPressed("+")
          )
            if (r && this.playerAccess.canZoom) {
              const e = this.game.width / 2 / window.devicePixelRatio,
                t = this.game.height / 2 / window.devicePixelRatio;
              (this.game.setScale(40 * window.devicePixelRatio, [e, t]),
                (this.keyboardZoomVelocity = 0));
            } else this.keyboardZoomVelocity -= 5;
          const d = this.game.gameMap.getArrow(i, o);
          (undefined === d || !c || (21 !== d.type && 24 !== d.type)
            ? (document.body.style.cursor = "default")
            : (document.body.style.cursor = "pointer"),
            0 !== this.keyboardZoomVelocity &&
              (Math.abs(this.keyboardZoomVelocity) < 0.01 && (this.keyboardZoomVelocity = 0),
              (this.keyboardZoomVelocity *= 0.9),
              this.handleZoom(this.keyboardZoomVelocity, false)),
            (this.mousePressedPrev = this.mouseHandler.getMousePressed()),
            this.updateControlsHints(),
            this.updateToolbarState());
        }
        dispose() {
          (this.keyboardHandler.dispose(),
            this.mouseHandler.dispose(),
            document.removeEventListener("touchstart", this.touchHandler),
            document.removeEventListener("touchmove", this.touchHandler),
            document.removeEventListener("touchend", this.touchHandler),
            document.removeEventListener("touchcancel", this.touchHandler),
            document.removeEventListener("paste", this.clipboard.pasteEvent),
            document.removeEventListener("copy", this.clipboard.copyEvent));
        }
        updateSpeedController() {
          null !== this.playerUI.speedController &&
            ((this.game.updateSpeedLevel = this.playerUI.speedController.getValue()),
            "mobile" === PLATFORM &&
              ((this.game.playing = 0 !== this.game.updateSpeedLevel),
              this.game.updateSpeedLevel--));
        }
        updateControlsHints() {
          this.controlsHints
            ? this.game.selectedMap.getCount() > 0
              ? this.playerUI.setControlsHintState("selected")
              : this.arrowActions.isFreeCursor()
                ? this.playerUI.setControlsHintState("free")
                : this.playerUI.setControlsHintState("arrow")
            : this.playerUI.setControlsHintState("none");
        }
        updateUndoButton() {
          if ("mobile" !== PLATFORM || null === this.history) return;
          const e = this.history.canUndo();
          this.playerUI.updateUndoButtonState(e);
        }
        updateRedoButton() {
          if ("mobile" !== PLATFORM || null === this.history) return;
          const e = this.history.canRedo();
          this.playerUI.updateRedoButtonState(e);
        }
        updateToolbarState() {
          const e = this.playerUI.toolbarController.getCurrentMode();
          "selection" === e
            ? this.game.selectedMap.getCount() > 0
              ? this.playerUI.toolbarController.disableItems([])
              : this.playerUI.toolbarController.disableItems([3, 6, 8])
            : "main" === e
              ? this.clipboard.getHasClipboardData()
                ? this.playerUI.toolbarController.disableItems([])
                : this.playerUI.toolbarController.disableItems([7])
              : "paste" === e && this.playerUI.toolbarController.disableItems([]);
        }
        keyDownCallback = (e) => {
          const t = this.keyboardHandler.getShiftPressed(),
            s = this.keyboardHandler.getCtrlPressed();
          if (
            ("KeyZ" === e
              ? null !== this.history && (t ? this.redo() : this.undo())
              : "KeyY" === e && this.redo(),
            s)
          )
            return;
          if (
            ("Escape" === e && this.playerAccess.canOpenMenu && this.playerUI.toggleMenu(this.game),
            this.playerUI.isMenuOpen())
          )
            return;
          const i = this.playerUI.toolbarController.getCurrentGroup();
          for (let t = 0; t < i.length; t++) {
            const s = i[t];
            e === `Digit${t + 1}` && this.selectToolBarArrow(s);
          }
          if ("KeyQ" === e) this.pickArrow();
          else if ("Backquote" === e) this.arrowActions.takeCursor();
          else if ("Space" === e) this.togglePause();
          else if ("Enter" === e) this.runOneTick();
          else if ("KeyX" === e) this.clipboard.cutArrows();
          else if ("KeyF" === e) {
            if (this.arrowActions.isFreeCursor()) {
              const e = this.getArrowByMousePosition();
              undefined !== e && this.arrowActions.updateFlipDirection(e);
            }
          } else if ("Backspace" === e) this.arrowActions.deleteSelectedArrows();
          else if ("KeyC" === e)
            this.keyboardHandler.getCtrlPressed() ||
              (this.clipboard.copyArrows(), this.clipboard.clearSelected());
          else if ("KeyV" === e)
            this.keyboardHandler.getCtrlPressed() || this.clipboard.pasteArrows();
          else if ("KeyH" === e && this.playerAccess.canMove) {
            const e = this.game.width / 40 / window.devicePixelRatio,
              t = this.game.height / 40 / window.devicePixelRatio;
            this.game.focusOnBox(0, 0, e, t, 0, 0.017);
          } else "KeyG" === e && this.arrowActions.switchPivot();
          ("Comma" === e && this.playerUI.toolbarController.previousGroup(),
            "Period" === e && this.playerUI.toolbarController.nextGroup(),
            this.arrowActions.isFreeCursor() ||
              (this.playerAccess.canRotate &&
                ("KeyW" === e
                  ? this.game.selectedMap.rotateOrFlipArrows(0, false)
                  : "KeyD" === e
                    ? this.game.selectedMap.rotateOrFlipArrows(1, false)
                    : "KeyS" === e
                      ? this.game.selectedMap.rotateOrFlipArrows(2, false)
                      : "KeyA" === e && this.game.selectedMap.rotateOrFlipArrows(3, false)),
              "KeyF" === e &&
                this.playerAccess.canFlip &&
                this.game.selectedMap.rotateOrFlipArrows(null, true)),
            "Tab" === e && this.playerUI.toolbarController.toggleInventory(),
            "KeyN" === e && this.clearSignals());
        };
        getPositionByMousePosition() {
          const e = this.mouseHandler.getMousePosition(),
            t =
              (e[0] * window.devicePixelRatio) / this.game.scale - this.game.offset[0] / CELL_SIZE,
            s =
              (e[1] * window.devicePixelRatio) / this.game.scale - this.game.offset[1] / CELL_SIZE;
          return [Math.floor(t), Math.floor(s)];
        }
        getArrowByMousePosition() {
          const [e, t] = this.getPositionByMousePosition();
          return this.game.gameMap.getArrow(e, t);
        }
        selectToolBarArrow(e) {
          if (this.arrowActions.getActiveArrowType() === e)
            return void this.arrowActions.takeCursor();
          const t = this.playerUI.toolbarController.getCurrentMode();
          if ("arrows" !== t) {
            if ("selection" === t && 3 === e)
              return (
                this.arrowActions.deleteSelectedArrows(),
                this.playerUI.toolbarController.switchToToolGroup("main"),
                void this.arrowActions.takeCursor()
              );
            if (6 === e)
              return (
                this.clipboard.copyArrows(),
                this.clipboard.clearSelected(),
                this.playerUI.toolbarController.switchToToolGroup("main"),
                void this.arrowActions.takeCursor()
              );
            if (8 === e)
              return (
                this.clipboard.cutArrows(),
                this.playerUI.toolbarController.switchToToolGroup("main"),
                void this.arrowActions.takeCursor()
              );
            if ("paste" === t) {
              if (7 === e)
                return (
                  this.clipboard.commitPastedArrows(),
                  this.playerUI.toolbarController.switchToToolGroup("main"),
                  (this.game.isInPasteMode = false),
                  void this.arrowActions.takeCursor()
                );
              if (1 === e) return void this.clipboard.rotatePasteSelection();
              if (2 === e) return void this.clipboard.flipPasteSelection();
              if (9 === e) return void this.arrowActions.switchPivot();
            }
            (this.arrowActions.takeArrow(e),
              4 === e &&
                (this.playerUI.toolbarController.switchToToolGroup("selection"),
                this.updateToolbarState()),
              5 === e &&
                (this.playerUI.toolbarController.switchToToolGroup("main"),
                this.game.selectedMap.clear(),
                (this.game.isInPasteMode = false),
                this.arrowActions.takeCursor()),
              7 === e &&
                (this.playerUI.toolbarController.switchToToolGroup("paste"),
                (this.game.isInPasteMode = true),
                this.arrowActions.setActiveArrowType(-1),
                this.clipboard.resetPasteRotation(),
                this.clipboard.pasteArrows()));
          } else this.arrowActions.takeArrow(e);
        }
        keyUpCallback = (e) => {
          this.playerUI.isMenuOpen() ||
            ("KeyE" === e &&
              (this.game.selectedMap.updateSelectionFromCurrentSelection(),
              (this.game.screenUpdated = true)));
        };
        leftClickCallback = () => {
          this.mousePosPrev = null;
          const e = this.getArrowByMousePosition(),
            t = this.keyboardHandler.getShiftPressed(),
            s = this.mouseHandler.getIsMultitouch(),
            i = this.arrowActions.getActiveArrowType(),
            o = this.arrowActions.isFreeCursor();
          if (
            (this.updateSpeedController(),
            !("mobile" !== PLATFORM || o || t || -1 === i || this.playerUI.isMouseCaptured() || s))
          ) {
            const e = this.mouseHandler.getMousePosition(),
              t =
                (e[0] * window.devicePixelRatio) / this.game.scale -
                this.game.offset[0] / CELL_SIZE,
              s =
                (e[1] * window.devicePixelRatio) / this.game.scale -
                this.game.offset[1] / CELL_SIZE,
              o = Math.floor(t),
              n = Math.floor(s),
              r = this.playerUI.toolbarController.getCurrentMode();
            return (
              "main" === r
                ? 1 === i
                  ? this.arrowActions.rotateArrowByTool(o, n, 1)
                  : 2 === i
                    ? this.arrowActions.flipArrowByTool(o, n)
                    : 3 === i && this.arrowActions.deleteArrow(o, n)
                : "arrows" === r && this.arrowActions.setArrows(o, n),
              (this.touchPanVelocityX = 0),
              void (this.touchPanVelocityY = 0)
            );
          }
          if (undefined !== e && o && !t && (21 === e.type || 24 === e.type)) {
            const t = 0 === e.signal || this.game.playing ? 5 : 0,
              s = e.signal !== t;
            (s && (e.signal = t), (this.game.screenUpdated = true));
            const [i, o] = this.getPositionByMousePosition(),
              a = this.game.gameMap.getChunkByArrowCoordinates(i, o);
            undefined !== a && (a.setUpdated(), s && a.markRenderDirty());
          }
        };
        wheelCallback = (e) => {
          this.playerUI.isMenuOpen() || (this.wheelDelta += e);
        };
        twoFingerCallback = (e, t, s, i, o) => {
          if (
            !this.playerUI.isMenuOpen() &&
            (this.playerAccess.canZoom || this.playerAccess.canMove)
          ) {
            if (this.playerAccess.canZoom && Math.abs(e - 1) > 0.01) {
              let t = this.game.scale * e;
              const s = 10 / this.maxZoomOut;
              ((t = Math.max(s, Math.min(t, 512))), this.game.setScale(t, [i, o]));
            }
            (this.playerAccess.canMove &&
              (Math.abs(t) > 0.5 || Math.abs(s) > 0.5) &&
              ((this.game.offset[0] +=
                ((t * CELL_SIZE) / this.game.scale) * window.devicePixelRatio),
              (this.game.offset[1] +=
                ((s * CELL_SIZE) / this.game.scale) * window.devicePixelRatio)),
              (this.game.screenUpdated = true));
          }
        };
        longPressCallback = () => {
          if ("mobile" !== PLATFORM || !this.playerAccess.canPick || this.playerUI.isMenuOpen())
            return;
          const e = this.playerUI.toolbarController.getCurrentMode();
          if ("arrows" !== e && "main" !== e) return;
          const t = this.arrowActions.getActiveArrowType();
          if ("main" === e && -1 !== t) return;
          const s = this.getArrowByMousePosition();
          undefined !== s && 0 !== s.type && s.canBeEdited
            ? (this.playerUI.toolbarController.setGroupByType(s.type),
              this.arrowActions.takeArrow(s.type),
              this.game.selectedMap.rotateOrFlipArrows(s.rotation, s.flipped))
            : this.arrowActions.takeCursor();
        };
        undo() {
          if (!this.playerAccess.canUndo) return;
          if (null === this.history) return;
          const e = this.history.getCurrentState();
          (this.game.undoChanges(e), (this.game.screenUpdated = true), this.history.undo());
        }
        redo() {
          if (!this.playerAccess.canUndo) return;
          if (null === this.history) return;
          if (this.history.getIsLastState()) return;
          this.history.redo();
          const e = this.history.getCurrentState();
          (this.game.redoChanges(e), (this.game.screenUpdated = true));
        }
        moveCamera(e, t) {
          this.playerAccess.canMove &&
            null !== this.mousePosPrev &&
            ((this.game.offset[0] +=
              (((e - this.mousePosPrev[0]) * CELL_SIZE) / this.game.scale) *
              window.devicePixelRatio),
            (this.game.offset[1] +=
              (((t - this.mousePosPrev[1]) * CELL_SIZE) / this.game.scale) *
              window.devicePixelRatio));
        }
        handleZoom(e, t) {
          if (0 === e || !this.playerAccess.canZoom) return;
          let s = this.mouseHandler.getMousePosition();
          t ||
            (s = [
              this.game.width / 2 / window.devicePixelRatio,
              this.game.height / 2 / window.devicePixelRatio,
            ]);
          let i = this.game.scale * 2 ** (0.0015 * -e);
          const o = 10 / this.maxZoomOut;
          ((i = Math.max(o, Math.min(i, 128))), this.game.setScale(i, s));
        }
        togglePause() {
          this.playerAccess.canPause &&
            ((this.game.playing = !this.game.playing),
            this.playerUI.pauseSign.setVisibility(!this.game.playing));
        }
        pickArrow() {
          if (!this.playerAccess.canPick) return;
          const e = this.getArrowByMousePosition();
          undefined !== e && 0 !== e.type && e.canBeEdited
            ? (this.arrowActions.takeArrow(e.type),
              this.game.selectedMap.rotateOrFlipArrows(e.rotation, e.flipped))
            : this.arrowActions.takeCursor();
        }
        runOneTick() {
          this.playerAccess.canRunOneTick && (this.game.playing || this.game.updateTick());
        }
        clearSignals() {
          this.playerAccess.canClearSignals &&
            (this.game.clearSignals(), (this.game.screenUpdated = true));
        }
      };
    },
    AuthState(exports) {
      const PlayerState = require("PlayerState").PlayerState,
        o = "authMode",
        a = "authUserName";
      class n {
        static mode = "none";
        static userName = "";
        static init() {
          const e = localStorage.getItem(o),
            t = localStorage.getItem(a);
          "guest" !== e && "cookie" !== e && "none" !== e
            ? n.apply("none", "")
            : n.apply(e, t ?? "");
        }
        static getMode() {
          return n.mode;
        }
        static isGuest() {
          return "guest" === n.mode;
        }
        static getUserName() {
          return n.userName;
        }
        static setGuest() {
          n.persist("guest", "Guest");
        }
        static setCookieUser(e) {
          n.persist("cookie", e);
        }
        static setLoggedOut() {
          n.persist("none", "");
        }
        static apply(e, t) {
          ((n.mode = e),
            (n.userName = t),
            (PlayerState.isGuest = "guest" === e),
            (PlayerState.userName = "guest" === e ? "Guest" : t));
        }
        static persist(e, t) {
          (n.apply(e, t),
            localStorage.setItem(o, e),
            "" === t ? localStorage.removeItem(a) : localStorage.setItem(a, t));
        }
      }
      exports.AuthState = n;
    },
    ChunkUpdates(exports) {
      const _ChunkConsts = require("ChunkConsts");
      var o;
      !(function (e) {
        const t = [[-1, 0]],
          s = [
            [-1, 0],
            [0, 1],
            [1, 0],
            [0, -1],
          ],
          o = [
            [7, 0, 1],
            [6, -1, 2],
            [5, 4, 3],
          ],
          a = {
            1: {
              requiredSignal: 1,
              offsets: t,
            },
            2: {
              requiredSignal: 1,
              offsets: s,
            },
            4: {
              requiredSignal: 1,
              offsets: t,
            },
            5: {
              requiredSignal: 1,
              offsets: t,
            },
            6: {
              requiredSignal: 1,
              offsets: [
                [-1, 0],
                [1, 0],
              ],
            },
            7: {
              requiredSignal: 1,
              offsets: [
                [-1, 0],
                [0, 1],
              ],
            },
            8: {
              requiredSignal: 1,
              offsets: [
                [-1, 0],
                [0, 1],
                [0, -1],
              ],
            },
            9: {
              requiredSignal: 1,
              offsets: s,
            },
            10: {
              requiredSignal: 2,
              offsets: [[-2, 0]],
            },
            11: {
              requiredSignal: 2,
              offsets: [[-1, 1]],
            },
            12: {
              requiredSignal: 2,
              offsets: [
                [-1, 0],
                [-2, 0],
              ],
            },
            13: {
              requiredSignal: 2,
              offsets: [
                [-2, 0],
                [0, 1],
              ],
            },
            14: {
              requiredSignal: 2,
              offsets: [
                [-1, 0],
                [-1, 1],
              ],
            },
            15: {
              requiredSignal: 3,
              offsets: t,
            },
            16: {
              requiredSignal: 3,
              offsets: t,
            },
            17: {
              requiredSignal: 3,
              offsets: t,
            },
            18: {
              requiredSignal: 3,
              offsets: t,
            },
            19: {
              requiredSignal: 3,
              offsets: t,
            },
            20: {
              requiredSignal: 5,
              offsets: t,
            },
            21: {
              requiredSignal: 5,
              offsets: s,
            },
            22: {
              requiredSignal: 1,
              offsets: t,
            },
            24: {
              requiredSignal: 5,
              offsets: t,
            },
          };
        function n(e) {
          undefined !== e && e.signalsCount++;
        }
        function r(e) {
          undefined !== e && (e.signal = 0);
        }
        function l(e) {
          ((e.lastType = e.type),
            (e.lastRotation = e.rotation),
            (e.lastFlipped = e.flipped),
            (e.lastSignal = e.signal));
        }
        function h(e, t, s, a, n, r = -1, l = 0, h = false) {
          const c = n ? -l : l;
          let d = t,
            u = s;
          switch (3 & a) {
            case 0:
              ((u += r), (d += c));
              break;
            case 1:
              ((d -= r), (u += c));
              break;
            case 2:
              ((u -= r), (d -= c));
              break;
            case 3:
              ((d += r), (u -= c));
          }
          let g = 0,
            m = 0;
          (d >= _ChunkConsts.CHUNK_SIZE
            ? ((d -= _ChunkConsts.CHUNK_SIZE), (g = 1))
            : d < 0 && ((d += _ChunkConsts.CHUNK_SIZE), (g = -1)),
            u >= _ChunkConsts.CHUNK_SIZE
              ? ((u -= _ChunkConsts.CHUNK_SIZE), (m = 1))
              : u < 0 && ((u += _ChunkConsts.CHUNK_SIZE), (m = -1)));
          let p = e;
          if (0 !== g || 0 !== m) {
            const t = g + 1,
              s = o[m + 1];
            if (undefined === s || t < 0 || t >= s.length) return;
            const i = s[t];
            if (-1 === i) return;
            if (((p = e.adjacentChunks[i]), undefined === p)) return;
            (h || p.setUpdated(), e.setUpdated());
          }
          return p.getArrow(d, u);
        }
        function c(e) {
          return (
            e.signal !== e.lastSignal ||
            e.type !== e.lastType ||
            e.rotation !== e.lastRotation ||
            e.flipped !== e.lastFlipped
          );
        }
        ((e.update = function (e) {
          (e.chunks.forEach((e) =>
            (function (e) {
              if (0 !== e.lastUpdateState)
                for (let t = 0; t < _ChunkConsts.CHUNK_AREA; t++) {
                  const s = e.getArrowByIndex(t);
                  if (
                    (s.signal !== s.lastSignal && e.setUpdated(),
                    l(s),
                    0 === s.type || 0 === s.signal)
                  )
                    continue;
                  const o = a[s.type];
                  if (undefined === o || s.signal !== o.requiredSignal) continue;
                  const r = t % _ChunkConsts.CHUNK_SIZE,
                    c = Math.floor(t / _ChunkConsts.CHUNK_SIZE);
                  for (const [t, i] of o.offsets) n(h(e, r, c, s.rotation, s.flipped, t, i));
                }
            })(e),
          ),
            e.chunks.forEach((e) =>
              (function (e) {
                if (0 !== e.lastUpdateState)
                  for (let t = 0; t < _ChunkConsts.CHUNK_AREA; t++) {
                    const s = e.getArrowByIndex(t);
                    if (0 !== s.type) {
                      switch (s.type) {
                        case 1:
                        case 3:
                        case 6:
                        case 7:
                        case 8:
                        case 23:
                          s.signal = s.signalsCount > 0 ? 1 : 0;
                          break;
                        case 2:
                          s.signal = 1;
                          break;
                        case 4:
                          2 === s.signal
                            ? (s.signal = 1)
                            : 0 === s.signal && s.signalsCount > 0
                              ? (s.signal = 2)
                              : 1 === s.signal && s.signalsCount > 0
                                ? (s.signal = 1)
                                : (s.signal = 0);
                          break;
                        case 5: {
                          const o = h(
                            e,
                            t % _ChunkConsts.CHUNK_SIZE,
                            Math.floor(t / _ChunkConsts.CHUNK_SIZE),
                            s.rotation,
                            s.flipped,
                            1,
                            0,
                            true,
                          );
                          s.signal = undefined !== o && 0 !== o.lastSignal ? 1 : 0;
                          break;
                        }
                        case 9:
                          0 === s.signal ? (s.signal = 1) : 1 === s.signal && (s.signal = 2);
                          break;
                        case 10:
                        case 11:
                        case 12:
                        case 13:
                        case 14:
                          s.signal = s.signalsCount > 0 ? 2 : 0;
                          break;
                        case 15:
                          s.signal = s.signalsCount > 0 ? 0 : 3;
                          break;
                        case 16:
                          s.signal = s.signalsCount > 1 ? 3 : 0;
                          break;
                        case 17:
                          s.signal = s.signalsCount % 2 == 1 ? 3 : 0;
                          break;
                        case 18:
                          s.signalsCount > 1
                            ? (s.signal = 3)
                            : 1 === s.signalsCount && (s.signal = 0);
                          break;
                        case 19:
                          s.signalsCount > 0 && (s.signal = 0 === s.signal ? 3 : 0);
                          break;
                        case 20:
                          ((s.signal = s.signalsCount > 0 && Math.random() < 0.5 ? 5 : 0),
                            (0 !== s.lastSignal || s.signalsCount > 0) && e.setUpdated());
                          break;
                        case 21:
                          s.signal = 0;
                          break;
                        case 22: {
                          const o = t % _ChunkConsts.CHUNK_SIZE,
                            a = Math.floor(t / _ChunkConsts.CHUNK_SIZE);
                          s.signal = s.signalsCount > 0 ? 1 : 0;
                          const n = e.getLevelArrow(o, a);
                          n?.update();
                          break;
                        }
                        case 24:
                          s.signal = s.signalsCount > 0 ? 5 : 0;
                      }
                      s.signalsCount = 0;
                    }
                  }
              })(e),
            ),
            e.chunks.forEach((e) =>
              (function (e) {
                if (0 !== e.lastUpdateState)
                  for (let t = 0; t < _ChunkConsts.CHUNK_AREA; t++) {
                    const s = e.getArrowByIndex(t);
                    3 === s.type &&
                      1 === s.lastSignal &&
                      r(
                        h(
                          e,
                          t % _ChunkConsts.CHUNK_SIZE,
                          Math.floor(t / _ChunkConsts.CHUNK_SIZE),
                          s.rotation,
                          s.flipped,
                        ),
                      );
                  }
              })(e),
            ),
            e.chunks.forEach((e) =>
              (function (e) {
                0 !== e.levelArrows.size &&
                  (e.setUpdated(),
                  e.levelArrows.forEach((e) => {
                    23 === e.arrow.type && e.update();
                  }));
              })(e),
            ),
            e.chunks.forEach((e) =>
              (function (e) {
                if (2 === e.updateState)
                  for (let t = 0; t < e.adjacentChunks.length; t++) {
                    const s = e.adjacentChunks[t];
                    undefined !== s && 0 === s.updateState && (s.updateState = 1);
                  }
              })(e),
            ),
            e.chunks.forEach((e) =>
              (function (e) {
                if (!e.renderDirty && 0 !== e.lastUpdateState)
                  for (let t = 0; t < _ChunkConsts.CHUNK_AREA; t++)
                    if (c(e.getArrowByIndex(t))) {
                      e.renderDirty = true;
                      break;
                    }
              })(e),
            ),
            e.chunks.forEach((e) => {
              ((e.lastUpdateState = e.updateState),
                2 === e.updateState ? (e.updateState = 1) : (e.updateState = 0));
            }));
        }),
          (e.clearSignals = function (e) {
            e.chunks.forEach((e) => {
              (e.setUpdated(), (e.renderDirty = true));
              for (let t = 0; t < _ChunkConsts.CHUNK_SIZE; t++)
                for (let s = 0; s < _ChunkConsts.CHUNK_SIZE; s++) {
                  const i = e.getArrow(t, s);
                  ((i.signal = 0), (i.lastSignal = 0), (i.signalsCount = 0));
                }
              e.levelArrows.forEach((e) => {
                e.state = null;
              });
            });
          }));
      })(o || (exports.ChunkUpdates = o = {}));
    },
    ControlsHintsText(exports) {
      const I18nText = require("I18nText").I18nText;
      var o;
      !(function (e) {
        ((e.MOVE = new I18nText("move", "двигаться", "рухатися", "рухацца", "se déplacer")),
          (e.ROTATE = new I18nText("rotate", "повернуть", "обернути", "павярнуць", "tourner")),
          (e.DELETE = new I18nText("delete", "удалить", "видалити", "выдаліць", "supprimer")),
          (e.SELECT = new I18nText("select", "выделить", "виділити", "вылучыць", "sélectionner")),
          (e.UNDO = new I18nText("undo", "отмена", "відміна", "адмена", "annuler")),
          (e.PAUSE = new I18nText("pause", "пауза", "пауза", "паўза", "pause")),
          (e.MENU = new I18nText("menu", "меню", "меню", "меню", "menu")),
          (e.SET_ARROW = new I18nText("set", "поставить", "поставити", "паставіць", "mettre")),
          (e.FLIP = new I18nText("flip", "отразить", "віддзеркалити", "адлюстраваць", "refléter")),
          (e.PICK = new I18nText("pick", "пипетка", "піпетка", "піпетка", "pipette")),
          (e.INVENTORY = new I18nText(
            "inventory",
            "инвентарь",
            "інвентар",
            "інвентар",
            "inventaire",
          )),
          (e.FREE_CURSOR = new I18nText(
            "free cursor",
            "освободить курсор",
            "звільнити курсор",
            "вызваліць курсор",
            "libérer le curseur",
          )),
          (e.COPY = new I18nText("copy", "скопировать", "скопіювати", "скапіяваць", "copier")),
          (e.PASTE = new I18nText("paste", "вставить", "вставити", "ўставіць", "coller")),
          (e.CUT = new I18nText("cut", "вырезать", "вирізати", "выразаць", "couper")),
          (e.DELETE_SELECTION = new I18nText(
            "delete selection",
            "удалить выделенное",
            "видалити виділене",
            "выдаліць вылучанае",
            "supprimer la sélection",
          )),
          (e.SELECT_OR_DESELECT = new I18nText(
            "select / deselect",
            "выделить / сбросить",
            "виділити / скинути",
            "вылучыць / скінуць",
            "sélectionner / désélectionner",
          )),
          (e.ADD_SELECTION = new I18nText(
            "add selection",
            "добавить выделение",
            "додати виділення",
            "дадаць вылучэнне",
            "ajouter une sélection",
          )),
          (e.REMOVE_SELECTION = new I18nText(
            "remove selection",
            "удалить выделение",
            "видалити виділення",
            "выдаліць вылучэнне",
            "supprimer une sélection",
          )));
      })(o || (exports.ControlsHintsText = o = {}));
    },
    PlayerOverlay(exports) {
      const OverlayText = require("OverlayText").OverlayText;
      exports.PlayerOverlay = class {
        overlayTexts;
        overlayLevels;
        canvasDiv;
        game;
        constructor(e, t) {
          ((this.overlayTexts = []),
            (this.overlayLevels = []),
            (this.canvasDiv = e),
            (this.game = t));
        }
        addText(e, t, s, o, a, n) {
          const r = new OverlayText(e, t, s, o, a, n);
          (r.add(this.canvasDiv), this.overlayTexts.push(r));
        }
        addLevel(e) {
          (e.add(this.canvasDiv), this.overlayLevels.push(e));
          const t = this.canvasDiv.getBoundingClientRect();
          e.elementOffset = [t.left, t.top];
        }
        update() {
          const e = this.getDeviceScale();
          for (let t = 0; t < this.overlayTexts.length; t++)
            this.overlayTexts[t].update(this.game.offset, this.game.scale, e);
          for (let t = 0; t < this.overlayLevels.length; t++)
            this.overlayLevels[t].update(this.game.offset, this.game.scale, e);
        }
        resize() {
          const e = this.canvasDiv.getBoundingClientRect();
          for (let t = 0; t < this.overlayLevels.length; t++)
            this.overlayLevels[t].elementOffset = [e.left, e.top];
        }
        getDeviceScale() {
          const e = this.canvasDiv.getBoundingClientRect();
          if (e.width <= 0) return window.devicePixelRatio;
          const t = this.game.width / e.width;
          return !Number.isFinite(t) || t <= 0 ? window.devicePixelRatio : t;
        }
        dispose() {
          for (let e = 0; e < this.overlayTexts.length; e++) this.overlayTexts[e].remove();
          this.overlayTexts = [];
          for (let e = 0; e < this.overlayLevels.length; e++) this.overlayLevels[e].remove();
          this.overlayLevels = [];
        }
      };
    },
    UIMenuButton(exports) {
      const UIComponent = require("UIComponent").UIComponent;
      class o extends UIComponent {
        button;
        onClick;
        mousePressed;
        mouseReleasedTime;
        constructor(e, t) {
          (super(e),
            (this.onClick = t),
            (this.mousePressed = false),
            (this.mouseReleasedTime = Date.now()),
            (this.button = document.createElement("button")),
            (this.button.className = "ui-menu-button"),
            (this.button.innerHTML =
              '<div class="menu-icon-line"></div><div class="menu-icon-line"></div><div class="menu-icon-line"></div>'),
            (this.button.onpointerdown = () => this.handleMouseDown()),
            document.addEventListener("pointerup", this.pointerUp),
            this.element.appendChild(this.button));
        }
        getClass() {
          return "ui-menu-button-container";
        }
        isMouseCaptured() {
          return !!this.mousePressed || Date.now() - this.mouseReleasedTime < 100;
        }
        handleMouseDown() {
          (this.onClick(), (this.mousePressed = true), (this.mouseReleasedTime = Date.now()));
        }
        pointerUp = (e) => {
          (e.preventDefault(), e.stopPropagation(), (this.mousePressed = false));
        };
        remove() {
          ((this.button.onmousedown = null),
            (this.button.ontouchstart = null),
            (this.button.onclick = null),
            document.removeEventListener("pointerup", this.pointerUp),
            super.remove());
        }
      }
      exports.UIMenuButton = o;
    },
    GameHistory(exports) {
      const PlayerMapAction = require("PlayerMapAction").PlayerMapAction;
      class o {
        static MAX_SIZE = 100;
        states;
        current;
        lastChangeTime;
        constructor() {
          ((this.states = []), (this.current = -1), (this.lastChangeTime = 0));
        }
        addChange(e, t, s, o) {
          if (s.equals(o)) return;
          const a = Date.now();
          (a - this.lastChangeTime > 2e3 &&
            (this.pushState(new PlayerMapAction()), (this.lastChangeTime = a)),
            this.getCurrentState().addChangedArrow(e, t, s, o));
        }
        pushState(e) {
          (this.current !== this.states.length - 1 && (this.states.length = this.current + 1),
            this.states.push(e),
            this.states.length > o.MAX_SIZE && this.states.shift(),
            (this.current = this.states.length - 1));
        }
        undo() {
          this.current <= 0 || this.current--;
        }
        redo() {
          this.current !== this.states.length - 1 && 0 !== this.states.length && this.current++;
        }
        getCurrentState() {
          return this.states[this.current];
        }
        getIsLastState() {
          return this.current === this.states.length - 1;
        }
        canUndo() {
          return this.current > 0 && this.states.length > 0;
        }
        canRedo() {
          return this.current < this.states.length - 1 && this.states.length > 0;
        }
      }
      exports.GameHistory = o;
    },
    Arrow(exports) {
      exports.Arrow = class {
        type = 0;
        rotation = 0;
        flipped = false;
        signal = 0;
        signalsCount = 0;
        lastType = 0;
        lastRotation = 0;
        lastFlipped = false;
        lastSignal = 0;
        canBeEdited = true;
      };
    },
    UIUndoButton(exports) {
      const UIComponent = require("UIComponent").UIComponent;
      class o extends UIComponent {
        button;
        icon;
        onClick;
        mousePressed;
        mouseReleasedTime;
        flipped;
        constructor(e, t, s = false) {
          (super(e),
            (this.onClick = t),
            (this.mousePressed = false),
            (this.mouseReleasedTime = 0),
            (this.flipped = s),
            (this.button = document.createElement("button")),
            (this.button.className = "ui-undo-button"),
            (this.icon = document.createElement("img")),
            (this.icon.src = "res/icons/icon_undo.svg"),
            (this.icon.className = "ui-undo-icon"),
            this.flipped && this.element.classList.add("flipped"),
            this.button.appendChild(this.icon),
            (this.button.onmousedown = (e) => this.handleMouseDown(e)),
            (this.button.ontouchstart = (e) => this.handleTouchStart(e)),
            (this.button.onclick = (e) => this.handleClick(e)),
            (this.button.ontouchend = (e) => this.handleTouch(e)),
            this.element.appendChild(this.button));
        }
        getClass() {
          return "ui-undo-button-container";
        }
        isMouseCaptured() {
          return !!this.mousePressed || Date.now() - this.mouseReleasedTime < 100;
        }
        setEnabled(e) {
          ((this.button.disabled = !e),
            e ? this.button.classList.remove("disabled") : this.button.classList.add("disabled"));
        }
        handleMouseDown(e) {
          (e.preventDefault(), e.stopPropagation(), (this.mousePressed = true));
        }
        handleTouchStart(e) {
          (e.preventDefault(), e.stopPropagation(), (this.mousePressed = true));
        }
        handleClick(e) {
          (e.preventDefault(),
            e.stopPropagation(),
            this.onClick(),
            (this.mousePressed = false),
            (this.mouseReleasedTime = Date.now()));
        }
        handleTouch(e) {
          (e.preventDefault(),
            e.stopPropagation(),
            this.onClick(),
            (this.mousePressed = false),
            (this.mouseReleasedTime = Date.now()));
        }
        remove() {
          ((this.button.onmousedown = null),
            (this.button.ontouchstart = null),
            (this.button.onclick = null),
            (this.button.ontouchend = null),
            super.remove());
        }
      }
      exports.UIUndoButton = o;
    },
    Shader(exports) {
      class s {
        static lastId = 0;
        id;
        program = null;
        attributes = new Map();
        uniforms = new Map();
        gl;
        constructor(e, t, i) {
          ((this.id = s.lastId++), (this.gl = e), this.compile(t, i));
        }
        getProgram() {
          return this.program;
        }
        dispose() {
          this.gl.deleteProgram(this.program);
        }
        getAttribute(e) {
          const t = this.attributes.get(e);
          return undefined === t ? -1 : t;
        }
        enable() {
          this.gl.useProgram(this.program);
          const e = this.attributes.values();
          for (let t = 0; t < this.attributes.size; t++) {
            const t = e.next();
            this.gl.enableVertexAttribArray(t.value);
          }
        }
        disable() {
          const e = this.attributes.values();
          for (let t = 0; t < this.attributes.size; t++) {
            const t = e.next();
            this.gl.disableVertexAttribArray(t.value);
          }
        }
        uniform1f(e, t) {
          const s = this.uniforms.get(e);
          undefined !== s && this.gl.uniform1f(s, t);
        }
        uniform1i(e, t) {
          const s = this.uniforms.get(e);
          undefined !== s && this.gl.uniform1i(s, t);
        }
        uniform2f(e, t, s) {
          const i = this.uniforms.get(e);
          undefined !== i && this.gl.uniform2f(i, t, s);
        }
        uniform3f(e, t, s, i) {
          const o = this.uniforms.get(e);
          undefined !== o && this.gl.uniform3f(o, t, s, i);
        }
        uniform4f(e, t, s, i, o) {
          const a = this.uniforms.get(e);
          undefined !== a && this.gl.uniform4f(a, t, s, i, o);
        }
        uniformMatrix3fv(e, t) {
          const s = this.uniforms.get(e);
          undefined !== s && this.gl.uniformMatrix3fv(s, false, t);
        }
        uniformMatrix4fv(e, t) {
          const s = this.uniforms.get(e);
          undefined !== s && this.gl.uniformMatrix4fv(s, false, t);
        }
        compile(e, t) {
          const s = this.gl.createShader(this.gl.VERTEX_SHADER);
          if (null === s) return;
          (this.gl.shaderSource(s, e), this.gl.compileShader(s));
          const i = this.gl.getShaderInfoLog(s);
          null !== i && "" !== i && console.log(i);
          const o = this.gl.createShader(this.gl.FRAGMENT_SHADER);
          if (null === o) return;
          (this.gl.shaderSource(o, t), this.gl.compileShader(o));
          const a = this.gl.getShaderInfoLog(o);
          null !== a && "" !== a && (console.log(a), console.log(t));
          const n = this.gl.createProgram();
          null !== n &&
            (this.gl.attachShader(n, s),
            this.gl.attachShader(n, o),
            this.gl.linkProgram(n),
            this.gl.deleteShader(s),
            this.gl.deleteShader(o),
            (this.program = n),
            this.initAttributes(),
            this.initUniforms());
        }
        initAttributes() {
          if (null === this.program) return;
          const e = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
          this.attributes = new Map();
          for (let t = 0; t < e; t++) {
            const e = this.gl.getActiveAttrib(this.program, t);
            if (null === e) continue;
            const s = this.gl.getAttribLocation(this.program, e.name);
            -1 !== s && this.attributes.set(e.name, s);
          }
        }
        initUniforms() {
          if (null === this.program) return;
          const e = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);
          this.uniforms = new Map();
          for (let t = 0; t < e; t++) {
            const e = this.gl.getActiveUniform(this.program, t);
            if (null === e) continue;
            const s = this.gl.getUniformLocation(this.program, e.name);
            null !== s && this.uniforms.set(e.name, s);
          }
        }
      }
      exports.Shader = s;
    },
    UIComponent(exports) {
      exports.UIComponent = class {
        element;
        isRemoved;
        mutationObserver;
        constructor(e) {
          ((this.element = document.createElement("div")),
            (this.isRemoved = false),
            e.appendChild(this.element),
            (this.element.className = this.getClass()),
            (this.mutationObserver = new MutationObserver(() => {
              document.body.contains(this.element) || this.remove();
            })),
            this.mutationObserver.observe(document.body, {
              childList: true,
              subtree: true,
            }));
        }
        getRect() {
          return this.element.getBoundingClientRect();
        }
        setVisibility(e) {
          this.element.hidden = !e;
        }
        getIsRemoved() {
          return this.isRemoved;
        }
        remove() {
          this.isRemoved ||
            (this.mutationObserver.disconnect(), this.element.remove(), (this.isRemoved = true));
        }
      };
    },
    PlayerSettings(exports) {
      var s;
      (function (e) {
        ((e.arrowAtlasImage = new Image()),
          (e.levelArrows = [22, 23]),
          (e.framesToSkip = [20, 5, 1, 1, 1, 1]),
          (e.framesToUpdate = [1, 1, 1, 5, 20, 100]));
      })(s || (exports.PlayerSettings = s = {}));
    },
    PLATFORM(exports) {
      exports.PLATFORM =
        "desktop" === localStorage.getItem("interface-mode")
          ? "web"
          : "mobile" === localStorage.getItem("interface-mode") ||
              /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent,
              )
            ? "mobile"
            : window && window.process && window.process.type
              ? "desktop"
              : "web";
    },
    load(exports) {
      exports.load = function (e, t) {
        if (t.length < 4) return;
        let s = 0,
          i = t[s++];
        if (((i |= t[s++] << 8), 0 !== i)) throw new Error("Unsupported save version");
        let o = t[s++];
        o |= t[s++] << 8;
        for (let i = 0; i < o; i++) {
          let i = t[s++];
          ((i |= (127 & t[s++]) << 8), 128 & t[s - 1] && (i = -i));
          let o = t[s++];
          ((o |= (127 & t[s++]) << 8), 128 & t[s - 1] && (o = -o));
          const a = t[s++] + 1,
            n = e.getOrCreateChunk(i, o);
          for (let e = 0; e < a; e++) {
            const e = t[s++],
              i = t[s++] + 1;
            for (let o = 0; o < i; o++) {
              const i = t[s++],
                o = t[s++],
                a = n.getArrow(15 & i, i >> 4);
              ((a.type = e), (a.rotation = 3 & o), (a.flipped = !!(4 & o)));
            }
          }
        }
      };
    },
    UIToolsToggle(exports) {
      const GameText = require("GameText").GameText,
        UIComponent = require("UIComponent").UIComponent;
      class a extends UIComponent {
        state;
        toggleCallback = () => {};
        mouseCaptured = false;
        mouseReleasedTime = 0;
        constructor(e) {
          (super(e),
            (this.state = "arrows"),
            (this.element.innerText = GameText.MENU_TOOLS.get()),
            (this.element.onpointerdown = () => {
              ((this.mouseCaptured = true), this.toggle());
            }),
            (this.element.onpointerup = () => {
              (this.mouseCaptured && (this.mouseReleasedTime = Date.now()),
                (this.mouseCaptured = false));
            }));
        }
        toggle() {
          ("arrows" === this.state
            ? ((this.state = "main"), (this.element.innerText = GameText.MENU_ARROWS.get()))
            : ((this.state = "arrows"), (this.element.innerText = GameText.MENU_TOOLS.get())),
            this.toggleCallback(this.state));
        }
        setToggleCallback(e) {
          this.toggleCallback = e;
        }
        getState() {
          return this.state;
        }
        setState(e) {
          ((this.state = e),
            (this.element.innerText =
              "arrows" === e ? GameText.MENU_TOOLS.get() : GameText.MENU_ARROWS.get()));
        }
        isMouseCaptured() {
          return !!this.mouseCaptured || Date.now() - this.mouseReleasedTime < 100;
        }
        getClass() {
          return "ui-tools-toggle";
        }
      }
      exports.UIToolsToggle = a;
    },
    Backend(exports) {
      const AuthState = require("AuthState").AuthState,
        ArrowsDB = require("ArrowsDB").ArrowsDB,
        LocalRoutes = require("LocalRoutes").LocalRoutes,
        Routes = require("Routes").Routes;
      function r() {
        return !!AuthState.isGuest();
      }
      class l {
        static async getMap(e, t) {
          if (
            (!r() && "none" !== AuthState.getMode()) ||
            (l.loginAsGuest(), e.startsWith("local-"))
          ) {
            if (r()) {
              const s = await LocalRoutes.getMap(e);
              return void (undefined !== s && t(s));
            }
            Routes.getMap(e, t);
          } else Routes.getMapGuest(e, t);
        }
        static async getMaps(e) {
          return r() ? LocalRoutes.getMaps(e) : Routes.getMaps(e);
        }
        static async getMapsInfo() {
          return r() ? LocalRoutes.getMapsInfo() : Routes.getMapsInfo();
        }
        static async saveMap(e, t) {
          return r()
            ? LocalRoutes.saveMap(e, t)
            : (await ArrowsDB.write("mapCache", {
                ...e,
                data: t,
                version: e.version + 1,
              }),
              Routes.saveMap(e.id, t));
        }
        static async saveMapInfo(e, t) {
          r() ? t(await LocalRoutes.saveMapInfo(e)) : Routes.saveMapInfo(e, t);
        }
        static async createMap(e) {
          r() ? e(await LocalRoutes.createMap()) : Routes.createMap(e);
        }
        static async deleteMap(e, t) {
          if (r()) return (await LocalRoutes.deleteMap(e), void t());
          Routes.deleteMap(e, t);
        }
        static checkUser(e, t) {
          r()
            ? e("Guest")
            : Routes.checkUser(
                (t) => {
                  (AuthState.setCookieUser(t), e(t));
                },
                () => {
                  (AuthState.setLoggedOut(), t());
                },
              );
        }
        static async checkNameChange() {
          return r() ? Promise.resolve(false) : Routes.checkNameChange();
        }
        static logout() {
          r() ? LocalRoutes.logout() : (AuthState.setLoggedOut(), Routes.logout());
        }
        static async setName(e) {
          return r() ? Promise.resolve(true) : Routes.setName(e);
        }
        static async getLevels() {
          return r() ? LocalRoutes.getLevels() : Routes.getLevels();
        }
        static async completeLevel(e) {
          return r() ? LocalRoutes.completeLevel(e) : Routes.completeLevel(e);
        }
        static loginAsGuest() {
          (AuthState.setGuest(),
            document.documentElement.style.setProperty("--blue", "#3c35a3"),
            document.documentElement.style.setProperty("--dark-blue", "#2d278e"));
        }
      }
      exports.Backend = l;
    },
    ArrowDescriptions(exports) {
      const I18nText = require("I18nText").I18nText;
      var o;
      !(function (e) {
        const t = new Map([
            [
              0,
              new I18nText(
                "Empty cell",
                "Пустая клетка",
                "Порожня клітина",
                "Пустая клетка",
                "Case vide",
              ),
            ],
            [1, new I18nText("Arrow", "Стрелка", "Стрілка", "Стрэлка", "Flèche")],
            [
              2,
              new I18nText(
                "Source block",
                "Блок источника",
                "Блок джерела",
                "Блок крыніцы",
                "Bloc source",
              ),
            ],
            [3, new I18nText("Blocker", "Блокер", "Блокер", "Блокер", "Bloqueur")],
            [
              4,
              new I18nText(
                "Delay arrow",
                "Стрелка задержки",
                "Стрілка затримки",
                "Стрэлка затрымкі",
                "Flèche de délai",
              ),
            ],
            [
              5,
              new I18nText(
                "Signal detector",
                "Детектор сигнала",
                "Детектор сигналу",
                "Дэтэктар сігналу",
                "Détecteur de signal",
              ),
            ],
            [
              6,
              new I18nText(
                "Splitter",
                "Разветвитель",
                "Розгалужувач",
                "Разгалінавальнік",
                "Diviseur",
              ),
            ],
            [
              7,
              new I18nText(
                "Splitter",
                "Разветвитель",
                "Розгалужувач",
                "Разгалінавальнік",
                "Diviseur",
              ),
            ],
            [
              8,
              new I18nText(
                "Splitter",
                "Разветвитель",
                "Розгалужувач",
                "Разгалінавальнік",
                "Diviseur",
              ),
            ],
            [
              9,
              new I18nText(
                "Pulse generator",
                "Генератор импульса",
                "Генератор імпульсу",
                "Генератар імпульсу",
                "Générateur de impulsion",
              ),
            ],
            [
              10,
              new I18nText(
                "Blue arrow",
                "Синяя стрелка",
                "Синя стрілка",
                "Сіняя стрэлка",
                "Flèche bleue",
              ),
            ],
            [
              11,
              new I18nText(
                "Diagonal arrow",
                "Диагональная стрелка",
                "Діагональна стрілка",
                "Дыяганальная стрэлка",
                "Flèche diagonale",
              ),
            ],
            [
              12,
              new I18nText(
                "Blue splitter",
                "Синий разветвитель",
                "Синій розгалужувач",
                "Сіні разгалінавальнік",
                "Diviseur bleu",
              ),
            ],
            [
              13,
              new I18nText(
                "Blue splitter",
                "Синий разветвитель",
                "Синій розгалужувач",
                "Сіні разгалінавальнік",
                "Diviseur bleu",
              ),
            ],
            [
              14,
              new I18nText(
                "Blue splitter",
                "Синий разветвитель",
                "Синій розгалужувач",
                "Сіні разгалінавальнік",
                "Diviseur bleu",
              ),
            ],
            [
              15,
              new I18nText(
                "Not gate",
                "Отрицание",
                "Заперечення",
                "Адмоўнік",
                "Porte logique de négation",
              ),
            ],
            [16, new I18nText("And gate", "И", "І", "І", 'Porte logique "et"')],
            [
              17,
              new I18nText(
                "XOR gate",
                "Исключающее ИЛИ",
                "Виняткове АБО",
                "Выключнае АБО",
                "Porte XOR",
              ),
            ],
            [18, new I18nText("Latch", "Триггер", "Тригер", "Трыгер", "Verrou")],
            [19, new I18nText("T flip-flop", "T-триггер", "T-тригер", "T-трыгер", "Bascule T")],
            [
              20,
              new I18nText(
                "Randomizer",
                "Рандомайзер",
                "Рандомайзер",
                "Рандамайзер",
                "Randomiseur",
              ),
            ],
            [21, new I18nText("Button", "Кнопка", "Кнопка", "Кнопка", "Bouton")],
            [22, new I18nText("Source", "Источник", "Джерело", "Крыніца", "Source")],
            [23, new I18nText("Target", "Приемник", "Приймач", "Прыёмнік", "Cible")],
            [
              24,
              new I18nText(
                "Directional button",
                "Направленная кнопка",
                "Направлена кнопка",
                "Накіраваная кнопка",
                "Bouton directionnel",
              ),
            ],
            [25, new I18nText("Wall", "Стена", "Стіна", "Сцяна", "Mur")],
          ]),
          s = new Map([
            [0, new I18nText("Never.", "Никогда.", "Ніколи.", "Ніколі.", "Jamais")],
            [
              1,
              new I18nText(
                "On any incoming signal.",
                "Любым входящим сигналом.",
                "Будь-яким вхідним сигналом.",
                "Любым уваходным сігналам.",
                "Avec n'importe quel signal intrant",
              ),
            ],
            [2, new I18nText("Every time.", "Всегда.", "Завжди.", "Заўсёды.", "Toujours")],
            [
              3,
              new I18nText(
                "On any incoming signal.",
                "Любым входящим сигналом.",
                "Будь-яким вхідним сигналом.",
                "Любым уваходным сігналам.",
                "Avec n'importe quel signal intrant",
              ),
            ],
            [
              4,
              new I18nText(
                "#b(Blue) on any incoming signal if not active.<br>#r(Red) if the current color is #b(blue).",
                "#b(Синим) при любом входящем сигнале если не активна.<br>#r(Красным) если активна #b(синим).",
                "#b(Синім) при будь-якому вхідному сигналі якщо не активна.<br>#r(Червоним) якщо активна #b(синім).",
                "#b(Сіняй) пры любым уваходным сігнале калі не актыўна.<br>#r(Чырвонай) калі актыўна #b(сіняй).",
                "#b(Bleu) non-actif n'importe le signal intrant.<br>#r(Rouge) si la couleur actuelle est : #b(bleu).",
              ),
            ],
            [
              5,
              new I18nText(
                "If the cell behind is active.",
                "Если активна стрелка сзади.",
                "Якщо активна стрілка ззаду.",
                "Калі актыўна стрэлка ззаду.",
                "Si la case derrière est active",
              ),
            ],
            [
              6,
              new I18nText(
                "On any incoming signal.",
                "Любым входящим сигналом.",
                "Будь-яким вхідним сигналом.",
                "Любым уваходным сігналам.",
                "À tout signal entrant",
              ),
            ],
            [
              7,
              new I18nText(
                "On any incoming signal.",
                "Любым входящим сигналом.",
                "Будь-яким вхідним сигналом.",
                "Любым уваходным сігналам.",
                "À tout signal entrant",
              ),
            ],
            [
              8,
              new I18nText(
                "On any incoming signal.",
                "Любым входящим сигналом.",
                "Будь-яким вхідним сигналом.",
                "Любым уваходным сігналам.",
                "À tout signal entrant",
              ),
            ],
            [
              9,
              new I18nText(
                "#r(Red) if not active.<br>#b(Blue) if the current color is #r(red) or #b(blue).",
                "#r(Красным) если не активна.<br>#b(Синим) если активна #r(красным) или #b(синим).",
                "#r(Червоним) якщо не активна.<br>#b(Синім) якщо активна #r(червоним) або #b(синім).",
                "#r(Чырвонай) калі не актыўна.<br>#b(Сіняй) калі актыўна #r(чырвонай) або #b(сіняй).",
                "#r(Rouge) quand n'est pas actif.<br>#b(Bleu) quand est actif #r(rouge) ou #b(bleu).",
              ),
            ],
            [
              10,
              new I18nText(
                "On any incoming signal.",
                "Любым входящим сигналом.",
                "Будь-яким вхідним сигналом.",
                "Любым уваходным сігналам.",
                "À tout signal entrant",
              ),
            ],
            [
              11,
              new I18nText(
                "On any incoming signal.",
                "Любым входящим сигналом.",
                "Будь-яким вхідним сигналом.",
                "Любым уваходным сігналам.",
                "À tout signal entrant",
              ),
            ],
            [
              12,
              new I18nText(
                "On any incoming signal.",
                "Любым входящим сигналом.",
                "Будь-яким вхідним сигналом.",
                "Любым уваходным сігналам.",
                "À tout signal entrant",
              ),
            ],
            [
              13,
              new I18nText(
                "On any incoming signal.",
                "Любым входящим сигналом.",
                "Будь-яким вхідним сигналом.",
                "Любым уваходным сігналам.",
                "À tout signal entrant",
              ),
            ],
            [
              14,
              new I18nText(
                "On any incoming signal.",
                "Любым входящим сигналом.",
                "Будь-яким вхідним сигналом.",
                "Любым уваходным сігналам.",
                "À tout signal entrant",
              ),
            ],
            [
              15,
              new I18nText(
                "When there are no incoming signals.",
                "Когда нет входящих сигналов.",
                "Коли немає вхідних сигналів.",
                "Калі няма ўваходных сігналаў.",
                "Quand il n'y a pas de signaux intrants",
              ),
            ],
            [
              16,
              new I18nText(
                "On at least two incoming signals.",
                "При минимум двух входящих сигналах.",
                "При мінімум двох вхідних сигналах.",
                "Пры мінімум двух уваходных сігналах.",
                "Au minimum de deux signaux intrants",
              ),
            ],
            [
              17,
              new I18nText(
                "On odd number of incoming signals.",
                "При нечетном количестве входящих сигналов.",
                "При непарній кількості вхідних сигналів.",
                "Пры няцотнай колькасці ўваходных сігналаў.",
                "Quand il y a un nombre de signaux intrants non-paire",
              ),
            ],
            [
              18,
              new I18nText(
                "On at least two incoming signals. Or when there are no incoming signals and already active.",
                "При минимум двух входящих сигналах. Или когда нет входящих сигналов и уже активна.",
                "При мінімум двох вхідних сигналах. Або коли немає вхідних сигналів і вже активна.",
                "Пры мінімум двух уваходных сігналах. Або калі няма ўваходных сігналаў і ўжо актыўна.",
                "Au minimum de deux signaux intrants. Ou quand il n'y a pas de signaux intrants et est encore actif",
              ),
            ],
            [
              19,
              new I18nText(
                "On any incoming signal if not active. Or when there are no incoming signals and already active.",
                "При любом входящем сигнале, если не активна. Или когда нет входящих сигналов и уже активна.",
                "При будь-якому вхідному сигналі, якщо не активна. Або коли немає вхідних сигналів і вже активна.",
                "Пры любым уваходным сігнале, калі не актыўна. Або калі няма ўваходных сігналаў і ўжо актыўна.",
                "À tout signal entrant, quand n'est pas actif. Ou quand il n'y a pas de signaux intrants et est déjà activé",
              ),
            ],
            [
              20,
              new I18nText(
                "On any incoming signal with 50% chance.",
                "При любом входящем сигнале с 50% вероятностью.",
                "При будь-якому вхідному сигналі з 50% ймовірністю.",
                "Пры любым уваходным сігнале з 50% верагоднасцю.",
                "À tout signal entrant avec une chance de 50%",
              ),
            ],
            [
              21,
              new I18nText(
                "When pressed with the left mouse button.",
                "При нажатии левой кнопкой мыши.",
                "При натисканні лівою кнопкою миші.",
                "Пры націсканні левай кнопкай мышы.",
                "Quand le bouton gauche de la souris est appuyé.",
              ),
            ],
            [
              22,
              new I18nText(
                "On any incoming signal.",
                "Любым входящим сигналом.",
                "Будь-яким вхідним сигналом.",
                "Любым уваходным сігналам.",
                "À tout signal entrant",
              ),
            ],
            [
              23,
              new I18nText(
                "On any incoming signal.",
                "Любым входящим сигналом.",
                "Будь-яким вхідним сигналом.",
                "Любым уваходным сігналам.",
                "À tout signal entrant",
              ),
            ],
            [
              24,
              new I18nText(
                "When pressed with the left mouse button or on any incoming signal.",
                "При нажатии левой кнопкой мыши или любым входящим сигналом.",
                "При натисканні лівою кнопкою миші або будь-яким вхідним сигналом.",
                "Пры націсканні левай кнопкай мышы або любым уваходным сігналам.",
                "À tout signal entrant ou quand le bouton gauche de la souris est appuyé.",
              ),
            ],
            [25, new I18nText("Never.", "Никогда.", "Ніколи.", "Ніколі.", "Jamais")],
          ]),
          o = new Map([
            [
              0,
              new I18nText(
                "Does nothing.",
                "Ничего не делает.",
                "Нічого не робить.",
                "Нічога не робіць.",
                "Ne fait rien",
              ),
            ],
            [
              1,
              new I18nText(
                "Sends a signal forwards.",
                "Передает сигнал вперед.",
                "Передає сигнал вперед.",
                "Перадае сігнал наперад.",
                "Transmet un signal en avant.",
              ),
            ],
            [
              2,
              new I18nText(
                "Sends signals in four directions around it.",
                "Передает сигналы в четырех направлениях вокруг себя.",
                "Передає сигнали в чотирьох напрямках навколо себе.",
                "Перадае сігналы ў чатырох напрамках навакол сябе.",
                "Transmet des signaux dans les quatre directions autour de soi-même.",
              ),
            ],
            [
              3,
              new I18nText(
                "Turns off an arrow in front of it.",
                "Выключает стрелку перед собой.",
                "Вимикає стрілку перед собою.",
                "Выключае стрэлку перад сабою.",
                "Éteint une flèche devant lui",
              ),
            ],
            [
              4,
              new I18nText(
                "If the signal is #r(red) sends a signal forwards.",
                "Если сигнал #r(красный), передает сигнал вперед.",
                "Якщо сигнал #r(червоний), передає сигнал вперед.",
                "Калі сігнал #r(чырвоны), перадае сігнал наперад.",
                "Si le signal est #r(rouge), transmet un signal en avant.",
              ),
            ],
            [
              5,
              new I18nText(
                "Sends a signal forwards.",
                "Передает сигнал вперед.",
                "Передає сигнал вперед.",
                "Перадае сігнал наперад.",
                "Transmet un signal en avant",
              ),
            ],
            [
              6,
              new I18nText(
                "Sends a signal both forwards and backwards.",
                "Передает сигнал и вперед, и назад.",
                "Передає сигнал і вперед, і назад.",
                "Перадае сігнал і наперад, і назад.",
                "Transmet un signal en avant et en arrière",
              ),
            ],
            [
              7,
              new I18nText(
                "Sends a signal forward and to the right.",
                "Передает сигнал вперед и вправо.",
                "Передає сигнал вперед і праворуч.",
                "Перадае сігнал наперад і ўправа.",
                "Transmet un signal en avant et à gauche",
              ),
            ],
            [
              8,
              new I18nText(
                "Sends a signal forward, right, and left.",
                "Передает сигнал вперед, вправо и влево.",
                "Передає сигнал вперед, праворуч і ліворуч.",
                "Перадае сігнал наперад, управа і ўлева.",
                "Transmet un signal en avant, à gauche et à droite.",
              ),
            ],
            [
              9,
              new I18nText(
                "If the signal is #r(red) sends signals in four directions around it.",
                "Если сигнал #r(красный), передает сигналы в четырех направлениях вокруг себя.",
                "Якщо сигнал #r(червоний), передає сигнали в чотирьох напрямках навколо себе.",
                "Калі сігнал #r(чырвоны), перадае сігналы ў чатырох напрамках вакол сябе.",
                "Si le signal est #r(rouge), transmet des signaux dans les quatre directions autour de soi-même.",
              ),
            ],
            [
              10,
              new I18nText(
                "Sends a signal forwards, skipping one cell.",
                "Передает сигнал вперед через одну клетку.",
                "Передає сигнал вперед через одну клітинку.",
                "Перадае сігнал наперад праз адну клетку.",
                "Transmet un signal en avant, en sautant une case.",
              ),
            ],
            [
              11,
              new I18nText(
                "Sends a signal diagonally.",
                "Передает сигнал по диагонали.",
                "Передає сигнал по діагоналі.",
                "Перадае сігнал па дыяганалі.",
                "Tranmet un signal en diagonale.",
              ),
            ],
            [
              12,
              new I18nText(
                "Sends a signal to the two cells directly in front of it.",
                "Передает сигнал в две клетки перед собой.",
                "Передає сигнал у дві клітинки перед собою.",
                "Перадае сігнал у два клеткі перад сабою.",
                "Transmet un signal dans les deux cases directement devant lui.",
              ),
            ],
            [
              13,
              new I18nText(
                "Sends a signal forwards, skipping one cell and to the right.",
                "Передает сигнал вперед через одну клетку и вправо.",
                "Передає сигнал вперед через одну клітинку і праворуч.",
                "Перадае сігнал наперад праз адну клетку і ўправа.",
                "Transmet un signal en avant et à droite, en sautant une case.",
              ),
            ],
            [
              14,
              new I18nText(
                "Sends a signal forwards and diagonally.",
                "Передает сигнал вперед и по диагонали.",
                "Передає сигнал вперед і по діагоналі.",
                "Перадае сігнал наперад і па дыяганалі.",
                "Transmet un signal en avant et en diagonale.",
              ),
            ],
            [
              15,
              new I18nText(
                "Sends a signal forwards.",
                "Передает сигнал вперед.",
                "Передає сигнал вперед.",
                "Перадае сігнал наперад.",
                "Transmet un signal en avant.",
              ),
            ],
            [
              16,
              new I18nText(
                "Sends a signal forwards.",
                "Передает сигнал вперед.",
                "Передає сигнал вперед.",
                "Перадае сігнал наперад.",
                "Transmet un signal en avant.",
              ),
            ],
            [
              17,
              new I18nText(
                "Sends a signal forwards.",
                "Передает сигнал вперед.",
                "Передає сигнал вперед.",
                "Перадае сігнал наперад.",
                "Transmet un signal en avant.",
              ),
            ],
            [
              18,
              new I18nText(
                "Sends a signal forwards.",
                "Передает сигнал вперед.",
                "Передає сигнал вперед.",
                "Перадае сігнал наперад.",
                "Transmet un signal en avant.",
              ),
            ],
            [
              19,
              new I18nText(
                "Sends a signal forwards.",
                "Передает сигнал вперед.",
                "Передає сигнал вперед.",
                "Перадае сігнал наперад.",
                "Transmet un signal en avant.",
              ),
            ],
            [
              20,
              new I18nText(
                "Sends a signal forwards.",
                "Передает сигнал вперед.",
                "Передає сигнал вперед.",
                "Перадае сігнал наперад.",
                "Transmet un signal en avant.",
              ),
            ],
            [
              21,
              new I18nText(
                "Sends signals in four directions around it.",
                "Передает сигналы в четырех направлениях вокруг себя.",
                "Передає сигнали в чотирьох напрямках навколо себе.",
                "Перадае сігналы ў чатырох напрамках вакол сябе.",
                "Transmet des signaux dans les quatre directions autour de soi-même.",
              ),
            ],
            [
              22,
              new I18nText(
                "Sends a signal forwards.",
                "Передает сигнал вперед.",
                "Передає сигнал вперед.",
                "Перадае сігнал наперад.",
                "Transmet un signal en avant.",
              ),
            ],
            [
              23,
              new I18nText(
                "Does nothing.",
                "Ничего не делает.",
                "Нічого не робить.",
                "Нічога не робіць.",
                "Ne fait rien",
              ),
            ],
            [
              24,
              new I18nText(
                "Sends a signal forwards.",
                "Передает сигнал вперед.",
                "Передає сигнал вперед.",
                "Перадае сігнал наперад.",
                "Transmet un signal en avant.",
              ),
            ],
            [
              25,
              new I18nText(
                "Does nothing.",
                "Ничего не делает.",
                "Нічого не робить.",
                "Нічога не робіць.",
                "Ne fait rien",
              ),
            ],
          ]);
        ((e.getArrowsCount = function () {
          return t.size;
        }),
          (e.getArrowName = function (e) {
            const s = t.get(e)?.get();
            return undefined !== s ? s : "Unknown";
          }),
          (e.getArrowActivation = function (e) {
            const t = s.get(e)?.get();
            return undefined !== t ? t : "Unknown";
          }),
          (e.getArrowAction = function (e) {
            const t = o.get(e)?.get();
            return undefined !== t ? t : "Unknown";
          }));
      })(o || (exports.ArrowDescriptions = o = {}));
    },
    UIToolbarItemEmpty(exports) {
      const UIComponent = require("UIComponent").UIComponent;
      class o extends UIComponent {
        mouseCaptured = false;
        constructor(e) {
          (super(e),
            (this.element.onpointerdown = () => {
              this.mouseCaptured = true;
            }),
            document.addEventListener("pointerup", this.pointerUp));
        }
        getClass() {
          return "ui-toolbar-item-empty";
        }
        isMouseCaptured() {
          return this.mouseCaptured;
        }
        remove() {
          (document.removeEventListener("pointerup", this.pointerUp), super.remove());
        }
        pointerUp = () => {
          this.mouseCaptured = false;
        };
      }
      exports.UIToolbarItemEmpty = o;
    },
    LevelsUI(exports) {
      exports.LevelsUI = class {
        dispose() {}
      };
    },
    Texture(exports) {
      class s {
        texture = null;
        width = 0;
        height = 0;
        gl;
        filtering;
        mipmapLevels = 0;
        hasMipmaps = false;
        premultiplyAlpha;
        constructor(e, t, s = {}) {
          const {
            filtering: i = "linear",
            mipmaps: o = true,
            mipmapLevels: a,
            premultiplyAlpha: n = false,
          } = s;
          ((this.gl = e),
            (this.width = t.width),
            (this.height = t.height),
            (this.filtering = i),
            (this.hasMipmaps = o),
            (this.premultiplyAlpha = n),
            o && this.setMipmapLevels(a),
            (this.texture = this.init(t)));
        }
        static load(e, t, i = {}) {
          return new Promise((o, a) => {
            const n = new Image();
            ((n.src = t),
              (n.onload = () => {
                o(new s(e, n, i));
              }),
              (n.onerror = a));
          });
        }
        setMipmapLevels(e) {
          const t = Math.floor(Math.log2(Math.max(this.width, this.height))) + 1;
          this.mipmapLevels = undefined === e ? t : Math.min(e, t);
        }
        getMinFiltering() {
          const e = this.gl;
          return this.hasMipmaps
            ? "nearest" === this.filtering
              ? e.NEAREST_MIPMAP_LINEAR
              : e.LINEAR_MIPMAP_LINEAR
            : "nearest" === this.filtering
              ? e.NEAREST
              : e.LINEAR;
        }
        getMagFiltering() {
          const e = this.gl;
          return "nearest" === this.filtering ? e.NEAREST : e.LINEAR;
        }
        dispose() {
          this.gl.deleteTexture(this.texture);
        }
        init(e) {
          const t = this.gl,
            s = t.createTexture();
          return (
            t.bindTexture(t.TEXTURE_2D, s),
            this.premultiplyAlpha && t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1),
            t.texImage2D(t.TEXTURE_2D, 0, t.RGBA8, t.RGBA, t.UNSIGNED_BYTE, e),
            this.premultiplyAlpha && t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0),
            t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE),
            t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE),
            t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, this.getMinFiltering()),
            t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, this.getMagFiltering()),
            this.hasMipmaps &&
              (t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAX_LEVEL, this.mipmapLevels - 1),
              t.generateMipmap(t.TEXTURE_2D)),
            t.bindTexture(t.TEXTURE_2D, null),
            s
          );
        }
      }
      exports.Texture = s;
    },
    UISpeedController(exports) {
      const UIComponent = require("UIComponent").UIComponent;
      class o extends UIComponent {
        rect;
        thumbRect;
        thumb;
        textElement;
        mousePressed;
        mouseOffset;
        value;
        maxValue;
        messageCallback;
        thumbStyleCallback;
        mouseReleasedTime;
        constructor(e, t, s, i = () => "", o = () => "") {
          (super(e),
            (this.mousePressed = false),
            (this.mouseOffset = 0),
            (this.value = s ? 1 : 0),
            (this.maxValue = s ? t : t - 1),
            (this.mouseReleasedTime = 0),
            (this.thumb = document.createElement("div")),
            (this.thumb.className = "ui-range-thumb"),
            this.element.appendChild(this.thumb));
          const a = document.createElement("div");
          ((a.className = "ui-range-thumb-line left"), this.thumb.appendChild(a));
          const n = document.createElement("div");
          ((n.className = "ui-range-thumb-line right"),
            this.thumb.appendChild(n),
            (this.rect = this.element.getBoundingClientRect()),
            (this.thumbRect = this.thumb.getBoundingClientRect()),
            (this.textElement = document.createElement("span")),
            (this.textElement.className = "ui-text-message"),
            this.element.appendChild(this.textElement));
          const r = (this.thumbRect.width / this.rect.width) * 100;
          for (let e = 0; e <= this.maxValue; e++) {
            const t = document.createElement("div");
            ((t.className = "ui-range-tick"),
              (t.style.left = ((100 * e) / this.maxValue) * (1 - r / 100) + r / 2 + "%"),
              this.element.appendChild(t));
          }
          if (s) {
            const e = document.createElement("div");
            ((e.className = "ui-range-pause-area"),
              (e.style.width = 1.15 * r + "%"),
              this.element.appendChild(e));
          }
          ((this.messageCallback = i),
            (this.thumbStyleCallback = o),
            (this.thumb.onpointerdown = (e) => this.mouseDown(e)),
            (this.element.onpointerdown = (e) => this.elementClick(e)),
            document.addEventListener("pointerup", () => this.mouseUp()),
            document.addEventListener("pointermove", (e) => this.mouseMove(e)),
            this.setValue(this.value));
        }
        getClass() {
          return "ui-speed-controller";
        }
        isMouseCaptured() {
          return !!this.mousePressed || Date.now() - this.mouseReleasedTime < 100;
        }
        getValue() {
          return this.value;
        }
        setValue(e) {
          ((this.value = Math.max(0, Math.min(this.maxValue, Math.round(e)))),
            (this.rect = this.element.getBoundingClientRect()),
            (this.thumbRect = this.thumb.getBoundingClientRect()));
          const t = 1 - this.thumbRect.width / this.rect.width,
            s = (this.value / this.maxValue) * t;
          this.thumb.style.left = 100 * s + "%";
        }
        remove() {
          (document.removeEventListener("pointerup", this.mouseUp),
            document.removeEventListener("pointermove", this.mouseMove),
            super.remove());
        }
        mouseDown(e) {
          ((this.rect = this.element.getBoundingClientRect()),
            (this.thumbRect = this.thumb.getBoundingClientRect()),
            (this.mousePressed = true),
            (this.mouseOffset = e.clientX - this.thumbRect.left));
        }
        elementClick(e) {
          if (e.target === this.thumb || this.thumb.contains(e.target)) return;
          ((this.rect = this.element.getBoundingClientRect()),
            (this.thumbRect = this.thumb.getBoundingClientRect()));
          const t = e.clientX - this.rect.left - this.thumbRect.width / 2,
            s = 1 - this.thumbRect.width / this.rect.width,
            i = t / this.rect.width / s;
          (this.setValue(i * this.maxValue),
            this.textElement.classList.add("active"),
            (this.textElement.innerText = this.messageCallback(this.value)),
            (this.thumb.className = `ui-range-thumb ${this.thumbStyleCallback(this.value)}`));
        }
        mouseUp = () => {
          (this.mousePressed && (this.mouseReleasedTime = Date.now()),
            (this.mousePressed = false),
            setTimeout(() => {
              this.textElement.classList.remove("active");
            }, 500));
        };
        mouseMove = (e) => {
          if (!this.mousePressed) return;
          const t = e.clientX - this.rect.left - this.mouseOffset,
            s = 1 - this.thumbRect.width / this.rect.width,
            i = t / this.rect.width / s;
          (this.setValue(i * this.maxValue),
            this.textElement.classList.add("active"),
            (this.textElement.innerText = this.messageCallback(this.value)),
            (this.thumb.className = `ui-range-thumb ${this.thumbStyleCallback(this.value)}`));
        };
      }
      exports.UISpeedController = o;
    },
    Render(exports) {
      const Shader = require("Shader").Shader,
        o = [0, 0, 1, 0, 1, 1, 0, 1],
        a = [0, 1, 2, 0, 2, 3];
      exports.Render = class {
        gl;
        positionBuffer = null;
        indexBuffer = null;
        currentShader = null;
        constructor(e) {
          const t = e.getContext("webgl2", {
            premultipliedAlpha: false,
            preserveDrawingBuffer: true,
            antialias: false,
          });
          ((this.gl = t),
            t.disable(t.CULL_FACE),
            t.disable(t.BLEND),
            t.getExtension("EXT_color_buffer_float"),
            t.getExtension("EXT_float_blend"),
            t.getExtension("OES_texture_float_linear"),
            this.initBuffers());
        }
        clear(e, t, s, i) {
          (this.gl.clearColor(e, t, s, i), this.gl.clear(this.gl.COLOR_BUFFER_BIT));
        }
        compileShader(e, t) {
          const s = new Shader(this.gl, e, t);
          return (this.setQuadBuffers(s), s);
        }
        setShader(e) {
          if (null !== this.currentShader) {
            if (this.currentShader.id === e.id) return;
            this.currentShader.disable();
          }
          (e.enable(), (this.currentShader = e));
        }
        drawQuad() {
          this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
        }
        setBlendMode(e) {
          return "add" === e
            ? (this.gl.enable(this.gl.BLEND),
              this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE),
              void this.gl.blendEquation(this.gl.FUNC_ADD))
            : "multiply" === e
              ? (this.gl.enable(this.gl.BLEND),
                this.gl.blendFunc(this.gl.DST_COLOR, this.gl.ONE_MINUS_SRC_ALPHA),
                void this.gl.blendEquation(this.gl.FUNC_ADD))
              : "alpha" === e
                ? (this.gl.enable(this.gl.BLEND),
                  this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA),
                  void this.gl.blendEquation(this.gl.FUNC_ADD))
                : "premultiplied" === e
                  ? (this.gl.enable(this.gl.BLEND),
                    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA),
                    void this.gl.blendEquation(this.gl.FUNC_ADD))
                  : void this.gl.disable(this.gl.BLEND);
        }
        setTexture(e) {
          (this.gl.activeTexture(this.gl.TEXTURE0),
            this.gl.bindTexture(this.gl.TEXTURE_2D, e.texture));
        }
        setRenderTarget(e) {
          if (null === e)
            return (
              this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null),
              void this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
            );
          const t = e.framebuffer;
          if (null === t)
            return (
              this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null),
              void this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
            );
          (this.gl.viewport(0, 0, e.width, e.height),
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, t));
        }
        dispose() {
          (this.gl.deleteBuffer(this.positionBuffer), this.gl.deleteBuffer(this.indexBuffer));
        }
        initBuffers() {
          ((this.positionBuffer = this.gl.createBuffer()),
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer),
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(o), this.gl.STATIC_DRAW),
            (this.indexBuffer = this.gl.createBuffer()),
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer),
            this.gl.bufferData(
              this.gl.ELEMENT_ARRAY_BUFFER,
              new Uint16Array(a),
              this.gl.STATIC_DRAW,
            ));
        }
        setQuadBuffers(e) {
          (this.gl.useProgram(e.getProgram()),
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer),
            this.gl.enableVertexAttribArray(e.getAttribute("a_position")),
            this.gl.vertexAttribPointer(
              e.getAttribute("a_position"),
              2,
              this.gl.FLOAT,
              false,
              0,
              0,
            ));
        }
      };
    },
    I18nText(exports) {
      const LangSettings = require("LangSettings").LangSettings;
      exports.I18nText = class {
        en;
        ru;
        ua;
        by;
        fr;
        constructor(e, t, s, i, o) {
          ((this.en = e), (this.ru = t), (this.ua = s), (this.by = i), (this.fr = o));
        }
        get(...e) {
          switch (LangSettings.getLanguage()) {
            case "en":
            default:
              return "string" == typeof this.en ? this.en : this.en(e);
            case "ru":
              return "string" == typeof this.ru ? this.ru : this.ru(e);
            case "ua":
              return "string" == typeof this.ua ? this.ua : this.ua(e);
            case "by":
              return "string" == typeof this.by ? this.by : this.by(e);
            case "fr":
              return "string" == typeof this.fr ? this.fr : this.fr(e);
          }
        }
      };
    },
    PlayerClipboardController(exports) {
      const ArrowData = require("ArrowData").ArrowData,
        CELL_SIZE = require("ChunkConsts").CELL_SIZE,
        ArrowsDB = require("ArrowsDB").ArrowsDB,
        PLATFORM = require("PLATFORM").PLATFORM,
        PlayerSettings = require("PlayerSettings").PlayerSettings;
      exports.PlayerClipboardController = class {
        game;
        arrowActions;
        getPlayerAccess;
        history;
        hasClipboardData = false;
        currentPasteRotation = 0;
        pasteEvent;
        copyEvent;
        onPaste;
        onPasteError;
        constructor(e, t, s, i) {
          ((this.game = e),
            (this.arrowActions = t),
            (this.getPlayerAccess = s),
            (this.history = i),
            (this.onPaste = () => {
              ((this.game.drawPastedArrows = true), this.arrowActions.setFreeCursor(false));
            }),
            (this.onPasteError = () => {
              ((this.game.drawPastedArrows = false),
                (this.game.isInPasteMode = false),
                this.arrowActions.setFreeCursor(true));
            }),
            (this.pasteEvent = (e) => {
              if (null === e.clipboardData || !this.getPlayerAccess().canPaste) return;
              const t = e.clipboardData.getData("text");
              this.game.selectedMap.pasteFromText(t, this.onPaste, this.onPasteError);
            }),
            (this.copyEvent = (e) => {
              if (null === e.clipboardData || !this.getPlayerAccess().canCopy) return;
              if (0 === this.game.selectedMap.getCount()) return;
              const t = this.game.selectedMap.copyFromGameMap(this.game.gameMap);
              "" !== t &&
                (e.clipboardData.setData("text/plain", t),
                e.preventDefault(),
                this.game.selectedMap.clear(),
                (this.game.screenUpdated = true));
            }));
        }
        getHasClipboardData() {
          return this.hasClipboardData;
        }
        getCurrentPasteRotation() {
          return this.currentPasteRotation;
        }
        resetPasteRotation() {
          this.currentPasteRotation = 0;
        }
        rotatePasteSelection() {
          ((this.currentPasteRotation = (this.currentPasteRotation + 1) % 4),
            this.game.selectedMap.rotateOrFlipArrows(this.currentPasteRotation, false),
            (this.game.screenUpdated = true));
        }
        flipPasteSelection() {
          (this.game.selectedMap.rotateOrFlipArrows(null, true), (this.game.screenUpdated = true));
        }
        async copyArrows() {
          if (!this.getPlayerAccess().canCopy) return;
          if (0 === this.game.selectedMap.getCount()) return;
          const e = this.game.selectedMap.copyFromGameMap(this.game.gameMap);
          (await ArrowsDB.write("clipboard", {
            id: 1,
            data: e,
          }),
            (this.hasClipboardData = true),
            (this.game.screenUpdated = true));
        }
        clearSelected() {
          (this.game.selectedMap.clear(), (this.game.screenUpdated = true));
        }
        async checkClipboardData() {
          if ("mobile" === PLATFORM)
            this.hasClipboardData = !(!navigator.clipboard || !navigator.clipboard.readText);
          else {
            const e = await ArrowsDB.read("clipboard", 1);
            this.hasClipboardData =
              null != e && "data" in e && "string" == typeof e.data && e.data.length > 0;
          }
        }
        async pasteArrows() {
          if (!this.getPlayerAccess().canPaste) return;
          let e;
          this.game.selectedMap.rotateOrFlipArrows(0, false);
          const t = await ArrowsDB.read("clipboard", 1);
          if (null != t && "data" in t) {
            const s = t.data;
            "string" == typeof s && (e = s);
          }
          e &&
            "string" == typeof e &&
            this.game.selectedMap.pasteFromText(e, this.onPaste, this.onPasteError);
        }
        async cutArrows() {
          this.getPlayerAccess().canCopy &&
            this.getPlayerAccess().canDelete &&
            (await this.copyArrows(), this.arrowActions.deleteSelectedArrows());
        }
        commitPastedArrows() {
          if (!this.getPlayerAccess().canSetArrows) return;
          const e = this.game.width / 2 / window.devicePixelRatio,
            t = this.game.height / 2 / window.devicePixelRatio,
            s = (e * window.devicePixelRatio) / this.game.scale - this.game.offset[0] / CELL_SIZE,
            a = (t * window.devicePixelRatio) / this.game.scale - this.game.offset[1] / CELL_SIZE,
            n = Math.round(s) - (s < 0 ? 1 : 0),
            l = Math.round(a) - (a < 0 ? 1 : 0),
            h = this.game.getCurrentPivotPoint(),
            c = this.game.selectedMap.getCopiedArrows();
          let d = Number.MAX_SAFE_INTEGER,
            u = Number.MAX_SAFE_INTEGER,
            g = Number.MIN_SAFE_INTEGER,
            m = Number.MIN_SAFE_INTEGER;
          c.forEach((e, t) => {
            const [s, i] = t.split(",").map((e) => parseInt(e, 10));
            ((d = Math.min(d, s)),
              (u = Math.min(u, i)),
              (g = Math.max(g, s)),
              (m = Math.max(m, i)));
          });
          const p = this.game.selectedMap.getRotationState();
          let w = h[0],
            v = h[1];
          p % 2 == 1 && ([w, v] = [h[1], h[0]]);
          const A = Math.floor((d + g) * w),
            f = Math.floor((u + m) * v);
          (c.forEach((e, t) => {
            if (PlayerSettings.levelArrows.includes(e.type)) return;
            const [s, o] = t.split(",").map((e) => parseInt(e, 10)),
              a = n + s - A,
              h = l + o - f,
              c = ArrowData.fromArrow(this.game.gameMap.getArrow(a, h)),
              d = ArrowData.fromState(e.type, e.rotation, e.flipped);
            (null !== this.history && this.history.addChange(a, h, c, d),
              this.game.gameMap.setArrowType(a, h, e.type),
              this.game.gameMap.setArrowRotation(a, h, e.rotation),
              this.game.gameMap.setArrowFlipped(a, h, e.flipped));
          }),
            (this.game.screenUpdated = true));
        }
      };
    },
    OverlayText(exports) {
      const CELL_SIZE = require("ChunkConsts").CELL_SIZE;
      exports.OverlayText = class {
        text;
        x;
        y;
        width;
        height;
        color;
        textSize;
        textColor;
        element = null;
        constructor(e, t, s, i, o, a) {
          ((this.text = e),
            (this.x = t),
            (this.y = s),
            (this.width = i),
            (this.height = o),
            (this.textSize = a),
            (this.color = "#fec"),
            (this.textColor = "#000"));
        }
        add(e) {
          null === this.element &&
            ((this.element = document.createElement("div")),
            (this.element.innerText = this.text),
            e.appendChild(this.element),
            (this.element.style.position = "absolute"),
            (this.element.style.backgroundColor = this.color),
            (this.element.style.color = this.textColor),
            (this.element.style.fontFamily = "Trebuchet MS"),
            (this.element.style.overflow = "hidden"),
            (this.element.style.userSelect = "none"),
            this.update([0, 0], 80));
        }
        update(e, t, s = window.devicePixelRatio) {
          if (null === this.element) return;
          const o = t / (s > 0 ? s : window.devicePixelRatio),
            a = 0.05 * o,
            n = (e[0] / CELL_SIZE + this.x) * o + a,
            r = (e[1] / CELL_SIZE + this.y) * o + a,
            l = this.width * o - a,
            h = this.height * o - a,
            c = this.textSize * o;
          ((this.element.style.left = `${n}px`),
            (this.element.style.top = `${r}px`),
            (this.element.style.width = `${l}px`),
            (this.element.style.height = `${h}px`),
            (this.element.style.fontSize = `${c}px`));
        }
        remove() {
          null !== this.element && (this.element.remove(), (this.element = null));
        }
      };
    },
    SelectedMap(exports) {
      const load = require("load").load,
        save = require("save").save,
        Utils = require("Utils").Utils,
        Arrow = require("Arrow").Arrow,
        CHUNK_SIZE = require("ChunkConsts").CHUNK_SIZE,
        GameMap = require("GameMap").GameMap;
      exports.SelectedMap = class {
        selectedArrows;
        arrowsToPutOriginal;
        arrowsToPut;
        currentSelectedArrows;
        currentSelectionFirstPoint;
        currentSelectionSecondPoint;
        rotationState;
        flipState;
        tempMap;
        constructor() {
          ((this.selectedArrows = new Set()),
            (this.arrowsToPutOriginal = new Map()),
            (this.arrowsToPut = new Map()),
            (this.currentSelectedArrows = new Set()),
            (this.currentSelectionFirstPoint = undefined),
            (this.currentSelectionSecondPoint = undefined),
            (this.rotationState = 0),
            (this.flipState = false),
            (this.tempMap = new GameMap()));
        }
        select(e, t) {
          this.currentSelectedArrows.add(`${e},${t}`);
        }
        deselect(e, t) {
          this.selectedArrows.delete(`${e},${t}`);
        }
        clearCurrentSelection() {
          this.currentSelectedArrows.clear();
        }
        clear() {
          this.selectedArrows.clear();
        }
        getSelectedArrows() {
          return [...this.selectedArrows, ...this.currentSelectedArrows];
        }
        getCount() {
          return this.selectedArrows.size;
        }
        updateSelectionFromCurrentSelection() {
          ((this.selectedArrows = new Set([...this.selectedArrows, ...this.currentSelectedArrows])),
            this.currentSelectedArrows.clear(),
            (this.currentSelectionFirstPoint = undefined),
            (this.currentSelectionSecondPoint = undefined));
        }
        updateCurrentSelectedArea(e, t) {
          undefined !== this.currentSelectionFirstPoint
            ? (this.currentSelectionSecondPoint = [e, t])
            : (this.currentSelectionFirstPoint = [e, t]);
        }
        updateMouseSelection(e, t, s, i) {
          if (
            ("new" === i && this.clear(),
            this.updateCurrentSelectedArea(t, s),
            undefined === this.currentSelectionFirstPoint ||
              undefined === this.currentSelectionSecondPoint)
          )
            return;
          const o = this.currentSelectionFirstPoint[0],
            a = this.currentSelectionFirstPoint[1],
            n = this.currentSelectionSecondPoint[0],
            r = this.currentSelectionSecondPoint[1],
            l = Math.floor(o),
            h = Math.floor(a),
            c = Math.floor(n),
            d = Math.floor(r);
          if ((this.clearCurrentSelection(), Math.abs(o - n) > 0.25 || Math.abs(a - r) > 0.25)) {
            const t = Math.min(l, c),
              s = Math.min(h, d),
              o = Math.max(l, c),
              a = Math.max(h, d);
            for (let n = t; n <= o; n++)
              for (let t = s; t <= a; t++)
                0 !== e.getArrowType(n, t) &&
                  ("remove" === i ? this.deselect(n, t) : this.select(n, t));
          }
        }
        getCurrentSelectedArea() {
          if (
            undefined !== this.currentSelectionFirstPoint &&
            undefined !== this.currentSelectionSecondPoint
          )
            return [
              this.currentSelectionFirstPoint[0],
              this.currentSelectionFirstPoint[1],
              this.currentSelectionSecondPoint[0],
              this.currentSelectionSecondPoint[1],
            ];
        }
        setArrow(e) {
          const t = new Arrow();
          ((t.type = e),
            (t.rotation = 0),
            (t.flipped = false),
            this.arrowsToPutOriginal.clear(),
            this.arrowsToPutOriginal.set("0,0", t),
            this.rotateOrFlipArrows(this.rotationState, this.flipState));
        }
        copyFromGameMap(e) {
          ((this.rotationState = 0),
            (this.flipState = false),
            this.arrowsToPutOriginal.clear(),
            this.arrowsToPut.clear());
          let t = Number.MAX_SAFE_INTEGER,
            s = Number.MAX_SAFE_INTEGER;
          (this.tempMap.clear(),
            this.selectedArrows.forEach((i) => {
              const [o, a] = i.split(",").map((e) => parseInt(e, 10)),
                n = e.getArrow(o, a);
              undefined !== n && n.canBeEdited && ((t = Math.min(t, o)), (s = Math.min(s, a)));
            }),
            this.selectedArrows.forEach((i) => {
              const [o, a] = i.split(",").map((e) => parseInt(e, 10)),
                n = o - t,
                r = a - s,
                l = e.getArrow(o, a);
              undefined !== l &&
                l.canBeEdited &&
                (this.tempMap.setArrowType(n, r, l.type),
                this.tempMap.setArrowRotation(n, r, l.rotation),
                this.tempMap.setArrowFlipped(n, r, l.flipped));
            }));
          const i = (0, save)(this.tempMap);
          return Utils.arrayBufferToBase64(i);
        }
        pasteFromText(e, t, s) {
          this.tempMap.clear();
          try {
            const s = window
              .atob(e)
              .split("")
              .map((e) => e.charCodeAt(0));
            if (((0, load)(this.tempMap, s), 0 === this.tempMap.chunks.size))
              throw new Error("No chunks found");
            t();
          } catch (e) {
            s();
          }
          (this.arrowsToPutOriginal.clear(),
            this.arrowsToPut.clear(),
            this.tempMap.chunks.forEach((e) => {
              for (let t = 0; t < CHUNK_SIZE; t++)
                for (let s = 0; s < CHUNK_SIZE; s++) {
                  const i = e.getArrow(t, s);
                  if (0 !== i.type && i.canBeEdited) {
                    const o = e.x * CHUNK_SIZE + t,
                      a = e.y * CHUNK_SIZE + s;
                    (this.arrowsToPutOriginal.set(`${o},${a}`, i),
                      this.arrowsToPut.set(`${o},${a}`, i));
                  }
                }
            }));
        }
        getCopiedArrows() {
          return this.arrowsToPut;
        }
        rotateOrFlipArrows(e, t) {
          (this.arrowsToPut.clear(),
            null !== e && (this.rotationState = e),
            t && (this.flipState = !this.flipState),
            this.arrowsToPutOriginal.forEach((e, t) => {
              let [s, i] = t.split(",").map((e) => parseInt(e, 10));
              const o = new Arrow();
              ((o.type = e.type), (o.rotation = e.rotation), (o.flipped = e.flipped));
              let a = e.rotation;
              (this.flipState &&
                ((o.flipped = !o.flipped),
                (1 !== o.rotation && 3 !== o.rotation) || (a = (e.rotation + 2) % 4),
                (s = -s)),
                (o.rotation = a));
              let r = s,
                l = i;
              (1 === this.rotationState
                ? ((r = -i), (l = s), (o.rotation = (a + 1) % 4))
                : 2 === this.rotationState
                  ? ((r = -s), (l = -i), (o.rotation = (a + 2) % 4))
                  : 3 === this.rotationState && ((r = i), (l = -s), (o.rotation = (a + 3) % 4)),
                this.arrowsToPut.set(`${r},${l}`, o));
            }));
        }
        getRotationState() {
          return this.rotationState;
        }
        dispose() {
          (this.selectedArrows.clear(),
            this.arrowsToPutOriginal.clear(),
            this.arrowsToPut.clear(),
            this.currentSelectedArrows.clear());
        }
      };
    },
    LevelOverlayInfo(exports) {
      exports.LevelOverlayInfo = class {
        x;
        y;
        width;
        height;
        outputs;
        constructor(e, t, s, i, o) {
          ((this.x = e), (this.y = t), (this.width = s), (this.height = i), (this.outputs = o));
        }
      };
    },
    UIOkCancel(exports) {
      const GameText = require("GameText").GameText,
        UIPanel = require("UIPanel").UIPanel;
      class a extends UIPanel {
        constructor(e, t, s, o) {
          super(e);
          const a = document.createElement("div");
          ((a.className = "ui-ok-cancel-panel"),
            this.element.appendChild(a),
            (this.element.onpointerdown = (e) => e.stopPropagation()));
          const n = document.createElement("div");
          ((n.innerText = t), (n.className = "ui-ok-cancel-message"), a.appendChild(n));
          const r = document.createElement("div");
          ((r.className = "ui-ok-cancel-bottom"), a.appendChild(r));
          const l = document.createElement("div");
          ((l.className = "ui-button"),
            (l.innerText = s),
            r.appendChild(l),
            l.addEventListener("click", () => {
              (this.remove(), o());
            }));
          const h = document.createElement("div");
          ((h.className = "ui-button"),
            (h.innerText = GameText.CANCEL.get()),
            r.appendChild(h),
            h.addEventListener("click", () => this.element.remove()));
        }
      }
      exports.UIOkCancel = a;
    },
    PlayerArrowActions(exports) {
      const ArrowData = require("ArrowData").ArrowData,
        PlayerSettings = require("PlayerSettings").PlayerSettings;
      exports.PlayerArrowActions = class {
        flipDirection;
        lastSetArrowPos;
        lastSetLine;
        pathStartPos;
        pathDirection;
        tool1RotationActive;
        tool1RotationArrowPos;
        activeArrowType;
        freeCursor;
        history;
        game;
        playerUI;
        getPlayerAccess;
        constructor(e, t, s, i) {
          ((this.game = e),
            (this.playerUI = t),
            (this.history = s),
            (this.getPlayerAccess = i),
            (this.flipDirection = true),
            (this.lastSetArrowPos = null),
            (this.lastSetLine = null),
            (this.pathStartPos = null),
            (this.pathDirection = 0),
            (this.tool1RotationActive = false),
            (this.tool1RotationArrowPos = null),
            (this.activeArrowType = -1),
            (this.freeCursor = true));
        }
        getActiveArrowType() {
          return this.activeArrowType;
        }
        setActiveArrowType(e) {
          this.activeArrowType = e;
        }
        isFreeCursor() {
          return this.freeCursor;
        }
        setFreeCursor(e) {
          this.freeCursor = e;
        }
        getLastSetArrowPos() {
          return this.lastSetArrowPos;
        }
        resetDragState() {
          ((this.lastSetArrowPos = null),
            (this.pathStartPos = null),
            (this.lastSetLine = null),
            (this.tool1RotationActive = false),
            (this.tool1RotationArrowPos = null));
        }
        takeArrow(e) {
          ((this.activeArrowType = e),
            this.playerUI.toolbarController.activateItem(e),
            (this.freeCursor = false),
            this.game.selectedMap.setArrow(e),
            (this.game.drawPastedArrows = true));
        }
        takeCursor() {
          ((this.activeArrowType = -1),
            this.playerUI.toolbarController.activateItem(-1),
            (this.freeCursor = true),
            (this.game.drawPastedArrows = false),
            (this.game.isInPasteMode = false),
            (this.game.screenUpdated = true));
        }
        selectArrows(e, t, s, i) {
          if (!this.getPlayerAccess().canSelect) return;
          let o = "new";
          (s ? (o = "add") : i && (o = "remove"),
            this.game.selectedMap.updateMouseSelection(this.game.gameMap, e, t, o),
            (this.game.isSelecting = true),
            (this.game.screenUpdated = true));
        }
        setArrows(e, t) {
          if (!this.getPlayerAccess().canSetArrows) return;
          if (null !== this.pathStartPos) {
            const s = Math.floor(this.pathStartPos[0]),
              i = Math.floor(this.pathStartPos[1]);
            if (e !== s || t !== i) return;
          }
          const s = this.game.getCurrentPivotPoint(),
            a = this.game.selectedMap.getCopiedArrows();
          let n = Number.MAX_SAFE_INTEGER,
            r = Number.MAX_SAFE_INTEGER,
            l = Number.MIN_SAFE_INTEGER,
            h = Number.MIN_SAFE_INTEGER;
          a.forEach((e, t) => {
            const [s, i] = t.split(",").map((e) => parseInt(e, 10));
            ((n = Math.min(n, s)),
              (r = Math.min(r, i)),
              (l = Math.max(l, s)),
              (h = Math.max(h, i)));
          });
          const c = this.game.selectedMap.getRotationState();
          let d = s[0],
            u = s[1];
          c % 2 == 1 && ([d, u] = [s[1], s[0]]);
          const g = Math.floor((n + l) * d),
            m = Math.floor((r + h) * u);
          a.forEach((s, a) => {
            if (PlayerSettings.levelArrows.includes(s.type)) return;
            const [n, r] = a.split(",").map((e) => parseInt(e, 10)),
              l = e + n - g,
              h = t + r - m,
              c = ArrowData.fromArrow(this.game.gameMap.getArrow(l, h)),
              d = ArrowData.fromState(s.type, s.rotation, s.flipped);
            (null !== this.history && this.history.addChange(l, h, c, d),
              this.game.gameMap.setArrowType(l, h, s.type),
              this.game.gameMap.setArrowRotation(l, h, s.rotation),
              this.game.gameMap.setArrowFlipped(l, h, s.flipped));
          });
        }
        setPath(e, t) {
          let s = Math.floor(e),
            i = Math.floor(t);
          if (
            (null === this.pathStartPos && (this.pathStartPos = [e, t]), null !== this.lastSetLine)
          ) {
            10 === this.activeArrowType &&
              (Math.abs(s - this.lastSetLine[0]) % 2 == 1 && s--,
              Math.abs(i - this.lastSetLine[1]) % 2 == 1 && i--);
            let o = s - this.lastSetLine[0],
              a = i - this.lastSetLine[1];
            const n = Math.floor(this.pathStartPos[0]),
              r = Math.floor(this.pathStartPos[1]);
            let l = false;
            (s === n && i === r
              ? ((o = (e % 1) - 0.5),
                (a = (t % 1) - 0.5),
                (l =
                  Math.abs(e - this.pathStartPos[0]) > 0.25 ||
                  Math.abs(t - this.pathStartPos[1]) > 0.25))
              : null !== this.lastSetArrowPos &&
                ((o = s - n),
                (a = i - r),
                (l = s !== this.lastSetArrowPos[0] || i !== this.lastSetArrowPos[1])),
              l &&
                (11 !== this.activeArrowType
                  ? Math.abs(o) > Math.abs(a)
                    ? (this.pathDirection = o < 0 ? 3 : 1)
                    : (this.pathDirection = a < 0 ? 0 : 2)
                  : o > 0 && a < 0
                    ? (this.pathDirection = 0)
                    : o > 0 && a > 0
                      ? (this.pathDirection = 1)
                      : o < 0 && a > 0
                        ? (this.pathDirection = 2)
                        : o < 0 && a < 0 && (this.pathDirection = 3)),
              null !== this.lastSetArrowPos &&
                this.rotateArrow(
                  this.lastSetArrowPos[0],
                  this.lastSetArrowPos[1],
                  this.pathDirection,
                ));
            let h = this.lastSetLine[0],
              c = this.lastSetLine[1];
            (this.setLine(this.activeArrowType, h, c, s, i),
              "x" == (Math.abs(s - h) > Math.abs(i - c) ? "x" : "y") ? (h = s) : (c = i),
              this.setLine(this.activeArrowType, h, c, s, i));
          }
          (null === this.lastSetLine ||
            10 !== this.activeArrowType ||
            (s % 2 == this.lastSetLine[0] % 2 && i % 2 == this.lastSetLine[1] % 2)) &&
            ((null !== this.lastSetLine &&
              11 === this.activeArrowType &&
              (s + i) % 2 != (this.lastSetLine[0] + this.lastSetLine[1]) % 2) ||
              (this.lastSetLine = [s, i]));
        }
        deleteArrow(e, t) {
          if (!this.getPlayerAccess().canDelete) return;
          const s = ArrowData.fromArrow(this.game.gameMap.getArrow(e, t)),
            o = ArrowData.fromState(0, 0, false);
          (null !== this.history && this.history.addChange(e, t, s, o),
            this.game.gameMap.removeArrow(e, t),
            this.game.selectedMap.deselect(e, t),
            (this.game.screenUpdated = true));
        }
        deleteSelectedArrows() {
          this.getPlayerAccess().canDelete &&
            (this.game.selectedMap.getSelectedArrows().forEach((e) => {
              const [t, s] = e.split(",").map((e) => parseInt(e, 10)),
                o = ArrowData.fromArrow(this.game.gameMap.getArrow(t, s)),
                a = ArrowData.fromState(0, 0, false);
              (null !== this.history && this.history.addChange(t, s, o, a),
                this.game.gameMap.removeArrow(t, s));
            }),
            this.game.selectedMap.clear(),
            (this.game.screenUpdated = true));
        }
        rotateArrow(e, t, s) {
          if (!this.freeCursor || !this.getPlayerAccess().canRotate) return;
          const o = ArrowData.fromArrow(this.game.gameMap.getArrow(e, t));
          (this.game.gameMap.setArrowRotation(e, t, s), (this.game.screenUpdated = true));
          const a = ArrowData.fromArrow(this.game.gameMap.getArrow(e, t));
          null !== this.history && this.history.addChange(e, t, o, a);
        }
        rotateArrowByTool(e, t, s) {
          if (!this.getPlayerAccess().canRotate) return;
          const o = this.game.gameMap.getArrow(e, t);
          if (undefined === o || 0 === o.type) return;
          const a = ArrowData.fromArrow(o),
            n = (o.rotation + s) % 4;
          (this.game.gameMap.setArrowRotation(e, t, n), (this.game.screenUpdated = true));
          const r = ArrowData.fromArrow(this.game.gameMap.getArrow(e, t));
          null !== this.history && this.history.addChange(e, t, a, r);
        }
        flipArrow(e, t) {
          if (!this.freeCursor || !this.getPlayerAccess().canFlip) return;
          const s = ArrowData.fromArrow(this.game.gameMap.getArrow(e, t));
          (this.game.gameMap.setArrowFlipped(e, t, this.flipDirection),
            (this.game.screenUpdated = true));
          const o = ArrowData.fromArrow(this.game.gameMap.getArrow(e, t));
          null !== this.history && this.history.addChange(e, t, s, o);
        }
        flipArrowByTool(e, t) {
          if (!this.getPlayerAccess().canFlip) return;
          const s = this.game.gameMap.getArrow(e, t);
          if (undefined === s || 0 === s.type) return;
          const o = ArrowData.fromArrow(s);
          (this.game.gameMap.setArrowFlipped(e, t, !s.flipped), (this.game.screenUpdated = true));
          const a = ArrowData.fromArrow(this.game.gameMap.getArrow(e, t));
          null !== this.history && this.history.addChange(e, t, o, a);
        }
        switchPivot() {
          (this.game.switchPivotPoint(),
            (this.game.screenUpdated = true),
            localStorage.setItem("pivotPoint", this.game.getCurrentPivotIndex().toString()));
        }
        updateFlipDirection(e) {
          ((this.flipDirection = !e.flipped), (this.game.screenUpdated = true));
        }
        handleRotationTool(e, t, s, o) {
          if (1 === this.activeArrowType)
            if (this.tool1RotationActive) {
              if (null !== this.tool1RotationArrowPos) {
                const e = s - (this.tool1RotationArrowPos[0] + 0.5),
                  t = o - (this.tool1RotationArrowPos[1] + 0.5);
                if (Math.sqrt(e * e + t * t) > 0.3) {
                  const s = this.game.gameMap.getArrow(
                    this.tool1RotationArrowPos[0],
                    this.tool1RotationArrowPos[1],
                  );
                  if (undefined !== s) {
                    let o = 0;
                    const a = (180 * Math.atan2(t, e)) / Math.PI;
                    if (
                      ((o =
                        11 === s.type
                          ? a >= 0 && a < 90
                            ? 1
                            : a >= 90 && a <= 180
                              ? 2
                              : a >= -90 && a < 0
                                ? 0
                                : 3
                          : a >= -45 && a < 45
                            ? 1
                            : a >= 45 && a < 135
                              ? 2
                              : a >= -135 && a < -45
                                ? 0
                                : 3),
                      s.rotation !== o)
                    ) {
                      const e = ArrowData.fromArrow(s);
                      (this.game.gameMap.setArrowRotation(
                        this.tool1RotationArrowPos[0],
                        this.tool1RotationArrowPos[1],
                        o,
                      ),
                        (this.game.screenUpdated = true));
                      const t = this.tool1RotationArrowPos[0],
                        a = this.tool1RotationArrowPos[1],
                        n = ArrowData.fromArrow(this.game.gameMap.getArrow(t, a));
                      null !== this.history && this.history.addChange(t, a, e, n);
                    }
                  }
                }
              }
            } else {
              const s = this.game.gameMap.getArrow(e, t);
              undefined !== s &&
                0 !== s.type &&
                ((this.tool1RotationActive = true), (this.tool1RotationArrowPos = [e, t]));
            }
        }
        handleDeleteTool(e, t) {
          null === this.lastSetArrowPos
            ? (this.lastSetArrowPos = [e, t])
            : (e === this.lastSetArrowPos[0] && t === this.lastSetArrowPos[1]) ||
              (this.deleteArrow(this.lastSetArrowPos[0], this.lastSetArrowPos[1]),
              this.deleteArrow(e, t),
              (this.lastSetArrowPos = [e, t]));
        }
        setLine(e, t, s, o, a, n = true) {
          if (-1 === e || 0 === e) return;
          if (!this.getPlayerAccess().canSetArrows) return;
          const r = Math.abs(o - t) > Math.abs(a - s) ? "x" : "y",
            l = Math.max(Math.abs(o - t), Math.abs(a - s));
          11 !== e &&
            ("y" === r && s > a
              ? (this.pathDirection = 0)
              : "x" === r && t < o
                ? (this.pathDirection = 1)
                : "y" === r && s < a
                  ? (this.pathDirection = 2)
                  : "x" === r && t > o && (this.pathDirection = 3));
          let h = t,
            c = s;
          for (let t = 0; t <= l; t++) {
            if (
              null !== this.lastSetArrowPos &&
              10 === this.activeArrowType &&
              (h % 2 != this.lastSetArrowPos[0] % 2 || c % 2 != this.lastSetArrowPos[1] % 2)
            )
              continue;
            if (
              null !== this.lastSetArrowPos &&
              11 === this.activeArrowType &&
              (h + c) % 2 != (this.lastSetArrowPos[0] + this.lastSetArrowPos[1]) % 2
            )
              continue;
            const t = ArrowData.fromArrow(this.game.gameMap.getArrow(h, c));
            (this.game.gameMap.setArrowType(h, c, e, n),
              (this.lastSetArrowPos = [h, c]),
              this.game.gameMap.setArrowRotation(h, c, this.pathDirection, n),
              this.game.selectedMap.rotateOrFlipArrows(this.pathDirection, false));
            const s = ArrowData.fromArrow(this.game.gameMap.getArrow(h, c));
            (null !== this.history && this.history.addChange(h, c, t, s),
              0 === this.pathDirection
                ? c--
                : 1 === this.pathDirection
                  ? h++
                  : 2 === this.pathDirection
                    ? c++
                    : 3 === this.pathDirection && h--);
          }
        }
      };
    },
    Chunk(exports) {
      const Arrow = require("Arrow").Arrow,
        _ChunkConsts = require("ChunkConsts");
      exports.Chunk = class {
        x;
        y;
        adjacentChunks;
        levelArrows;
        updateState = 2;
        lastUpdateState = 2;
        renderDirty = true;
        arrows;
        constructor(e, t) {
          ((this.x = e),
            (this.y = t),
            (this.adjacentChunks = new Array(8)),
            (this.arrows = new Array(_ChunkConsts.CHUNK_AREA)));
          for (let e = 0; e < _ChunkConsts.CHUNK_SIZE; e++)
            for (let t = 0; t < _ChunkConsts.CHUNK_SIZE; t++)
              this.arrows[e + t * _ChunkConsts.CHUNK_SIZE] = new Arrow();
          this.levelArrows = new Map();
        }
        getArrow(e, t) {
          return this.arrows[e + t * _ChunkConsts.CHUNK_SIZE];
        }
        getArrowByIndex(e) {
          return this.arrows[e];
        }
        removeArrow(e, t) {
          ((this.arrows[e + t * _ChunkConsts.CHUNK_SIZE].type = 0),
            (this.arrows[e + t * _ChunkConsts.CHUNK_SIZE].rotation = 0),
            (this.arrows[e + t * _ChunkConsts.CHUNK_SIZE].flipped = false),
            (this.arrows[e + t * _ChunkConsts.CHUNK_SIZE].signal = 0));
        }
        getLevelArrow(e, t) {
          return this.levelArrows.get(e + t * _ChunkConsts.CHUNK_SIZE);
        }
        isEmpty() {
          for (let e = 0; e < _ChunkConsts.CHUNK_SIZE; e++)
            for (let t = 0; t < _ChunkConsts.CHUNK_SIZE; t++)
              if (0 !== this.arrows[e + t * _ChunkConsts.CHUNK_SIZE].type) return false;
          return true;
        }
        getArrowTypes() {
          const e = new Set();
          for (let t = 0; t < _ChunkConsts.CHUNK_SIZE; t++)
            for (let s = 0; s < _ChunkConsts.CHUNK_SIZE; s++) {
              const i = this.getArrow(t, s).type;
              0 !== i && e.add(i);
            }
          return Array.from(e);
        }
        setUpdated() {
          ((this.updateState = 2), (this.lastUpdateState = 2));
        }
        markRenderDirty() {
          this.renderDirty = true;
        }
        clear() {
          for (let e = 0; e < _ChunkConsts.CHUNK_SIZE; e++)
            for (let t = 0; t < _ChunkConsts.CHUNK_SIZE; t++)
              this.arrows[e + t * _ChunkConsts.CHUNK_SIZE].type = 0;
          (this.levelArrows.clear(), (this.renderDirty = true));
        }
      };
    },
    UIPanel(exports) {
      const UIComponent = require("UIComponent").UIComponent;
      class o extends UIComponent {
        constructor(e) {
          (super(e),
            (this.element.onpointerdown = () => {
              this.remove();
            }));
        }
        getClass() {
          return "ui-panel";
        }
      }
      exports.UIPanel = o;
    },
    Game(exports) {
      const ChunkUpdates = require("ChunkUpdates").ChunkUpdates,
        _ChunkConsts = require("ChunkConsts"),
        GameMap = require("GameMap").GameMap,
        SelectedMap = require("SelectedMap").SelectedMap,
        GameRender = require("GameRender").GameRender,
        PLATFORM = require("PLATFORM").PLATFORM,
        PlayerSettings = require("PlayerSettings").PlayerSettings,
        c = [
          [0.5, 0.5],
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ],
        d = 1 / 8,
        u = [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ];
      exports.Game = class {
        width;
        height;
        frame;
        tick;
        playing;
        updateSpeedLevel;
        isSelecting;
        mousePosition;
        drawPastedArrows;
        isInPasteMode;
        scale;
        offset;
        screenUpdated;
        onFPSUpdate = () => {};
        gameMap;
        selectedMap;
        currentPivotIndex = 0;
        render = null;
        updateTime = 0;
        drawTime = 0;
        updatesPerSecond = 0;
        drawsPerSecond = 0;
        fps = 60;
        tps = 3;
        focusingTime = 1;
        focusingSpeed = 0.017;
        focusingOffset = [0, 0];
        focusingScale = 80;
        startingOffset = [0, 0];
        startingScale = 80;
        focusing = false;
        constructor(e) {
          ((this.width = e.width),
            (this.height = e.height),
            (this.frame = 0),
            (this.tick = 0),
            (this.playing = true),
            (this.updateSpeedLevel = 0),
            (this.isSelecting = false),
            (this.mousePosition = [0, 0]),
            (this.gameMap = new GameMap()),
            (this.selectedMap = new SelectedMap()),
            (this.scale = 40 * window.devicePixelRatio),
            (this.offset = [0, 0]),
            (this.screenUpdated = true),
            (this.drawPastedArrows = false),
            (this.isInPasteMode = false),
            (this.render = new GameRender(e)),
            this.render.init());
        }
        draw() {
          if (null === this.render || !this.render.isReady()) return;
          const e = this.render;
          (this.updateFocus(),
            this.screenUpdated && this.render.clearRenderTextures(),
            (this.drawPastedArrows || 0 !== this.selectedMap.getSelectedArrows().length) &&
              (this.screenUpdated = true),
            PlayerSettings.framesToUpdate[this.updateSpeedLevel] > 1 &&
              (this.screenUpdated = true));
          const t = this.scale;
          (this.render.startArrowsRendering(),
            this.render.setChunkArrowSize(t),
            this.render.setChunkArrowAlpha(1),
            this.render.setChunkArrowOffset(
              this.offset[0] / _ChunkConsts.CELL_SIZE,
              this.offset[1] / _ChunkConsts.CELL_SIZE,
            ));
          const s = Math.floor(-this.offset[0] / _ChunkConsts.CELL_SIZE / 16) - 1,
            i = Math.floor(-this.offset[1] / _ChunkConsts.CELL_SIZE / 16) - 1,
            a = Math.floor(
              -this.offset[0] / _ChunkConsts.CELL_SIZE / 16 + this.width / this.scale / 16,
            ),
            n = Math.floor(
              -this.offset[1] / _ChunkConsts.CELL_SIZE / 16 + this.height / this.scale / 16,
            );
          if (
            (this.gameMap.chunks.forEach((t, o) => {
              if (!(t.x >= s && t.x <= a && t.y >= i && t.y <= n)) return;
              const r = t.renderDirty || !e.hasChunkMesh(o);
              if (r) {
                const s = this.buildChunkMesh(t);
                (e.updateChunkMesh(o, s.vertices, s.indices), (t.renderDirty = false));
              }
              (this.screenUpdated || r) && e.drawChunkMesh(o);
            }),
            performance.now() - this.drawTime > 1e3 &&
              ((this.drawTime = performance.now()),
              (this.fps = this.drawsPerSecond),
              (this.drawsPerSecond = 0)),
            this.drawsPerSecond++,
            this.render.endArrowsRendering(),
            e.removeMissingChunkMeshes(this.gameMap.chunks),
            this.screenUpdated &&
              this.render.drawBackground(this.scale, [
                -this.offset[0] / _ChunkConsts.CELL_SIZE,
                -this.offset[1] / _ChunkConsts.CELL_SIZE,
              ]),
            e.clear(),
            e.drawArrowsRenderTexture(),
            e.drawGridRenderTexture(),
            e.setSolidColor(0.25, 0.5, 1, 0.25),
            this.selectedMap.getSelectedArrows().forEach((t) => {
              const s = t.split(",").map((e) => parseInt(e, 10)),
                i = s[0] * this.scale + (this.offset[0] * this.scale) / _ChunkConsts.CELL_SIZE,
                a = s[1] * this.scale + (this.offset[1] * this.scale) / _ChunkConsts.CELL_SIZE,
                n = this.scale + 0.05 * this.scale;
              e.drawSolidColorRect(i, a, n, n);
            }),
            this.render.startTransparentArrowsRendering(),
            this.render.setArrowSize(t),
            this.drawSelectedArrows(),
            this.isSelecting)
          ) {
            const t = this.selectedMap.getCurrentSelectedArea();
            if (undefined !== t) {
              const s = t[0] * this.scale + (this.offset[0] * this.scale) / _ChunkConsts.CELL_SIZE,
                i = t[1] * this.scale + (this.offset[1] * this.scale) / _ChunkConsts.CELL_SIZE,
                a = t[2] - t[0],
                n = t[3] - t[1];
              (e.setSolidColor(0.5, 0.5, 0.75, 0.25),
                e.drawSolidColorRect(s, i, a * this.scale, n * this.scale));
            }
          }
          ((this.screenUpdated = false), this.frame++);
        }
        updateFrame(e = () => {}) {
          if (this.playing && this.frame % PlayerSettings.framesToSkip[this.updateSpeedLevel] === 0)
            for (let t = 0; t < PlayerSettings.framesToUpdate[this.updateSpeedLevel]; t++)
              (this.updateTick(e), this.updatesPerSecond++);
          performance.now() - this.updateTime > 1e3 &&
            ((this.updateTime = performance.now()),
            (this.tps = this.updatesPerSecond),
            (this.updatesPerSecond = 0),
            this.onFPSUpdate());
        }
        updateTick(e = () => {}) {
          (e(), ChunkUpdates.update(this.gameMap), this.tick++);
        }
        undoChanges(e) {
          e.changedArrows.forEach(([e, t], s) => {
            const [i, o] = s.split(",").map((e) => parseInt(e, 10));
            0 === e.type
              ? (this.gameMap.removeArrow(i, o, true), this.selectedMap.deselect(i, o))
              : (this.gameMap.removeArrow(i, o, true),
                this.gameMap.setArrowType(i, o, e.type, true),
                this.gameMap.setArrowRotation(i, o, e.rotation, true),
                this.gameMap.setArrowFlipped(i, o, e.flipped, true));
          });
        }
        redoChanges(e) {
          e.changedArrows.forEach(([e, t], s) => {
            const [i, o] = s.split(",").map((e) => parseInt(e, 10));
            0 === t.type
              ? (this.gameMap.removeArrow(i, o, true), this.selectedMap.deselect(i, o))
              : (this.gameMap.removeArrow(i, o, true),
                this.gameMap.setArrowType(i, o, t.type, true),
                this.gameMap.setArrowRotation(i, o, t.rotation, true),
                this.gameMap.setArrowFlipped(i, o, t.flipped, true));
          });
        }
        clearSignals() {
          ChunkUpdates.clearSignals(this.gameMap);
        }
        getCurrentPivotPoint() {
          return c[this.currentPivotIndex];
        }
        switchPivotPoint() {
          ((this.currentPivotIndex = (this.currentPivotIndex + 1) % c.length),
            this.selectedMap.rotateOrFlipArrows(null, false));
        }
        getCurrentPivotIndex() {
          return this.currentPivotIndex;
        }
        setCurrentPivotIndex(e) {
          ((e < 0 || e >= c.length) && (e = 0), (this.currentPivotIndex = e));
        }
        focusOnBox(e, t, s, i, a = 0, n = 1) {
          const r = (s += a) - (e -= a),
            l = (i += a) - (t -= a),
            h = Math.min(this.width / r, this.height / l),
            c = ((e + s) * _ChunkConsts.CELL_SIZE) / 2,
            d = ((t + i) * _ChunkConsts.CELL_SIZE) / 2;
          if (
            ((this.focusingScale = h),
            (this.focusingOffset[0] = ((this.width / h) * _ChunkConsts.CELL_SIZE) / 2 - c),
            (this.focusingOffset[1] = ((this.height / h) * _ChunkConsts.CELL_SIZE) / 2 - d),
            (this.startingOffset[0] = this.offset[0]),
            (this.startingOffset[1] = this.offset[1]),
            (this.startingScale = this.scale),
            n >= 1)
          )
            return (
              (this.offset[0] = this.focusingOffset[0]),
              (this.offset[1] = this.focusingOffset[1]),
              (this.scale = this.focusingScale),
              void (this.focusingTime = 1)
            );
          ((this.focusingTime = 0), (this.focusing = true), (this.focusingSpeed = n));
        }
        updateFocus() {
          if (!this.focusing) return;
          this.focusingTime >= 1 && ((this.focusingTime = 1), (this.focusing = false));
          const e = 0.5 * -Math.cos(this.focusingTime * Math.PI) + 0.5;
          ((this.scale = 1 / ((1 / this.focusingScale) * e + (1 / this.startingScale) * (1 - e))),
            (this.offset[0] = this.focusingOffset[0] * e + this.startingOffset[0] * (1 - e)),
            (this.offset[1] = this.focusingOffset[1] * e + this.startingOffset[1] * (1 - e)),
            (this.focusingTime += this.focusingSpeed),
            (this.focusingTime = Math.min(this.focusingTime, 1)),
            (this.screenUpdated = true));
        }
        setScale(e, t) {
          const s =
              (t[0] * _ChunkConsts.CELL_SIZE * window.devicePixelRatio) / this.scale -
              this.offset[0],
            i =
              (t[1] * _ChunkConsts.CELL_SIZE * window.devicePixelRatio) / this.scale -
              this.offset[1];
          ((this.offset[0] = (t[0] * _ChunkConsts.CELL_SIZE * window.devicePixelRatio) / e - s),
            (this.offset[1] = (t[1] * _ChunkConsts.CELL_SIZE * window.devicePixelRatio) / e - i),
            (this.scale = e),
            (this.screenUpdated = true));
        }
        resize(e, t) {
          null !== this.render &&
            ((this.width = e),
            (this.height = t),
            this.render.resize(e, t),
            (this.screenUpdated = true));
        }
        getFPS() {
          return this.fps;
        }
        getTPS() {
          return this.tps;
        }
        dispose() {
          (this.gameMap.clear(), this.selectedMap.dispose(), this.render?.dispose());
        }
        buildChunkMesh(e) {
          const t = [],
            s = [];
          let i = 0;
          const a = e.x * _ChunkConsts.CHUNK_SIZE,
            n = e.y * _ChunkConsts.CHUNK_SIZE;
          for (let r = 0; r < _ChunkConsts.CHUNK_SIZE; r++)
            for (let l = 0; l < _ChunkConsts.CHUNK_SIZE; l++) {
              const o = e.getArrow(r, l);
              if (o.type <= 0) continue;
              let h = o.type;
              (h < 0 || h >= 27) && (h = 26);
              const c = h - 1,
                g = (c % 8) * d,
                m = Math.floor(c / 8) * d,
                p = 3 & o.rotation,
                w = Math.min(Math.max(o.signal, 0), 6),
                v = a + r + 0.025,
                A = n + l + 0.025;
              for (let e = 0; e < u.length; e++) {
                const s = u[e];
                let i = s[0],
                  a = s[1];
                switch ((o.flipped && (i = 1 - i), p)) {
                  case 1: {
                    const e = i;
                    ((i = 1 - a), (a = e));
                    break;
                  }
                  case 2:
                    ((i = 1 - i), (a = 1 - a));
                    break;
                  case 3: {
                    const e = 1 - i;
                    ((i = a), (a = e));
                    break;
                  }
                }
                const n = v + i,
                  r = A + a,
                  l = g + s[0] * d,
                  h = m + s[1] * d;
                t.push(n, r, l, h, w);
              }
              (s.push(i, i + 1, i + 2, i, i + 2, i + 3), (i += 4));
            }
          return {
            vertices: new Float32Array(t),
            indices: new Uint16Array(s),
          };
        }
        drawSelectedArrows() {
          if (null === this.render) return;
          if (!this.drawPastedArrows || ("mobile" === PLATFORM && !this.isInPasteMode)) return;
          const e = this.render,
            t = this.getCurrentPivotPoint(),
            s = 0.5 + (0.5 * (20 - Math.max(4, Math.min(20, this.scale)))) / 16;
          this.render.setArrowAlpha(s);
          const i = this.selectedMap.getCopiedArrows();
          0 !== i.size && (this.screenUpdated = true);
          let a = Number.MAX_SAFE_INTEGER,
            n = Number.MAX_SAFE_INTEGER,
            r = Number.MIN_SAFE_INTEGER,
            h = Number.MIN_SAFE_INTEGER;
          i.forEach((e, t) => {
            const [s, i] = t.split(",").map((e) => parseInt(e, 10));
            ((a = Math.min(a, s)),
              (n = Math.min(n, i)),
              (r = Math.max(r, s)),
              (h = Math.max(h, i)));
          });
          const c = this.selectedMap.getRotationState();
          let d = t[0],
            u = t[1];
          c % 2 == 1 && ([d, u] = [t[1], t[0]]);
          const g = Math.floor((a + r) * d),
            m = Math.floor((n + h) * u);
          let p, w;
          if (this.isInPasteMode) {
            const e = this.width / 2 / window.devicePixelRatio,
              t = this.height / 2 / window.devicePixelRatio;
            ((p =
              (e * window.devicePixelRatio) / this.scale - this.offset[0] / _ChunkConsts.CELL_SIZE),
              (w =
                (t * window.devicePixelRatio) / this.scale -
                this.offset[1] / _ChunkConsts.CELL_SIZE),
              (p = Math.round(p - (p < 0 ? 1 : 0))),
              (w = Math.round(w - (w < 0 ? 1 : 0))));
          } else ((p = this.mousePosition[0]), (w = this.mousePosition[1]));
          i.forEach((t, s) => {
            const [i, a] = s.split(",").map((e) => parseInt(e, 10)),
              n =
                (i - g + p) * this.scale +
                (this.offset[0] * this.scale) / _ChunkConsts.CELL_SIZE +
                0.025 * this.scale,
              r =
                (a - m + w) * this.scale +
                (this.offset[1] * this.scale) / _ChunkConsts.CELL_SIZE +
                0.025 * this.scale;
            e.drawArrow(n, r, t.type, t.signal, t.rotation % 4, t.flipped);
          });
        }
      };
    },
  },
  t = {};
function require(name) {
  var loadded = t[name];
  if (undefined !== loadded) return loadded.exports;
  var module = (t[name] = {
    exports: {},
  });
  e[name](module.exports);
  return module.exports;
}
(() => {
  const ChunkUpdates = require("ChunkUpdates").ChunkUpdates,
    ArrowDescriptions = require("ArrowDescriptions").ArrowDescriptions,
    GameText = require("GameText").GameText,
    LangSettings = require("LangSettings").LangSettings,
    LangUtils = require("LangUtils").LangUtils,
    Navigation = require("Navigation").Navigation,
    AuthState = require("AuthState").AuthState,
    PlayerSettings = require("PlayerSettings").PlayerSettings,
    ArrowsDB = require("ArrowsDB").ArrowsDB,
    Backend = require("Backend").Backend,
    getGameFiles = require("getGameFiles").getGameFiles,
    load = require("load").load,
    PLATFORM = require("PLATFORM").PLATFORM,
    Routes = require("Routes").Routes,
    save = require("save").save,
    Utils = require("Utils").Utils;
  (!(function () {
    const e = `${window.gameVersion}-${window.bundleShellVersion}`;
    if (!("serviceWorker" in navigator)) return;
    if (localStorage.getItem("swVersion") === e) return;
    const t = ["/", ...(0, getGameFiles)()],
      s = `sw.js?v=${e}`;
    (navigator.serviceWorker
      .register(s, {
        scope: "/",
      })
      .then((s) => {
        s.addEventListener("updatefound", () => {
          const e = s.installing;
          e &&
            e.addEventListener("statechange", () => {
              "installed" === e.state &&
                navigator.serviceWorker.controller &&
                (e.postMessage({
                  type: "SKIP_WAITING",
                }),
                window.location.reload());
            });
        });
        const i = {
            type: "CACHE_URLS",
            payload: t,
            version: e,
          },
          o = (e) => {
            "activated" === e.state
              ? e.postMessage(i)
              : e.addEventListener("statechange", () => {
                  "activated" === e.state && e.postMessage(i);
                });
          };
        (s.installing ? o(s.installing) : s.waiting ? o(s.waiting) : s.active && o(s.active),
          localStorage.setItem("swVersion", e));
      })
      .catch((e) => {
        console.error("Service Worker registration failed:", e);
      }),
      navigator.serviceWorker.addEventListener("message", (e) => {
        "RELOAD" === e.data.type && window.location.reload();
      }));
  })(),
    AuthState.init());
  const v = new Navigation(),
    A = new Image();
  ((PlayerSettings.arrowAtlasImage = A),
    (A.src = `res/sprites/atlas.png?v=${window.gameVersion}`),
    A.addEventListener("load", () =>
      (async () => {
        ((() => {
          for (let e = 0; e < navigator.languages.length; e++) {
            let t = navigator.languages[e];
            const s = t.indexOf("-");
            -1 !== s && (t = t.substring(0, s));
            const i = LangUtils.getLanguageFromString(t);
            if (LangSettings.languages.includes(i)) {
              LangSettings.setLanguage(i);
              break;
            }
          }
        })(),
          document.body.classList.add(`platform-${PLATFORM}`),
          (await (async function () {
            if (AuthState.isGuest()) return false;
            let e = true;
            try {
              e = await Routes.checkConnection();
            } catch {
              return false;
            }
            return e;
          })()) || Backend.loginAsGuest(),
          v.start());
      })(),
    ),
    (window.game = {
      navigation: v,
      PlayerSettings: PlayerSettings,
      LangSettings: LangSettings,
      LangUtils: LangUtils,
      ChunkUpdates: ChunkUpdates,
      ArrowsDB: ArrowsDB,
      Routes: Routes,
      ArrowDescriptions: ArrowDescriptions,
      GameText: GameText,
      Utils: Utils,
      save: save,
      load: load,
    }));
})();
