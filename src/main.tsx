import "./style.css";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import LaptopPortfolio from "./components/LaptopPortfolio.tsx";
import RotatingBoxApp from "./components/RotatingBox.tsx";
import PlanetsEffect from "./components/PlanetsEffect.tsx";
import { useState } from "react";
import ExpandingSphere from "./components/ExpandingSphere.tsx";

const root = ReactDOM.createRoot(document.querySelector("#root")!);
function RootScene() {
  const [done, setDone] = useState(false); // ← ここで hasDone を管理
  const [done2, setDone2] = useState(false); // 別の完了フラグ
  const [done3, setDone3] = useState(false); // さらに別の完了フラグ

  return (
    <>
      {done ? (
        <PlanetsEffect onDone={() => setDone2(true)} />
      ) : (
        <RotatingBoxApp onDone={() => setDone(true)} />
      )}
      {done2 && !done3 && <ExpandingSphere onDone={() => setDone3(true)} />}
      {done3 && <LaptopPortfolio />}
    </>
  );
}
root.render(
  <Canvas
    className="r3f"
    gl={{
      antialias: true,
      toneMapping: THREE.ACESFilmicToneMapping,
      outputColorSpace: THREE.SRGBColorSpace,
    }}
    // shadows
    camera={{
      fov: 45,
      near: 0.1,
      far: 200,
      position: [-1.5, 2, 5.5],
    }}
    frameloop="always"
  >
    <RootScene />
    {/* <PlanetsEffect /> */}
    {/* <Garaxy /> */}
    {/* <LaptopPortfolio /> */}
    {/* <Experience /> */}
    {/* <Perf position="top-left" /> */}
  </Canvas>
);
