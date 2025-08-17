import "./style.css";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import Experience from "./components/Experience.tsx";
import ExperienceTextWithGeometory from "./components/ExperienceTextWithGeometory.tsx";
import LaptopPortfolio from "./components/LaptopPortfolio.tsx";

const root = ReactDOM.createRoot(document.querySelector("#root")!);

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
  >
    <LaptopPortfolio />
    {/* <Experience /> */}
  </Canvas>
);
