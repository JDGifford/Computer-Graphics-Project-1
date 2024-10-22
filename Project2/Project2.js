var gl;
var shaderProgramSquare;
var thetaJS;
var MJS;
var MUniform;
var colorUniform;

var drawList;
var bufferList;
var drawOffset;

var myPositionAttribute;
var game;

function init() {
    // Set up the canvas
    var canvas=document.getElementById("gl-canvas");
    gl=WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert( "WebGL is not available" ); }
    
    // Set up the viewport
    gl.viewport( 0, 0, 768, 768 );   // x, y, width, height
    
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

    colorUniform = gl.getUniformLocation( shaderProgram, "color");
    gl.uniform4fv(colorUniform, [1.0, 1.0, 1.0, 1.0] );

    

    drawList = [];
    drawOffset = 0.0;
    SceneRoot = new Node(0.0, 0.0, null, null, 1.0);

    game = new Game();
    game.addObject(SceneRoot);

    game.gameSetup();
    
    
    requestAnimationFrame( render );
}

function moveOrigin(event)
{
    if (event.key == "w")
    {
        SceneRoot.moveNode(0.0, 0.05);
    }
    if (event.key == "s")
    {
        SceneRoot.moveNode(0.0, -0.05);
    }
    if (event.key == "a")
    {
        SceneRoot.moveNode(-0.05, 0.0);
    }
    if (event.key == "d")
    {
        SceneRoot.moveNode(0.05, 0.0);
    }
}
function createNewObjects(event)
{
    game.addObject(addSquare(2.0 * (event.clientX/768.0) - 1.0 - SceneRoot.position[0], -(2.0 * (event.clientY/768.0) - 1.0 + SceneRoot.position[1]), SceneRoot));
    drawOffset = drawOffset;
}
function ClearScreen()
{
    game.objectList = [game.objectList[0]];
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function addSquare(pX, pY, parent) {

    var p0 = vec2( .02, .02 );
    var p1 = vec2( -.02, .02 );
    var p2 = vec2( -.02, -.02 );
    var p3 = vec2( .02, -.02 );
    var arrayOfPoints = [p0, p1, p2, p3];

    var newBuffer = gl.createBuffer()
    
    var square = new Node(pX, pY, new Shape(arrayOfPoints, [Math.random(), Math.random(), Math.random(), 1.0], newBuffer, gl.TRIANGLE_FAN), parent, 0.5 + Math.random()*2);
    //var square = new Shape(arrayOfPoints, newBuffer);

    return square;
}

function drawObjects(shp)
{
    game.objectList.forEach((ob) => {
        if (ob.hasShape())
        {
            draw(ob);
        }
    });
}

function draw(obj,index)
{ 
    gl.bindBuffer( gl.ARRAY_BUFFER, obj.shape.buffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(obj.shape.points), gl.STATIC_DRAW );

    gl.vertexAttribPointer( myPositionAttribute, 2, gl.FLOAT, false, 0, 0 );

    MJS = convertMat3ToArray(obj.getPosition());;
    gl.uniformMatrix3fv(MUniform, false, MJS);

    gl.uniform4fv(colorUniform, obj.shape.color);

    gl.drawArrays(obj.shape.drawtype, 0, obj.shape.points.length);
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

    game.runAnimations();

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.useProgram(shaderProgram);

    drawObjects(SceneRoot);

    requestAnimationFrame( render );
    
}




function listItems()
{
    var b = game.findChildren(SceneRoot);

    b.forEach(element => {
     console.log(element.parent.getName());   
    });
}

function receiveInput(event)
{
    if (!game.isBusy())
    {
        if (event.key == "x")
        {
            var swapper = new swapAnimation(game.columnBases[0], game.columnBases[1], 1000.0);

            game.animations.push(swapper);

            //game.animations.push
            //var temp = game.columnBases[1].position;
            //game.columnBases[1].position = game.columnBases[0].position;
            //game.columnBases[0].position = temp;
        }
    }
}