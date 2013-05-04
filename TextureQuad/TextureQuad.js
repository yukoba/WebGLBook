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
    var canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas, true);
    if (!gl) {
        alert("Failed at getWebGLContext");
        return;
    }

    if (!initShaders(gl, vshader_src, fshader_src)) {
        alert("Failed at initShaders");
        return;
    }

    var n = initVertexBuffers(gl);
    initTextures(gl, n);
}

function initVertexBuffers(gl) {
    // 頂点座標、テクスチャ座標
//    var vertices = new Float32Array([
//            -0.5, 0.5, 0.0, 1.0,
//            -0.5, -0.5, 0.0, 0.0,
//            0.5, 0.5, 1.0, 1.0,
//            0.5, -0.5, 1.0, 0.0
//    ]);

    // 左右反転
//    var vertices = new Float32Array([
//            0.5, 0.5, 0.0, 1.0,
//            0.5, -0.5, 0.0, 0.0,
//            -0.5, 0.5, 1.0, 1.0,
//            -0.5, -0.5, 1.0, 0.0
//    ]);

    // 90度回転
    var vertices = new Float32Array([
        0.5, 0.5, 0.0, 1.0,
        -0.5, 0.5, 0.0, 0.0,
        0.5, -0.5, 1.0, 1.0,
        -0.5, -0.5, 1.0, 0.0
    ]);

    var FSIZE = vertices.BYTES_PER_ELEMENT;
    var n = 4;

    var vertexTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);

    return n;
}

function initTextures(gl, n) {
    var texture = gl.createTexture();

    var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    var img = new Image();
    img.onload = function() {
        loadTexture(gl, n, texture, u_Sampler, img);
    };
    img.src = "../resource/sky.jpg";

    return true;
}

function loadTexture(gl, n, texture, u_Sampler, img) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // この2つを指定すると non-power-of-2 が可能になる
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.uniform1i(u_Sampler, 0);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}
