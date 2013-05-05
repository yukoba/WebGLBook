/*
 2つの WebGLRenderingContext でのリソース共有。
 http://www.khronos.org/webgl/wiki/SharedResouces

 gl1 でテクスチャをロードして、gl2 で描画。
 失敗してる。

 Chromeでの実装は、これから
 https://code.google.com/p/chromium/issues/detail?id=235718
 */
var vshader_src =
        'attribute vec4 a_Position;\n\
        attribute vec2 a_TexCoord;\n\
        varying vec2 v_TexCoord;\
        void main() {\n\
          gl_Position = a_Position;\n\
          v_TexCoord = a_TexCoord;\n\
        }';

var fshader_src =
        'precision mediump float;\n\
        uniform sampler2D u_Sampler;\n\
        varying vec2 v_TexCoord;\n\
        void main() {\n\
            gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n\
            //gl_FragColor = vec4(1, 0, 0, 1);\n\
        }';

function main() {
    // canvas1
    var canvas1 = document.getElementById("webgl1");
    var gl1 = getWebGLContext(canvas1, true);
    if (!gl1) {
        alert("Failed at getWebGLContext");
        return;
    }
    if (!initShaders(gl1, vshader_src, fshader_src)) {
        alert("Failed at initShaders");
        return;
    }

    // canvas2
    var canvas2 = document.getElementById("webgl2");
    var gl2 = getWebGLContext(canvas2, true);
    initShaders(gl2, vshader_src, fshader_src);

    // 描画
    var n = initVertexBuffers(gl2);
    initTextures(gl1, gl2, n);
}

function initVertexBuffers(gl2) {
    // 頂点座標、テクスチャ座標
    var vertices = new Float32Array([
            -0.5, 0.5, 0.0, 1.0,
            -0.5, -0.5, 0.0, 0.0,
            0.5, 0.5, 1.0, 1.0,
            0.5, -0.5, 1.0, 0.0
    ]);

    var FSIZE = vertices.BYTES_PER_ELEMENT;
    var n = 4;

    var vertexTexCoordBuffer = gl2.createBuffer();
    gl2.bindBuffer(gl2.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl2.bufferData(gl2.ARRAY_BUFFER, vertices, gl2.STATIC_DRAW);

    var a_Position = gl2.getAttribLocation(gl2.program, 'a_Position');
    gl2.vertexAttribPointer(a_Position, 2, gl2.FLOAT, false, FSIZE * 4, 0);
    gl2.enableVertexAttribArray(a_Position);

    var a_TexCoord = gl2.getAttribLocation(gl2.program, 'a_TexCoord');
    gl2.vertexAttribPointer(a_TexCoord, 2, gl2.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl2.enableVertexAttribArray(a_TexCoord);

    return n;
}

function initTextures(gl1, gl2, n) {
    var texture = gl1.createTexture();

    var u_Sampler = gl2.getUniformLocation(gl2.program, 'u_Sampler');
    var img = new Image();
    img.onload = function() {
        loadTexture(gl1, gl2, n, texture, u_Sampler, img);
    };
    img.src = "../resource/sky.jpg";

    return true;
}

function loadTexture(gl1, gl2, n, texture, u_Sampler, img) {
    gl1.pixelStorei(gl1.UNPACK_FLIP_Y_WEBGL, 1);

    gl1.activeTexture(gl1.TEXTURE0);
    gl1.bindTexture(gl1.TEXTURE_2D, texture);
    gl1.texParameteri(gl1.TEXTURE_2D, gl1.TEXTURE_MIN_FILTER, gl1.LINEAR);
    // この2つを指定すると non-power-of-2 が可能になる
    gl1.texParameteri(gl1.TEXTURE_2D, gl1.TEXTURE_WRAP_S, gl1.CLAMP_TO_EDGE);
    gl1.texParameteri(gl1.TEXTURE_2D, gl1.TEXTURE_WRAP_T, gl1.CLAMP_TO_EDGE);
    gl1.texImage2D(gl1.TEXTURE_2D, 0, gl1.RGB, gl1.RGB, gl1.UNSIGNED_BYTE, img);

    gl2.activeTexture(gl2.TEXTURE0);
    gl2.bindTexture(gl2.TEXTURE_2D, texture);
    gl2.uniform1i(u_Sampler, 0);

    gl2.clearColor(0, 0, 0, 1);
    gl2.clear(gl2.COLOR_BUFFER_BIT);
    gl2.drawArrays(gl2.TRIANGLE_STRIP, 0, n);
}
