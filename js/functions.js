function generateTorqueGeom(force,lever,pivot){
	var mag = guiParams.forceMagnitude;
	var p = force.position;
	var fsin = Math.sin(force.rotation.z);
	var fcos = Math.cos(force.rotation.z);
	var lsin = 10*Math.sin(lever.rotation.z);
	var lcos = 10*Math.cos(lever.rotation.z);
	//Line of Action
	var loaMaterial = new THREE.LineBasicMaterial({color:0xff0000});
	var loaGeom = new THREE.Geometry();
	loaGeom.vertices.push(
	 new THREE.Vector3(p.x-(mag+10)*fsin, p.y+(mag+10)*fcos, 0),
	 new THREE.Vector3(p.x+(mag+10)*fsin, p.y-(mag+10)*fcos, 0)
	);
	loa = new THREE.Line(loaGeom, loaMaterial);
	
	//Moment Arm
	var maMaterial = new THREE.LineBasicMaterial({color:0xFFFFFF});
	var maGeom = new THREE.Geometry();
	var m = fsin/fcos;
	var t = (p.x + (p.y)*m)/(1+m*m);
	maGeom.vertices.push(
	 new THREE.Vector3(0,0,0),
	 new THREE.Vector3(t,t*m,0)
	);
	ma = new THREE.Line(maGeom,maMaterial);
	
	var radMaterial = new THREE.LineBasicMaterial({color:0x1a1aff});
	var radGeom = new THREE.Geometry();
	radGeom.vertices.push(
	new THREE.Vector3(lcos,lsin,0),
	new THREE.Vector3(-lcos, -lsin, 0)
	);
	rad = new THREE.Line(radGeom, radMaterial);
	
	var phi = force.rotation.z - lever.rotation.z + Math.PI/2;
	//console.log(phi, Math.sin(phi));
	var tMag = Math.sin(phi)*mag* Math.sqrt(p.x*p.x+(p.y-.25)*(p.y-.25))/5;
	//console.log(tMag);
	guiParams.torque = tMag;
	//console.log(tMag);
	guiParams.netTorque = tMag-box.weight*.8*Math.cos(lever.rotation.z);
	return generateForceGeom(tMag).translate(0,-tMag-1.5,0);
}
function generateForceGeom(mag){
	var rod= new THREE.CylinderGeometry(.125,.125,mag, 25,2).translate(0, mag/2 +.25,0);
	rod.merge(new THREE.CylinderGeometry(.4,.0,.5, 25,8).translate(0,.25,0 ) );
	return rod;
}

function updateTorque(){
	if(guiParams.loaView){
		scene.remove(loa);
	}
	if(guiParams.maView){
		scene.remove(ma);
	}
	if(guiParams.radView){
		scene.remove(rad);
	}
	torqueGeom = generateTorqueGeom(forceVect,lever,fulcrum);
	torque.children[0].geometry.dispose();
	torque.children[0].geometry = torqueGeom;
	 
	guiParams.netTorque = guiParams.torque-box.weight*.8*Math.cos(lever.rotation.z);
	
	var net = Math.abs(guiParams.netTorque);
	netTorqueGeom = generateForceGeom(net).translate(0, -(net+1.5),0);
	netTorque.children[0].geometry.dispose();
	netTorque.children[0].geometry = netTorqueGeom;
	
	netTorque.rotation.x= -Math.PI/2 * Math.sign(guiParams.netTorque);
	
	if(guiParams.radView){
		scene.add(rad);
	}
	if(guiParams.maView){
		scene.add(ma);
	}
	if(guiParams.loaView){
		scene.add(loa);
	}
}

