import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";

function normalizeDeltaY(e: WheelEvent) {
  if (e.deltaMode === 0) return e.deltaY; // pixel
  if (e.deltaMode === 1) return e.deltaY * 16; // line ≈ 16px
  if (e.deltaMode === 2) return e.deltaY * window.innerHeight; // page
  const anyE = e as any;
  if (typeof anyE.wheelDeltaY === "number") return -anyE.wheelDeltaY;
  if (typeof anyE.wheelDelta === "number") return -anyE.wheelDelta;
  return 0;
}

export function CameraScrollInertial({
  sense = 0.002, // スクロール → 角速度(rad/s) への変換係数
  friction = 0.92, // 1フレームあたりの減衰率（60fps換算）
}: {
  sense?: number;
  friction?: number;
}) {
  const { gl, camera } = useThree();

  const yaw = useRef(0); // 現在のヨー角（累積）
  const yawVel = useRef(0); // 角速度（rad/s）
  const up = useRef(new THREE.Vector3(0, 1, 0)); // ワールドUp

  useEffect(() => {
    const canvas = gl.domElement as HTMLCanvasElement;
    canvas.tabIndex = 0; // フォーカス可能に
    canvas.focus();

    const onWheel = (e: WheelEvent) => {
      // iFrame(Html)の矩形内は無視
      const els = document.querySelectorAll(".htmlScreenPC, .htmlScreenSP");
      const insideIframe = Array.from(els).some((el) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        return (
          e.clientX >= r.left &&
          e.clientX <= r.right &&
          e.clientY >= r.top &&
          e.clientY <= r.bottom
        );
      });
      if (insideIframe) return;

      // 角速度に加算（慣性の“キック”）
      yawVel.current += normalizeDeltaY(e) * sense;

      // ページスクロールを止めたいなら有効化
      e.preventDefault();
      e.stopPropagation();
    };

    const opts: AddEventListenerOptions = { capture: true, passive: false };
    canvas.addEventListener("wheel", onWheel, opts);
    window.addEventListener("wheel", onWheel, opts);

    const refocus = () => canvas.focus();
    canvas.addEventListener("pointerenter", refocus);

    return () => {
      canvas.removeEventListener("wheel", onWheel as any, opts as any);
      window.removeEventListener("wheel", onWheel as any, opts as any);
      canvas.removeEventListener("pointerenter", refocus);
    };
  }, [gl, sense]);

  useFrame((_, dt) => {
    // 角速度がほぼゼロならスキップ
    if (Math.abs(yawVel.current) < 1e-6) return;

    // 角度を進める（角速度[rad/s] × dt[s]）
    const dYaw = yawVel.current * dt;
    yaw.current += dYaw;

    // カメラをワールドY軸回転
    camera.rotateOnWorldAxis(up.current, dYaw);
    camera.updateMatrixWorld();

    // 摩擦で減衰（60fps基準をdtで補正）
    yawVel.current *= Math.pow(friction, dt * 60);
  });

  return null;
}
