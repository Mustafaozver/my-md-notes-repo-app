((ATA)=>{
	const cp = require("node:child_process");
	const SGit = ATA.Require("simple-git");
	
	const config = require("./Config/0.json");
	
	const repoName = config.repoName;
	const branchName = config.branchName;
	const userName = config.GitUserName;
	const password = config.GitUserPassword;
	const email = config.GitUserEmail;
	const folderName = config.repoFolderName;// + Math.random(); // config.repoName;
	const repoPath = ATA.Path.join(ATA.CWD, "./repos/", folderName);
	
	const options = {
		baseDir: repoPath,
		binary: "git",
		maxConcurrentProcesses: 6,
		trimmed: false,
	};
	
	
	
	const Setup4 = async()=>{
		let git = null;
		let worker = null;
		
		const GetLogs = async()=>{
			return await git.log();
		};
		const GitInit = async()=>{
			await git.init();
			console.log("Git initialized. OK");
			const package = ATA.Path.join(repoPath, "./", "package.json");
			if(!ATA.FS.existsSync(package)){
				const repoUrl = "https://" + userName + ":" + password + "@github.com/" + userName + "/" + repoName + ".git";
				await git.addRemote("origin", repoUrl);
				await MakePull();
				
				console.log("Remote Server initialized. OK");
				//await Install();
				//await InstallDB();
				
			}
			return package;
		};
		const MakePull = async()=>{
			await git.reset();
			await git.pull("origin", branchName, {
				//"--rebase": "true",
				"--no-rebase": null
			});
			const logs = await GetLogs();
			const time = new Date(logs.latest.date);
			const msg = "Pulled branch \"" + branchName + "\" ( " + logs.latest.hash + " )"
				+ "\n - " + logs.latest.refs + " ( " + time.toLocaleTimeString() + " " + time.toLocaleDateString() + ")"
				+ "\n - Message => \"" + logs.latest.message + "\""
				+ "";
			console.log(msg);
		};
		
		
		const Start = ()=>{
			const working_mode = ([...process.argv][2] + "").toLowerCase();
			const projectFile = ATA.Path.join(repoPath, "./", "core.js");
			worker = wt.fork(projectFile, [working_mode], {
				cwd: repoPath,
				env :{
					
				},
				
			});
			worker.addListener("message", (data)=>{
				OnMessage(data);
			});
			worker.addListener("error", ()=>{
				OnError();
			});
			worker.addListener("exit", ()=>{
				OnExit();
			});
			setTimeout(()=>{
				worker.send({
					ID:0,
					EVAL:"(" + StartSignal + ")(ATA())"
				});
			}, 1000);
		};
		const ReStart = ()=>{
			try{
				worker.terminate();
			}catch(e){}
			try{
				Start();
			}catch(e){}
		};
		const StartSignal = (ATA)=>{
			return ATA.ID.UUID;
		};
		const OnMessage = (data)=>{
			console.log("THREAD => ", data.Answer);
		};
		const OnError = ()=>{
			setTimeout(ReStart, 1);
		};
		const OnExit = async()=>{
			await MakePull();
			setTimeout(ReStart, 1);
		};
		
		
		
		
		const Install = async()=>{
			//const node_modules = ATA.Path.join(repoPath, "./", "node_modules");
			//if(ATA.FS.existsSync(node_modules))return console.log("npm packages ready. OK");
			/*try{
				console.log("npm packages installing...");
				const execPromise = RunExec("npm i -force", {
					cwd: repoPath,
					encoding: "utf8",
					env:{}
				});
				ExtractConsolePipe(execPromise);
				await execPromise;
			}catch(e){
				
			}*/
			//console.log("npm packages are installed. OK");
			//await InstallDB();
		};
		
		const InstallDB = async()=>{
			const projectFile = ATA.Path.join(repoPath, "./", "core.js");
			const promise = new Promise((resolve, reject)=>{
				console.log("Data Base installing...");
				const worker = wt.fork(projectFile, ["install"], {
					cwd: repoPath,
				});
				worker.addListener("message", (data)=>{
					console.log(data);
				});
				worker.addListener("error", ()=>{
					reject();
				});
				worker.addListener("exit", ()=>{
					console.log("Data Base installed. OK");
					resolve();
				});
			});
			return await promise;
		};
		
		const Init = async()=>{
			MakeFolder();
			
			git = SGit.simpleGit(options);
			
			git.addConfig("user.email", email);
			git.addConfig("user.name", userName);
			
			await GitInit();
			await Install();
			
			//MakePull();
			
			ReStart();
		};
		
		Init();
	};
	
	
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
		Run("sh backup.sh").then(((resp)=>{
			console.log(" === => " + resp + " <= === ");
		}));
		
	};
	
	ATA.Setups.push(()=>{
		
		Setup();
	});
})(require("ata.js")());