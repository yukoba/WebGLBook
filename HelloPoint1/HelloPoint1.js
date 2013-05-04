var vshader_src =
        'void main() {\n\
          gl_Position = vec4(-0.5, 0, 0, 1);\n\
          gl_PointSize = 10.0;\n\
        }';

var fshader_src =
        'void main() {\n\
            gl_FragColor = vec4(1, 0, 0, 1);\n\
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


    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, 1);
}
