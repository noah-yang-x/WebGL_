import React, { useEffect, useRef } from 'react';

const vertexShaderSource = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;
attribute vec3 aTangent;
attribute vec3 aNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTexCoord;
varying vec3 vFragPos;
varying mat3 vTBN;

void main() {
    vec3 T = normalize(aTangent);
    vec3 N = normalize(aNormal);
    vec3 B = normalize(cross(N, T));
    vTBN = mat3(T, B, N);

    vec4 fragPos = uModelViewMatrix * vec4(aPosition, 1.0);
    vFragPos = fragPos.xyz;

    vTexCoord = aTexCoord;
    gl_Position = uProjectionMatrix * fragPos;
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform sampler2D uDiffuseMap;
uniform sampler2D uNormalMap;
uniform vec3 uLightPos;

varying vec2 vTexCoord;
varying vec3 vFragPos;
varying mat3 vTBN;

void main() {
    vec3 normal = texture2D(uNormalMap, vTexCoord).rgb;
    normal = normalize(normal * 2.0 - 1.0); // 从 [0,1] 转换为 [-1,1]
    normal = normalize(vTBN * normal);

    vec3 lightDir = normalize(uLightPos - vFragPos);
    float diff = max(dot(normal, lightDir), 0.0);

    vec3 color = texture2D(uDiffuseMap, vTexCoord).rgb;
    gl_FragColor = vec4(diff * color, 1.0);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource)!;
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource)!;

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return null;
    }

    return program;
}


const NormalMapping: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

    // 初始化着色器
    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!program) return;

    gl.useProgram(program);

    // 顶点数据（正方形）
    const positions = new Float32Array([
        -1, -1, 0,
         1, -1, 0,
         1,  1, 0,
        -1,  1, 0,
    ]);
    const texCoords = new Float32Array([
        0, 0,
        1, 0,
        1, 1,
        0, 1,
    ]);
    const indices = new Uint16Array([
        0, 1, 2,
        2, 3, 0,
    ]);
    const normals = new Float32Array([
        0, 0, 1, 0, 0, 1,
        0, 0, 1, 0, 0, 1,
    ]);
    const tangents = new Float32Array([
        1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0,
    ]);

    // 创建缓冲区并绑定数据（示例只写位置/贴图坐标，实际应完整）
    const buffer = (data: BufferSource, attrib: number, size: number) => {
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attrib, size, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attrib);
    };

    // 设置属性位置
    const aPosition = gl.getAttribLocation(program, "aPosition");
    const aTexCoord = gl.getAttribLocation(program, "aTexCoord");
    const aNormal = gl.getAttribLocation(program, "aNormal");
    const aTangent = gl.getAttribLocation(program, "aTangent");

    buffer(positions, aPosition, 3);
    buffer(texCoords, aTexCoord, 2);
    buffer(normals, aNormal, 3);
    buffer(tangents, aTangent, 3);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // 设置uniform
    const uLightPos = gl.getUniformLocation(program, "uLightPos");
    gl.uniform3fv(uLightPos, [1.0, 1.0, 2.0]);

    // 加载纹理贴图（示意，建议用 async/await 加载图片）
    const loadTexture = (src: string) => {
        const texture = gl.createTexture()!;
        const image = new Image();
        image.src = src;
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        };
        return texture;
    };

    // loadTexture("/diffuse.jpg"); // 需自己提供
    // loadTexture("/normal.jpg");
    loadTexture(`${import.meta.env.BASE_URL}textures/Metal053C_1K-JPG/Metal053C_1K-JPG_Color.jpg`); // 需自己提供
    loadTexture(`${import.meta.env.BASE_URL}textures/Metal053C_1K-JPG/Metal053C_1K-JPG_NormalGL.jpg`);

    // 清屏并绘制
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }, []);

  return (
    <div className="demo-container">
      <canvas ref={canvasRef}
        width={512}
        height={512}
        style={{ border: '1px solid #ccc' }}
      />
      <h2>法线贴图</h2>
      <p>这个demo展示了WebGL中的法线贴图。我们创建了一个简单的平面，
      使用法线贴图来模拟表面细节，并通过光照来展示效果。</p>
    </div>
  );
};

export default NormalMapping;
