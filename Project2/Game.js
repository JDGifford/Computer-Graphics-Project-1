//Including Game logic in this file to make things easier to read

class Node
{
    constructor(px, py, shape, parent, scale)
    { 
        this.position = vec3(px, py, 1.0);
        this.shape = shape;
        this.parent = parent;    
        

        if (scale === undefined)
        {
            this.scale = 1.0;
        }
        else
        {
            this.scale = scale;
        }
    }

    getTransformMatrix()
    {
        return mat3(this.scale,
                    0.0,
                    0.0,

                    0.0,
                    this.scale,
                    0.0,

                    this.position[0],
                    this.position[1],
                    1.0);
    }
    
    hasShape()
    {
        if (this.shape == null)
            return false;
        else
            return true;
    }

    getPosition()
    {
        if (this.parent == null)
        {
            return this.getTransformMatrix();
        }
        else
        {
            return multiplyMat3(this.parent.getPosition(), this.getTransformMatrix());
        }
    }

    moveNode(xDir, yDir)
    {
        this.position[0] += xDir;
        this.position[1] += yDir;
    }

    addParent(parentNode)
    {
        this.parent = parentNode;
    }

    setName(str)
    {
        this.name = str;
    }
    getName()
    {
        if (this.name != null)
        {
            return this.name;
        }
        else
        {
            return "No name given";
        }
    }
}

function Shape(points, color, buffer, drawtype)
{
    this.points = points;
    this.buffer = buffer;
    this.color = color; 
    this.drawtype = drawtype;
}


class Game
{
    columnBases;
    objectList;
    columnSize;
    animations;

    constructor()
    {
        this.objectList = [];
        this.columnSize = 8;
        this.columnBases = [];
        this.animations = [];
    }

    isBusy()
    {
        return this.animations.length > 0;
    }

    addObject(obj)
    {
        this.objectList.push(obj);
        return obj;
    }

    removeObject(obj, list)
    {
        var ind = list.indexOf(obj);

        list.splice(ind, 1);

        /*
        list.forEach((i) => {
            var ind = list.indexOf(obj);
            if (i == obj)
            {
                list.splice(ind, 0);
            }
        })*/
    }

    findChildren(obj)
    {
        var result = [];
        this.objectList.forEach((i) => {
            if (i.parent == obj)
            {
                result.push(i);
            }
        });

        return result;
    }

    getSceneRoot()
    {
        return this.objectList[0];
    }

    gameSetup()
    {
        // Setup UI
        // Draw border
        var border = this.addObject(new Node(0.0, 0.0, new Shape([vec2(-0.5, 0.9), vec2(0.5, 0.9), vec2(0.5, -0.9), vec2(-0.5, -0.9)], [1.0, 1.0, 1.0, 1.0], gl.createBuffer(), gl.LINE_LOOP), this.getSceneRoot(),1))

        // draw the column platforms
        this.columnBases.push(this.addObject(new Node(-0.3, -0.65, new Shape([vec2(-0.08, 0.0), vec2(0.08, 0.0)], [1.0, 0.0, 0.0, 1.0], gl.createBuffer(), gl.LINE_LOOP), border)));
        this.columnBases.push(this.addObject(new Node(-0.1, -0.65, new Shape([vec2(-0.08, 0.0), vec2(0.08, 0.0)], [0.0, 1.0, 0.0, 1.0], gl.createBuffer(), gl.LINE_LOOP), border)));
        this.columnBases.push(this.addObject(new Node( 0.1, -0.65, new Shape([vec2(-0.08, 0.0), vec2(0.08, 0.0)], [0.0, 0.5, 1.0, 1.0], gl.createBuffer(), gl.LINE_LOOP), border)));
        this.columnBases.push(this.addObject(new Node( 0.3, -0.65, new Shape([vec2(-0.08, 0.0), vec2(0.08, 0.0)], [1.0, 1.0, 0.0, 1.0], gl.createBuffer(), gl.LINE_LOOP), border)));

        this.columnAnimations = [];
        //this.Columns = [[],[],[],[]];
    }

    runAnimations()
    {
        this.animations.forEach((a) =>{
            if (a.finished)
            {
                this.removeObject(a, this.animations);
            }
            else
            {
                a.animate();
            }
        })
        console.log(this.animations.length);
    }
}
