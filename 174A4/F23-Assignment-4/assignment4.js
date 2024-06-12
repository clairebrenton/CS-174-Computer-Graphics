import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong} = defs


export class Assignment4 extends Scene {
    /*
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
    */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // TODO:  Create two cubes, including one with the default texture coordinates (from 0 to 1), and one with the modified
        //        texture coordinates as required for cube #2.  You can either do this by modifying the cube code or by modifying
        //        a cube instance's texture_coords after it is already created.
        this.shapes = {
            box_1: new Cube(),
            box_2: new Cube(),
            axis: new Axis_Arrows(),
        }

        console.log(this.shapes.box_1.arrays.texture_coord)

        // Cube 2 texture applied to each face, zoomed out by 50% (image should shrink)
        // Entire image will appear 4 times, once in each corner
        this.shapes.box_2.arrays.texture_coord = this.shapes.box_2.arrays.texture_coord.map(x => x.times(2));


        // TODO:  Create the materials required to texture both cubes with the correct images and settings.
        //        Make each Material from the correct shader.  Phong_Shader will work initially, but when
        //        you get to requirements 6 and 7 you will need different ones.
        this.materials = {
            phong: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
            }),
            texture: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: 0.5, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/stars.png")
            }),
            stars: new Material(new Texture_Rotate(), {
                color: hex_color("#000000"),
                ambient: 1,
                texture: new Texture("assets/stars.png", "NEAREST")
            }),
            earth: new Material(new Texture_Scroll_X(), {
                color: hex_color("#000000"),
                ambient: 1,
                texture: new Texture("assets/earth.gif", "LINEAR_MIPMAP_LINEAR")
            }),

            // new images here
            dog: new Material(new Texture_Rotate(), {
                color: hex_color("#000000"),
                ambient: 1,
                texture: new Texture("assets/dog.png", "NEAREST")
            }),

            hearts: new Material(new Texture_Scroll_X(), {
                color: hex_color("#000000"),
                ambient: 1,
                texture: new Texture("assets/hearts.png", "LINEAR_MIPMAP_LINEAR")
            }),
        }
        this.isRotating = false;
        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
        this.box_1_transform = Mat4.identity().times(Mat4.translation(-2, 0, 0, 0));
        this.box_2_transform = Mat4.identity().times(Mat4.translation(2, 0, 0, 0));

    }

    make_control_panel() {
        // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
        this.key_triggered_button("Rotation", ["c"], () =>
            this.isRotating = !this.isRotating);
    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(0, 0, -8));
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        // time
        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();

        // TODO:  Draw the required boxes. Also update their stored matrices.
        // You can remove the following line.

        if (this.isRotating) {
            // 10 rpm --> PI/3
            let box1rot = Math.PI/3 * dt;
            // 15 rpm --> PI/2 rad/s
            let box2rot = Math.PI/2 * dt;
            this.box_1_transform = this.box_1_transform.times(Mat4.rotation(box1rot, 1, 0, 0));
            this.box_2_transform = this.box_2_transform.times(Mat4.rotation(box2rot, 0, 1, 0));
        }
        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.stars);
        this.shapes.box_2.draw(context, program_state, this.box_2_transform, this.materials.earth);
    }
}


