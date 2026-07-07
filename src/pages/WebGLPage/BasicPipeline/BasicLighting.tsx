import { useEffect, useRef } from 'react';

const BasicLighting: React.FC = () => {
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
      attribute vec3 a_normal;

      uniform mat4 u_matrix;
      uniform mat4 u_normalMatrix;
      uniform vec3 u_lightDirection;

      varying float v_lighting;
      void main() {
        gl_Position = u_matrix * a_position;
        vec3 normal = normalize((u_normalMatrix * vec4(a_normal, 0.0)).xyz);
        v_lighting = max(dot(normal, u_lightDirection), 0.0);
      }
    `;

    // 片段着色器
    const fragmentShaderSource = `
      precision mediump float;
      varying float v_lighting;
      void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0) * v_lighting;
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

    // 创建顶点数据（立方体）
    const positions = new Float32Array([
      // 前面
      -0.5, -0.5,  0.5,
       0.5, -0.5,  0.5,
       0.5,  0.5,  0.5,
      -0.5,  0.5,  0.5,
      // 后面
      -0.5, -0.5, -0.5,
       0.5, -0.5, -0.5,
       0.5,  0.5, -0.5,
      -0.5,  0.5, -0.5,
    ]);

    const normals = new Float32Array([
      // 前面
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
      // 后面
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
    ]);

    const indices = new Uint16Array([
      // 前面
      0, 1, 2, 0, 2, 3,
      // 后面
      4, 5, 6, 4, 6, 7,
    ]);

    // 创建缓冲区
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // 获取属性位置
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const normalAttributeLocation = gl.getAttribLocation(program, 'a_normal');
    const matrixLocation = gl.getUniformLocation(program, 'u_matrix');
    const normalMatrixLocation = gl.getUniformLocation(program, 'u_normalMatrix');
    const lightDirectionLocation = gl.getUniformLocation(program, 'u_lightDirection');

    // 设置视口
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    let angle = 0;

    function draw() {
      if (!gl) return;

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // 创建变换矩阵
      const matrix = new Float32Array(16);
      const c = Math.cos(angle);
      const s = Math.sin(angle);

      // 旋转矩阵
      matrix[0] = c;
      matrix[1] = 0;
      matrix[2] = s;
      matrix[3] = 0;
      matrix[4] = 0;
      matrix[5] = 1;
      matrix[6] = 0;
      matrix[7] = 0;
      matrix[8] = -s;
      matrix[9] = 0;
      matrix[10] = c;
      matrix[11] = 0;
      matrix[12] = 0;
      matrix[13] = 0;
      matrix[14] = 0;
      matrix[15] = 1;

      // 设置变换矩阵
      gl.uniformMatrix4fv(matrixLocation, false, matrix);
      gl.uniformMatrix4fv(normalMatrixLocation, false, matrix);

      // 设置光照方向
      gl.uniform3f(lightDirectionLocation, 0.5, 0.7, 1.0);

      // 绘制立方体
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.enableVertexAttribArray(normalAttributeLocation);
      gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

      gl.drawElements(gl.TRIANGLES, 12, gl.UNSIGNED_SHORT, 0);

      // 更新角度
      angle += 0.01;
      requestAnimationFrame(draw);
    }

    draw();

    // 清理
    return () => {
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(normalBuffer);
      gl.deleteBuffer(indexBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <div className="demo-container w-screen h-screen" >
      <canvas ref={canvasRef} className="w-full h-full" width={400} height={400} />
      <div className="fixed bottom-0 left-0 p-4">
        {/* <p>这个demo展示了WebGL中的基础光照效果。立方体会旋转，并受到来自右上方的光照影响。</p> */}
      </div>
    </div>
  );
};

export default BasicLighting;
