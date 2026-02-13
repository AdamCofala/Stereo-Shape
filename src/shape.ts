import * as THREE from 'three';
import { distance, sub } from 'three/tsl';

export class Shape{

    public geometrySingle: THREE.Vector3[] = [];
    private circleMid: THREE.Vector3 = new THREE.Vector3(0,0,0);
    private radius: number = 0;

     private isRightAngle(
        A: THREE.Vector3,
        B: THREE.Vector3, // Angle at point B
        C: THREE.Vector3,
        epsilon = 1e-9
    ): boolean {
        const BA = new THREE.Vector3().subVectors(A, B); // Vector FROM B TO A
        const BC = new THREE.Vector3().subVectors(C, B); // Vector FROM B TO C

        const dotProduct = BA.dot(BC);
        return Math.abs(dotProduct) < epsilon;
    }

    private addRightAngleMarker(
        vertices: THREE.Vector3[],
        A: THREE.Vector3,
        B: THREE.Vector3, // This is now the ANGLE VERTEX
        C: THREE.Vector3,
        markerSize = 0.2
    ): void {
        if (!this.isRightAngle(A, B, C)) return;

        // Get vectors FROM B (klonujemy aby nie modyfikować oryginałów)
        const BA = new THREE.Vector3().subVectors(A, B).normalize();
        const BC = new THREE.Vector3().subVectors(C, B).normalize();

        // Tworzymy kwadrat znacznika kąta prostego
        const corner1 = new THREE.Vector3().copy(B).add(BA.clone().multiplyScalar(markerSize));
        const corner2 = new THREE.Vector3().copy(corner1).add(BC.clone().multiplyScalar(markerSize));
        const corner3 = new THREE.Vector3().copy(B).add(BC.clone().multiplyScalar(markerSize));

        // Dodajemy linie tworzące kwadrat znacznika
        vertices.push(corner1, corner2, corner2, corner3);
    }

    public getRightAngleMarker(
        A: THREE.Vector3,
        B: THREE.Vector3, 
        C: THREE.Vector3
    ): THREE.Vector3[] {
        const rightAngleVertices: THREE.Vector3[] = [];
        
        // Sprawdzamy wszystkie możliwe kąty proste w trójkącie
        this.addRightAngleMarker(rightAngleVertices, A, B, C); // Kąt przy wierzchołku B
        this.addRightAngleMarker(rightAngleVertices, B, A, C); // Kąt przy wierzchołku A
        this.addRightAngleMarker(rightAngleVertices, C, A, B); // Kąt przy wierzchołku A (drugi sposób)
        this.addRightAngleMarker(rightAngleVertices, A, C, B); // Kąt przy wierzchołku C
        this.addRightAngleMarker(rightAngleVertices, B, C, A); // Kąt przy wierzchołku C (drugi sposób)
        this.addRightAngleMarker(rightAngleVertices, C, B, A); // Kąt przy wierzchołku B (drugi sposób)
        
        return rightAngleVertices;
    }


    public getCircle(): THREE.Vector3[]{
            
            const circle: THREE.Vector3[] = [];

            for(let angle=0.0; angle<=(2.1 * Math.PI); angle+=0.02){
                const x = this.radius * Math.sin(angle);
                const y = this.radius * Math.cos(angle);

                circle.push(new THREE.Vector3(x,0,y));
            }
            
            return circle;
        }


    private getCentoid(
        A: THREE.Vector3, 
        B: THREE.Vector3, 
        C: THREE.Vector3
    ) : THREE.Vector3{

        const xG = (A.x + B.x + C.x) / 3.0;
        const yG = (A.y + B.y + C.y) / 3.0;
        const zG = (A.z + B.z + C.z) / 3.0;

        return new THREE.Vector3(xG, yG, zG);
    }