class Texture_Scroll_X extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #6.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
    void main(){
    // Adjust variable names for clarity and change
    float animationOffset = mod(animation_time, 4.) * 2.; 
    vec4 transformedTexCoord = vec4(f_tex_coord, 0, 0) + vec4(1., 1., 0., 1.);
    float texCoordX, texCoordY;

    // Re-compute the transformation matrix for texture coordinate animation
    mat4 textureSlideMatrix = mat4(vec4(-1., 0., 0., 0.), vec4(0., 1., 0., 0.), vec4(0., 0., 1., 0.), vec4(animationOffset, 0., 0., 1.)); 

    // Apply transformation
    transformedTexCoord = textureSlideMatrix * transformedTexCoord; 

    // Perform texture sampling
    vec4 colorSample = texture2D(texture, transformedTexCoord.xy);

    // Normalize texture coordinates for outline logic
    texCoordX = mod(transformedTexCoord.x, 1.0);
    texCoordY = mod(transformedTexCoord.y, 1.0);

    // Reorder and rename conditions for drawing the outline
    // Top edge
    if (texCoordY > 0.75 && texCoordY < 0.85 && texCoordX > 0.15 && texCoordX < 0.85) {
        colorSample = vec4(0, 0, 0, 1.0);
    }
    // Bottom edge
    if (texCoordY > 0.15 && texCoordY < 0.25 && texCoordX > 0.15 && texCoordX < 0.85) {
        colorSample = vec4(0, 0, 0, 1.0);
    }
    // Right edge
    if (texCoordX > 0.75 && texCoordX < 0.85 && texCoordY > 0.15 && texCoordY < 0.85) {
        colorSample = vec4(0, 0, 0, 1.0);
    }
    // Left edge
    if (texCoordX > 0.15 && texCoordX < 0.25 && texCoordY > 0.15 && texCoordY < 0.85) {
        colorSample = vec4(0, 0, 0, 1.0);
    }

    // Discard fragment if alpha is negligible
    if (colorSample.w < 0.01) discard;

    // Compute ambient color
    vec4 ambientColor = vec4((colorSample.xyz + shape_color.xyz) * ambient, shape_color.w * colorSample.w);

    // Final color computation with lighting
    gl_FragColor = ambientColor + vec4(phong_model_lights(normalize(N), vertex_worldspace), 0.0);
        } `;
    }
}


class Texture_Rotate extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #7.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            void main(){
    // Calculate the rotation angle for texture mapping, limiting its growth
    float angleOfRotation = (2.0 / 3.0) * 3.14159265 * mod(animation_time, 3.);
    // Define the rotation matrix to rotate texture
    mat4 rotationMatrix = mat4(vec4(cos(angleOfRotation), sin(angleOfRotation), 0., 0.), 
                               vec4(sin(angleOfRotation), -cos(angleOfRotation), 0., 0.), 
                               vec4(0., 0., 1., 0.), 
                               vec4(0., 0., 0., 1.));
    
    // Apply rotation to the texture coordinates
    vec4 adjustedTexCoord = rotationMatrix * (vec4(f_tex_coord, 0, 0) + vec4(-0.5, -0.5, 0., 0.)) + vec4(0.5, 0.5, 0., 0.);
    
    // Sample the texture
    vec4 sampledColor = texture2D(texture, adjustedTexCoord.xy);
    
    // Calculate normalized coordinates for outline detection
    float normX = mod(adjustedTexCoord.x, 1.0);
    float normY = mod(adjustedTexCoord.y, 1.0);
    
    // Reorder conditionals for outlining
    // Top edge
    if (normY > 0.75 && normY < 0.85 && normX > 0.15 && normX < 0.85) {
        sampledColor = vec4(0, 0, 0, 1.0);
    }
    // Bottom edge
    if (normY > 0.15 && normY < 0.25 && normX > 0.15 && normX < 0.85) {
        sampledColor = vec4(0, 0, 0, 1.0);
    }
    // Right edge
    if (normX > 0.75 && normX < 0.85 && normY > 0.15 && normY < 0.85) {
        sampledColor = vec4(0, 0, 0, 1.0);
    }
    // Left edge
    if (normX > 0.15 && normX < 0.25 && normY > 0.15 && normY < 0.85) {
        sampledColor = vec4(0, 0, 0, 1.0);
    }
    
    // Discard the fragment for low alpha values
    if (sampledColor.w < 0.01) discard;
    
    // Compute initial ambient color
    vec4 ambientColor = vec4((sampledColor.xyz + shape_color.xyz) * ambient, shape_color.w * sampledColor.w);
    
    // Final color computation including lighting
    gl_FragColor = ambientColor + vec4(phong_model_lights(normalize(N), vertex_worldspace), 0.0);
        } `;
    }
}
