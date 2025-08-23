# Copilot API Proxy

> [!WARNING]
> This is a reverse-engineered proxy of GitHub Copilot API. It is not supported by GitHub, and may break unexpectedly. Use at your own risk.

> [!WARNING]
> **GitHub Security Notice:**  
> Excessive automated or scripted use of Copilot (including rapid or bulk requests, such as via automated tools) may trigger GitHub's abuse-detection systems.  
> You may receive a warning from GitHub Security, and further anomalous activity could result in temporary suspension of your Copilot access.
>
> GitHub prohibits use of their servers for excessive automated bulk activity or any activity that places undue burden on their infrastructure.
>
> Please review:
>
> - [GitHub Acceptable Use Policies](https://docs.github.com/site-policy/acceptable-use-policies/github-acceptable-use-policies#4-spam-and-inauthentic-activity-on-github)
> - [GitHub Copilot Terms](https://docs.github.com/site-policy/github-terms/github-terms-for-additional-products-and-features#github-copilot)
>
> Use this proxy responsibly to avoid account restrictions.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/E1E519XS7W)

---

**Note:** If you are using [opencode](https://github.com/sst/opencode), you do not need this project. Opencode supports GitHub Copilot provider out of the box.

---

## Project Overview

A reverse-engineered proxy for the GitHub Copilot API that exposes it as an OpenAI and Anthropic compatible service. This allows you to use GitHub Copilot with any tool that supports the OpenAI Chat Completions API or the Anthropic Messages API, including to power [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview).

## Features

- **OpenAI & Anthropic Compatibility**: Exposes GitHub Copilot as an OpenAI-compatible (`/v1/chat/completions`, `/v1/models`, `/v1/embeddings`) and Anthropic-compatible (`/v1/messages`) API.
- **Claude Code Integration**: Easily configure and launch [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) to use Copilot as its backend with a simple command-line flag (`--claude-code`).
- **Usage Dashboard**: A web-based dashboard to monitor your Copilot API usage, view quotas, and see detailed statistics.
- **Rate Limit Control**: Manage API usage with rate-limiting options (`--rate-limit`) and a waiting mechanism (`--wait`) to prevent errors from rapid requests.
- **Manual Request Approval**: Manually approve or deny each API request for fine-grained control over usage (`--manual`).
- **Token Visibility**: Option to display GitHub and Copilot tokens during authentication and refresh for debugging (`--show-token`).
- **Flexible Authentication**: Authenticate interactively or provide a GitHub token directly, suitable for CI/CD environments.
- **Support for Different Account Types**: Works with individual, business, and enterprise GitHub Copilot plans.

## Demo

https://github.com/user-attachments/assets/7654b383-669d-4eb9-b23c-06d7aefee8c5

## Prerequisites

- Bun (>= 1.2.x)
- GitHub account with Copilot subscription (individual, business, or enterprise)

## Installation

To install dependencies, run:

```sh
bun install
```

## Using with Docker

Build image

```sh
docker build -t copilot-api .
```

Run the container

```sh
# Create a directory on your host to persist the GitHub token and related data
mkdir -p ./copilot-data

# Run the container with a bind mount to persist the token
# This ensures your authentication survives container restarts

docker run -p 4141:4141 -v $(pwd)/copilot-data:/root/.local/share/copilot-api copilot-api
```

> **Note:**
> The GitHub token and related data will be stored in `copilot-data` on your host. This is mapped to `/root/.local/share/copilot-api` inside the container, ensuring persistence across restarts.

### Docker with Environment Variables

You can pass the GitHub token directly to the container using environment variables:

```sh
# Build with GitHub token
docker build --build-arg GH_TOKEN=your_github_token_here -t copilot-api .

# Run with GitHub token
docker run -p 4141:4141 -e GH_TOKEN=your_github_token_here copilot-api

# Run with additional options
docker run -p 4141:4141 -e GH_TOKEN=your_token copilot-api start --verbose --port 4141
```

### Docker Compose Example

```yaml
version: "3.8"
services:
  copilot-api:
    build: .
    ports:
      - "4141:4141"
    environment:
      - GH_TOKEN=your_github_token_here
    restart: unless-stopped
```

The Docker image includes:

- Multi-stage build for optimized image size
- Non-root user for enhanced security
- Health check for container monitoring
- Pinned base image version for reproducible builds

## Using with npx

You can run the project directly using npx:

```sh
npx copilot-api@latest start
```

With options:

```sh
npx copilot-api@latest start --port 8080
```

For authentication only:

```sh
npx copilot-api@latest auth
```

## Command Structure

Copilot API now uses a subcommand structure with these main commands:

- `start`: Start the Copilot API server. This command will also handle authentication if needed.
- `auth`: Run GitHub authentication flow without starting the server. This is typically used if you need to generate a token for use with the `--github-token` option, especially in non-interactive environments.
- `check-usage`: Show your current GitHub Copilot usage and quota information directly in the terminal (no server required).
- `debug`: Display diagnostic information including version, runtime details, file paths, and authentication status. Useful for troubleshooting and support.

## Command Line Options

### Start Command Options

The following command line options are available for the `start` command:

| Option         | Description                                                                   | Default    | Alias |
| -------------- | ----------------------------------------------------------------------------- | ---------- | ----- |
| --port         | Port to listen on                                                             | 4141       | -p    |
| --host         | Host/IP address for external access (defaults to localhost for local use)    | localhost  | -h    |
| --verbose      | Enable verbose logging                                                        | false      | -v    |
| --account-type | Account type to use (individual, business, enterprise)                        | individual | -a    |
| --manual       | Enable manual request approval                                                | false      | none  |
| --rate-limit   | Rate limit in seconds between requests                                        | none       | -r    |
| --wait         | Wait instead of error when rate limit is hit                                  | false      | -w    |
| --github-token | Provide GitHub token directly (must be generated using the `auth` subcommand) | none       | -g    |
| --claude-code  | Generate a command to launch Claude Code with Copilot API config              | false      | -c    |
| --show-token   | Show GitHub and Copilot tokens on fetch and refresh                           | false      | none  |

### Auth Command Options

| Option       | Description               | Default | Alias |
| ------------ | ------------------------- | ------- | ----- |
| --verbose    | Enable verbose logging    | false   | -v    |
| --show-token | Show GitHub token on auth | false   | none  |

### Debug Command Options

| Option | Description               | Default | Alias |
| ------ | ------------------------- | ------- | ----- |
| --json | Output debug info as JSON | false   | none  |

## Remote Server Deployment

You can run the Copilot API proxy on a remote server and connect to it from your local computer using Claude Code. This is useful when you want to centralize the proxy service or run it on a more powerful machine.

### Running on a Remote Server

To run the proxy on a remote server, use the `--host` parameter to specify the server's external IP address or hostname:

```bash
# On your remote server (replace with your server's IP/hostname)
npx copilot-api@latest start --host 192.168.1.100 --port 4141
```

Or with your server's domain name:

```bash
npx copilot-api@latest start --host myserver.example.com --port 4141
```

When you specify a `--host` parameter, the server will:
- Bind to `0.0.0.0` to accept connections from any interface
- Generate Claude Code configuration URLs using your specified hostname
- Display the correct external URL in the Usage Viewer

### Connecting Claude Code to Remote Server

#### Option 1: Interactive Setup

Use the `--claude-code` flag with the `--host` parameter:

```bash
# This will generate the correct environment variables for your remote server
npx copilot-api@latest start --host 192.168.1.100 --claude-code
```

The generated command will include the correct `ANTHROPIC_BASE_URL` pointing to your remote server.

#### Option 2: Manual Configuration

Create a `.claude/settings.json` file in your local project with the remote server URL:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://192.168.1.100:4141",
    "ANTHROPIC_AUTH_TOKEN": "dummy",
    "ANTHROPIC_MODEL": "gpt-4.1",
    "ANTHROPIC_SMALL_FAST_MODEL": "gpt-4.1"
  }
}
```

Replace `192.168.1.100:4141` with your actual server hostname/IP and port.

### Security Considerations

When running on a remote server:
- Consider using HTTPS/TLS encryption if transmitting over the internet
- Use firewall rules to restrict access to trusted networks
- The GitHub and Copilot tokens are stored on the remote server, not transmitted to clients

## 远程Ubuntu服务器部署指南 (Chinese Guide)

### 概述

此代理可以在远程Ubuntu服务器上运行，并通过互联网连接到本地计算机上的Claude Code。这对于希望在更强大的服务器上集中运行代理服务的情况非常有用。

### 🎯 回答您的问题 (Answers to Your Questions)

#### Q1: 如何在服务器上安装自定义版本？
**A**: 由于这是您修改过的版本，需要从源码安装而不是使用npm。请参考下面的"从源码安装"部分。

#### Q2: SSH端口与服务端口是否冲突？
**A**: **不会冲突！** SSH端口(如您的1234)和copilot-api服务端口(默认4141)是完全不同的服务：
- SSH端口(1234): 用于终端连接服务器 `ssh -p 1234 hhao@166.111.25.29`
- Copilot-API端口(4141): 用于HTTP API服务，供Claude Code连接使用
- 这两个端口互不影响，可以同时使用

#### Q3: 具体启动命令是什么？
**A**: 根据安装方式不同：
- **官方版本**: `npx copilot-api@latest start --host YOUR_SERVER_IP --port 4141 --claude-code`
- **自定义版本**: `bun run start --host YOUR_SERVER_IP --port 4141 --claude-code`

---

### 在Ubuntu服务器上部署

#### 安装方式选择

根据您的情况选择合适的安装方式：

**方式A: 从源码安装（推荐用于自定义版本）**
**方式B: 从npm安装（适用于官方版本）**

#### 🚀 方式A: 从源码安装（自定义版本）

##### 第一步：准备服务器环境

1. **SSH连接到你的Ubuntu服务器**：
   ```bash
   ssh -p 1234 hhao@166.111.25.29  # 使用您的实际SSH端口和服务器地址
   ```

2. **安装必要的系统依赖**：
   ```bash
   # 更新软件包列表
   sudo apt update
   
   # 安装git和基础编译工具
   sudo apt install git curl build-essential -y
   ```

3. **安装Bun运行时**（推荐，性能更好）：
   ```bash
   curl -fsSL https://bun.sh/install | bash
   source ~/.bashrc
   bun --version
   ```

##### 第二步：下载和构建代码

1. **克隆您的自定义代码到服务器**：
   ```bash
   # 克隆您的仓库
   git clone https://github.com/tonyhaohan/copilot-api.git
   cd copilot-api
   ```

2. **安装依赖并构建项目**：
   ```bash
   # 安装依赖
   bun install
   
   # 构建项目
   bun run build
   
   # 验证构建成功
   ls -la dist/
   ```

##### 第三步：运行身份验证和启动服务

1. **首次身份验证**：
   ```bash
   bun run start auth
   ```
   按照提示完成GitHub身份验证。

2. **启动服务器**：
   ```bash
   # 使用您的服务器IP地址
   bun run start --host 166.111.25.29 --port 4141 --claude-code
   
   # 或者使用0.0.0.0监听所有接口
   bun run start --host 0.0.0.0 --port 4141 --claude-code
   ```

---

#### 🏢 方式B: 从npm安装（官方版本）

##### 第一步：准备服务器环境（npm方式）

1. **SSH连接到你的Ubuntu服务器**：
   ```bash
   ssh -p 1234 hhao@166.111.25.29  # 使用您的实际SSH端口和服务器地址
   ```

2. **安装Node.js和npm**：
   ```bash
   # 更新软件包列表
   sudo apt update
   
   # 安装Node.js和npm
   sudo apt install nodejs npm -y
   
   # 验证安装
   node --version
   npm --version
   ```

3. **可选：安装Bun运行时**（推荐，性能更好）：
   ```bash
   curl -fsSL https://bun.sh/install | bash
   source ~/.bashrc
   bun --version
   ```

##### 第二步：在服务器上运行Copilot API（npm方式）

1. **运行身份验证**（首次使用）：
   ```bash
   npx copilot-api@latest auth
   ```
   按照提示完成GitHub身份验证。

2. **启动服务器并配置外部访问**：
   ```bash
   # 使用服务器的外部IP地址
   npx copilot-api@latest start --host 166.111.25.29 --port 4141 --claude-code
   
   # 或者使用域名（如果有）
   npx copilot-api@latest start --host your-domain.com --port 4141 --claude-code
   ```

---

#### 🔒 第三步：配置防火墙（重要 - 两种方式都需要）

为了安全起见，建议配置防火墙规则：

```bash
# 允许SSH连接（确保不会断开当前连接）
# 注意：如果您的SSH端口不是默认的22，请相应调整
sudo ufw allow 1234/tcp  # 允许您的SSH端口1234

