import * as THREE from 'three';

export class SceneConstants {
    public static fieldOfView = 45;
    public static nearClippingPlane = 0.2;
    public static farClippingPlane = 1000;
    public static cameraPosition = new THREE.Vector3(0, 0, 9);

    public static pointLightColor = 0xffffcc;
    public static pointLightPosition1 = new THREE.Vector3(-2, -4, 4);
    public static pointLightPosition2 = new THREE.Vector3(2, -4, 4);
    public static pointLightPosition3 = new THREE.Vector3(2, 4, 4);
    public static pointLightPosition4 = new THREE.Vector3(-2, 4, 4);
    public static pointLightItensity = 1;

    public static spotLightIntensity = 1.5;
    public static spotLightAngle = Math.PI / 8;
    public static spotLightPenumbra = 0.2;
    public static spotLightColor = 0x85a3e0;
}
