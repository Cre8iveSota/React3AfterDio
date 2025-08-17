import * as THREE from "three";
import { useEffect, useRef } from "react";

export default function Name() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- 基本セットアップ ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      1, // 後で正しいサイズをセット
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 立方体（お試し表示）
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // --- サイズ設定（ウィンドウ/フルスクリーン問わず、ラッパー要素のサイズに合わせる） ---
    const setSize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    // 初期サイズ
    setSize();

    // リサイズ時（ウィンドウ & フルスクリーン切替）
    const handleResize = () => setSize();
    window.addEventListener("resize", handleResize);
    document.addEventListener("fullscreenchange", handleResize);

    // --- フルスクリーントグル（ダブルクリックで切替） ---
    const toggleFullscreen = async () => {
      const el = mountRef.current;
      if (!el) return;
      if (!document.fullscreenElement) {
        await el.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    };
    renderer.domElement.addEventListener("dblclick", toggleFullscreen);

    // --- ループ ---
    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    // --- クリーンアップ ---
    return () => {
      cancelAnimationFrame(rafId);
      renderer.domElement.removeEventListener("dblclick", toggleFullscreen);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("fullscreenchange", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  // ①ページ表示時から常に画面いっぱいで見せたい場合は、
  // このラッパーに100vw/100vhを与える（CSSでもOK）
  return (
    <div
      ref={mountRef}
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        background: "#111",
      }}
    />
  );
}