# 允许copilot-api服务端口访问（4141是默认端口）
sudo ufw allow 4141/tcp

# 启用防火墙
sudo ufw enable

# 检查状态
sudo ufw status
```

**重要说明**：
- SSH端口(1234)和copilot-api端口(4141)是不同的服务，不会冲突
- SSH用于终端连接，copilot-api用于HTTP API服务
- 确保两个端口都允许通过防火墙

#### 🎉 第四步：验证部署成功

服务启动后，您应该看到类似以下输出：

```
✅ GitHub Copilot API 代理启动成功！
🌐 服务地址: http://166.111.25.29:4141
📊 使用监控: https://ericc-ch.github.io/copilot-api?endpoint=http://166.111.25.29:4141/usage

📋 已复制Claude Code启动命令到剪贴板：
export ANTHROPIC_BASE_URL=http://166.111.25.29:4141 ANTHROPIC_AUTH_TOKEN=dummy ANTHROPIC_MODEL=gpt-4o ANTHROPIC_SMALL_FAST_MODEL=gpt-4o && claude
```

### 💻 本地电脑配置Claude Code

#### 方法一：使用自动生成的命令（推荐）

1. **复制服务器显示的环境变量命令**，它看起来像这样：
   ```bash
   export ANTHROPIC_BASE_URL=http://166.111.25.29:4141 ANTHROPIC_AUTH_TOKEN=dummy ANTHROPIC_MODEL=gpt-4o ANTHROPIC_SMALL_FAST_MODEL=gpt-4o && claude
   ```

2. **在本地终端中运行该命令**启动Claude Code。

#### 方法二：手动配置settings.json

1. **在本地项目根目录创建`.claude/settings.json`文件**：
   ```json
   {
     "env": {
       "ANTHROPIC_BASE_URL": "http://166.111.25.29:4141",
       "ANTHROPIC_AUTH_TOKEN": "dummy",
       "ANTHROPIC_MODEL": "gpt-4o",
       "ANTHROPIC_SMALL_FAST_MODEL": "gpt-4o"
     }
   }
   ```

2. **将`166.111.25.29`替换为你的服务器实际IP地址或域名**。

3. **正常启动Claude Code**，它将自动使用这些设置。

### 🔒 使用SSH隧道（可选，更安全）

如果你不想将服务器端口暴露到互联网，可以使用SSH隧道：

#### 在本地电脑上设置SSH隧道：

```bash
# 建立SSH隧道，将本地4141端口转发到服务器的4141端口
ssh -p 1234 -L 4141:localhost:4141 hhao@166.111.25.29 -N

