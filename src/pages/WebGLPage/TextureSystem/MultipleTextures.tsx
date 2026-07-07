import React, { useEffect, useRef } from 'react';

const MultipleTextures: React.FC = () => {
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
      uniform sampler2D u_texture1;
      uniform sampler2D u_texture2;
      uniform sampler2D u_texture3;
      varying vec2 v_texCoord;
      void main() {
        vec4 color1 = texture2D(u_texture1, v_texCoord);
        vec4 color2 = texture2D(u_texture2, v_texCoord);
        vec4 color3 = texture2D(u_texture3, v_texCoord);
        gl_FragColor = mix(color1, color2, 0.5) * color3;
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

    // 创建第一个纹理（渐变）
    const texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);

    const size1 = 256;
    const data1 = new Uint8Array(size1 * size1 * 4);
    for (let y = 0; y < size1; y++) {
      for (let x = 0; x < size1; x++) {
        const offset = (y * size1 + x) * 4;
        data1[offset] = x; // R
        data1[offset + 1] = y; // G
        data1[offset + 2] = 128; // B
        data1[offset + 3] = 255; // A
      }
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size1, size1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


    // 创建第二个纹理（棋盘格）
    const texture2 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);

    const size2 = 256;
    const data2 = new Uint8Array(size2 * size2 * 4);
    for (let y = 0; y < size2; y++) {
      for (let x = 0; x < size2; x++) {
        const offset = (y * size2 + x) * 4;
        const isBlack = ((x >> 4) ^ (y >> 4)) & 1;
        data2[offset] = isBlack ? 0 : 255; // R
        data2[offset + 1] = isBlack ? 0 : 255; // G
        data2[offset + 2] = isBlack ? 0 : 255; // B
        data2[offset + 3] = 255; // A
      }
    }

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size2, size2, 0, gl.RGBA, gl.UNSIGNED_BYTE, data2);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // 创建第三个纹理 - - - img
    const texture3 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture3);

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = `${import.meta.env.BASE_URL}textures/Metal053C_1K-JPG/Metal053C_1K-JPG_Color.jpg`;
    image.onload = () => {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      render();
    }

    // 设置纹理单元
    const texture1Location = gl.getUniformLocation(program, 'u_texture1');
    const texture2Location = gl.getUniformLocation(program, 'u_texture2');
    const texture3Location = gl.getUniformLocation(program, 'u_texture3');
    gl.uniform1i(texture1Location, 0);
    gl.uniform1i(texture2Location, 1);
    gl.uniform1i(texture3Location, 2);

    function render() {
      if (!canvas || !gl) return;

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

    render();
  }, []);

  return (
    // <div className="demo-container min-h-screen flex flex-col">
    //   <div className='flex flex-col items-center justify-center flex-1'>
    //     <canvas
    //       ref={canvasRef}
    //       width={512}
    //       height={512}
    //       style={{ border: '1px solid #ccc' }}
    //     />
    //   </div>
    //   <div className="fixed bottom-0 left-0">
    //     <h2>多纹理混合</h2>
    //     <p>这个demo展示了WebGL中的多纹理混合。我们创建了两个纹理：</p>
    //     <p>一个渐变纹理和一个棋盘格纹理，然后在片段着色器中将它们混合在一起。</p>
    //   </div>
    // </div>
     <div className="demo-container w-screen h-screen py-20 px-4" >
     <canvas ref={canvasRef} className="w-full h-full" width={400} height={400} />
     <div className="fixed bottom-0 left-0 p-4">
      {/* <p>这个demo展示了WebGL中的多纹理混合。</p>
      <p>我们创建了两个纹理：</p>
      <p>一个渐变纹理和一个棋盘格纹理，</p>
      <p>然后在片段着色器中将它们混合在一起。</p> */}
     </div>
   </div>
  );
};

export default MultipleTextures;
