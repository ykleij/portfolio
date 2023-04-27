// Varyings
                varying vec2 vUv;
        
                // Uniforms: Common
                uniform float uOpacity;
                uniform vec2 uMouse;
                uniform vec2 viewport;
                uniform float uThreshold;
                uniform float uAlphaTest;
                uniform vec3 uColor;
                uniform sampler2D uMap;
                uniform sampler2D gradientMap;
                uniform float time;
        
                // Uniforms: Strokes
                uniform vec3 uStrokeColor;
                uniform float uStrokeOutsetWidth;
                uniform float uStrokeInsetWidth;
        
                // Utils: Median
                float median(float r, float g, float b) {
                    return max(min(r, g), min(max(r, g), b));
                }

                float createCircle () {
                    vec2 viewportUv = vUv * 2.0 - 1.0;
                    float viewportAspect = viewport.x / viewport.y;

                    vec2 mousePoint = vec2(uMouse.x, 1.0 - uMouse.y);
                    float circleRadius = max(0.0, 100.0 / viewport.x);
                    vec2 shapeUv = viewportUv - mousePoint;

                    shapeUv /= vec2(1.0, viewportAspect);
                    shapeUv += mousePoint;
                    
                    float dist = distance(shapeUv, mousePoint);
                    dist = smoothstep(circleRadius, circleRadius + 0.001, dist);
                    return dist;
                }
        
                void main() {
                    // Common
                    // Texture sample
                    vec3 s = texture2D(uMap, vUv).rgb;
                    float gr = texture2D(gradientMap, vUv).r;
        
                    // Signed distance
                    float sigDist = median(s.r, s.g, s.b) - .5;
        
                    float circle = createCircle();
                    float afwidth = 1.4142135623730951 / 2.0;
                    float lineProgress = 0.3;
        
                    #ifdef IS_SMALL
                        float alpha = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDist);
                    #else
                        float alpha = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);
                    #endif
        
                    // Strokes
                    // Outset
                    float sigDistOutset = sigDist + uStrokeOutsetWidth * 0.5;
        
                    // Inset
                    float sigDistInset = sigDist - uStrokeInsetWidth * 0.5;
        
                    #ifdef IS_SMALL
                        float outset = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistOutset);
                        float inset = 1.0 - smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistInset);
                    #else
                        float outset = clamp(sigDistOutset / fwidth(sigDistOutset) + 0.5, 0.0, 1.0);
                        float inset = 1.0 - clamp(sigDistInset / fwidth(sigDistInset) + 0.5, 0.0, 1.0);
                    #endif
        
                    // Border
                    float border = outset * inset;
        
                    // Alpha Test
                    if (alpha < uAlphaTest) discard;
        
                    // Some animation
                    alpha *= sin(.99);
        
                    // Output: Common
        
                    vec4 filledFragColor = vec4(uColor, uOpacity * alpha);

                    // gradient
                    float grgr = fract(1.*gr + time*.02);
                    float start = smoothstep(0.,0.01,grgr);
                    float end = smoothstep(lineProgress,lineProgress -0.01,grgr);
                    float mask = start*end;
                    mask = max(.1, mask);
                    
                    float finalAlpha = border * mask;
        

                    // gl_FragColor = filledFragColor;
                    gl_FragColor = vec4(uColor.xyz, filledFragColor * uOpacity);
                    gl_FragColor = vec4(uColor.xyz, finalAlpha);
                    // gl_FragColor = vec4(vec3(border),1.);
                    // gl_FragColor = vec4(vec3(.1,.1,.1),border); 
                    // gl_FragColor = vec4(vec3(.8,.8,.8),finalAlpha); 
                    gl_FragColor = vec4(vec3(10.,10.,10.),alpha); 
                    gl_FragColor = vec4(vec3(circle,.2,.2),finalAlpha);
                    if (gl_FragColor.a < 0.001) discard;
                }