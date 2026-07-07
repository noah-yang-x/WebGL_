import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const VideoTexture: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // 启用深度测试
    gl.enable(gl.DEPTH_TEST);

    // 顶点着色器
    const vertexShaderSource = `
      attribute vec3 a_position;
      attribute vec2 a_texCoord;

      varying vec2 v_texCoord;

      uniform mat4 u_modelViewMatrix;
      uniform mat4 u_projectionMatrix;

      void main() {
        v_texCoord = a_texCoord;
        gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_position, 1.0);
      }
    `;

    // 片段着色器
    const fragmentShaderSource = `
      precision highp float;

      varying vec2 v_texCoord;

      uniform sampler2D u_videoTexture;

      void main() {
        vec4 color = texture2D(u_videoTexture, v_texCoord);
        // 添加一些基础光照
        float diffuse = max(dot(vec3(0.0, 0.0, 1.0), vec3(0.0, 0.0, 1.0)), 0.0);
        color.rgb = color.rgb * (0.5 + 0.5 * diffuse);
        gl_FragColor = color;
      }
    `;

    // 编译着色器
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('顶点着色器编译错误:', gl.getShaderInfoLog(vertexShader));
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('片段着色器编译错误:', gl.getShaderInfoLog(fragmentShader));
    }

    // 创建着色器程序
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('着色器程序链接错误:', gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);

    // 获取属性位置
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    const videoTextureLocation = gl.getUniformLocation(program, 'u_videoTexture');

    console.log('属性位置:', {
      positionLocation,
      texCoordLocation,
      videoTextureLocation
    });

    // 创建平面几何体
    const positions = [
      -1, -1, 0,
       1, -1, 0,
       1,  1, 0,
      -1,  1, 0,
    ];

    const texCoords = [
      0, 0,
      1, 0,
      1, 1,
      0, 1,
    ];

    const indices = [
      0, 1, 2,
      0, 2, 3,
    ];

    // 创建缓冲区
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // 创建视频纹理
    const videoTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, videoTexture);

    // 创建一个临时的测试纹理
    const size = 64;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const offset = (y * size + x) * 4;
        data[offset] = (x / size) * 255;     // R
        data[offset + 1] = (y / size) * 255; // G
        data[offset + 2] = 128;              // B
        data[offset + 3] = 255;              // A
      }
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // 设置纹理采样器
    gl.uniform1i(videoTextureLocation, 0);

    // 设置变换矩阵
    const modelViewMatrix = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);

    const projectionMatrix = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);

    const modelViewMatrixLocation = gl.getUniformLocation(program, 'u_modelViewMatrix');
    const projectionMatrixLocation = gl.getUniformLocation(program, 'u_projectionMatrix');
    gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

    // 视频加载状态检查
    video.addEventListener('loadedmetadata', () => {
      console.log('视频元数据已加载:', {
        width: video.videoWidth,
        height: video.videoHeight,
        readyState: video.readyState
      });
    });

    video.addEventListener('canplay', () => {
      console.log('视频可以播放了');
      setVideoLoaded(true);
    });

    video.addEventListener('error', (e) => {
      console.error('视频加载错误:', e);
      setError('视频加载失败，请检查视频文件是否存在');
    });

    function updateVideoTexture() {
      if (!gl || !video) return;

      // 检查视频是否已加载
      if (video.readyState < video.HAVE_CURRENT_DATA) {
        console.log('视频未准备好:', video.readyState);
        return;
      }

      try {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, videoTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        console.log('视频纹理更新成功');
      } catch (e) {
        console.error('更新视频纹理时出错:', e);
        setError('更新视频纹理时出错');
      }
    }

    function render() {
      if (!gl || !canvas) return;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // 更新视频纹理
      if (videoLoaded) {
        updateVideoTexture();
      }

      // 设置位置属性
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

      // 设置纹理坐标属性
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.enableVertexAttribArray(texCoordLocation);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

      // 绘制
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

      // 检查WebGL错误
      const error = gl.getError();
      if (error !== gl.NO_ERROR) {
        console.error('WebGL错误:', error);
        setError(`WebGL错误: ${error}`);
      }

      // 请求下一帧
      requestAnimationFrame(render);
    }

    // 开始渲染循环
    render();
  }, [videoLoaded]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='px-4 md:px-8'>
      <div className='h-12'></div>
      <div className='flex flex-col items-center'>
        <div className='text-lg mb-4'>
          这个demo展示了如何在WebGL中使用视频作为纹理。
          我们创建了一个平面，将视频作为纹理映射到平面上。
        </div>
        {error && (
          <div className='text-red-500 mb-4'>
            {error}
          </div>
        )}
        <video
          ref={videoRef}
          style={{ display: 'none' }}
          autoPlay
          loop
          muted
          playsInline
          crossOrigin="anonymous"
        >
          <source src={`${import.meta.env.BASE_URL}videos/sample.mp4`} type="video/mp4" />
        </video>
        <canvas
          ref={canvasRef}
          width={512}
          height={512}
          className='border border-gray-300'
        />
      </div>
    </motion.div>
  );
};

export default VideoTexture;
