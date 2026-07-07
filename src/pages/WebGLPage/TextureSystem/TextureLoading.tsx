import React, { useEffect, useRef } from 'react';
// import { motion } from 'framer-motion';

const TextureLoading: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // 顶点着色器
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0, 1);
        v_texCoord = a_texCoord;
      }
    `;

    // 片段着色器
    const fragmentShaderSource = `
      precision mediump float;
      uniform sampler2D u_texture;
      varying vec2 v_texCoord;
      void main() {
        gl_FragColor = texture2D(u_texture, v_texCoord);
      }
    `;

    // 编译着色器
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // 创建着色器程序
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // 设置顶点数据
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);

    const texCoords = new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      1, 1,
    ]);

    // 创建缓冲区
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    // 获取属性位置
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

    // 创建纹理
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));// test demo

    // 渲染函数
    function render() {
      if (!gl || !canvas) return;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // 设置位置属性
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      // 设置纹理坐标属性
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.enableVertexAttribArray(texCoordLocation);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

      // 绘制
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // 加载图片
    const image = new Image();
    image.crossOrigin = "anonymous"; // 允许跨域加载
    image.src = `${import.meta.env.BASE_URL}textures/Metal053C_1K-JPG/Metal053C_1K-JPG_Color.jpg`;

    // console.log('开始加载图片:', {
    //   src: image.src,
    //   baseUrl: import.meta.env.BASE_URL,
    //   origin: window.location.origin
    // });

    image.onload = () => {
      // console.log('图片加载成功:', {
      //   width: image.width,
      //   height: image.height,
      //   src: image.src,
      //   complete: image.complete,
      //   naturalWidth: image.naturalWidth,
      //   naturalHeight: image.naturalHeight
      // });

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      render();
    };

    // image.onerror = (e) => {
    //   console.error('图片加载失败:', {
    //     error: e,
    //     src: image.src,
    //     currentSrc: image.currentSrc,
    //     complete: image.complete
    //   });

    //   // 尝试使用绝对路径
    //   const absolutePath = window.location.origin + '/textures/Metal053C_1K-JPG/Metal053C_1K-JPG_Color.jpg';
    //   console.log('尝试使用绝对路径:', absolutePath);

    //   const fallbackImage = new Image();
    //   fallbackImage.crossOrigin = "anonymous";
    //   fallbackImage.src = absolutePath;

    //   fallbackImage.onload = () => {
    //     console.log('使用绝对路径加载成功');
    //     gl.bindTexture(gl.TEXTURE_2D, texture);
    //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fallbackImage);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    //     render();
    //   };

    //   fallbackImage.onerror = () => {
    //     console.error('绝对路径也加载失败，使用测试纹理');
    //     // 使用测试纹理
    //     const size = 256;
    //     const data = new Uint8Array(size * size * 4);
    //     for (let y = 0; y < size; y++) {
    //       for (let x = 0; x < size; x++) {
    //         const offset = (y * size + x) * 4;
    //         data[offset] = x; // R
    //         data[offset + 1] = y; // G
    //         data[offset + 2] = 128; // B
    //         data[offset + 3] = 255; // A
    //       }
    //     }
    //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    //     render();
    //   };
    // };

    // 初始渲染
    render();
  }, []);

  return (
    // <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='px-4 md:px-8 min-h-screen flex flex-col'>
    //   <div className='h-12'></div>
    //   <div className='flex flex-col items-center justify-center flex-1'>
    //     <canvas
    //       ref={canvasRef}
    //       width={512}
    //       height={512}
    //       className='border border-gray-300'
    //     />
    //   </div>
    //   <div className="fixed bottom-0 left-0">
    //     <h2>纹理加载演示</h2>
    //     <p>这个demo展示了WebGL中的纹理加载和显示。我们创建了一个简单的着色器程序，加载了一张图片作为纹理，并将其显示在一个四边形上。</p>
    //   </div>
    // </motion.div>
     <div className="demo-container w-screen h-screen py-20 px-4" >
     <canvas ref={canvasRef} className="w-full h-full" width={400} height={400} />
     <div className="fixed bottom-0 left-0 p-4">
       {/* <p>这个demo展示了WebGL中的纹理加载和显示。我们创建了一个简单的着色器程序，加载了一张图片作为纹理，并将其显示在一个四边形上。</p> */}
     </div>
   </div>
  );
};

export default TextureLoading;