# 或者保持会话活跃的方式
ssh -p 1234 -L 4141:localhost:4141 hhao@166.111.25.29
```

#### 在服务器上运行（使用localhost）：

**源码安装方式**：
```bash
bun run start --port 4141 --claude-code
```

**npm安装方式**：
```bash
npx copilot-api@latest start --port 4141 --claude-code
```

#### 在本地配置Claude Code使用localhost：

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://localhost:4141",
    "ANTHROPIC_AUTH_TOKEN": "dummy",
    "ANTHROPIC_MODEL": "gpt-4.1",
    "ANTHROPIC_SMALL_FAST_MODEL": "gpt-4.1"
  }
}
```

### 安全建议

#### 对于互联网暴露的服务器：

1. **使用防火墙**限制访问：
   ```bash
   # 只允许特定IP访问
   sudo ufw allow from YOUR_LOCAL_IP to any port 4141
   
   # 删除通用规则
   sudo ufw delete allow 4141
   ```

2. **考虑使用反向代理**（如nginx）添加HTTPS支持：
   ```bash
   # 安装nginx
   sudo apt install nginx -y
   
   # 配置反向代理和SSL证书
   ```

3. **使用systemd服务**保持服务运行：
   
   创建服务文件 `/etc/systemd/system/copilot-api.service`：
   ```ini
   [Unit]
   Description=GitHub Copilot API Proxy
   After=network.target
   
   [Service]
   Type=simple
   User=your-username
   WorkingDirectory=/home/your-username
   ExecStart=/usr/bin/npx copilot-api@latest start --host YOUR_SERVER_IP --port 4141
   Restart=always
   RestartSec=10
   
   [Install]
   WantedBy=multi-user.target
   ```
   
   启用服务：
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable copilot-api
   sudo systemctl start copilot-api
   sudo systemctl status copilot-api
   ```

#### 对于SSH隧道方式：

1. **保持SSH隧道连接稳定**：
   ```bash
   # 使用autossh保持连接
   sudo apt install autossh -y
   autossh -M 20000 -L 4141:localhost:4141 your-username@your-server-ip -N
   ```

2. **配置SSH密钥认证**（推荐）：
   ```bash
   # 在本地生成SSH密钥对（如果还没有）
   ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
   
   # 将公钥复制到服务器
   ssh-copy-id your-username@your-server-ip
   ```

### 故障排除

#### 常见问题：

1. **连接被拒绝**：
   - 检查防火墙设置
   - 确认服务器正在运行并监听正确端口
   - 验证IP地址和端口号

2. **身份验证失败**：
   - 在服务器上重新运行 `npx copilot-api@latest auth`
   - 检查GitHub Copilot订阅状态

3. **性能问题**：
   - 考虑使用更靠近的服务器
   - 检查网络延迟和带宽

4. **Claude Code无法连接**：
   - 验证 `ANTHROPIC_BASE_URL` 设置
   - 检查本地网络防火墙设置
   - 确认服务器服务正常运行

### 验证部署

1. **检查服务器状态**：
   ```bash
   curl http://YOUR_SERVER_IP:4141/v1/models
   ```

2. **查看使用监控器**：
   打开浏览器访问：`https://ericc-ch.github.io/copilot-api?endpoint=http://YOUR_SERVER_IP:4141/usage`

