var homework1 = function() {

  "use strict";

  var canvas;
  var gl;

  var numPositions = 36;

  var positionsArray = [];
  var colorsArray = [];
  var textureArray = [];
  var vertices = [];

  var x_z_coords = [
    vec2(0, -1000),
    vec2(-707, -707),
    vec2(-1000, 0),
    vec2(-707, 707),
    vec2(0, 1000),
    vec2(707, 707),
    vec2(1000, 0),
    vec2(707, -707)
  ];

  var texCoord = [
    vec2(0, 0), //d
    vec2(0, 1), //c
    vec2(1, 1), //b
    vec2(1, 0) //a
  ];

  var vertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0), // black
    vec4(1.0, 0.0, 0.0, 1.0), // red
    vec4(1.0, 1.0, 0.0, 1.0), // yellow
    vec4(0.0, 1.0, 0.0, 1.0), // green
    vec4(0.0, 0.0, 1.0, 1.0), // blue
    vec4(1.0, 0.0, 1.0, 1.0), // magenta
    vec4(0.0, 1.0, 1.0, 1.0), // cyan
    vec4(1.0, 1.0, 1.0, 1.0), // white
  ];


  var near = 0.1;
  var far = 100.0;
  var radius = 2.5;
  var theta = 0.0;
  var phi = 0.0;
  var dr = 5.0 * Math.PI / 180.0;

  var fovy = 90.0; // Field-of-view in Y direction angle (in degrees)
  var aspect; // Viewport aspect ratio

  var modelViewMatrix, projectionMatrix;
  var modelViewMatrixLoc, projectionMatrixLoc;
  var nMatrix, nMatrixLoc;

  var eye;
  const at = vec3(0.0, 0.0, 0.0);
  const up = vec3(0.0, 1.0, 0.0);

  var normalsArray = [];

  function quad(a, b, c, d) {

    positionsArray.push(vertices[a]);
    positionsArray.push(vertices[b]);
    positionsArray.push(vertices[c]);

    positionsArray.push(vertices[c]);
    positionsArray.push(vertices[d]);
    positionsArray.push(vertices[a]);

    colorsArray.push(vertexColors[a % 8]);
    colorsArray.push(vertexColors[a % 8]);
    colorsArray.push(vertexColors[a % 8]);

    colorsArray.push(vertexColors[a % 8]);
    colorsArray.push(vertexColors[a % 8]);
    colorsArray.push(vertexColors[a % 8]);

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    normal = vec3(normal);

    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);

    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);

    textureArray.push(texCoord[0]);
    textureArray.push(texCoord[1]);
    textureArray.push(texCoord[3]);

    textureArray.push(texCoord[1]);
    textureArray.push(texCoord[2]);
    textureArray.push(texCoord[3]);

    textureArray.push(texCoord[0]);
    textureArray.push(texCoord[1]);
    textureArray.push(texCoord[3]);

    textureArray.push(texCoord[1]);
    textureArray.push(texCoord[2]);
    textureArray.push(texCoord[3]);
  }


  function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
  }

  function define_vertices() {
    var i = 0;
    for (var i = 0; i < 8; i++) {
      x_z_coords[i][0] /= 1000;
      x_z_coords[i][1] /= 1000;

      //x_z_coords[i][0] = x_z_coords[i][0].toFixed(2);
      //x_z_coords[i][1] = x_z_coords[i][1].toFixed(2);
    }


    var h = -0.5;
    for (i = 0; i < 8; i++) {
      vertices.push(vec4(x_z_coords[i][0] / 2, h, x_z_coords[i][1] / 2, 1.0));
    }

    h = -0.3;
    for (i = 0; i < 8; i++) {
      vertices.push(vec4(x_z_coords[i][0] / 6, h, x_z_coords[i][1] / 6, 1.0));
    }

    h = 0.0;
    for (i = 0; i < 8; i++) {
      vertices.push(vec4(x_z_coords[i][0] / 2, h, x_z_coords[i][1] / 2, 1.0));
    }

    h = 0.5;
    for (i = 0; i < 8; i++) {
      vertices.push(vec4(x_z_coords[i][0] / 2, h, x_z_coords[i][1] / 2, 1.0));
    }

    //console.log(vertices);
    //console.log("num vertices : " + vertices.length);
  }

  function definePoints() {
    var i = 0;
    for (i = 0; i < 7; i++) {
      quad(i, i + 1, i + 9, i + 8);
    }
    quad(7, 0, 8, 15);

    var i = 0;
    for (i = 8; i < 15; i++) {
      quad(i, i + 1, i + 9, i + 8);
    }
    quad(15, 8, 16, 23);

    var i = 0;
    for (i = 16; i < 23; i++) {
      quad(i, i + 1, i + 9, i + 8);
    }
    quad(23, 16, 24, 31);

    //console.log(pointsArray);
  }


  //----------------------------------------------------------------------------

  var modelViewMatrixLights;
  var modelViewMatrixLightsLoc;

  var materialDiffuseColorLoc, materialSpecularColorLoc, materialSpecularExponentLoc;

  var spotlightEnabledLoc, spotlightPositionLoc, spotlightColorLoc, spotlightSpotDirectionLoc, spotlightSpotCosineCutoffLoc, spotlightSpotExponentLoc, spotlightDiffuseColorLoc, spotlightSpecularColorLoc;
  var directionalLightEnabledLoc, directionalLightPositionLoc, directionalLightColorLoc, directionalLightDirectionLoc, directionalLightCosineCutoffLoc, directionalLightExponentLoc, directionalLightDiffuseColorLoc, directionalLightSpecularColorLoc;

  var materialDiffuse = vec3(1.0, 0.8, 0.0);
  var materialSpecular = vec3(1.0, 1.0, 1.0);
  var specularExponent = 20.0;


  //spotlight
  var spotlightEnabled = true;
  var spotlightPosition = vec4(0.0, 0.0, 1.0, 1.0);
  var spotlightColor = vec3(1.0, 1.0, 1.0);
  var spotlightDirection = vec3(0.0, 0.0, -1.0);
  var spotlightCosineCutoff = 0.5;
  var spotlightExponent = 0.0;
  var spotlightDiffuseColor = vec4(1.0, 1.0, 1.0, 1.0);
  var spotlightSpecularColor = vec4(1.0, 1.0, 1.0, 1.0);

  //directional
  var directionalLightEnabled = true;
  var directionalLightPosition = vec4(0.0, 0.0, 1.0, 0.0); //w=0.0 since it is a directional
  var directionalLightDiffuseColor = vec4(1.0, 1.0, 1.0, 1.0);
  var directionalLightSpecularColor = vec4(1.0, 1.0, 1.0, 1.0);

  //irrelevant parameters
  var directionalLightColor = vec3(1.0, 1.0, 1.0);
  var directionalLightDirection = vec3(0.0, 0.0, 0.0);
  var directionalLightCosineCutoff = 0.0;
  var directionalLightExponent = 0.0;

  //toggles
  var toggleLightModeLoc, toggleTextureLoc;

  var toggleLightMode = true;
  var toggleTexture = true;

  //Rotate & Translate
  var angle = vec3(0.0, 0.0, 0.0);
  var axisRotate = vec3(0.0, 0.0, 0.0);
  var axisTranslate = vec3(0.0, 0.0, 0.0);

  //----------------------------------------------------------------------------

  window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);

    aspect = canvas.width / canvas.height;

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    //colorCube();
    define_vertices();
    definePoints();


    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
    nMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");
    modelViewMatrixLightsLoc = gl.getUniformLocation(program, "uModelViewMatrixLights");

    //material
    materialDiffuseColorLoc = gl.getUniformLocation(program, "material.diffuseColor");
    materialSpecularColorLoc = gl.getUniformLocation(program, "material.specularColor");
    materialSpecularExponentLoc = gl.getUniformLocation(program, "material.specularExponent");

    gl.uniform3fv(materialDiffuseColorLoc, flatten(materialDiffuse));
    gl.uniform3fv(materialSpecularColorLoc, flatten(materialSpecular));
    gl.uniform1f(materialSpecularExponentLoc, specularExponent);


    //spotlight
    spotlightEnabledLoc = gl.getUniformLocation(program, "spotlight.enabled");
    spotlightPositionLoc = gl.getUniformLocation(program, "spotlight.position");
    spotlightColorLoc = gl.getUniformLocation(program, "spotlight.color");
    spotlightSpotDirectionLoc = gl.getUniformLocation(program, "spotlight.spotDirection");
    spotlightSpotCosineCutoffLoc = gl.getUniformLocation(program, "spotlight.spotCosineCutoff");
    spotlightSpotExponentLoc = gl.getUniformLocation(program, "spotlight.spotExponent");
    spotlightDiffuseColorLoc = gl.getUniformLocation(program, "spotlight.diffuseColor");
    spotlightSpecularColorLoc = gl.getUniformLocation(program, "spotlight.specularColor");

    gl.uniform1f(spotlightEnabledLoc, spotlightEnabled);
    gl.uniform4fv(spotlightPositionLoc, flatten(spotlightPosition));
    gl.uniform3fv(spotlightColorLoc, flatten(spotlightColor));
    gl.uniform3fv(spotlightSpotDirectionLoc, flatten(spotlightDirection));
    gl.uniform1f(spotlightSpotCosineCutoffLoc, spotlightCosineCutoff);
    gl.uniform1f(spotlightSpotExponentLoc, spotlightExponent);
    gl.uniform4fv(spotlightDiffuseColorLoc, flatten(spotlightDiffuseColor));
    gl.uniform4fv(spotlightSpecularColorLoc, flatten(spotlightSpecularColor));


    //directional
    directionalLightEnabledLoc = gl.getUniformLocation(program, "directional.enabled");
    directionalLightPositionLoc = gl.getUniformLocation(program, "directional.position");
    directionalLightColorLoc = gl.getUniformLocation(program, "directional.color");
    directionalLightDirectionLoc = gl.getUniformLocation(program, "directional.spotDirection");
    directionalLightCosineCutoffLoc = gl.getUniformLocation(program, "directional.spotCosineCutoff");
    directionalLightExponentLoc = gl.getUniformLocation(program, "directional.spotExponent");
    directionalLightDiffuseColorLoc = gl.getUniformLocation(program, "directional.diffuseColor");
    directionalLightSpecularColorLoc = gl.getUniformLocation(program, "directional.specularColor");

    gl.uniform1f(directionalLightEnabledLoc, directionalLightEnabled);
    gl.uniform4fv(directionalLightPositionLoc, flatten(directionalLightPosition));
    gl.uniform3fv(directionalLightColorLoc, flatten(directionalLightColor));
    gl.uniform3fv(directionalLightDirectionLoc, flatten(directionalLightDirection));
    gl.uniform1f(directionalLightCosineCutoffLoc, directionalLightCosineCutoff);
    gl.uniform1f(directionalLightExponentLoc, directionalLightExponent);
    gl.uniform4fv(directionalLightDiffuseColorLoc, flatten(directionalLightDiffuseColor));
    gl.uniform4fv(directionalLightSpecularColorLoc, flatten(directionalLightSpecularColor));

    //toggles light mode and texture

    toggleLightModeLoc = gl.getUniformLocation(program, "u_toggleLightMode");
    toggleTextureLoc = gl.getUniformLocation(program, "u_toogleTextures");

    gl.uniform1f(toggleLightModeLoc, toggleLightMode);
    gl.uniform1f(toggleTextureLoc, toggleTexture);

    //Texture

    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(textureArray), gl.STATIC_DRAW);

    var texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");
    gl.enableVertexAttribArray(texcoordAttributeLocation);
    gl.vertexAttribPointer(texcoordAttributeLocation, 4, gl.FLOAT, true, 0, 0);

    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    var image = new Image();
    image.src = "../homework.png";
    image.addEventListener("load", function() {
      // Now that the image has loaded make copy it to the texture.
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    });

    // buttons for viewing parameters

    document.getElementById("Button1").onclick = function() {
      near *= 1.1;
      far *= 1.1;
    };
    document.getElementById("Button2").onclick = function() {
      near *= 0.9;
      far *= 0.9;
    };

    //camera
    document.getElementById("Button3").onclick = function() { radius *= 1.2; };
    document.getElementById("Button4").onclick = function() { radius *= 0.8; };
    document.getElementById("Button5").onclick = function() { theta += dr; };
    document.getElementById("Button6").onclick = function() { theta -= dr; };
    document.getElementById("Button7").onclick = function() { phi += dr; };
    document.getElementById("Button8").onclick = function() { phi -= dr; };

    //spotlight
    document.getElementById("ToggleSpotlight").onclick = function() {
      spotlightEnabled = !spotlightEnabled;
      if (spotlightEnabled) {
        this.innerHTML = "Toggle Spotlight : " + "OFF";
      } else {
        this.innerHTML = "Toggle Spotlight : " + "ON";
      }
    };
    document.getElementById("spotCosineCutoff").oninput = function() {
      spotlightCosineCutoff = parseFloat(this.value) / 1000;
    };
    document.getElementById("spotDirectionX").oninput = function() { spotlightDirection[0] = parseFloat(this.value) / 100 };
    document.getElementById("spotDirectionY").oninput = function() { spotlightDirection[1] = parseFloat(this.value) / 100 };
    document.getElementById("spotDirectionZ").oninput = function() { spotlightDirection[2] = parseFloat(this.value) / 100 };
    document.getElementById("spotPositionX").oninput = function() { spotlightPosition[0] = parseFloat(this.value) / 10 };
    document.getElementById("spotPositionY").oninput = function() { spotlightPosition[1] = parseFloat(this.value) / 10 };
    document.getElementById("spotPositionZ").oninput = function() { spotlightPosition[2] = parseFloat(this.value) / 10 };

    //directional
    document.getElementById("ToggleDirectional").onclick = function() {
      directionalLightEnabled = !directionalLightEnabled;
      if (directionalLightEnabled) {
        this.innerHTML = "Toggle Directional : " + "OFF";
      } else {
        this.innerHTML = "Toggle Directional : " + "ON";
      }
    };
    document.getElementById("DirectionalX").oninput = function() { directionalLightPosition[0] = parseFloat(this.value) / 100 };
    document.getElementById("DirectionalY").oninput = function() { directionalLightPosition[1] = parseFloat(this.value) / 100 };
    document.getElementById("DirectionalZ").oninput = function() { directionalLightPosition[2] = parseFloat(this.value) / 100 };

    //toggles
    document.getElementById("ToggleLightMode").onclick = function() { toggleLightMode = !toggleLightMode };
    document.getElementById("ToggleTexture").onclick = function() { toggleTexture = !toggleTexture };

    //Rotate & TranslateX

    document.getElementById("RotateX").oninput = function() { angle[0] = parseFloat(this.value) };
    document.getElementById("RotateY").oninput = function() { angle[1] = parseFloat(this.value) };
    document.getElementById("RotateZ").oninput = function() { angle[2] = parseFloat(this.value) };

    document.getElementById("TranslateX").oninput = function() { axisTranslate[0] = parseFloat(this.value) / 10 };
    document.getElementById("TranslateY").oninput = function() { axisTranslate[1] = parseFloat(this.value) / 10 };
    document.getElementById("TranslateZ").oninput = function() { axisTranslate[2] = parseFloat(this.value) / 10 };

    document.getElementById("ResetObject").onclick = function() {
      document.getElementById("TranslateX").value = 0.0;
      document.getElementById("TranslateY").value = 0.0;
      document.getElementById("TranslateZ").value = 0.0;
      document.getElementById("RotateX").value = 0.0;
      document.getElementById("RotateY").value = 0.0;
      document.getElementById("RotateZ").value = 0.0;
      angle[0] = 0.0;
      angle[1] = 0.0;
      angle[2] = 0.0;
      axisTranslate[0] = 0.0;
      axisTranslate[1] = 0.0;
      axisTranslate[2] = 0.0;
    };
    document.getElementById("ResetCamera").onclick = function() {
      radius = 2.5;
      theta = 0.0;
      phi = 0.0;
    };
    document.getElementById("ResetSpotlight").onclick = function() {
      spotlightEnabled = true;
      spotlightPosition = vec4(0.0, 0.0, 1.0, 1.0);
      spotlightDirection = vec3(0.0, 0.0, -1.0);
      spotlightCosineCutoff = 0.5;
      document.getElementById("spotCosineCutoff").value = 700.0;
      document.getElementById("spotDirectionX").value = 0.0;
      document.getElementById("spotDirectionY").value = 0.0;
      document.getElementById("spotDirectionZ").value = 0.0;
      document.getElementById("spotPositionX").value = 0.0;
      document.getElementById("spotPositionY").value = 0.0;
      document.getElementById("spotPositionZ").value = 0.0;
      document.getElementById("ToggleSpotlight").innerHTML = "Toggle Spotlight : " + "OFF";
    };
    document.getElementById("ResetDirectional").onclick = function() {
      directionalLightEnabled = true;
      directionalLightPosition = vec4(0.0, 0.0, 1.0, 0.0); //w=0.0 since it is a directional
      document.getElementById("DirectionalX").value = 0.0;
      document.getElementById("DirectionalY").value = 0.0;
      document.getElementById("DirectionalZ").value = 0.0;
      document.getElementById("ToggleDirectional").innerHTML = "Toggle Directional : " + "OFF";
    };

    var i = 0;

    var buttons = document.getElementsByTagName('button');
    for (i = 0; i < buttons.length; i++) {
      buttons[i].className = "btn btn-primary";
    }


    var inputs = document.getElementsByTagName('input');
    for (i = 0; i < inputs.length; i++) {
      if (inputs[i].type.toLowerCase() == 'range') {
        inputs[i].className = "custom-range";
      }
    }

    render();
  }



  var render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
      radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLightsLoc, false, flatten(modelViewMatrix));

    modelViewMatrix = mult(modelViewMatrix, translate(axisTranslate[0], axisTranslate[1], axisTranslate[2]));

    modelViewMatrix = mult(modelViewMatrix, rotateX(angle[0]));
    modelViewMatrix = mult(modelViewMatrix, rotateY(angle[1]));
    modelViewMatrix = mult(modelViewMatrix, rotateZ(angle[2]));

    modelViewMatrix = mult(modelViewMatrix, translate(0, 0, 0));

    nMatrix = normalMatrix(modelViewMatrix, true);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix));

    gl.uniform1f(spotlightEnabledLoc, spotlightEnabled);
    gl.uniform4fv(spotlightPositionLoc, flatten(spotlightPosition));
    gl.uniform3fv(spotlightSpotDirectionLoc, flatten(spotlightDirection));
    gl.uniform1f(spotlightSpotCosineCutoffLoc, spotlightCosineCutoff);

    gl.uniform1f(directionalLightEnabledLoc, directionalLightEnabled);
    gl.uniform4fv(directionalLightPositionLoc, flatten(directionalLightPosition));

    gl.uniform1f(toggleLightModeLoc, toggleLightMode);
    gl.uniform1f(toggleTextureLoc, toggleTexture);


    gl.drawArrays(gl.TRIANGLES, 0, positionsArray.length);
    requestAnimationFrame(render);
  }

}
homework1();
