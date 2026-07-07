import React, { useEffect, useRef } from "react";

const WebGLGaussianBlur: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 设置画布大小
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize WebGL context
    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL is not supported on this browser.");
      return;
    }

    // 创建帧缓冲区
    const createFramebuffer = (width: number, height: number) => {
      const framebuffer = gl.createFramebuffer();
      const texture = gl.createTexture();

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

      return { framebuffer, texture };
    };

    // 顶点着色器
    const vertexShaderSource = `
      attribute vec2 aPosition;
      attribute vec2 aTexCoord;
      varying vec2 vTexCoord;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
        vTexCoord = aTexCoord;
      }
    `;

    // 片段着色器 - 水平模糊
    const horizontalBlurShaderSource = `
      precision highp float;
      varying vec2 vTexCoord;
      uniform sampler2D uTexture;
      uniform vec2 uResolution;
      uniform float uBlurSize;

      void main() {
        vec4 color = vec4(0.0);
        float total = 0.0;

        // 高斯核权重
        float weight0 = 0.227027;
        float weight1 = 0.1945946;
        float weight2 = 0.1216216;
        float weight3 = 0.054054;
        float weight4 = 0.016216;

        // 中心点
        color += texture2D(uTexture, vTexCoord) * weight0;
        total += weight0;

        // 左右各4个采样点
        for(int i = 1; i <= 4; i++) {
          float weight = i == 1 ? weight1 : (i == 2 ? weight2 : (i == 3 ? weight3 : weight4));
          vec2 offset = vec2(float(i) * uBlurSize / uResolution.x, 0.0);
          color += texture2D(uTexture, vTexCoord + offset) * weight;
          color += texture2D(uTexture, vTexCoord - offset) * weight;
          total += weight * 2.0;
        }

        gl_FragColor = color / total;
      }
    `;

    // 片段着色器 - 垂直模糊
    const verticalBlurShaderSource = `
      precision highp float;
      varying vec2 vTexCoord;
      uniform sampler2D uTexture;
      uniform vec2 uResolution;
      uniform float uBlurSize;

      void main() {
        vec4 color = vec4(0.0);
        float total = 0.0;

        // 高斯核权重
        float weight0 = 0.227027;
        float weight1 = 0.1945946;
        float weight2 = 0.1216216;
        float weight3 = 0.054054;
        float weight4 = 0.016216;

        // 中心点
        color += texture2D(uTexture, vTexCoord) * weight0;
        total += weight0;

        // 上下各4个采样点
        for(int i = 1; i <= 4; i++) {
          float weight = i == 1 ? weight1 : (i == 2 ? weight2 : (i == 3 ? weight3 : weight4));
          vec2 offset = vec2(0.0, float(i) * uBlurSize / uResolution.y);
          color += texture2D(uTexture, vTexCoord + offset) * weight;
          color += texture2D(uTexture, vTexCoord - offset) * weight;
          total += weight * 2.0;
        }

        gl_FragColor = color / total;
      }
    `;

    // 编译着色器
    const compileShader = (source: string, type: GLenum): WebGLShader => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Failed to compile shader: ${error}`);
      }
      return shader;
    };

    // 创建着色器程序
    const createProgram = (vertexSource: string, fragmentSource: string) => {
      const vertexShader = compileShader(vertexSource, gl.VERTEX_SHADER);
      const fragmentShader = compileShader(fragmentSource, gl.FRAGMENT_SHADER);

      const program = gl.createProgram()!;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(`Failed to link program: ${error}`);
      }

      return program;
    };

    // 创建两个着色器程序
    const horizontalBlurProgram = createProgram(vertexShaderSource, horizontalBlurShaderSource);
    const verticalBlurProgram = createProgram(vertexShaderSource, verticalBlurShaderSource);

    // 创建帧缓冲区
    const { framebuffer, texture } = createFramebuffer(canvas.width, canvas.height);

    // 定义顶点和纹理坐标
    const vertices = new Float32Array([
      -1.0, -1.0, 0.0, 0.0,
       1.0, -1.0, 1.0, 0.0,
      -1.0,  1.0, 0.0, 1.0,
       1.0,  1.0, 1.0, 1.0
    ]);

    // 创建缓冲区
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // 设置属性
    const setupAttributes = (program: WebGLProgram) => {
      const aPosition = gl.getAttribLocation(program, "aPosition");
      const aTexCoord = gl.getAttribLocation(program, "aTexCoord");

      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 16, 0);
      gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 16, 8);

      gl.enableVertexAttribArray(aPosition);
      gl.enableVertexAttribArray(aTexCoord);
    };

    // 设置统一变量
    const setupUniforms = (program: WebGLProgram) => {
      const uResolution = gl.getUniformLocation(program, "uResolution");
      const uBlurSize = gl.getUniformLocation(program, "uBlurSize");

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uBlurSize, 5.0); // 模糊大小
    };

    // 渲染函数
    const render = () => {
      // 第一遍：水平模糊
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.viewport(0, 0, canvas.width, canvas.height);

      gl.useProgram(horizontalBlurProgram);
      setupAttributes(horizontalBlurProgram);
      setupUniforms(horizontalBlurProgram);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // 第二遍：垂直模糊
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);

      gl.useProgram(verticalBlurProgram);
      setupAttributes(verticalBlurProgram);
      setupUniforms(verticalBlurProgram);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(gl.getUniformLocation(verticalBlurProgram, "uTexture"), 0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      requestAnimationFrame(render);
    };

    // 开始渲染
    render();

    // 清理
    return () => {
      gl.deleteProgram(horizontalBlurProgram);
      gl.deleteProgram(verticalBlurProgram);
      gl.deleteFramebuffer(framebuffer);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default WebGLGaussianBlur;