3. **测试Claude Code连接**：
   使用配置好的环境变量启动Claude Code并发送测试消息。

### 完整部署示例

#### 服务器端完整命令序列：

```bash
# 1. 连接到服务器
ssh your-username@your-server-ip

# 2. 更新系统和安装依赖
sudo apt update && sudo apt install nodejs npm -y

# 3. 身份验证
npx copilot-api@latest auth

# 4. 启动服务（替换为你的实际IP）
npx copilot-api@latest start --host 123.456.789.123 --port 4141 --claude-code

# 5. 配置防火墙
sudo ufw allow ssh
sudo ufw allow 4141
sudo ufw enable
```

#### 本地端配置：

1. **复制服务器输出的环境变量命令**
2. **在本地终端运行该命令启动Claude Code**

这样配置完成后，你的本地Claude Code就可以通过互联网连接到远程Ubuntu服务器上的GitHub Copilot API代理服务了。

## 📋 针对您问题的完整回答 (Complete Answers to Your Questions)

### ❓ Q1: 自定义版本如何在服务器上安装？

**答**: 由于这是您修改过的版本，需要从源码安装。完整步骤：

```bash
# 1. SSH连接到您的服务器
ssh -p 1234 hhao@166.111.25.29

# 2. 安装必要依赖
sudo apt update
sudo apt install git curl build-essential -y

# 3. 安装Bun运行时
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# 4. 克隆您的代码
git clone https://github.com/tonyhaohan/copilot-api.git
cd copilot-api

# 5. 安装依赖并构建
bun install
bun run build

# 6. 首次身份验证
bun run start auth

# 7. 启动服务
bun run start --host 166.111.25.29 --port 4141 --claude-code
```

