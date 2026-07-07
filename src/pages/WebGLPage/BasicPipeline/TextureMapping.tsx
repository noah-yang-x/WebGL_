import { useEffect, useRef } from 'react';

const TextureMapping: React.FC = () => {
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
      attribute vec2 a_texcoord;
      varying vec2 v_texcoord;
      void main() {
        gl_Position = a_position;
        v_texcoord = a_texcoord;
      }
    `;

    // 片段着色器
    const fragmentShaderSource = `
      precision mediump float;
      varying vec2 v_texcoord;
      uniform sampler2D u_texture;
      void main() {
        gl_FragColor = texture2D(u_texture, v_texcoord);
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
      -0.5, -0.5,  // 左下角
       0.5, -0.5,  // 右下角
       0.5,  0.5,  // 右上角
      -0.5,  0.5   // 左上角
    ]);

    const texcoords = new Float32Array([
      0.0, 0.0,  // 左下角
      1.0, 0.0,  // 右下角
      1.0, 1.0,  // 右上角
      0.0, 1.0   // 左上角
    ]);

    const indices = new Uint16Array([
      0, 1, 2,  // 第一个三角形
      0, 2, 3   // 第二个三角形
    ]);

    // 创建缓冲区
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // 创建纹理
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // 创建一个2x2像素的纹理
    const pixels = new Uint8Array([
      255, 0, 0, 255,    // 红色
      0, 255, 0, 255,    // 绿色
      0, 0, 255, 255,    // 蓝色
      255, 255, 0, 255   // 黄色
    ]);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // 获取属性位置
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const texcoordAttributeLocation = gl.getAttribLocation(program, 'a_texcoord');

    // 设置视口
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 绘制矩形
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.enableVertexAttribArray(texcoordAttributeLocation);
    gl.vertexAttribPointer(texcoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // 清理
    return () => {
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(texcoordBuffer);
      gl.deleteBuffer(indexBuffer);
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <div className="demo-container w-screen h-screen">
      <canvas ref={canvasRef} className="w-full h-full" width={400} height={400} />
      <div className="fixed bottom-0 left-0 p-4">
        {/* <p>这个demo展示了WebGL中的纹理映射效果。我们创建了一个2x2像素的纹理，并将其映射到一个矩形上。</p> */}
      </div>
    </div>
  );
};

export default TextureMapping;