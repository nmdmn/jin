import * as Dat from "dat.gui";
import * as Three from "three";
import { Vector3 } from "three";
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { FXAAPass } from 'three/examples/jsm/postprocessing/FXAAPass.js';

import { App, UI } from "../app.js";
import { Box } from "./box";
import { Grid } from "./grid.js";

const ui = {
  alpha: {
    value: 1.,
    min: .0,
    max: 1.,
    step: .01,
  },
  exposure: {
    value: .9,
    min: .1,
    max: 2.,
    step: .01,
  },
  threshold: {
    value: 1.,
    min: .0,
    max: 1.,
    step: .01,
  },
  strength: {
    value: .5,
    min: .0,
    max: 3.,
    step: .1,
  },
  radius: {
    value: 1.,
    min: .0,
    max: 1.,
    step: .01,
  },
};

export default class Dots {
  constructor(canvas) {
    const gui = new UI(ui);

    const camera = new Three.PerspectiveCamera(33, window.innerWidth / window.innerHeight, .1, 1000.);
    camera.lookAt(new Vector3(0, 0, 0));
    camera.position.copy(new Vector3(0, 0, 111));


    const app = new App(canvas, camera, 0);

    const bloomPass = new UnrealBloomPass(new Three.Vector2(window.innerWidth, window.innerHeight), 1.5, .4, .85);
    const ssaoPass = new SSAOPass(app.scene, camera, window.innerWidth, window.innerHeight);
    const fxaaPass = new FXAAPass();
    app.addPasses([bloomPass], [ssaoPass, fxaaPass]);

    const box = new Box(app, ui);
    const grid = new Grid(app, ui);
    grid.mesh.position.copy(new Vector3(0, 0, -10));

    app.addKeydownCallbacks((event) => {
      switch (event.key) {
        case "Escape":
          Dat.GUI.toggleHide();
          break;
      }
    });

    app.addUpdateCallback(() => {
      app.renderer.toneMappingExposure = Math.pow(ui.exposure.value, 4);
      bloomPass.threshold = ui.threshold.value;
      bloomPass.strength = ui.strength.value;
      bloomPass.radius = ui.radius.value;
    });

    app.start();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new Dots("canvas");
});
