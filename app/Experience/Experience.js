import * as THREE from 'three';
// global.THREE = THREE;

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


// import fragment from "./shader/fragment.glsl"
// import vertex from "./shader/vertex.glsl"

// import gsap from "gsap";

import createGeometry from 'three-bmfont-text'
import MSDFShader from 'three-bmfont-text/shaders/msdf.js'

import font from '../public/assets/manifold.json';
import fontTexture from '../public/assets/manifold.png';


export default class Experience {
    constructor() {
        if (Experience.instance) {
            return Experience.instance;
        }

        Experience.instance = this;


        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        document.body.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);


        new THREE.TextureLoader().load(fontTexture, (t) => {
            this.fontTexture = t;
            console.log(this.fontTexture);

            this.addText();
        })

        this.camera.position.z = 2;

        this.animate();

        window.addEventListener("resize", () => {
            this.resize();
        })

    }

    addText() {
        this.geometry =createGeometry({
            text: "Hi, Yosef here.",
            font: font,
            align: 'center',
            flipY: this.fontTexture.flipY
        })

        this.materialText = new THREE.RawShaderMaterial(MSDFShader({
            map: texture,
            transparent: true,
            color: 0xff0000
        }))

        let layout = this.geom.layout
        let text = new THREE.Mesh(this.geom, this.materialText)
        text.scale(0.01, 0.01, 0.01);
        // text.position.set(0, -layout.descender + layout.height, 0)
        // text.scale.multiplyScalar(Math.random() * 0.5 + 0.5)
        this.scene.add(text)
    }

    animate() {
        this.renderer.render(this.scene, this.camera);

        window.requestAnimationFrame(() => {
            this.animate();
        });
    }

    resize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

}
