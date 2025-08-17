import {
  EffectComposer,
  SelectiveBloom,
  Selection,
  Select,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useRef } from "react";
import * as THREE from "three";
export default function Garaxy() {
  const boxRef = useRef<THREE.Mesh>(null!);

  return (
    <>
      {/* 環境 */}
      <color attach="background" args={["#000"]} />
      <hemisphereLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />

      {/* ========== Bloomさせたい対象だけ <Select> で囲む ========== */}

      <Selection>
        {/* 光る箱（にじませたい） */}
        <Select enabled>
          <mesh ref={boxRef} position={[-1.2, 0.5, 0]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#7e3ff2" // 自己発光色（にじみの元）
              emissiveIntensity={2.2} // 強さ
              roughness={0.4}
              metalness={0.1}
              //   wireframe
            />
            {/* 本当に周囲を照らしたいなら中にライトを仕込む（任意） */}
            {/* <pointLight color="#7e3ff2" intensity={6} distance={8} decay={2} /> */}
            {/* <Edges color="white" threshold={0} /> */}
          </mesh>
        </Select>

        {/* こっちは Bloom させない（普通の球） */}
        <mesh position={[1.6, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color="#888" />
        </mesh>

        {/* ポストプロセス：選択的Bloomのみ */}
        <EffectComposer>
          <SelectiveBloom
            selectionLayer={0} // デフォルトの Selection レイヤー
            intensity={1.6} // にじみの強さ
            luminanceThreshold={0} // 閾値（0だと広く反応）
            luminanceSmoothing={0}
            mipmapBlur
            blendFunction={BlendFunction.ADD}
          />
        </EffectComposer>
      </Selection>
    </>
  );
}
