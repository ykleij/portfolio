import * as THREE from 'three';


import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// import fragment from "./shader/fragment.glsl";
// import vertex from "./shader/vertex.glsl";

// import gsap from "gsap";
console.log(THREE.WebGLProgram)

import createTextGeometry from 'three-bmfont-text';
import createMSDFShader from 'three-bmfont-text/shaders/msdf.js';

import font from './assets/manifold.json';
import fontTexture from './assets/manifold.png';


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
        this.camera.position.z = 5;

        this.time = 0;
        this.isPlaying = true;

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);

        new THREE.TextureLoader().load(fontTexture, (t) => {
            this.fontTexture = t;
            console.log(this.fontTexture);

            this.addText();

            this.render();

            this.resize();
        })

    }

    addText() {
        this.geometry = createTextGeometry({
            text: "Hi, Yosef here.",
            font: font,
            align: 'center',
            flipY: this.fontTexture.flipY
        })

        this.materialText = new THREE.RawShaderMaterial(createMSDFShader({
            map: this.texture,
            transparent: true,
            color: 0xff0000
        }))

        let layout = this.geometry.layout
        let text = new THREE.Mesh(this.geometry, this.materialText)
        text.scale.set(0.01, 0.01, 0.01);
        // text.position.set(0, -layout.descender + layout.height, 0)
        // text.scale.multiplyScalar(Math.random() * 0.5 + 0.5)
        this.scene.add(text);
    }

    addObjects() {
        let that = this;
        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { value: 0 },
                resolution: { value: new THREE.Vector4() },
            },
            // wirefame: true,
            // transparent: true,
            vertexShader: vertex,
            fragmentShader: fragment
        });

        this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

        this.plane = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.plane);
    }

    render() {
        if (!this.isPlaying) return;
        this.time = 0.05;
        // this.material.uniforms.time.value = this.time;
        // requestAnimationFrame(this.render.bind(this))
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        window.addEventListener("resize", () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        })
    }

}
