import {defs, tiny} from './examples/common.js';

import {Transforms_Sandbox} from "./examples/transforms-sandbox.js"
import {Assignment2} from "./assignment2.js"
// Pull these names into this module's scope for convenience:
const {
    Vector, Vector3, vec, vec3, vec4, color, Matrix, Mat4, Light, Shape, Material, Shader, Texture, Scene,
    Canvas_Widget, Code_Widget, Text_Widget
} = tiny;

// Now we have loaded everything in the files tiny-graphics.js, tiny-graphics-widgets.js, and common.js.
// This yielded "tiny", an object wrapping the stuff in the first two files, and "defs" for wrapping all the rest.

// ******************** Extra step only for when executing on a local machine:
//                      Load any more files in your directory and copy them into "defs."
//                      (On the web, a server should instead just pack all these as well
//                      as common.js into one file for you, such as "dependencies.js")

const Minimal_Webgl_Demo = defs.Minimal_Webgl_Demo;

//Object.assign(defs,
//            {Transforms_Sandbox}, {Assignment2});

Object.assign(defs,
            {Assignment2}, {Assignment2});


// ******************** End extra step

// (Can define Main_Scene's class here)

"const Main_Scene = Transforms_Sandbox;"
const Main_Scene = Assignment2;
const Additional_Scenes = [];

export {Main_Scene, Additional_Scenes, Canvas_Widget, Code_Widget, Text_Widget, defs}