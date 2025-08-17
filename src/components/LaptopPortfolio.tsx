import {
  Text3D,
  Html,
  PresentationControls,
  Float,
  Environment,
  useGLTF,
  OrbitControls,
} from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

export default function LaptopPortfolio() {
  const computer = useGLTF(
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/macbook/model.gltf"
  );
  const iphone = useGLTF(
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/iphone-x/model.gltf"
  );
  const computerRef = useRef<THREE.Object3D>(null!);
  const iphoneRef = useRef<THREE.Object3D>(null!);
  const d: any = document;
  if (
    !document.fullscreenElement &&
    !d.webkitFullscreenElement &&
    !d.msFullscreenElement
  )
    console.log("not fullscreen");
  (
    document.exitFullscreen?.() ||
    d.webkitExitFullscreen?.() ||
    d.msExitFullscreen?.()
  )?.catch?.(() => {});

  return (
    <>
      <OrbitControls />
      {/* <Environment background preset="warehouse" /> */}
      <Environment
        background
        files={["./environmentMaps/blue_lagoon_night_1k.hdr"]}
      />
      <color args={["#000000"]} attach="background" />
      <Text3D
        font={"./fonts/ZenKurenaido_Regular.json"}
        scale={0.1}
        height={0.03}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.05}
        bevelSize={0.02}
        bevelOffset={0}
        rotation={[Math.PI / 4, 0, 0]}
        position={[-4.5, 2.8, -2]}
      >
        {"↓PCとスマホに表示されているのは、留学前に奨学生として入学するために急造したwebページです\n" +
          "                                             " +
          "今度は3D化して本ポートフォリオとして表示してみました"}
      </Text3D>
      <PresentationControls
        // global
        rotation={[0.13, 0.1, 0]}
        polar={[-0.4, 0.2]}
        azimuth={[-Math.PI / 4, Math.PI / 3]}
        damping={0.1}
        snap
      >
        <Float rotationIntensity={0.4}>
          <rectAreaLight
            width={2.5}
            height={1.65}
            intensity={65}
            color={"#faf9f8ff"}
            rotation={[-0.1, Math.PI, 0]}
            position={[0, 0.55, -1.15]}
          />
          <primitive
            object={computer.scene}
            position-y={-1}
            scale={1}
            ref={computerRef}
          >
            <Html
              transform
              wrapperClass="htmlScreenPC"
              distanceFactor={1.17}
              position={[0, 1.56, -1.4]}
              rotation-x={-0.256}
              occlude={[computerRef]}
            >
              <iframe src="https://for-submit.vercel.app/" />
            </Html>
          </primitive>
        </Float>

        <Float rotationIntensity={0.4}>
          <rectAreaLight
            width={2.5}
            height={1.65}
            intensity={65}
            color={"#ddd5d0ff"}
            rotation={[-0.1, Math.PI, 0]}
            position={[0, 0.55, -1.15]}
          />
          <primitive
            object={iphone.scene}
            position={[-3, 0.5, -2]}
            position-y={-1}
            rotation={[-0.32, 0.02, 0]}
            scale={1}
            ref={iphoneRef}
          >
            <Html
              transform
              wrapperClass="htmlScreenSP"
              distanceFactor={1.17}
              position={[0.2, 1.35, 0.1]}
              rotation-x={0}
              occlude={[iphoneRef]}
            >
              <iframe src="https://for-submit.vercel.app/" />
            </Html>
          </primitive>
          <Text3D
            font={"./fonts/ZenKurenaido_Regular.json"}
            scale={0.8}
            height={0.03}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.05}
            bevelSize={0.02}
            bevelOffset={0}
            rotation={[0, -Math.PI * 0.3, 0]}
            position={[3, 1, -2]}
          >
            {"Sota\nHiguchi"}
          </Text3D>
        </Float>
      </PresentationControls>
      <Text3D
        font={"./fonts/ZenKurenaido_Regular.json"}
        scale={0.2}
        height={0.03}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.05}
        bevelSize={0.02}
        bevelOffset={0}
        rotation={[-Math.PI / 4, 0, 0]}
        position={[-2.5, -1.2, 1]}
      >
        {"                         " +
          "樋口創太の\n" +
          "           " +
          "ポートフォリオ(作成途中)へ\n" +
          "                           " +
          "ようこそ"}
      </Text3D>
      {/* <ContactShadows position-y={-1.4} opacity={0.4} scale={5} blur={2.4} /> */}
    </>
  );
}
