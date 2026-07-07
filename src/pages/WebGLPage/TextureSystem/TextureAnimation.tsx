import React, { useEffect, useRef } from 'react';

const TextureAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

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
      uniform float u_time;
      void main() {
        gl_Position = vec4(a_position, 0, 1);
        // 使用时间变量来改变纹理坐标
        v_texCoord = a_texCoord + vec2(sin(u_time) * 0.1, cos(u_time) * 0.1);
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
    const timeLocation = gl.getUniformLocation(program, 'u_time');

    // 创建纹理（棋盘格）
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const size = 256;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const offset = (y * size + x) * 4;
        const isBlack = ((x >> 4) ^ (y >> 4)) & 1;
        data[offset] = isBlack ? 0 : 255; // R
        data[offset + 1] = isBlack ? 0 : 255; // G
        data[offset + 2] = isBlack ? 0 : 255; // B
        data[offset + 3] = 255; // A
      }
    }

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    let time = 0;
    function render() {
      if (!gl || !canvas) return;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // 更新时间
      time += 0.01;
      gl.uniform1f(timeLocation, time);

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

      // 继续动画
      animationRef.current = requestAnimationFrame(render);
    }

    render();

    // 清理函数
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    // <div className="demo-container  min-h-screen flex flex-col">
    //   <div className='flex flex-col items-center justify-center flex-1'>
    //     <canvas
    //       ref={canvasRef}
    //       width={512}
    //       height={512}
    //       style={{ border: '1px solid #ccc' }}
    //     />
    //   </div>
    //   <div className="fixed bottom-0 left-0">
    //     <h2>纹理动画</h2>
    //     <p>这个demo展示了WebGL中的纹理动画。我们通过改变纹理坐标来实现动画效果：
    //     纹理会随着时间在四边形上移动和旋转。</p>
    //   </div>
    // </div>
    <div className="demo-container w-screen h-screen py-20 px-4" >
    <canvas ref={canvasRef} className="w-full h-full" width={400} height={400} />
    <div className="fixed bottom-0 left-0 p-4">
      {/* <p>这个demo展示了WebGL中的纹理动画。我们通过改变纹理坐标来实现动画效果： 纹理会随着时间在四边形上移动和旋转。</p> */}
    </div>
  </div>
  );
};

export default TextureAnimation;