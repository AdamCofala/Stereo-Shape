import * as THREE from 'three';
export class Bilbord {
    constructor(Ain, Bin) {
        this.epsilon = 0.075;
        this.A = Ain;
        this.B = Bin;
    }
    generateMesh(camPos) {
        const Mesh = [];
        let AB = new THREE.Vector3().subVectors(this.A, this.B);
        if (this.A.equals(this.B) || AB.length() < 1e-6) {
            console.warn("Tried to make a bilboard between same or really close points");
            return Mesh;
        }
        let center = new THREE.Vector3().addVectors(this.A, this.B).multiplyScalar(0.5);
        let toCam = new THREE.Vector3().subVectors(camPos, center);
        if (toCam.length() < 1e-6) {
            console.warn("Tried to make a bilboard too close to camera");
            return Mesh;
        }
        toCam.normalize();
        let right = new THREE.Vector3().crossVectors(toCam, AB);
        if (right.length() < 1e-6) {
            console.warn("Tried to make a bilboard with offset close to 0");
            return Mesh;
        }
        right.normalize().multiplyScalar(this.epsilon);
        let margin = AB.clone().normalize().multiplyScalar(this.epsilon);
        let newA = this.A.clone().add(margin);
        let newB = this.B.clone().add(margin.clone().multiplyScalar(-1));
        Mesh.push(new THREE.Vector3().subVectors(newA, right));
        Mesh.push(new THREE.Vector3().addVectors(newA, right));
        Mesh.push(new THREE.Vector3().subVectors(newB, right));
        Mesh.push(new THREE.Vector3().subVectors(newB, right));
        Mesh.push(new THREE.Vector3().addVectors(newA, right));
        Mesh.push(new THREE.Vector3().addVectors(newB, right));
        return Mesh;
    }
}
var drawTypes;
(function (drawTypes) {
    drawTypes[drawTypes["lines"] = 0] = "lines";
    drawTypes[drawTypes["angles"] = 1] = "angles";
})(drawTypes || (drawTypes = {}));
export class lineDrawer {
    constructor(scene) {
        this.lineBuffer = [];
        this.angleBuffer = [];
        this.undoBuffer = [];
        this.activeLine = {
            A: new THREE.Vector3(0, 0, 0),
            B: new THREE.Vector3(1, 1, 1),
            color: new THREE.Color(0xff0000)
        };
        this.raycaster = new THREE.Raycaster();
        this.inter1 = null;
        this.inter2 = null;
        this.inter3 = null;
        this.drawingType = drawTypes.lines;
        this.scene = scene;
    }
    nullInters() {
        this.inter1 = null;
        this.inter2 = null;
        this.inter3 = null;
        this.scene.activeLineVisibility = false;
        this.scene.createShape();
    }
    undo() {
        const type = this.undoBuffer[this.undoBuffer.length - 1];
        switch (type) {
            case 0: {
                this.lineBuffer.pop();
                break;
            }
            case 1: {
                this.angleBuffer.pop();
                break;
            }
        }
        this.undoBuffer.pop();
    }
    addMarker(pos) {
        const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
        const material = new THREE.MeshBasicMaterial({
            color: 0x0077ff,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(pos.x, pos.y, pos.z);
        this.scene.add(sphere);
    }
    bilboardRaycast(mX, mY, points, camera, quickRaycastSnap) {
        var bilbords = this.bilbordgen(points, camera, 1);
        var linePoints = [];
        for (let i = 0; i < this.lineBuffer.length; i++) {
            linePoints.push(this.lineBuffer[i].A);
            linePoints.push(this.lineBuffer[i].B);
        }
        bilbords.attach(this.bilbordgen(linePoints, camera, 2));
        this.raycaster.set(camera.getPosition(), camera.screenToWorldRay(mX, mY, window.innerWidth, window.innerHeight));
        const intersects = this.raycaster.intersectObjects(bilbords.children, true);
        if (intersects.length > 0) {
            var snapTable = this.generateSnapTable(points).concat(this.generateLineSnapTable(linePoints));
            const pointsForSnapping = snapTable;
            if (quickRaycastSnap)
                return this.findClosestPoint(intersects[0].point, pointsForSnapping, intersects[0].object);
            if (this.inter1 == null) {
                this.inter1 = intersects[0].point;
                this.inter1 = this.findClosestPoint(this.inter1, pointsForSnapping, intersects[0].object);
                if (this.drawingType === drawTypes.lines) {
                    this.scene.activeLineVisibility = true;
                    this.scene.activeLinePoinst = [this.inter1, this.inter1.clone()];
                    this.scene.drawActiveLine();
                }
                else {
                    this.addMarker(this.inter1);
                }
            }
            else if (this.inter2 == null) {
                this.inter2 = intersects[0].point;
                this.inter2 = this.findClosestPoint(this.inter2, pointsForSnapping, intersects[0].object);
                if (this.inter1.distanceTo(this.inter2) > 1e-6 && this.drawingType === drawTypes.lines) {
                    this.lineBuffer.push({ A: this.inter1, B: this.inter2, color: this.scene.lineMaterial.color.clone() });
                    this.undoBuffer.push(0);
                    this.scene.drawLines();
                    this.inter1 = null;
                    this.inter2 = null;
                    this.scene.activeLineVisibility = false;
                    this.scene.createShape();
                }
                else {
                    this.addMarker(this.inter2);
                }
            }
            else {
                this.inter3 = intersects[0].point;
                this.inter3 = this.findClosestPoint(this.inter3, pointsForSnapping, bilbords);
                this.angleBuffer.push({ A: this.inter1, B: this.inter2, C: this.inter3, color: this.scene.angleMaterial.color.clone() });
                this.undoBuffer.push(1);
                this.scene.createShape();
                this.inter1 = null;
                this.inter2 = null;
                this.inter3 = null;
            }
        }
    }
    getLineIntersection(l1, l2, epsilon = 1e-6) {
        const p1 = l1.A.clone();
        const p2 = l1.B.clone();
        const p3 = l2.A.clone();
        const p4 = l2.B.clone();
        const d1 = p2.clone().sub(p1); // kierunek 1. odcinka
        const d2 = p4.clone().sub(p3); // kierunek 2. odcinka
        const r = d1.clone();
        const s = d2.clone();
        const rxs = new THREE.Vector3().crossVectors(r, s);
        const rxsLenSq = rxs.lengthSq();
        const qmp = p3.clone().sub(p1);
        const qmpCrossR = new THREE.Vector3().crossVectors(qmp, r);
        // Jeśli r x s == 0 i (q - p) x r == 0 → odcinki współliniowe
        if (rxsLenSq < epsilon) {
            if (qmpCrossR.lengthSq() < epsilon) {
                // współliniowe, sprawdzamy czy się pokrywają
                const t0 = qmp.dot(r) / r.lengthSq();
                const t1 = qmp.clone().add(s).dot(r) / r.lengthSq();
                if (Math.max(0, Math.min(t0, t1)) <= Math.min(1, Math.max(t0, t1))) {
                    // współliniowe i nakładają się — możemy zwrócić np. środek wspólnego przedziału
                    const t = (Math.max(0, Math.min(t0, t1)) + Math.min(1, Math.max(t0, t1))) / 2;
                    return p1.clone().add(r.multiplyScalar(t));
                }
            }
            return null; // równoległe lub współliniowe, ale się nie przecinają
        }
        // Jeśli odcinki nie są równoległe — obliczamy punkt przecięcia linii
        const t = new THREE.Vector3().crossVectors(qmp, s).dot(rxs) / rxsLenSq;
        const u = new THREE.Vector3().crossVectors(qmp, r).dot(rxs) / rxsLenSq;
        // Jeśli t i u mieszczą się w [0,1], to odcinki się przecinają
        if (t >= -epsilon && t <= 1 + epsilon && u >= -epsilon && u <= 1 + epsilon) {
            return p1.clone().add(r.multiplyScalar(t));
        }
        return null;
    }
    bilbordgen(points, camera, skips) {
        const bilboards = new THREE.Object3D;
        for (let i = 0; i < points.length - 1; i += skips) {
            let bil = new Bilbord(points[i], points[i + 1]);
            const camPos = camera.getPosition();
            const geom = bil.generateMesh(camPos);
            const geoBuffer = new THREE.BufferGeometry().setFromPoints(geom);
            const basicMaterial = new THREE.MeshBasicMaterial({
                transparent: true
            });
            const bilbord = new THREE.Mesh(geoBuffer, basicMaterial);
            bilbord.userData = { A: points[i].clone(), B: points[i + 1].clone() };
            bilboards.add(bilbord);
        }
        return bilboards;
    }
    genSnapToLine(bil, point) {
        const mesh = bil;
        const userData = mesh.userData;
        const A = userData.A.clone();
        const B = userData.B.clone();
        const AB = new THREE.Vector3().subVectors(B, A);
        const AP = new THREE.Vector3().subVectors(point, A);
        const abLenSq = AB.lengthSq();
        if (abLenSq < 1e-6)
            return A.clone();
        let t = AP.dot(AB) / abLenSq;
        //  Limiting t parameter for point to be excaclny between the points
        t = Math.max(0, Math.min(1, t));
        return A.clone().add(AB.multiplyScalar(t));
    }
    generateSnapTable(points) {
        let snapTable = [];
        // All vertexes + middles
        var i = 0;
        while (i < points.length - 1) {
            var theMiddle = new THREE.Vector3().lerpVectors(points[i], points[i + 1], 0.5);
            snapTable.push(theMiddle);
            snapTable.push(points[i]);
            i = i + 1;
        }
        snapTable.push(points[i]);
        // Heights of all posible triangles
        for (let i = 0; i < points.length - 3; i += 4) {
            this.heightsProjection(points[i], points[i + 1], points[i + 2], snapTable);
        }
        for (let i = 0; i < this.lineBuffer.length - 1; i++) {
            for (let j = i + 1; j < this.lineBuffer.length; j++) {
                const intersection = this.getLineIntersection(this.lineBuffer[i], this.lineBuffer[j]);
                if (intersection)
                    snapTable.push(intersection);
            }
        }
        return snapTable;
    }
    generateLineSnapTable(points) {
        let snapTable = [];
        // All vertexes + middles
        var i = 0;
        while (i < points.length - 1) {
            var theMiddle = new THREE.Vector3().lerpVectors(points[i], points[i + 1], 0.5);
            snapTable.push(theMiddle);
            i = i + 2;
        }
        return snapTable;
    }
    heightsProjection(A, B, C, snapTable) {
        let AB = new THREE.Vector3().subVectors(B, A);
        let AC = new THREE.Vector3().subVectors(C, A);
        let BC = new THREE.Vector3().subVectors(C, B);
        // Height from A to BC
        let BA = new THREE.Vector3().subVectors(A, B);
        const t1 = BA.dot(BC) / BC.dot(BC);
        snapTable.push(B.clone().add(BC.clone().multiplyScalar(t1)));
        // Height from B to AC  
        let AB_for_t2 = new THREE.Vector3().subVectors(B, A);
        const t2 = AB_for_t2.dot(AC) / AC.dot(AC);
        snapTable.push(A.clone().add(AC.clone().multiplyScalar(t2)));
        // Height from C to AB
        let CA = new THREE.Vector3().subVectors(C, A);
        const t3 = CA.dot(AB) / AB.dot(AB);
        snapTable.push(A.clone().add(AB.clone().multiplyScalar(t3)));
    }
    findClosestPoint(targetPoint, snapList, bil) {
        var i = 0;
        var currentDistance = Infinity;
        var finalPoint = new THREE.Vector3;
        console.log(snapList.length);
        while (i < snapList.length) {
            const dist = targetPoint.distanceTo(snapList[i]);
            if (dist < currentDistance) {
                currentDistance = dist;
                finalPoint = snapList[i];
            }
            i = i + 1;
        }
        if (finalPoint.distanceTo(targetPoint) > 0.15) {
            return this.genSnapToLine(bil, targetPoint);
        }
        return finalPoint;
    }
    generateAngle(A, B, C) {
        let vertices = [];
        let radius = 0.40;
        let BA = new THREE.Vector3().subVectors(A, B).normalize();
        let BC = new THREE.Vector3().subVectors(C, B).normalize();
        let angleBet = Math.acos(BA.dot(BC));
        let planeNormal = new THREE.Vector3().crossVectors(BC, BA).normalize();
        let right = BC.clone();
        let up = new THREE.Vector3().crossVectors(planeNormal, right).normalize();
        // Check if angle is approximately 90 degrees (right angle)
        const isRightAngle = Math.abs(angleBet - Math.PI / 2) < 0.01; // tolerance of ~0.57 degrees
        if (isRightAngle) {
            radius /= 2;
            // Create a square for right angles
            const corner1 = B.clone().add(right.clone().multiplyScalar(radius));
            const corner2 = B.clone().add(right.clone().multiplyScalar(radius)).add(up.clone().multiplyScalar(radius));
            const corner3 = B.clone().add(up.clone().multiplyScalar(radius));
            vertices.push(corner1);
            vertices.push(corner2);
            vertices.push(corner3);
        }
        else {
            // Original arc behavior for non-right angles
            for (let i = 0; i <= 32; i++) {
                let angle = i * (angleBet / 32.0);
                let point = B.clone().add(right.clone().multiplyScalar(radius * Math.cos(angle))).add(up.clone().multiplyScalar(radius * Math.sin(angle)));
                vertices.push(point);
            }
        }
        return vertices;
    }
    setDrawingType(type) {
        this.drawingType = type;
    }
}
