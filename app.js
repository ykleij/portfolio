import { MSDFTextGeometry, MSDFTextMaterial, uniforms } from "three-msdf-text-utils";
import { FontLoader } from './FontLoader.js';

import * as THREE from 'three';

global.THREE = THREE;

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import fragment from './shaders/fragment.glsl'
import vertex from './shaders/vertex.glsl'
import gradient from './assets/gradient.png'

// import gsap from "gsap";

// var createGeometry = require('three-bmfont-text');
// var MSDFShader = require('./msdf.js');


import font from './assets/manifold.json';
import fontTexture from './assets/manifold.png';

export default class Sketch {
    constructor() {

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById("container").appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
        this.camera.position.z = 1;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.scene = new THREE.Scene();


        this.time = 0;
        this.mouse = { x: 0, y: 0 }


        this.addText();
        this.mouseEvents();
        this.render();
        this.onResize();

        const geometry = new THREE.PlaneGeometry(1, 1);
        this.planeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
        this.plane = new THREE.Mesh(geometry, this.planeMaterial);
        this.plane.position.z = -1;
        this.plane.scale.set(10, 10, 10)
        this.scene.add(this.plane);
            
        // this.mouseClick();
        this.mouseScroll();
    }

    mouseEvents() {
        window.addEventListener('mousemove', (e) => {
            this.mouse = {
                x: (e.clientX / window.innerWidth) ,
                y: (e.clientY / window.innerHeight)
            }

            if (this.material)this.material.uniforms.uMouse.value = new THREE.Vector2(this.mouse.x, this.mouse.y)

            let eMouseX =  (e.clientX / window.innerWidth) * 2 - 1;
            let eMouseY =  -(e.clientY / window.innerHeight) * 2 + 1;

            if (this.mesh) {
                this.mesh.rotation.x = eMouseY * .15;
                this.mesh.rotation.y = eMouseX * .05;
                this.mesh.position.x = eMouseX * .05;
                this.mesh.position.y = eMouseY * .01;
            }
        });
    }

    mouseClick() {
        this.planeColors = [];
        this.planeColors.push( "#FFFFFF", "#fff23f", "#000000")

        this.index = 0;

        window.addEventListener('click', (e) => {
            e.preventDefault();
            
            this.index++;
            if (this.index >= this.planeColors.length) {
                this.index = 0;
            }
            this.planeMaterial.color.set(this.planeColors[this.index]);
            
            
            this.s = 0.0045;
            // this.mesh.scale.set(this.s, -this.s, this.s)
            this.material.uniforms.uColor.value = new THREE.Vector3(0.1,0.1,0.1);


        })
    }

    mouseScroll() {
        window.addEventListener('scroll', () => {
            console.log("sscorollign")
        })
    }

    addText() {
        Promise.all([
            loadFontAtlas(fontTexture),
            // loadFont(font)
        ]).then(([atlas]) => {
            const geometry = new MSDFTextGeometry({
                DoubleSide: THREE.DoubleSide,
                flipY: true,
                text: "Hi,\n Yosef here.".toUpperCase(),
                font: font,
                align: 'center',
            });

            this.material = new THREE.ShaderMaterial({
                side: THREE.DoubleSide,
                transparent: true,
                defines: {
                    IS_SMALL: false,
                },
                extensions: {
                    derivatives: true,
                },
                uniforms: {
                    time: { type: 'f', value: 0 },
                    viewport: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                    uMouse: { type: 'v2', value: new THREE.Vector2(0, 0) },
                    uColor: { type: 'v4', value: new THREE.Vector3(0.1,0.1,0.1)},
                    // Common
                    ...uniforms.common,

                    // Rendering
                    ...uniforms.rendering,

                    // Strokes
                    ...uniforms.strokes,
                    gradientMap: { type: 't', value: new THREE.TextureLoader().load(gradient) },
                },
                vertexShader: vertex,
                fragmentShader: fragment,
            });
            this.material.uniforms.uMap.value = atlas;

            this.mesh = new THREE.Mesh(geometry, this.material);

            this.s = 0.005;
            this.mesh.scale.set(this.s, -this.s, this.s)

            geometry.computeBoundingBox();
            const centerOffset = -0.46 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
            geometry.translate(centerOffset, 40, 0);
            // const layout = geometry.layout;
            // this.mesh.position.set(-0.005 * layout.width / 2, -0.005 * layout.height / 2, 0)

            this.scene.add(this.mesh)

        });


        function loadFontAtlas(path) {
            const promise = new Promise((resolve, reject) => {
                const loader = new THREE.TextureLoader();
                loader.load(path, resolve);
            });

            return promise;
        }

        function loadFont(path) {
            const promise = new Promise((resolve, reject) => {
                const loader = new FontLoader();
                loader.load(path, resolve);
            });
        
            return promise;
        }
    }

    addMesh() {
        this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
        this.material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
        this.material = new THREE.ShaderMaterial({
            fragmentShader: fragment,
            vertexShader: vertex,
            uniforms: {
                progress: { type: "f", value: 0 }
            },
            side: THREE.DoubleSide
        })

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
    }

    render() {
        this.time += 0.05;

        if (this.material) this.material.uniforms.time.value = this.time;
        // this.mesh.rotation.x += 0.01;
        // this.mesh.rotation.y += 0.01;

        this.renderer.render(this.scene, this.camera)

        window.requestAnimationFrame(this.render.bind(this));
    }

    onResize() {
        window.addEventListener("resize", () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        })
    }
}

new Sketch();