### ❓ Q2: SSH端口与服务端口是否冲突？

**答**: **完全不会冲突！** 这是两个不同的服务：

| 服务 | 端口 | 用途 | 协议 |
|------|------|------|------|
| SSH | 1234 | 终端连接服务器 | SSH协议 |
| Copilot-API | 4141 | HTTP API服务 | HTTP协议 |

- SSH端口用于您远程登录服务器：`ssh -p 1234 hhao@166.111.25.29`
- Copilot-API端口用于Claude Code连接HTTP服务：`http://166.111.25.29:4141`
- 两者可以同时运行，互不影响

### ❓ Q3: 具体的启动命令是什么？

**答**: 根据安装方式选择对应命令：

#### 源码安装启动命令（推荐给您）:
```bash
# 基本启动
bun run start --host 166.111.25.29 --port 4141 --claude-code

# 带详细日志
bun run start --host 166.111.25.29 --port 4141 --claude-code --verbose

# 如果需要速率限制（每10秒一个请求）
bun run start --host 166.111.25.29 --port 4141 --claude-code --rate-limit 10
```

#### npm安装启动命令（如果使用官方版本）:
```bash
npx copilot-api@latest start --host 166.111.25.29 --port 4141 --claude-code
```

### ✅ 防火墙配置（重要）

