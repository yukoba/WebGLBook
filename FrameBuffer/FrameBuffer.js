var vshader_tex_src =
        'attribute vec4 a_Position;\n\
        attribute vec2 a_TexCoord;\n\
        varying vec2 v_TexCoord;\
        void main() {\n\
          gl_Position = a_Position;\n\
          v_TexCoord = a_TexCoord;\n\
        }';

var fshader_tex_src =
        'precision mediump float;\n\
        uniform sampler2D u_Sampler;\n\
        varying vec2 v_TexCoord;\n\
        void main() {\n\
            gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n\
        }';

var vshader_solid_src =
        'attribute vec4 a_Position;\n\
        void main() {\n\
          gl_Position = a_Position;\n\
        }';

var fshader_solid_src =
        'precision mediump float;\n\
        uniform vec4 u_FragColor;\n\
        void main() {\n\
            gl_FragColor = u_FragColor;\n\
        }';

var solidProgram, texProgram;
var frameBuffer;

function main() {
    var canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas, true);
    if (!gl) {
        alert("Failed at getWebGLContext");
        return;
    }

    solidProgram = createProgram(gl, vshader_solid_src, fshader_solid_src);
    texProgram = createProgram(gl, vshader_tex_src, fshader_tex_src);

    frameBuffer = initFramebuffer(gl);
    var n = initVertexBuffers(gl);
    initTextures(gl, n);
}

function initFramebuffer(gl) {
    var frameBuffer = gl.createFramebuffer();

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 400, 400, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    frameBuffer.texture = texture;

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (e != gl.FRAMEBUFFER_COMPLETE) {
        alert("Failed at checkFramebufferStatus");
        throw "Failed at checkFramebufferStatus";
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return frameBuffer;
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

    var a_Position = gl.getAttribLocation(texProgram, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_TexCoord = gl.getAttribLocation(texProgram, 'a_TexCoord');
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);

    return n;
}

function initTextures(gl, n) {
    var texture = gl.createTexture();

    var u_Sampler = gl.getUniformLocation(texProgram, 'u_Sampler');
    texProgram.u_Sampler = u_Sampler;
    var img = new Image();
    img.onload = function() {
        loadTexture(gl, n, texture, u_Sampler, img);
    };
    img.src = "../resource/sky.jpg";

    return true;
}

function loadTexture(gl, n, texture, u_Sampler, img) {
    gl.useProgram(texProgram);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // この2つを指定すると non-power-of-2 が可能になる
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.uniform1i(u_Sampler, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.deleteTexture(texture);

    drawLine(gl);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    drawTotal(gl);
}

function drawLine(gl) {
    gl.useProgram(solidProgram);

    var a_Position = gl.getAttribLocation(solidProgram, 'a_Position');
    if (a_Position < 0) {
        alert("Failed to get a_Position");
        return;
    }
    var u_FragColor = gl.getUniformLocation(solidProgram, 'u_FragColor');

    var vertices = new Float32Array([
        0.5, 0.2, 0.3, -0.2, 0.7, -0.2
    ]);
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.uniform4f(u_FragColor, 1, 0, 0, 0.1);

    gl.drawArrays(gl.LINE_LOOP, 0, 3);

    gl.deleteBuffer(vertexBuffer);
}

function drawTotal(gl) {
    var vertices = new Float32Array([
        -1, 0.9, 0.0, 1.0,
        -1, -1, 0.0, 0.0,
        0.9, 0.9, 1.0, 1.0,
        0.9, -1, 1.0, 0.0
    ]);

    var FSIZE = vertices.BYTES_PER_ELEMENT;
    var n = 4;

    var vertexTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(texProgram, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_TexCoord = gl.getAttribLocation(texProgram, 'a_TexCoord');
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);

    // -----------------------------

    gl.useProgram(texProgram);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, frameBuffer.texture);
    gl.uniform1i(texProgram.u_Sampler, 0);
    gl.clearColor(1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    gl.bindTexture(gl.TEXTURE_2D, null);
}