    private createWalls(
        vertices: THREE.Vector3[],
        A: THREE.Vector3, 
        B: THREE.Vector3, 
        C: THREE.Vector3, 
        h: number, 
        in_circle: boolean, 
        out_circle: boolean
    ): void{

        const orto = this.getCentoid(A,B,C);
        let D = new THREE.Vector3(orto.x, h, orto.z);

        if(out_circle){

            const P = 2 * (A.x * (B.z - C.z) + B.x * (C.z - A.z) + C.x * (A.z - B.z));
            const Px = (A.x * A.x + A.z * A.z) * (B.z - C.z) + (B.x * B.x + B.z * B.z) * (C.z - A.z) + (C.x * C.x + C.z * C.z) * (A.z - B.z);
            const Py = (A.x * A.x + A.z * A.z) * (C.x - B.x) + (B.x * B.x + B.z * B.z) * (A.x - C.x) + (C.x * C.x + C.z * C.z) * (B.x - A.x);
        

            const xC = Px / P;
            const yC = Py / P;
           

            if(P!=0){
                D = new THREE.Vector3(xC,h,yC);
                this.circleMid = new THREE.Vector3(xC,0,yC); 
            }else{
                console.log('P == 0 ');
                return;
            }
            this.radius = A.distanceTo(this.circleMid);
        }

        if(in_circle){

            let temp = new THREE.Vector3(0,0,0);
            const a = temp.subVectors(B,C).length();
            const b = temp.subVectors(A,C).length();
            const c = temp.subVectors(A,B).length();

            let xI = (a * A.x + b * B.x + c * C.x) / (a + b + c);
            let yI = (a * A.z + b * B.z + c * C.z) / (a + b + c);

            let s = (a + b + c) / 2.0;
            let area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

            this.radius = area / s;

            D = new THREE.Vector3(xI, h, yI);
            this.circleMid = new THREE.Vector3(xI,0,yI)
        }

        if(!in_circle && !out_circle) this.radius = 0;

        const offset = new THREE.Vector3(D.x, 0, D.z);

        A.sub(offset);
        B.sub(offset);
        C.sub(offset);
        D.sub(offset);
        
        vertices.push(A);
        vertices.push(B);
        vertices.push(C);
        vertices.push(A);

        vertices.push(A);
        vertices.push(D);
        vertices.push(B);
        vertices.push(A);

        vertices.push(B);
        vertices.push(C);
        vertices.push(D);
        vertices.push(B);

        vertices.push(A);
        vertices.push(C);
        vertices.push(D);
        vertices.push(A);

        vertices.push(D);
        vertices.push( new THREE.Vector3(0,0,0));

    }