确保两个端口都能通过防火墙：

```bash
# 允许SSH端口（确保不会断开连接）
sudo ufw allow 1234/tcp

# 允许Copilot API端口
sudo ufw allow 4141/tcp

# 启用防火墙
sudo ufw enable

# 检查状态
sudo ufw status
```

### 🎯 启动成功标志

当服务启动成功时，您会看到类似输出：

```
✅ GitHub Copilot API 代理启动成功！
🌐 服务地址: http://166.111.25.29:4141
📊 使用监控: https://ericc-ch.github.io/copilot-api?endpoint=http://166.111.25.29:4141/usage

📋 已复制Claude Code启动命令到剪贴板：
export ANTHROPIC_BASE_URL=http://166.111.25.29:4141 ANTHROPIC_AUTH_TOKEN=dummy ANTHROPIC_MODEL=gpt-4o ANTHROPIC_SMALL_FAST_MODEL=gpt-4o && claude
```

### 💻 在本地使用Claude Code

复制上面的命令，在本地终端运行即可：

```bash
export ANTHROPIC_BASE_URL=http://166.111.25.29:4141 ANTHROPIC_AUTH_TOKEN=dummy ANTHROPIC_MODEL=gpt-4o ANTHROPIC_SMALL_FAST_MODEL=gpt-4o && claude
```

---

## 回答你的问题 (Answer to Your Question)

**是的，此项目已经完全实现了你的目标！** 

你想要实现的功能——让Ubuntu服务器运行本项目，然后本地的Claude Code直接与服务器转发的copilot api通信——在之前的修改中已经完成了。具体来说：

### ✅ 已实现的功能：

1. **远程服务器支持**：`--host` 参数让服务器绑定到 `0.0.0.0`，接受外部连接
2. **Claude Code自动配置**：`--claude-code` 参数自动生成正确的环境变量，指向你的远程服务器
3. **完整的部署流程**：包含从服务器设置到本地客户端配置的完整说明

### 🔧 如何操作：

**在你的Ubuntu服务器上：**
```bash
# 安装依赖并认证
sudo apt install nodejs npm -y
npx copilot-api@latest auth

# 启动服务（用你的实际服务器IP替换）
npx copilot-api@latest start --host YOUR_SERVER_IP --port 4141 --claude-code
```

**在你的本地电脑上：**
- 复制服务器输出的环境变量命令并运行，或
- 创建 `.claude/settings.json` 文件配置远程服务器地址

