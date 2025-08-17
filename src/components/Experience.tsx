import { useThree, useFrame } from "@react-three/fiber";
import {
  BakeShadows,
  Environment,
  OrbitControls,
  Sky,
  useHelper,
} from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Perf } from "r3f-perf";
import { DirectionalLight, Mesh } from "three";
import * as THREE from "three";
import { useControls } from "leva";

export default function Experience() {
  const directionalLight = useRef<DirectionalLight>(null);
  useHelper(
    directionalLight as React.RefObject<THREE.Object3D>,
    THREE.DirectionalLightHelper,
    1,
    "red"
  );
  const cube = useRef<Mesh>(null);
  const { envMapintensity, envMapHight, envMapRadius, envMapGroundScale } =
    useControls("environment map", {
      envMapintensity: { value: 1, min: 0, max: 12, step: 0.01 },
      envMapHight: { value: 7, min: 0, max: 100, step: 0.01 },
      envMapRadius: { value: 20, min: 10, max: 1000, step: 0.01 },
      envMapGroundScale: { value: 100, min: 10, max: 1000, step: 0.01 },
    });
  const scene = useThree((state) => state.scene);
  useEffect(() => {
    scene.environmentIntensity = envMapintensity;
  }, [envMapintensity]);

  useFrame((state, delta) => {
    cube.current!.rotation.y += delta * 0.2;
  });

  return (
    <>
      <Environment
        background
        preset="sunset"
        ground={{
          height: envMapHight,
          radius: envMapRadius,
          scale: envMapGroundScale,
        }}
        // resolution={32}
        // files={[
        //   "./environmentMaps/the_sky_is_on_fire_2k.hdr",
        //   //   "./environmentMaps/2/px.jpg",
        //   //   "./environmentMaps/2/nx.jpg",
        //   //   "./environmentMaps/2/py.jpg",
        //   //   "./environmentMaps/2/ny.jpg",
        //   //   "./environmentMaps/2/pz.jpg",
        //   //   "./environmentMaps/2/nz.jpg",
        // ]}
      >
        {/* <mesh position={[0, 0, -5]} scale={[10, 10, 10]}>
          <planeGeometry />
          <meshStandardMaterial color="#ec0000" />
        </mesh> */}
      </Environment>

      <color args={["#000000"]} attach="background" />

      <Perf position="top-left" />

      <OrbitControls makeDefault />

      <mesh castShadow position-y={1} position-x={-2}>
        <sphereGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>

      <mesh castShadow ref={cube} position-y={1} position-x={2} scale={1.5}>
        <boxGeometry />
        <meshStandardMaterial color="mediumpurple" />
      </mesh>

      {/* <mesh receiveShadow position-y={0} rotation-x={-Math.PI * 0.5} scale={10}>
        <planeGeometry />
        <meshStandardMaterial color="greenyellow" />
      </mesh> */}
    </>
  );
}
