class GameBlock extends Node
{
    falling;

    constructor(px, py, shape, parent, scale)
    {
        super(px, py, [CreateBorder(), CreateCenter(shape)], parent, scale);
        this.falling = false;
    }
}

function CreateBorder()
{
    var border = new Shape([vec2(-0.08, 0.06), vec2(0.08, 0.06), vec2(0.08, -0.06), vec2(-0.08, -0.06)], [1.0, 1.0, 1.0, 1.0], gl.createBuffer(), gl.LINE_LOOP)
    return border;
}

function CreateCenter(t)
{   
    var center;

    if (t == "square" || t == 0)
    {
        center = new Shape([vec2(-0.025, -0.025), vec2(-0.025, 0.025), vec2(0.025, 0.025), vec2(0.025, -0.025)], [1.0, 0.0, 0.0, 1.0], gl.createBuffer(), gl.TRIANGLE_FAN);
    }
    else if (t == "circle" || t == 1)
    {
        var points = [];
        var radius = 0.025;

        for (let i = 0; i < 10; i++)
        {
            points.push(vec2( Math.sin(i* Math.PI/5)*radius, Math.cos(i * Math.PI/5)*radius ));
        }

        center = new Shape(points, [0.0, 0.5, 1.0, 1.0], gl.createBuffer(), gl.TRIANGLE_FAN);
    }
    else if (t == "triangle" || t == 2)
    {
        center = new Shape([vec2(-0.025, -0.025), vec2(0.025, -0.025), vec2(0.0, 0.025)], [0.0, 1.0, 0.0, 1.0], gl.createBuffer(), gl.TRIANGLE_FAN);
    }
    else if (t == "diamond" || t == 3)
    {
        center = new Shape([vec2(0.0, 0.025), vec2(0.025, 0.0), vec2(0.0, -0.025), vec2(-0.025, 0.0)], [1.0, 1.0, 0.0, 1.0], gl.createBuffer(), gl.TRIANGLE_FAN);
    }

    return center;
}