### 🛡️ 安全建议：
- 配置防火墙规则
- 考虑使用SSH隧道（如果不想暴露端口到互联网）
- 设置systemd服务保持运行

**结论：项目的现有代码已经支持你的需求，上面的中文文档提供了完整的部署指南！**

---

## Summary of Remote Server Support

**✅ The project now fully supports your use case!**

The existing codebase already provides all the functionality needed to run the Copilot API proxy on a remote Ubuntu server and connect Claude Code from your local computer:

### What's Already Working:

1. **Remote Server Deployment**: The `--host` parameter allows the server to bind to `0.0.0.0` and accept external connections
2. **Claude Code Integration**: The `--claude-code` flag automatically generates the correct environment variables for remote connections
3. **Automatic Configuration**: Server URLs are correctly constructed using your specified hostname/IP
4. **Security Features**: Built-in support for rate limiting, manual approval, and token management

### What Was Added:

- **Comprehensive Chinese Documentation**: Complete step-by-step instructions in Chinese for Ubuntu server deployment
- **Security Guidance**: Firewall configuration, SSH tunneling, and systemd service setup instructions
- **Troubleshooting Section**: Common issues and solutions for remote deployments
- **Multiple Deployment Options**: Direct internet access and SSH tunnel approaches

### Quick Start Commands:

**On your Ubuntu server:**
```bash
npx copilot-api@latest auth
npx copilot-api@latest start --host YOUR_SERVER_IP --port 4141 --claude-code
```

**On your local computer:**
Use the environment command generated by the server, or create a `.claude/settings.json` file with the remote server URL.

The implementation is complete and ready for your remote server deployment scenario!

## API Endpoints

The server exposes several endpoints to interact with the Copilot API. It provides OpenAI-compatible endpoints and now also includes support for Anthropic-compatible endpoints, allowing for greater flexibility with different tools and services.

### OpenAI Compatible Endpoints

These endpoints mimic the OpenAI API structure.

| Endpoint                    | Method | Description                                               |
| --------------------------- | ------ | --------------------------------------------------------- |
| `POST /v1/chat/completions` | `POST` | Creates a model response for the given chat conversation. |
| `GET /v1/models`            | `GET`  | Lists the currently available models.                     |
| `POST /v1/embeddings`       | `POST` | Creates an embedding vector representing the input text.  |

### Anthropic Compatible Endpoints

These endpoints are designed to be compatible with the Anthropic Messages API.

| Endpoint                         | Method | Description                                                  |
| -------------------------------- | ------ | ------------------------------------------------------------ |
| `POST /v1/messages`              | `POST` | Creates a model response for a given conversation.           |
| `POST /v1/messages/count_tokens` | `POST` | Calculates the number of tokens for a given set of messages. |

### Usage Monitoring Endpoints

New endpoints for monitoring your Copilot usage and quotas.

| Endpoint     | Method | Description                                                  |
| ------------ | ------ | ------------------------------------------------------------ |
| `GET /usage` | `GET`  | Get detailed Copilot usage statistics and quota information. |
| `GET /token` | `GET`  | Get the current Copilot token being used by the API.         |

## Example Usage

Using with npx:

```sh
# Basic usage with start command
npx copilot-api@latest start

# Run on custom port with verbose logging
npx copilot-api@latest start --port 8080 --verbose

# Use with a business plan GitHub account
npx copilot-api@latest start --account-type business

# Use with an enterprise plan GitHub account
npx copilot-api@latest start --account-type enterprise

# Enable manual approval for each request
npx copilot-api@latest start --manual

# Set rate limit to 30 seconds between requests
npx copilot-api@latest start --rate-limit 30

# Wait instead of error when rate limit is hit
npx copilot-api@latest start --rate-limit 30 --wait

# Provide GitHub token directly
npx copilot-api@latest start --github-token ghp_YOUR_TOKEN_HERE

# Run only the auth flow
npx copilot-api@latest auth

# Run auth flow with verbose logging
npx copilot-api@latest auth --verbose

# Show your Copilot usage/quota in the terminal (no server needed)
npx copilot-api@latest check-usage

# Display debug information for troubleshooting
npx copilot-api@latest debug

# Display debug information in JSON format
npx copilot-api@latest debug --json
```

