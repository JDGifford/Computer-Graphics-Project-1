//Including Game logic in this file to make things easier to read

class Node
{
    constructor(px, py, shape, parent, scale)
    { 
        this.position = vec3(px, py, 1.0);
        this.shape = shape;
        this.parent = parent;    

        if (Array.isArray(shape))
        {
            this.shape = shape;
        }
        else
        {
            this.shape = [shape];
        }

        if (scale === undefined)
        {
            this.scale = [1.0, 1.0];
        }
        else
        {
            this.scale = scale;
        }
    }

    getTransformMatrix()
    {
        return mat3(this.scale[0],
                    0.0,
                    0.0,

                    0.0,
                    this.scale[1],
                    0.0,

                    this.position[0],
                    this.position[1],
                    1.0);
    }
    
    hasShape()
    {
        if (this.shape[0] == null)
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

    setScale(value)
    {
        this.scale = value;
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
    player;

    selectorLocation = 1;

    constructor()
    {
        this.objectList = [];
        this.columnSize = 8;
        this.columnBases = [];
        this.animations = [];
        this.selectorLocation = 1;
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
        var border = this.addObject(new Node(0.0, 0.0, new Shape([vec2(-0.5, 0.7), vec2(0.5, 0.7), vec2(0.5, -0.9), vec2(-0.5, -0.9)], [1.0, 1.0, 1.0, 1.0], gl.createBuffer(), gl.LINE_LOOP), this.getSceneRoot()));
        this.addObject(new Node(0.0, 0.0, new Shape([vec2(-0.5, 0.7), vec2(0.5, 0.7), vec2(0.5, 0.9), vec2(-0.5, 0.9)], [1.0, 1.0, 1.0, 1.0], gl.createBuffer(), gl.LINE_LOOP), this.getSceneRoot()));

        // draw the column platforms
        this.columnBases.push(this.addObject(new Node(-0.3, -0.65, new Shape([vec2(-0.08, 0.0), vec2(0.08, 0.0)], [1.0, 0.0, 0.0, 1.0], gl.createBuffer(), gl.LINE_STRIP), border)));
        this.columnBases.push(this.addObject(new Node(-0.1, -0.65, new Shape([vec2(-0.08, 0.0), vec2(0.08, 0.0)], [0.0, 1.0, 0.0, 1.0], gl.createBuffer(), gl.LINE_STRIP), border)));
        this.columnBases.push(this.addObject(new Node( 0.1, -0.65, new Shape([vec2(-0.08, 0.0), vec2(0.08, 0.0)], [0.0, 0.5, 1.0, 1.0], gl.createBuffer(), gl.LINE_STRIP), border)));
        this.columnBases.push(this.addObject(new Node( 0.3, -0.65, new Shape([vec2(-0.08, 0.0), vec2(0.08, 0.0)], [1.0, 1.0, 0.0, 1.0], gl.createBuffer(), gl.LINE_STRIP), border)));

        this.player = this.addObject(new Node(0.0, -0.75, new Shape([vec2(-0.1, 0.1), vec2(-0.1, 0.05), vec2(0.0, 0.0), vec2(0.1, 0.05), vec2(0.1, 0.1),], [1.0, 1.0, 1.0, 1.0], gl.createBuffer(), gl.LINE_STRIP), border));

        this.columnAnimations = [];

        var c = this.addObject(new Node(0.0, 0.2, [CreateBorder(), CreateCenter("circle")], border));
        //his.Columns = [[],[],[],[]];
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
    }

    swapColumns()
    {
        this.animations.push(new swapAnimation(this.columnBases[this.selectorLocation], this.columnBases[this.selectorLocation + 1], 200.0));
        var hold = this.columnBases[this.selectorLocation];
        this.columnBases[this.selectorLocation] = this.columnBases[this.selectorLocation + 1];
        this.columnBases[this.selectorLocation + 1] = hold;

        this.animations.push(new flipX(this.player, 200.0));

        //swap all the blocks in the columns too
    }

    selectColumns(direction)
    {
        this.selectorLocation += direction;


        if (this.selectorLocation > 2)
        {
            this.selectorLocation = 2;
        }
        else if (this.selectorLocation < 0)
        {
            this.selectorLocation = 0;
        }
        else
        {
            this.player.moveNode(direction * 0.2, 0.0);
        }
    }
}