    public createTrianglesVertices(
            a: number, 
            b: number, 
            c: number, 
            h: number, 
            type: number, 
            nangle: number, 
            in_circle: boolean,
            out_circle: boolean
        ): THREE.Vector3[]{
        const vertices: THREE.Vector3[] = [];

        this.radius=0;

        switch(type){
            case 0: //any triangle
            {
                // Safe check if triangle is posible to make
                if (a + b <= c || a + c <= b || b + c <= a) {      
                    console.error("Not posible to make a triangle based on C value")
                    //return vertices; 
                }

                const A = new THREE.Vector3(0,0,0);
                const B = new THREE.Vector3(a,0,0);
                const cosAlpha = (a * a + c * c - b * b) / (2 * a * c);
                const sinAlpha = Math.sqrt(1 - cosAlpha * cosAlpha);

                const C = new THREE.Vector3(c*cosAlpha,0,c*sinAlpha);

                this.createWalls(vertices, A, B, C, h, in_circle, out_circle);

            } break;

            case 1: //right triangle
            {
                if (a * a + b * b != c * c) {
                    c = Math.sqrt(a * a + b * b);
                }
                
                const A = new THREE.Vector3(0,0,0);
                const B = new THREE.Vector3(a,0,0);
                const C = new THREE.Vector3(0,0,b);

                this.createWalls(vertices, A, B, C, h, in_circle, out_circle);
                
            } break;

            case 2: // isosceles and right triangle
            {
                b = a;
                c = Math.sqrt(a * a + b * b);

                const A = new THREE.Vector3(0,0,0);
                const B = new THREE.Vector3(a,0,0);
                const C = new THREE.Vector3(0,0,b);

               this.createWalls(vertices, A, B, C, h, in_circle, out_circle);

            } break;

            case 3: // isosceles
            {
                const height = Math.sqrt(b * b - (a / 2) * (a / 2))

                const A = new THREE.Vector3(-a/2,0,0);
                const B = new THREE.Vector3(a/2,0,0);
                const C = new THREE.Vector3(0,0,height);

                this.createWalls(vertices, A, B, C, h, in_circle, out_circle);

            } break;

            case 4: // equalilateral coś tam
            {
                const height =a* Math.sqrt(3)/2;

                const A = new THREE.Vector3(-a/2,0,0);
                const B = new THREE.Vector3(a/2,0,0);
                const C = new THREE.Vector3(0,0,height);

                this.createWalls(vertices, A, B, C, h, in_circle, out_circle);

            } break;

            case 5: // ostroslup prawidlowy
            {
                const top = new THREE.Vector3(0,h,0);
                const middle = new THREE.Vector3(0,0,0);

                for(let i=-1; i<nangle; i++){
                    const angle = 2 * Math.PI * i / nangle + Math.PI/2;
                    const x = a * Math.cos(angle);
                    const y = a * Math.sin(angle);
                    
                    vertices.push(new THREE.Vector3(x,0,y));

                }
                
                for(let i=0; i<nangle; i++){

                    const angle = 2 * Math.PI * i / nangle + Math.PI/2;
                    const x = a * Math.cos(angle);
                    const y = a * Math.sin(angle);

                    vertices.push(new THREE.Vector3(x,0,y));
                    vertices.push(top);
                } 

            } break;

            case 6: // ostroslup o podstawie prostokata
            {
                const A = new THREE.Vector3(-a/2,0,-b / 2);
                const B = new THREE.Vector3(a/2,0,-b / 2);
                const C = new THREE.Vector3(-a/2,0,b / 2);
                const D = new THREE.Vector3(a/2,0, b / 2);

                vertices.push(A);
                vertices.push(B);
                vertices.push(D);
                vertices.push(C);
                vertices.push(A);
                
                const top = new THREE.Vector3(-a/2, h ,-b / 2);
                vertices.push(top);
                vertices.push(B);
                vertices.push(top);
                vertices.push(D);
                vertices.push(top)
                vertices.push(C)

            }break;

            case 7: // graniastoslup prawidlowy
            {
                const top = new THREE.Vector3(0,h,0);
                const middle = new THREE.Vector3(0,0,0);

                for(let i=-1; i<nangle; i++){
                    const angle = 2 * Math.PI * i / nangle + Math.PI/2;
                    const x = a * Math.cos(angle);
                    const y = a * Math.sin(angle);
                    
                    vertices.push(new THREE.Vector3(x,0,y));
                }

                for(let i=-1; i<nangle; i++){
                    const angle = 2 * Math.PI * i / nangle + Math.PI/2;
                    const x = a * Math.cos(angle);
                    const y = a * Math.sin(angle);
                    
                    vertices.push(new THREE.Vector3(x,h,y));
                }

                for(let i=-1; i<nangle; i++){
                    const angle = 2 * Math.PI * i / nangle + Math.PI/2;
                    const x = a * Math.cos(angle);
                    const y = a * Math.sin(angle);
                    
                    vertices.push(new THREE.Vector3(x,0,y));
                    vertices.push(new THREE.Vector3(x,h,y));
                    vertices.push(new THREE.Vector3(x,0,y));
                }
                

            } break;

            case 8: // prostopadloscian
            {


                const A = new THREE.Vector3(-a/2,0,-b / 2);
                const B = new THREE.Vector3(a/2,0,-b / 2);
                const C = new THREE.Vector3(-a/2,0,b / 2);
                const D = new THREE.Vector3(a/2,0, b / 2);

                vertices.push(A);
                vertices.push(B);
                vertices.push(D);
                vertices.push(C);
                vertices.push(A);
                
                const top = new THREE.Vector3(0, h ,0);
                vertices.push(A.clone().add(top));
                vertices.push(B.clone().add(top));
                vertices.push(D.clone().add(top));
                vertices.push(C.clone().add(top));
                vertices.push(A.clone().add(top));


                vertices.push(B.clone().add(top));
                vertices.push(B);

                vertices.push(D);
                vertices.push(D.clone().add(top));

                vertices.push(C.clone().add(top));
                vertices.push(C);
                
    

            }break;
        }
    
        return vertices;
    }

}