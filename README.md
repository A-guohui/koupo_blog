# koupo_blog

## 开发
 
 - 安装包管理 bun 
  ```bash
    curl -fsSL https://bun.sh/install | bash
    bun --version
  ```
 - 安装依赖
  ```bash
    bun install
  ```
 - 启动
  ```bash
    bun dev
  ```

## vercel 部署问题

 - github email 与 vercel 中注册的email保持一致
 - 免费的部署需要将仓库改为 public, 并在settion中设置 branch - main