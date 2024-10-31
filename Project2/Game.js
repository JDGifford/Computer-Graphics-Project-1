//Including Game logic in this file to make things easier to read
var swapSpeed = 200.0;

var columnOffsets = [
    vec2(-0.3, -0.58),
    vec2(-0.1, -0.58),
    vec2(0.1, -0.58),
    vec2(0.3, -0.58)
];
var blockGap = 0.13;
var columnMax = 10;

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

    setPosition(place)
    {
        this.position = place;
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
    // Holders for various game pieces
    columnBases;
    objectList;
    columnSize;
    animations;
    columns;
    player;
    onDeck = [];

    //Status
    dropping = false;

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

        //initialized with null values to start with the correct length
        this.columns = [
            [null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null]
        ];

        this.nextOnDeck(2);
    }

tickTimer = 0.0;
tickLimit = 100.0;
tickRate = 1.0;
    update()
    {
        this.tickTimer += this.tickRate;

        if (this.tickTimer > this.tickLimit)
        {
            this.checkFalling();
            if (!this.dropping)
            {
                this.dropNewBlocks();
            }
            else
            {
                this.dropBlocks();
            }
            this.tickTimer = 0;
        }  
    }

    runAnimations()
    {
        this.update();

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
        this.animations.push(new swapAnimation(this.columnBases[this.selectorLocation], this.columnBases[this.selectorLocation + 1], swapSpeed));
        var t = this.columnBases[this.selectorLocation];
        this.columnBases[this.selectorLocation] = this.columnBases[this.selectorLocation + 1];
        this.columnBases[this.selectorLocation + 1] = t;

        // Will need to change this so that empty blocks can swap columns, perhaps by feeding column offsets rather than swaps?
        /*for (let a = 0; a < columnMax; a++)
        {
            if(this.columns[this.selectorLocation][a] != null)
            {
                this.animations.push( new swapLocation(this.columns[this.selectorLocation][a], add(columnOffsets[this.selectorLocation + 1], vec2(0.0, blockGap*a)), swapSpeed));
            }

            if(this.columns[this.selectorLocation+1][a] != null)
            {
               this.animations.push( new swapLocation(this.columns[this.selectorLocation+1][a], add(columnOffsets[this.selectorLocation], vec2(0.0, blockGap*a)), swapSpeed));
            }
        }*/

            
        for (let b = 0; b < 10; b++)
        {
            if(this.columns[this.selectorLocation][b] != null)
            {
                if(this.columns[this.selectorLocation][b].falling)
                {
                    if(this.columns[this.selectorLocation + 1][b] == null)
                    {
                        this.columns[this.selectorLocation + 1][b] = this.columns[this.selectorLocation][b];
                        this.columns[this.selectorLocation][b] = null;
                        this.animations.push( new swapLocation(this.columns[this.selectorLocation][b], add(columnOffsets[this.selectorLocation + 1], vec2(0.0, blockGap*b)), swapSpeed));
                    }
                }
                else
                {
                    var hold = this.columns[this.selectorLocation][b];
                    this.columns[this.selectorLocation][b] = this.columns[this.selectorLocation + 1][b];
                    this.columns[this.selectorLocation + 1] = hold
                    this.animations.push( new swapLocation(this.columns[this.selectorLocation][b], add(columnOffsets[this.selectorLocation + 1], vec2(0.0, blockGap*b)), swapSpeed));
                }
            }

            if(this.columns[this.selectorLocation + 1][b] != null)
            {
                if(this.columns[this.selectorLocation + 1][b].falling)
                {
                    if(this.columns[this.selectorLocation][b] == null)
                    {
                        this.columns[this.selectorLocation][b] = this.columns[this.selectorLocation + 1][b];
                        this.columns[this.selectorLocation + 1][b] = null;
                        this.animations.push( new swapLocation(this.columns[this.selectorLocation + 1][b], add(columnOffsets[this.selectorLocation], vec2(0.0, blockGap*b)), swapSpeed));
                    }
                }
                else
                {
                    var hold = this.columns[this.selectorLocation + 1][b];
                    this.columns[this.selectorLocation + 1][b] = this.columns[this.selectorLocation][b];
                    this.columns[this.selectorLocation] = hold
                    this.animations.push( new swapLocation(this.columns[this.selectorLocation + 1][b], add(columnOffsets[this.selectorLocation], vec2(0.0, blockGap*b)), swapSpeed));
                }
            }
        }

        /*hold = this.columns[this.selectorLocation];
        this.columns[this.selectorLocation] = this.columns[this.selectorLocation + 1];
        this.columns[this.selectorLocation + 1] = hold;*/

        this.animations.push(new flipX(this.player, swapSpeed));

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

    nextOnDeck(count)
    {
        var first = Math.floor(Math.random()*4);
        var second = Math.floor(Math.random()*3);
        var third = Math.floor(Math.random()*2);

        if (second == first)
        {
            second += 1;
        }
        if (third == first)
        {
            third += 1;
        }
        if (third == second)
        {
            third += 1;
        }
        
        this.onDeck.push([first, this.addObject(new GameBlock(columnOffsets[first][0], 0.8, Math.floor(Math.random()*4), this.getSceneRoot()))]);
        this.onDeck.push([second, this.addObject(new GameBlock(columnOffsets[second][0], 0.8, Math.floor(Math.random()*4), this.getSceneRoot()))]);

        if (count > 2)
        {
            this.onDeck.push([third, this.addObject(new GameBlock(columnOffsets[third][0], 0.8, Math.floor(Math.random()*4), this.getSceneRoot()))]);
        }
    }

    dropNewBlocks()
    {
        for( let a = 0; a <= this.onDeck.length; a++)
        {
            var block = this.onDeck.shift();
            this.columns[block[0]][9] = block[1];
            this.columns[block[0]][9].setPosition(vec2(columnOffsets[block[0]][0], columnOffsets[block[0]][1] + blockGap*9));
            this.columns[block[0]][9].falling = true;
        }
        this.dropping = true;

        this.onDeck == [];
        this.nextOnDeck();

    }

    dropBlocks()
    {
        this.columns.forEach((column) =>
        {
            for (let a = 1; a < 10; a++)
            {
                if(column[a] != null)
                {
                    if(column[a-1] == null)
                    {
                        column[a].moveNode(0.0, -blockGap);
                        column[a-1] = column[a];
                        column[a] = null;

                        if (a == 1)
                        {
                            column[a-1].falling = false;
                        }
                    }
                    else if (column[a-1].falling == false)
                    {
                        column[a].falling = false;
                    }
                }
            }
        });
    }

    checkFalling()
    {
        var final = false;
        this.columns.forEach((c) => {
            c.forEach((b) => {
                if (b != null && b.falling == true)
                {
                    final = true;
                }
            });
        });
        this.dropping = final;
    }
}


