var gl;
var shaderProgramSquare;
var thetaJS;
var MJS;
var MUniform;

var drawList;
var bufferList;
var drawOffset;

var myPositionAttribute;

function Shape(points, position, buffer)
{
    this.points = points;
    this.position = position;
    this.buffer = buffer;
}

class node
{
    position = [] 
}

function init() {
    // Set up the canvas
    var canvas=document.getElementById("gl-canvas");
    gl=WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert( "WebGL is not available" ); }
    
    // Set up the viewport
    gl.viewport( 0, 0, 512, 512 );   // x, y, width, height
    
    // Set up the background color
    gl.clearColor( 0.0, 0.0, 0.5, 1.0 );
    
    shaderProgram = initShaders( gl, "vertex-shader",
                                      "fragment-shader" );
    gl.useProgram( shaderProgram );
    
    // Force the WebGL context to clear the color buffer
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    myPositionAttribute = gl.getAttribLocation( shaderProgram, "myPosition" );
    gl.enableVertexAttribArray( myPositionAttribute );
    
    MJS = [1.0,
        0.0,
        0.0,

        0.0,
        1.0,
        0.0,
        
        0.0,
        0.0,
        1.0];
    MUniform = gl.getUniformLocation( shaderProgram, "M" );
    gl.uniformMatrix3fv( MUniform, false, MJS );

    drawList = [];
    drawOffset = -0.8;
    
    //gameLoop()
    //setInterval(gameLoop, 16.667)
    
    requestAnimationFrame( render );
}

function gameLoop()
{
    
}

function createNewObjects(event)
{
    drawList.push(addSquare(2.0 * (event.clientX/512.0) - 1.0, -(2.0 * (event.clientY/512.0) - 1.0)));
    drawOffset = drawOffset + 0.3;
}
function ClearScreen()
{
    drawList = [];
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function addSquare(pX, pY) {

    //var bfr = gl.createBuffer()

    var p0 = vec2( .2, .2 );
    var p1 = vec2( -.2, .2 );
    var p2 = vec2( -.2, -.2 );
    var p3 = vec2( .2, -.2 );
    var arrayOfPoints = [p0, p1, p2, p3];

    var newBuffer = gl.createBuffer()
    
    var square = new Shape(arrayOfPoints, vec2(pX, pY), newBuffer);

    return square;}

function drawObjects()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.useProgram(shaderProgram);
    drawList.forEach(draw);
}
function draw(obj,index)
{ 
    //var newBuffer = gl.createBuffer()
    gl.bindBuffer( gl.ARRAY_BUFFER, obj.buffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(obj.points), gl.STATIC_DRAW );

    gl.vertexAttribPointer( myPositionAttribute, 2, gl.FLOAT, false, 0, 0 );

    MJS = [0.1,
           0.0,
           0.0,

           0.0,
           0.1,
           0.0,

           obj.position[0],
           obj.position[1],
           1.0,
    ];
    gl.uniformMatrix3fv(MUniform, false, MJS);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
}

function stopStartAnim() {
    if ( keepRunning > 0.5 ) {
        keepRunning = 0.0;
    } else {
        keepRunning = 1.0;
    }
}

function render() {
    
    //gl.uniform1f( thetaUniform, thetaJS );
    
    //gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    drawObjects();

    requestAnimationFrame( render );
    
}
