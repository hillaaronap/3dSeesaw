//var rel={x:0,y:0};
function initializeListeners(){
	
	domEvents.addEventListener(controlArrow[0],'click', function(){
		//console.log("+1x");
		forceMove(1,0,0);
	}, false);
	domEvents.addEventListener(controlArrow[1],'click', function(){
		//console.log("-1x");
		forceMove(-1,0,0);
	}, false);

	camControls.onChange(function(value){
		controls.enabled = value;
	});
	
	fMagControls.onChange(function(value){
		forceGeom = generateForceGeom(value);
		forceVect.children[0].geometry.dispose();
		forceVect.children[0].geometry = forceGeom;
		updateTorque();
		//forceVect.position.setY(.25);
	});
	
	torqueDisplay.onChange(function(value){
		if(value){
			scene.add(torque);
		}
		else{
			scene.remove(torque);
		}
	});
	netTorqueDisplay.onChange(function(value){
		if(value){
			scene.add(netTorque);
		}
		else{
			scene.remove(netTorque);
		}
	});
	maDisplay.onChange(function(value){
		if(value){
			scene.add(ma);
		}
		else{
			scene.remove(ma);
		}
	});
	
	loaDisplay.onChange(function(value){
		if(value){
			scene.add(loa);
		}
		else{
			scene.remove(loa);
		}
	});
	
	radDisplay.onChange(function(value){
		if(value){
			scene.add(rad);
		}
		else{
			scene.remove(rad);
		}
	});
	
}


