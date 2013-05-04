var vshader_src =
        'attribute vec4 a_Position;\n\
        attribute float a_PointSize;\n\
        void main() {\n\
          gl_Position = a_Position;\n\
          gl_PointSize = a_PointSize;\n\
        }';

var fshader_src =
        'precision mediump float;\n\
        uniform vec4 u_FragColor;\n\
        void main() {\n\
            gl_FragColor = u_FragColor;\n\
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

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        alert("Failed to get a_Position");
        return;
    }
    var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

    //gl.vertexAttrib2f(a_Position, 0, -0.5);
    gl.vertexAttrib2fv(a_Position, new Float32Array([-0.5, -0.5]));
    gl.vertexAttrib1f(a_PointSize, 100);
    gl.uniform4f(u_FragColor, 0, 0, 1, 1);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, 1);
}
