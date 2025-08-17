import { useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import {
  OrbitControls,
  Text3D,
  Center,
  useMatcapTexture,
} from "@react-three/drei";
import * as THREE from "three";

export default function ExperienceTextWithGeometory() {
  const { camera, gl } = useThree();

  const cubeRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.y += delta;
    }
  });

  const [matcapTexture] = useMatcapTexture("C7C7D7_4C4E5A_818393_6C6C74", 256);

  return (
    <>
      <OrbitControls makeDefault camera={camera} domElement={gl.domElement} />
      <ambientLight intensity={1.5} />

      <group ref={groupRef}>
        <mesh position-x={-2}>
          <sphereGeometry />
          <meshStandardMaterial color="orange" />
        </mesh>

        <mesh
          ref={cubeRef}
          rotation-y={Math.PI * 0.25}
          position-x={2}
          scale={1.5}
        >
          <boxGeometry />
          <meshStandardMaterial color="mediumpurple" />
        </mesh>
      </group>

      <mesh position-y={-1} rotation-x={-Math.PI * 0.5} scale={10}>
        <planeGeometry />
        <meshStandardMaterial color="greenyellow" />
      </mesh>
      <Center>
        <Text3D
          font={"./fonts/ZenKurenaido_Regular.json"}
          scale={0.7}
          height={0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.05}
          bevelSize={0.02}
          bevelOffset={0}
        >
          こんにちは
          <meshMatcapMaterial matcap={matcapTexture} />
        </Text3D>
      </Center>
      <mesh>
        <torusGeometry args={[1, 0.6, 16, 32]} />
        <meshMatcapMaterial matcap={matcapTexture} />
      </mesh>
    </>
  );
}