function forceMove(x,y,z){
	
	if(guiParams.controlType == "translate"){
		x = x/2;
		var t = {x:Math.cos(forceVect.rotation.z+lever.rotation.z), y:-Math.sin(forceVect.rotation.z-lever.rotation.z), z:0};
		var l = {x:Math.cos(lever.rotation.z), y:Math.sin(lever.rotation.z), z:0};
		//console.log(t);
		var horizAxis= new THREE.Vector3(t.x,t.y,t.z);
		var leverAxis= new THREE.Vector3(l.x,l.y,l.z);
		//console.log(horizAxis, leverAxis);
		if(forceVect.position.x + x <=0 && forceVect.position.x + x >= -5 ){
			forceVect.translateOnAxis(horizAxis, x);
			cArrows.translateOnAxis(leverAxis,x);
			
		}
		else if(forceVect.position.x + x >=0){
			forceVect.position.set(0,.25,0); 
			cArrows.position.set(0, cArrows.position.y ,0);
		}
		forceVect.translateOnAxis(y_axis, y);
		forceVect.translateOnAxis(z_axis, z);
		cArrows.translateOnAxis(y_axis, y);
		cArrows.translateOnAxis(z_axis, z);
	}
	
	else if(guiParams.controlType == "tilt"){
		x = -x*Math.PI/24;
		if(forceVect.rotation.z + x < Math.PI/2 && forceVect.rotation.z + x > -Math.PI/2){
			forceVect.rotateOnAxis(z_axis, x);
		}
		forceVect.translateOnAxis(y_axis, y);
		forceVect.translateOnAxis(z_axis, z);
		cArrows.translateOnAxis(y_axis, y);
		cArrows.translateOnAxis(z_axis, z);
	}
	//scene.remove(loa, ma);
	updateTorque();
	//torque.position.setY()
}

function addWeight(){
	var boxGeom = new THREE.BoxGeometry(1,1,1,2,2,2);
	var boxMaterial = new THREE.MeshPhongMaterial({
		color:(0xdb1a40)*(box.length+1+Math.random() )/(0xFFFFFF),
		emissive:(0x440814)*(box.length+1+Math.random() ),
		side: THREE.DoubleSide,
		shading: THREE.FlatShading
	});
	boxGeom.translate(0,.5+(box.length),0);
	box.push(new THREE.Object3D() );
	box[box.length-1].add(new THREE.Mesh(boxGeom, boxMaterial) );
	
	box[box.length-1].position.set(4*Math.cos(lever.rotation.z),4*Math.sin(lever.rotation.z),0);
	scene.add(box[box.length-1]);
	box.weight = box.length*9.81*box.mass;
	updateTorque();
	updateBoxes();
}

function popWeight(){
	scene.remove(box[box.length-1]);
	box.pop();
	box.weight=box.length*9.81*box.mass;
	updateTorque();
	updateBoxes();
}

function reset(){
	while(box.length>0){
		popWeight();
	}
	lever.rotation.z = 0;
	forceVect.rotation.z = 0;
	forceVect.position.set(0,.25,0);
	cArrows.position.set(0, cArrows.position.y ,0);
	forceGeom = generateForceGeom(2.5);
	forceVect.children[0].geometry.dispose();
	forceVect.children[0].geometry = forceGeom;
	guiParams.forceMagnitude = 2.5;
	updateTorque();
	controls.reset();
	camera.position.z = 7;
	leverProps.vel = 0;
	
}

function advanceFrame(seconds){
	var Ilever = leverProps.mass*leverProps.len*leverProps.len/12;
	var Ibox = box.mass*box.length* (.8)*.8;
	var I = Ilever + Ibox;
	var alpha = guiParams.netTorque.toFixed(1)/I;
	
	leverProps.vel = leverProps.vel*(guiParams.damping);
	leverProps.vel += alpha*seconds;
	lever.rotation.z += leverProps.vel*seconds;
	forceMove(0, forceVect.position.x*leverProps.vel/10,0);
	//console.log("t:", guiParams.netTorque,"a:", alpha, "vel:",leverProps.vel, "theta:",lever.rotation.z);
	if(Math.abs(Math.sin(lever.rotation.z)) > 1.25/(leverProps.len*2.5)){
		lever.rotation.z -= leverProps.vel*seconds;
		forceMove(0, -forceVect.position.x*leverProps.vel/10,0);
		leverProps.vel = -(guiParams.damping)*leverProps.vel;
	}	
	updateTorque();
	updateBoxes();
	
	//console.log((box.weight*.8*Math.cos(lever.rotation.z)).toFixed(1));
	//console.log(guiParams.torque.toFixed(1));
	//console.log(guiParams.netTorque.toFixed(1), guiParams.netTorque);
}


function updateBoxes(){
	for(var i = 0; i<box.length; i++){
		box[i].position.set(4*Math.cos(lever.rotation.z),4*Math.sin(lever.rotation.z),0);
	}
}
