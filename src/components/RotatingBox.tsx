import { useRef, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  EffectComposer,
  SelectiveBloom,
  Selection,
  Select,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Text3D } from "@react-three/drei";
type Props = {
  onDone?: () => void;
};
function RotatingBox({ onDone }: Props) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const velocity = useRef(0);
  const hasDone = useRef<boolean>(false);
  const energy = useRef(0);
  const { gl } = useThree();

  // クリックでフルスクリーン切替
  const toggleFullscreen = useCallback(async () => {
    const stage = gl.domElement.parentElement;

    const canvas = gl.domElement;
    const anyCanvas = canvas as any;
    const anyDoc = document as any;

    if (!document.fullscreenElement) {
      await (stage?.requestFullscreen?.() ||
        anyCanvas.webkitRequestFullscreen?.() || // Safari
        anyCanvas.msRequestFullscreen?.()); // 古いEdge
    } else {
      await (document.exitFullscreen?.() ||
        anyDoc.webkitExitFullscreen?.() ||
        anyDoc.msExitFullscreen?.());
    }
  }, [gl]);

  // スクロールごとに回転速度を加える
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      velocity.current += e.deltaY * 0.0005;
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (hasDone.current) return;

    meshRef.current.rotation.y += velocity.current;
    const scaleFactor = 1 - velocity.current * 0.1;
    meshRef.current.scale.multiplyScalar(scaleFactor);

    // 元スケールへクランプ
    const original = 1;
    if (meshRef.current.scale.x > original) {
      meshRef.current.scale.set(original, original, original);
    }

    // 減衰（dt考慮）
    velocity.current *= Math.pow(0.975, delta * 60);

    energy.current += velocity.current * 0.6;
    const base = 0.05;
    const gain = 1.3;
    const intensity = THREE.MathUtils.clamp(
      base + gain * energy.current,
      0,
      10
    );
    matRef.current.emissiveIntensity = intensity;

    const threshold = original * 0.05;
    if (!hasDone.current && meshRef.current.scale.x < threshold) {
      hasDone.current = true; // 自コンポーネント内の更新停止フラグ
      onDone?.(); // 親へ通知 → PlanetsEffect に切替
    }
  });
  return (
    <mesh ref={meshRef} onClick={toggleFullscreen}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#7e3ff2" // 自己発光色（にじみの元）
        emissiveIntensity={0.01} // 強さ
        roughness={0.4}
        metalness={0.1}
        ref={matRef}
        //   wireframe
      />
    </mesh>
  );
}

export default function RotatingBoxApp({ onDone }: Props) {
  return (
    <>
      {" "}
      <Text3D
        font={"./fonts/ZenKurenaido_Regular.json"}
        scale={0.1}
        height={0.03}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.05}
        bevelSize={0.02}
        bevelOffset={0}
        rotation={[0, -Math.PI * 0.3, 0]}
        position={[1, 1.5, 0]}
      >
        {"Cubeを\nクリックして\nフルスクリーン!"}
      </Text3D>
      <Text3D
        font={"./fonts/ZenKurenaido_Regular.json"}
        scale={0.2}
        height={0.03}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.05}
        bevelSize={0.02}
        bevelOffset={0}
        rotation={[0, Math.PI * 0.1, 0]}
        position={[-2, 1.5, 0]}
      >
        {"下方向に\n画面を\nスクロール!"}
      </Text3D>
      <Selection>
        <Select enabled>
          <ambientLight />
          <pointLight position={[5, 5, 5]} />
          <RotatingBox onDone={onDone} />
        </Select>

        <EffectComposer>
          <SelectiveBloom
            selectionLayer={0} // デフォルトの Selection レイヤー
            intensity={1.6} // にじみの強さ
            luminanceThreshold={0.0} // 閾値（0だと広く反応）
            luminanceSmoothing={0.1}
            mipmapBlur
            blendFunction={BlendFunction.ADD}
          />
        </EffectComposer>
      </Selection>
    </>
  );
}
