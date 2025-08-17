import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";

export default function CustomObject() {
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  // 三角形10個分の頂点数（= 30頂点）。positionsはXYZで×3
  const verticesCount = 10 * 3;

  const positions = useMemo(() => {
    const arr = new Float32Array(verticesCount * 3);
    for (let i = 0; i < arr.length; i++) arr[i] = (Math.random() - 0.5) * 3;
    return arr;
  }, [verticesCount]);

  useEffect(() => {
    if (!geometryRef.current) return;
    geometryRef.current.computeVertexNormals();
  }, []);

  return (
    <mesh>
      <bufferGeometry ref={geometryRef}>
        {/* ✅ R3FではBufferAttributeはargsで渡す */}
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <meshStandardMaterial color="red" side={THREE.DoubleSide} />
    </mesh>
  );
}
