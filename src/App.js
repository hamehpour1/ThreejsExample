import { useState, useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Model from './assets/model/Totoro.gltf';
function loadGLTFModel(scene, glbPath, options, x, y, z) {
  const { receiveShadow, castShadow } = options;
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      glbPath,
      (gltf) => {
        const obj = gltf.scene;
        obj.name = "Totoro";
        obj.position.y = 0;
        obj.position.x = 0;
        //obj.scale.set(1, 1, .01); 

        obj.receiveShadow = receiveShadow;
        obj.castShadow = castShadow;
        scene.add(obj);

        obj.traverse(function (child) {
          if (child.isMesh) {
            child.castShadow = castShadow;
            child.receiveShadow = receiveShadow;
          }
        });

        resolve(obj);
      },
      undefined,
      function (error) {
        console.log(error);
        reject(error);
      }
    );
  });
}

function easeOutCirc(x) {
  return Math.sqrt(1 - Math.pow(x - 1, 4));
}

const Totoro = (props) => {
  const refContainer = useRef();
  const [loading, setLoading] = useState(true);
  const [renderer, setRenderer] = useState();

  useEffect(() => {

    const { current: container } = refContainer;
    if (container && !renderer) {
      const scW = container.clientWidth;
      const scH = container.clientHeight;
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(scW, scH);
      renderer.outputEncoding = THREE.sRGBEncoding;
      container.appendChild(renderer.domElement);
      setRenderer(renderer);

      const scene = new THREE.Scene();
      const scale = .02;
      const camera = new THREE.OrthographicCamera(
        -scale,
        scale,
        scale,
        -scale,
        0.01,
        50000
      );
      const target = new THREE.Vector3(-0.5, 1.2, 0);
      const initialCameraPosition = new THREE.Vector3(
        20 * Math.sin(0.2 * Math.PI),
        10,
        20 * Math.cos(0.2 * Math.PI)
      );
      const ambientLight = new THREE.AmbientLight(0xcccccc, 1);
      scene.add(ambientLight);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.autoRotate = true;
      controls.target = target;

      loadGLTFModel(scene, Model, {
        receiveShadow: false,
        castShadow: false
      }, props.x, props.y, props.z).then(() => {
        animate();

        setLoading(false);
      });

      let req = null;
      let frame = 0;
      const animate = () => {
        console.log(props);

        console.log(parseFloat(props.x), parseFloat(props.y), parseFloat(props.z));
        scene.scale.set(parseFloat(props.x), parseFloat(props.y), parseFloat(props.z));

        req = requestAnimationFrame(animate);
        frame = frame <= 100 ? frame + 1 : frame;

        if (frame <= 100) {
          const p = initialCameraPosition;
          const rotSpeed = -easeOutCirc(frame / 120) * Math.PI * 20;

          camera.position.y = 10;
          camera.position.x =
            p.x * Math.cos(rotSpeed) + p.z * Math.sin(rotSpeed);
          camera.position.z =
            p.z * Math.cos(rotSpeed) - p.x * Math.sin(rotSpeed);
          camera.lookAt(target);
        } else {
          controls.update();
        }

        renderer.render(scene, camera);
      };

      return () => {
        cancelAnimationFrame(req);
        renderer.dispose();
      };
    }
  }, [props, renderer]);

  return (
    <div
      style={{ height: "540px", width: "540px", position: "relative" }}
      ref={refContainer}
    >
      {loading && (
        <span style={{ position: "absolute", left: "50%", top: "50%" }}>
          Loading...
        </span>
      )}
    </div>
  );
};

export default function App() {
  const [x, setX] = useState(.1);
  const [y, setY] = useState(.1);
  const [z, setZ] = useState(.1);
  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <p>Click and hold to move around</p>
      <p>
        Please change the text for change Totoro Scale
      </p>
      <input type="text" value={x} onChange={(event) => setX(event.target.value)} />
      <input type="text" value={y} onChange={(event) => setY(event.target.value)} />
      <input type="text" value={z} onChange={(event) => setZ(event.target.value)} />
      <Totoro x={x} y={y} z={z} />
    </div>
  );
}
