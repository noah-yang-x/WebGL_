import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import LinkBox from '@/UIComponents/LinkBox';
import { baseUrl } from '@/env'

const WebGLPage: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='px-4 md:px-8'>
      <div className='h-12'></div>

      {/* <div className='grid grid-cols-1 md:grid-cols-6 gap-4 justify-items-center'> */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 justify-items-center'>
        <Link to={baseUrl + '/basic-pipeline/triangle'}>
          <LinkBox
            text='Triangle Rendering'
            label='RnderPiplin'
            color="text-blue-800"
            borderColor="border-blue-900"
            width="w-60"
            height="h-60"
          />
        </Link>
        <Link to={baseUrl + '/basic-pipeline/color'}>
          <LinkBox
            text='Color Interpolation'
            label='RnderPiplin'
            color="text-blue-800"
            borderColor="border-blue-900"
            width="w-60"
            height="h-60"
          />
        </Link>
        <Link to={baseUrl + '/basic-pipeline/texture'}>
          <LinkBox
            text='Texture Mapping'
            label='RnderPiplin'
            color="text-blue-800"
            borderColor="border-blue-900"
            width="w-60"
            height="h-60"
          />
        </Link>
        <Link to={baseUrl + '/basic-pipeline/transform'}>
          <LinkBox
            text='Transform Matrix'
            label='RnderPiplin'
            color="text-blue-800"
            borderColor="border-blue-900"
            width="w-60"
            height="h-60"
          />
        </Link>
        <Link to={baseUrl + '/basic-pipeline/lighting'}>
          <LinkBox
            text='Basic Lighting'
            label='RnderPiplin'
            color="text-blue-800"
            borderColor="border-blue-900"
            width="w-60"
            height="h-60"
          />
        </Link>
        <Link to={baseUrl + '/texture-system/loading'}>
          <LinkBox
            text='Texture Loading'
            label='Texture Sys'
            color="text-blue-800"
            borderColor="border-blue-900"
            width="w-60"
            height="h-60"
          />
        </Link>
        <Link to={baseUrl + '/texture-system/multiple'}>
          <LinkBox
            text='Multiple Textures'
            label='Texture Sys'
            color="text-blue-800"
            borderColor="border-blue-900"
            width="w-60"
            height="h-60"
          />
        </Link>
        <Link to={baseUrl + '/texture-system/animation'}>
          <LinkBox
            text='Texture Animation'
            label='Texture Sys'
            color="text-blue-800"
            borderColor="border-blue-900"
            width="w-60"
            height="h-60"
          />
        </Link>
        {/* <Link to={baseUrl + '/texture-system/normal'}>
          <LinkBox
            text='Normal Mapping'
            label='Texture Sys'
            color="text-blue-800"
            borderColor="border-blue-900"
            width="w-60"
            height="h-60"
          />
        </Link>
        <Link to={baseUrl + '/texture-system/environment'}>
          <LinkBox
            text='Environment Mapping'
            label='Texture Sys'
            color="text-blue-800"
            borderColor="border-blue-900"
            width="w-60"
            height="h-60"
          />
        </Link>
        <Link to={baseUrl + '/texture-system/video'}>
          <LinkBox
            text='Video Texture'
            label='Texture Sys'
            color="text-blue-800"
            borderColor="border-blue-900"
            width="w-60"
            height="h-60"
          />
        </Link>
        <Link to={baseUrl + '/texture-system/cube-map'}>
          <LinkBox
            text='Cube Map'
            label='Texture Sys'
            color="text-blue-800"
            borderColor="border-blue-900"
            width="w-60"
            height="h-60"
          />
        </Link>
        <Link to={baseUrl + '/webgl_triangle'}>
          <LinkBox
            text='WebGL init'
            label='WebGL'
            color="text-blue-800"
            borderColor="border-blue-900"
            width="w-60"
            height="h-60"
          />
        </Link>
        <Link to={baseUrl + '/webgl_gaussian_blur'}>
          <LinkBox
            text='Gaussian Blur'
            label='WebGL'
            color="text-blue-800"
            borderColor="border-blue-900"
            width="w-60"
            height="h-60"
          />
        </Link> */}
      </div>
    </motion.div>
  );
}

export default WebGLPage;