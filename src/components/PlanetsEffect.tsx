import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

type Props = {
  onDone?: () => void;
};

type Item = { dir: THREE.Vector3; base: number; scale: number };

const COUNT = 200;
const SENSE = 0.002; // 大きめでテスト → 動作確認後に小さく

function normalizeDeltaY(e: WheelEvent) {
  if (e.deltaMode === 0) return e.deltaY; // pixel
  if (e.deltaMode === 1) return e.deltaY * 16; // line≒16px
  if (e.deltaMode === 2) return e.deltaY * window.innerHeight; // page
  const anyE = e as any;
  if (typeof anyE.wheelDeltaY === "number") return -anyE.wheelDeltaY;
  if (typeof anyE.wheelDelta === "number") return -anyE.wheelDelta;
  return 0;
}

export default function PlanetsEffect({ onDone }: Props) {
  const { gl } = useThree();
  const hasDone = useRef(false); // 完了フラグ

  const items = useMemo<Item[]>(() => {
    const arr: Item[] = [];
    for (let i = 0; i < COUNT; i++) {
      const p = new THREE.Vector3()
        .randomDirection()
        .multiplyScalar(Math.random() * 0.5);
      arr.push({
        dir: p.clone().normalize(),
        base: p.length(),
        scale: Math.random() * 0.3 + 0.1,
      });
    }
    return arr;
  }, []);

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => new THREE.SphereGeometry(0.1, 12, 12), []);
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ wireframe: true }),
    []
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const offset = useRef(0);

  // ★ フォーカス強制 & イベント二重登録（canvas+window）
  useEffect(() => {
    const canvas = gl.domElement as HTMLCanvasElement;
    // フォーカスを当てる（キーボードイベントのため）
    canvas.tabIndex = 0;
    canvas.focus();

    const onWheel = (e: WheelEvent) => {
      offset.current += normalizeDeltaY(e) * SENSE;
      e.preventDefault();
      e.stopPropagation();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        offset.current += 20 * SENSE;
        e.preventDefault();
      }
      if (e.key === "ArrowUp") {
        offset.current -= 20 * SENSE;
        e.preventDefault();
      }
    };
    const opts: AddEventListenerOptions = { capture: true, passive: false };

    canvas.addEventListener("wheel", onWheel, opts);
    window.addEventListener("wheel", onWheel, opts);
    window.addEventListener("keydown", onKey, true); // captureで確実に

    // マウスがキャンバスに入ったら再フォーカス（他要素に奪われた場合）
    const refocus = () => canvas.focus();
    canvas.addEventListener("pointerdown", refocus);
    canvas.addEventListener("pointerenter", refocus);

    return () => {
      canvas.removeEventListener("wheel", onWheel as any, opts as any);
      window.removeEventListener("wheel", onWheel as any, opts as any);
      window.removeEventListener("keydown", onKey, true);
      canvas.removeEventListener("pointerdown", refocus);
      canvas.removeEventListener("pointerenter", refocus);
    };
  }, [gl]);

  // 初期行列
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < COUNT; i++) {
      const it = items[i];
      dummy.position.copy(it.dir).multiplyScalar(it.base);
      dummy.scale.setScalar(it.scale);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [items, dummy]);

  // 毎フレーム更新（offset のみで決定）
  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    if (hasDone.current) return;

    for (let i = 0; i < COUNT; i++) {
      const it = items[i];
      const r = Math.max(0, it.base + offset.current); // 貫通させたいなら Math.max を外す
      dummy.position.copy(it.dir).multiplyScalar(r);
      dummy.scale.setScalar(it.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    console.log("offset", offset.current);

    if (!hasDone.current && offset.current > 5) {
      hasDone.current = true; // 自コンポーネント内の更新停止フラグ
      onDone?.();
    }
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[geometry, material, COUNT]} />
    </>
  );
}
