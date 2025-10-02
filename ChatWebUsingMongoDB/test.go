package main

import (
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"strconv"
	"strings"
)

var globalContainerName string

var forbiddenPorts = map[string]bool{
	"20": true, "21": true, "22": true, "23": true, "25": true, "53": true, "80": true, "443": true, "3306": true, "5432": true, "27114": true,
}

func main() {
	docifyRunWithSignal()
}

func detectBackendPort() string {
	// 1. Check .env file for PORT
	if fileExists(".env") {
		data, err := os.ReadFile(".env")
		if err == nil {
			lines := strings.Split(string(data), "\n")
			for _, line := range lines {
				if strings.HasPrefix(strings.TrimSpace(line), "PORT=") {
					port := strings.TrimSpace(strings.SplitN(line, "=", 2)[1])
					if _, err := strconv.Atoi(port); err == nil {
						return port
					}
				}
			}
		}
	}
	// 2. Fallback: Try to detect port from any .js file
	files, _ := os.ReadDir(".")
	for _, f := range files {
		if strings.HasSuffix(f.Name(), ".js") {
			data, err := os.ReadFile(f.Name())
			if err == nil {
				lines := strings.Split(string(data), "\n")
				for _, line := range lines {
					if strings.Contains(line, "listen(") {
						parts := strings.Split(line, "listen(")
						if len(parts) > 1 {
							rest := parts[1]
							rest = strings.TrimSpace(rest)
							rest = strings.Trim(rest, ")")
							rest = strings.Split(rest, ",")[0]
							port := strings.Trim(rest, ") ")
							if _, err := strconv.Atoi(port); err == nil {
								return port
							}
						}
					}
				}
			}
		}
	}
	// Default fallback
	return ""
}

func detectDBUsage() string {
	// Check for MongoDB usage in any .js file or .env
	if fileExists(".env") {
		data, err := os.ReadFile(".env")
		if err == nil && strings.Contains(string(data), "MONGO_URL") {
			return "mongodb"
		}
	}
	files, _ := os.ReadDir(".")
	for _, f := range files {
		if strings.HasSuffix(f.Name(), ".js") {
			data, err := os.ReadFile(f.Name())
			if err == nil && (strings.Contains(string(data), "mongodb") || strings.Contains(string(data), "mongoose")) {
				return "mongodb"
			}
		}
	}
	return "none"
}

