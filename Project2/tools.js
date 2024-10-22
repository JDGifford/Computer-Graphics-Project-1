function multiplyMat3(a, b) {
    const result = mat3(
      a[0][0] * b[0][0] + a[0][1] * b[1][0] + a[0][2] * b[2][0],
      a[0][0] * b[0][1] + a[0][1] * b[1][1] + a[0][2] * b[2][1],
      a[0][0] * b[0][2] + a[0][1] * b[1][2] + a[0][2] * b[2][2],
  
      a[1][0] * b[0][0] + a[1][1] * b[1][0] + a[1][2] * b[2][0],
      a[1][0] * b[0][1] + a[1][1] * b[1][1] + a[1][2] * b[2][1],
      a[1][0] * b[0][2] + a[1][1] * b[1][2] + a[1][2] * b[2][2],
  
      a[2][0] * b[0][0] + a[2][1] * b[1][0] + a[2][2] * b[2][0],
      a[2][0] * b[0][1] + a[2][1] * b[1][1] + a[2][2] * b[2][1],
      a[2][0] * b[0][2] + a[2][1] * b[1][2] + a[2][2] * b[2][2],
    );
  
    return result;
  }

  function convertMat3ToArray(a)
  {
    const result = [a[0][0], a[0][1], a[0][2], 
                    a[1][0], a[1][1], a[1][2], 
                    a[2][0], a[2][1], a[2][2] ];

    return result;
  }

  function multiplyMat3WithVector3(m, v)
  {
    const result = vec3( m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
                         m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
                         m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]);

    return result;
  }

  function clearChildren(item)
  {
    item.children.forEach(element => {
        clearChildren(element);
    });
    item.children = [];

  }

 
  class swapAnimation
  {
    constructor(obj1, obj2, length)
    {
        this.obj1 = obj1;
        this.obj2 = obj2;

        this.startPoint = obj1.position[0];
        this.endPoint = obj2.position[0];
        this.timer = 0.0;
        this.length = length;
        this.finished = false;
    }

    animate()
    {
        var p1 = this.startPoint + (this.endPoint - this.startPoint)*Math.min(this.timer/this.length, 1.0);
        var p2 = this.endPoint + (this.startPoint - this.endPoint)*Math.min(this.timer/this.length, 1.0);

        this.obj1.position[0] = p1;
        this.obj2.position[0] = p2;

        this.timer += 10;

        if (this.timer > this.length)
        {
            this.obj1.position[0] = this.endPoint;
            this.finished = true;
        }
    }
  }