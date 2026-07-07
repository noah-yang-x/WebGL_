import { useEffect, useRef } from 'react';

const TransformMatrix: React.FC = () => {
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
      attribute vec4 a_position;
      uniform mat4 u_matrix;
      void main() {
        gl_Position = u_matrix * a_position;
      }
    `;

    // 片段着色器
    const fragmentShaderSource = `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
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
      -0.1, -0.1,  // 左下角
       0.1, -0.1,  // 右下角
       0.0,  0.1   // 顶部
    ]);

    // 创建缓冲区
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // 获取属性位置
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const matrixLocation = gl.getUniformLocation(program, 'u_matrix');

    // 设置视口
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    let angle = 0;
    let translationX = 0;
    let translationY = 0;
    let scale = 1;

    function draw() {
      if (!gl) return;

      gl.clear(gl.COLOR_BUFFER_BIT);

      // 创建变换矩阵
      const matrix = new Float32Array(16);

      // 缩放
      matrix[0] = scale;
      matrix[1] = 0;
      matrix[2] = 0;
      matrix[3] = 0;
      matrix[4] = 0;
      matrix[5] = scale;
      matrix[6] = 0;
      matrix[7] = 0;
      matrix[8] = 0;
      matrix[9] = 0;
      matrix[10] = 1;
      matrix[11] = 0;
      matrix[12] = translationX;
      matrix[13] = translationY;
      matrix[14] = 0;
      matrix[15] = 1;

      // 旋转
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const rotationMatrix = new Float32Array([
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);

      // 组合变换
      const finalMatrix = new Float32Array(16);
      for (let i = 0; i < 16; i++) {
        finalMatrix[i] = matrix[i] * rotationMatrix[i];
      }

      // 设置变换矩阵
      gl.uniformMatrix4fv(matrixLocation, false, finalMatrix);

      // 绘制三角形
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // 更新动画参数
      angle += 0.01;
      translationX = Math.sin(angle) * 0.5;
      translationY = Math.cos(angle) * 0.5;
      scale = 1 + Math.sin(angle) * 0.5;

      requestAnimationFrame(draw);
    }

    draw();

    // 清理
    return () => {
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <div className="demo-container w-screen h-screen">
      <canvas ref={canvasRef} className="w-full h-full" width={400} height={400} />
      <div className="fixed bottom-0 left-0 p-4">
        {/* <p>这个demo展示了WebGL中的变换矩阵效果。三角形会进行旋转、平移和缩放变换。</p> */}
      </div>
    </div>

  );
};

export default TransformMatrix;