func docifyRunWithSignal() {
	// Listen for Ctrl+C and run delete
	sig := make(chan os.Signal, 1)
	done := make(chan bool, 1)
	signal.Notify(sig, os.Interrupt)
	go func() {
		<-sig
		done <- true
	}()
	var response string
	var dbType string
	var entryFile string
	dbType = detectDBUsage()
	if dbType == "none" {
		fmt.Print("Is Docker Desktop running? (y/n): ")
		fmt.Scanln(&response)
		fmt.Print("Enter your main server JS file (e.g. server.js, index.js, app.js): ")
		fmt.Scanln(&entryFile)

		if entryFile != "" {
			// Try to auto-detect
			if fileExists(entryFile) {
				fmt.Printf("✅ Found entry JS file: %s\n", entryFile)
			} else {
				fmt.Println("❌ No entry JS file found. Please create server.js, index.js, or app.js, or specify the file name.")
				return
			}
		}
		if strings.ToLower(response) != "y" {
			fmt.Println("❌ Please start Docker Desktop to continue.")
			return
		}
	} else {
		fmt.Print("Is Docker Desktop running? (y/n): ")
		fmt.Scanln(&response)
		if strings.ToLower(response) != "y" {
			fmt.Println("❌ Please start Docker Desktop to continue.")
			return
		}

		fmt.Print("Enter your main server JS file (e.g. server.js, index.js, app.js): ")
		fmt.Scanln(&entryFile)
		if entryFile != "" {
			// Try to auto-detect
			if fileExists(entryFile) {
				fmt.Printf("✅ Found entry JS file: %s\n", entryFile)
			} else {
				fmt.Println("❌ No entry JS file found. Please create server.js, index.js, or app.js, or specify the file name.")
				return
			}
		}

		fmt.Print("Is your local MongoDB server running? (y/n): ")
		fmt.Scanln(&response)
		if strings.ToLower(response) != "y" {
			fmt.Println("❌ Please start your local MongoDB server to continue.")
			return
		}
	}
	projectType := detectProjectType()
	if projectType == "" {
		fmt.Println("❌ Project type not detected. Supported: Node.js, Python.")
		return
	}
	imageName := "docify-app"
	fmt.Print("Enter container name (default: docify-app): ")
	var containerName string
	fmt.Scanln(&containerName)
	if containerName == "" {
		containerName = "docify-app"
	}
	// Store containerName for later delete
	globalContainerName = containerName
	backendPort := detectBackendPort()
	if backendPort == "" || !isValidPort(backendPort) {
		fmt.Print("I am unable to fetch port of your backend. Please enter the port your backend runs on: ")
		fmt.Scanln(&backendPort)
		if !isValidPort(backendPort) {
			fmt.Println("❌ Invalid or forbidden port.")
			return
		}
	}
	fmt.Printf("Detected backend port: %s\n", backendPort)
	// DB detection
	dbType = detectDBUsage()
	if dbType == "mongodb" {
		fmt.Println("✅ Detected MongoDB usage. Your app will use local MongoDB at host.docker.internal:27017.")
	}else{
		fmt.Println("✅ No database detected in your project.")
	}
	
	// Always update Dockerfile to use the backend port
	if fileExists("Dockerfile") {
		os.Remove("Dockerfile")
	}
	generateDockerfile(projectType, backendPort , entryFile)
	fmt.Println("✅ 📦 Dockerfile generated/updated.")
	fmt.Printf("🔎 Checking for Docker containers using port %s...\n", backendPort)
	// Stop any container using the port
	stopCmd := exec.Command("powershell", "-Command", fmt.Sprintf("docker ps --filter 'publish=%s' --format '{{.ID}}' | ForEach-Object { docker stop $_ >$null 2>&1 } | Out-Null", backendPort))
	stopCmd.Stdout = nil
	stopCmd.Stderr = nil
	_ = stopCmd.Run()
	fmt.Printf("✅ 🛑 Stopped any Docker container using port %s.\n", backendPort)
	// Remove any container with the same name
	removeCmd := exec.Command("powershell", "-Command", fmt.Sprintf("docker rm -f %s >$null 2>&1", containerName))
	removeCmd.Stdout = nil
	removeCmd.Stderr = nil
	_ = removeCmd.Run()
	fmt.Printf("🗑️ Removed any container named %s.\n", containerName)
	fmt.Printf("🔨 Building Docker image '%s'...\n", imageName)
	buildCmd := exec.Command("docker", "build", "-t", imageName, ".")
	buildCmd.Stdout = os.Stdout
	buildCmd.Stderr = os.Stderr
	if err := buildCmd.Run(); err != nil {
		fmt.Println("❌ Docker build failed:", err)
		return
	}
	fmt.Println("📦 Docker image built successfully!")
	fmt.Println("🚀 Running Docker container...")
	// Automatically set MONGO_URL for Docker container to use host.docker.internal
	envVars := os.Environ()
	envVars = append(envVars, "MONGO_URL=mongodb://host.docker.internal:27017/chatsAppDocker")
	runCmd := exec.Command("docker", "run", "--name", containerName, "-p", backendPort+":"+backendPort, "-e", "MONGO_URL=mongodb://host.docker.internal:27017/chatsAppDocker", imageName)
	runCmd.Env = envVars
	runCmd.Stdout = os.Stdout
	runCmd.Stderr = os.Stderr
	if err := runCmd.Start(); err != nil {
		fmt.Println("❌ Docker run failed:", err)
		return
	}
	fmt.Printf("🌐 Visit http://localhost:%s to access your project.\n", backendPort)
	fmt.Println("🟢 Container started. Press Ctrl+C to stop.")
	<-done
	var delResponse string
	fmt.Print("Do you want to delete the container? (y/n): ")
	fmt.Scanln(&delResponse)
	if strings.ToLower(delResponse) == "y" {
		docifyDelete()
	}
}

func docifyDelete() {
	fmt.Printf("🛑 Stopping and removing container '%s'...\n", globalContainerName)
	cmd := exec.Command("docker", "rm", "-f", globalContainerName)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	_ = cmd.Run()
	fmt.Println("🗑️ Container removed.")
}

func isValidPort(port string) bool {
	if forbiddenPorts[port] {
		return false
	}
	p, err := strconv.Atoi(port)
	return err == nil && p > 1024 && p < 65535
}

func checkDocker() bool {
	_, err := exec.LookPath("docker")
	return err == nil
}

func isDockerRunning() bool {
	cmd := exec.Command("docker", "info")
	return cmd.Run() == nil
}

func detectProjectType() string {
	if fileExists("package.json") {
		return "node"
	}
	if fileExists("requirements.txt") {
		return "python"
	}
	return ""
}

func fileExists(name string) bool {
	_, err := os.Stat(name)
	return err == nil
}

func generateDockerfile(projectType string, port string, entryFile string) {
	var dockerfile string
	if projectType == "node" {
		dockerfile = fmt.Sprintf(`FROM node:18
WORKDIR /app
COPY . .
RUN npm install
EXPOSE %s
CMD ["node", "%s"]
`, port, entryFile)
	} else if projectType == "python" {
		dockerfile = fmt.Sprintf(`FROM python:3.11
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
EXPOSE %s
CMD ["python", "%s"]
`, port, entryFile)
	}
	os.WriteFile("Dockerfile", []byte(dockerfile), 0644)
}
