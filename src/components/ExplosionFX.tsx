import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

type Props = {
  position?: THREE.Vector3Tuple;
  duration?: number; // 全体寿命（秒）
  particleCount?: number; // 火花粒子数
  debrisCount?: number; // デブリ数
  color?: THREE.ColorRepresentation; // 火花色
  debrisColor?: THREE.ColorRepresentation; // デブリ色
  shockColor?: THREE.ColorRepresentation; // 衝撃波色
  speed?: number; // 粒子の初速スケール
  debrisSpeed?: number; // デブリ初速スケール
  gravity?: number; // 重力
  drag?: number; // 空気抵抗（0〜1）
};

export default function ExplosionFX({
  position = [0, 0, 0],
  duration = 2.0,
  particleCount = 300,
  debrisCount = 50,
  color = "#ffae00",
  debrisColor = "#ff9955",
  shockColor = "#ffffff",
  speed = 7,
  debrisSpeed = 5,
  gravity = 9.8,
  drag = 0.985,
}: Props) {
  // ====== 時間管理 ======
  const t0 = useRef(0);
  useEffect(() => {
    t0.current = performance.now() / 1000;
  }, []);
  const life = useRef(0); // 0..1

  // ====== 衝撃波（リング） ======
  const ringRef = useRef<THREE.Mesh>(null!);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null!);

  // ====== 火花（粒子） ======
  const instParticles = useRef<THREE.InstancedMesh>(null!);
  const partMat = useRef<THREE.MeshBasicMaterial>(null!);

  const partVel = useMemo(
    () => new Float32Array(particleCount * 3),
    [particleCount]
  );
  const partPos = useMemo(
    () => new Float32Array(particleCount * 3),
    [particleCount]
  );
  const partScale0 = useMemo(
    () => new Float32Array(particleCount),
    [particleCount]
  );

  useEffect(() => {
    const dir = new THREE.Vector3();
    for (let i = 0; i < particleCount; i++) {
      // 均等な方向
      dir
        .set(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        )
        .normalize();
      const s = speed * (0.6 + Math.random() * 0.8);
      const ix = i * 3;
      partVel[ix + 0] = dir.x * s;
      partVel[ix + 1] = dir.y * s;
      partVel[ix + 2] = dir.z * s;

      partPos[ix + 0] = position[0];
      partPos[ix + 1] = position[1];
      partPos[ix + 2] = position[2];

      partScale0[i] = 0.05 * (0.6 + Math.random() * 0.9);
    }
  }, [particleCount, speed, position]);

  // ====== デブリ（破片：小さな箱） ======
  const instDebris = useRef<THREE.InstancedMesh>(null!);
  const debrisMat = useRef<THREE.MeshStandardMaterial>(null!);

  const debrisVel = useMemo(
    () => new Float32Array(debrisCount * 3),
    [debrisCount]
  );
  const debrisPos = useMemo(
    () => new Float32Array(debrisCount * 3),
    [debrisCount]
  );
  const debrisScale = useMemo(
    () => new Float32Array(debrisCount),
    [debrisCount]
  );
  const debrisRot = useMemo(
    () => new Float32Array(debrisCount * 3),
    [debrisCount]
  ); // 角速度

  useEffect(() => {
    const dir = new THREE.Vector3();
    for (let i = 0; i < debrisCount; i++) {
      dir
        .set(Math.random() * 2 - 1, Math.random() * 1.0, Math.random() * 2 - 1)
        .normalize(); // 上方向にやや寄せる
      const s = debrisSpeed * (0.5 + Math.random() * 0.9);
      const ix = i * 3;
      debrisVel[ix + 0] = dir.x * s;
      debrisVel[ix + 1] = dir.y * s;
      debrisVel[ix + 2] = dir.z * s;

      debrisPos[ix + 0] = position[0];
      debrisPos[ix + 1] = position[1];
      debrisPos[ix + 2] = position[2];

      debrisScale[i] = 0.06 * (0.5 + Math.random() * 1.2);
      // 角速度（ランダム）
      debrisRot[ix + 0] = (Math.random() * 2 - 1) * 6;
      debrisRot[ix + 1] = (Math.random() * 2 - 1) * 6;
      debrisRot[ix + 2] = (Math.random() * 2 - 1) * 6;
    }
  }, [debrisCount, debrisSpeed, position]);

  // ====== 作業用 ======
  const tmpPos = new THREE.Vector3();
  const tmpQuat = new THREE.Quaternion();
  const tmpScale = new THREE.Vector3();
  const tmpMat = new THREE.Matrix4();
  const tmpEuler = new THREE.Euler();

  useFrame((_, dt) => {
    const now = performance.now() / 1000;
    life.current = Math.min((now - t0.current) / duration, 1); // 0..1

    // ---- 衝撃波：半径拡大＋フェード ----
    if (ringRef.current && ringMat.current) {
      const r = THREE.MathUtils.lerp(0.1, 4.5, Math.pow(life.current, 0.75)); // 半径成長
      ringRef.current.scale.set(r, r, r);
      ringMat.current.opacity = 1 - life.current; // フェード
    }

    // ---- 粒子 ----
    if (instParticles.current && partMat.current) {
      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        // 速度更新
        partVel[ix + 0] *= drag;
        partVel[ix + 1] = partVel[ix + 1] * drag - gravity * dt;
        partVel[ix + 2] *= drag;
        // 位置
        partPos[ix + 0] += partVel[ix + 0] * dt;
        partPos[ix + 1] += partVel[ix + 1] * dt;
        partPos[ix + 2] += partVel[ix + 2] * dt;

        const s = Math.max(partScale0[i] * (1 - life.current), 0.0001);

        tmpPos.set(partPos[ix + 0], partPos[ix + 1], partPos[ix + 2]);
        tmpScale.set(s, s, s);
        tmpMat.compose(tmpPos, tmpQuat, tmpScale);
        instParticles.current.setMatrixAt(i, tmpMat);
      }
      instParticles.current.instanceMatrix.needsUpdate = true;
      partMat.current.opacity = 1 - life.current;
    }

    // ---- デブリ ----
    if (instDebris.current && debrisMat.current) {
      for (let i = 0; i < debrisCount; i++) {
        const ix = i * 3;
        debrisVel[ix + 0] *= drag;
        debrisVel[ix + 1] = debrisVel[ix + 1] * drag - gravity * dt;
        debrisVel[ix + 2] *= drag;

        debrisPos[ix + 0] += debrisVel[ix + 0] * dt;
        debrisPos[ix + 1] += debrisVel[ix + 1] * dt;
        debrisPos[ix + 2] += debrisVel[ix + 2] * dt;

        // 回転
        tmpEuler.set(
          (now + i) * debrisRot[ix + 0] * 0.2,
          (now + i) * debrisRot[ix + 1] * 0.2,
          (now + i) * debrisRot[ix + 2] * 0.2
        );
        tmpQuat.setFromEuler(tmpEuler);

        const s = debrisScale[i] * (1 - life.current * 0.5); // 少し縮む

        tmpPos.set(debrisPos[ix + 0], debrisPos[ix + 1], debrisPos[ix + 2]);
        tmpScale.set(s, s, s);
        tmpMat.compose(tmpPos, tmpQuat, tmpScale);
        instDebris.current.setMatrixAt(i, tmpMat);
      }
      instDebris.current.instanceMatrix.needsUpdate = true;

      // デブリは少し暗くフェード
      debrisMat.current.opacity = 1 - life.current * 0.8;
    }
  });

  // 自動消滅（親要素側で key 付きレンダーにしていれば勝手に消える）
  // ここでは何もしない（必要なら onComplete コールバックを props で用意）

  return (
    <>
      {/* 衝撃波：薄いリング（加算合成） */}
      <mesh ref={ringRef} position={position}>
        <ringGeometry args={[0.98, 1.0, 64]} />
        <meshBasicMaterial
          ref={ringMat}
          color={shockColor}
          transparent
          opacity={1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 火花：小球の instancedMesh（加算合成） */}
      <instancedMesh
        ref={instParticles}
        args={[undefined as any, undefined as any, particleCount]}
      >
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial
          ref={partMat}
          color={color}
          transparent
          opacity={1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>

      {/* デブリ：小さな箱の instancedMesh（標準マテリアル） */}
      <instancedMesh
        ref={instDebris}
        args={[undefined as any, undefined as any, debrisCount]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={debrisMat}
          color={debrisColor}
          transparent
          opacity={1}
          roughness={0.9}
          metalness={0.1}
        />
      </instancedMesh>

      {/* にじみを少し */}
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.0} mipmapBlur />
      </EffectComposer>
    </>
  );
}
