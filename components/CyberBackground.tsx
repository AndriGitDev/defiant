"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function CyberBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0e27, 0.015);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 5000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 200;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.15,
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create grid
    const gridHelper = new THREE.GridHelper(200, 50, 0x00f0ff, 0xff006e);
    gridHelper.position.y = -30;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Create floating cubes
    const cubes: THREE.Mesh[] = [];
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

    for (let i = 0; i < 50; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0x00f0ff : 0xff006e,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });

      const cube = new THREE.Mesh(cubeGeometry, material);
      cube.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );
      cube.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      cubes.push(cube);
      scene.add(cube);
    }

    // Animation
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate particles
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0005;

      // Rotate cubes
      cubes.forEach((cube, i) => {
        cube.rotation.x += 0.001 * (i % 3);
        cube.rotation.y += 0.001 * (i % 2);
      });

      // Camera movement based on mouse
      camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0"
      style={{ background: "linear-gradient(to bottom, #0a0e27, #1a1f3a)" }}
    />
  );
}
