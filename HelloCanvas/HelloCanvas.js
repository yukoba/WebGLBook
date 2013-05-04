function main() {
    var canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas, true);
    if (!gl) {
        alert("Failed at getWebGLContext");
        return;
    }

    gl.clearColor(0, 1, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
}
