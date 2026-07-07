import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const CubeMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
      attribute vec3 a_normal;

      varying vec3 v_normal;
      varying vec3 v_position;

      uniform mat4 u_modelViewMatrix;
      uniform mat4 u_projectionMatrix;
      uniform mat4 u_normalMatrix;

      void main() {
        v_normal = normalize(vec3(u_normalMatrix * vec4(a_normal, 0.0)));
        v_position = vec3(u_modelViewMatrix * vec4(a_position, 1.0));
        gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_position, 1.0);
      }
    `;

    // 片段着色器
    const fragmentShaderSource = `
      precision highp float;

      varying vec3 v_normal;
      varying vec3 v_position;

      uniform samplerCube u_cubeMap;

      void main() {
        // 计算反射向量
        vec3 normal = normalize(v_normal);
        vec3 viewDir = normalize(-v_position);
        vec3 reflectDir = reflect(-viewDir, normal);

        // 从立方体贴图中采样
        vec4 color = textureCube(u_cubeMap, reflectDir);

        // 添加一些基础光照
        float diffuse = max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0);
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
    const normalLocation = gl.getAttribLocation(program, 'a_normal');

    // 创建立方体几何体
    const positions = [
      // 前面
      -1, -1,  1,
       1, -1,  1,
       1,  1,  1,
      -1,  1,  1,
      // 后面
      -1, -1, -1,
      -1,  1, -1,
       1,  1, -1,
       1, -1, -1,
      // 上面
      -1,  1, -1,
      -1,  1,  1,
       1,  1,  1,
       1,  1, -1,
      // 下面
      -1, -1, -1,
       1, -1, -1,
       1, -1,  1,
      -1, -1,  1,
      // 右面
       1, -1, -1,
       1,  1, -1,
       1,  1,  1,
       1, -1,  1,
      // 左面
      -1, -1, -1,
      -1, -1,  1,
      -1,  1,  1,
      -1,  1, -1,
    ];

    const normals = [
      // 前面
       0,  0,  1,
       0,  0,  1,
       0,  0,  1,
       0,  0,  1,
      // 后面
       0,  0, -1,
       0,  0, -1,
       0,  0, -1,
       0,  0, -1,
      // 上面
       0,  1,  0,
       0,  1,  0,
       0,  1,  0,
       0,  1,  0,
      // 下面
       0, -1,  0,
       0, -1,  0,
       0, -1,  0,
       0, -1,  0,
      // 右面
       1,  0,  0,
       1,  0,  0,
       1,  0,  0,
       1,  0,  0,
      // 左面
      -1,  0,  0,
      -1,  0,  0,
      -1,  0,  0,
      -1,  0,  0,
    ];

    const indices = [
      0, 1, 2, 0, 2, 3,    // 前面
      4, 5, 6, 4, 6, 7,    // 后面
      8, 9, 10, 8, 10, 11, // 上面
      12, 13, 14, 12, 14, 15, // 下面
      16, 17, 18, 16, 18, 19, // 右面
      20, 21, 22, 20, 22, 23, // 左面
    ];

    // 创建缓冲区
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // 创建立方体贴图
    const cubeMap = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

    // 创建临时的测试立方体贴图
    const size = 64;
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < 6; i++) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const offset = (y * size + x) * 4;
          data[offset] = (i === 0) ? 255 : 0;     // R
          data[offset + 1] = (i === 1) ? 255 : 0; // G
          data[offset + 2] = (i === 2) ? 255 : 0; // B
          data[offset + 3] = 255;                 // A
        }
      }
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    }

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // 设置纹理采样器
    const cubeMapLocation = gl.getUniformLocation(program, 'u_cubeMap');
    gl.uniform1i(cubeMapLocation, 0);

    // 设置变换矩阵
    const modelViewMatrix = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, -5,
      0, 0, 0, 1,
    ]);

    const projectionMatrix = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, -1, -1,
      0, 0, -1, 0,
    ]);

    const normalMatrix = new Float32Array([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ]);

    const modelViewMatrixLocation = gl.getUniformLocation(program, 'u_modelViewMatrix');
    const projectionMatrixLocation = gl.getUniformLocation(program, 'u_projectionMatrix');
    const normalMatrixLocation = gl.getUniformLocation(program, 'u_normalMatrix');

    gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
    gl.uniformMatrix3fv(normalMatrixLocation, false, normalMatrix);

    function render() {
      if (!gl || !canvas) return;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // 设置位置属性
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

      // 设置法线属性
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.enableVertexAttribArray(normalLocation);
      gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

      // 绘制
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

      // 请求下一帧
      requestAnimationFrame(render);
    }

    // 开始渲染循环
    render();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='px-4 md:px-8'>
      <div className='h-12'></div>
      <div className='flex flex-col items-center'>
        <div className='text-lg mb-4'>
          这个demo展示了如何使用立方体贴图（Cube Map）来创建环境映射效果。
          我们创建了一个立方体，并使用立方体贴图来实现环境反射。
        </div>
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

export default CubeMap;