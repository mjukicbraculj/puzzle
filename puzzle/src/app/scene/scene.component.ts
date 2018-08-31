import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import './js/EnableThreeExamples';
import './js/RotateAndDragControls';
import 'three/examples/js/loaders/GLTFLoader';
import 'three/examples/js/controls/TrackballControls';
import 'three/examples/js/controls/DragControls';
import { SceneConstants } from './scene.constants';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css']
})
export class SceneComponent implements OnInit {

  @ViewChild('canvas')
  private canvasRef: ElementRef;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  private plane: THREE.Mesh;
  private objects = [];
  private controls: THREE.TrackballControls;
  private clock: THREE.Clock;
  private dragControls: THREE.RotateAndDragControls;

  constructor() {
    this.onBoardModelLoadingCompleted = this.onBoardModelLoadingCompleted.bind(this);
    this.onPeaceModelLoadingCompleted = this.onPeaceModelLoadingCompleted.bind(this);

    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);

    this.animate = this.animate.bind(this);
  }

  ngOnInit() {
    this.createScene();
    this.loadOModels(this.getBoardModelDefinition(), this.onBoardModelLoadingCompleted);
    this.loadOModels(this.getPeacesModelDefinition(), this.onPeaceModelLoadingCompleted);
    this.createLight();
    this.animate();
  }

  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    this.camera = new THREE.PerspectiveCamera(SceneConstants.fieldOfView,
      this.getAspectRatio(), SceneConstants.nearClippingPlane, SceneConstants.farClippingPlane);

    this.camera.position.set(SceneConstants.cameraPosition.x,
      SceneConstants.cameraPosition.y, SceneConstants.cameraPosition.z);

    this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500, 8, 8), new THREE.MeshBasicMaterial({color: 0xffffff}));
    this.plane.visible = false;
    this.plane.updateMatrixWorld();
    this.scene.add(this.plane);

    this.controls = new THREE.TrackballControls( this.camera );
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
    this.controls.noZoom = false;
    this.controls.noPan = false;
    this.controls.staticMoving = true;
    this.controls.dynamicDampingFactor = 0.3;

    const container = document.createElement( 'div' );
      document.body.appendChild( container );

    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(this.renderer.domElement);

    this.dragControls = new THREE.RotateAndDragControls( this.objects, this.camera, this.renderer.domElement );
    this.dragControls.addEventListener( 'dragstart', this.onDragStart );
    this.dragControls.addEventListener( 'dragend', this.onDragEnd );

    this.clock = new THREE.Clock();
  }

  onDragStart(event) {
    this.controls.enabled = false;
    console.log(event);
  }

  onDragEnd(event) {
    this.controls.enabled = true;
    const objectPosition = event.object.position;
    event.object.position.set(objectPosition.x, objectPosition.y, -0.2);
  }

  private loadOModels(objects: Array<any>, onLoadedMethod) {
    const loader = new THREE.GLTFLoader();

    objects.forEach(model => {
      loader.load(
        model.modelPath,
        onLoadedMethod,
        function ( xhr ) {
          // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        function ( error ) {
          console.log(error); // TODO show error
        }
      );
    });
  }

  private createLight() {
    let light = new THREE.PointLight(SceneConstants.pointLightColor, SceneConstants.pointLightItensity);
    light.position.set(SceneConstants.pointLightPosition1.x,
      SceneConstants.pointLightPosition1.y, SceneConstants.pointLightPosition1.z);
    this.scene.add(light);

    light = new THREE.PointLight(SceneConstants.pointLightColor, SceneConstants.pointLightItensity);
    light.position.set(SceneConstants.pointLightPosition2.x,
      SceneConstants.pointLightPosition2.y, SceneConstants.pointLightPosition2.z);
    this.scene.add(light);

    light = new THREE.PointLight(SceneConstants.pointLightColor, SceneConstants.pointLightItensity);
    light.position.set(SceneConstants.pointLightPosition3.x,
      SceneConstants.pointLightPosition3.y, SceneConstants.pointLightPosition3.z);
    this.scene.add(light);

    light = new THREE.PointLight(SceneConstants.pointLightColor, SceneConstants.pointLightItensity);
    light.position.set(SceneConstants.pointLightPosition4.x,
      SceneConstants.pointLightPosition4.y, SceneConstants.pointLightPosition4.z);
    this.scene.add(light);
  }

  public animate() {
    const delta = this.clock.getDelta();
    this.controls.update(delta);

    requestAnimationFrame( this.animate );
    this.renderer.render(this.scene, this.camera);
  }

  private onBoardModelLoadingCompleted(gltf) {
    this.scene.add(gltf.scene);
  }

  private onPeaceModelLoadingCompleted(gltf) {
    gltf.scene.position.set(-4, 2, 0.7);
    gltf.scene.children.forEach(child => {
      child.updateMatrixWorld();
      this.objects.push(child);
    });
    this.scene.add(gltf.scene);
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private getAspectRatio(): number {
    const height = this.canvas.clientHeight;
    if (height === 0) {
        return 0;
    }

    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  private onResize(event) {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.updateProjectionMatrix();
  }

  private getPeacesModelDefinition() {
    return [
      {
        name: 'peace_1',
        modelPath: '../../assets/models/peace_1.gltf'
      }
    ];
  }

  private getBoardModelDefinition() {
    return [
      {
        name: 'board',
        modelPath: '../../assets/models/board.gltf'
      }
    ];
  }
}

