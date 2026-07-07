import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom';

import WebGLPage from '@/pages/WebGLPage';
import WebGLTriangle from '@/pages/WebGLPage/WebGLTriangle';
import WebGLGaussianBlur from '@/pages/WebGLPage/WebGLGaussianBlur';
import TriangleRendering from '@/pages/WebGLPage/BasicPipeline/TriangleRendering';
import ColorInterpolation from '@/pages/WebGLPage/BasicPipeline/ColorInterpolation';
import TextureMapping from '@/pages/WebGLPage/BasicPipeline/TextureMapping';
import TransformMatrix from '@/pages/WebGLPage/BasicPipeline/TransformMatrix';
import BasicLighting from '@/pages/WebGLPage/BasicPipeline/BasicLighting';
import TextureLoading from '@/pages/WebGLPage/TextureSystem/TextureLoading';
import MultipleTextures from '@/pages/WebGLPage/TextureSystem/MultipleTextures';
import TextureAnimation from '@/pages/WebGLPage/TextureSystem/TextureAnimation';
import NormalMapping from '@/pages/WebGLPage/TextureSystem/NormalMapping';
import EnvironmentMapping from '@/pages/WebGLPage/TextureSystem/EnvironmentMapping';
import VideoTexture from '@/pages/WebGLPage/TextureSystem/VideoTexture';
import CubeMap from '@/pages/WebGLPage/TextureSystem/CubeMap';

import { baseUrl } from './env';

function WebGLHeader() {
  return (
    <nav
      className="flex h-12 items-center text-gray-800 px-4 shadow-md fixed w-screen z-10"
      style={{ background: 'linear-gradient(to top, rgba(36, 36, 36, 0.2), rgba(36, 36, 36, 1))' }}
    >
      <ul
        id="navigation"
        className="flex flex-grow items-center h-12 text-gray-800 space-x-4 md:space-x-8"
      >
        <li className="flex-shrink-0">
          <Link to={baseUrl || '/'} className="block py-2 hover:text-blue-500">
            WebGL
          </Link>
        </li>
      </ul>
    </nav>
  );
}

function App() {
  return (
    <div className="w-screen h-screen">
      <Router>
        <WebGLHeader />
        <Routes>
          <Route path={baseUrl || '/'} element={<WebGLPage />} />
          <Route path={baseUrl + '/webgl_triangle'} element={<WebGLTriangle />} />
          <Route path={baseUrl + '/webgl_gaussian_blur'} element={<WebGLGaussianBlur />} />
          <Route path={baseUrl + '/basic-pipeline/triangle'} element={<TriangleRendering />} />
          <Route path={baseUrl + '/basic-pipeline/color'} element={<ColorInterpolation />} />
          <Route path={baseUrl + '/basic-pipeline/texture'} element={<TextureMapping />} />
          <Route path={baseUrl + '/basic-pipeline/transform'} element={<TransformMatrix />} />
          <Route path={baseUrl + '/basic-pipeline/lighting'} element={<BasicLighting />} />
          <Route path={baseUrl + '/texture-system/loading'} element={<TextureLoading />} />
          <Route path={baseUrl + '/texture-system/multiple'} element={<MultipleTextures />} />
          <Route path={baseUrl + '/texture-system/animation'} element={<TextureAnimation />} />
          <Route path={baseUrl + '/texture-system/normal'} element={<NormalMapping />} />
          <Route path={baseUrl + '/texture-system/environment'} element={<EnvironmentMapping />} />
          <Route path={baseUrl + '/texture-system/video'} element={<VideoTexture />} />
          <Route path={baseUrl + '/texture-system/cube-map'} element={<CubeMap />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
