# aws-gui-to-cli-visual

An animated, beginner-friendly diagram showing how Ravi creates an S3 bucket in the AWS Console (GUI), launches an Amazon Linux 2023 EC2 instance, installs and configures AWS CLI v2, and lists his bucket with `aws s3 ls`.

> **Cost warning:** AWS resources and usage may incur charges. Free-tier eligibility varies by account, Region and instance type. Stop or terminate the EC2 instance and delete test buckets when finished.

## 1. What it teaches
How S3 buckets are created in the GUI, how EC2 is launched and reached, how Amazon Linux is updated, how AWS CLI v2 is installed, how IAM credentials work, how `aws configure` stores them, and how a CLI request reaches S3.

## 2. Architecture
The Console and the CLI are **two different interfaces to the same AWS resources**. The CLI does not connect to the graphical console. It reads your credentials, signs a request, and sends it over HTTPS to AWS APIs; IAM checks identity and permissions; S3 answers.

Ravi → Console (GUI) → creates S3 bucket
Ravi → EC2 dashboard → Amazon Linux instance → terminal → AWS CLI → credentials → IAM → AWS API → S3 → bucket list → terminal

## 3. The 10 steps
1. **Log in** to the Management Console (browser GUI, account and Region selector).
2. **Open S3**: search "S3"; S3 stores objects in buckets.
3. **Create a bucket**: globally unique name (example `ravi-cloud-storage-demo-2026`, change if taken), Region, keep Block Public Access on.
4. **EC2 dashboard**: name `Ravi-CLI-Server`, AMI Amazon Linux 2023, free-tier-eligible type if offered, key pair, security group with SSH TCP 22 from your IP only.
5. **Launch and connect**: Pending → Running; EC2 Instance Connect or SSH.
6. **Update Linux** with `sudo dnf update -y` (AL2: `sudo yum update -y`). Prefer `sudo` per command over `sudo su`.
7. **Install AWS CLI v2** after checking `aws --version`.
8. **Create IAM user and access key** with least privilege.
9. **Configure** with `aws configure`, verify with `aws sts get-caller-identity`.
10. **`aws s3 ls`** and the full architecture.

## 4. Commands
```bash
ssh -i ravi-key.pem ec2-user@YOUR_PUBLIC_IP
sudo dnf update -y
aws --version
aws configure
aws sts get-caller-identity
aws s3 ls
aws s3 ls s3://YOUR-BUCKET-NAME
aws s3 mb s3://YOUR-NEW-BUCKET-NAME
aws s3 cp example.txt s3://YOUR-BUCKET-NAME/
```

## 5. Installing AWS CLI v2
Follow the official guide for your architecture (x86_64 or aarch64): https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html . Do not assume `yum install awscli` gives v2.

## 6. IAM and credentials
Create an IAM user with only the permissions needed. `aws s3 ls` needs `s3:ListAllMyBuckets`; listing a bucket needs `s3:ListBucket`. The Access Key ID is the identifier; the Secret Access Key is the password and must stay private. For production, attach an **IAM role** to the EC2 instance instead of storing long-term keys.

## 7. Configuration
`aws configure` asks for Access Key ID, Secret Access Key, default Region (e.g. `ap-south-1`) and output format (`json`). Keys go to `~/.aws/credentials`; settings to `~/.aws/config`. Sample values in this project are dummy placeholders.

## 8. Troubleshooting
| Error | Fix |
|---|---|
| `aws: command not found` | Install CLI or fix PATH; run `aws --version` |
| `Unable to locate credentials` | Run `aws configure` or attach an EC2 IAM role |
| `AccessDenied` | Add the required S3 permission |
| `InvalidAccessKeyId` | Key wrong or inactive; check IAM |
| `SignatureDoesNotMatch` | Re-check secret key and configuration |
| Network failure | Check internet access, route table, security group/NACL |
| Wrong Region | Check `aws configure get region` |

## 9. Moving-object legend
🖱️ GUI navigation · 📦 CLI package · 🔑 IAM credentials · 🛡️ IAM security · ✉️ API request · 📄 successful response · ❌ failure · ✅ success · 🔍 troubleshooting.

## 10. Structure
```text
aws-gui-to-cli-visual/
├── index.html
├── css/style.css
├── js/app.js
├── assets/README.md
├── .nojekyll
├── LICENSE
└── README.md
```

## 11. Run locally
Open `index.html` in a browser, or run `python3 -m http.server 8000` and visit http://localhost:8000.

## 12. GitHub and Pages
Create an empty repository on github.com, then `git init && git add . && git commit -m "Initial commit" && git remote add origin <URL> && git push -u origin main`. In Settings → Pages choose branch `main`, folder `/ (root)`.

## 13. Customize
Edit the `STEPS` array in `js/app.js` for text, terminal lines and commands. Each SVG group in `index.html` has `data-s="N"` (the step it appears at). Colors live in `css/style.css`.

## 14. Security best practices
Never commit or paste real keys. Use least privilege, rotate or delete unused keys, prefer EC2 IAM roles, restrict SSH to your IP, keep buckets private.
