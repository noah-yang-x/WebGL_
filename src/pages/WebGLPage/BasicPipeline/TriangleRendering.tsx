import React, { useEffect, useRef } from 'react';

const TriangleRendering: React.FC = () => {
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
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // 片段着色器
    const fragmentShaderSource = `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // 红色
      }
    `;

    // 创建着色器程序
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // 创建顶点数据
    const positions = new Float32Array([
      0.0, 0.5,   // 顶点1
      -0.5, -0.5, // 顶点2
      0.5, -0.5   // 顶点3
    ]);

    // 创建缓冲区
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // 获取属性位置
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // 设置视口
    gl.viewport(0, 0, canvas.width, canvas.height);

    // 清除画布
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 绘制三角形
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // 清理
    return () => {
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <div className="webgl-container  w-screen h-screen ">

      <canvas
        ref={canvasRef}
        className="w-full h-full"
        width={800}
        height={600}
      />
      <div className="description fixed bottom-0 left-0 p-4">
        {/* <h1>三角形渲染</h1> */}
        {/* <h2>说明</h2> */}
        {/* <p>这个demo展示了WebGL中最基础的三角形渲染。</p> */}
        {/* <p>主要步骤：</p>
        <ol>
          <li>创建WebGL上下文</li>
          <li>编写顶点和片段着色器</li>
          <li>创建着色器程序</li>
          <li>创建顶点数据</li>
          <li>创建缓冲区并绑定数据</li>
          <li>设置视口和清除画布</li>
          <li>绘制三角形</li>
        </ol> */}
      </div>
    </div>
  );
};

export default TriangleRendering;