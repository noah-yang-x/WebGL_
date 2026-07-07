import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const EnvironmentMapping: React.FC = () => {
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
      uniform mat3 u_normalMatrix;

      void main() {
        v_normal = normalize(u_normalMatrix * a_normal);
        v_position = vec3(u_modelViewMatrix * vec4(a_position, 1.0));
        gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_position, 1.0);
      }
    `;

    // 片段着色器
    const fragmentShaderSource = `
      precision highp float;

      varying vec3 v_normal;
      varying vec3 v_position;

      uniform samplerCube u_environmentMap;

      void main() {
        // 计算反射向量
        vec3 normal = normalize(v_normal);
        vec3 viewDir = normalize(-v_position);
        vec3 reflectDir = reflect(-viewDir, normal);

        // 从环境贴图中采样
        vec4 color = textureCube(u_environmentMap, reflectDir);

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

    // 获取uniform位置
    const environmentMapLocation = gl.getUniformLocation(program, 'u_environmentMap');
    const modelViewMatrixLocation = gl.getUniformLocation(program, 'u_modelViewMatrix');
    const projectionMatrixLocation = gl.getUniformLocation(program, 'u_projectionMatrix');
    const normalMatrixLocation = gl.getUniformLocation(program, 'u_normalMatrix');

    // 检查uniform位置
    if (!environmentMapLocation || !modelViewMatrixLocation || !projectionMatrixLocation || !normalMatrixLocation) {
      console.error('找不到uniform位置:', {
        environmentMap: environmentMapLocation,
        modelViewMatrix: modelViewMatrixLocation,
        projectionMatrix: projectionMatrixLocation,
        normalMatrix: normalMatrixLocation
      });
    }

    // 设置初始uniform值
    gl.uniform1i(environmentMapLocation, 0);

    // 修改投影矩阵
    const projectionMatrix = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, -1, -1,
      0, 0, -1, 0,
    ]);

    // 修改模型视图矩阵
    const modelViewMatrix = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, -3,  // 将相机移近一些
      0, 0, 0, 1,
    ]);

    // 修改法线矩阵
    const normalMatrix = new Float32Array([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ]);

    gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
    gl.uniformMatrix3fv(normalMatrixLocation, false, normalMatrix);

    // 创建球体几何体
    const segments = 32;
    const positions: number[] = [];
    const normals: number[] = [];
    const texCoords: number[] = [];
    const indices: number[] = [];

    for (let lat = 0; lat <= segments; lat++) {
      const theta = lat * Math.PI / segments;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let lon = 0; lon <= segments; lon++) {
        const phi = lon * 2 * Math.PI / segments;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;

        positions.push(x, y, z);
        normals.push(x, y, z);
        texCoords.push(lon / segments, lat / segments);
      }
    }

    for (let lat = 0; lat < segments; lat++) {
      for (let lon = 0; lon < segments; lon++) {
        const first = lat * (segments + 1) + lon;
        const second = first + segments + 1;

        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }

    // 创建缓冲区
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // 创建立方体贴图
    const cubeMap = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

    // 立方体贴图的六个面
    const cubeMapFaces = [
      { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: `${import.meta.env.BASE_URL}skybox/xpos.png` },
      { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: `${import.meta.env.BASE_URL}skybox/xneg.png` },
      { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: `${import.meta.env.BASE_URL}skybox/ypos.png` },
      { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: `${import.meta.env.BASE_URL}skybox/yneg.png` },
      { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: `${import.meta.env.BASE_URL}skybox/zpos.png` },
      { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: `${import.meta.env.BASE_URL}skybox/zneg.png` }
    ];

    // 加载所有面的图片
    let loadedFaces = 0;
    cubeMapFaces.forEach((face, index) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = face.url;

      image.onload = () => {
        console.log(`加载立方体贴图面 ${index} 成功:`, {
          width: image.width,
          height: image.height,
          src: image.src
        });

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
        gl.texImage2D(face.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        loadedFaces++;
        if (loadedFaces === 6) {
          console.log('所有立方体贴图面加载完成');
          gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

          // 如果是 WebGL 2.0，设置 R 方向的纹理包装
          if (gl instanceof WebGL2RenderingContext) {
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
          }

          // 确保使用正确的程序
          gl.useProgram(program);

          // 设置纹理采样器
          const environmentMapLocation = gl.getUniformLocation(program, 'u_environmentMap');
          if (environmentMapLocation) {
            gl.uniform1i(environmentMapLocation, 0);
            console.log('环境贴图采样器设置成功');
          } else {
            console.error('找不到环境贴图采样器位置');
          }

          // 开始渲染
          render();
        }
      };
    });

    function render() {
      console.log("render");

      loadedFaces = 0;

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

    render();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='px-4 md:px-8'>
      <div className='h-12'></div>
      <div className='flex flex-col items-center'>
        <div className='text-lg mb-4'>
          这个demo展示了如何使用环境贴图（Environment Mapping）来模拟物体表面的反射效果。
          我们创建了一个球体，并使用立方体贴图（Cube Map）来实现环境反射。
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

export default EnvironmentMapping;