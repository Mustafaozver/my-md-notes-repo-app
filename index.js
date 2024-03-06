((ATA)=>{
	const cp = require("node:child_process");
	
	const config = require("./Config/0.json");
	
	const folderName = config.repoFolderName;
	const repoPath = ATA.Path.join(ATA.CWD, "./repos/", folderName);
	
	
	
	
	
	const MakeFolder = ()=>{
		if(!ATA.FS.existsSync(repoPath)){
			ATA.FS.mkdirSync(repoPath, {
				recursive: true,
			});
			console.log("Create Folder => ", folderName, " ", repoPath);
		}
		console.log("Folder is exist. OK");
	};
	
	const BackUp = async()=>{
		const repoPath = ATA.CWD;
		const date = new Date();
		const date_str = date.toLocaleString('tr-TR', {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric",
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
			timeZoneName: "long"
		});
		const commit_msg = "BACKUP - " + date.getTime() + " - " + date_str;
		await Run("git pull", repoPath);
		await Run("git add .", repoPath);
		await Run("git commit -m \"" + commit_msg + "\"", repoPath);
		await Run("git push", repoPath);
	};
	
	
	const Run = async(cmd="", cwd=ATA.CWD)=>{
		const child = cp.spawn("bash", ["-c", cmd], {
			cwd,
		});
		const promise = new Promise((resolve, reject)=>{
			let chunk = "";
			let fail = false;
			child.stdout.once("data", (data)=>{
				chunk += data.toString();
			});
			child.stderr.once("data", (data)=>{
				chunk += "\n\n\n" + data.toString();
				fail = true;
			});
			child.addListener("exit", (code)=>{
				console.log("EXIT CODE => ", code);
				if(fail)return reject(chunk);
				else return resolve(chunk);
			});
		});
		return await promise;
	};
	
	
	
	const Setup = ()=>{
		BackUp();
		return;
		Run("git status").then(((resp)=>{
			console.log(" === => " + resp + " <= === ");
		}));
		Run("sh backup.sh").then(((resp)=>{
			console.log(" === => " + resp + " <= === ");
		}));
		
	};
	
	ATA.Setups.push(()=>{
		
		Setup();
	});
})(require("ata.js")());