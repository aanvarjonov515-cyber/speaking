import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRM } from '@pixiv/three-vrm';
import { Volume2, Sparkles, User, RefreshCw, Upload } from 'lucide-react';

import { globalTeacherManager } from '../../services/teacher/globalTeacherManager';

interface TeacherAvatar3DProps {
  isSpeaking: boolean;
  currentWord?: string;
  emotion?: 'neutral' | 'happy' | 'encouraging' | 'thinking' | 'surprised';
  teacherState?: 'idle' | 'listening' | 'thinking' | 'speaking';
  teacherName?: string;
  vrmUrl?: string | null;
  onVrmLoaded?: (name: string) => void;
}

export const TeacherAvatar3D: React.FC<TeacherAvatar3DProps> = ({
  isSpeaking,
  emotion = 'neutral',
  teacherState = 'idle',
  teacherName,
  vrmUrl,
  onVrmLoaded,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [modelType, setModelType] = useState<'procedural' | 'vrm'>('procedural');
  const [loadingVRM, setLoadingVRM] = useState(false);
  const [vrmError, setVrmError] = useState<string | null>(null);

  const activeVrmUrl = vrmUrl !== undefined ? vrmUrl : globalTeacherManager.getProfile().vrmModelUrl;
  const activeName = teacherName || globalTeacherManager.getProfile().name || 'Aisha';

  // References for render loop mutable state
  const stateRef = useRef({
    isSpeaking,
    emotion,
    mouse: new THREE.Vector2(0, 0),
    targetHeadRot: new THREE.Euler(0, 0, 0),
    blinkTimer: 0,
    blinkDuration: 0.15,
    isBlinking: false,
    mouthOpen: 0,
    vrmInstance: null as VRM | null,
    // Procedural model parts
    proceduralGroup: null as THREE.Group | null,
    head: null as THREE.Mesh | null,
    jaw: null as THREE.Mesh | null,
    eyes: [] as THREE.Mesh[],
    glasses: null as THREE.Group | null,
    torso: null as THREE.Mesh | null,
  });

  // Keep state updated
  useEffect(() => {
    stateRef.current.isSpeaking = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    stateRef.current.emotion = emotion;
  }, [emotion]);

  useEffect(() => {
    (stateRef.current as any).teacherState = teacherState;
  }, [teacherState]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1120);

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      20
    );
    camera.position.set(0, 1.45, 1.75);
    camera.lookAt(0, 1.35, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.2);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.0);
    keyLight.position.set(1.5, 3, 2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.8);
    fillLight.position.set(-2, 1.5, 1.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 1.4);
    rimLight.position.set(0, 2.5, -2);
    scene.add(rimLight);

    // Soft contact shadow plane
    const shadowGeo = new THREE.PlaneGeometry(2, 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.01;
    scene.add(shadowPlane);

    // 3. Build Stylized Procedural 3D Humanoid Teacher
    const proceduralGroup = new THREE.Group();
    proceduralGroup.position.set(0, 0, 0);
    scene.add(proceduralGroup);
    stateRef.current.proceduralGroup = proceduralGroup;

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xfbd0b8,
      roughness: 0.55,
      metalness: 0.05,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x271e1b,
      roughness: 0.8,
    });
    const suitMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
    });
    const shirtMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.4,
    });
    const tieMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      roughness: 0.35,
    });
    const glassFrameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.8,
    });
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      ior: 1.5,
    });

    // Torso / Shoulders
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.7, 16);
    const torso = new THREE.Mesh(torsoGeo, suitMat);
    torso.position.set(0, 0.85, 0);
    torso.castShadow = true;
    torso.receiveShadow = true;
    proceduralGroup.add(torso);
    stateRef.current.torso = torso;

    // Shirt collar
    const collarGeo = new THREE.ConeGeometry(0.12, 0.18, 4);
    const collar = new THREE.Mesh(collarGeo, shirtMat);
    collar.rotation.x = Math.PI;
    collar.position.set(0, 1.15, 0.15);
    proceduralGroup.add(collar);

    // Elegant tie
    const tieGeo = new THREE.BoxGeometry(0.045, 0.32, 0.02);
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0, 0.98, 0.17);
    tie.rotation.x = 0.05;
    proceduralGroup.add(tie);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.18, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.set(0, 1.25, 0);
    proceduralGroup.add(neck);

    // Head Group (pivoted for natural tilting and nodding)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.38, 0);
    proceduralGroup.add(headGroup);

    // Head Base
    const headGeo = new THREE.SphereGeometry(0.16, 24, 24);
    headGeo.scale(1, 1.18, 1.05);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.castShadow = true;
    headGroup.add(head);
    stateRef.current.head = head;

    // Hair
    const hairGeo = new THREE.SphereGeometry(0.175, 20, 20);
    hairGeo.scale(1.02, 1.15, 1.1);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.04, -0.02);
    headGroup.add(hair);

    // Hair Fringe Front
    const fringeGeo = new THREE.BoxGeometry(0.2, 0.06, 0.08);
    const fringe = new THREE.Mesh(fringeGeo, hairMat);
    fringe.position.set(0, 0.14, 0.12);
    fringe.rotation.x = -0.2;
    headGroup.add(fringe);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.025, 16, 16);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.055, 0.03, 0.14);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.055, 0.03, 0.14);
    headGroup.add(eyeL, eyeR);
    stateRef.current.eyes = [eyeL, eyeR];

    // Eyebrows
    const browGeo = new THREE.BoxGeometry(0.05, 0.012, 0.015);
    const browL = new THREE.Mesh(browGeo, hairMat);
    browL.position.set(-0.055, 0.075, 0.155);
    browL.rotation.z = 0.08;
    const browR = new THREE.Mesh(browGeo, hairMat);
    browR.position.set(0.055, 0.075, 0.155);
    browR.rotation.z = -0.08;
    headGroup.add(browL, browR);

    // Nose
    const noseGeo = new THREE.ConeGeometry(0.02, 0.05, 4);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0.01, 0.17);
    headGroup.add(nose);

    // Articulated Mouth / Jaw for Lip-Sync
    const mouthGeo = new THREE.BoxGeometry(0.055, 0.016, 0.02);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x9f1239, roughness: 0.3 });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, -0.06, 0.155);
    headGroup.add(mouth);
    stateRef.current.jaw = mouth;

    // Stylish Teacher Glasses
    const glassesGroup = new THREE.Group();
    const frameL = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.005, 12, 24), glassFrameMat);
    frameL.position.set(-0.055, 0.03, 0.165);
    const frameR = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.005, 12, 24), glassFrameMat);
    frameR.position.set(0.055, 0.03, 0.165);
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.004, 0.004), glassFrameMat);
    bridge.position.set(0, 0.035, 0.165);
    const lensL = new THREE.Mesh(new THREE.CircleGeometry(0.035, 16), lensMat);
    lensL.position.set(-0.055, 0.03, 0.165);
    const lensR = new THREE.Mesh(new THREE.CircleGeometry(0.035, 16), lensMat);
    lensR.position.set(0.055, 0.03, 0.165);

    glassesGroup.add(frameL, frameR, bridge, lensL, lensR);
    headGroup.add(glassesGroup);
    stateRef.current.glasses = glassesGroup;

    // 4. VRM Model Loading capability
    if (vrmUrl) {
      setLoadingVRM(true);
      setVrmError(null);
      const loader = new GLTFLoader();
      loader.register((parser) => new VRMLoaderPlugin(parser));

      loader.load(
        vrmUrl,
        (gltf) => {
          const vrm = gltf.userData.vrm as VRM;
          if (vrm) {
            proceduralGroup.visible = false;
            scene.add(vrm.scene);
            vrm.scene.position.set(0, 0, 0);
            vrm.scene.rotation.y = Math.PI;
            stateRef.current.vrmInstance = vrm;
            setModelType('vrm');
            setLoadingVRM(false);
            const metaName = (vrm.meta as any)?.name || (vrm.meta as any)?.title || 'Custom VRM Model';
            onVrmLoaded?.(metaName);
          }
        },
        undefined,
        (err) => {
          console.warn('Failed to load VRM file, reverting to procedural avatar:', err);
          setVrmError('Could not load VRM file. Using stylized procedural teacher.');
          proceduralGroup.visible = true;
          setModelType('procedural');
          setLoadingVRM(false);
        }
      );
    }

    // Mouse movement listener for head tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      stateRef.current.mouse.set(x, y);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 5. Animation Loop
    let clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      const { isSpeaking, vrmInstance, head, jaw, eyes, torso, mouse } = stateRef.current;

      // Natural Breathing Animation (chest + subtle head bobbing)
      const breathScale = 1 + Math.sin(elapsed * 2.2) * 0.02;
      if (torso) {
        torso.scale.set(breathScale, 1, breathScale);
      }

      // Smooth Head Tracking toward mouse
      const targetPitch = THREE.MathUtils.clamp(mouse.y * 0.15, -0.2, 0.2);
      const targetYaw = THREE.MathUtils.clamp(-mouse.x * 0.25, -0.35, 0.35);

      if (headGroup) {
        headGroup.rotation.x = THREE.MathUtils.damp(headGroup.rotation.x, targetPitch, 4, delta);
        headGroup.rotation.y = THREE.MathUtils.damp(headGroup.rotation.y, targetYaw, 4, delta);
        headGroup.position.y = 1.38 + Math.sin(elapsed * 2.2) * 0.005;
      }

      // Eye Blinking Logic
      stateRef.current.blinkTimer += delta;
      if (stateRef.current.blinkTimer > 3.2) {
        stateRef.current.isBlinking = true;
        if (stateRef.current.blinkTimer > 3.2 + stateRef.current.blinkDuration) {
          stateRef.current.isBlinking = false;
          stateRef.current.blinkTimer = Math.random() * 0.8; // Randomize next blink
        }
      }

      // Procedural Eyes Blinking
      if (eyes.length === 2) {
        const eyeScaleY = stateRef.current.isBlinking ? 0.08 : 1;
        eyes[0].scale.y = eyeScaleY;
        eyes[1].scale.y = eyeScaleY;
      }

      // Real-Time Lip Sync / Mouth Movement
      if (isSpeaking) {
        // Natural speech cadence with multiple harmonic waves
        const mouthOpen = 0.5 + Math.sin(elapsed * 16) * 0.35 + Math.sin(elapsed * 26) * 0.15;
        stateRef.current.mouthOpen = THREE.MathUtils.clamp(mouthOpen, 0.1, 1.0);
        
        // Add subtle speaking head nodding
        if (headGroup) {
          headGroup.rotation.x += Math.sin(elapsed * 12) * 0.015;
        }
      } else {
        stateRef.current.mouthOpen = THREE.MathUtils.damp(stateRef.current.mouthOpen, 0.05, 8, delta);
      }

      if (jaw) {
        jaw.scale.y = 0.5 + stateRef.current.mouthOpen * 1.5;
        jaw.scale.x = 0.9 + stateRef.current.mouthOpen * 0.2;
      }

      // VRM Animation Updates if active
      if (vrmInstance) {
        vrmInstance.update(delta);

        // VRM Lip-Sync Morph Target
        if (vrmInstance.expressionManager) {
          const openVal = isSpeaking ? stateRef.current.mouthOpen : 0;
          vrmInstance.expressionManager.setValue('aa', openVal);
          vrmInstance.expressionManager.setValue('blink', stateRef.current.isBlinking ? 1 : 0);
          
          if (emotion === 'happy') {
            vrmInstance.expressionManager.setValue('happy', 0.8);
          } else {
            vrmInstance.expressionManager.setValue('happy', 0);
          }
        }

        // VRM Head LookAt
        if (vrmInstance.lookAt) {
          vrmInstance.lookAt.lookAt(new THREE.Vector3(mouse.x * 2, mouse.y * 2 + 1.4, 3));
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [vrmUrl, emotion, onVrmLoaded]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-2xl">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full min-h-[320px] cursor-grab active:cursor-grabbing" />

      {/* Floating Status & Interaction Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs shadow-lg pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-pulse' : teacherState === 'listening' ? 'bg-cyan-400 animate-ping' : 'bg-indigo-400'}`} />
            <span className="font-medium text-slate-200">
              {modelType === 'vrm' ? `${activeName} (VRM)` : `Teacher: ${activeName}`}
            </span>
          </div>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 capitalize">
            {teacherState === 'listening'
              ? 'Listening to you...'
              : teacherState === 'thinking'
              ? 'Thinking...'
              : isSpeaking
              ? 'Speaking...'
              : 'Ready'}
          </span>
        </div>

        {isSpeaking && (
          <div className="flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg text-xs font-mono">
            <Volume2 className="w-3.5 h-3.5 animate-bounce" />
            <span>Lip-Sync</span>
          </div>
        )}
      </div>

      {/* Bottom Model Tag & VRM Quick Upload Prompt */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-400 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-md border border-slate-800 pointer-events-auto">
          <User className="w-3.5 h-3.5 text-indigo-400" />
          <span>{modelType === 'vrm' ? 'Custom VRM Loaded' : 'Stylized Humanoid Avatar'}</span>
        </div>

        {loadingVRM && (
          <div className="flex items-center gap-1.5 bg-slate-900/90 text-indigo-400 px-3 py-1 rounded-md border border-slate-700 text-xs animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Loading VRM...</span>
          </div>
        )}
      </div>

      {vrmError && (
        <div className="absolute bottom-12 inset-x-4 bg-rose-950/90 text-rose-200 text-xs p-2 rounded-lg border border-rose-800 text-center">
          {vrmError}
        </div>
      )}
    </div>
  );
};
