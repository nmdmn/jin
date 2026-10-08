import * as Dat from "dat.gui";
import * as Three from "three";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

export class App {
  constructor(canvas, camera, captureRate) {
    window.addEventListener('resize', () => { this.onResize(); }, false);
    window.addEventListener('keydown', event => { this.onKey(event); });

    this.canvas = document.querySelector(canvas);
    this.camera = camera;
    this.scene = new Three.Scene();
    this.renderer = new Three.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance"
    });

    this.composer = new EffectComposer(this.renderer);

    this.onResize();

    this.isComposer = false;
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.outputPass = new OutputPass();

    this.timer = new Three.Timer();
    this.resizeCallbacks = [];
    this.keydownCallbacks = [];
    this.updateCallbacks = [];

    this.captureRate = captureRate;
    this.captureFrame = 0;

  }

  addPasses(pre, post) {
    this.isComposer = true;

    this.renderer.toneMapping = Three.ACESFilmicToneMapping;
    //this.renderer.toneMapping = Three.ReinhardToneMapping;
    this.renderer.outputColorSpace = Three.SRGBColorSpace;
    this.renderer.setClearColor(0x000000);

    this.composer.addPass(this.renderPass);
    pre.map((element) => { this.composer.addPass(element) });
    this.composer.addPass(this.outputPass);
    post.map((element) => { this.composer.addPass(element) });
  }

  addResizeCallback(resizeCallback) { this.resizeCallbacks.push(resizeCallback); }
  addKeydownCallbacks(keydownCallback) { this.keydownCallbacks.push(keydownCallback); }
  addUpdateCallback(updateCallback) { this.updateCallbacks.push(updateCallback); }

  onResize() {
    for (const callback in this.resizeCallbacks) {
      this.resizeCallbacks[callback]();
    }

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  onKey(event) {
    for (const callback in this.keydownCallbacks) {
      this.keydownCallbacks[callback](event);
    }
  }

  tick() {
    this.timer.update();
    let deltaTime = this.timer.getDelta();
    let elapsedTime = this.timer.getElapsed();

    if (this.captureRate != 0) {
      deltaTime = 1. / this.captureRate;
      elapsedTime = this.captureFrame / this.captureRate;
    }

    for (const callback in this.updateCallbacks) {
      this.updateCallbacks[callback](deltaTime, elapsedTime);
    }

    if (this.isComposer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
    if (this.captureRate != 0) {
      var r = new XMLHttpRequest();
      r.open("POST", "http://localhost:2345/" + this.captureFrame, true);
      r.send(this.renderer.domElement.toDataURL());

      this.captureFrame++;
    }
    window.requestAnimationFrame(this.tick.bind(this));
  }

  start() { this.tick(); }
}

export class BufferObject {
  constructor(size, numComponents) {
    this.dataArray = new Float32Array(size * numComponents);
    this.numComponents = numComponents;
    this.currentIt = 0;
  }

  add(data) {
    this.dataArray.set(data, this.currentIt);
    this.currentIt += this.numComponents;
  }
}

export class UI {
  constructor(elements) {
    this.gui = new Dat.GUI();
    this.gui.close();

    const uiSettingsPropNames = Object.getOwnPropertyNames(elements);
    for (let uiItemId in uiSettingsPropNames) {
      const uiItemName = uiSettingsPropNames[uiItemId];
      const uiItem = elements[uiItemName];
      if (uiItem.hasOwnProperty("type") && uiItem.type == "color") {
        this.gui.addColor(uiItem, "value").name(uiItemName)
          ;
      }
      if (uiItem.hasOwnProperty("listen") && uiItem.listen) {
        this.gui.add(uiItem, "value", uiItem.min, uiItem.max, uiItem.step).name(uiItemName).listen();
      } else {
        this.gui.add(uiItem, "value", uiItem.min, uiItem.max, uiItem.step).name(uiItemName)
      }
    }
  }
}
