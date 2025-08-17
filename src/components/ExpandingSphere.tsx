import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

type Props = {
  /** 画面いっぱいになったら一度だけ呼ばれる */
  onDone?: () => void;
  /** どの程度埋まったら達成とみなすか(1.0=完全)。既定: 0.995 */
  threshold?: number;
};

export default function ExpandingSphere({ onDone, threshold = 0.8 }: Props) {
  const { gl, camera, invalidate } = useThree();
  const hasDone = useRef(false);

  // 調整用パラメータ
  const SENSE = 0.001; // スクロール→半径の変換係数
  const OVERSCAN = 1.1; // 少しだけ大きめに（縁の黒消し）
  const DIST = 2; // カメラ前方に置く距離
  const BASE = 0.2; // 最小半径

  const meshRef = useRef<THREE.Mesh>(null);
  const offsetRef = useRef(0); // 自前スクロール量（累積）

  const geometry = useMemo(() => new THREE.SphereGeometry(1, 48, 48), []);
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color: 0xffffff }),
    []
  );

  // deltaYの正規化
  function normalizeDeltaY(e: WheelEvent) {
    if (e.deltaMode === 0) return e.deltaY; // pixel
    if (e.deltaMode === 1) return e.deltaY * 16; // line ≈16px
    if (e.deltaMode === 2) return e.deltaY * window.innerHeight; // page
    const anyE = e as any;
    if (typeof anyE.wheelDeltaY === "number") return -anyE.wheelDeltaY;
    if (typeof anyE.wheelDelta === "number") return -anyE.wheelDelta;
    return 0;
  }

  // wheelを自前管理（canvas+window、capture & non-passive）
  useEffect(() => {
    const canvas = gl.domElement as HTMLCanvasElement;
    canvas.tabIndex = 0;
    canvas.focus();

    const onWheel = (e: WheelEvent) => {
      if (hasDone.current) return; // 達成後は無視（親がアンマウントする想定）
      offsetRef.current += normalizeDeltaY(e) * SENSE;
      e.preventDefault();
      e.stopPropagation();
      invalidate();
    };

    const opts: AddEventListenerOptions = { capture: true, passive: false };
    canvas.addEventListener("wheel", onWheel, opts);
    window.addEventListener("wheel", onWheel, opts);

    const refocus = () => canvas.focus();
    canvas.addEventListener("pointerdown", refocus);
    canvas.addEventListener("pointerenter", refocus);

    return () => {
      canvas.removeEventListener("wheel", onWheel as any, opts as any);
      window.removeEventListener("wheel", onWheel as any, opts as any);
      canvas.removeEventListener("pointerdown", refocus);
      canvas.removeEventListener("pointerenter", refocus);
    };
  }, [gl, invalidate]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // カメラ正面の距離 DIST に球を配置
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    mesh.position.copy(camera.position).add(dir.multiplyScalar(DIST));

    // 画面を埋める必要半径（縦横どちらも満たす値）
    const persp = camera as THREE.PerspectiveCamera;
    const fovY = THREE.MathUtils.degToRad(persp.fov);
    const aspect = persp.aspect || 1;
    const tanY = Math.tan(fovY / 2);
    const tanX = tanY * aspect;
    const fillRadius = DIST * Math.max(tanY, tanX) * OVERSCAN;

    // スクロールに応じた目標半径
    const target = BASE + offsetRef.current;

    // 達成判定（クランプ前の target ベースで見る）
    if (!hasDone.current && target >= fillRadius * threshold) {
      hasDone.current = true;
      onDone?.(); // ★ 親に通知（1回だけ）
    }

    // 実際に表示する半径（0未満は切り捨て、上限は fillRadius）
    const radius = THREE.MathUtils.clamp(
      target,
      Math.max(0.001, BASE),
      fillRadius
    );

    // 単位球をスケールして半径に合わせる
    mesh.scale.setScalar(radius);
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}