## Using the Usage Viewer

After starting the server, a URL to the Copilot Usage Dashboard will be displayed in your console. This dashboard is a web interface for monitoring your API usage.

1.  Start the server. For example, using npx:
    ```sh
    npx copilot-api@latest start
    ```
2.  The server will output a URL to the usage viewer. Copy and paste this URL into your browser. It will look something like this:
    `https://ericc-ch.github.io/copilot-api?endpoint=http://localhost:4141/usage`
    - If you use the `start.bat` script on Windows, this page will open automatically.

The dashboard provides a user-friendly interface to view your Copilot usage data:

- **API Endpoint URL**: The dashboard is pre-configured to fetch data from your local server endpoint via the URL query parameter. You can change this URL to point to any other compatible API endpoint.
- **Fetch Data**: Click the "Fetch" button to load or refresh the usage data. The dashboard will automatically fetch data on load.
- **Usage Quotas**: View a summary of your usage quotas for different services like Chat and Completions, displayed with progress bars for a quick overview.
- **Detailed Information**: See the full JSON response from the API for a detailed breakdown of all available usage statistics.
- **URL-based Configuration**: You can also specify the API endpoint directly in the URL using a query parameter. This is useful for bookmarks or sharing links. For example:
  `https://ericc-ch.github.io/copilot-api?endpoint=http://your-api-server/usage`

## Using with Claude Code

This proxy can be used to power [Claude Code](https://docs.anthropic.com/en/claude-code), an experimental conversational AI assistant for developers from Anthropic.

There are two ways to configure Claude Code to use this proxy:

### Interactive Setup with `--claude-code` flag

To get started, run the `start` command with the `--claude-code` flag:

```sh
npx copilot-api@latest start --claude-code
```

You will be prompted to select a primary model and a "small, fast" model for background tasks. After selecting the models, a command will be copied to your clipboard. This command sets the necessary environment variables for Claude Code to use the proxy.

Paste and run this command in a new terminal to launch Claude Code.

### Manual Configuration with `settings.json`

Alternatively, you can configure Claude Code by creating a `.claude/settings.json` file in your project's root directory. This file should contain the environment variables needed by Claude Code. This way you don't need to run the interactive setup every time.

Here is an example `.claude/settings.json` file:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://localhost:4141",
    "ANTHROPIC_AUTH_TOKEN": "dummy",
    "ANTHROPIC_MODEL": "gpt-4.1",
    "ANTHROPIC_SMALL_FAST_MODEL": "gpt-4.1"
  }
}
```

You can find more options here: [Claude Code settings](https://docs.anthropic.com/en/docs/claude-code/settings#environment-variables)

You can also read more about IDE integration here: [Add Claude Code to your IDE](https://docs.anthropic.com/en/docs/claude-code/ide-integrations)

## Running from Source

The project can be run from source in several ways:

### Development Mode

```sh
bun run dev
```

### Production Mode

```sh
bun run start
```

## Usage Tips

- To avoid hitting GitHub Copilot's rate limits, you can use the following flags:
  - `--manual`: Enables manual approval for each request, giving you full control over when requests are sent.
  - `--rate-limit <seconds>`: Enforces a minimum time interval between requests. For example, `copilot-api start --rate-limit 30` will ensure there's at least a 30-second gap between requests.
  - `--wait`: Use this with `--rate-limit`. It makes the server wait for the cooldown period to end instead of rejecting the request with an error. This is useful for clients that don't automatically retry on rate limit errors.
- If you have a GitHub business or enterprise plan account with Copilot, use the `--account-type` flag (e.g., `--account-type business`). See the [official documentation](https://docs.github.com/en/enterprise-cloud@latest/copilot/managing-copilot/managing-github-copilot-in-your-organization/managing-access-to-github-copilot-in-your-organization/managing-github-copilot-access-to-your-organizations-network#configuring-copilot-subscription-based-network-routing-for-your-enterprise-or-organization) for more details.
